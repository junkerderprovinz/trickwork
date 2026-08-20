// standard/blocks/classic/alternate/compact/bold/symbols/minimal/binary are
// ASCGen2's own nine DefaultRamps (Variables.cs, fetched from the real
// SourceForge source archive and verified byte-for-byte) - kept in their
// AUTHENTIC dark-to-light storage order, densest character first and blank
// space last (jdp: "im ASCII Gen 2 ist die zeichenreihenfolge des
// zeichensatz genau umgekehrt und die leerzeichen kommen zum schluss" - an
// earlier revision of this file reversed the order to TrickWork's own
// light-to-dark habit, which reads backwards next to the real source). Order
// has no effect on the RENDERED output either way - mapLuminanceToChar
// (mapping.ts) always re-ranks by measured ink coverage before picking - so
// this is purely about the charset field showing the same string ASCGen2
// itself would have shown, not a functional change.
//
// REPEATS ARE KEPT, not deduped to a distinct-character set: each preset's
// characters are ranked by their own MEASURED ink coverage (more accurate
// than ASCGen2's hand-picked ordering) and then picked by ASCGen2's own
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
  standard: ['@', '%', '#', '*', '+', '=', '-', ':', '.', ' '],
  detailed:
    ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split(
      '',
    ),
  blocks: ['█', '▓', '▒', '░', ' '],
  classic: [
    'M', 'M', 'M', 'M', 'M', 'M', 'M', '@', '@', '@', '@', '@', '@', '@', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W',
    'W', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', '0', '0', '0', '0', '0', '0', '0', '0', '8', '8', '8', '8', '8',
    '8', '8', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'Z', 'a', 'Z', 'a', 'a', 'a', 'a', 'a', 'a', '2', '2', '2',
    '2', '2', '2', '2', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X', 'X',
    '7', '7', '7', '7', '7', '7', '7', 'r', 'r', 'r', 'r', 'r', 'r', 'r', ';', ';', ';', ';', ';', ';', ';', ';',
    'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', 'i', ':', ':', ':', ':', ':', ':', ':', ',', ':', ',', ',', ',', ',',
    ',', ',', '.', '.', '.', '.', '.', '.', '.', '.', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
  ],
  alternate: [
    '@', '@', '@', '@', '@', '@', '@', '#', '#', '#', '#', '#', '#', 'M', 'M', 'M', 'B', 'B', 'H', 'H', 'H', 'A',
    'A', 'A', 'A', '&', '&', 'G', 'G', 'h', 'h', '9', '9', '3', '3', 'X', 'X', 'X', '2', '2', '2', '2', '5', '5',
    'S', 'S', 'S', 'i', 'i', 'i', 'i', 's', 's', 's', 's', 'r', 'r', 'r', 'r', 'r', 'r', 'r', ';', ';', ';', ';',
    ';', ';', ';', ';', ':', ':', ':', ':', ':', ':', ':', ',', ',', ',', ',', ',', ',', ',', '.', '.', '.', '.',
    '.', '.', '.', '.', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
  ],
  compact: ['#', 'W', 'M', 'B', 'R', 'X', 'V', 'Y', 'I', 't', 'i', '+', '=', ';', ':', ',', '.', ' '],
  bold: [
    '#', '#', 'X', 'X', 'x', 'x', 'x', '+', '+', '+', '=', '=', '=', '-', '-', '-', ';', ';', ',', ',', '.', '.',
    '.', ' ', ' ', ' ', ' ',
  ],
  symbols: [
    '#', '¥', '¥', '®', '®', 'Ø', 'Ø', '$', '$', 'ø', '0', 'o', 'o', '°', '+', '+', '=', '-', ',', '.', ' ', ' ',
    ' ', ' ',
  ],
  minimal: ['#', ' '],
  binary: ['0', '1', ' '],
} as const

export type CharsetPresetKey = keyof typeof CHARSET_PRESETS
