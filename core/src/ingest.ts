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
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return { imageData: ctx.getImageData(0, 0, width, height), wasDownscaled: scaled }
}
