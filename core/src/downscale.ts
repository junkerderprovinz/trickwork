export interface DownscaleResult {
  width: number
  height: number
  scaled: boolean
}

export function computeDownscaleDimensions(
  width: number,
  height: number,
  maxDim: number,
): DownscaleResult {
  const largest = Math.max(width, height)
  if (largest <= maxDim) {
    return { width, height, scaled: false }
  }
  const ratio = maxDim / largest
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
    scaled: true,
  }
}
