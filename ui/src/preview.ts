import {
  assembleGrid,
  buildFontWidthTable,
  createCanvasGlyphMeasurer,
  createCanvasWidthMeasurer,
  measureCellSize,
  renderGridToCanvas,
  type CellSize,
  type FontWidthTable,
} from 'trickwork-core'
import type { Store } from './state'

export function mountPreview(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  eyebrow.textContent = 'Preview'
  container.appendChild(eyebrow)

  const empty = document.createElement('div')
  empty.className = 'preview-empty glim-well'
  empty.textContent = 'Drop an image above to see it here as ASCII art.'
  container.appendChild(empty)

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

    const grid = assembleGrid(activeItem.imageData, cachedTable, state.options)

    const columns = grid[0]?.length ?? 0
    const rows = grid.length
    canvas.width = columns * cachedCellSize.cellWidthPx
    canvas.height = rows * cachedCellSize.cellHeightPx

    renderGridToCanvas(ctx!, grid, {
      cellWidthPx: cachedCellSize.cellWidthPx,
      cellHeightPx: cachedCellSize.cellHeightPx,
      background: '#000000',
      foreground: '#ffffff',
    })
  }

  store.subscribe(render)
  render()
}
