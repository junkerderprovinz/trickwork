import { describe, expect, it } from 'vitest'
import { toText } from './toText'
import type { Grid } from '../types'

describe('toText', () => {
  it('joins cells in a row with no separator and rows with newlines', () => {
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 } },
        { char: 'B', font: { family: 'monospace', sizePx: 10 } },
      ],
      [
        { char: 'C', font: { family: 'monospace', sizePx: 10 } },
        { char: 'D', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    expect(toText(grid)).toBe('AB\nCD')
  })

  it('returns an empty string for an empty grid', () => {
    expect(toText([])).toBe('')
  })
})
