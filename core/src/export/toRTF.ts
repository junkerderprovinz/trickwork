import type { Grid } from '../types'

function escapeRtf(char: string): string {
  if (char === '\\') return '\\\\'
  if (char === '{') return '\\{'
  if (char === '}') return '\\}'
  const code = char.codePointAt(0) ?? 0
  if (code > 127) return `\\u${code}?`
  return char
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
