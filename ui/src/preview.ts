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

export function mountPreview(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const empty = document.createElement('div')
  empty.className = 'preview-empty glim-well'
  container.appendChild(empty)

  function applyLabels(): void {
    eyebrow.textContent = t('preview.eyebrow')
    empty.textContent = t('preview.empty')
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

  function render() {
    const state = store.getState()
    const activeItem = state.items.find((item) => item.id === state.activeItemId)
    if (!activeItem?.imageData) {
      canvas.width = 0
      canvas.height = 0
      empty.style.display = ''
      canvasWrap.style.display = 'none'
      return
    }
    empty.style.display = 'none'
    canvasWrap.style.display = ''

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
  }

  store.subscribe(render)
  render()
}
