// core/src/export/toImage.test.ts
import { describe, expect, it, vi } from 'vitest'
import { toImage } from './toImage'
import type { Grid } from '../types'

function makeFakeCanvas() {
  const ctx = {
    font: '',
    fillStyle: '',
    textBaseline: 'top' as CanvasTextBaseline,
    textAlign: 'left' as CanvasTextAlign,
    fillRect: vi.fn(),
    fillText: vi.fn(),
  }
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx as unknown as CanvasRenderingContext2D,
    convertToBlob: async () => new Blob(['fake-png-bytes'], { type: 'image/png' }),
  }
  return canvas
}

describe('toImage', () => {
  it('sizes the canvas to fit the full grid before rendering', async () => {
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 } },
        { char: 'B', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    let sizedCanvas: { width: number; height: number } | null = null
    const factory = (w: number, h: number) => {
      const canvas = makeFakeCanvas()
      canvas.width = w
      canvas.height = h
      sizedCanvas = canvas
      return canvas
    }
    await toImage(
      grid,
      { cellWidthPx: 8, cellHeightPx: 16, background: '#000', foreground: '#fff' },
      factory,
    )
    expect(sizedCanvas).not.toBeNull()
    expect(sizedCanvas!.width).toBe(16) // 2 columns * 8px
    expect(sizedCanvas!.height).toBe(16) // 1 row * 16px
  })

  it('resolves with a PNG blob', async () => {
    const grid: Grid = [[{ char: 'A', font: { family: 'monospace', sizePx: 10 } }]]
    const blob = await toImage(
      grid,
      { cellWidthPx: 8, cellHeightPx: 16, background: '#000', foreground: '#fff' },
      (w, h) => {
        const canvas = makeFakeCanvas()
        canvas.width = w
        canvas.height = h
        return canvas
      },
    )
    expect(blob.type).toBe('image/png')
  })

  it('rejects if the factory yields a canvas with no 2D context', async () => {
    const grid: Grid = [[{ char: 'A', font: { family: 'monospace', sizePx: 10 } }]]
    const badFactory = () => ({
      width: 0,
      height: 0,
      getContext: () => null,
      convertToBlob: async () => new Blob([]),
    })
    await expect(
      toImage(
        grid,
        { cellWidthPx: 8, cellHeightPx: 16, background: '#000', foreground: '#fff' },
        badFactory as never,
      ),
    ).rejects.toThrow()
  })
})
