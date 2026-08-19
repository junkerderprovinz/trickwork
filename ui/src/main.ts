import { APP_VERSION, GLIMSTONE_VERSION } from './version'
import { applyCachedAppearance } from './design/appearance'
import { applyCachedTheme } from './design/theme'
import { enableSelectScrollForAll } from './design/selectScroll'
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
import { iconAppearance, iconConvert } from './icons'

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
// own Sidebar.tsx structure. Exactly two real destinations, per jdp's own
// scoping: Convert (the working page - preview plus every card that
// directly affects generation, all live and visible together, never gated
// behind a nav click) and Settings (theming/language/global preferences -
// its own separate "window", no preview or working cards at all, matching
// how BombVault's Settings page fully replaces the main content instead of
// sitting beside it).
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

// --- Convert view: preview + every generation-affecting card, all live. ---
const convertView = document.createElement('div')
convertView.className = 'convert-view'

const primary = document.createElement('section')
primary.className = 'app-primary'
const dropzoneCard = section()
const previewCard = section()
primary.append(dropzoneCard, previewCard)

const secondary = document.createElement('section')
secondary.className = 'app-secondary'
const adjustCard = section()
const transformCard = section()
const filtersCard = section()
const queueCard = section()
const exportCard = section()
secondary.append(adjustCard, transformCard, filtersCard, queueCard, exportCard)

convertView.append(primary, secondary)

// --- Settings view: theming/language/global only, no preview at all. ---
const settingsView = document.createElement('div')
settingsView.className = 'settings-view'
const settingsCard = document.createElement('div')
settingsCard.className = 'glim-card glim-section settings-card'
settingsView.appendChild(settingsCard)

const nav = mountSidebarNav(
  body,
  [
    { container: navMain, items: [{ id: 'convert', label: t('nav.convert'), icon: iconConvert(), panel: convertView }] },
    {
      container: navBottom,
      items: [{ id: 'settings', label: t('nav.settings'), icon: iconAppearance(), panel: settingsView }],
    },
  ],
  'convert',
)

subscribeLocale(() => {
  nav.setLabels({ convert: t('nav.convert'), settings: t('nav.settings') })
})

mountDropzone(dropzoneCard, store)
mountPreview(previewCard, store)
mountControls(adjustCard, store)
mountTransformPanel(transformCard, store)
mountFiltersPanel(filtersCard, store)
mountQueue(queueCard, store)
mountExportPanel(exportCard, store)
mountAppearanceSettings(settingsCard)

// Boot-time pass, then re-run after any locale-driven rebuild (every
// mountXxx module above rebuilds its own <select> elements on a language
// switch, and enableSelectScroll is idempotent, so scanning the whole body
// again costs nothing and never double-attaches).
enableSelectScrollForAll(body)
subscribeLocale(() => enableSelectScrollForAll(body))

const footer = document.createElement('footer')
footer.className = 'app-footer'
footer.textContent = `TrickWork v${APP_VERSION} · GlimStone v${GLIMSTONE_VERSION}`
app.appendChild(footer)
