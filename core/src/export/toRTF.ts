import type { Grid } from '../types'

/**
 * RTF's \uN control word takes a SIGNED 16-bit integer, so anything at or above
 * 0x8000 has to be written as (code - 65536), and anything outside the BMP has
 * to go out as its two UTF-16 surrogate units, each with its own escape. The
 * trailing '?' is the mandatory ANSI fallback character for readers that do not
 * understand the unicode escape.
 */
function escapeRtf(char: string): string {
  if (char === '\\') return '\\\\'
  if (char === '{') return '\\{'
  if (char === '}') return '\\}'
  const code = char.codePointAt(0) ?? 0
  if (code <= 127) return char
  const units =
    code > 0xffff
      ? [0xd800 + ((code - 0x10000) >> 10), 0xdc00 + ((code - 0x10000) & 0x3ff)]
      : [code]
  return units.map((unit) => `\\u${unit > 32767 ? unit - 65536 : unit}?`).join('')
}

export function toRTF(grid: Grid): string {
  const body = grid
    .map((row) => row.map((cell) => escapeRtf(cell.char)).join(''))
    .join('\\line\n')
  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fmodern\\fcharset0 Courier New;}}
\\f0\\fs20
${body}
}
`
}
