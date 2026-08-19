// core/src/histogram.ts
//
// Feeds the Levels panel's histogram plot (ui/src/levelsPanel.ts) - a plain
// 256-bucket count of source-image luminance, computed once per image (not
// per slider drag) since the histogram itself doesn't change as the black/
// gamma/white points move, only their overlaid marker positions do.

/** Rec. 601 luma weights, matching mapping.ts's computeBlockLuminance exactly. */
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
