<script lang="ts">
  import { onMount } from 'svelte'
  import { FieldRow, InfoBubble, Toggle, useRainbow } from '@glimstone/svelte'
  import {
    ACCENTS,
    RAINBOW,
    DEFAULT_ACCENT,
    applyAccent,
    applyRainbow,
    contrastOn,
    rainbowState,
    subscribeSystemAccent,
    systemAccent,
    SYSTEM_ACCENT,
  } from '@glimstone/core/appearance'
  import { applyDisco, discoTap } from '@glimstone/core/disco'
  import { openColorPickerPopover } from '@glimstone/core/colorPicker'
  import { discoTaps, eggs, look, persist, wipeColours } from './appearance.svelte'
  import { tr } from './live.svelte'
  import { iconAccentSystem, iconReset } from './icons'
  import type { TranslationKey } from './i18n'
  import { storeDisco } from './looks'

  const ACCENT_KEYS: Record<string, TranslationKey> = {
    Sunflower: 'appearance.accentSunflower',
    Blue: 'appearance.accentBlue',
    Green: 'appearance.accentGreen',
    Red: 'appearance.accentRed',
    Purple: 'appearance.accentPurple',
    Orange: 'appearance.accentOrange',
    Teal: 'appearance.accentTeal',
    Magenta: 'appearance.accentMagenta',
  }

  const rgb = (hex: string): [number, number, number] => {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }

  /**
   * The preset slot a colour belongs to: the nearest by plain squared RGB
   * distance, which only has to be stable across widely separated hues.
   */
  function nearestPreset(hex: string): number {
    const [r, g, b] = rgb(hex)
    let best = 0
    let bestDistance = Infinity
    ACCENTS.forEach((preset, i) => {
      const [pr, pg, pb] = rgb(preset.hex)
      const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
      if (d < bestDistance) {
        bestDistance = d
        best = i
      }
    })
    return best
  }

  const rainbow = useRainbow()
  let system = $state(systemAccent())
  onMount(() => subscribeSystemAccent(() => (system = systemAccent())))

  // The system mode belongs to no preset, even where the device has no colour
  // and the default shows.
  const live = $derived(look.accent && look.accent !== SYSTEM_ACCENT ? look.accent : DEFAULT_ACCENT)
  const selected = $derived(look.accent === SYSTEM_ACCENT ? -1 : nearestPreset(live))

  function setAccent(accent: string): void {
    look.accent = accent
    applyAccent(accent || undefined)
    persist()
  }

  // A click selects, and a click on the one already selected edits it. The
  // selected slot wears the live colour, which the picker may have moved off
  // the preset; then the hex is its name.
  function pickPreset(index: number, swatch: HTMLElement): void {
    const preset = ACCENTS[index]
    if (!preset) return
    if (index !== selected) return setAccent(preset.hex)
    openColorPickerPopover(swatch, live, setAccent, () => {})
  }

  const swatchName = (index: number, hex: string, name: string) =>
    index === selected && live.toLowerCase() !== hex.toLowerCase() ? live.toUpperCase() : tr(ACCENT_KEYS[name] ?? 'appearance.accent')

  function setRainbow(on: boolean): void {
    // Counted before the rows change, so the disco row comes with them.
    if (discoTap(discoTaps, on, { now: performance.now() })) {
      eggs.disco = true
      look.disco = true
      storeDisco(true)
    }
    // Spread the current state, or the switch would reset a custom palette.
    wipeColours()
    applyRainbow({ ...rainbowState(), on })
    persist()
    applyDisco(look.disco)
  }

  function setReactive(reactive: boolean): void {
    wipeColours()
    applyRainbow({ ...rainbowState(), reactive })
    persist()
  }

  function setRotate(rotate: boolean): void {
    const now = rainbowState()
    wipeColours()
    applyRainbow({ ...now, rotate, seed: rotate ? (now.seed + 1) % RAINBOW.length : 0 })
    persist()
    applyDisco(look.disco)
  }

  function setDisco(on: boolean): void {
    look.disco = on
    storeDisco(on)
    applyDisco(on)
  }

  // All eight are in force at once, so there is no selection and a click can
  // only mean edit. applyRainbow merges onto the defaults of the off state, so
  // the current state is spread first or an edit would switch it off.
  function editPalette(index: number, swatch: HTMLElement): void {
    const palette = [...rainbowState().palette]
    openColorPickerPopover(
      swatch,
      palette[index] ?? RAINBOW[index] ?? DEFAULT_ACCENT,
      (hex) => {
        palette[index] = hex
        applyRainbow({ ...rainbowState(), palette: [...palette] })
        persist()
        applyDisco(look.disco)
      },
      () => {},
    )
  }

  function resetPalette(): void {
    wipeColours()
    applyRainbow({ ...rainbowState(), palette: [...RAINBOW] })
    persist()
    applyDisco(look.disco)
  }
</script>

<!-- The reset at the end of a colour row stands among swatches, so it takes
     their size and shows only its glyph in every label mode. -->
{#snippet reset(onClick: () => void)}
  <button type="button" class="swatch-reset" aria-label={tr('appearance.resetToDefault')} data-tip={tr('appearance.resetToDefault')} onclick={onClick}>
    {@html iconReset()}
  </button>
{/snippet}

<div class="glim-eyebrow">{tr('settings.colours')}</div>
<div class="appearance-settings">
  <!-- The accent row stays, dimmed, while the rainbow owns the colours, since
       its value still paints what takes no hue. The bubble explains that state,
       so it stands only while it holds, outside the dimmed parts. -->
  <FieldRow label={tr('appearance.accent')}>
    {#snippet drawn()}
      <span class:is-dimmed={rainbow.current.on}>{tr('appearance.accent')}</span>
      {#if rainbow.current.on}<InfoBubble tip={tr('appearance.accentRainbowHint')} />{/if}
    {/snippet}
    <div class="accent-row" class:is-dimmed={rainbow.current.on}>
      {#if system}
        <button
          type="button"
          class="accent-swatch accent-swatch--system"
          class:accent-swatch--active={look.accent === SYSTEM_ACCENT}
          style:background-color={system}
          style:color={contrastOn(system)}
          data-tip={tr('appearance.accentSystem')}
          aria-label={tr('appearance.accentSystem')}
          aria-pressed={look.accent === SYSTEM_ACCENT}
          onclick={() => setAccent(SYSTEM_ACCENT)}
        >
          {@html iconAccentSystem()}
        </button>
      {/if}
      {#each ACCENTS as preset, i (preset.name)}
        <button
          type="button"
          class="accent-swatch"
          class:accent-swatch--active={i === selected}
          style:background-color={i === selected ? live : preset.hex}
          data-tip={swatchName(i, preset.hex, preset.name)}
          aria-label={swatchName(i, preset.hex, preset.name)}
          aria-pressed={i === selected}
          onclick={(event) => pickPreset(i, event.currentTarget)}
        ></button>
      {/each}
      {@render reset(() => setAccent(''))}
    </div>
  </FieldRow>

  <FieldRow label={tr('appearance.rainbow')}>
    <Toggle checked={rainbow.current.on} onChange={setRainbow} />
  </FieldRow>

  <!-- What hangs off the rainbow is absent while it is off, since none of it
       would answer; its own switch stays. -->
  {#if rainbow.current.on}
    <FieldRow label={tr('appearance.rainbowReactive')} hint={tr('appearance.rainbowReactiveHint')}>
      <Toggle checked={rainbow.current.reactive} onChange={setReactive} />
    </FieldRow>
    <FieldRow label={tr('appearance.rainbowRotate')} hint={tr('appearance.rainbowRotateHint')}>
      <Toggle checked={rainbow.current.rotate} onChange={setRotate} />
    </FieldRow>
    {#if eggs.disco || look.disco}
      <FieldRow label={tr('appearance.disco')} hint={tr('appearance.discoHint')}>
        <Toggle checked={look.disco} onChange={setDisco} />
      </FieldRow>
    {/if}
    <!-- The palette comes after every switch that shapes how it is used. -->
    <FieldRow label={tr('appearance.rainbowPalette')}>
      <div class="palette-swatch-row" role="group" aria-label={tr('appearance.rainbowPalette')}>
        {#each rainbow.current.palette as hex, i (i)}
          <button
            type="button"
            class="palette-swatch"
            style:background-color={hex}
            data-tip={hex.toUpperCase()}
            aria-label={hex.toUpperCase()}
            onclick={(event) => editPalette(i, event.currentTarget)}
          ></button>
        {/each}
        {@render reset(resetPalette)}
      </div>
    </FieldRow>
  {/if}
</div>
