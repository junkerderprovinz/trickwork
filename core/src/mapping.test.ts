import { describe, expect, it } from 'vitest'
import { computeBlockLuminance, mapLuminanceToChar } from './mapping'
import type { FontWidthTable } from './types'

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

describe('computeBlockLuminance', () => {
  it('returns 0 for an all-black block', () => {
    const img = makeImageData([
      [0, 0],
      [0, 0],
    ])
    expect(computeBlockLuminance(img, 0, 0, 2, 2)).toBeCloseTo(0, 2)
  })

  it('returns 1 for an all-white block', () => {
    const img = makeImageData([
      [255, 255],
      [255, 255],
    ])
    expect(computeBlockLuminance(img, 0, 0, 2, 2)).toBeCloseTo(1, 2)
  })

  it('averages a mixed block to mid-gray', () => {
    const img = makeImageData([
      [0, 255],
      [255, 0],
    ])
    expect(computeBlockLuminance(img, 0, 0, 2, 2)).toBeCloseTo(0.5, 2)
  })

  it('reads only the requested sub-region, not the whole image', () => {
    const img = makeImageData([
      [0, 0, 255, 255],
      [0, 0, 255, 255],
    ])
    expect(computeBlockLuminance(img, 2, 0, 2, 2)).toBeCloseTo(1, 2)
    expect(computeBlockLuminance(img, 0, 0, 2, 2)).toBeCloseTo(0, 2)
  })
})

describe('mapLuminanceToChar', () => {
  const table: FontWidthTable = {
    font: { family: 'monospace', sizePx: 16 },
    entries: [
      { char: '@', inkCoverage: 0.9 }, // darkest ink = should map to darkest luminance
      { char: '#', inkCoverage: 0.6 },
      { char: '*', inkCoverage: 0.4 },
      { char: '.', inkCoverage: 0.1 },
      { char: ' ', inkCoverage: 0 }, // no ink = should map to brightest luminance
    ],
  }

  it('maps low luminance (dark source pixel) to the highest-ink-coverage glyph', () => {
    expect(mapLuminanceToChar(0, table)).toBe('@')
  })

  it('maps high luminance (bright source pixel) to the lowest-ink-coverage glyph', () => {
    expect(mapLuminanceToChar(1, table)).toBe(' ')
  })

  it('maps mid luminance to a mid-coverage glyph', () => {
    // The target is interpolated into the table's own range (0 .. 0.9), so
    // luminance 0.5 -> 0 + 0.5 * 0.9 = 0.45 -> nearest is '*' (0.4).
    expect(mapLuminanceToChar(0.5, table)).toBe('*')
  })

  // Regression guard for the ink-coverage scale mismatch: a real, canvas-measured
  // table's coverage values are a small fraction of the glyph cell (~0 .. 0.12),
  // not a 0..1 spread. Treating (1 - luminance) as an absolute coverage target
  // collapsed every mid-tone onto the densest glyph, so whole images rendered as
  // a solid block of '@'. Every previous test used a synthetic full-range table,
  // which is exactly why the bug stayed invisible.
  describe('with a realistically compressed coverage range', () => {
    const realistic: FontWidthTable = {
      font: { family: 'monospace', sizePx: 16 },
      // Ascending, as buildFontWidthTable produces. Values approximate what
      // createCanvasGlyphMeasurer actually reports for the "standard" preset.
      entries: [
        { char: ' ', inkCoverage: 0 },
        { char: '.', inkCoverage: 0.01 },
        { char: ':', inkCoverage: 0.018 },
        { char: '*', inkCoverage: 0.027 },
        { char: '+', inkCoverage: 0.033 },
        { char: '=', inkCoverage: 0.041 },
        { char: '%', inkCoverage: 0.052 },
        { char: '#', inkCoverage: 0.056 },
        { char: '@', inkCoverage: 0.063 },
      ],
    }

    it('still puts the darkest glyph at luminance 0 and the blank at luminance 1', () => {
      expect(mapLuminanceToChar(0, realistic)).toBe('@')
      expect(mapLuminanceToChar(1, realistic)).toBe(' ')
    })

    it('selects distinct glyphs across a spread of luminances instead of collapsing to one', () => {
      const picked = [0, 0.3, 0.5, 0.7, 1].map((luminance) =>
        mapLuminanceToChar(luminance, realistic),
      )
      expect(picked).toEqual(['@', '=', '+', ':', ' '])
      expect(new Set(picked).size).toBe(5)
    })

    it('uses most of the charset across the full luminance sweep', () => {
      const used = new Set<string>()
      for (let i = 0; i <= 100; i++) used.add(mapLuminanceToChar(i / 100, realistic))
      expect(used.size).toBeGreaterThanOrEqual(realistic.entries.length - 1)
    })
  })

  it('falls back to a single glyph when every entry has the same coverage', () => {
    const flat: FontWidthTable = {
      font: { family: 'monospace', sizePx: 16 },
      entries: [
        { char: 'a', inkCoverage: 0.03 },
        { char: 'b', inkCoverage: 0.03 },
      ],
    }
    expect(mapLuminanceToChar(0, flat)).toBe('a')
    expect(mapLuminanceToChar(1, flat)).toBe('a')
  })
})
