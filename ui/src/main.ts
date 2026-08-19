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
import { iconAppearance, iconBack } from './icons'

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

// A deliberate exception to GlimStone's own sidebar pattern (design-
// language.md, "The sidebar"): TrickWork is a single-workspace tool with
// exactly two destinations, not a multi-page dashboard, so a full left rail
// is overkill - the corner Settings badge is GlimStone's own documented
// lightweight alternative for exactly this case. Recorded in the vault
// project note per jdp's "note every exception" instruction, not just here.
const header = document.createElement('header')
header.className = 'app-header'
app.appendChild(header)

const brand = document.createElement('div')
brand.className = 'app-brand'
const brandName = document.createElement('span')
brandName.className = 'app-brand-name'
brandName.textContent = 'TrickWork'
const brandTagline = document.createElement('span')
brandTagline.className = 'app-brand-tagline'
brand.append(brandName, brandTagline)
header.appendChild(brand)
subscribeLocale(() => {
  brandTagline.textContent = t('app.tagline')
})
brandTagline.textContent = t('app.tagline')

const settingsBadge = document.createElement('button')
settingsBadge.type = 'button'
settingsBadge.className = 'settings-badge'
header.appendChild(settingsBadge)

const body = document.createElement('div')
body.className = 'app-body'
app.appendChild(body)

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
body.appendChild(convertView)

// --- Settings view: theming/language/global only, no preview at all. ---
const settingsView = document.createElement('div')
settingsView.className = 'settings-view'
const settingsCard = document.createElement('div')
settingsCard.className = 'glim-card glim-section settings-card'
settingsView.appendChild(settingsCard)
body.appendChild(settingsView)

let onSettings = false

function applyBadgeLabel(): void {
  const label = onSettings ? t('nav.backToConvert') : t('nav.settings')
  settingsBadge.setAttribute('aria-label', label)
  settingsBadge.title = label
  settingsBadge.innerHTML = onSettings ? iconBack() : iconAppearance()
}

function render(): void {
  convertView.style.display = onSettings ? 'none' : ''
  settingsView.style.display = onSettings ? '' : 'none'
  applyBadgeLabel()
}

settingsBadge.addEventListener('click', () => {
  onSettings = !onSettings
  render()
})
subscribeLocale(applyBadgeLabel)
render()

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
