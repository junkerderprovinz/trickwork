import { describe, expect, it } from 'vitest'
import { toRTF } from './toRTF'
import type { Grid } from '../types'

/** Pulls the numeric argument out of every \uN? escape in the document. */
function readEscapedValues(rtf: string): number[] {
  return [...rtf.matchAll(/\\u(-?\d+)\?/g)].map((match) => Number(match[1]))
}

describe('toRTF', () => {
  it('wraps rows in an RTF document with a monospace font table entry', () => {
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'serif', sizePx: 20 } }, // font is deliberately ignored
        { char: 'B', font: { family: 'serif', sizePx: 20 } },
      ],
    ]
    const rtf = toRTF(grid)
    expect(rtf).toContain('{\\rtf1')
    expect(rtf).toContain('Courier New')
    expect(rtf).toContain('AB')
  })

  it('escapes RTF control characters in the content', () => {
    const grid: Grid = [[{ char: '\\', font: { family: 'monospace', sizePx: 10 } }]]
    const rtf = toRTF(grid)
    expect(rtf).toContain('\\\\')
  })

  it('escapes a non-ASCII BMP character below 0x8000 as a plain unicode escape', () => {
    // U+2588 FULL BLOCK, from the "blocks" charset preset.
    const grid: Grid = [[{ char: '█', font: { family: 'monospace', sizePx: 10 } }]]
    expect(toRTF(grid)).toContain('\\u9608?')
  })

  it('emits a codepoint at or above 0x8000 as a signed 16-bit value', () => {
    // U+FF21 FULLWIDTH LATIN CAPITAL LETTER A = 65313, which does not fit in a
    // signed 16-bit int: RTF wants 65313 - 65536 = -223.
    const grid: Grid = [[{ char: 'Ａ', font: { family: 'monospace', sizePx: 10 } }]]
    const rtf = toRTF(grid)
    expect(rtf).toContain('\\u-223?')
    expect(rtf).not.toContain('\\u65313?')
    for (const value of readEscapedValues(rtf)) {
      expect(value).toBeGreaterThanOrEqual(-32768)
      expect(value).toBeLessThanOrEqual(32767)
    }
  })

  it('splits a character above the BMP into a surrogate pair of escapes', () => {
    // U+1F600 GRINNING FACE = 128512 -> surrogates D83D/DE00 -> -10179 / -8704.
    const grid: Grid = [[{ char: '😀', font: { family: 'monospace', sizePx: 10 } }]]
    const rtf = toRTF(grid)
    expect(rtf).toContain('\\u-10179?\\u-8704?')
    expect(readEscapedValues(rtf)).toEqual([-10179, -8704])
  })

  it('separates rows with an RTF line break, not a raw newline', () => {
    const grid: Grid = [
      [{ char: 'A', font: { family: 'monospace', sizePx: 10 } }],
      [{ char: 'B', font: { family: 'monospace', sizePx: 10 } }],
    ]
    const rtf = toRTF(grid)
    expect(rtf).toContain('A\\line')
  })
})
