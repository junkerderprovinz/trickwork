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
  /**
   * How often the character appears in the source charset; absent means 1.
   * mapLuminanceToChar gives it that many rank slots, which is how ASCGen2
   * weights a character by repetition.
   */
  weight?: number
}

/** Glyph metrics for a character set at a specific font, sorted ascending by inkCoverage. */
export interface FontWidthTable {
  font: FontSpec
  entries: GlyphMetrics[]
}

/** Measures one glyph's ink coverage at the given font. Injected so core/ stays DOM-free. */
export type GlyphMeasurer = (char: string, font: FontSpec) => GlyphMetrics

/**
 * Measures a representative advance width (in CSS pixels) for the given font,
 * used to derive the render grid's cell pitch. Injected for the same reason as
 * GlyphMeasurer: the real implementation needs a canvas, the tests do not.
 */
export type FontWidthMeasurer = (font: FontSpec) => number

export interface RGB {
  r: number
  g: number
  b: number
}

export interface CharCell {
  char: string
  font: FontSpec
  /** Present only when MappingOptions.color is true. */
  color?: RGB
}

export type Grid = CharCell[][]

/** Degrees clockwise, any value; -15 and 345 are the same turn. */
export type Rotation = number
export type SharpenMethod = 'none' | 'sharpen' | 'unsharp'

/**
 * Photoshop/ASCGen2-style Levels: black/white are 0..255 input clip points,
 * gamma is the midtone curve (1 = linear, >1 lifts midtones, <1 sinks them).
 * {black: 0, gamma: 1, white: 255} is the identity.
 */
export interface LevelsSpec {
  black: number
  gamma: number
  white: number
}

/**
 * A crop rectangle as fractions (0..1) of the source image, which stay correct
 * across a downscale, a rotation or a new image at another resolution.
 */
export interface CropSpec {
  x: number
  y: number
  width: number
  height: number
}

export interface MappingOptions {
  columns: number
  /**
   * Explicit row count, overriding computeAutoRows. The aspect-ratio lock
   * works by leaving it unset, so "locked" and "no override" are one state.
   */
  rows?: number
  brightness: number // -1..1, additive
  contrast: number // -1..1, multiplicative around 0.5 midpoint
  charset: string[] // any order; buildFontWidthTable sorts by measured coverage
  font: FontSpec
  /** Attaches per-cell average colour to the grid. Default false (no perf cost). */
  color?: boolean
  /** Floyd-Steinberg error diffusion across the character grid. Default false. */
  dither?: boolean
  /** Rotates the source image before sampling. Default 0 (no-op). */
  rotate?: Rotation
  flipHorizontal?: boolean
  flipVertical?: boolean
  invert?: boolean
  sharpen?: SharpenMethod
  /** Default {black: 0, gamma: 1, white: 255} (no-op) when omitted. */
  levels?: LevelsSpec
  /** Restricts sampling to this region of the source image. Omitted = full image. */
  crop?: CropSpec
}
