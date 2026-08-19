// core/src/pipeline.ts
//
// The ONE place preview.ts and exportPanel.ts both call before assembleGrid -
// having two independently-reimplemented call sites for the same transform
// order was exactly the class of bug the v1 whole-branch review caught, so
// this exists specifically to prevent a repeat.

import { flipImage, invertImage, rotateImage, sharpenImage } from './filters'
import type { MappingOptions } from './types'

/**
 * Applies rotate -> flip -> invert -> sharpen in that fixed order, matching
 * ASCGen2's own Edit menu grouping (Input transforms - rotate/flip - before
 * Output transforms - invert/sharpen). No-op fields are skipped internally by
 * each filter (see filters.ts), so calling this with an all-default options
 * object is cheap - just a single ImageData clone.
 */
export function applyImageFilters(imageData: ImageData, options: MappingOptions): ImageData {
  let result = imageData
  if (options.rotate) {
    result = rotateImage(result, options.rotate)
  }
  if (options.flipHorizontal || options.flipVertical) {
    result = flipImage(result, !!options.flipHorizontal, !!options.flipVertical)
  }
  if (options.invert) {
    result = invertImage(result)
  }
  if (options.sharpen && options.sharpen !== 'none') {
    result = sharpenImage(result, options.sharpen)
  }
  return result
}
