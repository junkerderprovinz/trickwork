// core/src/glyphMeasure.test.ts
import { describe, expect, it } from 'vitest'
import { createCanvasGlyphMeasurer } from './glyphMeasure'

function makeFakeCanvasFactory(coverageByChar: Record<string, number>) {
  // A fake 2D context that reports a deterministic "ink coverage" per char
  // by returning ImageData whose alpha-channel fill fraction matches the
  // requested coverage, so the measurer's pixel-counting logic is exercised
  // for real without needing an actual browser canvas.
  return (sizePx: number) => {
    const dim = sizePx * 2
    const ctx = {
      font: '',
      textBaseline: 'top' as CanvasTextBaseline,
      textAlign: 'left' as CanvasTextAlign,
      clearRect: () => {},
      fillText: (char: string) => {
        ctx.__lastChar = char
      },
      getImageData: (_x: number, _y: number, w: number, h: number) => {
        const coverage = coverageByChar[ctx.__lastChar ?? ''] ?? 0
        const total = w * h
        const filled = Math.round(total * coverage)
        const data = new Uint8ClampedArray(total * 4)
        for (let i = 0; i < filled; i++) {
          data[i * 4 + 3] = 255 // alpha channel = "ink"
        }
        return { data, width: w, height: h } as ImageData
      },
      __lastChar: undefined as string | undefined,
    }
    const canvas = { width: dim, height: dim, getContext: () => ctx }
    return canvas as unknown as HTMLCanvasElement
  }
}

describe('createCanvasGlyphMeasurer', () => {
  it('reports near-zero ink coverage for a blank glyph', () => {
    const measure = createCanvasGlyphMeasurer(
      makeFakeCanvasFactory({ ' ': 0 }),
    )
    const result = measure(' ', { family: 'monospace', sizePx: 16 })
    expect(result.char).toBe(' ')
    expect(result.inkCoverage).toBeCloseTo(0, 2)
  })

  it('reports high ink coverage for a dense glyph', () => {
    const measure = createCanvasGlyphMeasurer(
      makeFakeCanvasFactory({ '@': 0.9 }),
    )
    const result = measure('@', { family: 'monospace', sizePx: 16 })
    expect(result.inkCoverage).toBeCloseTo(0.9, 2)
  })

  it('orders coverage correctly between a sparse and a dense glyph', () => {
    const measure = createCanvasGlyphMeasurer(
      makeFakeCanvasFactory({ '.': 0.1, '#': 0.6 }),
    )
    const dot = measure('.', { family: 'monospace', sizePx: 16 })
    const hash = measure('#', { family: 'monospace', sizePx: 16 })
    expect(dot.inkCoverage).toBeLessThan(hash.inkCoverage)
  })
})
