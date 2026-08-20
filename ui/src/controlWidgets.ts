// ui/src/controlWidgets.ts
//
// Small, framework-free DOM builders shared between controls.ts and
// appearanceSettings.ts, so the segmented-row look (used for Rotate/Sharpen
// here and for Shape/Theme there) has exactly one implementation instead of
// two independently-reimplemented copies. Not i18n-aware themselves - a
// caller whose labels can change (locale switch) rebuilds its whole panel
// via its own subscribeLocale callback rather than these widgets trying to
// patch their own text in place.

import { hueVars, rainbowColor } from './design/appearance'

/**
 * Sets the --item-hue* custom properties an element needs to own a rainbow
 * position (design-language.md: "WHAT MAY OWN A POSITION: anything that is
 * one member of a SET whose members are all equal ... a segment of a
 * segmented control" - a lone unique control, like the Settings badge,
 * keeps the single accent instead). Returns whether a hue was actually
 * applied (false when rainbow is off), so a caller can skip adding its own
 * .glim-hue/.glim-hue-icon/.glim-tint classes when there's nothing to key
 * them off. Mirrors queue.ts's own inline pattern - the one existing
 * rainbow consumer before this file's callers opted in too.
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
  // Opt-in only (jdp: "die ganzen badges und schaltflächen werden nicht
  // eingefärbt") - each choice becomes its own rainbow position starting at
  // this index when given, matching queue.ts's row-owns-a-colour pattern.
  // Omitted entirely by Shape/Theme (appearanceSettings.ts): those are the
  // OTHER user-owned axes, not activity, and recolouring the very controls
  // that configure rainbow with rainbow itself reads as a confusing
  // self-reference rather than a feature.
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
      // A truncating text-overflow needs a genuine block-level child - it
      // doesn't reliably apply to a flex container's own direct text node
      // (jdp: "unscharf maskieren der text läuft aus der Schaltfläche
      // hinaus" - .segmented-button is display:flex, and text-overflow:
      // ellipsis on the flex container itself silently did nothing, so a
      // long label just overflowed the button's bounds instead of
      // truncating). The label lives in its own span; the button stays a
      // pure flex container with no overflow rule of its own.
      const labelSpan = document.createElement('span')
      labelSpan.className = 'segmented-button-label'
      labelSpan.textContent = choice.label
      btn.appendChild(labelSpan)
      // Only the ACTIVE segment owns a rainbow position - jdp: "bei den
      // Auswahlbalken soll nur der aktiv ausgewählte Option eingefärbt
      // sein, die inaktive nicht". Unlike a list (queue.ts), where every
      // row needs its own wash so an all-idle list isn't blank, a
      // selector's own fill already says which one is picked - washing
      // the REST too is noise the selection state doesn't need.
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
      // earlier this session. Measured on the LABEL span, not the button -
      // the button itself never overflows (it clips), only the span's own
      // untruncated text metric does.
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
  // Opt-in only, same rule as segmentedRow's own rainbowBaseIndex - the
  // caller assigns each button in its own logical set (e.g. Flip
  // horizontal/vertical) a distinct index. .glim-hue redefines --accent for
  // this button UNCONDITIONALLY (not just while checked), so the checked
  // fill (.icon-toggle-button--active reads var(--accent)) resolves to
  // THIS button's own position. .glim-tint-badge washes the BADGE's own
  // background - the stronger badge-specific tier, not the plain .glim-tint
  // queue.ts's rows use (jdp: "die ganzen icon badges sind immer noch
  // schwach eingefärbt, die sollen normal kräftig eingefärbt sein" - a
  // compact isolated badge needs more of the wash than a dense list of rows
  // does to read as clearly coloured). The glyph itself stays neutral, NOT
  // also recoloured (jdp: "die icons sollen nicht eingefärbt werden, nur
  // die badges also der hintergrund" - an earlier round tried colouring the
  // glyph too via .glim-hue-icon and it read as one colour too many).
  // Checked additionally adds .glim-active, which lets the badge's own
  // background-fill CSS pick up --accent for the fill itself.
  rainbowIndex?: number,
): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'icon-toggle-button'
  btn.innerHTML = icon
  btn.title = label
  btn.setAttribute('aria-label', label)

  if (rainbowIndex !== undefined && applyHueVars(btn, rainbowIndex)) {
    btn.classList.add('glim-hue', 'glim-tint-badge')
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
