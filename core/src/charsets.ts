// standard/blocks below are independently-built but landed on the exact same
// character sets as two of ASCGen2's own nine DefaultRamps (Variables.cs) -
// confirmed by dedupe-comparing against the real source. classic/alternate/
// compact/bold/symbols/minimal/binary are the other seven, brought in as
// distinct-character SETS rather than literal strings: ASCGen2's own ramps
// repeat a character many times in a row (e.g. 'M' x7) to weight it in a
// simple linear luminance-percentile lookup, but TrickWork's mapLuminanceToChar
// instead finds the nearest MEASURED ink-coverage match among distinct
// characters (see mapping.ts) - a repeated entry there is pure dead weight,
// never anything a native single-string ramp needed to express. ASCGen2 has
// no user-facing preset NAMES at all (its dropdown just showed the raw
// string); these names are TrickWork's own.
export const CHARSET_PRESETS = {
  standard: ' .:-=+*#%@'.split(''),
  detailed:
    ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split(
      '',
    ),
  blocks: ' ░▒▓█'.split(''),
  classic: [' ', '.', ',', ':', 'i', ';', 'r', '7', 'X', 'S', '2', 'a', 'Z', '8', '0', 'B', 'W', '@', 'M'],
  alternate: [
    ' ', '.', ',', ':', ';', 'r', 's', 'i', 'S', '5', '2', 'X', '3', '9', 'h', 'G', '&', 'A', 'H', 'B', 'M', '#', '@',
  ],
  compact: [' ', '.', ',', ':', ';', '=', '+', 'i', 't', 'I', 'Y', 'V', 'X', 'R', 'B', 'M', 'W', '#'],
  bold: [' ', '.', ',', ';', '-', '=', '+', 'x', 'X', '#'],
  symbols: [' ', '.', ',', '-', '=', '+', '°', 'o', '0', 'ø', '$', 'Ø', '®', '¥', '#'],
  minimal: [' ', '#'],
  binary: [' ', '1', '0'],
} as const

export type CharsetPresetKey = keyof typeof CHARSET_PRESETS
