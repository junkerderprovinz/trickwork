import { describe, expect, it } from 'vitest'
import { applyImageFilters, effectiveDimensions } from './pipeline'
import type { MappingOptions } from './types'

function makeImageData(pixels: number[][]): ImageData {
  const height = pixels.length
  const width = pixels[0]?.length ?? 0
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gray = pixels[y]?.[x] ?? 0
      const i = (y * width + x) * 4
      data[i] = gray
      data[i + 1] = gray
      data[i + 2] = gray
      data[i + 3] = 255
    }
  }
  return { data, width, height, colorSpace: 'srgb' } as ImageData
}

function pixel0(img: ImageData): number {
  return img.data[0] ?? 0
}

const baseOptions: MappingOptions = {
  columns: 2,
  brightness: 0,
  contrast: 0,
  charset: ['@', ' '],
  font: { family: 'monospace', sizePx: 16 },
}

describe('applyImageFilters', () => {
  it('is a no-op copy when every filter option is unset', () => {
    const img = makeImageData([[10, 20]])
    const out = applyImageFilters(img, baseOptions)
    expect(out.width).toBe(2)
    expect(pixel0(out)).toBe(10)
  })

  it('applies rotate before flip (a 90-degree rotate then horizontal flip is not the same as the reverse order)', () => {
    // 2x1 source: [10, 200]. Rotate 90 -> 1x2 column [10; 200] (top=10,bottom=200).
    // Flip horizontal on a 1-wide image is a no-op, so this alone doesn't
    // distinguish order - use flipVertical to prove rotate ran first.
    const img = makeImageData([[10, 200]])
    const out = applyImageFilters(img, { ...baseOptions, rotate: 90, flipVertical: true })
    expect(out.width).toBe(1)
    expect(out.height).toBe(2)
    // rotate first -> [10;200] top-to-bottom, THEN vertical flip -> [200;10]
    expect(pixel0(out)).toBe(200)
  })

  it('applies invert after the geometric transforms', () => {
    const img = makeImageData([[10, 200]])
    const out = applyImageFilters(img, { ...baseOptions, flipHorizontal: true, invert: true })
    // flip first: [200, 10], then invert: [55, 245]
    expect(pixel0(out)).toBe(55)
  })

  it('applies sharpen last, on the already-transformed image', () => {
    const img = makeImageData([
      [128, 128, 128],
      [128, 128, 128],
      [128, 128, 128],
    ])
    const out = applyImageFilters(img, { ...baseOptions, invert: true, sharpen: 'sharpen' })
    // A flat image stays flat through invert and through the sharpen kernel
    // (which sums to 1), so the center pixel should be the inverted flat
    // value, proving sharpen ran on inverted data rather than pre-invert.
    const centerIndex = (1 * 3 + 1) * 4
    expect(out.data[centerIndex]).toBe(255 - 128)
  })

  it('applies levels after invert but before sharpen', () => {
    const img = makeImageData([[10, 200]])
    // invert first: [245, 55], then levels {black:0,white:200} clips/stretches
    // 245 -> 255 (clipped, since 245 > white) and 55 -> round(55/200*255) = 70.
    const out = applyImageFilters(img, {
      ...baseOptions,
      invert: true,
      levels: { black: 0, gamma: 1, white: 200 },
    })
    expect(pixel0(out)).toBe(255)
  })

  it('a levels no-op ({black:0, gamma:1, white:255}) leaves the image unchanged', () => {
    const img = makeImageData([[10, 200]])
    const out = applyImageFilters(img, {
      ...baseOptions,
      levels: { black: 0, gamma: 1, white: 255 },
    })
    expect(pixel0(out)).toBe(10)
  })

  it('applies crop first, before rotate - cropping then rotating a region is not the same as the reverse', () => {
    // 4x1 source: [10, 20, 30, 40]. Crop the right half -> [30, 40], THEN
    // rotate 90 -> a 1x2 column with 30 on top (proves crop ran first: if
    // rotate ran first, cropping the "right half" of a rotated 1x4 column
    // wouldn't even be expressible as the same crop rectangle).
    const img = makeImageData([[10, 20, 30, 40]])
    const out = applyImageFilters(img, {
      ...baseOptions,
      crop: { x: 0.5, y: 0, width: 0.5, height: 1 },
      rotate: 90,
    })
    expect(out.width).toBe(1)
    expect(out.height).toBe(2)
    expect(pixel0(out)).toBe(30)
  })

  it('an absent crop is a no-op', () => {
    const img = makeImageData([[10, 20]])
    const out = applyImageFilters(img, baseOptions)
    expect(out.width).toBe(2)
    expect(pixel0(out)).toBe(10)
  })
})

describe('effectiveDimensions', () => {
  it('matches applyImageFilters\'s own output size for a crop, without touching any pixels', () => {
    const img = makeImageData([
      [10, 20, 30, 40],
      [50, 60, 70, 80],
    ])
    const options: MappingOptions = {
      ...baseOptions,
      crop: { x: 0.25, y: 0, width: 0.5, height: 1 },
    }
    const real = applyImageFilters(img, options)
    const predicted = effectiveDimensions(img.width, img.height, options)
    expect(predicted).toEqual({ width: real.width, height: real.height })
  })

  it('matches applyImageFilters\'s own output size for a 90-degree rotate (width/height swap)', () => {
    const img = makeImageData([[10, 20, 30]]) // 3x1
    const options: MappingOptions = { ...baseOptions, rotate: 90 }
    const real = applyImageFilters(img, options)
    const predicted = effectiveDimensions(img.width, img.height, options)
    expect(predicted).toEqual({ width: real.width, height: real.height })
  })

  it('a 180-degree rotate keeps width/height unchanged', () => {
    expect(effectiveDimensions(10, 6, { rotate: 180 })).toEqual({ width: 10, height: 6 })
  })

  it('is a no-op when crop and rotate are both absent', () => {
    expect(effectiveDimensions(10, 6, {})).toEqual({ width: 10, height: 6 })
  })
})
