import { CHARSET_PRESETS, type CharsetPresetKey } from 'ascii-supergenerator-core'
import type { Store } from './state'

const FONT_CHOICES = [
  { label: 'Monospace (system)', family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  { label: 'Monospace (alt)', family: 'Consolas, "Courier New", monospace' },
  { label: 'Serif (proportional)', family: 'ui-serif, Georgia, "Times New Roman", serif' },
  { label: 'Sans (proportional)', family: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif' },
] as const

export function mountControls(container: HTMLElement, store: Store): void {
  const panel = document.createElement('div')
  panel.className = 'controls'

  const columns = numberSlider('Width (columns)', 20, 400, store.getState().options.columns, (value) => {
    store.setState({ options: { ...store.getState().options, columns: value } })
  })

  const brightness = numberSlider('Brightness', -1, 1, store.getState().options.brightness, (value) => {
    store.setState({ options: { ...store.getState().options, brightness: value } })
  }, 0.05)

  const contrast = numberSlider('Contrast', -1, 1, store.getState().options.contrast, (value) => {
    store.setState({ options: { ...store.getState().options, contrast: value } })
  }, 0.05)

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

  const customInput = document.createElement('input')
  customInput.type = 'text'
  customInput.placeholder = 'darkest..lightest characters'
  customInput.style.display = 'none'

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

  const fontSelect = document.createElement('select')
  for (const choice of FONT_CHOICES) {
    const opt = document.createElement('option')
    opt.value = choice.family
    opt.textContent = choice.label
    fontSelect.appendChild(opt)
  }
  fontSelect.addEventListener('change', () => {
    const options = store.getState().options
    store.setState({ options: { ...options, font: { ...options.font, family: fontSelect.value } } })
  })

  const rtfNote = document.createElement('p')
  rtfNote.className = 'controls-note'
  rtfNote.textContent =
    'Note: RTF export always renders in a fixed monospace font, regardless of the font selected above — most RTF readers cannot reliably honor an arbitrary proportional font.'

  panel.append(columns, brightness, contrast, charsetSelect, customInput, fontSelect, rtfNote)
  container.appendChild(panel)
}

function numberSlider(
  label: string,
  min: number,
  max: number,
  initial: number,
  onChange: (value: number) => void,
  step = 1,
): HTMLElement {
  const wrapper = document.createElement('label')
  wrapper.className = 'control-slider'
  wrapper.textContent = label

  const input = document.createElement('input')
  input.type = 'range'
  input.min = String(min)
  input.max = String(max)
  input.step = String(step)
  input.value = String(initial)
  input.addEventListener('input', () => onChange(Number(input.value)))

  wrapper.appendChild(input)
  return wrapper
}
