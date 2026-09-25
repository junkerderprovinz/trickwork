// The App card in Settings: every other way to get TrickWork. In the container
// it offers the desktop app; in the desktop app it offers a server install.

import { APPLE_SVG, DOCKER_SVG, LINUX_SVG, UNRAID_SVG, WINDOWS_SVG, ZIP_SVG } from './design/appMarks'
import { infoIcon } from './design/tooltip'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import { APP_VERSION } from './version'

declare global {
  interface Window {
    runtime?: { BrowserOpenURL?: (url: string) => void }
  }
}

const REPO = 'https://github.com/junkerderprovinz/trickwork'
const TAG = `v${APP_VERSION}`
const RELEASE = `${REPO}/releases/download/${TAG}`
const UNRAID_CA = 'https://ca.unraid.net/apps/trickwork-0h072450hg59wx'
const DOCKER_RUN = 'docker run -d --name trickwork --restart unless-stopped -p 3210:3210 ghcr.io/junkerderprovinz/trickwork:latest'

const DESKTOP: { key: TranslationKey; file: string; mark: string; tint: string }[] = [
  { key: 'apps.windows', file: 'trickwork-windows-amd64-installer.exe', mark: WINDOWS_SVG, tint: 'glim-windows-mark' },
  { key: 'apps.windowsPortable', file: 'trickwork-windows-amd64-portable.exe', mark: WINDOWS_SVG, tint: 'glim-windows-mark' },
  { key: 'apps.windowsArm', file: 'trickwork-windows-arm64-installer.exe', mark: WINDOWS_SVG, tint: 'glim-windows-mark' },
  { key: 'apps.macos', file: 'trickwork-macos-universal.dmg', mark: APPLE_SVG, tint: '' },
  { key: 'apps.linux', file: 'trickwork-linux-amd64', mark: LINUX_SVG, tint: '' },
]

/** The desktop build binds its Go methods on window.go; the container has none. */
export function isDesktop(): boolean {
  return !!window.go?.main?.App
}

// A Wails webview has no browser behind it to open a link in, so the link
// leaves through the shell.
function followExternal(event: MouseEvent, href: string): void {
  const open = window.runtime?.BrowserOpenURL
  if (!open) return
  event.preventDefault()
  open(href)
}

function mark(svg: string, tint: string): HTMLSpanElement {
  const el = document.createElement('span')
  el.className = `app-tile-mark ${tint}`.trim()
  el.setAttribute('aria-hidden', 'true')
  el.innerHTML = svg
  return el
}

function tileBody(tile: HTMLElement, name: string, svg: string, tint: string): HTMLSpanElement {
  const label = document.createElement('span')
  label.className = 'app-tile-name'
  label.textContent = name
  tile.append(mark(svg, tint), label)
  return label
}

function linkTile(name: string, href: string, svg: string, tint = ''): HTMLElement {
  const a = document.createElement('a')
  a.className = 'app-tile'
  a.href = href
  a.target = '_blank'
  a.rel = 'noreferrer noopener'
  a.setAttribute('aria-label', name)
  tileBody(a, name, svg, tint)
  a.addEventListener('click', (event) => followExternal(event, href))
  const wrap = document.createElement('div')
  wrap.className = 'app-tile-wrap group'
  wrap.appendChild(a)
  return wrap
}

// The Docker tile does something on the page, so its name says so for a
// moment after the click.
function dockerTile(): HTMLElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'app-tile'
  const name = t('apps.docker')
  btn.setAttribute('aria-label', name)
  const label = tileBody(btn, name, DOCKER_SVG, 'glim-docker-mark')
  let timer: number | undefined
  btn.addEventListener('click', () => {
    void navigator.clipboard?.writeText(DOCKER_RUN).then(() => {
      label.textContent = t('apps.copied')
      window.clearTimeout(timer)
      timer = window.setTimeout(() => (label.textContent = t('apps.docker')), 1800)
    })
  })
  const wrap = document.createElement('div')
  wrap.className = 'app-tile-wrap group'
  const hint = infoIcon(`${t('apps.dockerHint')} ${DOCKER_RUN}`)
  hint.classList.add('app-tile-hint')
  wrap.append(btn, hint)
  return wrap
}

export function mountAppPanel(container: HTMLElement): void {
  const desktop = isDesktop()

  const eyebrowRow = document.createElement('div')
  eyebrowRow.className = 'eyebrow-row'
  const eyebrow = document.createElement('span')
  eyebrow.className = 'glim-eyebrow'
  eyebrowRow.appendChild(eyebrow)
  const tiles = document.createElement('div')
  tiles.className = 'app-tiles'
  container.append(eyebrowRow, tiles)

  function render(): void {
    eyebrow.textContent = t(desktop ? 'apps.serverTitle' : 'apps.desktopTitle')
    eyebrowRow.querySelector('.glim-info-icon')?.remove()
    eyebrowRow.appendChild(infoIcon(t(desktop ? 'apps.serverHint' : 'apps.desktopHint')))
    tiles.innerHTML = ''
    if (desktop) {
      tiles.append(
        linkTile(t('apps.unraid'), UNRAID_CA, UNRAID_SVG, 'glim-unraid-mark'),
        dockerTile(),
        linkTile(t('apps.zip'), `${REPO}/archive/refs/tags/${TAG}.zip`, ZIP_SVG),
      )
    } else {
      for (const d of DESKTOP) tiles.appendChild(linkTile(t(d.key), `${RELEASE}/${d.file}`, d.mark, d.tint))
    }
  }

  render()
  subscribeLocale(render)
}
