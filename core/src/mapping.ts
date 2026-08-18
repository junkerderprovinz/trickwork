import type { FontWidthTable } from './types'

export function computeBlockLuminance(
  imageData: ImageData,
  x: number,
  y: number,
  blockW: number,
  blockH: number,
): number {
  const { data, width, height } = imageData
  let sum = 0
  let count = 0
  const endX = Math.min(x + blockW, width)
  const endY = Math.min(y + blockH, height)
  for (let py = y; py < endY; py++) {
    for (let px = x; px < endX; px++) {
      const i = (py * width + px) * 4
      const r = data[i] ?? 0
      const g = data[i + 1] ?? 0
      const b = data[i + 2] ?? 0
      // Rec. 601 luma weights, matching standard grayscale conversion.
      sum += (0.299 * r + 0.587 * g + 0.114 * b) / 255
      count++
    }
  }
  return count === 0 ? 0 : sum / count
}

/**
 * Picks the glyph whose ink coverage best matches the block's darkness.
 * Luminance 0 (black) wants the highest-ink glyph; luminance 1 (white)
 * wants the lowest-ink glyph.
 *
 * The target is interpolated into the table's OWN coverage range instead of
 * being treated as an absolute 0..1 coverage. Measured ink coverage is the
 * fraction of a 2x-font-size cell that a glyph actually inks, which for real
 * fonts and charsets lands in roughly 0..0.12 — nowhere near 1. Using
 * (1 - luminance) directly as the target made everything below luminance ~0.9
 * snap to the single densest glyph, so images came out as one solid block.
 */
export function mapLuminanceToChar(
  luminance: number,
  table: FontWidthTable,
): string {
  let best = table.entries[0]
  if (!best) {
    throw new Error('mapLuminanceToChar: font width table has no entries')
  }

  // buildFontWidthTable sorts ascending, but scan for the extremes anyway so
  // a hand-built table in any order still spreads across its full range.
  let lo = best.inkCoverage
  let hi = best.inkCoverage
  for (const entry of table.entries) {
    if (entry.inkCoverage < lo) lo = entry.inkCoverage
    if (entry.inkCoverage > hi) hi = entry.inkCoverage
  }
  const targetCoverage = hi === lo ? lo : lo + (1 - luminance) * (hi - lo)

  let bestDistance = Math.abs(best.inkCoverage - targetCoverage)
  for (const entry of table.entries) {
    const distance = Math.abs(entry.inkCoverage - targetCoverage)
    if (distance < bestDistance) {
      best = entry
      bestDistance = distance
    }
  }
  return best.char
}
