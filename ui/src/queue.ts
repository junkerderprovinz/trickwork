import { hueVars, rainbowColor, subscribeRainbow } from './design/appearance'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import type { BatchItem, BatchItemStatus, Store } from './state'

const STATUS_KEYS: Record<BatchItemStatus, TranslationKey> = {
  pending: 'queue.statusPending',
  converting: 'queue.statusConverting',
  converted: 'queue.statusConverted',
  exported: 'queue.statusExported',
  error: 'queue.statusError',
}

export function mountQueue(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const empty = document.createElement('p')
  empty.className = 'queue-empty'
  container.appendChild(empty)

  const list = document.createElement('ul')
  list.className = 'queue-list'
  container.appendChild(list)

  function render() {
    eyebrow.textContent = t('queue.eyebrow')
    empty.textContent = t('queue.empty')
    const state = store.getState()
    empty.style.display = state.items.length === 0 ? '' : 'none'
    list.innerHTML = ''
    state.items.forEach((item, index) => {
      list.appendChild(renderItem(item, item.id === state.activeItemId, index, store))
    })
  }

  store.subscribe(render)
  subscribeLocale(render)
  // Rainbow is a document-level setting living outside `store` (see
  // design/appearance.ts) - toggling it on/off in Settings has to re-render
  // this list too, or the queue would only pick up the palette on its next
  // unrelated re-render.
  subscribeRainbow(render)
  render()
}

function renderItem(item: BatchItem, isActive: boolean, index: number, store: Store): HTMLLIElement {
  const li = document.createElement('li')
  // .glim-active alongside the app's own queue-item--active - GlimStone's
  // shared rainbow composition rule (tokens.css's `.glim-tint.glim-active`)
  // keys off the GENERIC marker, not an app-specific one; without it, the
  // active row silently fell back to the same flat wash as every other row
  // (a real bug found this session - see design-language.md's rainbow
  // section, "the active row needs its own class").
  li.className = `queue-item queue-item--${item.status}${isActive ? ' queue-item--active glim-active' : ''}`

  // Each row owns one palette position - the canonical rainbow use case
  // (design-language.md: "a download row owns a colour"). rainbowColor()
  // already returns undefined when the mode is off, so the row falls back
  // to the single accent with no extra branching here. The active item's
  // OWN highlight (queue-item--active, below) already reads var(--accent-
  // soft) - .glim-hue redefining that token is what makes it pick up this
  // row's own hue automatically, no separate rule needed.
  const hue = rainbowColor(index)
  if (hue) {
    li.classList.add('glim-hue', 'glim-tint')
    for (const [prop, value] of Object.entries(hueVars(hue))) {
      li.style.setProperty(prop, value)
    }
  }

  // A solid dot, not just the background wash (jdp: "der Regenbogen-Modus
  // funktioniert nicht!!" - the wash is real and verified correct, but a
  // ~16-22% alpha tint over an already-similar surface colour is easy to
  // miss entirely depending on the display; a fully-opaque swatch can't be
  // mistaken for "nothing changed" the way a subtle wash can).
  if (hue) {
    const dot = document.createElement('span')
    dot.className = 'queue-item-dot'
    dot.style.backgroundColor = hue
    li.appendChild(dot)
  }

  const name = document.createElement('span')
  name.className = 'queue-item-name'
  name.textContent = item.file.name

  const status = document.createElement('span')
  status.className = 'queue-item-status'
  status.textContent =
    item.status === 'error'
      ? t('queue.errorPrefix', { message: item.errorMessage ?? t('queue.errorUnknown') })
      : t(STATUS_KEYS[item.status])

  li.append(name, status)

  if (item.wasDownscaled) {
    const downscaledNote = document.createElement('span')
    downscaledNote.className = 'queue-item-downscaled'
    downscaledNote.title = t('queue.downscaledTitle')
    downscaledNote.textContent = t('queue.downscaledLabel')
    li.append(downscaledNote)
  }

  const selectable = item.status === 'converted' || item.status === 'exported'
  if (selectable) {
    li.tabIndex = 0
    li.setAttribute('role', 'button')
    li.setAttribute('aria-label', t('queue.previewAriaLabel', { name: item.file.name }))
  }

  const select = () => {
    if (selectable) store.setState({ activeItemId: item.id })
  }
  li.addEventListener('click', select)
  li.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      select()
    }
  })
  return li
}
