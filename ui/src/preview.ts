import {
  assembleGrid,
  buildFontWidthTable,
  createCanvasGlyphMeasurer,
  renderGridToCanvas,
} from 'ascii-supergenerator-core'
import type { Store } from './state'

const PREVIEW_CELL_WIDTH_PX = 8
const PREVIEW_CELL_HEIGHT_PX = 16

export function mountPreview(container: HTMLElement, store: Store): void {
  const canvas = document.createElement('canvas')
  canvas.className = 'preview-canvas'
  container.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('mountPreview: 2D context unavailable')
  }

  const measure = createCanvasGlyphMeasurer()

  function render() {
    const state = store.getState()
    const activeItem = state.items.find((item) => item.id === state.activeItemId)
    if (!activeItem?.imageData) {
      canvas.width = 0
      canvas.height = 0
      return
    }

    const table = buildFontWidthTable(state.options.charset, state.options.font, measure)
    const grid = assembleGrid(activeItem.imageData, table, state.options)

    const columns = grid[0]?.length ?? 0
    const rows = grid.length
    canvas.width = columns * PREVIEW_CELL_WIDTH_PX
    canvas.height = rows * PREVIEW_CELL_HEIGHT_PX

    renderGridToCanvas(ctx!, grid, {
      cellWidthPx: PREVIEW_CELL_WIDTH_PX,
      cellHeightPx: PREVIEW_CELL_HEIGHT_PX,
      background: '#000000',
      foreground: '#ffffff',
    })
  }

  store.subscribe(render)
  render()
}
