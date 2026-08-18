import {
  SHAPES,
  ACCENTS,
  DEFAULT_ACCENT,
  applyShape,
  applyAccent,
  cacheAppearance,
  type Shape,
} from './design/appearance'
import { applyTheme, cacheTheme, cachedThemePref, type ThemePref } from './design/theme'

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

const THEME_CHOICES: { value: ThemePref; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
]

export function mountAppearanceSettings(container: HTMLElement): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  eyebrow.textContent = 'Appearance'
  container.appendChild(eyebrow)

  const panel = document.createElement('div')
  panel.className = 'appearance-settings'

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

  const shapeRow = segmentedRow(
    'Shape',
    SHAPES.map((s) => ({ value: s, label: capitalize(s) })),
    shape,
    (value) => {
      shape = value
      applyShape(shape)
      persist()
    },
  )

  const themeRow = segmentedRow('Theme', THEME_CHOICES, theme, (value) => {
    theme = value
    applyTheme(theme)
    persist()
  })

  const accentWrap = document.createElement('div')
  accentWrap.className = 'control-slider'
  const accentLabel = document.createElement('span')
  accentLabel.textContent = 'Accent'

  const swatchRow = document.createElement('div')
  swatchRow.className = 'accent-swatch-row'

  const customInput = document.createElement('input')
  customInput.type = 'color'
  customInput.className = 'accent-custom-input'
  customInput.setAttribute('aria-label', 'Custom accent colour')
  customInput.value = accent || DEFAULT_ACCENT

  function renderSwatches(): void {
    swatchRow.innerHTML = ''
    for (const preset of ACCENTS) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'accent-swatch' + (accent === preset.hex ? ' accent-swatch--active' : '')
      btn.style.backgroundColor = preset.hex
      btn.title = preset.name
      btn.setAttribute('aria-label', `Accent: ${preset.name}`)
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
  resetBtn.textContent = 'Reset to default'
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

  panel.append(shapeRow, themeRow, accentWrap)
  container.appendChild(panel)
}

function segmentedRow<T extends string>(
  label: string,
  choices: { value: T; label: string }[],
  initial: T,
  onChange: (value: T) => void,
): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'control-slider'

  const labelEl = document.createElement('span')
  labelEl.textContent = label
  wrap.appendChild(labelEl)

  const row = document.createElement('div')
  row.className = 'segmented-row'
  wrap.appendChild(row)

  let active = initial

  function render(): void {
    row.innerHTML = ''
    for (const choice of choices) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'segmented-button' + (choice.value === active ? ' segmented-button--active' : '')
      btn.textContent = choice.label
      btn.addEventListener('click', () => {
        if (choice.value === active) return
        active = choice.value
        onChange(active)
        render()
      })
      row.appendChild(btn)
    }
  }
  render()

  return wrap
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
