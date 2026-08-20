import {
  applyImageFilters,
  assembleGrid,
  buildFontWidthTable,
  createCanvasGlyphMeasurer,
  createCanvasWidthMeasurer,
  measureCellSize,
  renderGridToCanvas,
  toText,
  type CellSize,
  type FontWidthTable,
  type Grid,
} from 'trickwork-core'
import { applyHueVars } from './controlWidgets'
import { subscribeRainbow } from './design/appearance'
import { iconCheck, iconCopy } from './icons'
import { subscribeLocale, t } from './i18n'
import type { Store } from './state'

const COPIED_FEEDBACK_MS = 1500

const MIN_ZOOM = 10
const MAX_ZOOM = 400
const ZOOM_STEP = 10
const DEFAULT_ZOOM = 100

export function mountPreview(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const empty = document.createElement('div')
  empty.className = 'preview-empty glim-well'
  container.appendChild(empty)

  // Zoom is view-only state, deliberately NOT part of store.options - it
  // isn't a generation setting (undo/redo, presets, and exports must all
  // ignore it entirely), it's purely "how am I looking at the result right
  // now", matching ASCGen2's own Zoom In/Out buttons on its preview widget.
  let zoomPct = DEFAULT_ZOOM

  // Icon badge, not text (jdp: "der Badge soll ein Badge mit Symbol sein,
  // nicht mit Text" - a general rule now, see icons.ts's iconCopy()),
  // pinned to the FAR RIGHT of the row (jdp: "der Badge soll auch ganz
  // rechts sein") - the zoom cluster sits on the left instead.
  const copyButton = document.createElement('button')
  copyButton.type = 'button'
  copyButton.className = 'preview-copy-button'
  copyButton.innerHTML = iconCopy()

  const zoomCluster = document.createElement('div')
  zoomCluster.className = 'preview-zoom-cluster'
  const zoomOutButton = document.createElement('button')
  zoomOutButton.type = 'button'
  zoomOutButton.className = 'preview-zoom-button'
  zoomOutButton.textContent = '−'
  const zoomLabel = document.createElement('button')
  zoomLabel.type = 'button'
  zoomLabel.className = 'preview-zoom-label glim-num'
  const zoomInButton = document.createElement('button')
  zoomInButton.type = 'button'
  zoomInButton.className = 'preview-zoom-button'
  zoomInButton.textContent = '+'
  zoomCluster.append(zoomOutButton, zoomLabel, zoomInButton)

  const zoomRow = document.createElement('div')
  zoomRow.className = 'preview-zoom-row'
  zoomRow.append(zoomCluster, copyButton)
  container.appendChild(zoomRow)

  // Zoom out/in are a two-member set (jdp: "die ganzen badges und
  // schaltflächen werden nicht eingefärbt") - copyButton stays on the
  // single accent, it's the only one of its kind on the page (GlimStone's
  // own rule: a lone unique control never owns a position).
  function syncRainbow(): void {
    ;[zoomOutButton, zoomInButton].forEach((button, index) => {
      const applied = applyHueVars(button, index)
      button.classList.toggle('glim-hue', applied)
      button.classList.toggle('glim-tint', applied)
    })
  }
  syncRainbow()
  subscribeRainbow(syncRainbow)

  let copiedFeedbackTimer: ReturnType<typeof setTimeout> | null = null

  function applyLabels(): void {
    eyebrow.textContent = t('preview.eyebrow')
    empty.textContent = t('preview.empty')
    zoomOutButton.setAttribute('aria-label', t('preview.zoomOut'))
    zoomInButton.setAttribute('aria-label', t('preview.zoomIn'))
    zoomLabel.title = t('preview.zoomReset')
    // Skipped while the "Copied!" feedback is showing - reapplying the
    // normal label mid-timeout would cut the feedback short on a locale
    // switch (rare, but a full rebuild elsewhere in the app can trigger
    // this callback at any time).
    if (!copiedFeedbackTimer) {
      copyButton.title = t('preview.copy')
      copyButton.setAttribute('aria-label', t('preview.copy'))
    }
  }
  applyLabels()
  subscribeLocale(applyLabels)

  let lastGrid: Grid | null = null

  copyButton.addEventListener('click', () => {
    if (!lastGrid) return
    void navigator.clipboard.writeText(toText(lastGrid)).then(() => {
      if (copiedFeedbackTimer) clearTimeout(copiedFeedbackTimer)
      copyButton.innerHTML = iconCheck()
      copyButton.classList.add('preview-copy-button--copied')
      const copiedLabel = t('preview.copied')
      copyButton.title = copiedLabel
      copyButton.setAttribute('aria-label', copiedLabel)
      copiedFeedbackTimer = setTimeout(() => {
        copiedFeedbackTimer = null
        copyButton.innerHTML = iconCopy()
        copyButton.classList.remove('preview-copy-button--copied')
        copyButton.title = t('preview.copy')
        copyButton.setAttribute('aria-label', t('preview.copy'))
      }, COPIED_FEEDBACK_MS)
    })
  })

  const canvasWrap = document.createElement('div')
  canvasWrap.className = 'preview-canvas-wrap'
  const canvas = document.createElement('canvas')
  canvas.className = 'preview-canvas'
  canvasWrap.appendChild(canvas)
  container.appendChild(canvasWrap)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('mountPreview: 2D context unavailable')
  }

  function applyZoom(): void {
    zoomLabel.textContent = `${zoomPct}%`
    if (canvas.width === 0) return
    // Explicit pixel dimensions, not a CSS transform: scaling the actual
    // layout box (not just its paint) is what makes canvasWrap's own
    // overflow:auto produce real scrollbars once the scaled image is
    // bigger than the card - a transform: scale() repaints in place
    // without touching layout size, so nothing would ever overflow to pan.
    canvas.style.width = `${(canvas.width * zoomPct) / 100}px`
    canvas.style.height = `${(canvas.height * zoomPct) / 100}px`
  }

  function setZoom(next: number): void {
    zoomPct = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next / ZOOM_STEP) * ZOOM_STEP))
    applyZoom()
  }

  zoomOutButton.addEventListener('click', () => setZoom(zoomPct - ZOOM_STEP))
  zoomInButton.addEventListener('click', () => setZoom(zoomPct + ZOOM_STEP))
  zoomLabel.addEventListener('click', () => setZoom(DEFAULT_ZOOM))

  // Ctrl/Cmd+wheel zooms (the common image-viewer convention) - a bare
  // wheel is left alone so it still scrolls canvasWrap's own scrollbars
  // normally when not zooming.
  canvasWrap.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      setZoom(zoomPct - Math.sign(event.deltaY) * ZOOM_STEP)
    },
    { passive: false },
  )

  // Click-and-drag panning, on top of the scrollbars canvasWrap's own
  // overflow:auto already provides - ASCGen2 itself only ever had
  // scrollbar-based panning (confirmed against its source, no dedicated
  // pan tool), so this is TrickWork going a step beyond the original.
  let dragging = false
  let dragStartX = 0
  let dragStartY = 0
  let dragScrollLeft = 0
  let dragScrollTop = 0
  canvasWrap.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return
    dragging = true
    dragStartX = event.clientX
    dragStartY = event.clientY
    dragScrollLeft = canvasWrap.scrollLeft
    dragScrollTop = canvasWrap.scrollTop
    canvasWrap.classList.add('preview-canvas-wrap--dragging')
    canvasWrap.setPointerCapture(event.pointerId)
  })
  canvasWrap.addEventListener('pointermove', (event) => {
    if (!dragging) return
    canvasWrap.scrollLeft = dragScrollLeft - (event.clientX - dragStartX)
    canvasWrap.scrollTop = dragScrollTop - (event.clientY - dragStartY)
  })
  function endDrag(event: PointerEvent): void {
    if (!dragging) return
    dragging = false
    canvasWrap.classList.remove('preview-canvas-wrap--dragging')
    canvasWrap.releasePointerCapture(event.pointerId)
  }
  canvasWrap.addEventListener('pointerup', endDrag)
  canvasWrap.addEventListener('pointercancel', endDrag)

  const measure = createCanvasGlyphMeasurer()
  const measureWidth = createCanvasWidthMeasurer()

  // Building the font-width table costs one canvas plus one getImageData
  // readback PER character (up to 70 for the "detailed" preset), and render()
  // runs on every store notification — including every frame of a slider drag.
  // Brightness, contrast and column count change none of the table's inputs,
  // so cache it and rebuild only when the charset or font actually changes.
  let lastTableKey: string | null = null
  let cachedTable: FontWidthTable | null = null
  let cachedCellSize: CellSize | null = null
  // Recomputed grids reset the zoom back to 100% only when the ACTIVE IMAGE
  // changes (a fresh image should always start at a predictable zoom), never
  // on every render (that would fight the user zooming while adjusting an
  // unrelated slider).
  let lastImageId: string | null = null

  function render() {
    const state = store.getState()
    const activeItem = state.items.find((item) => item.id === state.activeItemId)
    if (!activeItem?.imageData) {
      canvas.width = 0
      canvas.height = 0
      empty.style.display = ''
      canvasWrap.style.display = 'none'
      zoomRow.style.display = 'none'
      lastImageId = null
      lastGrid = null
      return
    }
    empty.style.display = 'none'
    canvasWrap.style.display = ''
    zoomRow.style.display = ''
    if (activeItem.id !== lastImageId) {
      lastImageId = activeItem.id
      zoomPct = DEFAULT_ZOOM
    }

    const { charset, font } = state.options
    const tableKey = `${charset.join('')}|${font.family}|${font.sizePx}`
    if (tableKey !== lastTableKey || !cachedTable || !cachedCellSize) {
      cachedTable = buildFontWidthTable(charset, font, measure)
      // Cell pitch depends only on the font, which the key already covers.
      cachedCellSize = measureCellSize(font, measureWidth)
      lastTableKey = tableKey
    }

    const transformed = applyImageFilters(activeItem.imageData, state.options)
    const grid = assembleGrid(transformed, cachedTable, state.options)
    lastGrid = grid

    const columns = grid[0]?.length ?? 0
    const rows = grid.length
    canvas.width = columns * cachedCellSize.cellWidthPx
    canvas.height = rows * cachedCellSize.cellHeightPx

    // White page / black ink by default, regardless of the app's own theme
    // (matches ASCGen2's own output convention and .preview-canvas-wrap's
    // fixed white background) - PNG and XHTML export use the same pair, see
    // exportPanel.ts.
    renderGridToCanvas(ctx!, grid, {
      cellWidthPx: cachedCellSize.cellWidthPx,
      cellHeightPx: cachedCellSize.cellHeightPx,
      background: '#ffffff',
      foreground: '#000000',
    })
    applyZoom()
  }

  store.subscribe(render)
  render()
}
