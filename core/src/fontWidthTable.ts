// core/src/fontWidthTable.ts
import type { FontSpec, FontWidthTable, GlyphMeasurer } from './types'

export function buildFontWidthTable(
  chars: string[],
  font: FontSpec,
  measure: GlyphMeasurer,
): FontWidthTable {
  const unique = Array.from(new Set(chars))
  const entries = unique
    .map((char) => measure(char, font))
    .sort((a, b) => a.inkCoverage - b.inkCoverage)
  return { font, entries }
}
