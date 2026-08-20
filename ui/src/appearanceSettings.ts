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

    // Matches BombVault's Settings.tsx accent picker exactly (jdp: "der
    // Farbpicker sieht ganz anders aus, er soll aussehen wie in BV") - a
    // rectangular native colour input (BV's own h-8 w-14, not squeezed into
    // the same square as the swatches), a small muted "Presets:" label,
    // then the five circular preset swatches with a border-colour highlight
    // on whichever one is active (BV's own technique, not a fill - "die
    // Voreingestellten Farben sollen gekennzeichnet werden wie in BV").
    // Reset is still an icon badge (GlimStone's own "icons not text for
    // small action badges" rule), at --badge-sm like every other icon
    // badge in the app, not swatch-sized - a colour swatch and an icon
    // badge are two different things and don't need to share one size.
    const accentWrap = document.createElement('div')
    accentWrap.className = 'control-slider'
    const accentLabel = document.createElement('span')
    accentLabel.textContent = t('appearance.accent')

    const accentRow = document.createElement('div')
    accentRow.className = 'accent-row'

    const customInput = document.createElement('input')
    customInput.type = 'color'
    customInput.className = 'accent-custom-input'
    customInput.setAttribute('aria-label', t('appearance.accent'))
    customInput.value = accent || DEFAULT_ACCENT

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
      customInput.value = DEFAULT_ACCENT
      renderSwatches()
    })

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
          customInput.value = accent
          renderSwatches()
        })
        swatchGroup.appendChild(btn)
      }
    }
    renderSwatches()

    customInput.addEventListener('input', () => {
      accent = customInput.value
      applyAccent(accent)
      persist()
      renderSwatches()
    })

    accentRow.append(customInput, presetsLabel, swatchGroup, resetBtn)
    accentWrap.append(accentLabel, accentRow)

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
      syncRainbowGradient()
    })

    // The toggle's own ON track previews the palette (a real multi-stop
    // gradient across all 8 positions), not a flat --accent fill - jdp:
    // "der toggle des rainbowmodes [ist] ganz hässlich". A flat accent fill
    // is indistinguishable from every other "on" control on this same panel
    // (Shape/Theme above use the identical colour) and says nothing about
    // what the mode actually does; CannonadeCommand's own precedent for a
    // genuinely rainbow-mode-specific surface (its share-progress bar,
    // CannonadeCommand.Shares.css) uses exactly this technique - a real
    // multi-stop spectrum gradient, reserved for the one control that IS
    // the rainbow feature, not applied to every badge (those still take one
    // flat jewel colour each, unchanged). Reads the LIVE palette (including
    // user edits), not the hardcoded default, so the switch always shows
    // what will actually apply.
    function syncRainbowGradient(): void {
      rainbowToggle.style.setProperty('--rainbow-gradient', `linear-gradient(90deg, ${palette.join(', ')})`)
    }

    // Each position is its own real <input type="color"> now (jdp: "die
    // Farben des Rainbowmodes sollen auch bearbeitbar sein, daher brauchen
    // wir dort auch einen Reset Button"), styled via the shared
    // .accent-swatch/.palette-swatch/.accent-custom-input CSS group in
    // style.css so it's visually identical to the accent picker's own
    // circular swatches. This replaces an earlier approach that used ONE
    // shared hidden <input> (opacity:0, pointer-events:none, 0x0) opened via
    // a programmatic .click() from a plain <button> swatch - never actually
    // provable in Playwright (native colour dialogs can't be driven by it),
    // and a real, plausible cause of repeated "rainbow mode doesn't work"
    // reports: a browser can refuse to open a native picker from .click()
    // on an invisible, zero-size input. A real, visible, properly-sized
    // <input type="color"> that the user clicks directly has no such
    // reliability gap.
    function renderPalette(): void {
      paletteRow.innerHTML = ''
      palette.forEach((hex, index) => {
        const sw = document.createElement('input')
        sw.type = 'color'
        sw.className = 'palette-swatch'
        sw.value = hex
        sw.setAttribute('data-tip', hex)
        sw.setAttribute('aria-label', hex)
        sw.addEventListener('input', () => {
          const value = sw.value
          palette[index] = value
          sw.setAttribute('data-tip', value)
          sw.setAttribute('aria-label', value)
          // Spread the CURRENT rainbow state first, not just {palette} -
          // applyRainbow merges onto RAINBOW_OFF's defaults, so passing
          // palette alone would silently reset on/reactive/rotate/seed back
          // to off every time a colour is edited (the same trap the toggle
          // handler below has to avoid too). Deliberately NOT calling
          // renderPalette() here - the native picker fires 'input'
          // continuously while the user drags inside it, and tearing down
          // this very <input> mid-drag would kill the open dialog.
          applyRainbow({ ...rainbowState(), palette: [...palette] })
          persist()
          syncRainbowGradient()
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
    }
    syncPaletteDim()

    const rainbowToggle = toggleSwitch(t('appearance.rainbow'), rainbowOn, (checked) => {
      rainbowOn = checked
      // Spread the current state, not just {on} - see the palette input's
      // own listener above for why (this exact call used to silently wipe
      // any custom palette back to the RAINBOW default on every toggle).
      applyRainbow({ ...rainbowState(), on: rainbowOn })
      persist()
      syncPaletteDim()
    })
    rainbowToggle.classList.add('toggle-switch--rainbow')
    syncRainbowGradient()
    rainbowLabelRow.append(rainbowLabelText, rainbowToggle)
    rainbowWrap.append(rainbowLabelRow, paletteRow)

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
