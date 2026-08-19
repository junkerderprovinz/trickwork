import { APP_VERSION, GLIMSTONE_VERSION } from './version'
import { applyCachedAppearance } from './design/appearance'
import { applyCachedTheme } from './design/theme'
import { applyCachedLocale, subscribeLocale, t } from './i18n'
import { createStore } from './state'
import { mountDropzone } from './dropzone'
import { mountPreview } from './preview'
import { mountControls } from './controls'
import { mountQueue } from './queue'
import { mountExportPanel } from './exportPanel'
import { mountAppearanceSettings } from './appearanceSettings'

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

const sidebar = document.createElement('aside')
sidebar.className = 'app-sidebar'
const controlsCard = section()
const queueCard = section()
const exportCard = section()
const appearanceCard = section()
sidebar.append(controlsCard, queueCard, exportCard, appearanceCard)

main.append(primary, sidebar)
app.appendChild(main)

mountDropzone(dropzoneCard, store)
mountPreview(previewCard, store)
mountControls(controlsCard, store)
mountQueue(queueCard, store)
mountExportPanel(exportCard, store)
mountAppearanceSettings(appearanceCard)

const footer = document.createElement('footer')
footer.className = 'app-footer'
footer.textContent = `TrickWork v${APP_VERSION} · GlimStone v${GLIMSTONE_VERSION}`
app.appendChild(footer)
