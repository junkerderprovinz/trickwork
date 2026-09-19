import {
  CELL_ASPECT_COMPENSATION,
  CHARSET_PRESETS,
  computeAutoRows,
  effectiveDimensions,
  type CharsetPresetKey,
} from 'trickwork-core'
import { applyHueVars, iconToggleButton } from './controlWidgets'
import { subscribeRainbow } from './design/appearance'
import { enableSelectScroll } from './design/selectScroll'
import { infoIcon } from './design/tooltip'
import { iconLockClosed, iconLockOpen } from './icons'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import type { Store } from './state'

// Display names for the preset keys, which are lowercase identifiers.
const CHARSET_PRESET_KEYS: Record<CharsetPresetKey, TranslationKey> = {
  standard: 'controls.charsetPresetStandard',
  detailed: 'controls.charsetPresetDetailed',
  blocks: 'controls.charsetPresetBlocks',
  classic: 'controls.charsetPresetClassic',
  alternate: 'controls.charsetPresetAlternate',
  compact: 'controls.charsetPresetCompact',
  bold: 'controls.charsetPresetBold',
  symbols: 'controls.charsetPresetSymbols',
  minimal: 'controls.charsetPresetMinimal',
  binary: 'controls.charsetPresetBinary',
}

// The initial width in state.ts, which a double-click on the thumb restores.
const DEFAULT_COLUMNS = 120

// Height before any image is loaded: the auto row count of a square image.
const DEFAULT_ROWS_FALLBACK = Math.round(DEFAULT_COLUMNS / CELL_ASPECT_COMPENSATION)

/**
 * The row count the Height slider shows: the explicit override, or the auto
 * value assembleGrid would derive for the active image, taken from
 * effectiveDimensions instead of running the pixel pipeline.
 */
function computeDisplayRows(store: Store, columns: number): number {
  const state = store.getState()
  if (state.options.rows !== undefined) return state.options.rows
  const activeItem = state.items.find((item) => item.id === state.activeItemId)
  if (!activeItem?.imageData) return DEFAULT_ROWS_FALLBACK
  const { width, height } = effectiveDimensions(activeItem.imageData.width, activeItem.imageData.height, state.options)
  return computeAutoRows(width, height, columns)
}

const FONT_CHOICES: { key: TranslationKey; family: string }[] = [
  { key: 'controls.fontMonoSystem', family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  { key: 'controls.fontMonoAlt', family: 'Consolas, "Courier New", monospace' },
  { key: 'controls.fontSerif', family: 'ui-serif, Georgia, "Times New Roman", serif' },
  { key: 'controls.fontSans', family: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif' },
]

/** The Adjust card: width, height, charset and font. */
export function mountControls(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const panel = document.createElement('div')
  panel.className = 'controls'
  container.appendChild(panel)

  // Outside build() so it survives rebuilds. It is a UI mode rather than an
  // option, since an unset `rows` already means height follows width.
  let aspectLocked = true

  function build(): void {
    eyebrow.textContent = t('controls.eyebrow')
    panel.innerHTML = ''
    const options = store.getState().options

    const columns = numberSlider(
      t('controls.width'),
      20,
      400,
      options.columns,
      (value) => {
        store.setState({ options: { ...store.getState().options, columns: value } })
        // Rows stays auto; only the Height display follows, without a full
        // rebuild on every drag tick.
        if (aspectLocked) syncRowsDisplay(computeDisplayRows(store, value))
      },
      1,
      () => store.commitOptionsSnapshot(t('history.entryWidth')),
      0,
      DEFAULT_COLUMNS,
    )

    // The lock sits beside numberSlider's <label> rather than inside it, where
    // the label would forward clicks meant for the range input to it.
    const rowsWrap = document.createElement('div')
    rowsWrap.className = 'control-slider-with-toggle'
    const rows = numberSlider(
      t('controls.height'),
      5,
      200,
      computeDisplayRows(store, options.columns),
      (value) => {
        store.setState({ options: { ...store.getState().options, rows: value } })
      },
      1,
      () => store.commitOptionsSnapshot(t('history.entryHeight')),
      0,
      computeDisplayRows(store, options.columns),
    )
    const rowsInput = rows.querySelector('input') as HTMLInputElement
    const rowsValueText = rows.querySelector('.control-slider-value') as HTMLElement
    rowsInput.disabled = aspectLocked

    function syncRowsDisplay(value: number): void {
      rowsInput.value = String(value)
      rowsValueText.textContent = String(value)
    }

    const lockToggle = iconToggleButton(
      t(aspectLocked ? 'controls.aspectLocked' : 'controls.aspectUnlocked'),
      aspectLocked ? iconLockClosed() : iconLockOpen(),
      aspectLocked,
      (checked) => {
        aspectLocked = checked
        if (aspectLocked) {
          // Locking drops the override and returns to the image's
          // proportions. The key is removed rather than set to undefined,
          // which exactOptionalPropertyTypes treats differently.
          store.commitOptionsSnapshot(t('history.entryAspectLocked'))
          const { rows: _rows, ...withoutRows } = store.getState().options
          store.setState({ options: withoutRows })
        }
        build()
      },
    )
    rowsWrap.append(rows, lockToggle)

    const charsetWrap = document.createElement('div')
    charsetWrap.className = 'control-slider'
    const charsetLabelText = document.createElement('span')
    charsetLabelText.textContent = t('controls.charset')
    charsetWrap.appendChild(charsetLabelText)

    const charsetSelect = document.createElement('select')
    for (const key of Object.keys(CHARSET_PRESETS) as CharsetPresetKey[]) {
      const opt = document.createElement('option')
      opt.value = key
      opt.textContent = t(CHARSET_PRESET_KEYS[key])
      charsetSelect.appendChild(opt)
    }
    // The field below is always editable, so there is no Custom option; a
    // charset matching no preset leaves the select empty. Its name differs
    // from the field's so the two controls can be told apart.
    charsetSelect.setAttribute('aria-label', t('controls.charsetPresetLabel'))
    charsetWrap.appendChild(charsetSelect)
    enableSelectScroll(charsetSelect)

    // The editable ramp, like ASCGen2's Valid Ramp Chars, as plain text. Order
    // does not matter, since the font-width table sorts by coverage.
    const charsetField = document.createElement('textarea')
    charsetField.className = 'charset-field'
    charsetField.spellcheck = false
    charsetField.setAttribute('aria-label', t('controls.charset'))
    charsetWrap.appendChild(charsetField)

    function syncCharsetSelect(): void {
      const current = store.getState().options
      const preset = (Object.keys(CHARSET_PRESETS) as CharsetPresetKey[]).find((key) =>
        arraysEqual(CHARSET_PRESETS[key], current.charset),
      )
      if (preset) {
        charsetSelect.value = preset
      } else {
        charsetSelect.selectedIndex = -1
      }
    }
    syncCharsetSelect()

    // For outside changes only (mount, preset, font, blur); from the field's
    // own input handler it would fight the cursor.
    function syncCharsetFieldDisplay(): void {
      const current = store.getState().options
      charsetField.style.fontFamily = current.font.family
      charsetField.value = current.charset.join('')
    }
    syncCharsetFieldDisplay()

    // Array.from splits by code point, so an emoji stays one character, and
    // newlines only wrap the field. Repeats are kept, since a repeated
    // character is weighted more.
    function commitCharsetField(): void {
      const chars = Array.from(charsetField.value).filter((ch) => ch !== '\n' && ch !== '\r')
      if (chars.length === 0) return
      store.setState({ options: { ...store.getState().options, charset: chars } })
      syncCharsetSelect()
    }

    // One undo step per focus session, not per keystroke.
    let committedThisSession = false
    charsetField.addEventListener('focus', () => {
      if (committedThisSession) return
      committedThisSession = true
      store.commitOptionsSnapshot(t('history.entryCharsetEdited'))
    })
    charsetField.addEventListener('input', commitCharsetField)
    charsetField.addEventListener('blur', () => {
      committedThisSession = false
      syncCharsetFieldDisplay()
    })

    charsetSelect.addEventListener('change', () => {
      const key = charsetSelect.value as CharsetPresetKey
      store.commitOptionsSnapshot(t('history.entryCharsetPreset', { preset: t(CHARSET_PRESET_KEYS[key]) }))
      store.setState({
        options: { ...store.getState().options, charset: [...CHARSET_PRESETS[key]] },
      })
      syncCharsetFieldDisplay()
    })

    // A <div> rather than a <label>, which would add the info icon's
    // aria-label to the select's name; the select has its own aria-label.
    const fontLabel = document.createElement('div')
    fontLabel.className = 'control-slider'
    const fontLabelRow = document.createElement('div')
    fontLabelRow.className = 'control-slider-label-row'
    const fontLabelText = document.createElement('span')
    fontLabelText.textContent = t('controls.font')
    const fontInfo = infoIcon(t('controls.rtfNote'))
    fontLabelRow.append(fontLabelText, fontInfo)
    fontLabel.appendChild(fontLabelRow)
    const fontSelect = document.createElement('select')
    fontSelect.setAttribute('aria-label', t('controls.font'))
    for (const choice of FONT_CHOICES) {
      const opt = document.createElement('option')
      opt.value = choice.family
      opt.textContent = t(choice.key)
      fontSelect.appendChild(opt)
    }
    fontSelect.value = options.font.family
    fontSelect.addEventListener('change', () => {
      store.commitOptionsSnapshot(t('history.entryFont'))
      const current = store.getState().options
      store.setState({ options: { ...current, font: { ...current.font, family: fontSelect.value } } })
      syncCharsetFieldDisplay()
    })
    fontLabel.appendChild(fontSelect)
    enableSelectScroll(fontSelect)

    panel.append(columns, rowsWrap, charsetWrap, fontLabel)
  }

  build()
  subscribeLocale(build)
  // Re-syncs after an undo or redo; a drag never triggers this.
  store.subscribeHistory(build)
  // The widgets read their rainbow colour once, at build time.
  subscribeRainbow(build)
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

/**
 * `onBeforeChange` fires once per drag or keyboard gesture, from the first
 * pointerdown or keydown until blur, so a whole drag undoes as one step.
 */
export function numberSlider(
  label: string,
  min: number,
  max: number,
  initial: number,
  onChange: (value: number) => void,
  step = 1,
  onBeforeChange?: () => void,
  // Colours the thumb, which reads --accent.
  rainbowIndex?: number,
  // A double-click on the thumb resets to this.
  defaultValue: number = initial,
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
  if (rainbowIndex !== undefined && applyHueVars(input, rainbowIndex)) {
    input.classList.add('glim-hue')
  }

  let committedThisGesture = false
  function commitGestureStart(): void {
    if (committedThisGesture) return
    committedThisGesture = true
    onBeforeChange?.()
  }
  input.addEventListener('pointerdown', commitGestureStart)
  input.addEventListener('keydown', commitGestureStart)
  input.addEventListener('blur', () => {
    committedThisGesture = false
  })

  input.addEventListener('input', () => {
    valueText.textContent = input.value
    onChange(Number(input.value))
  })

  // The reset is an undo step of its own.
  input.addEventListener('dblclick', () => {
    if (Number(input.value) === defaultValue) return
    onBeforeChange?.()
    input.value = String(defaultValue)
    valueText.textContent = input.value
    onChange(defaultValue)
  })

  wrapper.append(row, input)
  return wrapper
}
