// The About card, in the order GlimStone lays down for every app: what this
// is, then the money with its own buttons, then the way to report something,
// then the versions as a footer. It replaces the version line.

import { COFFEE_BUTTON_ART, GLIMSTONE_REPO, GLYPHS, MAIL, REPO } from './donate'
import { openCoffeeWindow, openCryptoWindow, openExternal, openPaypalWindow } from './donateWindows'
import { subscribeLocale, t } from './i18n'
import { buttonFace, buttonUnit, fitButtonText, keepButtonTextFitted, type ButtonFace } from './readmeButton'
import { APP_VERSION, GLIMSTONE_VERSION } from './version'

// One line each, like the README's give buttons, so nothing moves up under the
// pointer.
function actionUnit(brand: string, face: ButtonFace, onClick: () => void): HTMLDivElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  buttonFace(btn, face)
  btn.addEventListener('click', onClick)
  return buttonUnit(brand, [btn])
}

function versionLink(label: string, version: string, repo: string): HTMLElement {
  const span = document.createElement('span')
  span.append(`${label} `)
  // Only the number is a link: the word in front of it is not a destination.
  const a = document.createElement('a')
  a.href = `${repo}/releases/tag/v${version}`
  a.target = '_blank'
  a.rel = 'noreferrer noopener'
  a.textContent = version
  a.addEventListener('click', (event) => {
    event.preventDefault()
    openExternal(a.href)
  })
  span.appendChild(a)
  return span
}

export function mountAboutPanel(container: HTMLElement): void {
  const heading = document.createElement('div')
  heading.className = 'glim-eyebrow'
  const body = document.createElement('p')
  const coffeeText = document.createElement('p')
  const reportText = document.createElement('p')
  reportText.className = 'about-report'
  for (const p of [body, coffeeText, reportText]) p.classList.add('about-text')

  const giveRow = document.createElement('div')
  giveRow.className = 'readme-btn-rows about-give'
  const reportRow = document.createElement('div')
  reportRow.className = 'readme-btn-rows'

  const versions = document.createElement('p')
  versions.className = 'about-versions glim-num'

  container.append(heading, body, coffeeText, giveRow, reportText, reportRow, versions)

  function render(): void {
    heading.textContent = t('about.title')
    body.textContent = t('about.body')
    coffeeText.textContent = t('about.coffee')
    reportText.textContent = t('about.report')
    giveRow.replaceChildren(
      actionUnit('coffee', { name: t('about.coffeeButton'), art: COFFEE_BUTTON_ART }, openCoffeeWindow),
      actionUnit('paypal', { name: t('about.paypal'), mark: GLYPHS.paypal, tint: 'about-mark-paypal' }, openPaypalWindow),
      actionUnit('bitcoin', { name: t('about.crypto'), mark: GLYPHS.bitcoin, tint: 'about-mark-bitcoin' }, openCryptoWindow),
    )
    const mailto = `mailto:${MAIL}?subject=${encodeURIComponent(`TrickWork ${t('about.mailSubject')}`)}`
    reportRow.replaceChildren(
      actionUnit('github', { name: t('about.repo'), mark: GLYPHS.github, tint: 'about-mark-github' }, () => openExternal(REPO)),
      actionUnit('house', { name: t('about.mail'), mark: GLYPHS.mail, tint: 'about-mark-house' }, () => openExternal(mailto)),
    )
    fitButtonText(giveRow)
    fitButtonText(reportRow)
    const dot = document.createElement('span')
    dot.setAttribute('aria-hidden', 'true')
    dot.textContent = '·'
    versions.replaceChildren(
      versionLink(t('about.version'), APP_VERSION, REPO),
      dot,
      versionLink('GlimStone', GLIMSTONE_VERSION, GLIMSTONE_REPO),
    )
  }
  render()
  subscribeLocale(render)
  keepButtonTextFitted(giveRow)
  keepButtonTextFitted(reportRow)
}
