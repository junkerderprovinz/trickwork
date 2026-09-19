import {
  computeBlockAverageColor,
  computeBlockLuminance,
  mapLuminanceToChar,
  mapLuminanceToCharWithAchieved,
} from './mapping'
import type { FontWidthTable, Grid, MappingOptions } from './types'

/**
 * Floyd-Steinberg coefficients, applied to the character grid: the error is the
 * gap between a cell's target luminance and that of the glyph chosen for it.
 */
const DITHER_RIGHT = 7 / 16
const DITHER_BELOW_LEFT = 3 / 16
const DITHER_BELOW = 5 / 16
const DITHER_BELOW_RIGHT = 1 / 16

/**
 * Character cells are about twice as tall as wide, so blocks are sampled taller
 * than the column width implies. measureCellSize draws the grid at the same
 * ratio, or the output would stretch.
 */
export const CELL_ASPECT_COMPENSATION = 2

/**
 * The row count that keeps the source proportions at the given column count,
 * shared by assembleGrid and the UI's aspect-ratio lock.
 */
export function computeAutoRows(sourceWidth: number, sourceHeight: number, columns: number): number {
  const blockW = sourceWidth / Math.max(1, columns)
  const blockH = blockW * CELL_ASPECT_COMPENSATION
  return Math.max(1, Math.round(sourceHeight / blockH))
}

export function assembleGrid(
  imageData: ImageData,
  table: FontWidthTable,
  options: MappingOptions,
): Grid {
  const { width, height } = imageData
  const columns = Math.max(1, options.columns)
  const blockW = width / columns
  const blockH = blockW * CELL_ASPECT_COMPENSATION
  const rows =
    options.rows !== undefined
      ? Math.max(1, Math.round(options.rows))
      : computeAutoRows(width, height, columns)

  // Error reaches a cell from its left neighbour and from three cells in the
  // row above, so it needs a buffer per cell.
  const errorBuffer: number[][] | null = options.dither
    ? Array.from({ length: rows }, () => new Array<number>(columns).fill(0))
    : null

  const grid: Grid = []
  for (let row = 0; row < rows; row++) {
    const cells = []
    for (let col = 0; col < columns; col++) {
      const x = Math.floor(col * blockW)
      const y = Math.floor(row * blockH)
      const nextX = col === columns - 1 ? width : Math.floor((col + 1) * blockW)
      const nextY = row === rows - 1 ? height : Math.floor((row + 1) * blockH)
      const w = Math.max(1, nextX - x)
      const h = Math.max(1, nextY - y)
      const rawLuminance = computeBlockLuminance(imageData, x, y, w, h)
      const luminance = applyBrightnessContrast(
        rawLuminance,
        options.brightness,
        options.contrast,
      )

      let char: string
      if (errorBuffer) {
        const rowErrors = errorBuffer[row] as number[]
        const target = Math.min(1, Math.max(0, luminance + (rowErrors[col] ?? 0)))
        const picked = mapLuminanceToCharWithAchieved(target, table)
        char = picked.char
        const error = target - picked.achievedLuminance
        if (col + 1 < columns) rowErrors[col + 1] = (rowErrors[col + 1] ?? 0) + error * DITHER_RIGHT
        if (row + 1 < rows) {
          const nextRowErrors = errorBuffer[row + 1] as number[]
          if (col - 1 >= 0) {
            nextRowErrors[col - 1] = (nextRowErrors[col - 1] ?? 0) + error * DITHER_BELOW_LEFT
          }
          nextRowErrors[col] = (nextRowErrors[col] ?? 0) + error * DITHER_BELOW
          if (col + 1 < columns) {
            nextRowErrors[col + 1] = (nextRowErrors[col + 1] ?? 0) + error * DITHER_BELOW_RIGHT
          }
        }
      } else {
        char = mapLuminanceToChar(luminance, table)
      }

      const color = options.color ? computeBlockAverageColor(imageData, x, y, w, h) : undefined
      cells.push(color ? { char, font: options.font, color } : { char, font: options.font })
    }
    grid.push(cells)
  }
  return grid
}

function applyBrightnessContrast(
  luminance: number,
  brightness: number,
  contrast: number,
): number {
  const contrastFactor = 1 + contrast
  const contrasted = (luminance - 0.5) * contrastFactor + 0.5
  const adjusted = contrasted + brightness
  return Math.min(1, Math.max(0, adjusted))
}
