/**
 * Plays a one-shot animation class again, also on an element that still has it:
 * taking the class off and forcing a style pass before putting it back
 * restarts the animation.
 */
export function replay(el: HTMLElement, cls: string): void {
  el.classList.remove(cls)
  void el.offsetWidth
  el.classList.add(cls)
}

/** A motion dial's current duration in milliseconds, 0 where no level sets it. */
export function motionMs(dial: string): number {
  const value = getComputedStyle(document.documentElement).getPropertyValue(dial).trim()
  if (value.endsWith('ms')) return parseFloat(value) || 0
  return parseFloat(value) * 1000 || 0
}
