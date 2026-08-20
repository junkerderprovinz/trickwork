// ui/src/cardReorder.ts
//
// Lets the secondary column's sidecards (History/Adjust/Transform/Filters/
// Queue/Export) be rearranged by dragging a small handle in each card's
// corner (jdp: "die cards sollen auch per drag and drop nach wunsch
// anordenbar sein"). Native HTML5 drag-and-drop, not a pointer-based
// reimplementation - the app has no other draggable-list precedent to
// match, and this is the standard mechanism for "pick this card up, drop
// it somewhere else" on desktop. Persisted order survives a reload; a
// missing/invalid saved order falls back to the DEFAULT order the caller
// passed in (main.ts's own History-above-Queue arrangement), and any card
// the saved order doesn't mention (a future new sidecard) is appended
// after the ones it does, in the caller's own default order.

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
    // Cards the saved order doesn't know about yet (added after the user
    // last rearranged) land at the end, in the caller's own default order.
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

    // dragover/drop live on the CARD (not the handle) - the whole card is
    // the drop target a user aims for, even though only its handle can
    // start a drag. Reorders live, on every hover, rather than waiting for
    // a separate drop event - the common "cards slide out of the way as
    // you drag" pattern.
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
