<script lang="ts">
  import { CryptoDonateDialog, type CryptoCoin, type CryptoNetwork } from '@glimstone/svelte'
  import { COIN_MARKS, COIN_TILES, CRYPTO_COINS, markSvg } from './donate'
  import { tr } from './live.svelte'
  import { qrSvg } from './qr'
  import { showToast } from './toast'
  import { stackOnMount } from './windows.svelte'

  let { onClose }: { onClose: () => void } = $props()
  let ref: HTMLDivElement | null = $state(null)
  // svelte-ignore state_referenced_locally
  stackOnMount(() => ref, onClose)

  const coins: CryptoCoin[] = $derived(
    CRYPTO_COINS.map((c) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      networks: c.networks.map((n) => ({ id: n.id, name: n.name, address: n.address, ...(n.noteKey ? { note: tr(n.noteKey) } : {}) })),
      ...(COIN_TILES[c.id] ? { tile: COIN_TILES[c.id] } : {}),
    })),
  )
  let coinId = $state(CRYPTO_COINS[0]!.id)
  let networkId = $state(CRYPTO_COINS[0]!.networks[0]!.id)
  const coin = $derived(coins.find((c) => c.id === coinId) ?? coins[0]!)
  const network = $derived(coin.networks.find((n) => n.id === networkId) ?? coin.networks[0]!)

  function pick(next: CryptoCoin, chain: CryptoNetwork): void {
    coinId = next.id
    networkId = chain.id
  }

  function copy(_coin: CryptoCoin, chain: CryptoNetwork): void {
    void navigator.clipboard?.writeText(chain.address).then(() => showToast(tr('apps.copied')))
  }
</script>

{#snippet qr(address: string)}
  <div class="donate-qr">{@html qrSvg(address, 176)}</div>
{/snippet}

{#snippet mark(c: CryptoCoin)}
  {@const own = COIN_MARKS[c.id]}
  {#if own}{@html markSvg(own).replace('width="14" height="14"', 'width="22" height="22"')}{/if}
{/snippet}

<CryptoDonateDialog
  bind:ref
  {coins}
  {coin}
  {network}
  onPick={pick}
  onCopy={copy}
  renderQr={qr}
  renderMark={mark}
  text={{
    title: tr('about.cryptoTitle'),
    appeal: tr('about.donateAppeal'),
    intro: tr('about.cryptoIntro'),
    networks: tr('about.cryptoNetworks'),
    copyLabel: tr('common.copy'),
    closeLabel: tr('common.close'),
  }}
  {onClose}
/>
