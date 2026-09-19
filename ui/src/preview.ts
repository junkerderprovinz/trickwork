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
import { subscribeLocale, t } from './i18n'
import type { Store } from './state'

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

  // Zoom is view state rather than an option, so undo, presets and exports
  // ignore it.
  let zoomPct = DEFAULT_ZOOM

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
  zoomRow.appendChild(zoomCluster)
  container.appendChild(zoomRow)

  function applyLabels(): void {
    eyebrow.textContent = t('preview.eyebrow')
    empty.textContent = t('preview.empty')
    zoomOutButton.setAttribute('aria-label', t('preview.zoomOut'))
    zoomInButton.setAttribute('aria-label', t('preview.zoomIn'))
    zoomLabel.title = t('preview.zoomReset')
  }
  applyLabels()
  subscribeLocale(applyLabels)

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
    // Sizing the layout box instead of using a transform lets canvasWrap
    // overflow and scroll.
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

  // Ctrl or Cmd with the wheel zooms; a bare wheel still scrolls.
  canvasWrap.addEventListener(
    'wheel',
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return
      event.preventDefault()
      setZoom(zoomPct - Math.sign(event.deltaY) * ZOOM_STEP)
    },
    { passive: false },
  )

  // Drag to pan, in addition to the scrollbars.
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

  // The font-width table costs a canvas readback per character, and render()
  // runs on every store change, including each frame of a slider drag. Only
  // the charset and the font feed it.
  let lastTableKey: string | null = null
  let cachedTable: FontWidthTable | null = null
  let cachedCellSize: CellSize | null = null
  // Zoom resets when the active image changes, not on every render.
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

    const columns = grid[0]?.length ?? 0
    const rows = grid.length
    canvas.width = columns * cachedCellSize.cellWidthPx
    canvas.height = rows * cachedCellSize.cellHeightPx

    // Black ink on white regardless of the theme, as in ASCGen2 and in the
    // PNG and XHTML exports.
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
