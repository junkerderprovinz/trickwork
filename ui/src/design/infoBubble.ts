// ui/src/design/infoBubble.ts
//
// GlimStone's "Explanations live in a bubble, not on the page" (design-
// language.md, rule 8 + "The info bubble") - no `<InfoBubble>` reference file
// exists for a non-React app (the doc's own `<InfoBubble tip="…" />` is a
// sibling app's component), so this is TrickWork's own vanilla-DOM
// implementation of the same contract: a neutral (i) trigger, one shared
// .glim-bubble rendered into <body> (never a card/scroll container, which
// could clip it), positioned from the trigger's own bounding box, hover AND
// focus, Escape closes, pointer-events: none so it never swallows a click.

let sharedBubble: HTMLDivElement | null = null
let openTrigger: HTMLElement | null = null

function bubble(): HTMLDivElement {
  if (sharedBubble) return sharedBubble
  sharedBubble = document.createElement('div')
  sharedBubble.className = 'glim-bubble glim-fade'
  sharedBubble.style.display = 'none'
  document.body.appendChild(sharedBubble)
  return sharedBubble
}

function place(trigger: HTMLElement): void {
  const b = bubble()
  const rect = trigger.getBoundingClientRect()
  b.style.left = `${rect.left + rect.width / 2}px`
  // Above the trigger by default (8px gap); flips below when that would run
  // off the top of the viewport, the same rule any tooltip library uses.
  const estimatedHeight = b.offsetHeight || 40
  const top = rect.top - estimatedHeight - 8
  b.style.top = `${top < 4 ? rect.bottom + 8 : top}px`
}

function open(trigger: HTMLElement): void {
  const text = trigger.getAttribute('aria-label')
  if (!text) return
  openTrigger = trigger
  const b = bubble()
  b.textContent = text
  b.style.display = 'block'
  place(trigger)
}

function close(trigger?: HTMLElement): void {
  // Ignore a blur/mouseleave firing after a DIFFERENT trigger has already
  // taken over (e.g. Tab moving focus straight from one icon to the next).
  if (trigger && openTrigger !== trigger) return
  openTrigger = null
  if (sharedBubble) sharedBubble.style.display = 'none'
}

// Closes on scroll rather than drifting away from the control it explains -
// capture:true so this fires for a scroll inside any nested container, not
// just window-level scrolling.
window.addEventListener('scroll', () => close(), { capture: true, passive: true })

/**
 * A standalone "(i)" trigger. `text` is both the bubble's content and its
 * accessible name (aria-label) - update the attribute directly (e.g. inside
 * a locale-switch callback) to change what it shows; open() always reads the
 * CURRENT attribute value, never a captured closure, so that stays in sync.
 */
export function infoIcon(text: string): HTMLButtonElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'info-icon'
  btn.textContent = 'i'
  btn.setAttribute('aria-label', text)
  btn.addEventListener('mouseenter', () => open(btn))
  btn.addEventListener('mouseleave', () => close(btn))
  btn.addEventListener('focus', () => open(btn))
  btn.addEventListener('blur', () => close(btn))
  btn.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close(btn)
  })
  return btn
}
