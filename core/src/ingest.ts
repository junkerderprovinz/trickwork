// core/src/ingest.ts
import { computeDownscaleDimensions } from './downscale'

export interface IngestResult {
  imageData: ImageData
  wasDownscaled: boolean
}

const MAX_WORKING_DIMENSION = 1600

export async function decodeAndPrepareImage(
  source: Blob,
  maxDim: number = MAX_WORKING_DIMENSION,
): Promise<IngestResult> {
  const bitmap = await createImageBitmap(source)
  const { width, height, scaled } = computeDownscaleDimensions(
    bitmap.width,
    bitmap.height,
    maxDim,
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('decodeAndPrepareImage: 2D context unavailable')
  }
  // Composite onto an opaque white background before drawing the bitmap.
  // Canvas represents a fully-transparent pixel as (0,0,0,0), and the mapping
  // stage reads luminance from R/G/B only — so without this fill, every
  // transparent pixel would read as pure black and map to the DENSEST glyph.
  // A logo or icon with a transparent background would come out as a solid
  // block of '@' with the actual artwork lost inside it. White matches how
  // image viewers and other ASCII-art tools treat transparency by default:
  // transparent means "background", which for dark-ink-on-light-paper output
  // is the same thing as "no ink".
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return { imageData: ctx.getImageData(0, 0, width, height), wasDownscaled: scaled }
}
