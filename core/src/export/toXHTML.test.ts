// core/src/export/toXHTML.test.ts
import { describe, expect, it } from 'vitest'
import { toXHTML } from './toXHTML'
import type { Grid } from '../types'

describe('toXHTML', () => {
  it('wraps escaped grid content in a styled <pre> inside a full XHTML document', () => {
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 } },
        { char: '<', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    const html = toXHTML(grid, { background: '#000000', foreground: '#ffffff' })
    expect(html).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(html).toContain('<pre')
    expect(html).toContain('background-color: #000000')
    expect(html).toContain('color: #ffffff')
    expect(html).toContain('A&lt;')
    expect(html).not.toContain('A<') // the raw '<' must never appear unescaped
  })

  it('escapes ampersands and quotes as well as angle brackets', () => {
    const grid: Grid = [[{ char: '&', font: { family: 'monospace', sizePx: 10 } }]]
    const html = toXHTML(grid, { background: '#000', foreground: '#fff' })
    expect(html).toContain('&amp;')
  })
})
