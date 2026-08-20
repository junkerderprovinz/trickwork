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
 * once per whole gesture - see controls.ts). Receives the TARGET value (the
 * choice about to become active), not the outgoing one - a history-log label
 * describing the action ("Rotated 90°") needs to know what's being switched
 * TO, and onBeforeChange fires before `active` is updated.
 */
export function segmentedRow<T extends string>(
  label: string,
  choices: { value: T; label: string }[],
  initial: T,
  onChange: (value: T) => void,
  onBeforeChange?: (value: T) => void,
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
      // The CSS forces one line + ellipsis so a long label (e.g. German
      // "Unscharf maskieren") never wraps and makes this row taller than a
      // short-label row (e.g. Rotate's "0°/90°/180°/270°") in a sibling card
      // of the same width.
      btn.addEventListener('click', () => {
        if (choice.value === active) return
        onBeforeChange?.(choice.value)
        active = choice.value
        onChange(active)
        render()
      })
      row.appendChild(btn)
      // A tooltip only when the visible label is ACTUALLY truncated by that
      // ellipsis (jdp: "die Drehoptionen haben eine Bubble die genau das
      // gleiche anzeigt was man eh schon sieht" - a short label like "90°"
      // never truncates, so a tooltip repeating it verbatim adds nothing; a
      // long one like "Unscharf maskieren" does get cut and still needs the
      // full text available on hover). Deferred to the next frame, not
      // measured right after appendChild - render() itself runs INSIDE
      // segmentedRow(), before the function has even returned `wrap` to the
      // caller who actually attaches it to the visible document, so
      // scrollWidth/clientWidth would both read 0 (equal, "not truncated")
      // at that point regardless of the real eventual layout - the same
      // measure-before-layout trap levelsPanel.ts's histogram canvas hit
      // earlier this session.
      requestAnimationFrame(() => {
        if (btn.isConnected && btn.scrollWidth > btn.clientWidth) {
          btn.setAttribute('data-tip', choice.label)
        }
      })
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
  /** Rendered as its own element with an explicit gap before the label (jdp:
   *  "der Text ist zu nah an den Flaggen") - a single space character
   *  between an emoji glyph and text doesn't read as a real gap. */
  flag?: string
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

  function currentOption(): DropdownOption<T> | undefined {
    return options.find((o) => o.value === current)
  }

  /** Fills `el` with the option's content - a separate flag span (its own
   *  CSS gap from the label) when the option carries one, plain text otherwise. */
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
