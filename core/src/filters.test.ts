// core/src/filters.test.ts
import { describe, expect, it } from 'vitest'
import { flipImage, invertImage, rotateImage, sharpenImage } from './filters'

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
    // A dark pixel next to a bright block: sharpening should push the dark
    // side darker (or hold the floor at 0) and/or the bright side brighter.
    const img = makeImageData([
      [255, 255, 0, 255, 255],
      [255, 255, 0, 255, 255],
      [255, 255, 0, 255, 255],
    ])
    const out = sharpenImage(img, 'sharpen')
    // The center dark column had 4 bright neighbours pulling it further from
    // its own value under the sharpen kernel (5*0 - 4*255 clamps to 0), so it
    // must stay at the floor rather than moving toward grey.
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
