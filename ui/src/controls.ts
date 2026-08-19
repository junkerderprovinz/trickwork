import { CHARSET_PRESETS, type CharsetPresetKey } from 'trickwork-core'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import type { Store } from './state'

const FONT_CHOICES: { key: TranslationKey; family: string }[] = [
  { key: 'controls.fontMonoSystem', family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  { key: 'controls.fontMonoAlt', family: 'Consolas, "Courier New", monospace' },
  { key: 'controls.fontSerif', family: 'ui-serif, Georgia, "Times New Roman", serif' },
  { key: 'controls.fontSans', family: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif' },
]

/** The Adjust tab: the core rendering parameters (not transform/filter/colour - see transformPanel.ts/filtersPanel.ts). */
export function mountControls(container: HTMLElement, store: Store): void {
  const panel = document.createElement('div')
  panel.className = 'controls'
  container.appendChild(panel)

  function build(): void {
    panel.innerHTML = ''
    const options = store.getState().options

    const columns = numberSlider(t('controls.width'), 20, 400, options.columns, (value) => {
      store.setState({ options: { ...store.getState().options, columns: value } })
    })

    const brightness = numberSlider(
      t('controls.brightness'),
      -1,
      1,
      options.brightness,
      (value) => {
        store.setState({ options: { ...store.getState().options, brightness: value } })
      },
      0.05,
    )

    const contrast = numberSlider(
      t('controls.contrast'),
      -1,
      1,
      options.contrast,
      (value) => {
        store.setState({ options: { ...store.getState().options, contrast: value } })
      },
      0.05,
    )

    const charsetLabel = document.createElement('label')
    charsetLabel.className = 'control-slider'
    const charsetLabelText = document.createElement('span')
    charsetLabelText.textContent = t('controls.charset')
    charsetLabel.appendChild(charsetLabelText)
    const charsetSelect = document.createElement('select')
    for (const key of Object.keys(CHARSET_PRESETS) as CharsetPresetKey[]) {
      const opt = document.createElement('option')
      opt.value = key
      opt.textContent = key
      charsetSelect.appendChild(opt)
    }
    const customOpt = document.createElement('option')
    customOpt.value = 'custom'
    customOpt.textContent = 'custom'
    charsetSelect.appendChild(customOpt)
    charsetLabel.appendChild(charsetSelect)

    const matchingPreset = (Object.keys(CHARSET_PRESETS) as CharsetPresetKey[]).find((key) =>
      arraysEqual(CHARSET_PRESETS[key], options.charset),
    )
    charsetSelect.value = matchingPreset ?? 'custom'

    const customInput = document.createElement('input')
    customInput.type = 'text'
    customInput.placeholder = t('controls.charsetCustomPlaceholder')
    customInput.style.display = matchingPreset ? 'none' : ''
    if (!matchingPreset) customInput.value = options.charset.join('')

    charsetSelect.addEventListener('change', () => {
      const key = charsetSelect.value
      if (key === 'custom') {
        customInput.style.display = ''
        return
      }
      customInput.style.display = 'none'
      store.setState({
        options: { ...store.getState().options, charset: [...CHARSET_PRESETS[key as CharsetPresetKey]] },
      })
    })
    customInput.addEventListener('input', () => {
      if (customInput.value.length === 0) return
      store.setState({
        // Array.from iterates by code point, so an astral character (emoji) stays
        // one charset entry instead of splitting into two lone surrogates.
        options: { ...store.getState().options, charset: Array.from(customInput.value) },
      })
    })

    const fontLabel = document.createElement('label')
    fontLabel.className = 'control-slider'
    const fontLabelText = document.createElement('span')
    fontLabelText.textContent = t('controls.font')
    fontLabel.appendChild(fontLabelText)
    const fontSelect = document.createElement('select')
    for (const choice of FONT_CHOICES) {
      const opt = document.createElement('option')
      opt.value = choice.family
      opt.textContent = t(choice.key)
      fontSelect.appendChild(opt)
    }
    fontSelect.value = options.font.family
    fontSelect.addEventListener('change', () => {
      const current = store.getState().options
      store.setState({ options: { ...current, font: { ...current.font, family: fontSelect.value } } })
    })
    fontLabel.appendChild(fontSelect)

    const rtfNote = document.createElement('p')
    rtfNote.className = 'controls-note'
    rtfNote.textContent = t('controls.rtfNote')

    panel.append(columns, brightness, contrast, charsetLabel, customInput, fontLabel, rtfNote)
  }

  build()
  subscribeLocale(build)
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function numberSlider(
  label: string,
  min: number,
  max: number,
  initial: number,
  onChange: (value: number) => void,
  step = 1,
): HTMLElement {
  const wrapper = document.createElement('label')
  wrapper.className = 'control-slider'

  const row = document.createElement('div')
  row.className = 'control-slider-row'
  const labelText = document.createElement('span')
  labelText.textContent = label
  const valueText = document.createElement('span')
  valueText.className = 'control-slider-value glim-num'
  valueText.textContent = String(initial)
  row.append(labelText, valueText)

  const input = document.createElement('input')
  input.type = 'range'
  input.min = String(min)
  input.max = String(max)
  input.step = String(step)
  input.value = String(initial)
  input.addEventListener('input', () => {
    valueText.textContent = input.value
    onChange(Number(input.value))
  })

  wrapper.append(row, input)
  return wrapper
}
