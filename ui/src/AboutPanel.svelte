<script lang="ts">
  import { ReadmeButton } from '@glimstone/svelte'
  import { COFFEE_BUTTON_SVG } from '@glimstone/core/appMarks'
  import { svgSnippet, tr } from './live.svelte'
  import { GLYPHS } from './donate'
  import { openCoffeeWindow, openCryptoWindow, openPaypalWindow } from './donateWindows'

  // The About card, the last of the Info tab: what this is, then the money with
  // its own buttons, one line each like the README's give buttons, so nothing
  // moves up under the pointer.
</script>

<div class="glim-eyebrow">{tr('about.title')}</div>
<p class="about-text">{tr('about.body')}</p>
<p class="about-text">{tr('about.coffee')}</p>
<div class="glim-readme-btn-rows glim-about-give">
  <ReadmeButton brand="coffee" parts={[{ name: tr('about.coffeeButton'), onClick: openCoffeeWindow }]} art={svgSnippet(COFFEE_BUTTON_SVG)} />
  <ReadmeButton brand="paypal" parts={[{ name: tr('about.paypal'), onClick: openPaypalWindow }]} mark={svgSnippet(GLYPHS.paypal)} markClass="glim-paypal-mark" />
  <ReadmeButton brand="bitcoin" parts={[{ name: tr('about.crypto'), onClick: openCryptoWindow }]} mark={svgSnippet(GLYPHS.bitcoin)} markClass="glim-bitcoin-mark" />
</div>
