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
import { mountTabs } from './tabs'

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

const header = document.createElement('header')
header.className = 'app-header'
const heading = document.createElement('h1')
heading.textContent = 'TrickWork'
const tagline = document.createElement('span')
tagline.className = 'app-tagline'
header.append(heading, tagline)
app.appendChild(header)
subscribeLocale(() => {
  tagline.textContent = t('app.tagline')
})
tagline.textContent = t('app.tagline')

const main = document.createElement('main')
main.className = 'app-main'

const primary = document.createElement('section')
primary.className = 'app-primary'
const dropzoneCard = section()
const previewCard = section()
primary.append(dropzoneCard, previewCard)

// One card, tabbed - jdp's explicit correction after the previous session's
// "just add more rows to the one Controls card" approach: ASCGen2 groups its
// functions into real menus/panels (File/Edit-Input/Edit-Output/View), and
// stacking every control into a single flat page read as unfinished no
// matter how many features it actually had. Each tab panel is a plain div
// mounted once at boot (same "always mounted, subscribe to changes" pattern
// as everything else in this app) - mountTabs only toggles which one is
// visible, it doesn't re-mount anything.
const sidebar = document.createElement('aside')
sidebar.className = 'app-sidebar'
const tabCard = document.createElement('div')
tabCard.className = 'glim-card glim-section tab-card'
sidebar.appendChild(tabCard)

const adjustPanel = document.createElement('div')
const transformPanelEl = document.createElement('div')
const filtersPanelEl = document.createElement('div')
const queuePanel = document.createElement('div')
const exportPanelEl = document.createElement('div')
const appearancePanelEl = document.createElement('div')

const tabs = mountTabs(tabCard, [
  { id: 'adjust', label: t('tabs.adjust'), panel: adjustPanel },
  { id: 'transform', label: t('tabs.transform'), panel: transformPanelEl },
  { id: 'filters', label: t('tabs.filters'), panel: filtersPanelEl },
  { id: 'queue', label: t('queue.eyebrow'), panel: queuePanel },
  { id: 'export', label: t('export.eyebrow'), panel: exportPanelEl },
  { id: 'appearance', label: t('appearance.eyebrow'), panel: appearancePanelEl },
])
subscribeLocale(() => {
  tabs.setLabels({
    adjust: t('tabs.adjust'),
    transform: t('tabs.transform'),
    filters: t('tabs.filters'),
    queue: t('queue.eyebrow'),
    export: t('export.eyebrow'),
    appearance: t('appearance.eyebrow'),
  })
})

main.append(primary, sidebar)
app.appendChild(main)

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
