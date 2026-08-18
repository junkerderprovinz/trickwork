export interface FontSpec {
  /** CSS font-family stack, e.g. "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" */
  family: string
  /** Font size in CSS pixels used for measurement and rendering. */
  sizePx: number
}

export interface GlyphMetrics {
  char: string
  /** Fraction of the glyph's em-box covered by "ink" (0 = fully blank, 1 = fully covered). */
  inkCoverage: number
}

/** Glyph metrics for a character set at a specific font, sorted ascending by inkCoverage. */
export interface FontWidthTable {
  font: FontSpec
  entries: GlyphMetrics[]
}

/** Measures one glyph's ink coverage at the given font. Injected so core/ stays DOM-free. */
export type GlyphMeasurer = (char: string, font: FontSpec) => GlyphMetrics

export interface CharCell {
  char: string
  font: FontSpec
}

export type Grid = CharCell[][]

export interface MappingOptions {
  columns: number
  brightness: number // -1..1, additive
  contrast: number // -1..1, multiplicative around 0.5 midpoint
  charset: string[] // darkest-to-lightest is NOT required; buildFontWidthTable re-sorts by measured coverage
  font: FontSpec
}
