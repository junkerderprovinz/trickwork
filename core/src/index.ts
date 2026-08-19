// core/src/index.ts
export * from './types'
export * from './charsets'
export { createCanvasGlyphMeasurer, createCanvasWidthMeasurer } from './glyphMeasure'
export { buildFontWidthTable } from './fontWidthTable'
export { measureCellSize, type CellSize } from './cellSize'
export { computeDownscaleDimensions } from './downscale'
export { decodeAndPrepareImage } from './ingest'
export {
  computeBlockAverageColor,
  computeBlockLuminance,
  mapLuminanceToChar,
  mapLuminanceToCharWithAchieved,
} from './mapping'
export { assembleGrid, CELL_ASPECT_COMPENSATION } from './grid'
export { renderGridToCanvas, type RenderOptions, type RenderResult } from './renderGridToCanvas'
export { toText } from './export/toText'
export { toXHTML, type XHTMLOptions } from './export/toXHTML'
export { toRTF } from './export/toRTF'
export { toImage, type CanvasLike, type CanvasFactory } from './export/toImage'
export { invertImage, rotateImage, flipImage, sharpenImage, applyLevels } from './filters'
export { applyImageFilters } from './pipeline'
export { rgbToHex, sameColor } from './color'
export { computeLuminanceHistogram } from './histogram'
