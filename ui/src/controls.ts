import { CHARSET_PRESETS, type CharsetPresetKey, type Rotation, type SharpenMethod } from 'trickwork-core'
import { checkboxRow, segmentedRow } from './controlWidgets'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import type { Store } from './state'

const FONT_CHOICES: { key: TranslationKey; family: string }[] = [
  { key: 'controls.fontMonoSystem', family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  { key: 'controls.fontMonoAlt', family: 'Consolas, "Courier New", monospace' },
  { key: 'controls.fontSerif', family: 'ui-serif, Georgia, "Times New Roman", serif' },
  { key: 'controls.fontSans', family: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif' },
]

const ROTATIONS: { value: Rotation; key: TranslationKey }[] = [
  { value: 0, key: 'controls.rotate0' },
  { value: 90, key: 'controls.rotate90' },
  { value: 180, key: 'controls.rotate180' },
  { value: 270, key: 'controls.rotate270' },
]

const SHARPEN_METHODS: { value: SharpenMethod; key: TranslationKey }[] = [
  { value: 'none', key: 'controls.sharpenNone' },
  { value: 'sharpen', key: 'controls.sharpenSharpen' },
  { value: 'unsharp', key: 'controls.sharpenUnsharp' },
]

export function mountControls(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const panel = document.createElement('div')
  panel.className = 'controls'
  container.appendChild(panel)

  // The whole panel is cheap to rebuild (a handful of DOM nodes, no heavy
  // work) and it only happens on a deliberate language switch, so a full
  // rebuild from current store state is simpler and more robust than trying
  // to patch every label and option string in place across five different
  // control types.
  function build(): void {
    eyebrow.textContent = t('controls.eyebrow')
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

    const transformLabel = document.createElement('div')
    transformLabel.className = 'controls-subhead'
    transformLabel.textContent = t('controls.transform')

    const rotateRow = segmentedRow(
      t('controls.rotate'),
      ROTATIONS.map((r) => ({ value: String(r.value), label: t(r.key) })),
      String(options.rotate ?? 0),
      (value) => {
        store.setState({ options: { ...store.getState().options, rotate: Number(value) as Rotation } })
      },
    )

    const flipH = checkboxRow(t('controls.flipHorizontal'), !!options.flipHorizontal, (checked) => {
      store.setState({ options: { ...store.getState().options, flipHorizontal: checked } })
    })
    const flipV = checkboxRow(t('controls.flipVertical'), !!options.flipVertical, (checked) => {
      store.setState({ options: { ...store.getState().options, flipVertical: checked } })
    })

    const filtersLabel = document.createElement('div')
    filtersLabel.className = 'controls-subhead'
    filtersLabel.textContent = t('controls.filters')

    const invert = checkboxRow(t('controls.invert'), !!options.invert, (checked) => {
      store.setState({ options: { ...store.getState().options, invert: checked } })
    })
    const dither = checkboxRow(t('controls.dither'), !!options.dither, (checked) => {
      store.setState({ options: { ...store.getState().options, dither: checked } })
    })

    const sharpenRow = segmentedRow(
      t('controls.sharpen'),
      SHARPEN_METHODS.map((s) => ({ value: s.value, label: t(s.key) })),
      options.sharpen ?? 'none',
      (value) => {
        store.setState({ options: { ...store.getState().options, sharpen: value } })
      },
    )

    const color = checkboxRow(t('controls.color'), !!options.color, (checked) => {
      store.setState({ options: { ...store.getState().options, color: checked } })
    })

    panel.append(
      columns,
      brightness,
      contrast,
      charsetLabel,
      customInput,
      fontLabel,
      rtfNote,
      transformLabel,
      rotateRow,
      flipH,
      flipV,
      filtersLabel,
      invert,
      dither,
      sharpenRow,
      color,
    )
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
