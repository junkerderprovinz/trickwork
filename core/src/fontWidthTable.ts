import type { FontSpec, FontWidthTable, GlyphMeasurer } from './types'

export function buildFontWidthTable(
  chars: string[],
  font: FontSpec,
  measure: GlyphMeasurer,
): FontWidthTable {
  // Each glyph is measured once, but keeps its count as `weight`: a repeated
  // character claims more of the luminance range when picked by rank.
  const counts = new Map<string, number>()
  for (const char of chars) {
    counts.set(char, (counts.get(char) ?? 0) + 1)
  }
  const entries = Array.from(counts.keys())
    .map((char) => ({ ...measure(char, font), weight: counts.get(char) ?? 1 }))
    .sort((a, b) => a.inkCoverage - b.inkCoverage)
  return { font, entries }
}
