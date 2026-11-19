<script lang="ts">
  import { ReadmeButton } from '@glimstone/svelte'
  import { COFFEE_BUTTON_SVG } from '@glimstone/core/appMarks'
  import { svgSnippet, tr } from './live.svelte'
  import CoffeeWindow from './CoffeeWindow.svelte'
  import CryptoWindow from './CryptoWindow.svelte'
  import PaypalWindow from './PaypalWindow.svelte'
  import { GLYPHS, PAYPAL_PAGE } from './donate'
  import { isDesktop } from './wails'
  import { openExternal, openWindow } from './windows.svelte'

  // The About card, the last of the Info tab: what this is, then the money with
  // its own buttons, one line each like the README's give buttons, so nothing
  // moves up under the pointer.

  // A Wails window on macOS or Linux opens no popups, which PayPal's login
  // needs, so there the button hands over to PayPal's own page.
  function openPaypal(): void {
    if (isDesktop() && !/Windows/.test(navigator.userAgent)) openExternal(PAYPAL_PAGE)
    else openWindow(PaypalWindow, {})
  }
</script>

<div class="glim-eyebrow">{tr('about.title')}</div>
<p class="about-text">{tr('about.body')}</p>
<p class="about-text">{tr('about.coffee')}</p>
<div class="glim-readme-btn-rows glim-about-give">
  <ReadmeButton brand="coffee" parts={[{ name: tr('about.coffeeButton'), onClick: () => openWindow(CoffeeWindow, {}) }]} art={svgSnippet(COFFEE_BUTTON_SVG)} />
  <ReadmeButton brand="paypal" parts={[{ name: tr('about.paypal'), onClick: openPaypal }]} mark={svgSnippet(GLYPHS.paypal)} markClass="glim-paypal-mark" />
  <ReadmeButton brand="bitcoin" parts={[{ name: tr('about.crypto'), onClick: () => openWindow(CryptoWindow, {}) }]} mark={svgSnippet(GLYPHS.bitcoin)} markClass="glim-bitcoin-mark" />
</div>
