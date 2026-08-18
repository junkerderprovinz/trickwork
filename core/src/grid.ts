// core/src/grid.ts
import { computeBlockLuminance, mapLuminanceToChar } from './mapping'
import type { FontWidthTable, Grid, MappingOptions } from './types'

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

export function assembleGrid(
  imageData: ImageData,
  table: FontWidthTable,
  options: MappingOptions,
): Grid {
  const { width, height } = imageData
  const columns = Math.max(1, options.columns)
  const blockW = width / columns
  const blockH = blockW * CELL_ASPECT_COMPENSATION
  const rows = Math.max(1, Math.round(height / blockH))

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
      const char = mapLuminanceToChar(luminance, table)
      cells.push({ char, font: options.font })
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
