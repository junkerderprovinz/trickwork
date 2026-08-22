// core/src/pipeline.ts
//
// The ONE place preview.ts and exportPanel.ts both call before assembleGrid -
// having two independently-reimplemented call sites for the same transform
// order was exactly the class of bug the v1 whole-branch review caught, so
// this exists specifically to prevent a repeat.

import { applyLevels, cropImage, flipImage, invertImage, rotateImage, sharpenImage } from './filters'
import type { MappingOptions } from './types'

/**
 * Applies crop -> rotate -> flip -> invert -> levels -> sharpen in that fixed
 * order, matching ASCGen2's own Edit menu grouping (Input transforms -
 * rotate/flip - before Output transforms - invert/levels/sharpen, all under
 * one Edit > Output dialog there); crop runs before either group since every
 * later step should act on "the region the user actually selected," not the
 * full original frame. Levels runs before sharpen so its tonal remap isn't
 * fighting the sharpen kernel's own contrast boost. No-op fields are skipped
 * internally by each filter (see filters.ts), so calling this with an
 * all-default options object is cheap - just a single ImageData clone.
 */
/**
 * The width/height cropImage()/rotateImage() (via applyImageFilters above)
 * would produce for this options object, without doing any pixel work -
 * dimensions only, mirroring their exact rounding/clamping so this never
 * drifts from what the real pipeline actually produces. Used by the UI to
 * predict the aspect-ratio-matched row count live while dragging the width
 * slider, where running the full pixel pipeline on every 'input' tick would
 * be wasted work - the prediction is cosmetic only (assembleGrid always
 * recomputes the real row count itself when MappingOptions.rows is unset).
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
  if (options.rotate === 90 || options.rotate === 270) {
    ;[w, h] = [h, w]
  }
  return { width: w, height: h }
}

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
