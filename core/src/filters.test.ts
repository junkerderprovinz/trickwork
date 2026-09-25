import { describe, expect, it } from 'vitest'
import {
  applyLevels,
  cropImage,
  flipImage,
  invertImage,
  normalizeRotation,
  rotatedSize,
  rotateImage,
  sharpenImage,
} from './filters'

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

function pixelAt(img: ImageData, x: number, y: number): number[] {
  const i = (y * img.width + x) * 4
  return [img.data[i] ?? 0, img.data[i + 1] ?? 0, img.data[i + 2] ?? 0, img.data[i + 3] ?? 0]
}

describe('invertImage', () => {
  it('inverts every RGB channel and leaves alpha untouched', () => {
    const img = makeImageData([[0, 255]])
    const out = invertImage(img)
    expect(pixelAt(out, 0, 0)).toEqual([255, 255, 255, 255])
    expect(pixelAt(out, 1, 0)).toEqual([0, 0, 0, 255])
  })

  it('does not mutate the input', () => {
    const img = makeImageData([[0]])
    invertImage(img)
    expect(pixelAt(img, 0, 0)[0]).toBe(0)
  })
})

describe('rotateImage', () => {
  // 2x1 image: [A, B] where A=10 B=200
  const img = makeImageData([[10, 200]])

  it('0 degrees is a no-op copy (same dimensions and pixels)', () => {
    const out = rotateImage(img, 0)
    expect(out.width).toBe(2)
    expect(out.height).toBe(1)
    expect(pixelAt(out, 0, 0)[0]).toBe(10)
    expect(pixelAt(out, 1, 0)[0]).toBe(200)
  })

  it('90 degrees swaps width/height and rotates clockwise', () => {
    const out = rotateImage(img, 90)
    expect(out.width).toBe(1)
    expect(out.height).toBe(2)
    // A (was top-left) moves to top-right of a CW rotation -> (0,0) here since width=1
    expect(pixelAt(out, 0, 0)[0]).toBe(10)
    expect(pixelAt(out, 0, 1)[0]).toBe(200)
  })

  it('180 degrees reverses both axes and keeps original dimensions', () => {
    const out = rotateImage(img, 180)
    expect(out.width).toBe(2)
    expect(out.height).toBe(1)
    expect(pixelAt(out, 0, 0)[0]).toBe(200)
    expect(pixelAt(out, 1, 0)[0]).toBe(10)
  })

  it('270 degrees swaps width/height the other way', () => {
    const out = rotateImage(img, 270)
    expect(out.width).toBe(1)
    expect(out.height).toBe(2)
    expect(pixelAt(out, 0, 0)[0]).toBe(200)
    expect(pixelAt(out, 0, 1)[0]).toBe(10)
  })

  it('rotating 90 four times returns to the original dimensions and content', () => {
    let out = img
    for (let i = 0; i < 4; i++) out = rotateImage(out, 90)
    expect(out.width).toBe(2)
    expect(out.height).toBe(1)
    expect(pixelAt(out, 0, 0)[0]).toBe(10)
    expect(pixelAt(out, 1, 0)[0]).toBe(200)
  })

  it('a negative or oversized angle is the same turn as its remainder', () => {
    expect(normalizeRotation(-90)).toBe(270)
    expect(normalizeRotation(450)).toBe(90)
    expect(rotateImage(img, -90)).toEqual(rotateImage(img, 270))
  })

  it('any other angle grows the image to hold the whole turned source and leaves the corners transparent', () => {
    const square = makeImageData(Array.from({ length: 10 }, () => new Array<number>(10).fill(40)))
    const out = rotateImage(square, 45)
    expect({ width: out.width, height: out.height }).toEqual(rotatedSize(10, 10, 45))
    expect(out.width).toBe(14)
    expect(pixelAt(out, 0, 0)[3]).toBe(0)
    expect(pixelAt(out, 13, 13)[3]).toBe(0)
    expect(pixelAt(out, 7, 7)).toEqual([40, 40, 40, 255])
  })

  it('a free turn goes clockwise, like the quarter turns', () => {
    // A bright top edge ends up on the right after a little under a quarter turn.
    const rows = Array.from({ length: 20 }, (_, y) => new Array<number>(20).fill(y < 4 ? 250 : 0))
    const out = rotateImage(makeImageData(rows), 80)
    const right = pixelAt(out, out.width - 4, Math.floor(out.height / 2))
    const left = pixelAt(out, 3, Math.floor(out.height / 2))
    expect(right[0]).toBeGreaterThan(200)
    expect(left[0]).toBeLessThan(50)
  })
})

describe('flipImage', () => {
  const img = makeImageData([
    [10, 20],
    [30, 40],
  ])

  it('flips horizontally', () => {
    const out = flipImage(img, true, false)
    expect(pixelAt(out, 0, 0)[0]).toBe(20)
    expect(pixelAt(out, 1, 0)[0]).toBe(10)
    expect(pixelAt(out, 0, 1)[0]).toBe(40)
    expect(pixelAt(out, 1, 1)[0]).toBe(30)
  })

  it('flips vertically', () => {
    const out = flipImage(img, false, true)
    expect(pixelAt(out, 0, 0)[0]).toBe(30)
    expect(pixelAt(out, 0, 1)[0]).toBe(10)
  })

  it('flips both axes at once', () => {
    const out = flipImage(img, true, true)
    expect(pixelAt(out, 0, 0)[0]).toBe(40)
    expect(pixelAt(out, 1, 1)[0]).toBe(10)
  })

  it('is a no-op copy when neither axis is set', () => {
    const out = flipImage(img, false, false)
    expect(pixelAt(out, 0, 0)[0]).toBe(10)
  })
})

describe('sharpenImage', () => {
  it('"none" returns an unmodified copy', () => {
    const img = makeImageData([[100, 100, 100]])
    const out = sharpenImage(img, 'none')
    expect(pixelAt(out, 1, 0)[0]).toBe(100)
  })

  it('"sharpen" leaves a perfectly flat image unchanged (kernel sums to 1)', () => {
    const img = makeImageData([
      [128, 128, 128],
      [128, 128, 128],
      [128, 128, 128],
    ])
    const out = sharpenImage(img, 'sharpen')
    expect(pixelAt(out, 1, 1)[0]).toBe(128)
  })

  it('"sharpen" increases local contrast at a hard edge', () => {
    const img = makeImageData([
      [255, 255, 0, 255, 255],
      [255, 255, 0, 255, 255],
      [255, 255, 0, 255, 255],
    ])
    const out = sharpenImage(img, 'sharpen')
    // 5*0 - 4*255 clamps to 0, so the dark column stays at the floor instead
    // of moving toward grey.
    expect(pixelAt(out, 2, 1)[0]).toBe(0)
  })

  it('"unsharp" leaves a perfectly flat image unchanged', () => {
    const img = makeImageData([
      [128, 128, 128],
      [128, 128, 128],
      [128, 128, 128],
    ])
    const out = sharpenImage(img, 'unsharp')
    expect(pixelAt(out, 1, 1)[0]).toBe(128)
  })

  it('"unsharp" pushes a bright pixel surrounded by dark neighbours brighter still', () => {
    const img = makeImageData([
      [0, 0, 0],
      [0, 200, 0],
      [0, 0, 0],
    ])
    const out = sharpenImage(img, 'unsharp')
    expect(pixelAt(out, 1, 1)[0]).toBeGreaterThan(200)
  })
})

describe('applyLevels', () => {
  it('the identity {black: 0, gamma: 1, white: 255} returns an unmodified copy', () => {
    const img = makeImageData([[0, 60, 128, 200, 255]])
    const out = applyLevels(img, { black: 0, gamma: 1, white: 255 })
    expect(pixelAt(out, 0, 0)[0]).toBe(0)
    expect(pixelAt(out, 2, 0)[0]).toBe(128)
    expect(pixelAt(out, 4, 0)[0]).toBe(255)
  })

  it('clips everything at or below the black point to 0', () => {
    const img = makeImageData([[0, 30, 50]])
    const out = applyLevels(img, { black: 50, gamma: 1, white: 255 })
    expect(pixelAt(out, 0, 0)[0]).toBe(0)
    expect(pixelAt(out, 1, 0)[0]).toBe(0)
    expect(pixelAt(out, 2, 0)[0]).toBe(0)
  })

  it('clips everything at or above the white point to 255', () => {
    const img = makeImageData([[200, 220, 255]])
    const out = applyLevels(img, { black: 0, gamma: 1, white: 200 })
    expect(pixelAt(out, 0, 0)[0]).toBe(255)
    expect(pixelAt(out, 1, 0)[0]).toBe(255)
    expect(pixelAt(out, 2, 0)[0]).toBe(255)
  })

  it('linearly stretches the range between black and white', () => {
    const img = makeImageData([[50, 100, 150]])
    const out = applyLevels(img, { black: 50, gamma: 1, white: 150 })
    expect(pixelAt(out, 0, 0)[0]).toBe(0)
    expect(pixelAt(out, 1, 0)[0]).toBe(128)
    expect(pixelAt(out, 2, 0)[0]).toBe(255)
  })

  it('a gamma below 1 sinks midtones darker', () => {
    const img = makeImageData([[128]])
    const out = applyLevels(img, { black: 0, gamma: 0.5, white: 255 })
    // normalized 0.5 ** (1/0.5) = 0.5 ** 2 = 0.25 -> ~64
    expect(pixelAt(out, 0, 0)[0]).toBe(64)
  })

  it('a gamma above 1 lifts midtones brighter', () => {
    const img = makeImageData([[128]])
    const out = applyLevels(img, { black: 0, gamma: 2, white: 255 })
    // normalized 128/255 ~ 0.502 ** (1/2) ~ 0.7085 -> ~181
    expect(pixelAt(out, 0, 0)[0]).toBe(181)
  })

  it('applies uniformly to all three RGB channels, leaving alpha untouched', () => {
    const height = 1
    const width = 1
    const data = new Uint8ClampedArray([50, 100, 150, 128])
    const img = { data, width, height, colorSpace: 'srgb' } as ImageData
    const out = applyLevels(img, { black: 50, gamma: 1, white: 150 })
    expect(pixelAt(out, 0, 0)).toEqual([0, 128, 255, 128])
  })

  it('does not mutate the input', () => {
    const img = makeImageData([[128]])
    applyLevels(img, { black: 50, gamma: 1, white: 150 })
    expect(pixelAt(img, 0, 0)[0]).toBe(128)
  })
})

describe('cropImage', () => {
  // 4x4, row-major values 0..15 so every pixel is uniquely identifiable.
  const img = makeImageData([
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
  ])

  it('extracts the top-left quadrant', () => {
    const out = cropImage(img, { x: 0, y: 0, width: 0.5, height: 0.5 })
    expect(out.width).toBe(2)
    expect(out.height).toBe(2)
    expect(pixelAt(out, 0, 0)[0]).toBe(0)
    expect(pixelAt(out, 1, 0)[0]).toBe(1)
    expect(pixelAt(out, 0, 1)[0]).toBe(4)
    expect(pixelAt(out, 1, 1)[0]).toBe(5)
  })

  it('extracts the bottom-right quadrant', () => {
    const out = cropImage(img, { x: 0.5, y: 0.5, width: 0.5, height: 0.5 })
    expect(pixelAt(out, 0, 0)[0]).toBe(10)
    expect(pixelAt(out, 1, 0)[0]).toBe(11)
    expect(pixelAt(out, 0, 1)[0]).toBe(14)
    expect(pixelAt(out, 1, 1)[0]).toBe(15)
  })

  it('the full-image crop (0,0,1,1) reproduces the original', () => {
    const out = cropImage(img, { x: 0, y: 0, width: 1, height: 1 })
    expect(out.width).toBe(4)
    expect(out.height).toBe(4)
    expect(pixelAt(out, 3, 3)[0]).toBe(15)
  })

  it('clamps a requested width/height that would run past the source bounds', () => {
    const out = cropImage(img, { x: 0.75, y: 0, width: 0.75, height: 0.25 })
    // x=3 on a 4-wide image leaves only 1 column, however wide was asked for.
    expect(out.width).toBe(1)
    expect(pixelAt(out, 0, 0)[0]).toBe(3)
  })

  it('clamps out-of-range x/y/width/height (e.g. negative or > 1) instead of throwing', () => {
    const out = cropImage(img, { x: -0.5, y: -0.5, width: 2, height: 2 })
    expect(out.width).toBe(4)
    expect(out.height).toBe(4)
    expect(pixelAt(out, 0, 0)[0]).toBe(0)
  })

  it('never produces a zero-size result even for a degenerate 0-width/height request', () => {
    const out = cropImage(img, { x: 0.5, y: 0.5, width: 0, height: 0 })
    expect(out.width).toBeGreaterThanOrEqual(1)
    expect(out.height).toBeGreaterThanOrEqual(1)
  })

  it('does not mutate the input', () => {
    cropImage(img, { x: 0, y: 0, width: 0.5, height: 0.5 })
    expect(pixelAt(img, 3, 3)[0]).toBe(15)
  })
})
