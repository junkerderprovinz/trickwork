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
  subscribeRainbow,
  type Shape,
} from './design/appearance'
import { applyTheme, cacheTheme, cachedThemePref, type ThemePref } from './design/theme'
import { flagEmoji } from './design/flagEmoji'
import { openColorPickerPopover } from './design/colorPicker'
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
  // '' means no custom accent: cacheAppearance needs a string, and applying ''
  // clears the override.
  let accent = cached.accent && HEX_RE.test(cached.accent) ? cached.accent : ''
  let theme: ThemePref = cachedThemePref()
  let rainbowOn = rainbowState().on
  // A copy, so editing it never touches the shared RAINBOW default.
  let palette: string[] = [...rainbowState().palette]

  function persist(): void {
    cacheAppearance(shape, accent, rainbowState())
    cacheTheme(theme)
  }

  // A locale switch is rare, so the whole panel is rebuilt instead of patching
  // each label.
  function build(): void {
    panel.innerHTML = ''

    // Only the active segment of each row takes a rainbow position.
    const shapeRow = segmentedRow(
      t('appearance.shape'),
      SHAPES.map((s) => ({ value: s, label: t(SHAPE_KEYS[s]) })),
      shape,
      (value) => {
        shape = value
        applyShape(shape)
        persist()
      },
      undefined,
      0,
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
      undefined,
      0,
    )

    // The custom colour is a swatch like the presets and opens a floating
    // picker anchored to it, rather than a native colour input whose dialog
    // lies outside the page.
    const accentWrap = document.createElement('div')
    accentWrap.className = 'control-slider'
    const accentLabel = document.createElement('span')
    accentLabel.textContent = t('appearance.accent')

    const accentRow = document.createElement('div')
    accentRow.className = 'accent-row'

    const customTrigger = document.createElement('button')
    customTrigger.type = 'button'
    customTrigger.className = 'accent-swatch'
    function syncCustomTrigger(): void {
      customTrigger.style.backgroundColor = accent || DEFAULT_ACCENT
    }
    syncCustomTrigger()
    customTrigger.setAttribute('data-tip', t('appearance.accent'))
    customTrigger.setAttribute('aria-label', t('appearance.accent'))
    customTrigger.addEventListener('click', () => {
      openColorPickerPopover(customTrigger, accent || DEFAULT_ACCENT, (hex) => {
        accent = hex
        applyAccent(accent)
        persist()
        syncCustomTrigger()
        renderSwatches()
      })
    })

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
      syncCustomTrigger()
      renderSwatches()
    })

    // Presets are flat swatches; the active one gets a border, as in
    // BombVault.
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
          syncCustomTrigger()
          renderSwatches()
        })
        swatchGroup.appendChild(btn)
      }
    }
    renderSwatches()

    accentRow.append(customTrigger, presetsLabel, swatchGroup, resetBtn)
    accentWrap.append(accentLabel, accentRow)

    // The palette row below shows the switch's effect at once, before any
    // image is loaded.
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
    })

    // Each swatch opens a floating picker for its position; only one picker
    // is ever open.
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
          openColorPickerPopover(sw, hex, (newHex) => {
            palette[index] = newHex
            sw.style.backgroundColor = newHex
            sw.setAttribute('data-tip', newHex)
            sw.setAttribute('aria-label', newHex)
            // applyRainbow merges onto the defaults of the off state, so the
            // current state is spread first or an edit would switch it off.
            applyRainbow({ ...rainbowState(), palette: [...palette] })
            persist()
          })
        })
        paletteRow.appendChild(sw)
      })
      paletteRow.appendChild(paletteResetBtn)
    }
    renderPalette()

    // Dimmed rather than hidden while the mode is off, so the row still
    // shows what the mode does.
    function syncPaletteDim(): void {
      paletteRow.style.opacity = rainbowOn ? '1' : '0.45'
      paletteRow.style.pointerEvents = rainbowOn ? '' : 'none'
    }
    syncPaletteDim()

    const rainbowToggle = toggleSwitch(t('appearance.rainbow'), rainbowOn, (checked) => {
      rainbowOn = checked
      // Spread the current state, or the toggle would reset a custom palette.
      applyRainbow({ ...rainbowState(), on: rainbowOn })
      persist()
      syncPaletteDim()
    })
    rainbowLabelRow.append(rainbowLabelText, rainbowToggle)
    rainbowWrap.append(rainbowLabelRow, paletteRow)

    const languageWrap = document.createElement('div')
    languageWrap.className = 'control-slider'
    const languageLabel = document.createElement('span')
    languageLabel.textContent = t('appearance.language')
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
  // segmentedRow reads the rainbow colour once. The picker popover lives on
  // document.body, so a rebuild does not disturb a drag inside it.
  subscribeRainbow(build)
}
