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
