import { applyCachedAppearance } from './design/appearance'
import { applyCachedTheme } from './design/theme'
import { enableSelectScrollForAll } from './design/selectScroll'
import { wireTooltips } from './design/tooltip'
import { applyCachedLocale, subscribeLocale, t } from './i18n'
import { createStore } from './state'
import { mountDropzone } from './dropzone'
import { mountCropPanel } from './cropPanel'
import { mountPreview } from './preview'
import { mountControls } from './controls'
import { mountTransformPanel } from './transformPanel'
import { mountFiltersPanel } from './filtersPanel'
import { mountQueue } from './queue'
import { mountExportPanel } from './exportPanel'
import { mountAppearanceSettings } from './appearanceSettings'
import { mountPresetsPanel } from './presetsPanel'
import { mountHistoryPanel } from './historyPanel'
import { makeReorderable } from './cardReorder'
import { brandLogo } from './brandLogo'
import { iconAppearance, iconBack } from './icons'
import { APP_VERSION, GLIMSTONE_VERSION } from './version'

const app = document.getElementById('app')
if (!app) {
  throw new Error('main.ts: #app root element missing from index.html')
}

applyCachedAppearance()
applyCachedTheme()
applyCachedLocale()
// Turns the native `title` of every icon-only button into the styled bubble.
wireTooltips()

const store = createStore()

function section(): HTMLDivElement {
  const el = document.createElement('div')
  el.className = 'glim-card glim-section'
  return el
}

// With only two destinations, a corner Settings badge stands in for
// GlimStone's sidebar, as GlimStone allows for a single-workspace app.
const header = document.createElement('header')
header.className = 'app-header'
app.appendChild(header)

// An empty column matching the badge on the right keeps the brand centred.
const headerSpacer = document.createElement('div')
header.appendChild(headerSpacer)

const brand = document.createElement('div')
brand.className = 'app-brand'
const brandLogoWrap = document.createElement('span')
brandLogoWrap.innerHTML = brandLogo()
const brandName = document.createElement('span')
brandName.className = 'app-brand-name'
brandName.textContent = 'TrickWork'
brand.append(brandLogoWrap, brandName)
header.appendChild(brand)

const settingsBadge = document.createElement('button')
settingsBadge.type = 'button'
settingsBadge.className = 'settings-badge'
header.appendChild(settingsBadge)

const body = document.createElement('div')
body.className = 'app-body'
app.appendChild(body)

// The Convert view: the preview and every card that affects the output.
const convertView = document.createElement('div')
convertView.className = 'convert-view'

const primary = document.createElement('section')
primary.className = 'app-primary'
const topRow = document.createElement('div')
topRow.className = 'app-primary-row'
const dropzoneCard = section()
const cropCard = section()
topRow.append(dropzoneCard, cropCard)
const previewCard = section()
primary.append(topRow, previewCard)

const secondary = document.createElement('section')
secondary.className = 'app-secondary'
const historyCard = section()
const adjustCard = section()
const transformCard = section()
const filtersCard = section()
const queueCard = section()
const exportCard = section()
// The default order, which a saved one replaces.
secondary.append(adjustCard, transformCard, filtersCard, historyCard, queueCard, exportCard)
makeReorderable(secondary, [
  { id: 'adjust', el: adjustCard },
  { id: 'transform', el: transformCard },
  { id: 'filters', el: filtersCard },
  { id: 'history', el: historyCard },
  { id: 'queue', el: queueCard },
  { id: 'export', el: exportCard },
])

convertView.append(primary, secondary)
body.appendChild(convertView)

// The Settings view: theming, language and presets, without a preview.
const settingsView = document.createElement('div')
settingsView.className = 'settings-view'
const settingsCard = document.createElement('div')
settingsCard.className = 'glim-card glim-section settings-card'
const presetsCard = document.createElement('div')
presetsCard.className = 'glim-card glim-section settings-card'
// The versions belong to the whole app, so they sit below the cards rather
// than inside the last one.
const versionLine = document.createElement('p')
versionLine.className = 'settings-version'
versionLine.textContent = `TrickWork v${APP_VERSION} · GlimStone v${GLIMSTONE_VERSION}`
settingsView.append(settingsCard, presetsCard, versionLine)
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

// Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y, or Cmd on macOS. A focused text field
// keeps its own native undo.
window.addEventListener('keydown', (event) => {
  const mod = event.ctrlKey || event.metaKey
  if (!mod) return
  const target = event.target as HTMLElement | null
  const isTextField =
    target instanceof HTMLInputElement
      ? target.type === 'text' || target.type === 'color'
      : target instanceof HTMLTextAreaElement
  if (isTextField) return

  const key = event.key.toLowerCase()
  if (key === 'z' && !event.shiftKey) {
    event.preventDefault()
    store.undo()
  } else if ((key === 'z' && event.shiftKey) || key === 'y') {
    event.preventDefault()
    store.redo()
  }
})

mountDropzone(dropzoneCard, store)
mountCropPanel(cropCard, store)
mountPreview(previewCard, store)
mountHistoryPanel(historyCard, store)
mountControls(adjustCard, store)
mountTransformPanel(transformCard, store)
mountFiltersPanel(filtersCard, store)
mountQueue(queueCard, store)
mountExportPanel(exportCard, store)
mountAppearanceSettings(settingsCard)
mountPresetsPanel(presetsCard, store)

// A language switch rebuilds the <select> elements, and enableSelectScroll is
// idempotent, so the whole body is scanned again.
enableSelectScrollForAll(body)
subscribeLocale(() => enableSelectScrollForAll(body))
