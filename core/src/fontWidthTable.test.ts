// core/src/fontWidthTable.test.ts
import { describe, expect, it } from 'vitest'
import { buildFontWidthTable } from './fontWidthTable'
import type { GlyphMeasurer } from './types'

const fakeMeasure: GlyphMeasurer = (char) => {
  const coverageByChar: Record<string, number> = {
    ' ': 0,
    '.': 0.1,
    '*': 0.4,
    '#': 0.6,
    '@': 0.9,
  }
  return { char, inkCoverage: coverageByChar[char] ?? 0 }
}

describe('buildFontWidthTable', () => {
  it('produces one entry per input character', () => {
    const table = buildFontWidthTable(
      [' ', '.', '*', '#', '@'],
      { family: 'monospace', sizePx: 16 },
      fakeMeasure,
    )
    expect(table.entries).toHaveLength(5)
  })

  it('sorts entries ascending by measured ink coverage, not input order', () => {
    const table = buildFontWidthTable(
      ['@', ' ', '#', '.', '*'],
      { family: 'monospace', sizePx: 16 },
      fakeMeasure,
    )
    expect(table.entries.map((e) => e.char)).toEqual([
      ' ',
      '.',
      '*',
      '#',
      '@',
    ])
  })

  it('carries the font spec through unchanged', () => {
    const font = { family: 'serif', sizePx: 20 }
    const table = buildFontWidthTable([' ', '@'], font, fakeMeasure)
    expect(table.font).toEqual(font)
  })

  it('deduplicates repeated input characters', () => {
    const table = buildFontWidthTable(
      ['.', '.', '@'],
      { family: 'monospace', sizePx: 16 },
      fakeMeasure,
    )
    expect(table.entries).toHaveLength(2)
  })

  it('carries occurrence counts forward as weight, for mapLuminanceToChar', () => {
    const table = buildFontWidthTable(
      ['.', '.', '.', '@', ' ', ' '],
      { family: 'monospace', sizePx: 16 },
      fakeMeasure,
    )
    const byChar = Object.fromEntries(table.entries.map((e) => [e.char, e.weight]))
    expect(byChar).toEqual({ ' ': 2, '.': 3, '@': 1 })
  })
})
