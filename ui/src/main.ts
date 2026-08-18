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

const main = document.createElement('main')
main.className = 'app-main'
mountDropzone(main, store)
mountPreview(main, store)
mountControls(main, store)
mountQueue(main, store)
mountExportPanel(main, store)
app.appendChild(main)

const footer = document.createElement('footer')
footer.className = 'app-footer'
footer.textContent = `ASCII SuperGenerator v${APP_VERSION} · GlimStone v${GLIMSTONE_VERSION}`
app.appendChild(footer)
