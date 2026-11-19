<script lang="ts">
  import type { Snippet } from 'svelte'
  import { onMount } from 'svelte'
  import { hueVars } from '@glimstone/core/appearance'

  // A card with its own rainbow position, fixed to the card rather than to
  // where it stands, so reordering keeps its colour. A panel built as plain
  // DOM code mounts itself into it through `mount`.
  let {
    hue,
    extra = '',
    el = $bindable(),
    mount,
    children,
  }: {
    hue: number
    extra?: string
    el?: HTMLDivElement | undefined
    mount?: (container: HTMLDivElement) => void
    children?: Snippet
  } = $props()

  const style = $derived(
    Object.entries(hueVars(hue))
      .map(([prop, value]) => `${prop}: ${value}`)
      .join('; '),
  )
  const className = $derived(`glim-card glim-section glim-notch-card glim-hue ${extra}`.trim())

  onMount(() => {
    if (mount && el) mount(el)
  })
</script>

<div bind:this={el} class={className} {style}>
  {@render children?.()}
</div>
