// The Version and Help cards of the Info tab, which with the About card make
// GlimStone's Info tile: every version TrickWork is made of with the release
// notes and the update check, then the ways to report something.

import { MAIL_SVG, MANUAL_SVG } from './design/appMarks'
import { groupStage } from './design/controls'
import { infoIcon } from './design/tooltip'
import { GLIMSTONE_VERSION } from './design/version'
import { glimButton, updateButton, type ButtonTone } from './controlWidgets'
import { GLIMSTONE_REPO, GLYPHS, MAIL, REPO } from './donate'
import { openExternal } from './donateWindows'
import { downloadBlob } from './download'
import { currentLocale, subscribeLocale, t } from './i18n'
import { iconDiagnostics, iconInfo } from './icons'
import { replay } from './motion'
import { buttonFace, buttonUnit, fitButtonText, keepButtonTextFitted, type ButtonFace } from './readmeButton'
import { openReleaseNotes } from './releaseNotes'
import { isNewer } from './releases'
import type { Store } from './state'
import { showToast } from './toast'
import { APP_VERSION } from './version'
import { isDesktop } from './wails'

const MANUAL = 'https://junkerderprovinz.github.io/trickwork/'
const LATEST = 'https://api.github.com/repos/junkerderprovinz/trickwork/releases/latest'

// A card's notch with its (i), filled again on a language switch.
function eyebrowRow(): { row: HTMLElement; fill: (title: string, hint: string) => void } {
  const row = document.createElement('div')
  row.className = 'eyebrow-row'
  const eyebrow = document.createElement('span')
  eyebrow.className = 'glim-eyebrow'
  row.appendChild(eyebrow)
  return {
    row,
    fill: (title, hint) => {
      eyebrow.textContent = title
      row.querySelector('.glim-info-icon')?.remove()
      row.appendChild(infoIcon(hint))
    },
  }
}

// Only the number is a link: the name in front of it is not a destination.
function versionRow(name: string, version: string, repo: string, sub?: string): HTMLLIElement {
  const li = document.createElement('li')
  li.className = 'version-row'
  const names = document.createElement('span')
  names.className = 'version-names'
  const title = document.createElement('span')
  title.className = 'version-name'
  title.textContent = name
  names.appendChild(title)
  if (sub) {
    const line = document.createElement('span')
    line.className = 'version-sub'
    line.textContent = sub
    names.appendChild(line)
  }
  const a = document.createElement('a')
  a.className = 'version-number glim-num'
  a.href = `${repo}/releases/tag/v${version}`
  a.target = '_blank'
  a.rel = 'noreferrer noopener'
  a.textContent = version
  a.addEventListener('click', (event) => {
    event.preventDefault()
    openExternal(a.href)
  })
  li.append(names, a)
  return li
}

type Verdict = 'idle' | 'busy' | 'current' | 'found' | 'failed'

const VERDICT_TONE: Record<Verdict, ButtonTone> = {
  idle: 'neutral',
  busy: 'neutral',
  current: 'ok',
  found: 'warn',
  failed: 'danger',
}

/**
 * Check for updates shows its verdict on itself, like a test button: green
 * when TrickWork is current, orange when a release is newer, red with a shake
 * when GitHub cannot be asked. The reason for a failure goes in a toast.
 */
function updateCheckButton(): HTMLButtonElement {
  let verdict: Verdict = 'idle'
  const label = (): string =>
    verdict === 'current'
      ? t('info.upToDate')
      : verdict === 'found'
        ? t('info.updateFound')
        : verdict === 'failed'
          ? t('info.checkFailed')
          : t('info.check')
  // One width for every verdict, so the button does not jump when its word
  // changes.
  const stage = (): ReturnType<typeof groupStage> =>
    groupStage([t('info.check'), t('info.upToDate'), t('info.updateFound'), t('info.checkFailed')])

  const btn = glimButton({ label: label(), tone: 'neutral', stage: stage() })
  function paint(): void {
    updateButton(btn, { label: label(), tone: VERDICT_TONE[verdict], stage: stage() })
    btn.setAttribute('aria-busy', String(verdict === 'busy'))
  }

  btn.addEventListener('click', () => {
    if (verdict === 'busy') return
    verdict = 'busy'
    paint()
    void fetch(LATEST, { headers: { Accept: 'application/vnd.github+json' } })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status))
        const { tag_name: tag } = (await res.json()) as { tag_name?: string }
        if (!tag) throw new Error('no tag')
        if (isNewer(tag, APP_VERSION)) {
          verdict = 'found'
          showToast(t(isDesktop() ? 'info.availableDesktop' : 'info.available', { version: tag.replace(/^v/, '') }))
        } else {
          verdict = 'current'
        }
        paint()
      })
      .catch(() => {
        verdict = 'failed'
        paint()
        replay(btn, 'glim-shake')
        showToast(t('info.checkUnreachable'), 'fail')
      })
  })
  subscribeLocale(paint)
  return btn
}

export function mountVersionCard(container: HTMLElement): void {
  const rows = document.createElement('ul')
  rows.className = 'version-rows'
  const actions = document.createElement('div')
  actions.className = 'version-actions'
  const notes = glimButton({ label: t('info.releaseNotes'), glyph: iconInfo(), onClick: openReleaseNotes })
  actions.append(notes, updateCheckButton())
  const heading = eyebrowRow()
  container.append(heading.row, rows, actions)

  function render(): void {
    heading.fill(t('about.version'), t('info.versionHint'))
    rows.replaceChildren(
      versionRow('TrickWork', APP_VERSION, REPO),
      versionRow('GlimStone', GLIMSTONE_VERSION, GLIMSTONE_REPO, t('info.glimstoneSub')),
    )
    updateButton(notes, { label: t('info.releaseNotes') })
  }
  render()
  subscribeLocale(render)
}

// One line each, like the README's buttons, unless a second line says what a
// click does.
function actionUnit(brand: string, face: ButtonFace, onClick: () => void): HTMLDivElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  buttonFace(btn, face)
  btn.addEventListener('click', onClick)
  return buttonUnit(brand, [btn])
}

const LOOK_KEYS = ['glim-appearance', 'trickwork-theme', 'trickwork-motion', 'trickwork-disco']

/**
 * What the bug report holds: the versions, where TrickWork runs, the language,
 * the look and the conversion settings. No file names and no images, since
 * those can say who somebody is.
 */
export function bugReport(store: Store): object {
  const look: Record<string, string | null> = {}
  for (const key of LOOK_KEYS) {
    try {
      look[key] = localStorage.getItem(key)
    } catch {
      look[key] = null
    }
  }
  const root = document.documentElement
  return {
    trickwork: APP_VERSION,
    glimstone: GLIMSTONE_VERSION,
    build: isDesktop() ? 'desktop' : 'container',
    userAgent: navigator.userAgent,
    language: currentLocale(),
    labels: root.getAttribute('data-labels-buttons'),
    rainbow: root.getAttribute('data-rainbow'),
    look,
    images: store.getState().items.length,
    options: store.getState().options,
  }
}

export function mountHelpCard(container: HTMLElement, store: Store): void {
  const report = document.createElement('p')
  report.className = 'about-text'
  const buttons = document.createElement('div')
  buttons.className = 'glim-readme-btn-rows'
  const heading = eyebrowRow()
  container.append(heading.row, report, buttons)

  function saveReport(): void {
    const blob = new Blob([JSON.stringify(bugReport(store), null, 2)], { type: 'application/json' })
    const day = new Date().toISOString().slice(0, 10)
    downloadBlob(blob, `trickwork-report-${day}.json`).catch(() => showToast(t('info.reportFailed'), 'fail'))
  }

  function render(): void {
    heading.fill(t('info.help'), t('info.helpHint'))
    report.textContent = t('about.report')
    // Subject only: a prefilled body reads as a form to fill in.
    const mailto = `mailto:${MAIL}?subject=${encodeURIComponent(`TrickWork ${t('about.mailSubject')}`)}`
    buttons.replaceChildren(
      actionUnit('github', { name: t('about.repo'), mark: GLYPHS.github, tint: 'glim-github-mark' }, () => openExternal(REPO)),
      actionUnit('house', { name: t('about.mail'), mark: MAIL_SVG, tint: 'glim-house-mark' }, () => openExternal(mailto)),
      // The README's docs button, its book and its yellow.
      actionUnit('docs', { name: t('info.manual'), sub: t('info.open'), mark: MANUAL_SVG, tint: 'glim-docs-mark' }, () => openExternal(MANUAL)),
      // The file goes with an issue on GitHub, so it lights up beside it.
      actionUnit('github', { name: t('info.bugReport'), sub: t('info.download'), mark: iconDiagnostics(), tint: 'glim-github-mark' }, saveReport),
    )
    fitButtonText(buttons)
  }
  render()
  subscribeLocale(render)
  keepButtonTextFitted(buttons)
}
