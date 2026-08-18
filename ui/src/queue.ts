import type { BatchItem, Store } from './state'

export function mountQueue(container: HTMLElement, store: Store): void {
  const list = document.createElement('ul')
  list.className = 'queue-list'
  container.appendChild(list)

  function render() {
    const state = store.getState()
    list.innerHTML = ''
    for (const item of state.items) {
      list.appendChild(renderItem(item, item.id === state.activeItemId, store))
    }
  }

  store.subscribe(render)
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
  status.textContent = item.status === 'error' ? `error: ${item.errorMessage ?? 'unknown'}` : item.status

  li.append(name, status)

  if (item.wasDownscaled) {
    const downscaledNote = document.createElement('span')
    downscaledNote.className = 'queue-item-downscaled'
    downscaledNote.title = 'This image exceeded the maximum working dimension and was automatically downscaled before conversion.'
    downscaledNote.textContent = 'downscaled'
    li.append(downscaledNote)
  }

  li.addEventListener('click', () => {
    if (item.status === 'converted' || item.status === 'exported') {
      store.setState({ activeItemId: item.id })
    }
  })
  return li
}
