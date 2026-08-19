// ui/src/tabs.ts
//
// GlimStone's one shared "horizontal selector" component (design-language.md,
// "Der eine waagerechte Wähler"): tabs, filter bars, and segmented switches
// are all the same thing - a row where one is chosen. Per that spec: no
// container box around the strip (the filled tab already shows the
// selection), it wraps rather than scrolls, and it needs a real roving-
// tabindex + arrow-key implementation, not just click handlers - a `<label>`
// wrapping multiple tabs is the specific trap called out there (a click on
// any of them fires the FIRST control), so this builds real <button role="tab">
// elements instead.

export interface TabDef {
  id: string
  label: string
  panel: HTMLElement
}

export interface TabsHandle {
  element: HTMLElement
  /** Relabels tabs in place (locale switch) without losing the active selection. */
  setLabels(labels: Record<string, string>): void
}

export function mountTabs(container: HTMLElement, tabs: TabDef[], initialId?: string): TabsHandle {
  const tablist = document.createElement('div')
  tablist.className = 'tab-bar'
  tablist.setAttribute('role', 'tablist')

  let activeId = initialId && tabs.some((t) => t.id === initialId) ? initialId : (tabs[0]?.id ?? '')

  const buttons = new Map<string, HTMLButtonElement>()

  function activate(id: string, focus: boolean): void {
    activeId = id
    for (const tab of tabs) {
      const btn = buttons.get(tab.id)
      const selected = tab.id === id
      if (btn) {
        btn.setAttribute('aria-selected', String(selected))
        btn.tabIndex = selected ? 0 : -1
        btn.className = 'tab-button' + (selected ? ' tab-button--active' : '')
        if (selected && focus) btn.focus()
      }
      tab.panel.style.display = selected ? '' : 'none'
    }
  }

  tabs.forEach((tab, index) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.id = `tab-${tab.id}`
    btn.setAttribute('role', 'tab')
    btn.setAttribute('aria-controls', `tabpanel-${tab.id}`)
    btn.textContent = tab.label
    btn.addEventListener('click', () => activate(tab.id, false))
    btn.addEventListener('keydown', (event) => {
      // Roving tabindex per the WAI-ARIA tabs pattern: arrow keys move focus
      // AND selection together, Home/End jump to the ends. RTL is handled by
      // the browser itself (ArrowLeft/ArrowRight already mean "previous in
      // reading order" in an RTL layout because the physical arrow keys keep
      // their visual meaning while focus order follows the DOM, which the
      // page's own dir attribute already reverses).
      let nextIndex: number | null = null
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length
      else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length
      else if (event.key === 'Home') nextIndex = 0
      else if (event.key === 'End') nextIndex = tabs.length - 1
      if (nextIndex !== null) {
        event.preventDefault()
        const next = tabs[nextIndex]
        if (next) activate(next.id, true)
      }
    })
    tablist.appendChild(btn)
    buttons.set(tab.id, btn)

    tab.panel.id = `tabpanel-${tab.id}`
    tab.panel.setAttribute('role', 'tabpanel')
    tab.panel.setAttribute('aria-labelledby', `tab-${tab.id}`)
    tab.panel.className = (tab.panel.className ? tab.panel.className + ' ' : '') + 'tab-panel'
  })

  const wrap = document.createElement('div')
  wrap.className = 'tabs'
  wrap.appendChild(tablist)
  for (const tab of tabs) wrap.appendChild(tab.panel)
  container.appendChild(wrap)

  activate(activeId, false)

  return {
    element: wrap,
    setLabels(labels) {
      for (const tab of tabs) {
        const btn = buttons.get(tab.id)
        const label = labels[tab.id]
        if (btn && label !== undefined) btn.textContent = label
      }
    },
  }
}
