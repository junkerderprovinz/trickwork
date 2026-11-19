<script lang="ts">
  import { onMount } from 'svelte'
  import { computeLuminanceHistogram, type LevelsSpec } from 'trickwork-core'
  import { Button } from '@glimstone/svelte'
  import { liveState, svgSnippet, tr } from './live.svelte'
  import { iconReset } from './icons'
  import type { Store } from './state'

  // ASCGen2's Levels control, a histogram with black, gamma and white handles,
  // shown inside the Filters card instead of a separate dialog.
  let { store }: { store: Store } = $props()
  // The app hands every panel the one store it keeps for its whole life.
  // svelte-ignore state_referenced_locally
  const live = liveState(store)

  const IDENTITY: LevelsSpec = { black: 0, gamma: 1, white: 255 }
  const MIN_GAMMA = 0.1
  const MAX_GAMMA = 9.99

  const levels = $derived(live.current.options.levels ?? IDENTITY)
  const current = () => store.getState().options.levels ?? IDENTITY

  /**
   * Where the midtone handle sits on the 0..255 track: the input applyLevels
   * maps to 0.5, which is 0.5^gamma of the span. A gamma above 1 pulls it
   * toward black, as Photoshop's gray point moves.
   */
  const gammaPosition = (l: LevelsSpec) => l.black + (l.white - l.black) * Math.pow(0.5, l.gamma)

  function gammaAt(pos: number, black: number, white: number): number {
    const span = white - black || 1
    const normalized = Math.min(1 - 1e-4, Math.max(1e-4, (pos - black) / span))
    return Math.min(MAX_GAMMA, Math.max(MIN_GAMMA, Math.log(normalized) / Math.log(0.5)))
  }

  function set(patch: Partial<LevelsSpec>): void {
    store.setState({ options: { ...store.getState().options, levels: { ...current(), ...patch } } })
  }

  // One undo step per drag or keyboard gesture, as on the sliders.
  let committed = false
  function gestureStart(): void {
    if (committed) return
    committed = true
    store.commitOptionsSnapshot(tr('history.entryLevels'))
  }

  // A double-click resets one handle; the Reset button resets all three.
  function resetOne(key: keyof LevelsSpec): void {
    if (current()[key] === IDENTITY[key]) return
    store.commitOptionsSnapshot(tr('history.entryLevels'))
    set({ [key]: IDENTITY[key] })
  }

  // A handle pushed past its neighbour stops there, and the thumb with it.
  function clamp(handle: HTMLInputElement, key: 'black' | 'white', value: number): void {
    set({ [key]: value })
    handle.value = String(value)
  }

  function resetAll(): void {
    store.commitOptionsSnapshot(tr('history.entryLevelsReset'))
    set({ ...IDENTITY })
  }

  const title = $derived(
    `${tr('controls.levelsBlack')}: ${levels.black} · ${tr('controls.levelsGamma')}: ${levels.gamma.toFixed(2)} · ${tr('controls.levelsWhite')}: ${levels.white}`,
  )

  let canvas: HTMLCanvasElement
  // The histogram depends on the active image only.
  const activeImage = $derived.by(() => {
    const state = live.current
    const active = state.items.find((item) => item.id === state.activeItemId)
    return active?.imageData ?? null
  })
  let lastImage: ImageData | null = null
  let counts: Uint32Array | null = null

  function draw(): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // The buffer follows the laid-out CSS box times the device pixel ratio,
    // since a canvas stretched by CSS or drawn at 1x on a scaled display blurs.
    const width = canvas.clientWidth || 280
    const height = canvas.clientHeight || 84
    const dpr = window.devicePixelRatio || 1
    const bufferWidth = Math.round(width * dpr)
    const bufferHeight = Math.round(height * dpr)
    if (canvas.width !== bufferWidth) canvas.width = bufferWidth
    if (canvas.height !== bufferHeight) canvas.height = bufferHeight
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    if (!counts) return
    const max = Math.max(1, ...counts)
    const barWidth = width / 256
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#FCC419'
    // Log scale, so the long tail of small counts stays visible next to the few
    // tall peaks of a photo.
    const logMax = Math.log1p(max)
    for (let bucket = 0; bucket < 256; bucket++) {
      const count = counts[bucket] ?? 0
      if (count === 0) continue
      const barHeight = Math.max(2, Math.round((Math.log1p(count) / logMax) * height))
      ctx.fillRect(bucket * barWidth, height - barHeight, Math.max(1, barWidth), barHeight)
    }
  }

  $effect(() => {
    const image = activeImage
    if (image === lastImage) return
    lastImage = image
    counts = image ? computeLuminanceHistogram(image) : null
    draw()
  })

  // clientWidth is 0 until layout, so draw again after the first frame.
  onMount(() => void requestAnimationFrame(draw))

  const resetGlyph = svgSnippet(iconReset())
</script>

<div class="control-slider">
  <div class="levels-caption-row">
    <span>{tr('controls.levels')}</span>
    <Button label={tr('controls.levelsReset')} labelKey={null} glyph={resetGlyph} variant="icon" tone="subtle" onClick={resetAll} />
  </div>
  <!-- The well frames only the histogram; the handles sit on the card surface. -->
  <div class="levels-canvas-wrap glim-well">
    <canvas bind:this={canvas} class="levels-histogram"></canvas>
  </div>
  <div class="levels-track">
    <input
      type="range"
      class="levels-handle-input levels-handle-input--black"
      min="0"
      max="255"
      value={levels.black}
      {title}
      aria-label={tr('controls.levelsBlack')}
      onpointerdown={gestureStart}
      onkeydown={gestureStart}
      onblur={() => (committed = false)}
      oninput={(event) => clamp(event.currentTarget, 'black', Math.min(Number(event.currentTarget.value), current().white - 1))}
      ondblclick={() => resetOne('black')}
    />
    <!-- The gamma handle stays between the black and white points. -->
    <input
      type="range"
      class="levels-handle-input levels-handle-input--gamma"
      min={levels.black}
      max={levels.white}
      value={Math.round(gammaPosition(levels))}
      {title}
      aria-label={tr('controls.levelsGamma')}
      onpointerdown={gestureStart}
      onkeydown={gestureStart}
      onblur={() => (committed = false)}
      oninput={(event) => set({ gamma: gammaAt(Number(event.currentTarget.value), current().black, current().white) })}
      ondblclick={() => resetOne('gamma')}
    />
    <input
      type="range"
      class="levels-handle-input levels-handle-input--white"
      min="0"
      max="255"
      value={levels.white}
      {title}
      aria-label={tr('controls.levelsWhite')}
      onpointerdown={gestureStart}
      onkeydown={gestureStart}
      onblur={() => (committed = false)}
      oninput={(event) => clamp(event.currentTarget, 'white', Math.max(Number(event.currentTarget.value), current().black + 1))}
      ondblclick={() => resetOne('white')}
    />
  </div>
  <!-- The values stay visible rather than behind a hover, as in ASCGen2. -->
  <div class="levels-readout-row">
    <span class="levels-readout levels-readout--black glim-num">{levels.black}</span>
    <span class="levels-readout levels-readout--gamma glim-num">{levels.gamma.toFixed(2)}</span>
    <span class="levels-readout levels-readout--white glim-num">{levels.white}</span>
  </div>
</div>
