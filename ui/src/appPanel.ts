// The App card in Settings: every other way to get TrickWork, as buttons in the
// shape of the README's. In the container it offers the desktop app; in the
// desktop app it offers a server install.

import { APPLE_SVG, DOCKER_SVG, LINUX_SVG, UNRAID_SVG, WINDOWS_SVG, ZIP_SVG } from './design/appMarks'
import { infoIcon } from './design/tooltip'
import { subscribeLocale, t } from './i18n'
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

type Brand = 'windows' | 'apple' | 'linux' | 'docker' | 'unraid' | 'zip'

interface Part {
  name: string
  sub: string
  /** Left out on a segment, which names what differs from the button it hangs on. */
  mark?: string
  tint?: string
}

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

function partBody(el: HTMLElement, p: Part): HTMLSpanElement {
  el.className = `dl-part glim-brand-tile${p.mark ? '' : ' dl-seg'}`
  el.setAttribute('aria-label', `${p.name} ${p.sub}`)
  if (p.mark) {
    const mark = document.createElement('span')
    mark.className = `dl-mark ${p.tint ?? ''}`.trim()
    mark.setAttribute('aria-hidden', 'true')
    mark.innerHTML = p.mark
    el.appendChild(mark)
  }
  const text = document.createElement('span')
  text.className = 'dl-text'
  const name = document.createElement('span')
  name.className = 'dl-name'
  name.textContent = p.name
  const sub = document.createElement('span')
  sub.className = 'dl-sub'
  sub.textContent = p.sub
  text.append(name, sub)
  el.appendChild(text)
  return sub
}

function linkPart(p: Part, href: string): HTMLAnchorElement {
  const a = document.createElement('a')
  a.href = href
  a.target = '_blank'
  a.rel = 'noreferrer noopener'
  partBody(a, p)
  a.addEventListener('click', (event) => followExternal(event, href))
  return a
}

// A button with its segments lights up as one, and the sheen crosses all of it.
function unit(brand: Brand, parts: HTMLElement[]): HTMLDivElement {
  const el = document.createElement('div')
  el.className = `dl-unit group glim-tile-${brand}${parts.length > 1 ? ' dl-group' : ''}`
  const sheen = document.createElement('span')
  sheen.className = 'dl-sheen'
  sheen.setAttribute('aria-hidden', 'true')
  el.append(...parts, sheen)
  return el
}

// The Docker button does something on the page, so its second line says so
// for a moment after the click, and stays out while it does.
function dockerUnit(): HTMLDivElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  const sub = partBody(btn, { name: t('apps.docker'), sub: t('apps.dockerSub'), mark: DOCKER_SVG, tint: 'glim-docker-mark' })
  const el = unit('docker', [btn])
  let timer: number | undefined
  btn.addEventListener('click', () => {
    void navigator.clipboard?.writeText(DOCKER_RUN).then(() => {
      sub.textContent = t('apps.copied')
      el.classList.add('dl-unit--note')
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        sub.textContent = t('apps.dockerSub')
        el.classList.remove('dl-unit--note')
      }, 1800)
    })
  })
  const hint = infoIcon(`${t('apps.dockerHint')} ${DOCKER_RUN}`)
  hint.classList.add('dl-hint')
  el.appendChild(hint)
  return el
}

// A translation longer than its button shrinks its own line instead of being
// cut off. Hidden lines measure nothing, so this runs again once they show.
function fitText(root: HTMLElement): void {
  for (const line of root.querySelectorAll<HTMLElement>('.dl-name, .dl-sub')) {
    line.style.fontSize = ''
    if (line.clientWidth === 0) continue
    const over = line.scrollWidth / line.clientWidth
    if (over > 1) line.style.fontSize = `${parseFloat(getComputedStyle(line).fontSize) / over}px`
  }
}

export function mountAppPanel(container: HTMLElement): void {
  const desktop = isDesktop()

  const eyebrowRow = document.createElement('div')
  eyebrowRow.className = 'eyebrow-row'
  const eyebrow = document.createElement('span')
  eyebrow.className = 'glim-eyebrow'
  eyebrowRow.appendChild(eyebrow)
  const rows = document.createElement('div')
  rows.className = 'dl-rows'
  container.append(eyebrowRow, rows)

  function render(): void {
    eyebrow.textContent = t(desktop ? 'apps.serverTitle' : 'apps.desktopTitle')
    eyebrowRow.querySelector('.glim-info-icon')?.remove()
    eyebrowRow.appendChild(infoIcon(t(desktop ? 'apps.serverHint' : 'apps.desktopHint')))
    if (desktop) {
      rows.replaceChildren(
        unit('unraid', [linkPart({ name: t('apps.unraid'), sub: t('apps.unraidSub'), mark: UNRAID_SVG }, UNRAID_CA)]),
        dockerUnit(),
        unit('zip', [linkPart({ name: t('apps.source'), sub: t('apps.zipSub'), mark: ZIP_SVG }, `${REPO}/archive/refs/tags/${TAG}.zip`)]),
      )
    } else {
      const windows = t('apps.windows')
      rows.replaceChildren(
        unit('windows', [
          linkPart({ name: windows, sub: 'x64', mark: WINDOWS_SVG, tint: 'glim-windows-mark' }, `${RELEASE}/trickwork-windows-amd64-installer.exe`),
          linkPart({ name: 'ARM64', sub: windows }, `${RELEASE}/trickwork-windows-arm64-installer.exe`),
          linkPart({ name: t('apps.portable'), sub: windows }, `${RELEASE}/trickwork-windows-amd64-portable.exe`),
        ]),
        unit('apple', [linkPart({ name: t('apps.macos'), sub: 'Universal', mark: APPLE_SVG }, `${RELEASE}/trickwork-macos-universal.dmg`)]),
        unit('linux', [linkPart({ name: t('apps.linux'), sub: 'x64', mark: LINUX_SVG }, `${RELEASE}/trickwork-linux-amd64`)]),
      )
    }
    fitText(rows)
  }

  render()
  subscribeLocale(render)
  new ResizeObserver(() => fitText(rows)).observe(rows)
  void document.fonts?.ready.then(() => fitText(rows))
}
