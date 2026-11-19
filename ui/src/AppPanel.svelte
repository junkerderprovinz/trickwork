<script lang="ts">
  import { InfoBubble, ReadmeButton, type ReadmeBrand, type ReadmePart } from '@glimstone/svelte'
  import { APPLE_SVG, DOCKER_SVG, FLATPAK_SVG, LINUX_SVG, UNRAID_SVG, WINDOWS_SVG, ZIP_SVG } from '@glimstone/core/appMarks'
  import { svgSnippet, tr } from './live.svelte'
  import { APP_VERSION } from './version'
  import { desktopRuntime, isDesktop } from './wails'

  // The App card in Settings: every other way to get TrickWork. In the
  // container it offers the desktop app; in the desktop app a server install.
  const REPO = 'https://github.com/junkerderprovinz/trickwork'
  const TAG = `v${APP_VERSION}`
  const RELEASE = `${REPO}/releases/download/${TAG}`
  const UNRAID_CA = 'https://ca.unraid.net/apps/trickwork-0h072450hg59wx'
  const DOCKER_RUN = 'docker run -d --name trickwork --restart unless-stopped -p 3210:3210 ghcr.io/junkerderprovinz/trickwork:latest'
  const COPIED_MS = 1800

  const desktop = isDesktop()

  // A Wails webview has no browser behind it to open a link in, so the link
  // leaves through the shell.
  function followExternal(event: MouseEvent): void {
    if (!desktop) return
    event.preventDefault()
    const href = (event.currentTarget as HTMLAnchorElement).href
    void desktopRuntime().then((runtime) => runtime.Browser.OpenURL(href))
  }

  // The Docker button does something on the page, so its second line says so
  // for a moment after the click, and stays out while it does.
  let copied = $state(false)
  let copiedTimer: number | undefined
  function copyDockerRun(): void {
    void navigator.clipboard?.writeText(DOCKER_RUN).then(() => {
      copied = true
      window.clearTimeout(copiedTimer)
      copiedTimer = window.setTimeout(() => (copied = false), COPIED_MS)
    })
  }

  interface Unit {
    brand: ReadmeBrand
    mark: string
    markClass?: string
    parts: [ReadmePart, ...ReadmePart[]]
    hint?: string
    note?: boolean
  }

  // A segment names in one word what differs from the button it hangs on, has
  // no second line, and its label says the whole build.
  const units = $derived.by((): Unit[] => {
    if (desktop) {
      return [
        { brand: 'unraid', mark: UNRAID_SVG, parts: [{ name: tr('apps.unraid'), sub: tr('apps.unraidSub'), href: UNRAID_CA }] },
        {
          brand: 'docker',
          mark: DOCKER_SVG,
          markClass: 'glim-docker-mark',
          parts: [{ name: tr('apps.docker'), sub: copied ? tr('apps.copied') : tr('apps.dockerSub'), onClick: copyDockerRun }],
          hint: `${tr('apps.dockerHint')} ${DOCKER_RUN}`,
          note: copied,
        },
        { brand: 'zip', mark: ZIP_SVG, parts: [{ name: tr('apps.source'), sub: tr('apps.zipSub'), href: `${REPO}/archive/refs/tags/${TAG}.zip` }] },
      ]
    }
    const windows = tr('apps.windows')
    const linux = tr('apps.linux')
    const portable = tr('apps.portable')
    return [
      {
        brand: 'windows',
        mark: WINDOWS_SVG,
        markClass: 'glim-windows-mark',
        parts: [
          { name: windows, sub: 'x64', href: `${RELEASE}/trickwork-windows-amd64-installer.exe` },
          { name: 'ARM64', label: `${windows} ARM64`, href: `${RELEASE}/trickwork-windows-arm64-installer.exe` },
          { name: portable, label: `${windows} ${portable}`, href: `${RELEASE}/trickwork-windows-amd64-portable.exe` },
        ],
      },
      { brand: 'apple', mark: APPLE_SVG, parts: [{ name: tr('apps.macos'), sub: 'Universal', href: `${RELEASE}/trickwork-macos-universal.dmg` }] },
      {
        brand: 'linux',
        mark: LINUX_SVG,
        parts: [
          { name: linux, sub: 'x64', href: `${RELEASE}/trickwork-linux-amd64` },
          { name: 'ARM64', label: `${linux} ARM64`, href: `${RELEASE}/trickwork-linux-arm64` },
        ],
      },
      {
        brand: 'flatpak',
        mark: FLATPAK_SVG,
        markClass: 'glim-flatpak-mark',
        parts: [
          { name: 'Flatpak', sub: 'x64', href: `${RELEASE}/trickwork-linux-amd64.flatpak` },
          { name: 'ARM64', label: 'Flatpak ARM64', href: `${RELEASE}/trickwork-linux-arm64.flatpak` },
        ],
      },
    ]
  })
</script>

<div class="eyebrow-row">
  <span class="glim-eyebrow">{tr(desktop ? 'apps.serverTitle' : 'apps.desktopTitle')}</span>
  <InfoBubble tip={tr(desktop ? 'apps.serverHint' : 'apps.desktopHint')} />
</div>
<div class="glim-readme-btn-rows app-rows">
  {#each units as unit (unit.brand)}
    <ReadmeButton
      brand={unit.brand}
      parts={unit.parts}
      mark={svgSnippet(unit.mark)}
      {...unit.markClass ? { markClass: unit.markClass } : {}}
      {...unit.hint ? { hint: unit.hint } : {}}
      note={unit.note ?? false}
      onLinkClick={followExternal}
    />
  {/each}
</div>
