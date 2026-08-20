// core/src/fontWidthTable.ts
import type { FontSpec, FontWidthTable, GlyphMeasurer } from './types'

export function buildFontWidthTable(
  chars: string[],
  font: FontSpec,
  measure: GlyphMeasurer,
): FontWidthTable {
  // Dedupe for MEASUREMENT only (no point rendering the same glyph to a
  // canvas twice) - but count occurrences first and carry that count
  // forward as each entry's `weight`, since a repeated character is meant
  // to claim proportionally more of the luminance range once picked by
  // rank rather than nearest-value (see mapLuminanceToChar/GlyphMetrics).
  const counts = new Map<string, number>()
  for (const char of chars) {
    counts.set(char, (counts.get(char) ?? 0) + 1)
  }
  const entries = Array.from(counts.keys())
    .map((char) => ({ ...measure(char, font), weight: counts.get(char) ?? 1 }))
    .sort((a, b) => a.inkCoverage - b.inkCoverage)
  return { font, entries }
}
