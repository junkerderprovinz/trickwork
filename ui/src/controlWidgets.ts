// ui/src/controlWidgets.ts
//
// Small, framework-free DOM builders shared between controls.ts and
// appearanceSettings.ts, so the segmented-row look (used for Rotate/Sharpen
// here and for Shape/Theme there) has exactly one implementation instead of
// two independently-reimplemented copies. Not i18n-aware themselves - a
// caller whose labels can change (locale switch) rebuilds its whole panel
// via its own subscribeLocale callback rather than these widgets trying to
// patch their own text in place.

export function segmentedRow<T extends string>(
  label: string,
  choices: { value: T; label: string }[],
  initial: T,
  onChange: (value: T) => void,
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
 * A single labelled checkbox, styled to sit in the same control-slider
 * rhythm as everything else. `icon`, when given, is a small aria-hidden SVG
 * string (see icons.ts's controlSvg()-built exports) placed between the box
 * and the label text - the label itself still carries the accessible name,
 * the icon is purely a faster-to-scan visual cue for options like Flip/
 * Invert/Dither/Color that read slower as plain text alone.
 */
export function checkboxRow(
  label: string,
  initial: boolean,
  onChange: (checked: boolean) => void,
  icon?: string,
): HTMLElement {
  const wrap = document.createElement('label')
  wrap.className = 'checkbox-row'

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.checked = initial
  input.addEventListener('change', () => onChange(input.checked))

  wrap.appendChild(input)

  if (icon) {
    const iconWrap = document.createElement('span')
    iconWrap.className = 'checkbox-row-icon'
    iconWrap.innerHTML = icon
    wrap.appendChild(iconWrap)
  }

  const text = document.createElement('span')
  text.textContent = label
  wrap.appendChild(text)

  return wrap
}
