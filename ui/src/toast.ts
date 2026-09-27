// GlimStone's toast without a framework: a stack in the bottom corner at the
// end of the line, each card gone after four seconds. Pointer or focus on a
// card holds its clock and keeps the time left, so a card under a wandering
// pointer still runs out.

import { iconClear } from './icons'
import { t } from './i18n'

const DURATION_MS = 4000

export type ToastSeverity = 'success' | 'fail'

// Filled shapes with the mark cut out in the card's own surface.
const GLYPHS: Record<ToastSeverity, string> = {
  success:
    '<circle cx="8" cy="8" r="6.4" /><rect x="4.5" y="8.4" width="3.5" height="1.5" rx="0.75" fill="var(--carbon-surface)" transform="rotate(45 6.25 9.15)" /><rect x="5.815" y="7.25" width="6.27" height="1.5" rx="0.75" fill="var(--carbon-surface)" transform="rotate(-50.2 8.95 8)" />',
  fail: '<circle cx="8" cy="8" r="6.4" /><rect x="7.3" y="4.6" width="1.4" height="4" rx="0.7" fill="var(--carbon-surface)" /><circle cx="8" cy="10.9" r="0.85" fill="var(--carbon-surface)" />',
}

let viewport: HTMLDivElement | null = null

function stack(): HTMLDivElement {
  if (!viewport) {
    viewport = document.createElement('div')
    viewport.className = 'toast-viewport'
    document.body.appendChild(viewport)
  }
  return viewport
}

export function showToast(message: string, severity: ToastSeverity = 'success'): void {
  const card = document.createElement('div')
  card.className = `glim-toast toast-card toast-card--${severity}`
  // A failure interrupts a screen reader, news waits its turn.
  card.setAttribute('role', severity === 'fail' ? 'alert' : 'status')

  const glyph = `<svg class="toast-glyph" width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">${GLYPHS[severity]}</svg>`
  const text = document.createElement('p')
  text.className = 'toast-text'
  text.textContent = message
  const close = document.createElement('button')
  close.type = 'button'
  close.className = 'toast-close'
  close.setAttribute('aria-label', t('common.close'))
  close.innerHTML = iconClear()
  card.insertAdjacentHTML('afterbegin', glyph)
  card.append(text, close)

  let left = DURATION_MS
  let startedAt = 0
  let timer: number | undefined
  let hovered = false
  let focused = false

  function dismiss(): void {
    window.clearTimeout(timer)
    card.remove()
  }
  function engage(): void {
    if (hovered || focused) {
      if (timer === undefined) return
      window.clearTimeout(timer)
      timer = undefined
      left -= performance.now() - startedAt
    } else if (timer === undefined) {
      startedAt = performance.now()
      timer = window.setTimeout(dismiss, left)
    }
  }

  card.addEventListener('mouseenter', () => {
    hovered = true
    engage()
  })
  card.addEventListener('mouseleave', () => {
    hovered = false
    engage()
  })
  card.addEventListener('focusin', () => {
    focused = true
    engage()
  })
  card.addEventListener('focusout', () => {
    focused = false
    engage()
  })
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dismiss()
  })
  close.addEventListener('click', dismiss)

  stack().appendChild(card)
  engage()
}
