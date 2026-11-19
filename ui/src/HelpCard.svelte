<script lang="ts">
  import { InfoBubble, ReadmeButton } from '@glimstone/svelte'
  import { MANUAL_SVG } from '@glimstone/core/appMarks'
  import { svgSnippet, tr } from './live.svelte'
  import { bugReport } from './bugReport'
  import { DISCORD, GLYPHS, REPO } from './donate'
  import { downloadBlob } from './download'
  import { iconDiagnostics } from './icons'
  import type { Store } from './state'
  import { showToast } from './toast'
  import { openExternal } from './windows.svelte'

  // The second card of the Info tab: the ways to report something.
  let { store }: { store: Store } = $props()

  const MANUAL = 'https://junkerderprovinz.github.io/trickwork/'

  function saveReport(): void {
    const blob = new Blob([JSON.stringify(bugReport(store), null, 2)], { type: 'application/json' })
    const day = new Date().toISOString().slice(0, 10)
    downloadBlob(blob, `trickwork-report-${day}.json`).catch(() => showToast(tr('info.reportFailed'), 'fail'))
  }
</script>

<!-- Two marks, the closed book and the open one under the pointer, which a
     raw snippet cannot hold. -->
{#snippet book()}{@html MANUAL_SVG}{/snippet}

<div class="eyebrow-row">
  <span class="glim-eyebrow">{tr('info.help')}</span>
  <InfoBubble tip={tr('info.helpHint')} />
</div>
<p class="about-text">{tr('about.report')}</p>
<!-- One line each, like the README's buttons, unless a second line says what a
     click does. -->
<div class="glim-readme-btn-rows">
  <ReadmeButton brand="github" parts={[{ name: tr('about.repo'), onClick: () => openExternal(REPO) }]} mark={svgSnippet(GLYPHS.github)} markClass="glim-github-mark" />
  <ReadmeButton brand="discord" parts={[{ name: tr('about.discord'), onClick: () => openExternal(DISCORD) }]} mark={svgSnippet(GLYPHS.discord)} markClass="glim-discord-mark" />
  <!-- The README's docs button, its book and its yellow. -->
  <ReadmeButton brand="docs" parts={[{ name: tr('info.manual'), sub: tr('info.open'), onClick: () => openExternal(MANUAL) }]} mark={book} markClass="glim-docs-mark" />
  <!-- The file goes with an issue on GitHub, so it lights up beside it. -->
  <ReadmeButton brand="github" parts={[{ name: tr('info.bugReport'), sub: tr('info.download'), onClick: saveReport }]} mark={svgSnippet(iconDiagnostics())} markClass="glim-github-mark" />
</div>
