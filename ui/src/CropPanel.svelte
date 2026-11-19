<script lang="ts" module>
  // ASCGen2's selection tool: drag a rectangle on the source image to convert
  // only that region. A drag from a corner resizes the selection, one from
  // inside moves it, and one anywhere else draws a new one.

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

  function computeDisplayScale(width: number, height: number): number {
    if (width > DISPLAY_MAX_WIDTH || height > DISPLAY_MAX_HEIGHT) {
      return Math.min(DISPLAY_MAX_WIDTH / width, DISPLAY_MAX_HEIGHT / height)
    }
    if (width < MIN_DISPLAY_DIMENSION && height < MIN_DISPLAY_DIMENSION) {
      return Math.min(MAX_UPSCALE, MIN_DISPLAY_DIMENSION / width, MIN_DISPLAY_DIMENSION / height)
    }
    return 1
  }

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
</script>

<script lang="ts">
  import type { CropSpec } from 'trickwork-core'
  import { Button, InfoBubble } from '@glimstone/svelte'
  import { iconClearSelection } from './icons'
  import { liveState, svgSnippet, tr } from './live.svelte'
  import type { Store } from './state'

  let { store }: { store: Store } = $props()
  // The app hands every panel the one store it keeps for its whole life.
  // svelte-ignore state_referenced_locally
  const live = liveState(store)

  let canvas: HTMLCanvasElement
  const offscreen = document.createElement('canvas')
  const clearGlyph = svgSnippet(iconClearSelection())

  // The drawn canvas's size, which places the stored selection.
  let canvasSize = $state({ width: 0, height: 0 })
  // The rectangle being dragged, which shows until the drag commits.
  let pending = $state<PixelRect | null>(null)
  let cursor = $state('crosshair')

  const activeItem = $derived(live.current.items.find((item) => item.id === live.current.activeItemId))
  const crop = $derived(live.current.options.crop)
  const storedRect = $derived.by((): PixelRect | null => {
    if (!crop || canvasSize.width === 0) return null
    return {
      x: crop.x * canvasSize.width,
      y: crop.y * canvasSize.height,
      width: crop.width * canvasSize.width,
      height: crop.height * canvasSize.height,
    }
  })
  const shown = $derived(pending ?? storedRect)

  let lastImageId: string | null = null

  $effect(() => {
    const item = activeItem
    if (!item?.imageData) {
      canvas.width = 0
      canvas.height = 0
      canvasSize = { width: 0, height: 0 }
      lastImageId = null
      return
    }
    if (item.id === lastImageId) return
    lastImageId = item.id

    const { imageData } = item
    const scale = computeDisplayScale(imageData.width, imageData.height)
    canvas.width = Math.max(1, Math.round(imageData.width * scale))
    canvas.height = Math.max(1, Math.round(imageData.height * scale))
    canvasSize = { width: canvas.width, height: canvas.height }

    offscreen.width = imageData.width
    offscreen.height = imageData.height
    const offCtx = offscreen.getContext('2d')
    const ctx = canvas.getContext('2d')
    if (!offCtx || !ctx) throw new Error('CropPanel: 2D context unavailable')
    offCtx.putImageData(imageData, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // Nearest-neighbour upscaling keeps single source pixels legible.
    ctx.imageSmoothingEnabled = scale <= 1
    ctx.drawImage(offscreen, 0, 0, canvas.width, canvas.height)
  })

  function canvasPoint(event: PointerEvent): Point {
    const rect = canvas.getBoundingClientRect()
    return {
      x: Math.min(canvas.width, Math.max(0, event.clientX - rect.left)),
      y: Math.min(canvas.height, Math.max(0, event.clientY - rect.top)),
    }
  }

  function hoverCursor(point: Point): string {
    if (!storedRect) return 'crosshair'
    const corner = hitCorner(point, storedRect)
    if (corner) return corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize'
    return pointInRect(point, storedRect) ? 'move' : 'crosshair'
  }

  let dragging = false
  let dragMode: DragMode = 'new'
  // 'new': the fixed start corner. 'resize': the fixed opposite corner.
  // 'move': the point grabbed inside the selection.
  let dragAnchor: Point = { x: 0, y: 0 }
  let dragOriginalRect: PixelRect | null = null

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || canvas.width === 0) return
    const point = canvasPoint(event)
    const rect = storedRect
    const corner = rect ? hitCorner(point, rect) : null
    if (rect && corner) {
      dragMode = 'resize'
      dragAnchor = {
        x: corner === 'nw' || corner === 'sw' ? rect.x + rect.width : rect.x,
        y: corner === 'nw' || corner === 'ne' ? rect.y + rect.height : rect.y,
      }
    } else if (rect && pointInRect(point, rect)) {
      dragMode = 'move'
      dragAnchor = point
      dragOriginalRect = rect
    } else {
      dragMode = 'new'
      dragAnchor = point
    }
    dragging = true
    pending = null
    canvas.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent): void {
    const point = canvasPoint(event)
    if (!dragging) {
      cursor = hoverCursor(point)
      return
    }
    if (dragMode === 'move' && dragOriginalRect) {
      const { width, height } = dragOriginalRect
      const x = Math.max(0, Math.min(canvas.width - width, dragOriginalRect.x + point.x - dragAnchor.x))
      const y = Math.max(0, Math.min(canvas.height - height, dragOriginalRect.y + point.y - dragAnchor.y))
      pending = { x, y, width, height }
    } else {
      // 'new' and 'resize' both span from the fixed anchor to the pointer.
      pending = {
        x: Math.min(dragAnchor.x, point.x),
        y: Math.min(dragAnchor.y, point.y),
        width: Math.abs(point.x - dragAnchor.x),
        height: Math.abs(point.y - dragAnchor.y),
      }
    }
  }

  function endDrag(event: PointerEvent): void {
    if (!dragging) return
    dragging = false
    dragOriginalRect = null
    canvas.releasePointerCapture(event.pointerId)

    const rect = pending
    pending = null
    // A stray click or a tiny drag keeps the stored crop.
    if (!rect || rect.width < MIN_DRAG_PX || rect.height < MIN_DRAG_PX) return
    const next: CropSpec = {
      x: rect.x / canvas.width,
      y: rect.y / canvas.height,
      width: rect.width / canvas.width,
      height: rect.height / canvas.height,
    }
    store.commitOptionsSnapshot(tr('history.entryCrop'))
    store.setState({ options: { ...store.getState().options, crop: next } })
  }

  function clearCrop(): void {
    if (!crop) return
    store.commitOptionsSnapshot(tr('history.entryCropCleared'))
    const options = { ...store.getState().options }
    delete options.crop
    store.setState({ options })
  }
</script>

<!-- The drag-to-crop hint lives in an info bubble beside the eyebrow. -->
<div class="eyebrow-row">
  <span class="glim-eyebrow">{tr('crop.eyebrow')}</span>
  <InfoBubble tip={tr('crop.hint')} />
</div>
<div class="preview-empty glim-well" style:display={activeItem?.imageData ? 'none' : ''}>{tr('preview.empty')}</div>
<div class="crop-canvas-wrap" style:display={activeItem?.imageData ? '' : 'none'}>
  <canvas
    bind:this={canvas}
    class="crop-source-canvas"
    style:cursor
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={endDrag}
    onpointercancel={endDrag}
  ></canvas>
  <div
    class="crop-overlay"
    style:display={shown && shown.width > 0 && shown.height > 0 ? 'block' : 'none'}
    style:left={shown ? `${shown.x}px` : undefined}
    style:top={shown ? `${shown.y}px` : undefined}
    style:width={shown ? `${shown.width}px` : undefined}
    style:height={shown ? `${shown.height}px` : undefined}
  ></div>
</div>
<div class="crop-footer" style:display={activeItem?.imageData ? '' : 'none'}>
  {#if crop}
    <Button label={tr('crop.clearButton')} labelKey={null} glyph={clearGlyph} tone="subtle" onClick={clearCrop} />
  {/if}
</div>
