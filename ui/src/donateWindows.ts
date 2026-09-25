// The three giving windows behind the About card: Buy Me a Coffee's widget,
// PayPal's buttons and the crypto addresses, each in a window of the app's own
// so a donor never leaves it (GlimStone, "The coffee and PayPal windows" and
// "The crypto window").

import { hueVars } from './design/appearance'
import { donationHandlers, loadPaypal, parseAmount, type GiveFrequency } from './design/paypal'
import { glimButton, segmentedRow, updateButton } from './controlWidgets'
import { COFFEE_WIDGET, COIN_MARKS, CRYPTO_COINS, PAYPAL_GIVING, PAYPAL_PAGE, markSvg, type CryptoCoin, type CryptoNetwork } from './donate'
import { iconCheck, iconClear, iconCopy } from './icons'
import { t } from './i18n'
import { qrSvg } from './qr'

/** Opens a link outside the app: through the shell in the desktop build, in a new tab elsewhere. */
export function openExternal(url: string): void {
  const shell = window.runtime?.BrowserOpenURL
  if (shell) shell(url)
  else if (url.startsWith('mailto:')) window.location.href = url
  else window.open(url, '_blank', 'noopener,noreferrer')
}

interface Win {
  body: HTMLElement
  close: () => void
}

// The window's way out is a button in its bottom row, following the label
// engine like every other button (rule 15), so there is no corner X.
function openWindow(title: string, onClose?: () => void): Win {
  const opener = document.activeElement as HTMLElement | null
  const backdrop = document.createElement('div')
  backdrop.className = 'glim-modal-backdrop donate-backdrop'
  const card = document.createElement('div')
  card.className = 'glim-card glim-section glim-modal-card donate-window'
  card.setAttribute('role', 'dialog')
  card.setAttribute('aria-modal', 'true')
  card.tabIndex = -1
  const heading = document.createElement('div')
  heading.className = 'glim-eyebrow'
  heading.id = `donate-title-${Date.now()}`
  heading.textContent = title
  card.setAttribute('aria-labelledby', heading.id)
  const body = document.createElement('div')
  body.className = 'donate-body'
  const footer = document.createElement('div')
  footer.className = 'donate-footer'
  card.append(heading, body, footer)
  backdrop.appendChild(card)

  function onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') close()
  }
  function close(): void {
    document.removeEventListener('keydown', onKey)
    backdrop.remove()
    onClose?.()
    opener?.focus()
  }
  const closeButton = glimButton({ label: t('common.close'), glyph: iconClear(), tone: 'neutral', onClick: close })
  footer.appendChild(closeButton)
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close()
  })
  document.addEventListener('keydown', onKey)
  document.body.appendChild(backdrop)
  closeButton.focus()
  return { body, close }
}

function paragraph(text: string, className: string): HTMLParagraphElement {
  const p = document.createElement('p')
  p.className = className
  p.textContent = text
  return p
}

export function openCoffeeWindow(): void {
  const { body } = openWindow(t('about.coffeeButton'))
  body.classList.add('donate-body--frame')
  const well = document.createElement('div')
  well.className = 'donate-frame-well'
  const frame = document.createElement('iframe')
  frame.src = COFFEE_WIDGET
  // A title would also turn into a hover bubble over the whole widget.
  frame.setAttribute('aria-label', t('about.coffeeButton'))
  frame.allow = 'payment'
  well.appendChild(frame)
  body.append(paragraph(t('about.donateAppeal'), 'donate-appeal'), paragraph(t('about.coffeeIntro'), 'donate-intro'), well)
}

const AMOUNTS = ['10', '25', '50']
/** What the donor's PayPal history calls the payment. */
const DESCRIPTION = 'TrickWork'

/**
 * The PayPal window. A Wails window on macOS or Linux opens no popups, which
 * PayPal's login needs, so there the button hands over to PayPal's own page.
 */
export function openPaypalWindow(): void {
  if (window.runtime?.BrowserOpenURL && !/Windows/.test(navigator.userAgent)) {
    openExternal(PAYPAL_PAGE)
    return
  }

  let frequency: GiveFrequency = 'once'
  let preset = '25'
  let typed = ''
  let rendered: { close(): Promise<void> } | null = null
  let closed = false

  const { body } = openWindow('PayPal', () => {
    closed = true
    rendered?.close().catch(() => {})
  })

  const amount = (): string | null => (typed.trim() !== '' ? parseAmount(typed) : preset)

  const status = document.createElement('p')
  status.className = 'donate-status'
  // PayPal's buttons are cross-origin frames drawn light; declared light, the
  // browser does not paint them an opaque white strip on the dark theme.
  const buttons = document.createElement('div')
  buttons.className = 'donate-paypal-buttons'

  function renderButtons(): void {
    rendered?.close().catch(() => {})
    rendered = null
    status.textContent = ''
    buttons.replaceChildren(paragraph(t('about.paypalLoading'), 'donate-loading'))
    const forFrequency = frequency
    loadPaypal(PAYPAL_GIVING, frequency !== 'once').then(
      (paypal) => {
        if (closed || forFrequency !== frequency) return
        const instance = paypal.Buttons({
          style: { layout: 'vertical', color: 'blue', shape: 'rect', borderRadius: 10, label: 'donate', height: 40 },
          onClick: (_: unknown, actions: { resolve(): void; reject(): void }) =>
            amount() ? actions.resolve() : actions.reject(),
          ...donationHandlers(PAYPAL_GIVING, frequency, () => amount() ?? '0', DESCRIPTION, () => {
            status.className = 'donate-status is-ok'
            status.textContent = t('about.paypalThanks')
          }),
          onError: failed,
        })
        rendered = instance
        buttons.replaceChildren()
        instance.render(buttons).catch(failed)
      },
      () => {
        if (!closed) failed()
      },
    )
  }

  function failed(): void {
    buttons.replaceChildren()
    status.className = 'donate-status is-fail'
    status.textContent = t('about.paypalFailed')
  }

  const frequencyRow = segmentedRow<GiveFrequency>({
    label: t('about.paypalFrequency'),
    choices: [
      { value: 'once', label: t('about.paypalOnce') },
      { value: 'month', label: t('about.paypalMonthly') },
      { value: 'year', label: t('about.paypalYearly') },
    ],
    value: frequency,
    onChange: (next) => {
      frequency = next
      renderButtons()
    },
  })

  // The free amount sits right of the presets, and a valid entry takes the
  // selection away from them.
  const amountWrap = document.createElement('div')
  amountWrap.className = 'control-slider'
  const amountLabel = document.createElement('span')
  amountLabel.textContent = t('about.paypalAmount')
  const amountRow = document.createElement('div')
  amountRow.className = 'donate-amount-row'
  const other = document.createElement('input')
  other.type = 'text'
  other.inputMode = 'decimal'
  other.className = 'donate-other'
  other.placeholder = t('about.paypalOtherAmount')
  other.setAttribute('aria-label', t('about.paypalOtherAmount'))

  function presetRow(): HTMLElement {
    return segmentedRow({
      choices: AMOUNTS.map((a) => ({ value: a, label: `${a} €` })),
      value: typed.trim() !== '' && amount() ? '' : preset,
      onChange: (next) => {
        preset = next
        typed = ''
        other.value = ''
        other.classList.remove('is-valid', 'is-invalid')
      },
    })
  }
  let presets = presetRow()
  other.addEventListener('input', () => {
    typed = other.value
    const valid = typed.trim() !== '' && amount() !== null
    other.classList.toggle('is-valid', valid)
    other.classList.toggle('is-invalid', typed.trim() !== '' && !valid)
    const next = presetRow()
    presets.replaceWith(next)
    presets = next
  })
  amountRow.append(presets, other)
  amountWrap.append(amountLabel, amountRow)

  body.append(
    paragraph(t('about.donateAppeal'), 'donate-appeal'),
    paragraph(t('about.paypalIntro'), 'donate-intro'),
    frequencyRow,
    amountWrap,
    buttons,
    status,
  )
  renderButtons()
}

export function openCryptoWindow(): void {
  const { body } = openWindow(t('about.cryptoTitle'))
  let coin: CryptoCoin = CRYPTO_COINS[0]!
  let network: CryptoNetwork = coin.networks[0]!

  const well = document.createElement('div')
  well.className = 'donate-crypto-well'
  const tiles = document.createElement('div')
  tiles.className = 'donate-coin-tiles'
  tiles.setAttribute('role', 'listbox')
  tiles.setAttribute('aria-label', t('about.cryptoTitle'))

  function render(): void {
    well.replaceChildren()
    const qr = document.createElement('div')
    qr.className = 'donate-qr'
    qr.innerHTML = qrSvg(network.address, 176)
    // Never shortened, since an address is checked by eye before sending, and
    // left to right in a right-to-left interface.
    const address = document.createElement('p')
    address.className = 'donate-address'
    address.dir = 'ltr'
    address.textContent = network.address

    const chains = document.createElement('div')
    chains.className = 'donate-chains'
    chains.setAttribute('role', 'listbox')
    chains.setAttribute('aria-label', t('about.cryptoNetworks'))
    coin.networks.forEach((n, i) => {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.setAttribute('role', 'option')
      chip.setAttribute('aria-selected', String(n.id === network.id))
      chip.className = 'donate-chain glim-hue' + (n.id === network.id ? ' glim-active is-active' : '')
      for (const [prop, value] of Object.entries(hueVars(i))) chip.style.setProperty(prop, value)
      chip.textContent = n.name
      chip.addEventListener('click', () => {
        network = n
        render()
      })
      chains.appendChild(chip)
    })

    const copy = glimButton({ label: t('common.copy'), glyph: iconCopy(), tone: 'accent' })
    copy.classList.add('glim-hue')
    for (const [prop, value] of Object.entries(hueVars(CRYPTO_COINS.indexOf(coin)))) copy.style.setProperty(prop, value)
    copy.addEventListener('click', () => {
      void navigator.clipboard?.writeText(network.address).then(() => {
        updateButton(copy, { glyph: iconCheck() })
        window.setTimeout(() => updateButton(copy, { glyph: iconCopy() }), 1500)
      })
    })

    well.append(qr, address, chains)
    if (network.noteKey) well.appendChild(paragraph(t(network.noteKey), 'donate-note'))
    well.appendChild(copy)

    tiles.replaceChildren()
    CRYPTO_COINS.forEach((c, i) => {
      const tile = document.createElement('button')
      tile.type = 'button'
      tile.setAttribute('role', 'option')
      tile.setAttribute('aria-selected', String(c.id === coin.id))
      tile.setAttribute('aria-label', `${c.name} (${c.symbol})`)
      tile.setAttribute('data-tip', c.name)
      tile.className = 'donate-coin glim-hue glim-hue-icon' + (c.id === coin.id ? ' glim-active is-active' : '')
      for (const [prop, value] of Object.entries(hueVars(i))) tile.style.setProperty(prop, value)
      const mark = COIN_MARKS[c.id]
      if (mark) tile.insertAdjacentHTML('beforeend', markSvg(mark).replace('width="14" height="14"', 'width="22" height="22"'))
      const ticker = document.createElement('span')
      ticker.textContent = c.symbol
      tile.appendChild(ticker)
      tile.addEventListener('click', () => {
        coin = c
        network = c.networks[0]!
        render()
      })
      tiles.appendChild(tile)
    })
  }

  body.append(paragraph(t('about.donateAppeal'), 'donate-appeal'), paragraph(t('about.cryptoIntro'), 'donate-intro'), well, tiles)
  render()
}
