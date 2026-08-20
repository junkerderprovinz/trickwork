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

    // One row now, not swatches-then-a-separate-controls-row below (jdp:
    // "der Farbpicker soll in die gleiche Zeile wie die Farbfelder und auch
    // gleich groß sein" - matches BombVault's own accent picker layout).
    // Every element in this row shares the SAME 1.5rem swatch size
    // (accent-swatch class, even on the native colour input and the reset
    // button) - a size mismatch between the picker/swatches/reset was
    // jdp's other direct complaint ("alle Farbfelder gleich groß machen").
    // Documented as the canonical accent-row pattern in GlimStone.
    const accentWrap = document.createElement('div')
    accentWrap.className = 'control-slider'
    const accentLabel = document.createElement('span')
    accentLabel.textContent = t('appearance.accent')

    const accentRow = document.createElement('div')
    accentRow.className = 'accent-row'

    const customInput = document.createElement('input')
    customInput.type = 'color'
    customInput.className = 'accent-swatch accent-custom-input'
    customInput.setAttribute('aria-label', t('appearance.accent'))
    customInput.value = accent || DEFAULT_ACCENT

    const resetBtn = document.createElement('button')
    resetBtn.type = 'button'
    // Icon badge, not text (jdp: "immer Symbole statt Texte für solche
    // Badges verwenden" - a general rule now, see icons.ts's iconReset()
    // and the same treatment on the preview Copy badge below).
    resetBtn.className = 'accent-swatch accent-reset-button'
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
      accentRow.innerHTML = ''
      for (const preset of ACCENTS) {
        const presetLabel = ACCENT_KEYS[preset.name] ? t(ACCENT_KEYS[preset.name] as TranslationKey) : preset.name
        const btn = document.createElement('button')
        btn.type = 'button'
        btn.className = 'accent-swatch' + (accent === preset.hex ? ' accent-swatch--active' : '')
        btn.style.backgroundColor = preset.hex
        btn.title = presetLabel
        btn.setAttribute('aria-label', presetLabel)
        btn.addEventListener('click', () => {
          accent = preset.hex
          applyAccent(accent)
          persist()
          customInput.value = accent
          renderSwatches()
        })
        accentRow.appendChild(btn)
      }
      accentRow.append(customInput, resetBtn)
    }
    renderSwatches()

    customInput.addEventListener('input', () => {
      accent = customInput.value
      applyAccent(accent)
      persist()
      renderSwatches()
    })

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
    for (const hex of RAINBOW) {
      const sw = document.createElement('span')
      sw.className = 'palette-swatch'
      sw.style.backgroundColor = hex
      paletteRow.appendChild(sw)
    }
    // Switched off, not hidden (GlimStone's own Switches rule: "a control
    // that disappears never teaches anyone what the mode does") - dimmed
    // instead, the same treatment CannonadeCommand gives its own dependent
    // rainbow sub-controls while the mode is off.
    function syncPaletteDim(): void {
      paletteRow.style.opacity = rainbowOn ? '1' : '0.45'
    }
    syncPaletteDim()

    const rainbowToggle = toggleSwitch(t('appearance.rainbow'), rainbowOn, (checked) => {
      rainbowOn = checked
      applyRainbow({ on: rainbowOn })
      persist()
      syncPaletteDim()
    })
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
      label: `${flagEmoji(locale.flag)} ${locale.label}`,
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
