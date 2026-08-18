import { APP_VERSION, GLIMSTONE_VERSION } from './version'
import { applyCachedAppearance } from './design/appearance'

const app = document.getElementById('app')
if (!app) {
  throw new Error('main.ts: #app root element missing from index.html')
}

// GlimStone's boot-time entry point (its actual current export - not
// applyAppearance(), which doesn't exist upstream).
applyCachedAppearance()

const footer = document.createElement('footer')
footer.className = 'app-footer'
footer.textContent = `ASCII SuperGenerator v${APP_VERSION} · GlimStone v${GLIMSTONE_VERSION}`
app.appendChild(footer)
