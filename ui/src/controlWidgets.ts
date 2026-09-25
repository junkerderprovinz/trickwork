// DOM builders shared by the panels and appearanceSettings.ts. They are not
// i18n-aware; a caller rebuilds its panel when the locale changes.

import { hueVars, rainbowState } from './design/appearance'
import { hidesLabel, labelWidth, widthStage, type LabelMode, type WidthStage } from './design/controls'
import { segmentLayout } from './design/segmentLayout'
import { enableWheelStep, stepIndex } from './design/selectScroll'

/**
 * Sets the --item-hue* properties that give an element its rainbow position.
 * Returns false when rainbow mode is off, so the caller can skip its classes.
 */
export function applyHueVars(el: HTMLElement, index: number): boolean {
  if (!rainbowState().on) return false
  for (const [prop, value] of Object.entries(hueVars(index))) {
    el.style.setProperty(prop, value)
  }
  return true
}

/**
 * The floor for a big selector's segments, as in BombVault and ArrowLoop, so
 * every page-level picker renders equally wide. A label that needs more still
 * gets it, and a narrow box shrinks the segments together before it wraps one.
 */
const MIN_SEGMENT = 200

export interface SegmentedRowOptions<T extends string> {
  label?: string
  /** The strip's name where no label stands above it. */
  ariaLabel?: string
  choices: { value: T; label: string; glyph?: string }[]
  value: T
  onChange: (value: T) => void
  /** Fires once per change, before onChange, so the caller can record an undo step. */
  onBeforeChange?: (value: T) => void
  /** Fires on every click, the chosen segment included, for the storm and leaf gestures. */
  onTap?: (value: T) => void
  /** Each choice owns a rainbow position from this index on; without it the row keeps the single accent. */
  rainbowBaseIndex?: number
  /**
   * `big` pins every segment to the widest label or the app-wide floor, for a
   * picker that stands once on a page; `small` lets each segment hug its label,
   * for a strip inside a narrow card.
   */
  scale?: 'big' | 'small'
  /**
   * `well` is one groove holding the segments. `chip` has no groove, so every
   * segment is a badge of its own and owns a palette position, as the tabs
   * over a page do.
   */
  variant?: 'well' | 'chip'
  /** Content for the label row, such as an info icon. */
  labelExtra?: HTMLElement
}

/**
 * GlimStone's horizontal selector: one groove with only the chosen segment
 * filled, or as tabs, a row of badges.
 */
export function segmentedRow<T extends string>(opts: SegmentedRowOptions<T>): HTMLElement {
  const { choices, onChange, onBeforeChange, onTap, rainbowBaseIndex, scale = 'small', variant = 'well' } = opts
  const chip = variant === 'chip'
  const wrap = document.createElement('div')
  wrap.className = 'control-slider'

  if (opts.label) {
    const labelRow = document.createElement('div')
    labelRow.className = 'control-slider-label-row'
    const labelEl = document.createElement('span')
    labelEl.textContent = opts.label
    labelRow.appendChild(labelEl)
    if (opts.labelExtra) labelRow.appendChild(opts.labelExtra)
    wrap.appendChild(labelRow)
  }

  const row = document.createElement('div')
  row.className = `segmented-row segmented-row--${scale} ${chip ? 'segmented-row--chip' : 'glim-well'}`
  row.setAttribute('role', 'tablist')
  const name = opts.label ?? opts.ariaLabel
  if (name) row.setAttribute('aria-label', name)
  wrap.appendChild(row)

  let active = opts.value
  let buttons: HTMLButtonElement[] = []

  function choose(value: T): void {
    onTap?.(value)
    if (value === active) return
    onBeforeChange?.(value)
    active = value
    onChange(active)
    render()
    buttons.find((b) => b.dataset.value === active)?.focus()
  }

  function render(): void {
    row.innerHTML = ''
    buttons = choices.map((choice, index) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.dataset.value = choice.value
      const isActive = choice.value === active
      btn.className = 'segmented-button' + (isActive ? ' segmented-button--active' : '')
      btn.setAttribute('role', 'tab')
      btn.setAttribute('aria-selected', String(isActive))
      btn.tabIndex = isActive ? 0 : -1
      if (choice.glyph) {
        const glyph = document.createElement('span')
        glyph.className = 'segmented-button-glyph'
        glyph.innerHTML = choice.glyph
        btn.appendChild(glyph)
      }
      const labelSpan = document.createElement('span')
      labelSpan.className = 'segmented-button-label'
      labelSpan.textContent = choice.label
      btn.appendChild(labelSpan)
      if (chip && rainbowBaseIndex !== undefined) {
        // A tab keeps its colour at rest on its glyph, so every tab owns its
        // position whatever the mode; the variables only answer under rainbow.
        for (const [prop, value] of Object.entries(hueVars(rainbowBaseIndex + index))) btn.style.setProperty(prop, value)
        btn.classList.add('glim-hue', 'glim-hue-icon')
        if (isActive) btn.classList.add('glim-active')
      } else if (isActive && rainbowBaseIndex !== undefined && applyHueVars(btn, rainbowBaseIndex + index)) {
        // In the well only the chosen segment is coloured; its fill already
        // marks the pick, and washing the rest would be noise.
        btn.classList.add('glim-hue', 'glim-active')
      }
      btn.addEventListener('click', () => choose(choice.value))
      row.appendChild(btn)
      return btn
    })
    layout()
  }

  row.addEventListener('keydown', (event) => {
    const at = choices.findIndex((c) => c.value === active)
    const rtl = getComputedStyle(row).direction === 'rtl'
    let next = at
    if (event.key === 'ArrowRight') next = rtl ? at - 1 : at + 1
    else if (event.key === 'ArrowLeft') next = rtl ? at + 1 : at - 1
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = choices.length - 1
    else return
    event.preventDefault()
    const choice = choices[Math.max(0, Math.min(choices.length - 1, next))]
    if (choice) choose(choice.value)
  })

  // The pinned width comes from the DOM, and how many segments share a row
  // from the room, so both are worked out again when the box resizes or a late
  // web font changes what a label needs.
  function layout(): void {
    if (!row.isConnected || buttons.length === 0) return
    for (const b of buttons) {
      b.style.minWidth = ''
      b.style.flex = ''
    }
    row.style.flexWrap = ''
    if (scale === 'small') return

    const cs = getComputedStyle(row)
    const gap = parseFloat(cs.columnGap) || 0
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight)
    const room = wrap.clientWidth - pad
    const segments = buttons.map((b) => {
      b.style.width = 'max-content'
      const oneLine = b.getBoundingClientRect().width
      b.style.width = 'min-content'
      const narrowest = b.getBoundingClientRect().width
      b.style.width = ''
      return { oneLine, narrowest }
    })
    const n = segments.length
    const widest = Math.max(...segments.map((s) => s.oneLine))
    const share = (room - gap * (n - 1)) / n
    // Capped at this strip's share of the room: where that would break a label
    // and the labels fit side by side, segmentLayout lays them out by content.
    const pinned = share > 0 ? Math.min(Math.max(widest, MIN_SEGMENT), share) : widest
    const { byContent, perRow } = segmentLayout(room, pinned, segments, gap)
    if (byContent) {
      row.style.flexWrap = 'nowrap'
      for (const b of buttons) b.style.flex = '1 0 auto'
      return
    }
    for (const b of buttons) {
      b.style.minWidth = `${pinned}px`
      // One gap of slack in the basis, so rounding cannot push the last
      // segment of a full row down; the growth takes it back.
      b.style.flex = `1 0 calc((100% - ${perRow} * ${gap}px) / ${perRow})`
    }
  }

  if (scale === 'big') {
    // A panel rebuilt for a new locale drops its old rows, so an observer
    // whose row has left the page lets go of it.
    const observer = new ResizeObserver(() => {
      if (wrap.isConnected) layout()
      else observer.disconnect()
    })
    observer.observe(wrap)
    void document.fonts?.ready.then(() => layout())
  }

  render()
  return wrap
}

/**
 * An icon-only toggle button. `label` is its tooltip and accessible name, and
 * the checked state shows as the accent fill of an active segment.
 */
export function iconToggleButton(
  label: string,
  icon: string,
  initial: boolean,
  onChange: (checked: boolean) => void,
  onBeforeChange?: () => void,
  // .glim-hue points --accent at this button's rainbow position, which only
  // the checked fill reads; at rest the badge and its glyph stay neutral.
  rainbowIndex?: number,
): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'icon-toggle-button'
  btn.innerHTML = icon
  btn.title = label
  btn.setAttribute('aria-label', label)

  if (rainbowIndex !== undefined && applyHueVars(btn, rainbowIndex)) {
    btn.classList.add('glim-hue')
  }

  let checked = initial
  function applyState(): void {
    btn.classList.toggle('icon-toggle-button--active', checked)
    btn.setAttribute('aria-pressed', String(checked))
    if (rainbowIndex !== undefined) {
      btn.classList.toggle('glim-active', checked)
    }
  }
  applyState()

  btn.addEventListener('click', () => {
    onBeforeChange?.()
    checked = !checked
    applyState()
    onChange(checked)
  })

  return btn
}

/**
 * A sliding switch (`role="switch"`). Track and knob read --radius-pill, so the
 * switch follows the shape engine.
 */
export function toggleSwitch(label: string, initial: boolean, onChange: (checked: boolean) => void): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'toggle-switch'
  btn.setAttribute('role', 'switch')
  btn.setAttribute('aria-label', label)

  const knob = document.createElement('span')
  knob.className = 'toggle-switch-knob'
  btn.appendChild(knob)

  let checked = initial
  function applyState(): void {
    btn.classList.toggle('toggle-switch--on', checked)
    btn.setAttribute('aria-checked', String(checked))
  }
  applyState()

  btn.addEventListener('click', () => {
    checked = !checked
    applyState()
    onChange(checked)
  })

  return btn
}

/** A label with a switch at the end of its row, as the rainbow and disco rows use. */
export function switchRow(label: string, initial: boolean, onChange: (checked: boolean) => void, extra?: HTMLElement): HTMLElement {
  const row = document.createElement('div')
  row.className = 'control-slider-row switch-row'
  const labelRow = document.createElement('span')
  labelRow.className = 'control-slider-label-row'
  const text = document.createElement('span')
  text.textContent = label
  labelRow.appendChild(text)
  if (extra) labelRow.appendChild(extra)
  row.append(labelRow, toggleSwitch(label, initial, onChange))
  return row
}

export interface DropdownOption<T extends string> {
  value: T
  label: string
  /** Its own element, since a space between an emoji and text is too narrow a gap. */
  flag?: string
}

/**
 * A button and listbox dropdown after BombVault's language picker, for where a
 * native <select> is too small and its option list cannot be padded. It opens
 * downward, since it sits mid-page.
 */
export function customDropdown<T extends string>(
  options: DropdownOption<T>[],
  initial: T,
  onChange: (value: T) => void,
  ariaLabel: string,
): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'dropdown-wrap'

  const trigger = document.createElement('button')
  trigger.type = 'button'
  trigger.className = 'dropdown-trigger'
  trigger.setAttribute('aria-haspopup', 'listbox')
  trigger.setAttribute('aria-expanded', 'false')
  // A fixed accessible name, whatever value the trigger shows.
  trigger.setAttribute('aria-label', ariaLabel)

  const listbox = document.createElement('div')
  listbox.className = 'dropdown-listbox'
  listbox.setAttribute('role', 'listbox')
  listbox.setAttribute('aria-label', ariaLabel)
  listbox.style.display = 'none'

  let current = initial
  let isOpen = false

  function currentOption(): DropdownOption<T> | undefined {
    return options.find((o) => o.value === current)
  }

  /** Fills `el` with the option's flag and label, or with the label alone. */
  function fillOptionContent(el: HTMLElement, opt: DropdownOption<T>): void {
    el.innerHTML = ''
    if (opt.flag) {
      const flagSpan = document.createElement('span')
      flagSpan.className = 'dropdown-option-flag'
      flagSpan.textContent = opt.flag
      const labelSpan = document.createElement('span')
      labelSpan.textContent = opt.label
      el.append(flagSpan, labelSpan)
    } else {
      el.textContent = opt.label
    }
  }

  function select(value: T): void {
    if (value === current) return
    current = value
    const selected = currentOption()
    if (selected) fillOptionContent(trigger, selected)
    renderOptions()
    onChange(current)
  }

  function renderOptions(): void {
    listbox.innerHTML = ''
    for (const opt of options) {
      const row = document.createElement('button')
      row.type = 'button'
      row.className = 'dropdown-option' + (opt.value === current ? ' dropdown-option--active' : '')
      fillOptionContent(row, opt)
      row.setAttribute('role', 'option')
      row.setAttribute('aria-selected', String(opt.value === current))
      row.addEventListener('click', () => {
        select(opt.value)
        closeList()
        // Focus goes back to the trigger, which is what lets the wheel step
        // the value from here on.
        trigger.focus()
      })
      listbox.appendChild(row)
    }
  }

  function openList(): void {
    isOpen = true
    listbox.style.display = 'block'
    trigger.setAttribute('aria-expanded', 'true')
  }
  function closeList(): void {
    isOpen = false
    listbox.style.display = 'none'
    trigger.setAttribute('aria-expanded', 'false')
  }

  trigger.addEventListener('click', () => (isOpen ? closeList() : openList()))
  document.addEventListener('mousedown', (event) => {
    if (isOpen && !wrap.contains(event.target as Node)) closeList()
  })
  document.addEventListener('keydown', (event) => {
    if (isOpen && event.key === 'Escape') closeList()
  })
  enableWheelStep(trigger, (delta) => {
    const at = options.findIndex((o) => o.value === current)
    const next = options[stepIndex(options.length, at, delta)]
    if (next) select(next.value)
  })

  const initialOption = currentOption()
  if (initialOption) fillOptionContent(trigger, initialOption)
  renderOptions()
  wrap.append(trigger, listbox)
  return wrap
}

export type ButtonTone = 'subtle' | 'neutral' | 'accent'

export interface ButtonOptions {
  /** The words, present in every mode: visible, or hidden but announced and shown as the tooltip. */
  label: string
  glyph?: string
  onClick?: () => void
  /** `subtle` sits on a card, `neutral` is one step louder, `accent` is the one hero. */
  tone?: ButtonTone
  /** `icon` is a row action: where the mode hides the words it is a square instead of hugging its glyph. */
  variant?: 'default' | 'icon'
  /** For a label that is content rather than a verb, such as a file format. */
  keepLabel?: boolean
  /** A width stage for buttons that should match, or `none` for one that shares a row by flex. */
  stage?: WidthStage | 'none'
}

const buttonOptions = new WeakMap<HTMLButtonElement, ButtonOptions>()

function buttonLabelMode(): LabelMode {
  const mode = document.documentElement.getAttribute('data-labels-buttons')
  return mode === 'text' || mode === 'glyph' || mode === 'reactive' ? mode : 'textGlyph'
}

// The label engine's answer for one button, applied from the root attribute,
// so a mode change reaches every button without it subscribing to anything.
function paintButton(btn: HTMLButtonElement, opts: ButtonOptions): void {
  const mode = buttonLabelMode()
  const hasGlyph = !!opts.glyph
  const effective: LabelMode = opts.keepLabel
    ? hasGlyph
      ? 'textGlyph'
      : 'text'
    : hidesLabel(mode) && !hasGlyph
      ? 'text'
      : mode
  const reactive = effective === 'reactive'
  const showText = effective !== 'glyph' && !reactive
  const showGlyph = effective !== 'text' && hasGlyph

  const stage =
    effective === 'glyph'
      ? opts.variant === 'icon'
        ? 'glim-btn-icon'
        : ''
      : reactive || opts.stage === 'none'
        ? ''
        : `glim-btn-${opts.stage ?? widthStage(opts.label)}`
  // Only the engine's own classes are replaced, so a caller's, such as a
  // rainbow tint, survive a repaint.
  for (const cls of [...btn.classList]) {
    if (cls.startsWith('glim-btn') || cls.startsWith('glim-tone-') || cls === 'glim-reactive') btn.classList.remove(cls)
  }
  btn.classList.add('glim-btn', `glim-tone-${opts.tone ?? 'subtle'}`)
  if (stage) btn.classList.add(stage)
  if (reactive) btn.classList.add('glim-reactive')
  btn.style.setProperty('--reactive-chars', reactive ? String(labelWidth(opts.label)) : '')

  btn.innerHTML = ''
  if (showGlyph && opts.glyph) {
    const glyph = document.createElement('span')
    glyph.className = 'glim-btn-glyph'
    glyph.innerHTML = opts.glyph
    btn.appendChild(glyph)
  }
  const label = document.createElement('span')
  label.className = showText ? 'glim-btn-label' : reactive ? 'glim-label-reactive' : 'sr-only'
  label.textContent = opts.label
  btn.appendChild(label)

  // Where the words are hidden the bubble says them; where they show, or slide
  // in on hover, a bubble would say the same thing twice.
  if (showText || reactive) btn.removeAttribute('data-tip')
  else btn.setAttribute('data-tip', opts.label)
}

/** A GlimStone button that follows the label engine's `buttons` axis. */
export function glimButton(opts: ButtonOptions): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  buttonOptions.set(btn, opts)
  paintButton(btn, opts)
  if (opts.onClick) btn.addEventListener('click', opts.onClick)
  return btn
}

/** Changes a button's words or glyph in place, such as a Copy that briefly says Copied. */
export function updateButton(btn: HTMLButtonElement, change: Partial<ButtonOptions>): void {
  const opts = buttonOptions.get(btn)
  if (!opts) return
  const next = { ...opts, ...change }
  buttonOptions.set(btn, next)
  paintButton(btn, next)
}

/** Repaints every button on the page after the label mode changed. */
export function repaintButtons(): void {
  for (const btn of document.querySelectorAll<HTMLButtonElement>('button.glim-btn')) {
    const opts = buttonOptions.get(btn)
    if (opts) paintButton(btn, opts)
  }
}
