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
 * Mirrors computeBlockLuminance's exact block-bounds loop, but averages the
 * raw R/G/B channels instead of reducing to a single luma value. Only called
 * when MappingOptions.color is set, so the colour-off hot path (every slider
 * drag) pays nothing extra.
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
 * Picks a glyph by RANK, not by nearest measured value: table.entries is
 * sorted ascending by inkCoverage (lightest first), and each entry claims
 * `weight` consecutive rank slots (default 1) instead of exactly one -
 * mirroring ASCGen2's own DefaultRamps mechanic (Variables.cs), where a
 * character repeated N times in the ramp string literally occupies N of the
 * string's index positions and so covers a proportionally wider luminance
 * band once ValuesToFixedWidthTextConverter.cs's own `ramp[round((x/255) *
 * (length-1))]` picks by straight linear index. Ranking here is still by
 * real MEASURED ink coverage (font-aware, more accurate than ASCGen2's
 * hand-picked ordering) - only the SELECTION step (rank vs. nearest-value)
 * changes, so this is ASCGen2's "type it more, it shows up more" weighting
 * (jdp: "je öfter man das gleiche Zeichen eingetragen hat, desto mehr wurde
 * es gewichtet") layered on top of TrickWork's own accuracy, not a wholesale
 * revert to ASCGen2's simpler scheme. A charset with every character
 * appearing exactly once (weight 1 throughout) reduces to the exact same
 * plain rank-by-position ASCGen2 itself uses.
 *
 * Luminance 0 (black) wants the highest-ink glyph (the far/dark end of the
 * sorted, weight-expanded rank space); luminance 1 (white) wants the
 * lowest-ink glyph (the near/light end).
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
  // Only reachable via floating-point rounding at the very top edge -
  // the darkest (last, highest-rank) entry is the correct clamp.
  return entries[entries.length - 1] ?? first
}

export function mapLuminanceToChar(
  luminance: number,
  table: FontWidthTable,
): string {
  return pickRankedEntry(luminance, table).char
}

/**
 * Same RANK-based selection as mapLuminanceToChar, but also reports the
 * "achieved" luminance of the glyph actually picked so a caller can diffuse
 * the difference to neighbouring cells — Floyd-Steinberg dithering needs
 * this error, mapLuminanceToChar's plain char-only return doesn't carry it.
 * Kept as a separate function rather than changing mapLuminanceToChar's
 * signature, since every existing call site and test expects a bare string
 * back.
 *
 * Deliberately NOT rank-based itself: the error dithering diffuses is a
 * PHOTOMETRIC one (how far the glyph's true rendered darkness missed the
 * target), so it's computed from the picked glyph's own real measured
 * inkCoverage, normalized against the table's actual coverage range - using
 * the glyph's RANK position instead would diffuse a positional error that
 * has nothing to do with what actually got rendered.
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

  // hi === lo means every glyph has identical coverage - there is no error to
  // diffuse since no choice could have done better, so report the target
  // itself as achieved (zero error).
  const achievedLuminance = hi === lo ? luminance : 1 - (best.inkCoverage - lo) / (hi - lo)
  return { char: best.char, achievedLuminance }
}
