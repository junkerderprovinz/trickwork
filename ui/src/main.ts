import { APP_VERSION, GLIMSTONE_VERSION } from './version'
import { applyCachedAppearance } from './design/appearance'
import { applyCachedTheme } from './design/theme'
import { applyCachedLocale, subscribeLocale, t } from './i18n'
import { createStore } from './state'
import { mountDropzone } from './dropzone'
import { mountPreview } from './preview'
import { mountControls } from './controls'
import { mountTransformPanel } from './transformPanel'
import { mountFiltersPanel } from './filtersPanel'
import { mountQueue } from './queue'
import { mountExportPanel } from './exportPanel'
import { mountAppearanceSettings } from './appearanceSettings'
import { mountSidebarNav } from './sidebarNav'
import { iconAdjust, iconAppearance, iconExport, iconFilters, iconQueue, iconTransform } from './icons'

const app = document.getElementById('app')
if (!app) {
  throw new Error('main.ts: #app root element missing from index.html')
}

// GlimStone's boot-time entry point (its actual current export - not
// applyAppearance(), which doesn't exist upstream). Theme has no GlimStone
// export at all (see design/theme.ts) so it's applied separately, and
// locale is a third, independent boot-time cache read (see i18n.ts).
applyCachedAppearance()
applyCachedTheme()
applyCachedLocale()

const store = createStore()

function section(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'glim-card glim-section'
  return el
}

// Left-rail navigation + main content, matching BombVault's/KnightLoader's
// own Sidebar.tsx structure exactly (not a top header + tabbed side panel,
// which was jdp's direct correction): a fixed-width sidebar carrying the
// brand mark, a vertical icon+label nav list, and Appearance pinned at the
// bottom - no separate top app-bar at all.
const shell = document.createElement('div')
shell.className = 'app-shell'
app.appendChild(shell)

const sidebar = document.createElement('aside')
sidebar.className = 'nav-sidebar'
shell.appendChild(sidebar)

const brand = document.createElement('div')
brand.className = 'nav-brand'
const brandName = document.createElement('span')
brandName.className = 'nav-brand-name'
brandName.textContent = 'TrickWork'
const brandTagline = document.createElement('span')
brandTagline.className = 'nav-brand-tagline'
brand.append(brandName, brandTagline)
sidebar.appendChild(brand)
subscribeLocale(() => {
  brandTagline.textContent = t('app.tagline')
})
brandTagline.textContent = t('app.tagline')

const navMain = document.createElement('nav')
navMain.className = 'nav-list'
sidebar.appendChild(navMain)

const navBottom = document.createElement('div')
navBottom.className = 'nav-list nav-list--bottom'
sidebar.appendChild(navBottom)

const body = document.createElement('div')
body.className = 'app-body'
shell.appendChild(body)

const primary = document.createElement('section')
primary.className = 'app-primary'
const dropzoneCard = section()
const previewCard = section()
primary.append(dropzoneCard, previewCard)

const panelCard = document.createElement('div')
panelCard.className = 'glim-card glim-section nav-panel-host'

body.append(primary, panelCard)

const adjustPanel = document.createElement('div')
const transformPanelEl = document.createElement('div')
const filtersPanelEl = document.createElement('div')
const queuePanel = document.createElement('div')
const exportPanelEl = document.createElement('div')
const appearancePanelEl = document.createElement('div')

const nav = mountSidebarNav(
  panelCard,
  [
    {
      container: navMain,
      items: [
        { id: 'adjust', label: t('tabs.adjust'), icon: iconAdjust(), panel: adjustPanel },
        { id: 'transform', label: t('tabs.transform'), icon: iconTransform(), panel: transformPanelEl },
        { id: 'filters', label: t('tabs.filters'), icon: iconFilters(), panel: filtersPanelEl },
        { id: 'queue', label: t('queue.eyebrow'), icon: iconQueue(), panel: queuePanel },
        { id: 'export', label: t('export.eyebrow'), icon: iconExport(), panel: exportPanelEl },
      ],
    },
    {
      container: navBottom,
      items: [{ id: 'appearance', label: t('appearance.eyebrow'), icon: iconAppearance(), panel: appearancePanelEl }],
    },
  ],
  'adjust',
)

subscribeLocale(() => {
  nav.setLabels({
    adjust: t('tabs.adjust'),
    transform: t('tabs.transform'),
    filters: t('tabs.filters'),
    queue: t('queue.eyebrow'),
    export: t('export.eyebrow'),
    appearance: t('appearance.eyebrow'),
  })
})

mountDropzone(dropzoneCard, store)
mountPreview(previewCard, store)
mountControls(adjustPanel, store)
mountTransformPanel(transformPanelEl, store)
mountFiltersPanel(filtersPanelEl, store)
mountQueue(queuePanel, store)
mountExportPanel(exportPanelEl, store)
mountAppearanceSettings(appearancePanelEl)

const footer = document.createElement('footer')
footer.className = 'app-footer'
footer.textContent = `TrickWork v${APP_VERSION} · GlimStone v${GLIMSTONE_VERSION}`
app.appendChild(footer)
