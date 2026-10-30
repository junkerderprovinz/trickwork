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
import { mountHelpCard, mountVersionCard } from './infoPanel'
import { mountAppPanel } from './appPanel'
import { storedDisco, storedMotion } from './looks'
import { mountPresetsPanel } from './presetsPanel'
import { mountHistoryPanel } from './historyPanel'
import { listenForUpdates, mountUpdatePanel } from './updatePanel'
import { drawsOwnFrame, isDesktop } from './wails'
import { mountWindowBar } from './windowBar'
import { makeReorderable } from './cardReorder'
import { brandLogo } from './brandLogo'
import { iconApp, iconSettings, iconBack, iconGeneral, iconInfoTab, iconLook } from './icons'
import { glimButton, segmentedRow, updateButton } from './controlWidgets'
import { replay } from './motion'

const app = document.getElementById('app')
if (!app) {
  throw new Error('main.ts: #app root element missing from index.html')
}

applyCachedAppearance()
applyCachedTheme()
applyMotion(storedMotion())
applyStoredLabelModes()
applyDisco(storedDisco())
void applyCachedLocale()
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
body.className = 'app-body glim-shell'
app.appendChild(body)
if (drawsOwnFrame()) mountWindowBar()

// With only two destinations, the brand bar over the main area carries the
// Settings button in place of GlimStone's sidebar, as GlimStone allows for a
// single-workspace app.
const brandBar = document.createElement('header')
brandBar.className = 'glim-card brand-bar'
brandBar.innerHTML = brandLogo()

const brandName = document.createElement('span')
brandName.className = 'app-brand-name'
brandName.textContent = 'TrickWork'
const brandClaim = document.createElement('span')
brandClaim.className = 'app-brand-claim'
brandBar.append(brandName, brandClaim)

const settingsButton = glimButton({ label: t('nav.settings'), glyph: iconSettings(), tone: 'neutral', stage: 'none' })
settingsButton.classList.add('settings-button')
brandBar.appendChild(settingsButton)

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
type SettingsTab = 'general' | 'look' | 'app' | 'info'
const settingsView = document.createElement('div')
settingsView.className = 'settings-view'
const tabSlot = document.createElement('div')
tabSlot.className = 'settings-tabs'
const settingsCards = document.createElement('div')
settingsCards.className = 'settings-cards'
// Only the desktop app updates itself, so only it has the Updates card.
const desktop = isDesktop()
const presetsCard = section(0, 'settings-card')
const updateCard = section(1, 'settings-card')
const generalCards = desktop ? [presetsCard, updateCard] : [presetsCard]
const lookCard = section(0, 'settings-card')
const appCard = section(0, 'settings-card')
// The Info tab is GlimStone's Info tile, last in Settings: Version, Help and
// About, in that order.
const versionCard = section(0, 'settings-card')
const helpCard = section(1, 'settings-card')
const aboutCard = section(2, 'settings-card')
const infoCards = [versionCard, helpCard, aboutCard]
const tabCards: Record<SettingsTab, HTMLElement[]> = {
  general: generalCards,
  look: [lookCard],
  app: [appCard],
  info: infoCards,
}
settingsCards.append(...generalCards, lookCard, appCard, ...infoCards)
settingsView.append(tabSlot, settingsCards)
main.append(primary, settingsView)
body.append(brandBar, main, secondary)

let onSettings = false
let settingsTab: SettingsTab = 'general'

function applyClaim(): void {
  brandClaim.textContent = t('brand.claim')
}

function applyButtonLabel(): void {
  updateButton(settingsButton, {
    label: onSettings ? t('nav.backToConvert') : t('nav.settings'),
    glyph: onSettings ? iconBack() : iconSettings(),
  })
}

let leaveLook = (): void => {}

const TAB_ORDER: SettingsTab[] = ['general', 'look', 'app', 'info']

function showTab(): void {
  for (const [tab, cards] of Object.entries(tabCards)) {
    cards.forEach((card, i) => {
      const shown = tab === settingsTab
      card.style.display = shown ? '' : 'none'
      if (!shown) return
      card.style.setProperty('--row-i', String(i))
      replay(card, 'glim-stagger-row')
    })
  }
}

function buildTabs(): void {
  const tabs = segmentedRow<SettingsTab>({
    ariaLabel: t('settings.section'),
    choices: [
      { value: 'general', label: t('settings.general'), glyph: iconGeneral() },
      { value: 'look', label: t('settings.look'), glyph: iconLook() },
      { value: 'app', label: t('settings.app'), glyph: iconApp() },
      { value: 'info', label: t('settings.info'), glyph: iconInfoTab() },
    ],
    value: settingsTab,
    scale: 'big',
    variant: 'chip',
    rainbowBaseIndex: HUE_OFFSET.tabs,
    onChange: (tab) => {
      if (settingsTab === 'look') leaveLook()
      // The new tab slides in from the side it lies on.
      const toward = TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(settingsTab) ? 1 : -1
      settingsCards.style.setProperty('--tab-dir', String(toward))
      settingsTab = tab
      showTab()
      replay(settingsCards, 'glim-tab-slide')
    },
  })
  tabSlot.replaceChildren(tabs)
}

function render(): void {
  primary.style.display = onSettings ? 'none' : ''
  secondary.style.display = onSettings ? 'none' : ''
  settingsView.style.display = onSettings ? '' : 'none'
  body.classList.toggle('app-body--settings', onSettings)
  applyButtonLabel()
  // The page entrance runs on every arrival.
  for (const shown of onSettings ? [settingsView] : [primary, secondary]) replay(shown, 'glim-page-enter')
  if (onSettings) showTab()
}

settingsButton.addEventListener('click', () => {
  if (onSettings && settingsTab === 'look') leaveLook()
  onSettings = !onSettings
  render()
})
subscribeLocale(applyButtonLabel)
subscribeLocale(applyClaim)
applyClaim()
subscribeLocale(buildTabs)
buildTabs()
showTab()
render()
// Two frames after the first paint, so the first radii never animate and every
// later change of shape does.
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('glim-shape-transitions')))

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
mountVersionCard(versionCard)
mountHelpCard(helpCard, store)
mountAboutPanel(aboutCard)
leaveLook = mountAppearanceSettings(lookCard)
mountAppPanel(appCard)
if (desktop) {
  mountUpdatePanel(updateCard)
  listenForUpdates()
}

// Every card heading is its section badge, and in the reactive rainbow mode it
// lights up while the pointer is anywhere in its card.
for (const heading of app.querySelectorAll('.glim-section > .glim-eyebrow, .glim-section > .eyebrow-row')) {
  heading.classList.add('glim-hue', 'glim-notch-hue')
}

// A language switch rebuilds the <select> elements, and enableSelectScroll is
// idempotent, so the whole body is scanned again.
enableSelectScrollForAll(body)
subscribeLocale(() => enableSelectScrollForAll(body))
