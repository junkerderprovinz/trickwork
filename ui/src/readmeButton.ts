// The button in the shape of the README's, used by the App and About cards. Its
// look and its answer to the pointer are GlimStone's .glim-readme-btn rules in
// design/tokens.css.

export interface ButtonFace {
  name: string
  /** The second line under the pointer. Without one the name stays in the middle. */
  sub?: string
  mark?: string
  /** A class that paints the mark at rest. */
  tint?: string
  /** Artwork that fills the whole button in place of mark and words. */
  art?: string
}

/** Fills a link or button with its face. Returns the second line, if it has one. */
export function buttonFace(el: HTMLElement, face: ButtonFace, segment = false): HTMLSpanElement | undefined {
  el.classList.add('glim-readme-btn', 'glim-brand-tile')
  if (segment) el.classList.add('glim-readme-btn-seg')
  el.setAttribute('aria-label', face.sub ? `${face.name} ${face.sub}` : face.name)
  if (face.art) {
    const art = document.createElement('span')
    art.className = 'glim-readme-btn-art'
    art.innerHTML = face.art
    el.appendChild(art)
    return undefined
  }
  if (face.mark) {
    const mark = document.createElement('span')
    mark.className = `glim-readme-btn-mark ${face.tint ?? ''}`.trim()
    mark.setAttribute('aria-hidden', 'true')
    mark.innerHTML = face.mark
    el.appendChild(mark)
  }
  const text = document.createElement('span')
  text.className = 'glim-readme-btn-text'
  const name = document.createElement('span')
  name.className = 'glim-readme-btn-name'
  name.textContent = face.name
  text.appendChild(name)
  el.appendChild(text)
  if (face.sub === undefined) return undefined
  const sub = document.createElement('span')
  sub.className = 'glim-readme-btn-sub'
  sub.textContent = face.sub
  text.appendChild(sub)
  return sub
}

/** A button, or a button with its segments, which lights up as one in `brand`'s colour. */
export function buttonUnit(brand: string, parts: HTMLElement[]): HTMLDivElement {
  const el = document.createElement('div')
  el.className = `glim-readme-btn-unit group glim-tile-${brand}${parts.length > 1 ? ' glim-readme-btn-group' : ''}`
  const sheen = document.createElement('span')
  sheen.className = 'glim-readme-btn-sheen'
  sheen.setAttribute('aria-hidden', 'true')
  el.append(...parts, sheen)
  return el
}

/**
 * Shrinks a translation longer than its button instead of cutting it off.
 * Hidden lines measure nothing, so keepButtonTextFitted runs it again once they
 * show.
 */
export function fitButtonText(root: HTMLElement): void {
  for (const line of root.querySelectorAll<HTMLElement>('.glim-readme-btn-name, .glim-readme-btn-sub')) {
    line.style.fontSize = ''
    if (line.clientWidth === 0) continue
    const over = line.scrollWidth / line.clientWidth
    if (over > 1) line.style.fontSize = `${parseFloat(getComputedStyle(line).fontSize) / over}px`
  }
}

/** Fits the lines in `root` again whenever it resizes, and once the fonts are in. */
export function keepButtonTextFitted(root: HTMLElement): void {
  new ResizeObserver(() => fitButtonText(root)).observe(root)
  void document.fonts?.ready.then(() => fitButtonText(root))
}
