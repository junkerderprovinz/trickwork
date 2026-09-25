import { applyLevels, cropImage, flipImage, invertImage, rotatedSize, rotateImage, sharpenImage } from './filters'
import type { MappingOptions } from './types'

/**
 * The size cropImage and rotateImage would produce, with the same rounding and
 * clamping but no pixel work, so the UI can predict the auto row count while
 * the width slider moves. assembleGrid still computes the real one.
 */
export function effectiveDimensions(
  width: number,
  height: number,
  options: Pick<MappingOptions, 'crop' | 'rotate'>,
): { width: number; height: number } {
  let w = width
  let h = height
  if (options.crop) {
    const x = Math.round(Math.min(1, Math.max(0, options.crop.x)) * w)
    const y = Math.round(Math.min(1, Math.max(0, options.crop.y)) * h)
    const requestedW = Math.max(1, Math.round(Math.min(1, Math.max(0, options.crop.width)) * w))
    const requestedH = Math.max(1, Math.round(Math.min(1, Math.max(0, options.crop.height)) * h))
    w = Math.max(1, Math.min(requestedW, w - x))
    h = Math.max(1, Math.min(requestedH, h - y))
  }
  return options.rotate ? rotatedSize(w, h, options.rotate) : { width: w, height: h }
}

/**
 * Applies crop, rotate, flip, invert, levels and sharpen in ASCGen2's order,
 * for both preview and export. Crop comes first so every later step acts on
 * the selected region, and levels runs before sharpen so the tonal remap does
 * not fight the kernel's contrast boost.
 */
export function applyImageFilters(imageData: ImageData, options: MappingOptions): ImageData {
  let result = imageData
  if (options.crop) {
    result = cropImage(result, options.crop)
  }
  if (options.rotate) {
    result = rotateImage(result, options.rotate)
  }
  if (options.flipHorizontal || options.flipVertical) {
    result = flipImage(result, !!options.flipHorizontal, !!options.flipVertical)
  }
  if (options.invert) {
    result = invertImage(result)
  }
  if (options.levels) {
    result = applyLevels(result, options.levels)
  }
  if (options.sharpen && options.sharpen !== 'none') {
    result = sharpenImage(result, options.sharpen)
  }
  return result
}
