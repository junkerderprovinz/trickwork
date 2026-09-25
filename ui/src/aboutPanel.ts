// The About card, in the order GlimStone lays down for every app: what this
// is, then the money with its own buttons, then the way to report something,
// then the versions as a footer. It replaces the version line.

import { glimButton, updateButton } from './controlWidgets'
import { GLIMSTONE_REPO, GLYPHS, MAIL, REPO } from './donate'
import { openCoffeeWindow, openCryptoWindow, openExternal, openPaypalWindow } from './donateWindows'
import { subscribeLocale, t } from './i18n'
import { APP_VERSION, GLIMSTONE_VERSION } from './version'

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

  const coffee = glimButton({ label: t('about.coffeeButton'), glyph: GLYPHS.coffee, tone: 'neutral', onClick: openCoffeeWindow })
  const paypal = glimButton({ label: t('about.paypal'), glyph: GLYPHS.paypal, tone: 'neutral', onClick: openPaypalWindow })
  const crypto = glimButton({ label: t('about.crypto'), glyph: GLYPHS.bitcoin, tone: 'neutral', onClick: openCryptoWindow })
  coffee.classList.add('glim-brand-btn', 'glim-brand-coffee')
  paypal.classList.add('glim-brand-btn', 'glim-brand-paypal')
  crypto.classList.add('glim-brand-btn', 'glim-brand-bitcoin')
  const giveRow = document.createElement('div')
  giveRow.className = 'button-row'
  giveRow.append(coffee, paypal, crypto)

  const github = glimButton({
    label: t('about.repo'),
    glyph: GLYPHS.github,
    tone: 'neutral',
    onClick: () => openExternal(REPO),
  })
  github.classList.add('glim-brand-btn', 'glim-brand-github')
  const mail = glimButton({
    label: t('about.mail'),
    glyph: GLYPHS.mail,
    tone: 'neutral',
    onClick: () => openExternal(`mailto:${MAIL}?subject=${encodeURIComponent(`TrickWork ${t('about.mailSubject')}`)}`),
  })
  mail.classList.add('glim-brand-btn', 'glim-brand-house')
  const reportRow = document.createElement('div')
  reportRow.className = 'button-row'
  reportRow.append(github, mail)

  const versions = document.createElement('p')
  versions.className = 'about-versions glim-num'

  container.append(heading, body, coffeeText, giveRow, reportText, reportRow, versions)

  function render(): void {
    heading.textContent = t('about.title')
    body.textContent = t('about.body')
    coffeeText.textContent = t('about.coffee')
    reportText.textContent = t('about.report')
    updateButton(coffee, { label: t('about.coffeeButton') })
    updateButton(paypal, { label: t('about.paypal') })
    updateButton(crypto, { label: t('about.crypto') })
    updateButton(github, { label: t('about.repo') })
    updateButton(mail, { label: t('about.mail') })
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
}
