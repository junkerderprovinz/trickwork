import qrcode from 'qrcode-generator'

/** The clear margin the QR spec requires around a code, in modules. */
const QUIET = 4

/**
 * A value as a scannable square in SVG, always black on white, since many
 * scanners fail on an inverted code. Each run of dark modules in a row is one
 * rectangle, which keeps the path short.
 */
export function qrSvg(value: string, size: number): string {
  const qr = qrcode(0, 'M')
  qr.addData(value)
  qr.make()
  const count = qr.getModuleCount()
  const parts: string[] = []
  for (let row = 0; row < count; row++) {
    let runStart = -1
    for (let col = 0; col <= count; col++) {
      const dark = col < count && qr.isDark(row, col)
      if (dark && runStart < 0) {
        runStart = col
      } else if (!dark && runStart >= 0) {
        parts.push(`M${runStart + QUIET} ${row + QUIET}h${col - runStart}v1h-${col - runStart}z`)
        runStart = -1
      }
    }
  }
  const extent = count + QUIET * 2
  return `<svg viewBox="0 0 ${extent} ${extent}" width="${size}" height="${size}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${extent}" height="${extent}" fill="#ffffff"/><path d="${parts.join('')}" fill="#000000"/></svg>`
}
