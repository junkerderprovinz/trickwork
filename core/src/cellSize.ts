import { CELL_ASPECT_COMPENSATION } from './grid'
import type { FontSpec, FontWidthMeasurer } from './types'

export interface CellSize {
  cellWidthPx: number
  cellHeightPx: number
}

/**
 * Derives the render grid's cell pitch from the selected font, since
 * proportional glyphs run far wider than a fixed 8x16 cell (Georgia 'W' is
 * about 14px at 14px). Height reuses CELL_ASPECT_COMPENSATION so the grid is
 * drawn at the aspect ratio the image was sampled at.
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
