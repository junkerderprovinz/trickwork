/**
 * Counts source luminance into 256 buckets for the Levels panel, once per
 * image, since moving the black, gamma and white points only moves the markers.
 * Uses the Rec. 601 weights of computeBlockLuminance.
 */
export function computeLuminanceHistogram(imageData: ImageData): Uint32Array {
  const buckets = new Uint32Array(256)
  const { data } = imageData
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0
    const g = data[i + 1] ?? 0
    const b = data[i + 2] ?? 0
    const luma = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    const bucket = Math.min(255, Math.max(0, luma))
    buckets[bucket] = (buckets[bucket] ?? 0) + 1
  }
  return buckets
}
