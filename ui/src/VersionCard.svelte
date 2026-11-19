<script lang="ts">
  import { Button, InfoBubble } from '@glimstone/svelte'
  import { runUpdateCheck, updateFace, updateStage, versionLink, type UpdateCheck, type UpdateVerdict } from '@glimstone/core'
  import { GLIMSTONE_REPO, GLIMSTONE_VERSION } from '@glimstone/core/version'
  import { svgSnippet, tr } from './live.svelte'
  import { REPO } from './donate'
  import { openExternal } from './donateWindows'
  import { iconInfo, iconUpdate } from './icons'
  import { openReleaseNotes } from './releaseNotes'
  import { isNewer } from './releases'
  import { showToast } from './toast'
  import { APP_VERSION } from './version'
  import { isDesktop, isFlatpak } from './wails'

  // The first card of the Info tab: every version TrickWork is made of, the
  // release notes and the update check.
  const LATEST = 'https://api.github.com/repos/junkerderprovinz/trickwork/releases/latest'

  // GlimStone folds its patch tags into the next minor, so its number opens the
  // newest release. Only the number is a link: the name in front of it is not a
  // destination.
  const rows = [
    { name: 'TrickWork', ...versionLink({ name: 'TrickWork', version: APP_VERSION, repoUrl: REPO }) },
    { name: 'GlimStone', ...versionLink({ name: 'GlimStone', version: GLIMSTONE_VERSION, repoUrl: GLIMSTONE_REPO, latest: true }) },
  ]

  // A failure says why in a toast; a newer release says where to get it.
  async function newerReleases(): Promise<number> {
    try {
      const res = await fetch(LATEST, { headers: { Accept: 'application/vnd.github+json' } })
      if (!res.ok) throw new Error(String(res.status))
      const { tag_name: tag } = (await res.json()) as { tag_name?: string }
      if (!tag) throw new Error('no tag')
      if (!isNewer(tag, APP_VERSION)) return 0
      const notice = !isDesktop() ? 'info.available' : (await isFlatpak()) ? 'info.availableFlatpak' : 'info.availableDesktop'
      showToast(tr(notice, { version: tag.replace(/^v/, '') }))
      return 1
    } catch (error) {
      showToast(tr('info.checkUnreachable'), 'fail')
      throw error
    }
  }

  const check: UpdateCheck = $derived({
    run: newerReleases,
    text: {
      check: tr('info.check'),
      upToDate: tr('info.upToDate'),
      updatesFound: () => tr('info.updateFound'),
      checkFailed: tr('info.checkFailed'),
    },
  })

  // Check for updates shows its verdict on itself, like a test button, and a
  // new button for every failure runs the shake again.
  let verdict = $state<UpdateVerdict>({ kind: 'idle' })
  let shake = $state(0)
  const face = $derived(updateFace(verdict, check.text))

  function runCheck(): void {
    void runUpdateCheck(check, verdict, (next) => {
      verdict = next
      if (next.kind === 'failed') shake++
    })
  }

  function open(event: MouseEvent, href: string): void {
    event.preventDefault()
    openExternal(href)
  }
</script>

<div class="eyebrow-row">
  <span class="glim-eyebrow">{tr('about.version')}</span>
  <InfoBubble tip={tr('info.versionHint')} />
</div>
<ul class="version-rows">
  {#each rows as row (row.name)}
    <li class="version-row">
      <span class="version-names"><span class="version-name">{row.name}</span></span>
      <a class="version-number glim-num" href={row.href} target="_blank" rel="noreferrer noopener" onclick={(event) => open(event, row.href ?? '')}>{row.shown}</a>
    </li>
  {/each}
</ul>
<div class="version-actions">
  <Button label={tr('info.releaseNotes')} labelKey={null} glyph={svgSnippet(iconInfo())} tone="subtle" onClick={openReleaseNotes} />
  {#key shake}
    <Button
      label={face.label}
      labelKey={face.labelKey}
      glyph={svgSnippet(iconUpdate(verdict.kind))}
      tone={face.tone}
      stage={updateStage(check.text, face.label)}
      busy={verdict.kind === 'busy'}
      class={shake > 0 ? 'glim-shake' : ''}
      onClick={runCheck}
    />
  {/key}
  <span role="status" class="glim-sr-only">{face.announced}</span>
</div>
