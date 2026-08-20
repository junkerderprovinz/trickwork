// ui/src/controlWidgets.ts
//
// Small, framework-free DOM builders shared between controls.ts and
// appearanceSettings.ts, so the segmented-row look (used for Rotate/Sharpen
// here and for Shape/Theme there) has exactly one implementation instead of
// two independently-reimplemented copies. Not i18n-aware themselves - a
// caller whose labels can change (locale switch) rebuilds its whole panel
// via its own subscribeLocale callback rather than these widgets trying to
// patch their own text in place.

/**
 * `onBeforeChange`, when given, fires exactly once per click, right before
 * `onChange` - the undo/redo call sites (transformPanel.ts/filtersPanel.ts)
 * use it to snapshot the pre-click options onto the history stack. A plain
 * click is already one atomic gesture, so every call is a good undo step
 * (contrast this with numberSlider's continuous drag, which only snapshots
 * once per whole gesture - see controls.ts).
 */
export function segmentedRow<T extends string>(
  label: string,
  choices: { value: T; label: string }[],
  initial: T,
  onChange: (value: T) => void,
  onBeforeChange?: () => void,
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
    for (const choice of choices) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'segmented-button' + (choice.value === active ? ' segmented-button--active' : '')
      btn.textContent = choice.label
      // A long label (e.g. German "Unscharf maskieren") would otherwise wrap
      // to two lines and make this row taller than a short-label row (e.g.
      // Rotate's "0°/90°/180°/270°") sitting in a sibling card of the same
      // width - the CSS forces one line + ellipsis, so title carries the
      // full text for anyone who needs it.
      btn.title = choice.label
      btn.addEventListener('click', () => {
        if (choice.value === active) return
        onBeforeChange?.()
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

/**
 * A single icon-only toggle button - replaces the earlier checkbox+text row
 * for options like Flip/Invert/Dither/Color entirely (jdp: "Icons anstelle
 * der Checkboxen und Texte verwenden, nicht ergänzen"). The icon alone
 * carries the option on screen; `label` becomes the hover tooltip (title)
 * and the accessible name (aria-label) instead of visible text. Active
 * state reads through the same accent-fill GlimStone already uses for a
 * segmented row's active button, not a checkbox mark.
 */
export function iconToggleButton(
  label: string,
  icon: string,
  initial: boolean,
  onChange: (checked: boolean) => void,
  onBeforeChange?: () => void,
): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'icon-toggle-button'
  btn.innerHTML = icon
  btn.title = label
  btn.setAttribute('aria-label', label)

  let checked = initial
  function applyState(): void {
    btn.classList.toggle('icon-toggle-button--active', checked)
    btn.setAttribute('aria-pressed', String(checked))
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
 * A genuine sliding switch (`role="switch"`), replacing the earlier Off/On
 * segmented-row for Rainbow (jdp: "soll ein Toggle sein, der auch der Form
 * folgt" - toggling the old segmented row also didn't visibly change
 * anything by itself, which was the actual bug report; a real switch plus
 * the palette row appearanceSettings.ts renders beside it now gives the
 * control something to visibly show). GlimStone's own "Switches" section
 * documents this as a distinct component from the horizontal selector, not a
 * two-option variant of it. Track and knob both read --radius-pill (capped
 * against the knob's own height, same technique the range thumb above
 * uses), so Round keeps the classic pill+circle look while Soft/Square
 * progressively square it off - CannonadeCommand's own precedent for a
 * shape-reactive toggle.
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
}

/**
 * A custom button+listbox dropdown, BombVault's Sidebar.tsx language-picker
 * pattern ported to vanilla DOM - replaces a native <select> where its closed
 * field reads too small and the browser won't give its native option list
 * real padding (jdp: "das Feld ist zu klein und die Dropdownliste viel zu
 * kompakt, siehe BV"). GlimStone's own changelog (1.3.0) explicitly sanctions
 * this: the flag-emoji-prefixed plain <select> is "the plain-select-
 * compatible default, not a mandate to avoid a fancier approach elsewhere."
 * Opens DOWNWARD, unlike BV's own (which opens upward only because that
 * picker sits at the very bottom of a sidebar) - this one sits mid-page.
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
  // Static, unlike the visible text below - a stable accessible name keeps
  // the trigger locatable by name across every value it ever shows.
  trigger.setAttribute('aria-label', ariaLabel)

  const listbox = document.createElement('div')
  listbox.className = 'dropdown-listbox'
  listbox.setAttribute('role', 'listbox')
  listbox.setAttribute('aria-label', ariaLabel)
  listbox.style.display = 'none'

  let current = initial
  let isOpen = false

  function currentLabel(): string {
    return options.find((o) => o.value === current)?.label ?? ''
  }

  function renderOptions(): void {
    listbox.innerHTML = ''
    for (const opt of options) {
      const row = document.createElement('button')
      row.type = 'button'
      row.className = 'dropdown-option' + (opt.value === current ? ' dropdown-option--active' : '')
      row.textContent = opt.label
      row.setAttribute('role', 'option')
      row.setAttribute('aria-selected', String(opt.value === current))
      row.addEventListener('click', () => {
        current = opt.value
        trigger.textContent = currentLabel()
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

  trigger.textContent = currentLabel()
  renderOptions()
  wrap.append(trigger, listbox)
  return wrap
}
