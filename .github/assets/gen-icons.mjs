// Derives every icon from the two masters beside this file, which are the
// designer's files as delivered:
//
//   logo.svg               the shield on its own, for the favicons, the
//                          documentation, the installer's welcome page and the
//                          header in the interface
//   trickwork-appicon.svg  the app tile, for the desktop app (Wails makes the
//                          .ico and .icns from desktop/build/appicon.png), the
//                          installer's window and menu entry, and the Flatpak
//
// Where a file wants the SVG it gets an exact copy. A PNG is rendered at the
// size its place asks for, the logo centred on a transparent square that its
// own viewBox decides the shape in.
//
// Deps (global): @resvg/resvg-js.
// Run: node .github/assets/gen-icons.mjs
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { Resvg } = require(`${execSync('npm root -g').toString().trim()}/@resvg/resvg-js`)

const here = dirname(fileURLToPath(import.meta.url))
const repo = join(here, '..', '..')
const logo = join(here, 'logo.svg')
const tile = join(here, 'trickwork-appicon.svg')

for (const to of ['ui/public/logo.svg', 'ui/public/favicon.svg', 'docs/assets/logo.svg', 'desktop/installer/logo.svg']) {
  copyFileSync(logo, join(repo, to))
}

function square(file, size) {
  const svg = readFileSync(file, 'utf8').replace(/<\?xml[^>]*\?>\s*/, '')
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/[\s,]+/).map(Number)
  const scale = size / Math.max(w, h)
  const placed = svg.replace(
    /<svg\b[^>]*>/,
    (open) => open.replace(/viewBox="[^"]+"/, `x="${((size - w * scale) / 2).toFixed(2)}" y="${((size - h * scale) / 2).toFixed(2)}" width="${(w * scale).toFixed(2)}" height="${(h * scale).toFixed(2)}" $&`),
  )
  const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${placed}</svg>`
  return new Resvg(doc, { fitTo: { mode: 'width', value: size } }).render().asPng()
}

const outputs = [
  [logo, 64, 'ui/public/favicon.png'],
  [logo, 64, 'docs/assets/favicon.png'],
  [tile, 1024, 'desktop/build/appicon.png'],
  [tile, 1024, '.github/assets/trickwork-appicon.png'],
  [tile, 256, 'desktop/installer/icon.png'],
]
for (const [from, size, to] of outputs) {
  writeFileSync(join(repo, to), square(from, size))
  console.log(`wrote ${to}`)
}
