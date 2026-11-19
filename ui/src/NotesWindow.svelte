<script lang="ts">
  import { Window } from '@glimstone/svelte'
  import { REPO } from './donate'
  import { svgSnippet, tr } from './live.svelte'
  import { iconExternalLink } from './icons'
  import { noteBlocks } from './notes'
  import { releaseNotes } from './releases'
  import { APP_VERSION } from './version'
  import { openExternal } from './windows.svelte'

  // The window behind the Version card's Release notes button: the notes of the
  // running version as the build carries them. TrickWork marks no changes on
  // the page, so the window has no Changes tab (GlimStone, "First start and
  // what's new").
  let { onClose }: { onClose: () => void } = $props()

  const notes = releaseNotes(APP_VERSION)
  const blocks = notes ? noteBlocks(notes) : []
</script>

<!-- The link out of the app opens the foot, and the way out ends it. -->
<Window
  title={tr('info.notesTitle', { version: APP_VERSION })}
  size="wide"
  text={{ cancel: tr('common.close'), close: tr('common.close') }}
  actions={[
    {
      label: tr('info.releasePage'),
      labelKey: null,
      glyph: svgSnippet(iconExternalLink()),
      onClick: () => {
        openExternal(`${REPO}/releases/tag/v${APP_VERSION}`)
        return false
      },
    },
  ]}
  {onClose}
>
  <div class="notes-body">
    {#each blocks as block, i (i)}
      {#if block.kind === 'heading'}
        <h3 class="glim-eyebrow notes-heading">{block.text}</h3>
      {:else if block.kind === 'paragraph'}
        <p class="notes-paragraph">{block.text}</p>
      {:else if block.kind === 'list'}
        <ul class="notes-list">
          {#each block.items as item, j (j)}<li>{item}</li>{/each}
        </ul>
      {/if}
    {:else}
      <p class="notes-paragraph">{tr('info.notesMissing')}</p>
    {/each}
  </div>
</Window>
