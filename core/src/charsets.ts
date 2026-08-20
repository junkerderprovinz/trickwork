// standard/blocks/classic/alternate/compact/bold/symbols/minimal/binary are
// ASCGen2's own nine DefaultRamps (Variables.cs, fetched from the real
// SourceForge source archive and verified byte-for-byte, reversed here from
// its dark->light storage order to TrickWork's own light->dark convention).
// Unlike an earlier revision of this file, REPEATS ARE KEPT, not deduped to
// a distinct-character set: mapLuminanceToChar (mapping.ts) ranks each
// preset's characters by their own MEASURED ink coverage (more accurate
// than ASCGen2's hand-picked ordering) and then picks by ASCGen2's own
// linear-percentile RANK, not nearest-value - so a character repeated N
// times in the source ramp claims N adjacent rank slots and covers a
// proportionally wider luminance band, exactly reproducing ASCGen2's own
// "type it more, it shows up more" weighting (jdp: "je öfter man das
// gleiche Zeichen eingetragen hat, desto mehr wurde es gewichtet"). Five of
// the nine (standard/compact/minimal/binary/blocks) happen to have no
// repeated character in the original source at all, so they render exactly
// as before; classic/alternate/bold/symbols now visibly favour their most-
// repeated characters. `detailed` is not one of ASCGen2's nine - it's the
// separately well-known ~70-character community ramp (Paul Bourke's), kept
// as TrickWork's own bonus preset. ASCGen2 has no user-facing preset NAMES
// at all (its dropdown just showed the raw string); these names are
// TrickWork's own.
export const CHARSET_PRESETS = {
  standard: [' ', '.', ':', '-', '=', '+', '*', '#', '%', '@'],
  detailed:
    ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split(
      '',
    ),
  blocks: [' ', '░', '▒', '▓', '█'],
  classic: [
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '.', ',', ',', ',', ',', ',', ',',
    ':', ',', ':', ':', ':', ':', ':', ':', ':', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', ';', ';', ';', ';',
    ';', ';', ';', ';', 'r', 'r', 'r', 'r', 'r', 'r', 'r', '7', '7', '7', '7', '7', '7', '7', 'X', 'X', 'X', 'X',
    'X', 'X', 'X', 'X', 'X', 'X', 'X', 'S', 'S', 'S', 'S', 'S', 'S', 'S', '2', '2', '2', '2', '2', '2', '2', 'a',
    'a', 'a', 'a', 'a', 'a', 'Z', 'a', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', '8', '8', '8', '8', '8', '8',
    '8', '0', '0', '0', '0', '0', '0', '0', '0', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'W', 'W', 'W', 'W', 'W',
    'W', 'W', 'W', 'W', '@', '@', '@', '@', '@', '@', '@', 'M', 'M', 'M', 'M', 'M', 'M', 'M',
  ],
  alternate: [
    ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '.', '.', '.', '.', '.', '.', '.', '.', ',', ',', ',', ',', ',', ',',
    ',', ':', ':', ':', ':', ':', ':', ':', ';', ';', ';', ';', ';', ';', ';', ';', 'r', 'r', 'r', 'r', 'r', 'r',
    'r', 's', 's', 's', 's', 'i', 'i', 'i', 'i', 'S', 'S', 'S', '5', '5', '2', '2', '2', '2', 'X', 'X', 'X', '3',
    '3', '9', '9', 'h', 'h', 'G', 'G', '&', '&', 'A', 'A', 'A', 'A', 'H', 'H', 'H', 'B', 'B', 'M', 'M', 'M', '#',
    '#', '#', '#', '#', '#', '@', '@', '@', '@', '@', '@', '@',
  ],
  compact: [' ', '.', ',', ':', ';', '=', '+', 'i', 't', 'I', 'Y', 'V', 'X', 'R', 'B', 'M', 'W', '#'],
  bold: [
    ' ', ' ', ' ', ' ', '.', '.', '.', ',', ',', ';', ';', '-', '-', '-', '=', '=', '=', '+', '+', '+', 'x', 'x',
    'x', 'X', 'X', '#', '#',
  ],
  symbols: [
    ' ', ' ', ' ', ' ', '.', ',', '-', '=', '+', '+', '°', 'o', 'o', '0', 'ø', '$', '$', 'Ø', 'Ø', '®', '®', '¥',
    '¥', '#',
  ],
  minimal: [' ', '#'],
  binary: [' ', '1', '0'],
} as const

export type CharsetPresetKey = keyof typeof CHARSET_PRESETS
