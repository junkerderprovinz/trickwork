// core/src/renderGridToCanvas.ts
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

  // Assigning ctx.font re-parses the CSS font shorthand and can invalidate the
  // canvas's text-shaping state, so only do it when the font actually differs
  // from the previous cell. Every grid this app builds today is single-font,
  // which made the unconditional per-cell assignment pure overhead on every
  // cell but the first. The empty sentinel can never equal a real font string
  // (always "<number>px <family>"), so the first cell always sets it.
  let lastFont = ''

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
      ctx.fillText(cell.char, col * options.cellWidthPx, row * options.cellHeightPx)
    }
  }

  return { pixelWidth, pixelHeight }
}
