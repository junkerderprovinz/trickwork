// ui/src/sidebarNav.ts
//
// The persistent left-rail navigation BombVault and KnightLoader both use
// (web/src/components/Sidebar.tsx in both repos): icon + label rows in a
// vertical list, the active one filled with the accent colour, split into a
// main group (flex-1, top) and a bottom-pinned group (Appearance here,
// Settings there) - both share ONE active-panel state, since only one panel
// can be showing regardless of which visual group its button lives in.
// Unlike tabs.ts (GlimStone's small in-panel "horizontal selector", used for
// things like Shape/Theme/Sharpen choices), this is real view navigation
// without a URL router behind it, so it uses `aria-current="page"` rather
// than the ARIA tabs pattern - the same semantic a single-page app reaches
// for when it swaps a whole content area without changing the address bar.

export interface NavItemDef {
  id: string
  label: string
  icon: string
  panel: HTMLElement
}

export interface NavGroup {
  container: HTMLElement
  items: NavItemDef[]
}

export interface SidebarNavHandle {
  setLabels(labels: Record<string, string>): void
}

export function mountSidebarNav(panelHost: HTMLElement, groups: NavGroup[], initialId?: string): SidebarNavHandle {
  const allItems = groups.flatMap((g) => g.items)
  let activeId = initialId && allItems.some((i) => i.id === initialId) ? initialId : (allItems[0]?.id ?? '')
  const buttons = new Map<string, HTMLButtonElement>()

  function activate(id: string): void {
    activeId = id
    for (const item of allItems) {
      const btn = buttons.get(item.id)
      const selected = item.id === id
      if (btn) {
        btn.className = 'nav-item' + (selected ? ' nav-item--active' : '')
        if (selected) btn.setAttribute('aria-current', 'page')
        else btn.removeAttribute('aria-current')
      }
      item.panel.style.display = selected ? '' : 'none'
    }
  }

  for (const group of groups) {
    for (const item of group.items) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.innerHTML = `${item.icon}<span>${item.label}</span>`
      btn.addEventListener('click', () => activate(item.id))
      group.container.appendChild(btn)
      buttons.set(item.id, btn)

      panelHost.appendChild(item.panel)
    }
  }

  activate(activeId)

  return {
    setLabels(labels) {
      for (const item of allItems) {
        const btn = buttons.get(item.id)
        const label = labels[item.id]
        if (btn && label !== undefined) {
          const span = btn.querySelector('span')
          if (span) span.textContent = label
        }
      }
    },
  }
}
