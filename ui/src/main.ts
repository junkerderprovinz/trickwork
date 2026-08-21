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

// GlimStone's boot-time entry point (its actual current export - not
// applyAppearance(), which doesn't exist upstream). Theme has no GlimStone
// export at all (see design/theme.ts) so it's applied separately, and
// locale is a third, independent boot-time cache read (see i18n.ts).
applyCachedAppearance()
applyCachedTheme()
applyCachedLocale()
// The shared tooltip/info-bubble engine (design/tooltip.ts) - one call at
// boot upgrades every existing icon-only button's native `title` into the
// styled bubble automatically, no per-component rewiring needed.
wireTooltips()

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

// The tagline that used to sit under the name is gone (jdp: "der untertitel
// der jetzt drinnen steht entfernen") - the logo now carries the brand
// identity instead, sitting beside the name rather than a line below it.
const brand = document.createElement('div')
brand.className = 'app-brand'
const brandLogoWrap = document.createElement('span')
brandLogoWrap.innerHTML = brandLogo()
const brandName = document.createElement('span')
brandName.className = 'app-brand-name'
brandName.textContent = 'TrickWork'
brand.append(brandLogoWrap, brandName)
header.appendChild(brand)

// Undo/redo used to live here too, but moved into its own card at the top
// of the secondary column (jdp: "in einer seitlichen Card") - see
// historyPanel.ts. The header now holds just the brand and the Settings
// entry point.
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
// Default order: History moved down to sit directly above Queue (jdp: "die
// card soll weiter unten sein, über der warteschlange card") - it used to
// sit first since it applies across every card below it, but that reasoning
// didn't need it to be the very FIRST card specifically. makeReorderable()
// below lets a saved order override this default entirely.
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

// --- Settings view: theming/language/global only, no preview at all. ---
const settingsView = document.createElement('div')
settingsView.className = 'settings-view'
const settingsCard = document.createElement('div')
settingsCard.className = 'glim-card glim-section settings-card'
const presetsCard = document.createElement('div')
presetsCard.className = 'glim-card glim-section settings-card'
// Outside both cards, at the very bottom of the Settings destination itself
// - GlimStone's own refined rule (design-language.md, "The sidebar"):
// version numbers belong to the whole app, not to whichever card happens
// to be last, so they don't live inside one.
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

// Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y (and the Cmd equivalents on macOS). Skipped
// while a text field has focus (the charset add-characters input, the
// Settings accent hex field) so the browser's own native text-undo inside
// that field isn't hijacked by the app-wide history instead.
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

// Boot-time pass, then re-run after any locale-driven rebuild (every
// mountXxx module above rebuilds its own <select> elements on a language
// switch, and enableSelectScroll is idempotent, so scanning the whole body
// again costs nothing and never double-attaches).
enableSelectScrollForAll(body)
subscribeLocale(() => enableSelectScrollForAll(body))
