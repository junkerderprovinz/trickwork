// Builds the README's pictures in .github/assets/screenshots: the web
// interface in a browser window for the container and in an app window for
// the desktop build, each on the dark relief background beside a caption, in
// the house style of the store pictures.
//
// The interface is the real build in ui/dist, loaded into a headless browser
// with the helmet beside this file as its only image. Every request is
// answered from ui/dist inside the browser, so nothing listens on a port. The
// desktop pictures load the page from the address the Wails window uses, with
// a stand-in for the Wails runtime.
//
// Every picture is rendered at twice the size and scaled down in a second
// page, which keeps the text sharp through the window's tilt.
//
// Deps (global): playwright-core with its Chromium installed.
// Run: npm run build && node scripts/screenshots/render.mjs

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const { chromium } = require(`${execSync('npm root -g').toString().trim()}/playwright-core`)

const here = dirname(fileURLToPath(import.meta.url))
const root = dirname(dirname(here))
const dist = join(root, 'ui', 'dist')
const out = join(root, '.github', 'assets', 'screenshots')
const helmet = join(here, 'helmet.png')

if (!existsSync(join(dist, 'index.html'))) throw new Error('ui/dist is missing, run npm run build first')

// The interface's viewport. The window in the picture is narrower, so the
// capture is drawn at about three quarters of its size.
const VIEW = { width: 1600, height: 1000 }

// The preview shows at most 60% of the viewport's height, so the columns and
// the zoom are picked to fit the whole helmet into it.
const PICTURES = [
  {
    name: 'container',
    frame: 'browser',
    caption: 'Any picture as ASCII art, <em>right in your browser</em>',
    sub: 'TrickWork in Docker, on Unraid or any other host',
    setup: async (page) => {
      await convert(page, { columns: 100, zoomOut: 5 })
    },
  },
  {
    name: 'desktop',
    frame: 'window',
    caption: 'No command line. <em>Just sliders.</em>',
    sub: 'TrickWork for Windows, macOS and Linux',
    setup: async (page) => {
      await convert(page, { columns: 85, zoomOut: 3 })
      const box = await page.locator('canvas.preview-canvas').boundingBox()
      await page.evaluate((y) => window.scrollTo(0, y), box.y - 96)
    },
  },
  {
    name: 'desktop-settings',
    frame: 'window',
    caption: 'Your colours, <em>your corners</em>',
    sub: 'Shape, theme, accent and 26 languages',
    setup: async (page) => {
      await page.locator('.settings-button').click()
      await page.getByRole('tab', { name: 'Look', exact: true }).click()
      await page.getByLabel('Rainbow mode').click()
    },
  },
]

const ORIGIN = { browser: 'http://nas.local:3210', window: 'http://wails.localhost' }

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.json': 'application/json',
}

// Just enough of the Wails runtime for the desktop build to start: automatic
// updates read as on, and nothing else is asked of it while the pictures are taken.
const RUNTIME = `
export const Call = { ByName: async (name) => (name.endsWith('.AutoUpdate') ? true : null) }
export const Events = { On: () => () => {} }
export const Browser = { OpenURL: async () => {} }
`

/** Loads the helmet and converts it, with a little more contrast than the default for the metal's grey. */
async function convert(page, { columns, zoomOut }) {
  await page.locator('input[type="file"][accept="image/*"]').setInputFiles(helmet)
  await page.locator('canvas.preview-canvas').waitFor()
  await page.getByLabel('Width (columns)').fill(String(columns))
  await page.getByRole('slider', { name: /^Contrast/ }).fill('0.3')
  for (let i = 0; i < zoomOut; i++) await page.getByRole('button', { name: 'Zoom out' }).click()
}

/** The interface after `setup`, as a PNG at twice the viewport's pixels. */
async function capture(browser, frame, setup) {
  const origin = ORIGIN[frame]
  const context = await browser.newContext({ viewport: VIEW, deviceScaleFactor: 2, colorScheme: 'dark', locale: 'en-US' })
  await context.route(`${origin}/**`, (route) => {
    const path = new URL(route.request().url()).pathname
    if (path === '/wails/runtime.js') return route.fulfill({ contentType: 'text/javascript', body: RUNTIME })
    const file = join(dist, path.endsWith('/') ? `${path}index.html` : path)
    if (!existsSync(file)) return route.fulfill({ status: 404, body: '' })
    return route.fulfill({ contentType: TYPES[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) })
  })
  const page = await context.newPage()
  await page.goto(`${origin}/`)
  await page.evaluate(() => document.fonts.ready)
  await setup(page)
  // Lets the entrance animations and the preview's fade finish.
  await page.waitForTimeout(1500)
  const shot = await page.screenshot()
  await context.close()
  return shot
}

async function cached(file, url) {
  const path = join(tmpdir(), `TrickWork-${file}`)
  if (!existsSync(path)) {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${file}: fetch ${res.status}`)
    writeFileSync(path, Buffer.from(await res.arrayBuffer()))
  }
  return readFileSync(path)
}

const dataUrl = (buf, type) => `data:${type};base64,${buf.toString('base64')}`
const bree = dataUrl(await cached('BreeSerif-Regular.ttf', 'https://github.com/google/fonts/raw/main/ofl/breeserif/BreeSerif-Regular.ttf'), 'font/ttf')
const lato = dataUrl(await cached('Lato-Regular.ttf', 'https://github.com/google/fonts/raw/main/ofl/lato/Lato-Regular.ttf'), 'font/ttf')
const logo = dataUrl(readFileSync(join(root, '.github', 'assets', 'logo.svg')), 'image/svg+xml')
const icon = dataUrl(readFileSync(join(root, '.github', 'assets', 'icon.svg')), 'image/svg+xml')

const STYLE = `
@font-face { font-family: "Bree Serif"; src: url(${bree}); }
@font-face { font-family: Lato; src: url(${lato}); }
* { box-sizing: border-box; margin: 0; }
body { position: relative; overflow: hidden; width: 1920px; height: 1000px; font-family: Lato, sans-serif; background: #0c0c0b; }
.backdrop, .backdrop * { position: absolute; }
.backdrop { inset: 0; overflow: hidden; }
.wall { inset: 0; background: radial-gradient(55% 60% at 62% 35%, #26231d, #0f0e0c 72%); }
.mark { transform: rotate(-10deg); opacity: .32;
  filter: grayscale(1) brightness(.36) contrast(1.2) drop-shadow(-2px -2px 0 rgba(255,255,255,.16)) drop-shadow(12px 18px 26px rgba(0,0,0,.85)); }
.vignette { inset: 0; box-shadow: inset 0 0 200px rgba(0,0,0,.6); }
.copy { position: absolute; left: 84px; top: 0; bottom: 0; width: 470px; display: flex; flex-direction: column; justify-content: center; gap: 28px; }
.copy > img { width: 250px; }
h1 { font: 400 64px/1.12 "Bree Serif", serif; color: #f4f4f4; text-wrap: balance; }
h1 em { font-style: normal; color: #FCC419; }
.sub { font-size: 28px; line-height: 1.35; color: #9d9481; }

.stage { position: absolute; perspective: 2400px; }
.floor { position: absolute; left: 12%; right: 12%; bottom: -4%; height: 8%; border-radius: 50%; background: rgba(0,0,0,.8); filter: blur(30px); }
.glare { position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(118deg, rgba(255,255,255,.09) 0%, rgba(255,255,255,.03) 28%, rgba(255,255,255,0) 42%); }
.win { position: absolute; inset: 0; transform: rotateY(-8deg) rotateX(2deg); border-radius: 14px; overflow: hidden; background: #161616;
  box-shadow: 0 0 0 1px #3c3c3c, 0 2px 4px rgba(0,0,0,.35), 0 18px 36px rgba(0,0,0,.45), 0 52px 100px rgba(0,0,0,.55); }
.win > img { display: block; }
.bar { position: relative; display: flex; align-items: center; background: #242424; color: #d6d6d6; font: 400 17px/1 Lato, sans-serif; }
.bar img { width: 22px; height: 22px; }
.app { height: 44px; gap: 10px; padding-left: 16px; border-bottom: 1px solid #111; }
.ctl { position: absolute; top: 0; width: 46px; height: 44px; }
.ctl::before { content: ""; position: absolute; left: 17px; top: 21px; width: 12px; height: 1.5px; background: #bdbdbd; }
.ctl.min { right: 92px; }
.ctl.max { right: 46px; }
.ctl.max::before { top: 16px; height: 12px; background: none; border: 1.5px solid #bdbdbd; box-sizing: border-box; }
.ctl.close { right: 0; }
.ctl.close::before, .ctl.close::after { content: ""; position: absolute; left: 16px; top: 21px; width: 14px; height: 1.5px; background: #bdbdbd; }
.ctl.close::before { transform: rotate(45deg); }
.ctl.close::after { transform: rotate(-45deg); }
.tabs { height: 42px; padding: 7px 0 0 12px; background: #1c1c1c; align-items: flex-end; }
.tab { display: flex; align-items: center; gap: 10px; height: 35px; padding: 0 70px 0 14px; border-radius: 10px 10px 0 0; background: #2c2c2c; font-size: 15px; }
.tab img { width: 18px; height: 18px; }
.address { height: 46px; gap: 14px; padding: 0 14px; background: #2c2c2c; border-bottom: 1px solid #111; }
.nav { width: 10px; height: 10px; border-left: 2px solid #9a9a9a; border-bottom: 2px solid #9a9a9a; transform: rotate(45deg); margin: 0 4px; }
.nav.fwd { transform: rotate(-135deg); border-color: #5a5a5a; }
.url { flex: 1; height: 32px; border-radius: 16px; background: #1a1a1a; padding-left: 18px; display: flex; align-items: center; font-size: 15px; color: #c9c9c9; }
`

/** The interface in a desktop window or a browser `w` wide, its top left corner at (x, y). */
function windowed(capture, frame, { x, y, w }) {
  const h = Math.round(VIEW.height * (w / VIEW.width))
  const chrome =
    frame === 'browser'
      ? `<div class="bar tabs"><div class="tab"><img src="${icon}"><span>TrickWork</span></div></div>
         <div class="bar address"><i class="nav"></i><i class="nav fwd"></i><div class="url">nas.local:3210</div></div>`
      : `<div class="bar app"><img src="${icon}"><span>TrickWork</span><i class="ctl min"></i><i class="ctl max"></i><i class="ctl close"></i></div>`
  const bar = frame === 'browser' ? 89 : 45
  return `<div class="stage" style="left:${x}px;top:${y}px;width:${w}px;height:${h + bar}px">
  <div class="floor"></div>
  <div class="win">${chrome}<img src="${capture}" style="width:${w}px;height:${h}px"><div class="glare"></div></div>
</div>`
}

function wideShot(capture, frame, caption, sub) {
  const w = 1240
  const h = Math.round(VIEW.height * (w / VIEW.width)) + (frame === 'browser' ? 89 : 45)
  return `<!doctype html><html><head><meta charset="utf-8"><style>${STYLE}</style></head><body>
<div class="backdrop"><div class="wall"></div><img class="mark" src="${logo}" style="width:62%;left:-14%;top:4%"><div class="vignette"></div></div>
<div class="copy"><img src="${logo}"><h1>${caption}</h1><p class="sub">${sub}</p></div>
${windowed(capture, frame, { x: 620, y: Math.round((1000 - h) / 2), w })}
</body></html>`
}

/** Renders `html` at twice 1920 x 1000 and writes it scaled down to `file`. */
async function render(browser, html, file) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1000 }, deviceScaleFactor: 2 })
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  const big = await page.screenshot()
  await page.close()

  const small = await browser.newPage({ viewport: { width: 1920, height: 1000 } })
  await small.setContent(`<body style="margin:0"><img src="${dataUrl(big, 'image/png')}" style="display:block;width:1920px;height:1000px">`)
  await small.locator('img').evaluate((img) => img.decode())
  await small.screenshot({ path: file })
  await small.close()
}

const browser = await chromium.launch()
try {
  mkdirSync(out, { recursive: true })
  for (const { name, frame, caption, sub, setup } of PICTURES) {
    const shot = dataUrl(await capture(browser, frame, setup), 'image/png')
    await render(browser, wideShot(shot, frame, caption, sub), join(out, `${name}.png`))
    console.log(`wrote .github/assets/screenshots/${name}.png`)
  }
} finally {
  await browser.close()
}
