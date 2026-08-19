import { SHAPES, ACCENTS, DEFAULT_ACCENT, applyShape, applyAccent, cacheAppearance, type Shape } from './design/appearance'
import { applyTheme, cacheTheme, cachedThemePref, type ThemePref } from './design/theme'
import { segmentedRow } from './controlWidgets'
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

  function persist(): void {
    cacheAppearance(shape, accent)
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

    const accentWrap = document.createElement('div')
    accentWrap.className = 'control-slider'
    const accentLabel = document.createElement('span')
    accentLabel.textContent = t('appearance.accent')

    const swatchRow = document.createElement('div')
    swatchRow.className = 'accent-swatch-row'

    const customInput = document.createElement('input')
    customInput.type = 'color'
    customInput.className = 'accent-custom-input'
    customInput.setAttribute('aria-label', t('appearance.accent'))
    customInput.value = accent || DEFAULT_ACCENT

    function renderSwatches(): void {
      swatchRow.innerHTML = ''
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
        swatchRow.appendChild(btn)
      }
    }
    renderSwatches()

    customInput.addEventListener('input', () => {
      accent = customInput.value
      applyAccent(accent)
      persist()
      renderSwatches()
    })

    const resetBtn = document.createElement('button')
    resetBtn.type = 'button'
    resetBtn.className = 'accent-reset-button'
    resetBtn.textContent = t('appearance.resetToDefault')
    resetBtn.addEventListener('click', () => {
      accent = ''
      applyAccent(undefined)
      persist()
      customInput.value = DEFAULT_ACCENT
      renderSwatches()
    })

    const accentControlsRow = document.createElement('div')
    accentControlsRow.className = 'accent-controls-row'
    accentControlsRow.append(customInput, resetBtn)

    accentWrap.append(accentLabel, swatchRow, accentControlsRow)

    const languageWrap = document.createElement('label')
    languageWrap.className = 'control-slider'
    const languageLabel = document.createElement('span')
    languageLabel.textContent = t('appearance.language')
    const languageSelect = document.createElement('select')
    for (const locale of LOCALES) {
      const opt = document.createElement('option')
      opt.value = locale.code
      opt.textContent = locale.label
      languageSelect.appendChild(opt)
    }
    languageSelect.value = currentLocale()
    languageSelect.addEventListener('change', () => {
      void setLocale(languageSelect.value)
    })
    languageWrap.append(languageLabel, languageSelect)

    panel.append(shapeRow, themeRow, accentWrap, languageWrap)
  }

  build()
  subscribeLocale(build)
}
