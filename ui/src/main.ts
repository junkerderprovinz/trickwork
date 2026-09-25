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
import { HUE_OFFSET, mountAppearanceSettings } from './appearanceSettings'
import { mountAboutPanel } from './aboutPanel'
import { mountAppPanel } from './appPanel'
import { storedDisco, storedMotion } from './looks'
import { mountPresetsPanel } from './presetsPanel'
import { mountHistoryPanel } from './historyPanel'
import { makeReorderable } from './cardReorder'
import { brandLogo } from './brandLogo'
import { iconApp, iconAppearance, iconBack, iconGeneral, iconLook } from './icons'
import { glimButton, segmentedRow, updateButton } from './controlWidgets'

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
// carries the Settings button in place of GlimStone's sidebar, as GlimStone
// allows for a single-workspace app.
const brandCard = document.createElement('header')
brandCard.className = 'glim-card brand-card'

const brand = document.createElement('div')
brand.className = 'app-brand'
brand.innerHTML = brandLogo()
const brandName = document.createElement('span')
brandName.className = 'app-brand-name'
brandName.textContent = 'TrickWork'
brand.append(brandName)
brandCard.appendChild(brand)

const settingsButton = glimButton({ label: t('nav.settings'), glyph: iconAppearance(), tone: 'neutral', stage: 'none' })
settingsButton.classList.add('settings-button')
brandCard.appendChild(settingsButton)

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

// The Settings view, without a preview: a strip of tabs over the cards of the
// open one. Each tab's cards count their rainbow positions from the start.
type SettingsTab = 'general' | 'look' | 'app'
const settingsView = document.createElement('div')
settingsView.className = 'settings-view'
const tabSlot = document.createElement('div')
tabSlot.className = 'settings-tabs'
const settingsCards = document.createElement('div')
settingsCards.className = 'settings-cards'
const presetsCard = section(0, 'settings-card')
const aboutCard = section(1, 'settings-card')
const lookCard = section(0, 'settings-card')
const appCard = section(0, 'settings-card')
const tabCards: Record<SettingsTab, HTMLElement[]> = {
  general: [presetsCard, aboutCard],
  look: [lookCard],
  app: [appCard],
}
settingsCards.append(presetsCard, aboutCard, lookCard, appCard)
settingsView.append(tabSlot, settingsCards)
main.append(primary, settingsView)
body.append(brandCard, main, secondary)

let onSettings = false
let settingsTab: SettingsTab = 'general'

function applyButtonLabel(): void {
  updateButton(settingsButton, {
    label: onSettings ? t('nav.backToConvert') : t('nav.settings'),
    glyph: onSettings ? iconBack() : iconAppearance(),
  })
}

let leaveLook = (): void => {}

// The page entrance runs on every arrival, so it is restarted by taking the
// class off and forcing a style pass before putting it back.
function enter(el: HTMLElement): void {
  el.classList.remove('glim-page-enter')
  void el.offsetWidth
  el.classList.add('glim-page-enter')
}

function showTab(): void {
  for (const [tab, cards] of Object.entries(tabCards)) {
    for (const card of cards) card.style.display = tab === settingsTab ? '' : 'none'
  }
}

function buildTabs(): void {
  const tabs = segmentedRow<SettingsTab>({
    ariaLabel: t('settings.section'),
    choices: [
      { value: 'general', label: t('settings.general'), glyph: iconGeneral() },
      { value: 'look', label: t('settings.look'), glyph: iconLook() },
      { value: 'app', label: t('settings.app'), glyph: iconApp() },
    ],
    value: settingsTab,
    scale: 'big',
    variant: 'chip',
    rainbowBaseIndex: HUE_OFFSET.tabs,
    onChange: (tab) => {
      if (settingsTab === 'look') leaveLook()
      settingsTab = tab
      showTab()
      enter(settingsCards)
    },
  })
  tabSlot.replaceChildren(tabs)
}

function render(): void {
  primary.style.display = onSettings ? 'none' : ''
  secondary.style.display = onSettings ? 'none' : ''
  settingsView.style.display = onSettings ? '' : 'none'
  body.classList.toggle('app-body--settings', onSettings)
  // On Settings the button leaves the brand card for the top right corner.
  if (onSettings) body.appendChild(settingsButton)
  else brandCard.appendChild(settingsButton)
  applyButtonLabel()
  for (const shown of onSettings ? [settingsView] : [primary, secondary]) enter(shown)
}

settingsButton.addEventListener('click', () => {
  if (onSettings && settingsTab === 'look') leaveLook()
  onSettings = !onSettings
  render()
})
subscribeLocale(applyButtonLabel)
subscribeLocale(buildTabs)
buildTabs()
showTab()
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
mountPresetsPanel(presetsCard, store)
mountAboutPanel(aboutCard)
leaveLook = mountAppearanceSettings(lookCard)
mountAppPanel(appCard)

// Every card heading is its section badge, and in the reactive rainbow mode it
// lights up while the pointer is anywhere in its card.
for (const heading of app.querySelectorAll('.glim-section > .glim-eyebrow, .glim-section > .eyebrow-row')) {
  heading.classList.add('glim-hue', 'glim-notch-hue')
}

// A language switch rebuilds the <select> elements, and enableSelectScroll is
// idempotent, so the whole body is scanned again.
enableSelectScrollForAll(body)
subscribeLocale(() => enableSelectScrollForAll(body))
