<script lang="ts">
  import { CoffeeDialog } from '@glimstone/svelte'
  import { COFFEE_WIDGET } from './donate'
  import { tr } from './live.svelte'
  import { stackOnMount } from './windows.svelte'

  let { onClose }: { onClose: () => void } = $props()
  let ref: HTMLDivElement | null = $state(null)
  // svelte-ignore state_referenced_locally
  stackOnMount(() => ref, onClose)
</script>

<CoffeeDialog
  bind:ref
  widgetUrl={COFFEE_WIDGET}
  text={{ title: tr('about.coffeeButton'), appeal: tr('about.donateAppeal'), intro: tr('about.coffeeIntro'), closeLabel: tr('common.close') }}
  {onClose}
/>
