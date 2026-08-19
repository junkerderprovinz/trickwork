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

  it('escapes quotes in background/foreground so they cannot break out of the style attribute', () => {
    const grid: Grid = [[{ char: 'A', font: { family: 'monospace', sizePx: 10 } }]]
    const html = toXHTML(grid, {
      background: '#000" onload="evil()',
      foreground: '#fff" onload="evil()',
    })
    expect(html).not.toContain('" onload=')
    expect(html).toContain('&quot; onload=&quot;evil()')
  })

  it('wraps a coloured cell in a span carrying its hex colour', () => {
    const grid: Grid = [[{ char: 'A', font: { family: 'monospace', sizePx: 10 }, color: { r: 255, g: 0, b: 0 } }]]
    const html = toXHTML(grid, { background: '#000', foreground: '#fff' })
    expect(html).toContain('<span style="color: #ff0000">A</span>')
  })

  it('groups consecutive same-colour cells into a single span instead of one per character', () => {
    const red = { r: 255, g: 0, b: 0 }
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 }, color: red },
        { char: 'B', font: { family: 'monospace', sizePx: 10 }, color: red },
        { char: 'C', font: { family: 'monospace', sizePx: 10 }, color: red },
      ],
    ]
    const html = toXHTML(grid, { background: '#000', foreground: '#fff' })
    expect(html).toContain('<span style="color: #ff0000">ABC</span>')
    expect(html.match(/<span/g)).toHaveLength(1)
  })

  it('starts a new span when the colour changes mid-row', () => {
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 }, color: { r: 255, g: 0, b: 0 } },
        { char: 'B', font: { family: 'monospace', sizePx: 10 }, color: { r: 0, g: 255, b: 0 } },
      ],
    ]
    const html = toXHTML(grid, { background: '#000', foreground: '#fff' })
    expect(html).toContain('<span style="color: #ff0000">A</span><span style="color: #00ff00">B</span>')
  })

  it('produces the exact previous flat-<pre> output for an uncoloured grid (no span at all)', () => {
    const grid: Grid = [[{ char: 'A', font: { family: 'monospace', sizePx: 10 } }]]
    const html = toXHTML(grid, { background: '#000', foreground: '#fff' })
    expect(html).not.toContain('<span')
  })
})
