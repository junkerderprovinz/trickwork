import { describe, expect, it } from 'vitest'
import { assembleGrid, computeAutoRows } from './grid'
import type { FontWidthTable, MappingOptions } from './types'

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

// Sorted by inkCoverage like buildFontWidthTable's output, since glyphs are
// picked by rank.
const table: FontWidthTable = {
  font: { family: 'monospace', sizePx: 16 },
  entries: [
    { char: ' ', inkCoverage: 0 },
    { char: '@', inkCoverage: 1 },
  ],
}

describe('assembleGrid', () => {
  it('produces a grid with the requested column count, and a proportionally-scaled row count', () => {
    const img = makeImageData([
      [0, 0, 255, 255],
      [0, 0, 255, 255],
    ])
    const options: MappingOptions = {
      columns: 2,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
    }
    const grid = assembleGrid(img, table, options)
    expect(grid).toHaveLength(1) // 4x2 image, 2 columns -> 2px-wide blocks -> 1 row
    expect(grid[0]).toHaveLength(2)
  })

  it('an explicit rows value overrides the aspect-ratio-matched auto row count', () => {
    const img = makeImageData([
      [0, 0, 255, 255],
      [0, 0, 255, 255],
    ])
    const options: MappingOptions = {
      columns: 2,
      rows: 5,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
    }
    // The auto row count for this image and column count is 1.
    const grid = assembleGrid(img, table, options)
    expect(grid).toHaveLength(5)
  })

  it('maps a dark block to the dark glyph and a bright block to the blank glyph', () => {
    const img = makeImageData([
      [0, 0, 255, 255],
      [0, 0, 255, 255],
    ])
    const options: MappingOptions = {
      columns: 2,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
    }
    const grid = assembleGrid(img, table, options)
    expect(grid[0]?.[0]?.char).toBe('@')
    expect(grid[0]?.[1]?.char).toBe(' ')
  })

  it('carries the requested font onto every cell', () => {
    const img = makeImageData([[0, 255]])
    const font = { family: 'serif', sizePx: 20 }
    const options: MappingOptions = {
      columns: 2,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font,
    }
    const grid = assembleGrid(img, table, options)
    expect(grid[0]?.[0]?.font).toEqual(font)
  })

  it('positive brightness pushes output toward the blank glyph', () => {
    const img = makeImageData([[0, 0]]) // fully black source
    const dim = { columns: 2, brightness: 0, contrast: 0, charset: ['@', ' '], font: { family: 'monospace', sizePx: 16 } }
    const bright: MappingOptions = { ...dim, brightness: 1 }
    const darkResult = assembleGrid(img, table, dim)
    const brightResult = assembleGrid(img, table, bright)
    expect(darkResult[0]?.[0]?.char).toBe('@')
    expect(brightResult[0]?.[0]?.char).toBe(' ')
  })

  it('samples every source pixel even when width does not divide evenly by columns (7px wide, 3 columns)', () => {
    // Rounding each block to 2px would leave the last column at x=[4,6) and
    // never sample the edge pixel. The last column covers x=[4,7), and its
    // black edge pixel flips the glyph:
    //   without it: avg of {255, 10} -> luminance ~0.520 -> ' '
    //   with it: avg of {255, 10, 0} -> luminance ~0.346 -> '@'
    const img = makeImageData([[128, 128, 128, 128, 255, 10, 0]])
    const options: MappingOptions = {
      columns: 3,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
    }
    const grid = assembleGrid(img, table, options)
    expect(grid).toHaveLength(1)
    expect(grid[0]).toHaveLength(3)
    expect(grid[0]?.[2]?.char).toBe('@')
  })

  it('attaches no colour field when options.color is unset', () => {
    const img = makeImageData([[0, 255]])
    const options: MappingOptions = {
      columns: 2,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
    }
    const grid = assembleGrid(img, table, options)
    expect(grid[0]?.[0]?.color).toBeUndefined()
  })

  it('attaches the block average colour to every cell when options.color is true', () => {
    const img = makeImageData([[0, 255]])
    const options: MappingOptions = {
      columns: 2,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
      color: true,
    }
    const grid = assembleGrid(img, table, options)
    expect(grid[0]?.[0]?.color).toEqual({ r: 0, g: 0, b: 0 })
    expect(grid[0]?.[1]?.color).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('diffuses quantization error to the next cell, flipping its glyph relative to plain (undithered) mapping', () => {
    // Gray 130 and 140 each map to ' ' on their own. Cell 0's error (about
    // -0.49) reaches cell 1 at 7/16 and pulls it past the halfway point.
    const img = makeImageData([[130, 140]])
    const options: MappingOptions = {
      columns: 2,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
    }
    const plain = assembleGrid(img, table, options)
    const dithered = assembleGrid(img, table, { ...options, dither: true })

    expect(plain[0]?.map((c) => c.char)).toEqual([' ', ' '])
    expect(dithered[0]?.map((c) => c.char)).toEqual([' ', '@'])
  })

  it('dithering does not change the grid dimensions', () => {
    const img = makeImageData([[0, 128, 255]])
    const options: MappingOptions = {
      columns: 3,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
      dither: true,
    }
    const grid = assembleGrid(img, table, options)
    expect(grid).toHaveLength(1)
    expect(grid[0]).toHaveLength(3)
  })
})

describe('computeAutoRows', () => {
  it("matches assembleGrid's own auto row count for the same inputs", () => {
    // 400x200 source, 100 columns -> 4px-wide blocks -> 8px-tall blocks
    // (CELL_ASPECT_COMPENSATION) -> 200/8 = 25 rows.
    expect(computeAutoRows(400, 200, 100)).toBe(25)
  })

  it('never returns fewer than 1 row, even for an extremely wide, short source', () => {
    expect(computeAutoRows(10000, 1, 400)).toBe(1)
  })
})
