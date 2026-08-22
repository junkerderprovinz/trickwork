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

// Display names for the preset dropdown - CHARSET_PRESETS' own keys are
// lowercase identifiers ("standard", "detailed"), never shown to a user
// directly (that produced an all-lowercase-looking dropdown).
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

// Mirrors state.ts's own initial options.columns - the double-click-to-
// reset value for the Width slider (jdp: "die ganzen schieberegler soll
// man mit doppelklick auf den reglerknopf zurücksetzen können").
const DEFAULT_COLUMNS = 120

// Shown for the Height slider only before any image has been loaded yet
// (computeDisplayRows below has nothing to derive an aspect ratio from at
// that point) - matches what a 1:1 image at DEFAULT_COLUMNS would auto-
// compute, via the same CELL_ASPECT_COMPENSATION real generation uses.
const DEFAULT_ROWS_FALLBACK = Math.round(DEFAULT_COLUMNS / CELL_ASPECT_COMPENSATION)

/**
 * The row count the Height slider should currently show: MappingOptions.rows
 * itself once the user has set an explicit override (unlocked), otherwise the
 * same aspect-ratio-matched value assembleGrid would auto-derive for the
 * active image at the given column count - computed via effectiveDimensions
 * (crop/rotate math only, no pixel work) rather than running the full
 * applyImageFilters pipeline just to read its output size.
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

/** The Adjust card: the core rendering parameters (not transform/filter/colour - see transformPanel.ts/filtersPanel.ts). */
export function mountControls(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const panel = document.createElement('div')
  panel.className = 'controls'
  container.appendChild(panel)

  // Outside build() so it survives a rebuild (locale switch, undo/redo,
  // rainbow toggle) - only the lock toggle itself changes it. Locked is the
  // default (jdp never asked for unlocked-by-default, and it matches every
  // release before this one, where height always followed width implicitly).
  // Deliberately NOT part of MappingOptions: it's a UI editing mode, not a
  // generation parameter - "rows: undefined" already means "auto, locked to
  // width" on its own (see computeDisplayRows), so locked/unlocked is fully
  // derivable from whether rows is set. No separate flag to keep in sync.
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
        // Locked: rows stays undefined (still auto) - only the Height
        // slider's OWN displayed number needs to track the new width live,
        // without the full-panel rebuild a store.subscribe would cause on
        // every drag tick (see numberSlider's own gesture-based undo
        // comment for why that matters here too).
        if (aspectLocked) syncRowsDisplay(computeDisplayRows(store, value))
      },
      1,
      () => store.commitOptionsSnapshot(t('history.entryWidth')),
      0,
      DEFAULT_COLUMNS,
    )

    // A plain sibling row, NOT nested inside numberSlider's own <label> -
    // that wrapper exists so clicking the row helps focus its <input>, and a
    // <button> living inside the same <label> would receive stray forwarded
    // clicks meant for the range input (the implicit label/control
    // association HTML gives every <label>). Keeping the toggle as a sibling
    // avoids that entirely, at the cost of the toggle sitting beside the
    // whole Height control rather than inline with just its label text.
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
          // Locking discards any explicit override and goes back to
          // matching the image's own proportions - the same "auto" state
          // rows started in, not just freezing wherever it happened to be.
          // Omits the key entirely rather than setting it to `undefined` -
          // exactOptionalPropertyTypes treats those as different (same trap
          // GlimStone's own appearance.ts hit and documented).
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
    // No "Custom" option anymore (jdp: "benutzerdefiniert braucht es nicht,
    // weil alles editierbar ist") - with the free-text field below, "custom"
    // isn't a state a user ever picks, only one the field can drift into by
    // being edited, so it isn't offered as a selectable choice at all. When
    // the current charset matches no preset, syncCharsetSelect() below just
    // leaves the dropdown showing no selection (selectedIndex = -1) rather
    // than inventing an option for that state.
    // Distinct from the textarea's own aria-label below - both used to say
    // plain "Character set", which gave a screen reader (and any test
    // locator by accessible name) two same-named controls with no way to
    // tell the preset picker from the actual text field apart.
    charsetSelect.setAttribute('aria-label', t('controls.charsetPresetLabel'))
    charsetWrap.appendChild(charsetSelect)
    enableSelectScroll(charsetSelect)

    // The live, editable ramp preview ASCGen2 had (its "Valid Ramp Chars"
    // dialog) and TrickWork didn't - a genuinely plain <textarea> (jdp:
    // "einfach ein normaler Text, den man normal bearbeiten kann"), not a
    // tile grid you click to delete from. Order doesn't matter for the
    // algorithm (assembleGrid's font-width table re-sorts by measured ink
    // coverage regardless of array order), so free typing/pasting/deleting
    // anywhere in the field is exactly as valid as any other order.
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
        // No option represents "custom" - selectedIndex = -1 is the native
        // way to show a <select> with nothing selected at all.
        charsetSelect.selectedIndex = -1
      }
    }
    syncCharsetSelect()

    // Only touches the field's DISPLAYED text and font - never called from
    // the field's own 'input' handler (that would fight the user's cursor
    // mid-keystroke), only on external changes: initial mount, a preset
    // pick, a font change, or blur (to show the deduped canonical form once
    // editing is done).
    function syncCharsetFieldDisplay(): void {
      const current = store.getState().options
      charsetField.style.fontFamily = current.font.family
      charsetField.value = current.charset.join('')
    }
    syncCharsetFieldDisplay()

    // Extracts the live characters from whatever the user has typed and
    // pushes it straight to the store - Array.from iterates by code point,
    // so an astral character (emoji) stays one entry instead of splitting
    // into two lone surrogates. Newlines are the textarea's own wrapping
    // mechanism, not a real ramp character, so they're dropped.
    //
    // REPEATS ARE KEPT, not deduped to a unique set - an earlier revision
    // of this function collapsed the field to its distinct characters on
    // every keystroke, which was harmless back when mapLuminanceToChar
    // (core/src/mapping.ts) picked by nearest measured value and a repeat
    // was genuinely dead weight. It ranks by weighted POSITION now (jdp:
    // "je öfter man das gleiche Zeichen eingetragen hat, desto mehr wurde
    // es gewichtet"), so deduping here would silently throw the user's own
    // weighting away the moment they typed a single extra character
    // anywhere in the field - exactly the feature this field exists to
    // control.
    function commitCharsetField(): void {
      const chars = Array.from(charsetField.value).filter((ch) => ch !== '\n' && ch !== '\r')
      if (chars.length === 0) return // never commit an empty charset
      store.setState({ options: { ...store.getState().options, charset: chars } })
      syncCharsetSelect()
    }

    // Gesture-aware undo, same pattern as numberSlider: one snapshot per
    // focus session (however many keystrokes happen while focused), not one
    // per keystroke - otherwise typing ten characters would take ten
    // Ctrl+Z presses to undo instead of one.
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

    // A plain <div>, not a <label> - the info icon below sits in the same
    // row as the label text, and an implicit <label>'s accessible-name
    // computation would pull the icon's own aria-label into the SELECT's
    // computed name too. fontSelect gets an explicit aria-label instead
    // (same defensive pattern charsetSelect already uses), so nothing here
    // depends on DOM wrapping for its accessible name.
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
  // A full rebuild re-reads store.getState().options fresh, which is exactly
  // what's needed after undo/redo changes it from outside this panel - see
  // state.ts's subscribeHistory doc comment for why this is a SEPARATE
  // channel from store.subscribe (a plain drag must never trigger this).
  store.subscribeHistory(build)
  // See transformPanel.ts for why: rainbowColor() is read once at build()
  // time, so toggling the mode has to rebuild this panel too.
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
 * `onBeforeChange`, when given, fires ONCE per drag/keyboard gesture (from
 * the first pointerdown or keydown until the input blurs), not once per
 * 'input' tick - a continuous drag fires dozens of 'input' events, and
 * treating each as its own undo step would make undo useless (one press
 * would barely move the value back). Snapshotting once at gesture-start
 * instead means a whole drag undoes as a single step, back to the value
 * before the drag began.
 */
export function numberSlider(
  label: string,
  min: number,
  max: number,
  initial: number,
  onChange: (value: number) => void,
  step = 1,
  onBeforeChange?: () => void,
  // Opt-in only, same rule as segmentedRow's own rainbowBaseIndex (jdp:
  // "die Schieberegler sind nicht im rainbowmode"). A slider has no
  // "inactive member" the way a selector does - it's always showing some
  // value - so it just colours its own thumb via .glim-hue (the thumb's
  // CSS already reads var(--accent)), no wash/tint needed.
  rainbowIndex?: number,
  // Double-click the thumb to snap back to this value (jdp: "die ganzen
  // schieberegler soll man mit doppelklick auf den reglerknopf
  // zurücksetzen können"). Defaults to `initial` (a no-op reset) for a
  // caller that doesn't pass one - every real call site below does.
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

  // A dblclick on the thumb fires two 'input'-less pointer events in most
  // browsers - no drag occurred, so commitGestureStart() above never ran -
  // hence its own explicit onBeforeChange() call here rather than relying
  // on that path.
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
