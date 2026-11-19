<script lang="ts">
  import { useRainbow } from '@glimstone/svelte'
  import { hueVars } from '@glimstone/core/appearance'
  import { liveState, tr } from './live.svelte'
  import type { TranslationKey } from './i18n'
  import { motionMs } from './motion'
  import type { BatchItem, BatchItemStatus, Store } from './state'

  let { store }: { store: Store } = $props()

  const STATUS_KEYS: Record<BatchItemStatus, TranslationKey> = {
    pending: 'queue.statusPending',
    converting: 'queue.statusConverting',
    converted: 'queue.statusConverted',
    exported: 'queue.statusExported',
    error: 'queue.statusError',
  }

  // The app hands every panel the one store it keeps for its whole life.
  // svelte-ignore state_referenced_locally
  const live = liveState(store)
  const rainbow = useRainbow()

  // New rows come in one after another. A conversion redraws the list within
  // milliseconds, so each row keeps the moment its entrance started and a
  // redrawn row carries on from there, or stands finished once that is past.
  const starts = new Map<string, number>()
  const delays = $derived.by(() => {
    const now = performance.now()
    const step = motionMs('--motion-stagger-step')
    const cap = motionMs('--motion-stagger-cap')
    let arriving = 0
    return live.current.items.map((item) => {
      let start = starts.get(item.id)
      if (start === undefined) {
        start = now + Math.min(arriving++ * step, cap)
        starts.set(item.id, start)
      }
      return `${start - now}ms`
    })
  })

  const selectable = (item: BatchItem) => item.status === 'converted' || item.status === 'exported'

  function select(item: BatchItem): void {
    if (selectable(item)) store.setState({ activeItemId: item.id })
  }

  // Each row owns one palette position. .glim-hue redefines --accent-soft,
  // which the active highlight reads, so it takes on the row's hue.
  function rowStyle(index: number, delay: string): string {
    const vars = rainbow.current.on ? Object.entries(hueVars(index)).map(([k, v]) => `${k}: ${v}; `).join('') : ''
    return `${vars}animation-delay: ${delay}`
  }

  function onKey(event: KeyboardEvent, item: BatchItem): void {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    select(item)
  }
</script>

<div class="glim-eyebrow">{tr('queue.eyebrow')}</div>
<p class="queue-empty" style:display={live.current.items.length === 0 ? '' : 'none'}>{tr('queue.empty')}</p>
<ul class="queue-list">
  {#each live.current.items as item, index (item.id)}
    {@const active = item.id === live.current.activeItemId}
    {@const pick = selectable(item)}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
    <li
      class="queue-item queue-item--{item.status} glim-stagger-row"
      class:queue-item--active={active}
      class:glim-active={active}
      class:glim-hue={rainbow.current.on}
      class:glim-tint={rainbow.current.on}
      style={rowStyle(index, delays[index] ?? '0ms')}
      tabindex={pick ? 0 : undefined}
      role={pick ? 'button' : undefined}
      aria-label={pick ? tr('queue.previewAriaLabel', { name: item.file.name }) : undefined}
      onclick={() => select(item)}
      onkeydown={(event) => onKey(event, item)}
    >
      <!-- A solid dot as well, since the faint wash is easy to miss on some
           displays. It paints from --item-hue, so disco walks it with the rest. -->
      {#if rainbow.current.on}<span class="queue-item-dot"></span>{/if}
      <span class="queue-item-name">{item.file.name}</span>
      <!-- A file being converted pulses: it is happening now. -->
      <span class="queue-item-status" class:glim-live={item.status === 'converting'}>
        {item.status === 'error'
          ? tr('queue.errorPrefix', { message: item.errorMessage ?? tr('queue.errorUnknown') })
          : tr(STATUS_KEYS[item.status])}
      </span>
      {#if item.wasDownscaled}
        <span class="queue-item-downscaled" data-tip={tr('queue.downscaledTitle')}>{tr('queue.downscaledLabel')}</span>
      {/if}
    </li>
  {/each}
</ul>
