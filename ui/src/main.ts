import { APP_VERSION, GLIMSTONE_VERSION } from './version'
import { applyCachedAppearance } from './design/appearance'
import { createStore } from './state'
import { mountDropzone } from './dropzone'
import { mountPreview } from './preview'
import { mountControls } from './controls'
import { mountQueue } from './queue'
import { mountExportPanel } from './exportPanel'

const app = document.getElementById('app')
if (!app) {
  throw new Error('main.ts: #app root element missing from index.html')
}

// GlimStone's boot-time entry point (its actual current export - not
// applyAppearance(), which doesn't exist upstream).
applyCachedAppearance()

const store = createStore()

function section(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'glim-card glim-section'
  return el
}

const header = document.createElement('header')
header.className = 'app-header'
header.innerHTML = '<h1>TrickWork</h1><span class="app-tagline">Image to ASCII art</span>'
app.appendChild(header)

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
sidebar.append(controlsCard, queueCard, exportCard)

main.append(primary, sidebar)
app.appendChild(main)

mountDropzone(dropzoneCard, store)
mountPreview(previewCard, store)
mountControls(controlsCard, store)
mountQueue(queueCard, store)
mountExportPanel(exportCard, store)

const footer = document.createElement('footer')
footer.className = 'app-footer'
footer.textContent = `TrickWork v${APP_VERSION} · GlimStone v${GLIMSTONE_VERSION}`
app.appendChild(footer)
