// core/src/histogram.test.ts
import { describe, expect, it } from 'vitest'
import { computeLuminanceHistogram } from './histogram'

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

describe('computeLuminanceHistogram', () => {
  it('returns 256 buckets', () => {
    const img = makeImageData([[0]])
    expect(computeLuminanceHistogram(img).length).toBe(256)
  })

  it('counts one pixel per matching luma bucket for a flat grayscale image', () => {
    const img = makeImageData([[0, 128, 255]])
    const hist = computeLuminanceHistogram(img)
    expect(hist[0]).toBe(1)
    expect(hist[128]).toBe(1)
    expect(hist[255]).toBe(1)
    expect(hist.reduce((sum, n) => sum + n, 0)).toBe(3)
  })

  it('sums multiple pixels landing in the same bucket', () => {
    const img = makeImageData([[80, 80, 80]])
    const hist = computeLuminanceHistogram(img)
    expect(hist[80]).toBe(3)
  })

  it('weights R/G/B by Rec.601 luma, matching mapping.ts computeBlockLuminance', () => {
    const height = 1
    const width = 1
    // Pure green at full intensity: 0.587 * 255 = ~150.
    const data = new Uint8ClampedArray([0, 255, 0, 255])
    const img = { data, width, height, colorSpace: 'srgb' } as ImageData
    const hist = computeLuminanceHistogram(img)
    expect(hist[150]).toBe(1)
  })
})
