// ASCGen2's selection tool: drag a rectangle on the source image to convert
// only that region. A drag from a corner resizes the selection, one from
// inside moves it, and one anywhere else draws a new one.

import type { CropSpec } from 'trickwork-core'
import { infoIcon } from './design/tooltip'
import { subscribeLocale, t } from './i18n'
import type { Store } from './state'

const DISPLAY_MAX_WIDTH = 360
const DISPLAY_MAX_HEIGHT = 320
// A small image is upscaled so a selection can still be dragged on it, by at
// most MAX_UPSCALE.
const MIN_DISPLAY_DIMENSION = 200
const MAX_UPSCALE = 10
const MIN_DRAG_PX = 8
// How close (in canvas px) a pointer has to be to a corner to grab it for
// resizing instead of starting a move or a fresh selection.
const HANDLE_ZONE_PX = 12

function computeDisplayScale(width: number, height: number): number {
  if (width > DISPLAY_MAX_WIDTH || height > DISPLAY_MAX_HEIGHT) {
    return Math.min(DISPLAY_MAX_WIDTH / width, DISPLAY_MAX_HEIGHT / height)
  }
  if (width < MIN_DISPLAY_DIMENSION && height < MIN_DISPLAY_DIMENSION) {
    return Math.min(MAX_UPSCALE, MIN_DISPLAY_DIMENSION / width, MIN_DISPLAY_DIMENSION / height)
  }
  return 1
}

interface Point {
  x: number
  y: number
}

interface PixelRect {
  x: number
  y: number
  width: number
  height: number
}

type Corner = 'nw' | 'ne' | 'sw' | 'se'
type DragMode = 'new' | 'move' | 'resize'

function pointInRect(point: Point, rect: PixelRect): boolean {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height
}

function hitCorner(point: Point, rect: PixelRect): Corner | null {
  const corners: [Corner, number, number][] = [
    ['nw', rect.x, rect.y],
    ['ne', rect.x + rect.width, rect.y],
    ['sw', rect.x, rect.y + rect.height],
    ['se', rect.x + rect.width, rect.y + rect.height],
  ]
  for (const [id, cx, cy] of corners) {
    if (Math.abs(point.x - cx) <= HANDLE_ZONE_PX && Math.abs(point.y - cy) <= HANDLE_ZONE_PX) return id
  }
  return null
}

export function mountCropPanel(container: HTMLElement, store: Store): void {
  // The drag-to-crop hint lives in an info bubble beside the eyebrow.
  const eyebrowRow = document.createElement('div')
  eyebrowRow.className = 'eyebrow-row'
  const eyebrow = document.createElement('span')
  eyebrow.className = 'glim-eyebrow'
  const eyebrowInfo = infoIcon('')
  eyebrowRow.append(eyebrow, eyebrowInfo)
  container.appendChild(eyebrowRow)

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
  const clearButton = document.createElement('button')
  clearButton.type = 'button'
  clearButton.className = 'crop-clear-button'
  footer.append(clearButton)
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

  function currentCropPixels(): PixelRect | null {
    const crop = currentCrop()
    if (!crop || canvas.width === 0) return null
    return {
      x: crop.x * canvas.width,
      y: crop.y * canvas.height,
      width: crop.width * canvas.width,
      height: crop.height * canvas.height,
    }
  }

  function positionOverlay(rect: PixelRect): void {
    // 'block' rather than '', which would fall back to the class's
    // display: none.
    overlay.style.display = rect.width > 0 && rect.height > 0 ? 'block' : 'none'
    overlay.style.left = `${rect.x}px`
    overlay.style.top = `${rect.y}px`
    overlay.style.width = `${rect.width}px`
    overlay.style.height = `${rect.height}px`
  }

  /** Draws the overlay from the stored crop, the resting state between drags. */
  function drawStoredOverlay(): void {
    const crop = currentCrop()
    clearButton.style.display = crop ? '' : 'none'
    const rect = currentCropPixels()
    positionOverlay(rect ?? { x: 0, y: 0, width: 0, height: 0 })
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
    // Both were checked above, but the narrowing does not reach this closure.
    offCtx!.putImageData(imageData, 0, 0)
    ctx!.clearRect(0, 0, canvas.width, canvas.height)
    // Nearest-neighbour upscaling keeps single source pixels legible.
    ctx!.imageSmoothingEnabled = scale <= 1
    ctx!.drawImage(offscreen, 0, 0, canvas.width, canvas.height)

    drawStoredOverlay()
  }

  function canvasPoint(event: PointerEvent): Point {
    const rect = canvas.getBoundingClientRect()
    return {
      x: Math.min(canvas.width, Math.max(0, event.clientX - rect.left)),
      y: Math.min(canvas.height, Math.max(0, event.clientY - rect.top)),
    }
  }

  function cursorForCorner(corner: Corner): string {
    return corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'
  }

  function updateHoverCursor(point: Point): void {
    const rect = currentCropPixels()
    if (!rect) {
      canvas.style.cursor = 'crosshair'
      return
    }
    const corner = hitCorner(point, rect)
    if (corner) {
      canvas.style.cursor = cursorForCorner(corner)
    } else if (pointInRect(point, rect)) {
      canvas.style.cursor = 'move'
    } else {
      canvas.style.cursor = 'crosshair'
    }
  }

  let dragging = false
  let dragMode: DragMode = 'new'
  // 'new': the fixed start corner. 'resize': the fixed opposite corner.
  // 'move': the point grabbed inside the selection.
  let dragAnchor: Point = { x: 0, y: 0 }
  let dragOriginalRect: PixelRect | null = null
  let pendingRect: PixelRect | null = null

  canvas.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || canvas.width === 0) return
    const point = canvasPoint(event)
    const rect = currentCropPixels()

    if (rect) {
      const corner = hitCorner(point, rect)
      if (corner) {
        dragMode = 'resize'
        dragAnchor = {
          x: corner === 'nw' || corner === 'sw' ? rect.x + rect.width : rect.x,
          y: corner === 'nw' || corner === 'ne' ? rect.y + rect.height : rect.y,
        }
      } else if (pointInRect(point, rect)) {
        dragMode = 'move'
        dragAnchor = point
        dragOriginalRect = rect
      } else {
        dragMode = 'new'
        dragAnchor = point
      }
    } else {
      dragMode = 'new'
      dragAnchor = point
    }

    dragging = true
    pendingRect = null
    canvas.setPointerCapture(event.pointerId)
  })

  canvas.addEventListener('pointermove', (event) => {
    const point = canvasPoint(event)
    if (!dragging) {
      updateHoverCursor(point)
      return
    }

    let rect: PixelRect
    if (dragMode === 'move' && dragOriginalRect) {
      const dx = point.x - dragAnchor.x
      const dy = point.y - dragAnchor.y
      const x = Math.max(0, Math.min(canvas.width - dragOriginalRect.width, dragOriginalRect.x + dx))
      const y = Math.max(0, Math.min(canvas.height - dragOriginalRect.height, dragOriginalRect.y + dy))
      rect = { x, y, width: dragOriginalRect.width, height: dragOriginalRect.height }
    } else {
      // 'new' and 'resize' both span from the fixed anchor to the pointer.
      const x = Math.min(dragAnchor.x, point.x)
      const y = Math.min(dragAnchor.y, point.y)
      rect = { x, y, width: Math.abs(point.x - dragAnchor.x), height: Math.abs(point.y - dragAnchor.y) }
    }
    pendingRect = rect
    positionOverlay(rect)
  })

  function endDrag(event: PointerEvent): void {
    if (!dragging) return
    dragging = false
    dragOriginalRect = null
    canvas.releasePointerCapture(event.pointerId)

    const rect = pendingRect
    pendingRect = null
    if (!rect || rect.width < MIN_DRAG_PX || rect.height < MIN_DRAG_PX) {
      // A stray click or a tiny drag keeps the stored crop.
      drawStoredOverlay()
      return
    }
    const crop: CropSpec = {
      x: rect.x / canvas.width,
      y: rect.y / canvas.height,
      width: rect.width / canvas.width,
      height: rect.height / canvas.height,
    }
    store.commitOptionsSnapshot(t('history.entryCrop'))
    store.setState({ options: { ...store.getState().options, crop } })
    drawStoredOverlay()
  }
  canvas.addEventListener('pointerup', endDrag)
  canvas.addEventListener('pointercancel', endDrag)

  clearButton.addEventListener('click', () => {
    if (!currentCrop()) return
    store.commitOptionsSnapshot(t('history.entryCropCleared'))
    const options = { ...store.getState().options }
    delete options.crop
    store.setState({ options })
    drawStoredOverlay()
  })

  store.subscribe(drawSource)
  // Re-syncs the overlay after an undo, redo or preset import.
  store.subscribeHistory(drawStoredOverlay)

  function applyLabels(): void {
    eyebrow.textContent = t('crop.eyebrow')
    empty.textContent = t('preview.empty')
    eyebrowInfo.setAttribute('data-tip', t('crop.hint'))
    eyebrowInfo.setAttribute('aria-label', t('crop.hint'))
    clearButton.textContent = t('crop.clearButton')
  }
  applyLabels()
  subscribeLocale(applyLabels)

  drawSource()
}
