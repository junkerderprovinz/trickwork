// core/src/glyphMeasure.ts
import type {
  FontSpec,
  FontWidthMeasurer,
  GlyphMeasurer,
  GlyphMetrics,
} from './types'

type CanvasFactory = (sizePx: number) => HTMLCanvasElement | OffscreenCanvas

/**
 * Characters sampled to derive a font's cell pitch. A proportional font has no
 * single "the" advance width, so take the widest of a few reliably-wide
 * glyphs: pitch the grid to the narrowest of them and the wide ones collide.
 */
const WIDTH_SAMPLE_CHARS = ['M', 'W', '@']

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

/**
 * Sibling of createCanvasGlyphMeasurer for advance width rather than ink
 * coverage: reports the widest advance among WIDTH_SAMPLE_CHARS at the given
 * font, via a real ctx.measureText. Feed the result to measureCellSize to get
 * a grid pitch that matches the selected font instead of assuming 8x16px.
 *
 * Same canvas-factory injection as its sibling, so the canvas dependency stays
 * a parameter rather than a global reach for `document`.
 */
export function createCanvasWidthMeasurer(
  canvasFactory: CanvasFactory = defaultCanvasFactory,
): FontWidthMeasurer {
  return (font: FontSpec): number => {
    const canvas = canvasFactory(font.sizePx)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null
    if (!ctx) {
      throw new Error('createCanvasWidthMeasurer: 2D context unavailable')
    }

    ctx.font = `${font.sizePx}px ${font.family}`
    let widest = 0
    for (const char of WIDTH_SAMPLE_CHARS) {
      const width = ctx.measureText(char).width
      if (width > widest) widest = width
    }
    return widest
  }
}

function defaultCanvasFactory(sizePx: number): HTMLCanvasElement {
  const dim = sizePx * 2
  const canvas = document.createElement('canvas')
  canvas.width = dim
  canvas.height = dim
  return canvas
}
