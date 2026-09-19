// DOM builders shared by the panels and appearanceSettings.ts. They are not
// i18n-aware; a caller rebuilds its panel when the locale changes.

import { hueVars, rainbowColor } from './design/appearance'

/**
 * Sets the --item-hue* properties that give an element its rainbow position.
 * Returns false when rainbow mode is off, so the caller can skip its classes.
 */
export function applyHueVars(el: HTMLElement, index: number): boolean {
  const hue = rainbowColor(index)
  if (!hue) return false
  for (const [prop, value] of Object.entries(hueVars(hue))) {
    el.style.setProperty(prop, value)
  }
  return true
}

/**
 * `onBeforeChange` fires once per click, before `onChange`, with the value
 * about to become active, so the caller can record an undo step labelled with
 * the new value.
 */
export function segmentedRow<T extends string>(
  label: string,
  choices: { value: T; label: string }[],
  initial: T,
  onChange: (value: T) => void,
  onBeforeChange?: (value: T) => void,
  // Each choice owns a rainbow position from this index on; without it the
  // row keeps the single accent.
  rainbowBaseIndex?: number,
): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'control-slider'

  if (label) {
    const labelEl = document.createElement('span')
    labelEl.textContent = label
    wrap.appendChild(labelEl)
  }

  const row = document.createElement('div')
  row.className = 'segmented-row'
  wrap.appendChild(row)

  let active = initial

  function render(): void {
    row.innerHTML = ''
    choices.forEach((choice, index) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      const isActive = choice.value === active
      btn.className = 'segmented-button' + (isActive ? ' segmented-button--active' : '')
      // text-overflow does not apply to the text of a flex container, so the
      // label gets its own span to truncate.
      const labelSpan = document.createElement('span')
      labelSpan.className = 'segmented-button-label'
      labelSpan.textContent = choice.label
      btn.appendChild(labelSpan)
      // Only the active segment is coloured; its fill already marks the pick,
      // and washing the rest would be noise.
      if (isActive && rainbowBaseIndex !== undefined && applyHueVars(btn, rainbowBaseIndex + index)) {
        btn.classList.add('glim-hue', 'glim-active')
      }
      btn.addEventListener('click', () => {
        if (choice.value === active) return
        onBeforeChange?.(choice.value)
        active = choice.value
        onChange(active)
        render()
      })
      row.appendChild(btn)
      // A tooltip only for a label the ellipsis actually cuts. Measured on the
      // next frame, because the caller attaches the row to the document only
      // after segmentedRow returns.
      requestAnimationFrame(() => {
        if (labelSpan.isConnected && labelSpan.scrollWidth > labelSpan.clientWidth) {
          btn.setAttribute('data-tip', choice.label)
        }
      })
    })
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
 * switch follows the Round, Soft and Square shapes.
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
        current = opt.value
        const selected = currentOption()
        if (selected) fillOptionContent(trigger, selected)
        renderOptions()
        closeList()
        onChange(current)
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

  const initialOption = currentOption()
  if (initialOption) fillOptionContent(trigger, initialOption)
  renderOptions()
  wrap.append(trigger, listbox)
  return wrap
}
