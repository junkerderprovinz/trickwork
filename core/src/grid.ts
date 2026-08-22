// core/src/grid.ts
import {
  computeBlockAverageColor,
  computeBlockLuminance,
  mapLuminanceToChar,
  mapLuminanceToCharWithAchieved,
} from './mapping'
import type { FontWidthTable, Grid, MappingOptions } from './types'

/**
 * Floyd-Steinberg diffusion coefficients, applied to the CHARACTER grid (the
 * error between a cell's target luminance and the achieved luminance of the
 * glyph actually chosen for it) rather than to source pixels - see
 * docs/superpowers/specs/2026-08-19-trickwork-v1.1-design.md, section 3.3.
 */
const DITHER_RIGHT = 7 / 16
const DITHER_BELOW_LEFT = 3 / 16
const DITHER_BELOW = 5 / 16
const DITHER_BELOW_RIGHT = 1 / 16

/**
 * Character cells are roughly twice as tall as they are wide on screen, so
 * sampling square pixel blocks would visibly stretch the output vertically.
 * This compensates by sampling taller blocks than the column width implies.
 *
 * Exported because the render side has to agree with the sampling side: a grid
 * sampled at this aspect ratio must be drawn back out at the same one, or the
 * output is stretched. `measureCellSize` in cellSize.ts is the render-side
 * consumer.
 */
export const CELL_ASPECT_COMPENSATION = 2

/**
 * The row count that keeps the output matching the source image's own
 * proportions at the given column count - the same formula assembleGrid
 * itself falls back to whenever MappingOptions.rows is omitted. Exported so
 * the UI's aspect-ratio lock (controls.ts) can show/derive the same value
 * without re-deriving the formula a second time and risking it drifting out
 * of step with the one grid sampling actually uses.
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

  // One accumulator per cell, only allocated when dithering is on. A cell's
  // diffused error can arrive from its left, top-left, top, or top-right
  // neighbour, so this has to be a full 2D buffer read-and-written across
  // rows, not a value that could be tracked with a single running variable.
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
