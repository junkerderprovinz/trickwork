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

const table: FontWidthTable = {
  font: { family: 'monospace', sizePx: 16 },
  entries: [
    { char: '@', inkCoverage: 1 },
    { char: ' ', inkCoverage: 0 },
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
})
