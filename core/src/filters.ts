// core/src/filters.ts
//
// Pixel-level transforms applied to the decoded source image BEFORE the
// character-mapping stage, mirroring ASCGen2's own separation of these into
// standalone filter classes (Filters/Flip.cs, Filters/Sharpen.cs,
// Filters/UnsharpMask.cs) rather than folding them into assembleGrid. Each
// function is pure: it never mutates its input, always returns a new
// ImageData. Dithering is NOT here — it diffuses character-selection error,
// not pixel error, so it lives inside grid.ts's own raster loop instead (see
// docs/superpowers/specs/2026-08-19-trickwork-v1.1-design.md, section 3.3).

import type { CropSpec, LevelsSpec, Rotation, SharpenMethod } from './types'

function cloneImageData(imageData: ImageData): ImageData {
  return {
    data: new Uint8ClampedArray(imageData.data),
    width: imageData.width,
    height: imageData.height,
    colorSpace: imageData.colorSpace,
  } as ImageData
}

/**
 * Extracts the sub-region `crop` describes (fractions of the source image,
 * see CropSpec) as a new, standalone ImageData - runs FIRST in the pipeline
 * (pipeline.ts), before rotate/flip/invert/levels/sharpen, since every one
 * of those should act on "the region the user actually wants," not on the
 * full original frame.
 */
export function cropImage(imageData: ImageData, crop: CropSpec): ImageData {
  const { width: srcW, height: srcH, data: srcData } = imageData
  const x = Math.round(Math.min(1, Math.max(0, crop.x)) * srcW)
  const y = Math.round(Math.min(1, Math.max(0, crop.y)) * srcH)
  const requestedW = Math.max(1, Math.round(Math.min(1, Math.max(0, crop.width)) * srcW))
  const requestedH = Math.max(1, Math.round(Math.min(1, Math.max(0, crop.height)) * srcH))
  const w = Math.max(1, Math.min(requestedW, srcW - x))
  const h = Math.max(1, Math.min(requestedH, srcH - y))

  const dstData = new Uint8ClampedArray(w * h * 4)
  for (let row = 0; row < h; row++) {
    const srcRowStart = ((y + row) * srcW + x) * 4
    dstData.set(srcData.subarray(srcRowStart, srcRowStart + w * 4), row * w * 4)
  }
  return { data: dstData, width: w, height: h, colorSpace: imageData.colorSpace } as ImageData
}

export function invertImage(imageData: ImageData): ImageData {
  const out = cloneImageData(imageData)
  const { data } = out
  for (let i = 0; i < data.length; i += 4) {
    data[i] = 255 - (data[i] ?? 0)
    data[i + 1] = 255 - (data[i + 1] ?? 0)
    data[i + 2] = 255 - (data[i + 2] ?? 0)
    // alpha (i + 3) untouched
  }
  return out
}

export function rotateImage(imageData: ImageData, degrees: Rotation): ImageData {
  if (degrees === 0) return cloneImageData(imageData)

  const { width: srcW, height: srcH, data: srcData } = imageData
  const dstW = degrees === 180 ? srcW : srcH
  const dstH = degrees === 180 ? srcH : srcW
  const dstData = new Uint8ClampedArray(dstW * dstH * 4)

  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      const srcI = (y * srcW + x) * 4
      let dstX: number
      let dstY: number
      if (degrees === 90) {
        dstX = srcH - 1 - y
        dstY = x
      } else if (degrees === 180) {
        dstX = srcW - 1 - x
        dstY = srcH - 1 - y
      } else {
        // 270
        dstX = y
        dstY = srcW - 1 - x
      }
      const dstI = (dstY * dstW + dstX) * 4
      dstData[dstI] = srcData[srcI] ?? 0
      dstData[dstI + 1] = srcData[srcI + 1] ?? 0
      dstData[dstI + 2] = srcData[srcI + 2] ?? 0
      dstData[dstI + 3] = srcData[srcI + 3] ?? 0
    }
  }

  return { data: dstData, width: dstW, height: dstH, colorSpace: imageData.colorSpace } as ImageData
}

export function flipImage(imageData: ImageData, horizontal: boolean, vertical: boolean): ImageData {
  if (!horizontal && !vertical) return cloneImageData(imageData)

  const { width, height, data: srcData } = imageData
  const dstData = new Uint8ClampedArray(srcData.length)

  for (let y = 0; y < height; y++) {
    const dstY = vertical ? height - 1 - y : y
    for (let x = 0; x < width; x++) {
      const dstX = horizontal ? width - 1 - x : x
      const srcI = (y * width + x) * 4
      const dstI = (dstY * width + dstX) * 4
      dstData[dstI] = srcData[srcI] ?? 0
      dstData[dstI + 1] = srcData[srcI + 1] ?? 0
      dstData[dstI + 2] = srcData[srcI + 2] ?? 0
      dstData[dstI + 3] = srcData[srcI + 3] ?? 0
    }
  }

  return { data: dstData, width, height, colorSpace: imageData.colorSpace } as ImageData
}

/**
 * Photoshop-style RGB/composite Levels: clip everything at or below `black`
 * to 0 and at or above `white` to 255, linearly remap what's between, then
 * apply a gamma (midtone) curve - identical to ASCGen2's own "Levels" dialog
 * (single composite histogram, not per-channel R/G/B), applied to all three
 * channels equally so it stays correct under color output too, not just the
 * luminance mapping.
 */
export function applyLevels(imageData: ImageData, levels: LevelsSpec): ImageData {
  const { black, gamma, white } = levels
  if (black === 0 && gamma === 1 && white === 255) return cloneImageData(imageData)

  const out = cloneImageData(imageData)
  const { data } = out
  const span = white - black || 1
  const invGamma = 1 / gamma
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const input = data[i + c] ?? 0
      const normalized = Math.min(1, Math.max(0, (input - black) / span))
      data[i + c] = Math.round(normalized ** invGamma * 255)
    }
    // alpha (i + 3) untouched
  }
  return out
}

/** 3x3 convolution, edge pixels clamp to the nearest in-bounds source pixel. */
function convolve3x3(imageData: ImageData, kernel: number[]): ImageData {
  const { width, height, data: srcData } = imageData
  const out = cloneImageData(imageData)
  const dstData = out.data

  const at = (x: number, y: number, channel: number): number => {
    const cx = Math.min(width - 1, Math.max(0, x))
    const cy = Math.min(height - 1, Math.max(0, y))
    return srcData[(cy * width + cx) * 4 + channel] ?? 0
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let channel = 0; channel < 3; channel++) {
        let sum = 0
        let k = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += at(x + kx, y + ky, channel) * (kernel[k] ?? 0)
            k++
          }
        }
        dstData[(y * width + x) * 4 + channel] = sum
      }
    }
  }

  return out
}

const SHARPEN_KERNEL = [0, -1, 0, -1, 5, -1, 0, -1, 0]
/** 3x3 box blur - the "unsharp" half of unsharp masking. */
const BOX_BLUR_KERNEL = [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9]
const UNSHARP_AMOUNT = 1

export function sharpenImage(imageData: ImageData, method: SharpenMethod): ImageData {
  if (method === 'none') return cloneImageData(imageData)
  if (method === 'sharpen') return convolve3x3(imageData, SHARPEN_KERNEL)

  // Unsharp mask: original + amount * (original - blurred), clamped by the
  // Uint8ClampedArray write itself.
  const blurred = convolve3x3(imageData, BOX_BLUR_KERNEL)
  const out = cloneImageData(imageData)
  const { data: srcData } = imageData
  const { data: blurData } = blurred
  const dstData = out.data
  for (let i = 0; i < dstData.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const original = srcData[i + c] ?? 0
      const blur = blurData[i + c] ?? 0
      dstData[i + c] = original + UNSHARP_AMOUNT * (original - blur)
    }
  }
  return out
}
