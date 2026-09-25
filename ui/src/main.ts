import '@fontsource-variable/noto-sans'
import '@fontsource-variable/noto-sans-arabic'
import '@fontsource-variable/noto-sans-hebrew'
import '@fontsource-variable/noto-sans-thai'
import { applyCachedAppearance, applyMotion, hueVars } from './design/appearance'
import { applyStoredLabelModes } from './design/controls'
import { applyDisco } from './design/disco'
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
import { mountAboutPanel } from './aboutPanel'
import { mountAppPanel } from './appPanel'
import { storedDisco, storedMotion } from './looks'
import { mountPresetsPanel } from './presetsPanel'
import { mountHistoryPanel } from './historyPanel'
import { makeReorderable } from './cardReorder'
import { brandLogo } from './brandLogo'
import { iconAppearance, iconBack } from './icons'

const app = document.getElementById('app')
if (!app) {
  throw new Error('main.ts: #app root element missing from index.html')
}

applyCachedAppearance()
applyCachedTheme()
applyMotion(storedMotion())
applyStoredLabelModes()
applyDisco(storedDisco())
applyCachedLocale()
// Turns the native `title` of every icon-only button into the styled bubble.
wireTooltips()

const store = createStore()

// Each card owns one rainbow position for its whole subtree, fixed to the card
// rather than to where it stands, so reordering the sidecards keeps their
// colours.
function section(hue: number, extra = ''): HTMLDivElement {
  const el = document.createElement('div')
  el.className = `glim-card glim-section glim-notch-card glim-hue ${extra}`.trim()
  for (const [prop, value] of Object.entries(hueVars(hue))) el.style.setProperty(prop, value)
  return el
}

const body = document.createElement('div')
body.className = 'app-body'
app.appendChild(body)

// With only two destinations, the brand card at the top of the side column
// carries the Settings badge in place of GlimStone's sidebar, as GlimStone
// allows for a single-workspace app.
const brandCard = document.createElement('header')
brandCard.className = 'glim-card brand-card'

// An empty column matching the badge on the right keeps the brand centred.
const brandSpacer = document.createElement('div')
brandCard.appendChild(brandSpacer)

const brand = document.createElement('div')
brand.className = 'app-brand'
const brandLogoWrap = document.createElement('span')
brandLogoWrap.innerHTML = brandLogo()
const brandName = document.createElement('span')
brandName.className = 'app-brand-name'
brandName.textContent = 'TrickWork'
brand.append(brandLogoWrap, brandName)
brandCard.appendChild(brand)

const settingsBadge = document.createElement('button')
settingsBadge.type = 'button'
settingsBadge.className = 'settings-badge'
brandCard.appendChild(settingsBadge)

// The main area shows the preview and its source cards, or the Settings page.
const main = document.createElement('div')
main.className = 'app-main'

const primary = document.createElement('section')
primary.className = 'app-primary'
const topRow = document.createElement('div')
topRow.className = 'app-primary-row'
const dropzoneCard = section(0)
const cropCard = section(1)
topRow.append(dropzoneCard, cropCard)
const previewCard = section(2)
primary.append(topRow, previewCard)

const secondary = document.createElement('section')
secondary.className = 'app-secondary'
const historyCard = section(6)
const adjustCard = section(3)
const transformCard = section(4)
const filtersCard = section(5)
const queueCard = section(7)
const exportCard = section(0)
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

// The Settings view: theming, language and presets, without a preview.
const settingsView = document.createElement('div')
settingsView.className = 'settings-view'
const settingsCard = section(0, 'settings-card')
const presetsCard = section(1, 'settings-card')
const appCard = section(2, 'settings-card')
const aboutCard = section(3, 'settings-card')
settingsView.append(settingsCard, presetsCard, appCard, aboutCard)
main.append(primary, settingsView)
body.append(brandCard, main, secondary)

let onSettings = false

function applyBadgeLabel(): void {
  const label = onSettings ? t('nav.backToConvert') : t('nav.settings')
  settingsBadge.setAttribute('aria-label', label)
  settingsBadge.setAttribute('data-tip', label)
  settingsBadge.innerHTML = onSettings ? iconBack() : iconAppearance()
}

let leaveSettings = (): void => {}

function render(): void {
  primary.style.display = onSettings ? 'none' : ''
  secondary.style.display = onSettings ? 'none' : ''
  settingsView.style.display = onSettings ? '' : 'none'
  applyBadgeLabel()
  // The page entrance runs on every arrival, so it is restarted by taking the
  // class off and forcing a style pass before putting it back.
  for (const shown of onSettings ? [settingsView] : [primary, secondary]) {
    shown.classList.remove('glim-page-enter')
    void shown.offsetWidth
    shown.classList.add('glim-page-enter')
  }
}

settingsBadge.addEventListener('click', () => {
  if (onSettings) leaveSettings()
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
leaveSettings = mountAppearanceSettings(settingsCard)
mountPresetsPanel(presetsCard, store)
mountAppPanel(appCard)
mountAboutPanel(aboutCard)

// Every card heading is its section badge, and in the reactive rainbow mode it
// lights up while the pointer is anywhere in its card.
for (const heading of app.querySelectorAll('.glim-section > .glim-eyebrow, .glim-section > .eyebrow-row')) {
  heading.classList.add('glim-hue', 'glim-notch-hue')
}

// A language switch rebuilds the <select> elements, and enableSelectScroll is
// idempotent, so the whole body is scanned again.
enableSelectScrollForAll(body)
subscribeLocale(() => enableSelectScrollForAll(body))
