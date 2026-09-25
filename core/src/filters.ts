// Pixel transforms applied to the source image before character mapping,
// kept apart from assembleGrid as ASCGen2 keeps its filter classes. Each one
// returns a new ImageData and leaves its input alone. Dithering diffuses the
// error of the chosen characters rather than of pixels, so it lives in grid.ts.

import type { CropSpec, LevelsSpec, Rotation, SharpenMethod } from './types'

function cloneImageData(imageData: ImageData): ImageData {
  return {
    data: new Uint8ClampedArray(imageData.data),
    width: imageData.width,
    height: imageData.height,
    colorSpace: imageData.colorSpace,
  } as ImageData
}

/** Extracts the region `crop` describes as a new ImageData. */
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

/** A turn reduced to [0, 360), so -15 and 345 compare equal. */
export function normalizeRotation(degrees: Rotation): number {
  const turn = degrees % 360
  return turn < 0 ? turn + 360 : turn
}

/**
 * The size rotateImage returns: the source's for a half turn, swapped for a
 * quarter turn, and for any other angle the box that holds the whole rotated
 * source.
 */
export function rotatedSize(width: number, height: number, degrees: Rotation): { width: number; height: number } {
  const turn = normalizeRotation(degrees)
  if (turn === 0 || turn === 180) return { width, height }
  if (turn === 90 || turn === 270) return { width: height, height: width }
  const rad = (turn * Math.PI) / 180
  const cos = Math.abs(Math.cos(rad))
  const sin = Math.abs(Math.sin(rad))
  return {
    width: Math.max(1, Math.round(width * cos + height * sin)),
    height: Math.max(1, Math.round(width * sin + height * cos)),
  }
}

/**
 * A quarter turn moves pixels without resampling. Any other angle is
 * resampled, and the corners the larger box adds are transparent, which the
 * mapping reads as empty whatever later filters do to their colour.
 */
export function rotateImage(imageData: ImageData, degrees: Rotation): ImageData {
  const turn = normalizeRotation(degrees)
  if (turn === 0) return cloneImageData(imageData)
  if (turn % 90 !== 0) return rotateFree(imageData, turn)

  const { width: srcW, height: srcH, data: srcData } = imageData
  const dstW = turn === 180 ? srcW : srcH
  const dstH = turn === 180 ? srcH : srcW
  const dstData = new Uint8ClampedArray(dstW * dstH * 4)

  for (let y = 0; y < srcH; y++) {
    for (let x = 0; x < srcW; x++) {
      const srcI = (y * srcW + x) * 4
      let dstX: number
      let dstY: number
      if (turn === 90) {
        dstX = srcH - 1 - y
        dstY = x
      } else if (turn === 180) {
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

// Each destination pixel's centre is turned back onto the source about the
// centres of both images and sampled bilinearly. A point outside the source
// stays transparent, white so that a filter which ignores alpha sees paper.
function rotateFree(imageData: ImageData, turn: number): ImageData {
  const { width: srcW, height: srcH, data: src } = imageData
  const { width: dstW, height: dstH } = rotatedSize(srcW, srcH, turn)
  const rad = (turn * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const dst = new Uint8ClampedArray(dstW * dstH * 4)
  const at = (x: number, y: number, channel: number): number => src[(y * srcW + x) * 4 + channel] ?? 0

  for (let y = 0; y < dstH; y++) {
    for (let x = 0; x < dstW; x++) {
      const u = x + 0.5 - dstW / 2
      const v = y + 0.5 - dstH / 2
      const sx = u * cos + v * sin + srcW / 2 - 0.5
      const sy = -u * sin + v * cos + srcH / 2 - 0.5
      const i = (y * dstW + x) * 4
      if (sx < -0.5 || sy < -0.5 || sx > srcW - 0.5 || sy > srcH - 0.5) {
        dst[i] = 255
        dst[i + 1] = 255
        dst[i + 2] = 255
        continue
      }
      const x0 = Math.min(srcW - 1, Math.max(0, Math.floor(sx)))
      const y0 = Math.min(srcH - 1, Math.max(0, Math.floor(sy)))
      const x1 = Math.min(srcW - 1, x0 + 1)
      const y1 = Math.min(srcH - 1, y0 + 1)
      const fx = Math.min(1, Math.max(0, sx - x0))
      const fy = Math.min(1, Math.max(0, sy - y0))
      for (let c = 0; c < 3; c++) {
        const top = at(x0, y0, c) * (1 - fx) + at(x1, y0, c) * fx
        const bottom = at(x0, y1, c) * (1 - fx) + at(x1, y1, c) * fx
        dst[i + c] = top * (1 - fy) + bottom * fy
      }
      dst[i + 3] = 255
    }
  }

  return { data: dst, width: dstW, height: dstH, colorSpace: imageData.colorSpace } as ImageData
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
 * Composite Levels as in ASCGen2 and Photoshop: clips at `black` and `white`,
 * remaps linearly between them, then applies the gamma curve. All three
 * channels get the same curve, so colour output stays right too.
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
/** The blur half of unsharp masking. */
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
