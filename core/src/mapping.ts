import type { FontWidthTable, GlyphMetrics, RGB } from './types'

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
 * Averages R, G and B over the same block as computeBlockLuminance. Only
 * called with MappingOptions.color set, so the uncoloured path pays nothing.
 */
export function computeBlockAverageColor(
  imageData: ImageData,
  x: number,
  y: number,
  blockW: number,
  blockH: number,
): RGB {
  const { data, width, height } = imageData
  let r = 0
  let g = 0
  let b = 0
  let count = 0
  const endX = Math.min(x + blockW, width)
  const endY = Math.min(y + blockH, height)
  for (let py = y; py < endY; py++) {
    for (let px = x; px < endX; px++) {
      const i = (py * width + px) * 4
      r += data[i] ?? 0
      g += data[i + 1] ?? 0
      b += data[i + 2] ?? 0
      count++
    }
  }
  if (count === 0) return { r: 0, g: 0, b: 0 }
  return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) }
}

/**
 * Picks a glyph by rank rather than by nearest coverage. Entries are sorted by
 * measured ink coverage and each claims `weight` consecutive slots, so a
 * character repeated in the charset covers a wider luminance band, as in
 * ASCGen2's ramps. Luminance 0 maps to the inkiest glyph, 1 to the lightest.
 */
function pickRankedEntry(
  luminance: number,
  table: FontWidthTable,
): GlyphMetrics {
  const entries = table.entries
  const first = entries[0]
  if (!first) {
    throw new Error('pickRankedEntry: font width table has no entries')
  }

  let totalWeight = 0
  for (const entry of entries) {
    totalWeight += entry.weight ?? 1
  }

  const targetRank = Math.round((1 - luminance) * (totalWeight - 1))
  let cursor = 0
  for (const entry of entries) {
    const weight = entry.weight ?? 1
    if (targetRank < cursor + weight) {
      return entry
    }
    cursor += weight
  }
  // Reached only through floating-point rounding at the dark end.
  return entries[entries.length - 1] ?? first
}

export function mapLuminanceToChar(
  luminance: number,
  table: FontWidthTable,
): string {
  return pickRankedEntry(luminance, table).char
}

/**
 * Like mapLuminanceToChar, but also returns the luminance the picked glyph
 * achieves, for Floyd-Steinberg dithering. It comes from the glyph's measured
 * ink coverage within the table's range rather than from its rank, because
 * the error to diffuse is how far the rendered darkness missed the target.
 */
export function mapLuminanceToCharWithAchieved(
  luminance: number,
  table: FontWidthTable,
): { char: string; achievedLuminance: number } {
  const best = pickRankedEntry(luminance, table)

  let lo = best.inkCoverage
  let hi = best.inkCoverage
  for (const entry of table.entries) {
    if (entry.inkCoverage < lo) lo = entry.inkCoverage
    if (entry.inkCoverage > hi) hi = entry.inkCoverage
  }

  // With identical coverage everywhere no other glyph could have done better,
  // so there is no error to diffuse.
  const achievedLuminance = hi === lo ? luminance : 1 - (best.inkCoverage - lo) / (hi - lo)
  return { char: best.char, achievedLuminance }
}
