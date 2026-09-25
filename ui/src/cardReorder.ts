// Lets the sidecards of the secondary column be rearranged by dragging the
// handle in each card's corner. The held card floats under the pointer, the
// others slide aside as it passes, and on release it slides into its gap
// (GlimStone, "Reordering by dragging"). The order is saved; without a valid
// saved order the caller's default order stays.

import { iconGrip } from './icons'
import { subscribeLocale, t } from './i18n'

const STORAGE_KEY = 'trickwork-sidecard-order'
// On a touch screen a drag that starts on contact fights the page's scroll, so
// a touch has to be held this long first.
const LONG_PRESS_MS = 400

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

function settleMs(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--drag-settle-dur').trim()
  const n = parseFloat(raw)
  if (!Number.isFinite(n)) return 0
  return raw.endsWith('ms') ? n : n * 1000
}

/** Applies a saved order (if any) and wires a drag handle onto each card. */
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

  const handles: HTMLButtonElement[] = []
  for (const { id, el } of cards) {
    el.dataset.cardId = id
    const handle = document.createElement('button')
    handle.type = 'button'
    handle.className = 'card-drag-handle'
    handle.innerHTML = iconGrip()
    el.appendChild(handle)
    handles.push(handle)
    wireHandle(container, el, handle)
  }

  function applyLabels(): void {
    for (const handle of handles) {
      handle.setAttribute('aria-label', t('cards.reorderHandle'))
      handle.setAttribute('data-tip', t('cards.reorderHandle'))
    }
  }
  applyLabels()
  subscribeLocale(applyLabels)
}

function wireHandle(container: HTMLElement, card: HTMLElement, handle: HTMLButtonElement): void {
  let pressTimer: number | undefined
  let drag: Drag | null = null
  // A drag never ends in a click, so the one that follows it is swallowed.
  let swallowClick = false

  handle.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || drag) return
    const startY = event.clientY
    const arm = (): void => {
      drag = startDrag(container, card, startY)
      handle.setPointerCapture(event.pointerId)
    }
    if (event.pointerType === 'touch') {
      pressTimer = window.setTimeout(arm, LONG_PRESS_MS)
    } else {
      event.preventDefault()
      arm()
    }
  })

  handle.addEventListener('pointermove', (event) => {
    if (drag) drag.move(event.clientY)
  })

  const finish = (commit: boolean): void => {
    window.clearTimeout(pressTimer)
    if (!drag) return
    if (drag.moved) swallowClick = true
    drag.end(commit)
    drag = null
  }
  handle.addEventListener('pointerup', () => finish(true))
  // A cancelled pointer is an Escape, not a release.
  handle.addEventListener('pointercancel', () => finish(false))
  handle.addEventListener('lostpointercapture', () => finish(true))
  window.addEventListener('keydown', (event) => {
    if (drag && event.key === 'Escape') finish(false)
  })

  handle.addEventListener(
    'click',
    (event) => {
      if (swallowClick && event.detail > 0) {
        event.preventDefault()
        event.stopPropagation()
      }
      swallowClick = false
    },
    true,
  )

  // Arrow keys move the card one place, for somebody without a pointer.
  handle.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
    event.preventDefault()
    const sibling = event.key === 'ArrowUp' ? card.previousElementSibling : card.nextElementSibling
    if (!sibling) return
    container.insertBefore(card, event.key === 'ArrowUp' ? sibling : sibling.nextElementSibling)
    persistOrder(container)
    handle.focus()
  })
}

interface Drag {
  moved: boolean
  move(clientY: number): void
  end(commit: boolean): void
}

function startDrag(container: HTMLElement, card: HTMLElement, startY: number): Drag {
  const items = Array.from(container.children) as HTMLElement[]
  const from = items.indexOf(card)
  // Measured boxes rather than one assumed height, since the cards differ.
  const boxes = items.map((el) => el.getBoundingClientRect())
  const tops = boxes.map((b) => b.top)
  const heights = boxes.map((b) => b.height)
  const gap = parseFloat(getComputedStyle(container).rowGap) || 0
  const own = heights[from] ?? 0
  const step = own + gap
  const first = tops[0] ?? 0
  const lastBottom = (tops[tops.length - 1] ?? 0) + (heights[heights.length - 1] ?? 0)
  const origin = tops[from] ?? 0

  let target = from
  let moved = false
  // Every card wiggles while one is held: the list is being reordered.
  container.classList.add('glim-drag-armed')
  card.classList.add('glim-drag-lift')
  for (const el of items) if (el !== card) el.classList.add('glim-drag-shift')

  function shiftOthers(): void {
    items.forEach((el, i) => {
      if (el === card) return
      let dy = 0
      if (target > from && i > from && i <= target) dy = -step
      if (target < from && i >= target && i < from) dy = step
      el.style.translate = dy ? `0 ${dy}px` : ''
    })
  }

  // Where the held card comes to rest in the slot it would land in.
  function restingOffset(): number {
    if (target > from) return (tops[target] ?? 0) + (heights[target] ?? 0) - own - origin
    return (tops[target] ?? 0) - origin
  }

  function cleanUp(): void {
    container.classList.remove('glim-drag-armed')
    for (const el of items) {
      el.classList.remove('glim-drag-lift', 'glim-drag-shift', 'glim-drag-settle')
      el.style.translate = ''
    }
  }

  return {
    get moved() {
      return moved
    },
    move(clientY: number): void {
      // It stays inside the area the cards cover, so a drag never grows a
      // scrollbar.
      const dy = Math.min(lastBottom - own - origin, Math.max(first - origin, clientY - startY))
      if (Math.abs(dy) > 2) moved = true
      card.style.translate = `0 ${dy}px`
      const centre = origin + own / 2 + dy
      let next = 0
      items.forEach((el, i) => {
        if (el !== card && (tops[i] ?? 0) + (heights[i] ?? 0) / 2 < centre) next++
      })
      if (next !== target) {
        target = next
        shiftOthers()
      }
    },
    end(commit: boolean): void {
      if (!commit) target = from
      shiftOthers()
      card.classList.remove('glim-drag-lift')
      card.classList.add('glim-drag-settle')
      card.style.translate = `0 ${restingOffset()}px`
      window.setTimeout(() => {
        cleanUp()
        // A drop where it started is not a change and writes nothing.
        if (target === from) return
        const others = items.filter((el) => el !== card)
        const before = others[target]
        container.insertBefore(card, before ?? null)
        persistOrder(container)
      }, settleMs())
    },
  }
}
