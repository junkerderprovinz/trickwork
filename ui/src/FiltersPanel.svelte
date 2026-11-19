<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { SharpenMethod } from 'trickwork-core'
  import { Selector } from '@glimstone/svelte'
  import LevelsPanel from './LevelsPanel.svelte'
  import NumberSlider from './NumberSlider.svelte'
  import { liveState, svgSnippet, tr } from './live.svelte'
  import { iconColor, iconDither, iconInvert } from './icons'
  import type { TranslationKey } from './i18n'
  import type { AppState, Store } from './state'

  let { store }: { store: Store } = $props()
  // The app hands every panel the one store it keeps for its whole life.
  // svelte-ignore state_referenced_locally
  const live = liveState(store)

  const SHARPEN_METHODS: { id: SharpenMethod; key: TranslationKey }[] = [
    { id: 'none', key: 'controls.sharpenNone' },
    { id: 'sharpen', key: 'controls.sharpenSharpen' },
    { id: 'unsharp', key: 'controls.sharpenUnsharp' },
  ]

  type Toggle = 'invert' | 'dither' | 'color'
  const TOGGLES: { id: Toggle; label: TranslationKey; entry: TranslationKey; glyph: Snippet }[] = [
    { id: 'invert', label: 'controls.invert', entry: 'history.entryInvert', glyph: svgSnippet(iconInvert()) },
    { id: 'dither', label: 'controls.dither', entry: 'history.entryDither', glyph: svgSnippet(iconDither()) },
    { id: 'color', label: 'controls.color', entry: 'history.entryColor', glyph: svgSnippet(iconColor()) },
  ]

  const options = $derived(live.current.options)
  const toggled = $derived(TOGGLES.filter((t) => options[t.id]).map((t) => t.id))

  function setOptions(patch: Partial<AppState['options']>): void {
    store.setState({ options: { ...store.getState().options, ...patch } })
  }

  function toggle(next: Toggle[]): void {
    const current = store.getState().options
    const changed = TOGGLES.find((t) => next.includes(t.id) !== !!current[t.id])
    if (!changed) return
    store.commitOptionsSnapshot(tr(changed.entry))
    setOptions({ [changed.id]: next.includes(changed.id) })
  }

  function sharpen(method: SharpenMethod): void {
    store.commitOptionsSnapshot(tr('history.entrySharpen'))
    setOptions({ sharpen: method })
  }
</script>

<div class="glim-eyebrow">{tr('tabs.filters')}</div>
<!-- Levels comes first, as in ASCGen2. -->
<LevelsPanel {store} />
<div class="controls">
  <!-- A double-click on the thumb resets to the initial values in state.ts. -->
  <NumberSlider
    label={tr('controls.brightness')}
    min={-1}
    max={1}
    step={0.05}
    value={options.brightness}
    onChange={(brightness) => setOptions({ brightness })}
    onBeforeChange={() => store.commitOptionsSnapshot(tr('history.entryBrightness'))}
    hueIndex={0}
    defaultValue={0}
  />
  <NumberSlider
    label={tr('controls.contrast')}
    min={-1}
    max={1}
    step={0.05}
    value={options.contrast}
    onChange={(contrast) => setOptions({ contrast })}
    onBeforeChange={() => store.commitOptionsSnapshot(tr('history.entryContrast'))}
    hueIndex={1}
    defaultValue={0}
  />
  <div class="icon-toggle-row">
    <Selector
      items={TOGGLES.map((t) => ({ id: t.id, label: tr(t.label), glyph: t.glyph, iconOnly: true }))}
      label={tr('tabs.filters')}
      select="many"
      variant="chip"
      inline
      value={toggled}
      onChange={toggle}
    />
  </div>
  <div class="control-slider">
    <div class="control-slider-label-row"><span>{tr('controls.sharpen')}</span></div>
    <Selector
      items={SHARPEN_METHODS.map((s) => ({ id: s.id, label: tr(s.key) }))}
      label={tr('controls.sharpen')}
      value={options.sharpen ?? 'none'}
      onChange={sharpen}
      buttonHeight
    />
  </div>
</div>
