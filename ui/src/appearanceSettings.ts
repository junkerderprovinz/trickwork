import {
  SHAPES,
  ACCENTS,
  RAINBOW,
  DEFAULT_ACCENT,
  applyShape,
  applyAccent,
  applyRainbow,
  cacheAppearance,
  rainbowState,
  type Shape,
} from './design/appearance'
import { applyTheme, cacheTheme, cachedThemePref, type ThemePref } from './design/theme'
import { flagEmoji } from './design/flagEmoji'
import { colorPicker } from './design/colorPicker'
import { customDropdown, segmentedRow, toggleSwitch } from './controlWidgets'
import { iconReset } from './icons'
import { currentLocale, LOCALES, setLocale, subscribeLocale, t, type TranslationKey } from './i18n'

const APPEARANCE_CACHE_KEY = 'glim-appearance'
const HEX_RE = /^#[0-9a-fA-F]{6}$/

interface CachedAppearance {
  shape?: string
  accent?: string
}

function readCachedAppearance(): CachedAppearance {
  try {
    const raw = localStorage.getItem(APPEARANCE_CACHE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as CachedAppearance
  } catch {
    return {}
  }
}

const SHAPE_KEYS: Record<Shape, TranslationKey> = {
  round: 'appearance.round',
  soft: 'appearance.soft',
  square: 'appearance.square',
}

const THEME_CHOICES: { value: ThemePref; key: TranslationKey }[] = [
  { value: 'dark', key: 'appearance.dark' },
  { value: 'light', key: 'appearance.light' },
  { value: 'system', key: 'appearance.system' },
]

const ACCENT_KEYS: Record<string, TranslationKey> = {
  Sunflower: 'appearance.accentSunflower',
  Blue: 'appearance.accentBlue',
  Green: 'appearance.accentGreen',
  Red: 'appearance.accentRed',
  Purple: 'appearance.accentPurple',
}

export function mountAppearanceSettings(container: HTMLElement): void {
  const panel = document.createElement('div')
  panel.className = 'appearance-settings'
  container.appendChild(panel)

  const cached = readCachedAppearance()
  let shape: Shape = SHAPES.includes(cached.shape as Shape) ? (cached.shape as Shape) : 'round'
  // Empty string means "no override" — cacheAppearance requires a string, so
  // an absent custom accent is stored as '' rather than omitted, and applying
  // '' clears the override (see design/appearance.ts's valid()).
  let accent = cached.accent && HEX_RE.test(cached.accent) ? cached.accent : ''
  let theme: ThemePref = cachedThemePref()
  let rainbowOn = rainbowState().on
  // The rainbow palette itself (jdp: "die Farben des Rainbowmodes sollen
  // auch bearbeitbar sein") - seeded from whatever's already cached
  // (usablePalette() in design/appearance.ts already falls back to RAINBOW
  // if the cached array is missing or the wrong length), copied so editing
  // it never mutates the shared RAINBOW default array in place.
  let palette: string[] = [...rainbowState().palette]

  function persist(): void {
    cacheAppearance(shape, accent, rainbowState())
    cacheTheme(theme)
  }

  // Rebuilding the whole panel on a locale switch is simpler and more robust
  // than patching five different label sites in place (same reasoning as
  // controls.ts) - it's a rare, deliberate action, not a hot path.
  function build(): void {
    panel.innerHTML = ''

    const shapeRow = segmentedRow(
      t('appearance.shape'),
      SHAPES.map((s) => ({ value: s, label: t(SHAPE_KEYS[s]) })),
      shape,
      (value) => {
        shape = value
        applyShape(shape)
        persist()
      },
    )

    const themeRow = segmentedRow(
      t('appearance.theme'),
      THEME_CHOICES.map((c) => ({ value: c.value, label: t(c.key) })),
      theme,
      (value) => {
        theme = value
        applyTheme(theme)
        persist()
      },
    )

    // The picker is a real, permanently embedded saturation/value square +
    // hue bar (jdp: "es soll sich kein komplett neues Fenster öffnen. es
    // soll der gleiche Picker erscheinen wie in BV") - GlimStone's own
    // colorPicker(), ported from CannonadeCommand's inlinePicker(), never a
    // native <input type="color"> (which hands off to a browser/OS surface
    // entirely outside the page - a genuinely separate window on some
    // setups, and functionally unverifiable in Playwright since that
    // surface sits outside the page's own DOM). Always visible for this
    // single accent value, re-synced via setValue() whenever a preset is
    // clicked so it always shows the current colour regardless of how it
    // was set - matches GlimStone's documented single-value picker layout.
    const accentWrap = document.createElement('div')
    accentWrap.className = 'control-slider'
    const accentLabel = document.createElement('span')
    accentLabel.textContent = t('appearance.accent')

    const accentPicker = colorPicker(accent || DEFAULT_ACCENT, (hex) => {
      accent = hex
      applyAccent(accent)
      persist()
      renderSwatches()
    })

    const presetsRow = document.createElement('div')
    presetsRow.className = 'accent-row'

    const presetsLabel = document.createElement('span')
    presetsLabel.className = 'accent-presets-label'
    presetsLabel.textContent = `${t('appearance.accentPresets')}:`

    const swatchGroup = document.createElement('div')
    swatchGroup.className = 'accent-swatch-group'

    const resetBtn = document.createElement('button')
    resetBtn.type = 'button'
    resetBtn.className = 'icon-reset-badge'
    resetBtn.innerHTML = iconReset()
    resetBtn.title = t('appearance.resetToDefault')
    resetBtn.setAttribute('aria-label', t('appearance.resetToDefault'))
    resetBtn.addEventListener('click', () => {
      accent = ''
      applyAccent(undefined)
      persist()
      accentPicker.setValue(DEFAULT_ACCENT)
      renderSwatches()
    })

    // Preset/palette swatches stay flat colour circles, not pickers of
    // their own (GlimStone's own rule) - a click selects the value AND
    // resyncs the one embedded picker, matching BombVault's border-colour
    // highlight on the active preset (jdp: "die Voreingestellten Farben
    // sollen gekennzeichnet werden wie in BV" - a border, not a fill).
    function renderSwatches(): void {
      swatchGroup.innerHTML = ''
      for (const preset of ACCENTS) {
        const presetLabel = ACCENT_KEYS[preset.name] ? t(ACCENT_KEYS[preset.name] as TranslationKey) : preset.name
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'accent-swatch' + (accent === preset.hex ? ' accent-swatch--active' : '')
        btn.style.backgroundColor = preset.hex
        btn.setAttribute('data-tip', presetLabel)
        btn.setAttribute('aria-label', presetLabel)
        btn.addEventListener('click', () => {
          accent = preset.hex
          applyAccent(accent)
          persist()
          accentPicker.setValue(accent)
          renderSwatches()
        })
        swatchGroup.appendChild(btn)
      }
    }
    renderSwatches()

    presetsRow.append(presetsLabel, swatchGroup, resetBtn)
    accentWrap.append(accentLabel, accentPicker.el, presetsRow)

    // A genuine sliding switch now, not a segmented Off/On pair (jdp: "soll
    // ein Toggle sein, der auch der Form folgt") - GlimStone's own
    // "Switches" section treats this as a distinct component. The Queue is
    // still where the mode does its real work (design-language.md: "a
    // download row owns a colour"), but toggling it here previously changed
    // nothing VISIBLE in Settings itself (jdp: "ein zu schalten ändert
    // nichts") - the palette row right below now gives it something to show
    // immediately, without needing an image loaded first.
    const rainbowWrap = document.createElement('div')
    rainbowWrap.className = 'control-slider'
    const rainbowLabelRow = document.createElement('div')
    rainbowLabelRow.className = 'control-slider-row'
    const rainbowLabelText = document.createElement('span')
    rainbowLabelText.textContent = t('appearance.rainbow')

    const paletteRow = document.createElement('div')
    paletteRow.className = 'palette-swatch-row'
    paletteRow.setAttribute('role', 'group')
    paletteRow.setAttribute('aria-label', t('appearance.rainbowPalette'))

    // ONE shared embedded picker for all 8 positions (GlimStone's own
    // multi-value-palette layout rule), not eight always-open pickers
    // stacked in the settings page - matches CannonadeCommand's own
    // rainbow-palette editor exactly (rbPick/rbPickWrap). Hidden until a
    // swatch is first clicked, then revealed directly below the row and
    // re-synced to whichever swatch was clicked most recently.
    let paletteEditingIndex: number | null = null
    const palettePickerWrap = document.createElement('div')
    palettePickerWrap.style.display = 'none'
    const sharedPalettePicker = colorPicker(palette[0] ?? DEFAULT_ACCENT, (hex) => {
      if (paletteEditingIndex === null) return
      palette[paletteEditingIndex] = hex
      const swatch = paletteRow.children[paletteEditingIndex] as HTMLElement | undefined
      if (swatch) {
        swatch.style.backgroundColor = hex
        swatch.setAttribute('data-tip', hex)
        swatch.setAttribute('aria-label', hex)
      }
      // Spread the CURRENT rainbow state first, not just {palette} -
      // applyRainbow merges onto RAINBOW_OFF's defaults, so passing palette
      // alone would silently reset on/reactive/rotate/seed back to off
      // every time a colour is edited (the same trap the toggle handler
      // below has to avoid too).
      applyRainbow({ ...rainbowState(), palette: [...palette] })
      persist()
    })
    palettePickerWrap.appendChild(sharedPalettePicker.el)

    const paletteResetBtn = document.createElement('button')
    paletteResetBtn.type = 'button'
    paletteResetBtn.className = 'icon-reset-badge'
    paletteResetBtn.innerHTML = iconReset()
    paletteResetBtn.title = t('appearance.resetToDefault')
    paletteResetBtn.setAttribute('aria-label', t('appearance.resetToDefault'))
    paletteResetBtn.addEventListener('click', () => {
      palette = [...RAINBOW]
      applyRainbow({ ...rainbowState(), palette: [...palette] })
      persist()
      renderPalette()
      const resetHex = paletteEditingIndex !== null ? palette[paletteEditingIndex] : undefined
      if (resetHex) sharedPalettePicker.setValue(resetHex)
    })

    // Each position is a plain flat colour circle - a click selects it AND
    // reveals/resyncs the one shared picker below the row (jdp: "die Farben
    // des Rainbowmodes sollen auch bearbeitbar sein, daher brauchen wir
    // dort auch einen Reset Button").
    function renderPalette(): void {
      paletteRow.innerHTML = ''
      palette.forEach((hex, index) => {
        const sw = document.createElement('button')
        sw.type = 'button'
        sw.className = 'palette-swatch'
        sw.style.backgroundColor = hex
        sw.setAttribute('data-tip', hex)
        sw.setAttribute('aria-label', hex)
        sw.addEventListener('click', () => {
          paletteEditingIndex = index
          sharedPalettePicker.setValue(hex)
          palettePickerWrap.style.display = ''
        })
        paletteRow.appendChild(sw)
      })
      paletteRow.appendChild(paletteResetBtn)
    }
    renderPalette()

    // Switched off, not hidden (GlimStone's own Switches rule: "a control
    // that disappears never teaches anyone what the mode does") - dimmed
    // instead, the same treatment CannonadeCommand gives its own dependent
    // rainbow sub-controls while the mode is off.
    function syncPaletteDim(): void {
      paletteRow.style.opacity = rainbowOn ? '1' : '0.45'
      paletteRow.style.pointerEvents = rainbowOn ? '' : 'none'
      palettePickerWrap.style.opacity = rainbowOn ? '1' : '0.45'
      palettePickerWrap.style.pointerEvents = rainbowOn ? '' : 'none'
    }
    syncPaletteDim()

    const rainbowToggle = toggleSwitch(t('appearance.rainbow'), rainbowOn, (checked) => {
      rainbowOn = checked
      // Spread the current state, not just {on} - see the shared picker's
      // own listener above for why (this exact call used to silently wipe
      // any custom palette back to the RAINBOW default on every toggle).
      applyRainbow({ ...rainbowState(), on: rainbowOn })
      persist()
      syncPaletteDim()
    })
    rainbowLabelRow.append(rainbowLabelText, rainbowToggle)
    rainbowWrap.append(rainbowLabelRow, paletteRow, palettePickerWrap)

    const languageWrap = document.createElement('div')
    languageWrap.className = 'control-slider'
    const languageLabel = document.createElement('span')
    languageLabel.textContent = t('appearance.language')
    // A custom button+listbox dropdown, not a native <select> (jdp: "das
    // Feld ist zu klein und die Dropdownliste viel zu kompakt, siehe BV") -
    // see controlWidgets.ts's customDropdown() doc comment for why this is a
    // sanctioned deviation from GlimStone's own plain-<select> default.
    const languageOptions = LOCALES.map((locale) => ({
      value: locale.code,
      label: locale.label,
      flag: flagEmoji(locale.flag),
    }))
    const languageDropdown = customDropdown(languageOptions, currentLocale(), (value) => {
      void setLocale(value)
    }, t('appearance.language'))
    languageWrap.append(languageLabel, languageDropdown)

    panel.append(shapeRow, themeRow, accentWrap, rainbowWrap, languageWrap)
  }

  build()
  subscribeLocale(build)
}
