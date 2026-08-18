// core/src/cellSize.ts
import { CELL_ASPECT_COMPENSATION } from './grid'
import type { FontSpec, FontWidthMeasurer } from './types'

export interface CellSize {
  cellWidthPx: number
  cellHeightPx: number
}

/**
 * Derives the render grid's cell pitch from the font actually selected.
 *
 * The pitch used to be hardcoded at 8x16px, which happens to be about right
 * for a monospace font at 14px and badly wrong for everything else: the
 * proportional stacks this app exists to support measure far wider (Georgia
 * 'W' and Arial '@' are both ~14px at a 14px font size), so their glyphs
 * overlapped by more than half a cell in both the live preview and the PNG
 * export.
 *
 * The measurement itself is injected, so this — the part with the actual
 * arithmetic — stays pure and testable without a browser. Height reuses
 * CELL_ASPECT_COMPENSATION from grid.ts so the pitch the grid is DRAWN at
 * matches the aspect ratio the image was SAMPLED at.
 */
export function measureCellSize(
  font: FontSpec,
  measure: FontWidthMeasurer,
): CellSize {
  const measured = measure(font)
  // A canvas that cannot resolve the font can report 0, and a broken measurer
  // could hand back NaN; either would collapse the grid to a zero-size canvas.
  const width = Number.isFinite(measured) ? Math.max(1, Math.ceil(measured)) : 1
  return {
    cellWidthPx: width,
    cellHeightPx: width * CELL_ASPECT_COMPENSATION,
  }
}
