// ui/src/cropPanel.ts
//
// ASCGen2's WidgetImage selection tool (click-drag a rectangle on the loaded
// source image to restrict conversion to just that region) - the one
// genuine ASCGen2 feature TrickWork had no equivalent for at all, since
// nothing previously showed the SOURCE image anywhere (only the converted
// ASCII output, in preview.ts). Sits between Import and Preview in the
// primary column: import -> optionally crop the source -> see the result.

import type { CropSpec } from 'trickwork-core'
import { subscribeLocale, t } from './i18n'
import type { Store } from './state'

const DISPLAY_MAX_WIDTH = 360
const DISPLAY_MAX_HEIGHT = 320
// A small source image (an icon, a tiny screenshot) would otherwise render
// at its own native size - a 16x16 source makes for a 16x16 crop canvas,
// practically impossible to drag a selection on. Upscale up to MAX_UPSCALE
// so it stays a genuinely usable target, capped so a pathological 1x1 image
// doesn't blow up into something absurd.
const MIN_DISPLAY_DIMENSION = 200
const MAX_UPSCALE = 10
const MIN_DRAG_PX = 8

function computeDisplayScale(width: number, height: number): number {
  if (width > DISPLAY_MAX_WIDTH || height > DISPLAY_MAX_HEIGHT) {
    return Math.min(DISPLAY_MAX_WIDTH / width, DISPLAY_MAX_HEIGHT / height)
  }
  if (width < MIN_DISPLAY_DIMENSION && height < MIN_DISPLAY_DIMENSION) {
    return Math.min(MAX_UPSCALE, MIN_DISPLAY_DIMENSION / width, MIN_DISPLAY_DIMENSION / height)
  }
  return 1
}

export function mountCropPanel(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const empty = document.createElement('div')
  empty.className = 'preview-empty glim-well'
  container.appendChild(empty)

  const wrap = document.createElement('div')
  wrap.className = 'crop-canvas-wrap'
  container.appendChild(wrap)

  const canvas = document.createElement('canvas')
  canvas.className = 'crop-source-canvas'
  wrap.appendChild(canvas)

  const overlay = document.createElement('div')
  overlay.className = 'crop-overlay'
  wrap.appendChild(overlay)

  const footer = document.createElement('div')
  footer.className = 'crop-footer'
  const hint = document.createElement('p')
  hint.className = 'controls-note'
  const clearButton = document.createElement('button')
  clearButton.type = 'button'
  clearButton.className = 'crop-clear-button'
  footer.append(hint, clearButton)
  container.appendChild(footer)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('mountCropPanel: 2D context unavailable')
  }
  const offscreen = document.createElement('canvas')
  const offCtx = offscreen.getContext('2d')
  if (!offCtx) {
    throw new Error('mountCropPanel: offscreen 2D context unavailable')
  }

  function currentCrop(): CropSpec | undefined {
    return store.getState().options.crop
  }

  function positionOverlay(x: number, y: number, width: number, height: number): void {
    // 'block', not '' - the CSS class's own default is display:none (so the
    // overlay starts hidden with no JS needed), and setting an inline style
    // to '' only REMOVES an inline override, falling straight back to that
    // same display:none rather than showing the element.
    overlay.style.display = width > 0 && height > 0 ? 'block' : 'none'
    overlay.style.left = `${x}px`
    overlay.style.top = `${y}px`
    overlay.style.width = `${width}px`
    overlay.style.height = `${height}px`
  }

  /** Draws the overlay from the STORED crop (normalized) - the resting state between drags. */
  function drawStoredOverlay(): void {
    const crop = currentCrop()
    clearButton.style.display = crop ? '' : 'none'
    if (!crop || canvas.width === 0) {
      positionOverlay(0, 0, 0, 0)
      return
    }
    positionOverlay(crop.x * canvas.width, crop.y * canvas.height, crop.width * canvas.width, crop.height * canvas.height)
  }

  let lastImageId: string | null = null

  function drawSource(): void {
    const state = store.getState()
    const activeItem = state.items.find((item) => item.id === state.activeItemId)
    if (!activeItem?.imageData) {
      canvas.width = 0
      canvas.height = 0
      empty.style.display = ''
      wrap.style.display = 'none'
      footer.style.display = 'none'
      lastImageId = null
      return
    }
    empty.style.display = 'none'
    wrap.style.display = ''
    footer.style.display = ''
    if (activeItem.id === lastImageId) return
    lastImageId = activeItem.id

    const { imageData } = activeItem
    const scale = computeDisplayScale(imageData.width, imageData.height)
    canvas.width = Math.max(1, Math.round(imageData.width * scale))
    canvas.height = Math.max(1, Math.round(imageData.height * scale))

    offscreen.width = imageData.width
    offscreen.height = imageData.height
    // Non-null assertions, matching preview.ts's own render() - both were
    // already checked non-null right after getContext('2d') above, but
    // TS's control-flow narrowing doesn't carry into a nested closure
    // called later.
    offCtx!.putImageData(imageData, 0, 0)
    ctx!.clearRect(0, 0, canvas.width, canvas.height)
    // A tiny source image gets upscaled (see computeDisplayScale) - crisp
    // nearest-neighbor pixels there make individual source pixels legible
    // for cropping; the default smoothing would just blur them together.
    ctx!.imageSmoothingEnabled = scale <= 1
    ctx!.drawImage(offscreen, 0, 0, canvas.width, canvas.height)

    drawStoredOverlay()
  }

  function canvasPoint(event: PointerEvent): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect()
    return {
      x: Math.min(canvas.width, Math.max(0, event.clientX - rect.left)),
      y: Math.min(canvas.height, Math.max(0, event.clientY - rect.top)),
    }
  }

  let dragging = false
  let dragStart = { x: 0, y: 0 }

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || canvas.width === 0) return
    dragging = true
    dragStart = canvasPoint(event)
    canvas.setPointerCapture(event.pointerId)
  })

  canvas.addEventListener('pointermove', (event) => {
    if (!dragging) return
    const point = canvasPoint(event)
    const x = Math.min(dragStart.x, point.x)
    const y = Math.min(dragStart.y, point.y)
    positionOverlay(x, y, Math.abs(point.x - dragStart.x), Math.abs(point.y - dragStart.y))
  })

  function endDrag(event: PointerEvent): void {
    if (!dragging) return
    dragging = false
    canvas.releasePointerCapture(event.pointerId)
    const point = canvasPoint(event)
    const pxWidth = Math.abs(point.x - dragStart.x)
    const pxHeight = Math.abs(point.y - dragStart.y)
    if (pxWidth < MIN_DRAG_PX || pxHeight < MIN_DRAG_PX) {
      // Too small to be a deliberate selection (a stray click, or a
      // near-zero drag) - leave whatever crop was already stored alone
      // rather than committing an accidental sliver.
      drawStoredOverlay()
      return
    }
    const x = Math.min(dragStart.x, point.x)
    const y = Math.min(dragStart.y, point.y)
    const crop: CropSpec = {
      x: x / canvas.width,
      y: y / canvas.height,
      width: pxWidth / canvas.width,
      height: pxHeight / canvas.height,
    }
    store.commitOptionsSnapshot()
    store.setState({ options: { ...store.getState().options, crop } })
    drawStoredOverlay()
  }
  canvas.addEventListener('pointerup', endDrag)
  canvas.addEventListener('pointercancel', endDrag)

  clearButton.addEventListener('click', () => {
    if (!currentCrop()) return
    store.commitOptionsSnapshot()
    const options = { ...store.getState().options }
    delete options.crop
    store.setState({ options })
    drawStoredOverlay()
  })

  function render(): void {
    drawSource()
  }
  store.subscribe(render)
  // Re-syncs the overlay after an undo/redo/preset-import changes `crop`
  // from outside this panel's own drag handling - see state.ts.
  store.subscribeHistory(drawStoredOverlay)

  function applyLabels(): void {
    eyebrow.textContent = t('crop.eyebrow')
    empty.textContent = t('preview.empty')
    hint.textContent = t('crop.hint')
    clearButton.textContent = t('crop.clearButton')
  }
  applyLabels()
  subscribeLocale(applyLabels)

  render()
}
