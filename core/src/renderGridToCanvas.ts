import { rgbToHex } from './color'
import type { Grid } from './types'

export interface RenderOptions {
  cellWidthPx: number
  cellHeightPx: number
  background: string
  foreground: string
}

export interface RenderResult {
  pixelWidth: number
  pixelHeight: number
}

export function renderGridToCanvas(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  options: RenderOptions,
): RenderResult {
  const rows = grid.length
  const columns = grid[0]?.length ?? 0
  const pixelWidth = columns * options.cellWidthPx
  const pixelHeight = rows * options.cellHeightPx

  ctx.fillStyle = options.background
  ctx.fillRect(0, 0, pixelWidth, pixelHeight)

  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillStyle = options.foreground

  // Assigning ctx.font or fillStyle re-parses the string, so both are set only
  // when a cell differs from the one before; '' never matches a real font.
  let lastFont = ''
  let lastFillStyle = options.foreground

  for (let row = 0; row < rows; row++) {
    const cells = grid[row] ?? []
    for (let col = 0; col < cells.length; col++) {
      const cell = cells[col]
      if (!cell) continue
      const font = `${cell.font.sizePx}px ${cell.font.family}`
      if (font !== lastFont) {
        ctx.font = font
        lastFont = font
      }
      const fillStyle = cell.color ? rgbToHex(cell.color) : options.foreground
      if (fillStyle !== lastFillStyle) {
        ctx.fillStyle = fillStyle
        lastFillStyle = fillStyle
      }
      ctx.fillText(cell.char, col * options.cellWidthPx, row * options.cellHeightPx)
    }
  }

  return { pixelWidth, pixelHeight }
}
