import type {
  FontSpec,
  FontWidthMeasurer,
  GlyphMeasurer,
  GlyphMetrics,
} from './types'

type CanvasFactory = (sizePx: number) => HTMLCanvasElement | OffscreenCanvas

/**
 * A proportional font has no single advance width, so the cell pitch follows
 * the widest of a few wide glyphs; any narrower pitch makes them collide.
 */
const WIDTH_SAMPLE_CHARS = ['M', 'W', '@']

/**
 * Creates a canvas-backed GlyphMeasurer that draws each glyph on a square of
 * twice the font size and reports the fraction of pixels with any alpha as
 * its ink coverage, so mapping follows a glyph's real density.
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
 * Creates a FontWidthMeasurer that reports the widest advance among
 * WIDTH_SAMPLE_CHARS, for measureCellSize.
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
