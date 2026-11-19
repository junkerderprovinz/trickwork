<script lang="ts">
  import { Button } from '@glimstone/svelte'
  import { svgSnippet, tr, liveState } from './live.svelte'
  import { iconRedo, iconUndo } from './icons'
  import type { Store } from './state'

  let { store }: { store: Store } = $props()

  // The app hands every panel the one store it keeps for its whole life.
  // svelte-ignore state_referenced_locally
  const live = liveState(store)
  const undoGlyph = svgSnippet(iconUndo())
  const redoGlyph = svgSnippet(iconRedo())

  // Read through the state, so every change redraws the buttons and the log.
  // Most recent first; the stack is capped at HISTORY_LIMIT, so the log only
  // needs a fixed height.
  const entries = $derived((void live.current, store.historyLog().slice().reverse()))
  const canUndo = $derived((void live.current, store.canUndo()))
  const canRedo = $derived((void live.current, store.canRedo()))
</script>

<div class="glim-eyebrow">{tr('history.eyebrow')}</div>
<!-- Undo and redo are momentary actions with no checked state, so they get no
     rainbow colour. -->
<div class="button-row">
  <Button label={tr('nav.undo')} labelKey={null} glyph={undoGlyph} variant="icon" tone="subtle" disabled={!canUndo} onClick={() => store.undo()} />
  <Button label={tr('nav.redo')} labelKey={null} glyph={redoGlyph} variant="icon" tone="subtle" disabled={!canRedo} onClick={() => store.redo()} />
</div>
<ul class="history-log">
  {#each entries as entry, i (i)}
    <li class="history-log-entry">{entry}</li>
  {:else}
    <li class="history-log-empty">{tr('history.logEmpty')}</li>
  {/each}
</ul>
