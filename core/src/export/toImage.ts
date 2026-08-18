// core/src/export/toImage.ts
import { renderGridToCanvas, type RenderOptions } from '../renderGridToCanvas'
import type { Grid } from '../types'

export interface CanvasLike {
  width: number
  height: number
  getContext(kind: '2d'): CanvasRenderingContext2D | null
  convertToBlob(options?: { type?: string }): Promise<Blob>
}

export type CanvasFactory = (width: number, height: number) => CanvasLike

export async function toImage(
  grid: Grid,
  options: RenderOptions,
  canvasFactory: CanvasFactory,
): Promise<Blob> {
  const rows = grid.length
  const columns = grid[0]?.length ?? 0
  const pixelWidth = columns * options.cellWidthPx
  const pixelHeight = rows * options.cellHeightPx

  const canvas = canvasFactory(pixelWidth, pixelHeight)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('toImage: 2D context unavailable from canvasFactory')
  }

  renderGridToCanvas(ctx, grid, options)

  return canvas.convertToBlob({ type: 'image/png' })
}
