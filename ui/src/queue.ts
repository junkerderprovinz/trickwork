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
  const empty = document.createElement('p')
  empty.className = 'queue-empty'
  container.appendChild(empty)

  const list = document.createElement('ul')
  list.className = 'queue-list'
  container.appendChild(list)

  function render() {
    empty.textContent = t('queue.empty')
    const state = store.getState()
    empty.style.display = state.items.length === 0 ? '' : 'none'
    list.innerHTML = ''
    for (const item of state.items) {
      list.appendChild(renderItem(item, item.id === state.activeItemId, store))
    }
  }

  store.subscribe(render)
  subscribeLocale(render)
  render()
}

function renderItem(item: BatchItem, isActive: boolean, store: Store): HTMLLIElement {
  const li = document.createElement('li')
  li.className = `queue-item queue-item--${item.status}${isActive ? ' queue-item--active' : ''}`

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
