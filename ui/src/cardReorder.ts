// Lets the sidecards of the secondary column be rearranged with native HTML5
// drag and drop on a handle in each card's corner. The order is saved; without
// a valid saved order the caller's default order stays.

import { iconGrip } from './icons'
import { t } from './i18n'

const STORAGE_KEY = 'trickwork-sidecard-order'

interface Card {
  id: string
  el: HTMLElement
}

function readOrder(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.every((v) => typeof v === 'string') ? (parsed as string[]) : null
  } catch {
    return null
  }
}

function persistOrder(container: HTMLElement): void {
  try {
    const order = Array.from(container.children).map((el) => (el as HTMLElement).dataset.cardId ?? '')
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch {
    // A browser with storage disabled just never remembers the arrangement.
  }
}

/** Applies a saved order (if any) and wires drag handles onto each card. */
export function makeReorderable(container: HTMLElement, cards: Card[]): void {
  const byId = new Map(cards.map((c) => [c.id, c.el]))
  const saved = readOrder()
  if (saved) {
    for (const id of saved) {
      const el = byId.get(id)
      if (el) container.appendChild(el)
    }
    // Cards added since the order was saved go last, in the default order.
    for (const { id, el } of cards) {
      if (!saved.includes(id)) container.appendChild(el)
    }
  }

  let draggedEl: HTMLElement | null = null

  for (const { id, el } of cards) {
    el.dataset.cardId = id

    const handle = document.createElement('button')
    handle.type = 'button'
    handle.className = 'card-drag-handle'
    handle.innerHTML = iconGrip()
    handle.draggable = true
    handle.setAttribute('aria-label', t('cards.reorderHandle'))
    handle.setAttribute('data-tip', t('cards.reorderHandle'))
    el.appendChild(handle)

    handle.addEventListener('dragstart', (event) => {
      draggedEl = el
      el.classList.add('card-dragging')
      event.dataTransfer?.setData('text/plain', id)
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
    })
    handle.addEventListener('dragend', () => {
      el.classList.remove('card-dragging')
      draggedEl = null
      persistOrder(container)
    })

    // The whole card is the drop target, though only the handle starts a
    // drag, and cards move on every dragover so they slide out of the way.
    el.addEventListener('dragover', (event) => {
      if (!draggedEl || draggedEl === el) return
      event.preventDefault()
      const rect = el.getBoundingClientRect()
      const before = event.clientY - rect.top < rect.height / 2
      container.insertBefore(draggedEl, before ? el : el.nextSibling)
    })
    el.addEventListener('drop', (event) => {
      event.preventDefault()
    })
  }
}
