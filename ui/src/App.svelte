<script lang="ts">
  import { onMount } from 'svelte'
  import { Button, Selector } from '@glimstone/svelte'
  import Section from './Section.svelte'
  import Dropzone from './Dropzone.svelte'
  import CropPanel from './CropPanel.svelte'
  import Preview from './Preview.svelte'
  import { tr, svgSnippet } from './live.svelte'
  import type { Store } from './state'
  import { brandLogo } from './brandLogo'
  import { iconApp, iconBack, iconGeneral, iconInfoTab, iconLook, iconSettings } from './icons'
  import { makeReorderable } from './cardReorder'
  import { replay } from './motion'
  import { HUE_OFFSET, mountAppearanceSettings } from './appearanceSettings'
  import { mountHistoryPanel } from './historyPanel'
  import { mountControls } from './controls'
  import { mountTransformPanel } from './transformPanel'
  import { mountFiltersPanel } from './filtersPanel'
  import { mountQueue } from './queue'
  import { mountExportPanel } from './exportPanel'
  import { mountPresetsPanel } from './presetsPanel'
  import { mountUpdatePanel, listenForUpdates } from './updatePanel'
  import { mountAppPanel } from './appPanel'
  import { mountHelpCard, mountVersionCard } from './infoPanel'
  import { mountAboutPanel } from './aboutPanel'
  import { isDesktop } from './wails'

  let { store }: { store: Store } = $props()

  type SettingsTab = 'general' | 'look' | 'app' | 'info'
  const TAB_ORDER: SettingsTab[] = ['general', 'look', 'app', 'info']

  // Only the desktop app updates itself, so only it has the Updates card.
  const desktop = isDesktop()

  let onSettings = $state(false)
  let settingsTab = $state<SettingsTab>('general')
  let leaveLook = (): void => {}

  let root: HTMLDivElement
  let primary: HTMLElement
  let secondary: HTMLElement
  let settingsView: HTMLDivElement
  let settingsCards: HTMLDivElement

  const cards: Record<string, HTMLDivElement | undefined> = $state({})

  const settingsGlyph = svgSnippet(iconSettings())
  const backGlyph = svgSnippet(iconBack())

  // The cards of each Settings tab, in their order on the tab.
  function tabCards(tab: SettingsTab): (HTMLDivElement | undefined)[] {
    switch (tab) {
      case 'general':
        return desktop ? [cards.presets, cards.update] : [cards.presets]
      case 'look':
        return [cards.look, cards.colours]
      case 'app':
        return [cards.app]
      case 'info':
        return [cards.version, cards.help, cards.about]
    }
  }

  function showTab(): void {
    for (const tab of TAB_ORDER) {
      tabCards(tab).forEach((card, i) => {
        if (!card) return
        const shown = tab === settingsTab
        card.style.display = shown ? '' : 'none'
        if (!shown) return
        card.style.setProperty('--row-i', String(i))
        replay(card, 'glim-stagger-row')
      })
    }
  }

  function selectTab(tab: SettingsTab): void {
    if (settingsTab === 'look') leaveLook()
    // The new tab slides in from the side it lies on.
    const toward = TAB_ORDER.indexOf(tab) > TAB_ORDER.indexOf(settingsTab) ? 1 : -1
    settingsCards.style.setProperty('--tab-dir', String(toward))
    settingsTab = tab
    showTab()
    replay(settingsCards, 'glim-tab-slide')
  }

  const tabGlyphs = { general: svgSnippet(iconGeneral()), look: svgSnippet(iconLook()), app: svgSnippet(iconApp()), info: svgSnippet(iconInfoTab()) }
  const tabs = $derived(
    TAB_ORDER.map((id) => ({ id, label: tr(`settings.${id}`), glyph: tabGlyphs[id] })),
  )

  function toggleSettings(): void {
    if (onSettings && settingsTab === 'look') leaveLook()
    onSettings = !onSettings
    // The page entrance runs on every arrival.
    for (const shown of onSettings ? [settingsView] : [primary, secondary]) replay(shown, 'glim-page-enter')
    if (onSettings) showTab()
  }

  onMount(() => {
    makeReorderable(secondary, [
      { id: 'adjust', el: cards.adjust! },
      { id: 'transform', el: cards.transform! },
      { id: 'filters', el: cards.filters! },
      { id: 'history', el: cards.history! },
      { id: 'queue', el: cards.queue! },
      { id: 'export', el: cards.export! },
    ])
    leaveLook = mountAppearanceSettings(cards.look!, cards.colours!)
    if (desktop) {
      mountUpdatePanel(cards.update!)
      listenForUpdates()
    }
    // Every card heading is its section badge, and in the reactive rainbow
    // mode it lights up while the pointer is anywhere in its card.
    for (const heading of root.querySelectorAll('.glim-section > .glim-eyebrow, .glim-section > .eyebrow-row')) {
      heading.classList.add('glim-hue', 'glim-notch-hue')
    }
    showTab()
    for (const shown of [primary, secondary]) replay(shown, 'glim-page-enter')
  })
</script>

<div bind:this={root} class="app-body glim-shell" class:app-body--settings={onSettings}>
  <!-- With only two destinations, the brand bar over the main area carries the
       Settings button in place of GlimStone's sidebar, as GlimStone allows for
       a single-workspace app. -->
  <header class="glim-card brand-bar">
    {@html brandLogo()}
    <span class="app-brand-name">TrickWork</span>
    <span class="app-brand-claim">{tr('brand.claim')}</span>
    <Button
      class="settings-button"
      label={onSettings ? tr('nav.backToConvert') : tr('nav.settings')}
      labelKey={null}
      glyph={onSettings ? backGlyph : settingsGlyph}
      tone="neutral"
      onClick={toggleSettings}
    />
  </header>

  <div class="app-main">
    <section bind:this={primary} class="app-primary" style:display={onSettings ? 'none' : ''}>
      <div class="app-primary-row">
        <Section hue={0}><Dropzone {store} /></Section>
        <Section hue={1}><CropPanel {store} /></Section>
      </div>
      <Section hue={2}><Preview {store} /></Section>
    </section>

    <!-- The Settings view, without a preview: a strip of tabs over the cards of
         the open one. Each tab's cards count their rainbow positions from the
         start. -->
    <div bind:this={settingsView} class="settings-view" style:display={onSettings ? '' : 'none'}>
      <div class="settings-tabs">
        <Selector
          items={tabs}
          label={tr('settings.section')}
          value={settingsTab}
          onChange={selectTab}
          variant="chip"
          size="lg"
          equalWidth
          hueOffset={HUE_OFFSET.tabs}
        />
      </div>
      <div bind:this={settingsCards} class="settings-cards">
        <Section hue={0} extra="settings-card" bind:el={cards.presets} mount={(el) => mountPresetsPanel(el, store)} />
        {#if desktop}
          <Section hue={1} extra="settings-card" bind:el={cards.update} />
        {/if}
        <Section hue={0} extra="settings-card" bind:el={cards.look} />
        <Section hue={1} extra="settings-card" bind:el={cards.colours} />
        <Section hue={0} extra="settings-card" bind:el={cards.app} mount={mountAppPanel} />
        <!-- The Info tab is GlimStone's Info tile, last in Settings: Version,
             Help and About, in that order. -->
        <Section hue={0} extra="settings-card" bind:el={cards.version} mount={mountVersionCard} />
        <Section hue={1} extra="settings-card" bind:el={cards.help} mount={(el) => mountHelpCard(el, store)} />
        <Section hue={2} extra="settings-card" bind:el={cards.about} mount={mountAboutPanel} />
      </div>
    </div>
  </div>

  <section bind:this={secondary} class="app-secondary" style:display={onSettings ? 'none' : ''}>
    <Section hue={3} bind:el={cards.adjust} mount={(el) => mountControls(el, store)} />
    <Section hue={4} bind:el={cards.transform} mount={(el) => mountTransformPanel(el, store)} />
    <Section hue={5} bind:el={cards.filters} mount={(el) => mountFiltersPanel(el, store)} />
    <Section hue={6} bind:el={cards.history} mount={(el) => mountHistoryPanel(el, store)} />
    <Section hue={7} bind:el={cards.queue} mount={(el) => mountQueue(el, store)} />
    <Section hue={0} bind:el={cards.export} mount={(el) => mountExportPanel(el, store)} />
  </section>
</div>
