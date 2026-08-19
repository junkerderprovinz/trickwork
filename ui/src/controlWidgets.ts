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

/** A single labelled checkbox, styled to sit in the same control-slider rhythm as everything else. */
export function checkboxRow(label: string, initial: boolean, onChange: (checked: boolean) => void): HTMLElement {
  const wrap = document.createElement('label')
  wrap.className = 'checkbox-row'

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.checked = initial
  input.addEventListener('change', () => onChange(input.checked))

  const text = document.createElement('span')
  text.textContent = label

  wrap.append(input, text)
  return wrap
}
