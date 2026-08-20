import { describe, expect, it } from 'vitest'
import { computeBlockAverageColor, computeBlockLuminance, mapLuminanceToChar, mapLuminanceToCharWithAchieved } from './mapping'
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
  // Ascending by inkCoverage, matching buildFontWidthTable's own contract -
  // mapLuminanceToChar picks by RANK (position in this array, each entry
  // claiming `weight` consecutive slots) rather than nearest value, so
  // unlike the old nearest-value algorithm, array ORDER now matters.
  const table: FontWidthTable = {
    font: { family: 'monospace', sizePx: 16 },
    entries: [
      { char: ' ', inkCoverage: 0 }, // no ink = should map to brightest luminance
      { char: '.', inkCoverage: 0.1 },
      { char: '*', inkCoverage: 0.4 },
      { char: '#', inkCoverage: 0.6 },
      { char: '@', inkCoverage: 0.9 }, // darkest ink = should map to darkest luminance
    ],
  }

  it('maps low luminance (dark source pixel) to the highest-ink-coverage glyph', () => {
    expect(mapLuminanceToChar(0, table)).toBe('@')
  })

  it('maps high luminance (bright source pixel) to the lowest-ink-coverage glyph', () => {
    expect(mapLuminanceToChar(1, table)).toBe(' ')
  })

  it('maps mid luminance to a mid-rank glyph', () => {
    // 5 entries, all weight 1 (default) -> totalWeight 5. luminance 0.5 ->
    // targetRank = round((1 - 0.5) * 4) = 2 -> the middle entry, '*'.
    expect(mapLuminanceToChar(0.5, table)).toBe('*')
  })

  // Regression guard for an ink-coverage scale mismatch this table's own
  // synthetic 0..0.9 spread never exercised: a real, canvas-measured table's
  // coverage values are a small fraction of the glyph cell (~0 .. 0.12), not
  // a 0..1 spread. The selection algorithm has since moved from nearest-VALUE
  // (where that mismatch mattered) to rank-by-POSITION (mapLuminanceToChar's
  // own doc comment) - rank is scale-invariant, so this specific failure mode
  // can no longer recur, but the realistic-range fixture stays as a guard
  // against the historical bug's SYMPTOM (everything collapsing to one glyph).
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
      // 9 entries, totalWeight 9 -> targetRank = round((1 - luminance) * 8).
      // 0->8('@'), 0.3->round(5.6)=6('%'), 0.5->4('+'), 0.7->round(2.4)=2(':'), 1->0(' ').
      expect(picked).toEqual(['@', '%', '+', ':', ' '])
      expect(new Set(picked).size).toBe(5)
    })

    it('uses most of the charset across the full luminance sweep', () => {
      const used = new Set<string>()
      for (let i = 0; i <= 100; i++) used.add(mapLuminanceToChar(i / 100, realistic))
      expect(used.size).toBeGreaterThanOrEqual(realistic.entries.length - 1)
    })
  })

  it('still varies by RANK across tied coverage, unlike the old nearest-value algorithm', () => {
    // Both entries measure identically (0.03) - a nearest-VALUE search could
    // never tell them apart and always returned the first (see mapping.ts's
    // git history), but rank-based selection doesn't need a coverage
    // difference to distinguish positions: 'a' is rank 0 (lightest slot),
    // 'b' is rank 1 (darkest slot), exactly as ASCGen2's own plain-string
    // ramp would treat two adjacent identical characters.
    const flat: FontWidthTable = {
      font: { family: 'monospace', sizePx: 16 },
      entries: [
        { char: 'a', inkCoverage: 0.03 },
        { char: 'b', inkCoverage: 0.03 },
      ],
    }
    expect(mapLuminanceToChar(0, flat)).toBe('b')
    expect(mapLuminanceToChar(1, flat)).toBe('a')
  })

  describe('with a repeated character (weight > 1)', () => {
    // ASCGen2's own weighting mechanic (Variables.cs's DefaultRamps repeat a
    // character to weight it in a plain linear-index ramp string) - here
    // '.' appears 5x in the source charset, 1x each for ' ' and '@', so it
    // should claim 5 of the 7 total rank slots (jdp: "je öfter man das
    // gleiche Zeichen eingetragen hat, desto mehr wurde es gewichtet").
    const weighted: FontWidthTable = {
      font: { family: 'monospace', sizePx: 16 },
      entries: [
        { char: ' ', inkCoverage: 0, weight: 1 },
        { char: '.', inkCoverage: 0.2, weight: 5 },
        { char: '@', inkCoverage: 0.9, weight: 1 },
      ],
    }

    it('gives the repeated entry a proportionally wider luminance band', () => {
      const picks = Array.from({ length: 7 }, (_, rank) =>
        mapLuminanceToChar(1 - rank / 6, weighted),
      )
      expect(picks).toEqual([' ', '.', '.', '.', '.', '.', '@'])
    })

    it('an entry with no weight set behaves as weight 1', () => {
      const unweighted: FontWidthTable = {
        font: { family: 'monospace', sizePx: 16 },
        entries: [
          { char: ' ', inkCoverage: 0 },
          { char: '.', inkCoverage: 0.2 },
          { char: '@', inkCoverage: 0.9 },
        ],
      }
      // totalWeight 3 (not 7) -> targetRank = round((1 - luminance) * 2).
      expect(mapLuminanceToChar(1, unweighted)).toBe(' ')
      expect(mapLuminanceToChar(0.5, unweighted)).toBe('.')
      expect(mapLuminanceToChar(0, unweighted)).toBe('@')
    })
  })
})

describe('computeBlockAverageColor', () => {
  function makeRgbImageData(pixels: [number, number, number][][]): ImageData {
    const height = pixels.length
    const width = pixels[0]?.length ?? 0
    const data = new Uint8ClampedArray(width * height * 4)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const [r, g, b] = pixels[y]?.[x] ?? [0, 0, 0]
        const i = (y * width + x) * 4
        data[i] = r
        data[i + 1] = g
        data[i + 2] = b
        data[i + 3] = 255
      }
    }
    return { data, width, height, colorSpace: 'srgb' } as ImageData
  }

  it('returns the exact colour of a uniform block', () => {
    const img = makeRgbImageData([
      [
        [200, 50, 10],
        [200, 50, 10],
      ],
    ])
    expect(computeBlockAverageColor(img, 0, 0, 2, 1)).toEqual({ r: 200, g: 50, b: 10 })
  })

  it('averages per-channel across a mixed block', () => {
    const img = makeRgbImageData([
      [
        [0, 0, 0],
        [255, 255, 255],
      ],
    ])
    expect(computeBlockAverageColor(img, 0, 0, 2, 1)).toEqual({ r: 128, g: 128, b: 128 })
  })

  it('reads only the requested sub-region', () => {
    const img = makeRgbImageData([
      [
        [255, 0, 0],
        [0, 255, 0],
      ],
    ])
    expect(computeBlockAverageColor(img, 1, 0, 1, 1)).toEqual({ r: 0, g: 255, b: 0 })
  })
})

describe('mapLuminanceToCharWithAchieved', () => {
  // Ascending by inkCoverage - see mapLuminanceToChar's own table above for
  // why order matters now.
  const table: FontWidthTable = {
    font: { family: 'monospace', sizePx: 16 },
    entries: [
      { char: ' ', inkCoverage: 0 },
      { char: '*', inkCoverage: 0.4 },
      { char: '@', inkCoverage: 0.9 },
    ],
  }

  it('picks the same glyph mapLuminanceToChar would for the same input', () => {
    expect(mapLuminanceToCharWithAchieved(0.5, table).char).toBe(mapLuminanceToChar(0.5, table))
  })

  it('reports zero achieved error when the picked glyph sits at the table\'s own extreme', () => {
    // luminance 0 -> targetRank = round(1 * 2) = 2 -> picks '@', the entry
    // AT the table's own max coverage (0.9) - achieved luminance must equal
    // the target exactly: 0 error.
    const { achievedLuminance } = mapLuminanceToCharWithAchieved(0, table)
    expect(achievedLuminance).toBeCloseTo(0, 5)
  })

  it('reports nonzero achieved error when the picked glyph only approximates the target', () => {
    // luminance 0.5 -> targetRank = round(0.5 * 2) = 1 -> picks '*' (0.4),
    // whose achieved luminance is 1 - (0.4-0)/0.9 = 0.5555... - not exactly
    // 0.5, since rank position and real measured coverage aren't the same
    // axis (that's the whole point - see mapLuminanceToCharWithAchieved's
    // own doc comment on why achieved error stays coverage-based).
    const { char, achievedLuminance } = mapLuminanceToCharWithAchieved(0.5, table)
    expect(char).toBe('*')
    expect(achievedLuminance).not.toBeCloseTo(0.5, 3)
  })

  it('reports the input luminance itself (zero error) when every entry has identical coverage', () => {
    const flat: FontWidthTable = {
      font: { family: 'monospace', sizePx: 16 },
      entries: [
        { char: 'a', inkCoverage: 0.03 },
        { char: 'b', inkCoverage: 0.03 },
      ],
    }
    const { achievedLuminance } = mapLuminanceToCharWithAchieved(0.37, flat)
    expect(achievedLuminance).toBe(0.37)
  })
})
