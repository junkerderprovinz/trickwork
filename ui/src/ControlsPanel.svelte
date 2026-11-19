<script lang="ts">
  import { onMount } from 'svelte'
  import {
    CELL_ASPECT_COMPENSATION,
    CHARSET_PRESETS,
    computeAutoRows,
    effectiveDimensions,
    type CharsetPresetKey,
  } from 'trickwork-core'
  import { IconButton, InfoBubble } from '@glimstone/svelte'
  import { enableSelectScroll } from '@glimstone/core/selectScroll'
  import NumberSlider from './NumberSlider.svelte'
  import { liveState, svgSnippet, tr } from './live.svelte'
  import { iconLockClosed, iconLockOpen } from './icons'
  import type { TranslationKey } from './i18n'
  import type { AppState, Store } from './state'

  let { store }: { store: Store } = $props()
  // The app hands every panel the one store it keeps for its whole life.
  // svelte-ignore state_referenced_locally
  const live = liveState(store)

  // Display names for the preset keys, which are lowercase identifiers.
  const CHARSET_PRESET_KEYS: Record<CharsetPresetKey, TranslationKey> = {
    standard: 'controls.charsetPresetStandard',
    detailed: 'controls.charsetPresetDetailed',
    blocks: 'controls.charsetPresetBlocks',
    classic: 'controls.charsetPresetClassic',
    alternate: 'controls.charsetPresetAlternate',
    compact: 'controls.charsetPresetCompact',
    bold: 'controls.charsetPresetBold',
    symbols: 'controls.charsetPresetSymbols',
    minimal: 'controls.charsetPresetMinimal',
    binary: 'controls.charsetPresetBinary',
  }
  const PRESETS = Object.keys(CHARSET_PRESETS) as CharsetPresetKey[]

  const FONT_CHOICES: { key: TranslationKey; family: string }[] = [
    { key: 'controls.fontMonoSystem', family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
    { key: 'controls.fontMonoAlt', family: 'Consolas, "Courier New", monospace' },
    { key: 'controls.fontSerif', family: 'ui-serif, Georgia, "Times New Roman", serif' },
    { key: 'controls.fontSans', family: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif' },
  ]

  // The initial width in state.ts, which a double-click on the thumb restores.
  const DEFAULT_COLUMNS = 120
  // Height before any image is loaded: the auto row count of a square image.
  const DEFAULT_ROWS_FALLBACK = Math.round(DEFAULT_COLUMNS / CELL_ASPECT_COMPENSATION)

  /**
   * The row count the Height slider shows: the explicit override, or the auto
   * value assembleGrid would derive for the active image, taken from
   * effectiveDimensions instead of running the pixel pipeline.
   */
  function displayRows(state: AppState): number {
    if (state.options.rows !== undefined) return state.options.rows
    const active = state.items.find((item) => item.id === state.activeItemId)
    if (!active?.imageData) return DEFAULT_ROWS_FALLBACK
    const { width, height } = effectiveDimensions(active.imageData.width, active.imageData.height, state.options)
    return computeAutoRows(width, height, state.options.columns)
  }

  const options = $derived(live.current.options)
  const rows = $derived(displayRows(live.current))
  // What a double-click on the Height thumb returns to: the image's own proportions.
  const autoRows = $derived.by(() => {
    const { rows: _rows, ...withoutRows } = live.current.options
    return displayRows({ ...live.current, options: withoutRows })
  })
  const preset = $derived(PRESETS.find((key) => sameChars(CHARSET_PRESETS[key], options.charset)) ?? '')

  // A UI mode rather than an option, since an unset `rows` already means height
  // follows width.
  let aspectLocked = $state(true)

  function setOptions(patch: Partial<AppState['options']>): void {
    store.setState({ options: { ...store.getState().options, ...patch } })
  }

  function toggleLock(): void {
    aspectLocked = !aspectLocked
    if (!aspectLocked) return
    // Locking drops the override and returns to the image's proportions. The
    // key is removed rather than set to undefined, which
    // exactOptionalPropertyTypes treats differently.
    store.commitOptionsSnapshot(tr('history.entryAspectLocked'))
    const { rows: _rows, ...withoutRows } = store.getState().options
    store.setState({ options: withoutRows })
  }

  // The editable ramp, like ASCGen2's Valid Ramp Chars, as plain text. It
  // follows the store only on outside changes (a preset, the font, leaving the
  // field, undo); from its own typing it would fight the cursor.
  // svelte-ignore state_referenced_locally
  let fieldText = $state(store.getState().options.charset.join(''))
  const syncField = () => (fieldText = store.getState().options.charset.join(''))
  onMount(() => store.subscribeHistory(syncField))

  // Array.from splits by code point, so an emoji stays one character, and
  // newlines only wrap the field. Repeats are kept, since a repeated character
  // is weighted more.
  function typeChars(text: string): void {
    fieldText = text
    const chars = Array.from(text).filter((ch) => ch !== '\n' && ch !== '\r')
    if (chars.length > 0) setOptions({ charset: chars })
  }

  // One undo step per visit to the field, not per keystroke.
  let fieldCommitted = false
  function enterField(): void {
    if (fieldCommitted) return
    fieldCommitted = true
    store.commitOptionsSnapshot(tr('history.entryCharsetEdited'))
  }

  function pickPreset(key: CharsetPresetKey): void {
    store.commitOptionsSnapshot(tr('history.entryCharsetPreset', { preset: tr(CHARSET_PRESET_KEYS[key]) }))
    setOptions({ charset: [...CHARSET_PRESETS[key]] })
    syncField()
  }

  function pickFont(family: string): void {
    store.commitOptionsSnapshot(tr('history.entryFont'))
    const current = store.getState().options
    setOptions({ font: { ...current.font, family } })
  }

  function sameChars(a: readonly string[], b: readonly string[]): boolean {
    return a.length === b.length && a.every((ch, i) => ch === b[i])
  }

  const lockClosed = svgSnippet(iconLockClosed())
  const lockOpen = svgSnippet(iconLockOpen())
</script>

<div class="glim-eyebrow">{tr('controls.eyebrow')}</div>
<div class="controls">
  <NumberSlider
    label={tr('controls.width')}
    min={20}
    max={400}
    value={options.columns}
    onChange={(columns) => setOptions({ columns })}
    onBeforeChange={() => store.commitOptionsSnapshot(tr('history.entryWidth'))}
    hueIndex={0}
    defaultValue={DEFAULT_COLUMNS}
  />

  <!-- The lock sits beside the slider's <label> rather than inside it, where
       the label would forward clicks meant for the range input to it. -->
  <div class="control-slider-with-toggle">
    <NumberSlider
      label={tr('controls.height')}
      min={5}
      max={200}
      value={rows}
      onChange={(next) => setOptions({ rows: next })}
      onBeforeChange={() => store.commitOptionsSnapshot(tr('history.entryHeight'))}
      hueIndex={0}
      defaultValue={autoRows}
      disabled={aspectLocked}
    />
    <IconButton
      tip={tr(aspectLocked ? 'controls.aspectLocked' : 'controls.aspectUnlocked')}
      glyph={aspectLocked ? lockClosed : lockOpen}
      pressed={aspectLocked}
      onclick={toggleLock}
    />
  </div>

  <div class="control-slider">
    <div class="setting-row">
      <span>{tr('controls.charset')}</span>
      <!-- The field below is always editable, so there is no Custom option; a
           charset matching no preset leaves the select empty. Its name differs
           from the field's so the two controls can be told apart. -->
      <select
        aria-label={tr('controls.charsetPresetLabel')}
        value={preset}
        onchange={(event) => pickPreset(event.currentTarget.value as CharsetPresetKey)}
        {@attach enableSelectScroll}
      >
        {#each PRESETS as key (key)}
          <option value={key}>{tr(CHARSET_PRESET_KEYS[key])}</option>
        {/each}
      </select>
    </div>
    <textarea
      class="charset-field"
      spellcheck="false"
      aria-label={tr('controls.charset')}
      style:font-family={options.font.family}
      value={fieldText}
      onfocus={enterField}
      oninput={(event) => typeChars(event.currentTarget.value)}
      onblur={() => {
        fieldCommitted = false
        syncField()
      }}
    ></textarea>
  </div>

  <!-- A <div> rather than a <label>, which would add the info icon's name to
       the select's; the select has its own aria-label. -->
  <div class="control-slider setting-row">
    <div class="control-slider-label-row">
      <span>{tr('controls.font')}</span>
      <InfoBubble tip={tr('controls.rtfNote')} />
    </div>
    <select
      aria-label={tr('controls.font')}
      value={options.font.family}
      onchange={(event) => pickFont(event.currentTarget.value)}
      {@attach enableSelectScroll}
    >
      {#each FONT_CHOICES as choice (choice.family)}
        <option value={choice.family}>{tr(choice.key)}</option>
      {/each}
    </select>
  </div>
</div>
