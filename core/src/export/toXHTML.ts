// core/src/export/toXHTML.ts
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

export function toXHTML(grid: Grid, options: XHTMLOptions): string {
  const escaped = escapeXml(toText(grid))
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>ASCII SuperGenerator export</title>
</head>
<body style="background-color: ${escapeXml(options.background)}; margin: 0;">
<pre style="background-color: ${escapeXml(options.background)}; color: ${escapeXml(options.foreground)}; margin: 0; padding: 1em; white-space: pre; font-family: monospace;">
${escaped}
</pre>
</body>
</html>
`
}
