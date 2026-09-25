import { subscribeRainbow } from './design/appearance'
import { applyHueVars } from './controlWidgets'
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
  // Rainbow mode lives outside the store.
  subscribeRainbow(render)
  render()
}

function renderItem(item: BatchItem, isActive: boolean, index: number, store: Store): HTMLLIElement {
  const li = document.createElement('li')
  // The rainbow rule in tokens.css keys off the generic .glim-active marker.
  li.className = `queue-item queue-item--${item.status}${isActive ? ' queue-item--active glim-active' : ''}`

  // Each row owns one palette position. .glim-hue redefines --accent-soft,
  // which the active highlight reads, so it takes on the row's hue.
  if (applyHueVars(li, index)) {
    li.classList.add('glim-hue', 'glim-tint')
    // A solid dot as well, since the faint wash is easy to miss on some
    // displays. It paints from --item-hue, so disco walks it with the rest.
    const dot = document.createElement('span')
    dot.className = 'queue-item-dot'
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
