<script lang="ts">
  import {
    applyImageFilters,
    assembleGrid,
    buildFontWidthTable,
    createCanvasGlyphMeasurer,
    createCanvasWidthMeasurer,
    measureCellSize,
    renderGridToCanvas,
    type CellSize,
    type FontWidthTable,
  } from 'trickwork-core'
  import { liveState, tr } from './live.svelte'
  import { replay } from './motion'
  import type { Store } from './state'

  const MIN_ZOOM = 10
  const MAX_ZOOM = 400
  const ZOOM_STEP = 10
  const DEFAULT_ZOOM = 100

  let { store }: { store: Store } = $props()
  // The app hands every panel the one store it keeps for its whole life.
  // svelte-ignore state_referenced_locally
  const live = liveState(store)

  let canvas: HTMLCanvasElement
  let canvasWrap: HTMLDivElement
  // Zoom is view state rather than an option, so undo, presets and exports
  // ignore it.
  let zoomPct = $state(DEFAULT_ZOOM)
  let size = $state({ width: 0, height: 0 })

  const activeItem = $derived(live.current.items.find((item) => item.id === live.current.activeItemId))
  const hasImage = $derived(!!activeItem?.imageData)

  function setZoom(next: number): void {
    zoomPct = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next / ZOOM_STEP) * ZOOM_STEP))
  }

  // Ctrl or Cmd with the wheel zooms; a bare wheel still scrolls. The
  // listener cannot be passive, since it cancels the zooming wheel.
  $effect(() => {
    const onWheel = (event: WheelEvent): void => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      setZoom(zoomPct - Math.sign(event.deltaY) * ZOOM_STEP)
    }
    canvasWrap.addEventListener('wheel', onWheel, { passive: false })
    return () => canvasWrap.removeEventListener('wheel', onWheel)
  })

  // Drag to pan, in addition to the scrollbars.
  let dragging = $state(false)
  let dragStart = { x: 0, y: 0, left: 0, top: 0 }

  function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return
    dragging = true
    dragStart = { x: event.clientX, y: event.clientY, left: canvasWrap.scrollLeft, top: canvasWrap.scrollTop }
    canvasWrap.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: PointerEvent): void {
    if (!dragging) return
    canvasWrap.scrollLeft = dragStart.left - (event.clientX - dragStart.x)
    canvasWrap.scrollTop = dragStart.top - (event.clientY - dragStart.y)
  }

  function endDrag(event: PointerEvent): void {
    if (!dragging) return
    dragging = false
    canvasWrap.releasePointerCapture(event.pointerId)
  }

  const measure = createCanvasGlyphMeasurer()
  const measureWidth = createCanvasWidthMeasurer()

  // The font-width table costs a canvas readback per character, and the
  // preview redraws on every store change, including each frame of a slider
  // drag. Only the charset and the font feed it.
  let lastTableKey: string | null = null
  let cachedTable: FontWidthTable | null = null
  let cachedCellSize: CellSize | null = null
  // Zoom resets when the active image changes, not on every redraw.
  let lastImageId: string | null = null

  $effect(() => {
    const item = activeItem
    const options = live.current.options
    if (!item?.imageData) {
      canvas.width = 0
      canvas.height = 0
      size = { width: 0, height: 0 }
      lastImageId = null
      return
    }
    if (item.id !== lastImageId) {
      lastImageId = item.id
      zoomPct = DEFAULT_ZOOM
      // A new image fades in once; later redraws of it just paint.
      replay(canvasWrap, 'glim-content-fade')
    }

    const { charset, font } = options
    const tableKey = `${charset.join('')}|${font.family}|${font.sizePx}`
    if (tableKey !== lastTableKey || !cachedTable || !cachedCellSize) {
      cachedTable = buildFontWidthTable(charset, font, measure)
      // Cell pitch depends only on the font, which the key already covers.
      cachedCellSize = measureCellSize(font, measureWidth)
      lastTableKey = tableKey
    }

    const grid = assembleGrid(applyImageFilters(item.imageData, options), cachedTable, options)
    canvas.width = (grid[0]?.length ?? 0) * cachedCellSize.cellWidthPx
    canvas.height = grid.length * cachedCellSize.cellHeightPx
    size = { width: canvas.width, height: canvas.height }

    // Black ink on white regardless of the theme, as in ASCGen2 and in the
    // PNG and XHTML exports.
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Preview: 2D context unavailable')
    renderGridToCanvas(ctx, grid, {
      cellWidthPx: cachedCellSize.cellWidthPx,
      cellHeightPx: cachedCellSize.cellHeightPx,
      background: '#ffffff',
      foreground: '#000000',
    })
  })
</script>

<div class="glim-eyebrow glim-hue glim-notch-hue">{tr('preview.eyebrow')}</div>
<div class="preview-empty glim-well" style:display={hasImage ? 'none' : ''}>{tr('preview.empty')}</div>
<div class="preview-zoom-row" style:display={hasImage ? '' : 'none'}>
  <div class="preview-zoom-cluster">
    <button type="button" class="preview-zoom-button" aria-label={tr('preview.zoomOut')} onclick={() => setZoom(zoomPct - ZOOM_STEP)}>−</button>
    <button type="button" class="preview-zoom-label glim-num" title={tr('preview.zoomReset')} onclick={() => setZoom(DEFAULT_ZOOM)}>{zoomPct}%</button>
    <button type="button" class="preview-zoom-button" aria-label={tr('preview.zoomIn')} onclick={() => setZoom(zoomPct + ZOOM_STEP)}>+</button>
  </div>
</div>
<div
  bind:this={canvasWrap}
  class="preview-canvas-wrap"
  class:preview-canvas-wrap--dragging={dragging}
  style:display={hasImage ? '' : 'none'}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={endDrag}
  onpointercancel={endDrag}
  role="presentation"
>
  <!-- Sizing the layout box instead of a transform lets the wrap overflow and scroll. -->
  <canvas
    bind:this={canvas}
    class="preview-canvas"
    style:width={size.width ? `${(size.width * zoomPct) / 100}px` : undefined}
    style:height={size.height ? `${(size.height * zoomPct) / 100}px` : undefined}
  ></canvas>
</div>
