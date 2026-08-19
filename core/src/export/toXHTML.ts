// core/src/export/toXHTML.ts
import { rgbToHex, sameColor } from '../color'
import type { Grid } from '../types'
import { toText } from './toText'

export interface XHTMLOptions {
  background: string
  foreground: string
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function gridHasColor(grid: Grid): boolean {
  return grid.some((row) => row.some((cell) => cell.color !== undefined))
}

/**
 * Groups consecutive same-colour cells in a row into one <span>, mirroring
 * ASCGen2's own OutputCreator.CreateHtml() (its characterToColor[y][x] = -1
 * marker for "same as predecessor" is the identical run-length idea). Without
 * this, a coloured export would emit one span per character.
 */
function rowToHtml(row: Grid[number]): string {
  let html = ''
  let i = 0
  while (i < row.length) {
    const cell = row[i]
    if (!cell) break
    const color = cell.color
    let j = i + 1
    while (j < row.length && sameColor(row[j]?.color, color)) j++
    const text = escapeXml(
      row
        .slice(i, j)
        .map((c) => c.char)
        .join(''),
    )
    html += color ? `<span style="color: ${rgbToHex(color)}">${text}</span>` : text
    i = j
  }
  return html
}

export function toXHTML(grid: Grid, options: XHTMLOptions): string {
  // Uncoloured grids (every existing caller, before this feature existed)
  // keep the exact previous single flat-<pre> output, byte for byte.
  const body = gridHasColor(grid) ? grid.map(rowToHtml).join('\n') : escapeXml(toText(grid))
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>TrickWork export</title>
</head>
<body style="background-color: ${escapeXml(options.background)}; margin: 0;">
<pre style="background-color: ${escapeXml(options.background)}; color: ${escapeXml(options.foreground)}; margin: 0; padding: 1em; white-space: pre; font-family: monospace;">
${body}
</pre>
</body>
</html>
`
}
