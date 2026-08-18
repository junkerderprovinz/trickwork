// core/src/renderGridToCanvas.test.ts
import { describe, expect, it, vi } from 'vitest'
import { renderGridToCanvas } from './renderGridToCanvas'
import type { Grid } from './types'

function makeFakeCtx() {
  const calls: { fillText: [string, number, number][] } = { fillText: [] }
  const ctx = {
    font: '',
    fillStyle: '',
    textBaseline: 'top' as CanvasTextBaseline,
    textAlign: 'left' as CanvasTextAlign,
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: (char: string, x: number, y: number) => {
      calls.fillText.push([char, x, y])
    },
    canvas: { width: 0, height: 0 },
  }
  return { ctx, calls }
}

describe('renderGridToCanvas', () => {
  it('draws exactly one fillText call per grid cell', () => {
    const { ctx, calls } = makeFakeCtx()
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
    renderGridToCanvas(ctx as unknown as CanvasRenderingContext2D, grid, {
      cellWidthPx: 8,
      cellHeightPx: 16,
      background: '#000000',
      foreground: '#ffffff',
    })
    expect(calls.fillText).toHaveLength(4)
    expect(calls.fillText.map((c) => c[0])).toEqual(['A', 'B', 'C', 'D'])
  })

  it('reports the total pixel dimensions the grid occupies', () => {
    const { ctx } = makeFakeCtx()
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 } },
        { char: 'B', font: { family: 'monospace', sizePx: 10 } },
        { char: 'C', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    const result = renderGridToCanvas(
      ctx as unknown as CanvasRenderingContext2D,
      grid,
      { cellWidthPx: 10, cellHeightPx: 20, background: '#000', foreground: '#fff' },
    )
    expect(result).toEqual({ pixelWidth: 30, pixelHeight: 20 })
  })

  it('positions each cell at its column/row offset', () => {
    const { ctx, calls } = makeFakeCtx()
    const grid: Grid = [
      [
        { char: 'X', font: { family: 'monospace', sizePx: 10 } },
        { char: 'Y', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    renderGridToCanvas(ctx as unknown as CanvasRenderingContext2D, grid, {
      cellWidthPx: 12,
      cellHeightPx: 24,
      background: '#000',
      foreground: '#fff',
    })
    expect(calls.fillText[0]).toEqual(['X', 0, 0])
    expect(calls.fillText[1]).toEqual(['Y', 12, 0])
  })
})
