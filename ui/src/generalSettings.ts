// The General card in Settings. It holds the language, and takes its tab's name
// so the word Language does not print twice.

import { customDropdown } from './controlWidgets'
import { flagEmoji } from './design/flagEmoji'
import { currentLocale, LOCALES, setLocale, subscribeLocale, t } from './i18n'

export function mountGeneralSettings(container: HTMLElement): void {
  const heading = document.createElement('div')
  heading.className = 'glim-eyebrow'
  const panel = document.createElement('div')
  panel.className = 'control-slider'
  container.append(heading, panel)

  function build(): void {
    heading.textContent = t('settings.general')
    const label = document.createElement('span')
    label.textContent = t('appearance.language')
    const options = LOCALES.map((locale) => ({
      value: locale.code,
      label: locale.label,
      flag: flagEmoji(locale.flag),
    }))
    const dropdown = customDropdown(options, currentLocale(), (value) => void setLocale(value), t('appearance.language'))
    panel.replaceChildren(label, dropdown)
  }

  build()
  subscribeLocale(build)
}
