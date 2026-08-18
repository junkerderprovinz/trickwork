// core/src/glyphMeasure.ts
import type { FontSpec, GlyphMeasurer, GlyphMetrics } from './types'

type CanvasFactory = (sizePx: number) => HTMLCanvasElement | OffscreenCanvas

/**
 * Creates a real, Canvas-backed GlyphMeasurer: renders each glyph to an
 * offscreen square canvas sized to 2x the font size (generous margin for
 * ascenders/descenders/overshoot), then counts the fraction of pixels with
 * non-zero alpha as the glyph's "ink coverage". This is what lets the
 * character mapping account for a glyph's rendered visual density instead
 * of assuming every character in a monospace grid looks equally "full".
 */
export function createCanvasGlyphMeasurer(
  canvasFactory: CanvasFactory = defaultCanvasFactory,
): GlyphMeasurer {
  return (char: string, font: FontSpec): GlyphMetrics => {
    const sizePx = font.sizePx
    const canvas = canvasFactory(sizePx)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null
    if (!ctx) {
      throw new Error('createCanvasGlyphMeasurer: 2D context unavailable')
    }

    const dim = canvas.width
    ctx.clearRect(0, 0, dim, dim)
    ctx.font = `${sizePx}px ${font.family}`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillText(char, dim * 0.25, dim * 0.25)

    const imageData = ctx.getImageData(0, 0, dim, dim)
    let filled = 0
    const pixelCount = imageData.width * imageData.height
    for (let i = 0; i < pixelCount; i++) {
      const alpha = imageData.data[i * 4 + 3]
      if (alpha !== undefined && alpha > 0) filled++
    }

    return { char, inkCoverage: pixelCount === 0 ? 0 : filled / pixelCount }
  }
}

function defaultCanvasFactory(sizePx: number): HTMLCanvasElement {
  const dim = sizePx * 2
  const canvas = document.createElement('canvas')
  canvas.width = dim
  canvas.height = dim
  return canvas
}
