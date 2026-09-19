// All presets but `detailed` (Paul Bourke's ramp) are ASCGen2's nine
// DefaultRamps from Variables.cs, in its dark-to-light order with the blank
// last, so the charset field shows the string ASCGen2 showed. Order does not
// change the output, because mapLuminanceToChar re-ranks by measured ink
// coverage. Repeats are kept: characters are picked by rank, so one typed N
// times covers N slots of the luminance range, as in ASCGen2. The preset
// names are TrickWork's own; ASCGen2 listed only the raw strings.
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
