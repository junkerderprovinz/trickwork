// The About card, the last of the Info tab: what this is, then the money with
// its own buttons. The ways to report something and the versions have cards of
// their own before it (infoPanel.ts).

import { COFFEE_BUTTON_SVG } from './design/appMarks'
import { GLYPHS } from './donate'
import { openCoffeeWindow, openCryptoWindow, openPaypalWindow } from './donateWindows'
import { subscribeLocale, t } from './i18n'
import { buttonFace, buttonUnit, fitButtonText, keepButtonTextFitted, type ButtonFace } from './readmeButton'

// One line each, like the README's give buttons, so nothing moves up under the
// pointer.
function actionUnit(brand: string, face: ButtonFace, onClick: () => void): HTMLDivElement {
  const btn = document.createElement('button')
  btn.type = 'button'
  buttonFace(btn, face)
  btn.addEventListener('click', onClick)
  return buttonUnit(brand, [btn])
}

export function mountAboutPanel(container: HTMLElement): void {
  const heading = document.createElement('div')
  heading.className = 'glim-eyebrow'
  const body = document.createElement('p')
  const coffeeText = document.createElement('p')
  for (const p of [body, coffeeText]) p.classList.add('about-text')

  const giveRow = document.createElement('div')
  giveRow.className = 'glim-readme-btn-rows glim-about-give'

  container.append(heading, body, coffeeText, giveRow)

  function render(): void {
    heading.textContent = t('about.title')
    body.textContent = t('about.body')
    coffeeText.textContent = t('about.coffee')
    giveRow.replaceChildren(
      actionUnit('coffee', { name: t('about.coffeeButton'), art: COFFEE_BUTTON_SVG }, openCoffeeWindow),
      actionUnit('paypal', { name: t('about.paypal'), mark: GLYPHS.paypal, tint: 'glim-paypal-mark' }, openPaypalWindow),
      actionUnit('bitcoin', { name: t('about.crypto'), mark: GLYPHS.bitcoin, tint: 'glim-bitcoin-mark' }, openCryptoWindow),
    )
    fitButtonText(giveRow)
  }
  render()
  subscribeLocale(render)
  keepButtonTextFitted(giveRow)
}
