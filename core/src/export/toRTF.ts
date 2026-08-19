import { sameColor } from '../color'
import type { Grid, RGB } from '../types'

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

function gridHasColor(grid: Grid): boolean {
  return grid.some((row) => row.some((cell) => cell.color !== undefined))
}

/**
 * Collects every distinct colour used in the grid, in first-seen order -
 * mirrors ASCGen2's OutputCreator.uniqueColors ArrayList, which the RTF
 * \colortbl and the \cfN indices below are built from the same way.
 */
function collectUniqueColors(grid: Grid): RGB[] {
  const unique: RGB[] = []
  for (const row of grid) {
    for (const cell of row) {
      if (cell.color && !unique.some((c) => sameColor(c, cell.color))) {
        unique.push(cell.color)
      }
    }
  }
  return unique
}

function colorTableRtf(colors: RGB[]): string {
  const entries = colors.map((c) => `\\red${c.r}\\green${c.g}\\blue${c.b};`).join('')
  return `{\\colortbl;${entries}}\n`
}

/**
 * Groups consecutive same-colour cells into one \cfN-prefixed run, exactly
 * the run-length idea ASCGen2's OutputCreator.CreateRtf() uses (its
 * characterToColor[y][x] = -1 marker for "same as predecessor").
 */
function rowToRtf(row: Grid[number], colors: RGB[]): string {
  let out = ''
  let i = 0
  while (i < row.length) {
    const cell = row[i]
    if (!cell) break
    const color = cell.color
    let j = i + 1
    while (j < row.length && sameColor(row[j]?.color, color)) j++
    const text = row
      .slice(i, j)
      .map((c) => escapeRtf(c.char))
      .join('')
    if (color) {
      const index = colors.findIndex((c) => sameColor(c, color)) + 1
      out += `\\cf${index} ${text}`
    } else {
      out += text
    }
    i = j
  }
  return out
}

export function toRTF(grid: Grid): string {
  const colored = gridHasColor(grid)
  const colors = colored ? collectUniqueColors(grid) : []

  const body = colored
    ? grid.map((row) => rowToRtf(row, colors)).join('\\line\n')
    : grid.map((row) => row.map((cell) => escapeRtf(cell.char)).join('')).join('\\line\n')

  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fmodern\\fcharset0 Courier New;}}
${colored ? colorTableRtf(colors) : ''}\\f0\\fs20
${body}
}
`
}
