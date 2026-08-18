import { describe, expect, it } from 'vitest'
import { toRTF } from './toRTF'
import type { Grid } from '../types'

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

  it('separates rows with an RTF line break, not a raw newline', () => {
    const grid: Grid = [
      [{ char: 'A', font: { family: 'monospace', sizePx: 10 } }],
      [{ char: 'B', font: { family: 'monospace', sizePx: 10 } }],
    ]
    const rtf = toRTF(grid)
    expect(rtf).toContain('A\\line')
  })
})
