// The App card in Settings: every other way to get TrickWork. In the container
// it offers the desktop app; in the desktop app it offers a server install.

import { APPLE_SVG, DOCKER_SVG, LINUX_SVG, UNRAID_SVG, WINDOWS_SVG, ZIP_SVG } from './design/appMarks'
import { infoIcon } from './design/tooltip'
import { subscribeLocale, t } from './i18n'
import { buttonFace, buttonUnit, fitButtonText, keepButtonTextFitted, type ButtonFace } from './readmeButton'
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

// A segment names what differs from the button it hangs on and has no mark.
function linkPart(face: ButtonFace, href: string, segment = false): HTMLAnchorElement {
  const a = document.createElement('a')
  a.href = href
  a.target = '_blank'
  a.rel = 'noreferrer noopener'
  buttonFace(a, face, segment)
  a.addEventListener('click', (event) => followExternal(event, href))
  return a
}

// The Docker button does something on the page, so its second line says so
// for a moment after the click, and stays out while it does.
function dockerUnit(): HTMLDivElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  const sub = buttonFace(btn, { name: t('apps.docker'), sub: t('apps.dockerSub'), mark: DOCKER_SVG, tint: 'glim-docker-mark' })!
  const el = buttonUnit('docker', [btn])
  let timer: number | undefined
  btn.addEventListener('click', () => {
    void navigator.clipboard?.writeText(DOCKER_RUN).then(() => {
      sub.textContent = t('apps.copied')
      el.classList.add('glim-readme-btn-unit--note')
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        sub.textContent = t('apps.dockerSub')
        el.classList.remove('glim-readme-btn-unit--note')
      }, 1800)
    })
  })
  const hint = infoIcon(`${t('apps.dockerHint')} ${DOCKER_RUN}`)
  hint.classList.add('glim-readme-btn-hint')
  el.appendChild(hint)
  return el
}

export function mountAppPanel(container: HTMLElement): void {
  const desktop = isDesktop()

  const eyebrowRow = document.createElement('div')
  eyebrowRow.className = 'eyebrow-row'
  const eyebrow = document.createElement('span')
  eyebrow.className = 'glim-eyebrow'
  eyebrowRow.appendChild(eyebrow)
  const rows = document.createElement('div')
  rows.className = 'glim-readme-btn-rows app-rows'
  container.append(eyebrowRow, rows)

  function render(): void {
    eyebrow.textContent = t(desktop ? 'apps.serverTitle' : 'apps.desktopTitle')
    eyebrowRow.querySelector('.glim-info-icon')?.remove()
    eyebrowRow.appendChild(infoIcon(t(desktop ? 'apps.serverHint' : 'apps.desktopHint')))
    if (desktop) {
      rows.replaceChildren(
        buttonUnit('unraid', [linkPart({ name: t('apps.unraid'), sub: t('apps.unraidSub'), mark: UNRAID_SVG }, UNRAID_CA)]),
        dockerUnit(),
        buttonUnit('zip', [linkPart({ name: t('apps.source'), sub: t('apps.zipSub'), mark: ZIP_SVG }, `${REPO}/archive/refs/tags/${TAG}.zip`)]),
      )
    } else {
      const windows = t('apps.windows')
      rows.replaceChildren(
        buttonUnit('windows', [
          linkPart({ name: windows, sub: 'x64', mark: WINDOWS_SVG, tint: 'glim-windows-mark' }, `${RELEASE}/trickwork-windows-amd64-installer.exe`),
          linkPart({ name: 'ARM64', sub: windows }, `${RELEASE}/trickwork-windows-arm64-installer.exe`, true),
          linkPart({ name: t('apps.portable'), sub: windows }, `${RELEASE}/trickwork-windows-amd64-portable.exe`, true),
        ]),
        buttonUnit('apple', [linkPart({ name: t('apps.macos'), sub: 'Universal', mark: APPLE_SVG }, `${RELEASE}/trickwork-macos-universal.dmg`)]),
        buttonUnit('linux', [linkPart({ name: t('apps.linux'), sub: 'x64', mark: LINUX_SVG }, `${RELEASE}/trickwork-linux-amd64`)]),
      )
    }
    fitButtonText(rows)
  }

  render()
  subscribeLocale(render)
  keepButtonTextFitted(rows)
}
