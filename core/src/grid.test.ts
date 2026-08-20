// core/src/grid.test.ts
import { describe, expect, it } from 'vitest'
import { assembleGrid } from './grid'
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

// Ascending by inkCoverage, matching buildFontWidthTable's own contract -
// mapLuminanceToChar picks by rank/position now, not nearest value, so a
// hand-built table has to declare its entries in the right order.
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
    // 7 / 3 = 2.333.., so a naive per-block round(blockW) gives 2px blocks
    // for every column, including the last one. That leaves the last
    // column covering only x=[4,6) -- pixel x=6 (the true right edge) is
    // never sampled by any block. The fix derives each block's width from
    // where the NEXT block starts (clamped to the image edge for the last
    // column), so the last column must cover x=[4,7).
    //
    // Columns 0-1 (source pixels 0-3) are filler. Column 2 (source pixels
    // 4-6) is engineered so that including the edge pixel (index 6, pure
    // black, luminance 0) flips the mapped glyph:
    //   - dropped edge pixel: avg of {255, 10} -> luminance ~0.520 -> ' '
    //   - edge pixel included: avg of {255, 10, 0} -> luminance ~0.346 -> '@'
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

  it('attaches no colour field when options.color is unset (existing behaviour)', () => {
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
    // Two cells, gray 130 then 140 (luminance ~0.5098 then ~0.5490). Against
    // the 2-level {@:1, ' ':0} table both cells are, on their own, closer to
    // coverage 0 and plain-map to ' ' independently. Cell 0's own
    // quantization error (its target luminance minus the achieved luminance
    // of the ' ' actually picked, ~-0.49) diffuses rightward at 7/16 and is
    // large enough to pull cell 1's target down past the halfway point,
    // flipping it to '@' - something a per-cell-independent mapping (plain)
    // can never do.
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
