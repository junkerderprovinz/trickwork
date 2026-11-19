<script lang="ts">
  import { onMount } from 'svelte'
  import { normalizeRotation, type Rotation } from 'trickwork-core'
  import { Selector } from '@glimstone/svelte'
  import { enableWheelStep } from '@glimstone/core/selectScroll'
  import { liveState, svgSnippet, tr } from './live.svelte'
  import { iconFlipHorizontal, iconFlipVertical } from './icons'
  import type { TranslationKey } from './i18n'
  import { replay } from './motion'
  import type { Store } from './state'

  let { store }: { store: Store } = $props()
  // The app hands every panel the one store it keeps for its whole life.
  // svelte-ignore state_referenced_locally
  const live = liveState(store)

  const ROTATIONS: { value: Rotation; key: TranslationKey }[] = [
    { value: 0, key: 'controls.rotate0' },
    { value: 90, key: 'controls.rotate90' },
    { value: 180, key: 'controls.rotate180' },
    { value: 270, key: 'controls.rotate270' },
  ]

  /** A turn in tenths of a degree within [0, 360), the precision the field offers. */
  const tidyTurn = (degrees: number) => normalizeRotation(Math.round(normalizeRotation(degrees) * 10) / 10)
  const isStep = (turn: number) => ROTATIONS.some((r) => r.value === turn)
  const storedTurn = () => tidyTurn(store.getState().options.rotate ?? 0)

  /** The typed angle, or null. A comma counts as a decimal point. */
  function parseTurn(text: string): number | null {
    const trimmed = text.trim().replace(',', '.').replace('°', '')
    if (!/^[-−]?\d+(\.\d*)?$/.test(trimmed)) return null
    return tidyTurn(Number(trimmed.replace('−', '-')))
  }

  function setTurn(turn: number): void {
    store.setState({ options: { ...store.getState().options, rotate: turn } })
  }

  // The four steps keep the card's width, and a field for any other angle
  // stands at the end of the row below: a valid angle in the field takes the
  // selection away from the steps, and a step clears the field.
  let fieldText = $state('')
  let fieldActive = $state(false)
  let fieldInvalid = $state(false)
  let field: HTMLSpanElement
  let input: HTMLInputElement

  function syncField(): void {
    const turn = storedTurn()
    fieldText = isStep(turn) ? '' : String(turn)
    fieldActive = !isStep(turn)
    fieldInvalid = false
  }
  syncField()

  const step = $derived.by(() => {
    const turn = tidyTurn(live.current.options.rotate ?? 0)
    return !fieldActive && isStep(turn) ? String(turn) : null
  })

  function pickStep(value: string): void {
    store.commitOptionsSnapshot(tr('history.entryRotated', { deg: value }))
    setTurn(Number(value))
    fieldText = ''
    fieldActive = false
    fieldInvalid = false
  }

  // One undo step per visit to the field, not per keystroke.
  let committed = false
  function apply(next: number): void {
    if (!committed) {
      committed = true
      store.commitOptionsSnapshot(tr('history.entryRotated', { deg: next }))
    }
    setTurn(next)
    fieldActive = true
    fieldInvalid = false
  }

  function nudge(by: number): void {
    const next = tidyTurn((store.getState().options.rotate ?? 0) + by)
    fieldText = String(next)
    apply(next)
  }

  function typed(text: string): void {
    fieldText = text
    const next = parseTurn(text)
    if (next !== null) apply(next)
    else fieldInvalid = text.trim() !== ''
  }

  function key(event: KeyboardEvent): void {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      nudge((event.key === 'ArrowUp' ? 1 : -1) * (event.shiftKey ? 15 : 1))
    } else if (event.key === 'Enter') {
      input.blur()
    }
  }

  // Leaving the field shows the angle as stored, so -15 reads 345, and hands a
  // quarter turn back to its step. Text that is no angle is refused visibly.
  function leave(): void {
    committed = false
    if (fieldInvalid) replay(field, 'glim-shake')
    syncField()
  }

  const flipItems = $derived([
    { id: 'flipHorizontal', label: tr('controls.flipHorizontal'), glyph: svgSnippet(iconFlipHorizontal()), iconOnly: true },
    { id: 'flipVertical', label: tr('controls.flipVertical'), glyph: svgSnippet(iconFlipVertical()), iconOnly: true },
  ])
  const flips = $derived(
    (['flipHorizontal', 'flipVertical'] as const).filter((id) => live.current.options[id]),
  )

  function toggleFlips(next: string[]): void {
    const options = store.getState().options
    const flipHorizontal = next.includes('flipHorizontal')
    const flipVertical = next.includes('flipVertical')
    store.commitOptionsSnapshot(
      tr(flipHorizontal !== !!options.flipHorizontal ? 'history.entryFlipHorizontal' : 'history.entryFlipVertical'),
    )
    store.setState({ options: { ...options, flipHorizontal, flipVertical } })
  }

  onMount(() => {
    enableWheelStep(input, (delta) => nudge(-delta))
    // An undo or redo can bring back an angle the field has to show.
    return store.subscribeHistory(syncField)
  })
</script>

<div class="glim-eyebrow">{tr('tabs.transform')}</div>
<div class="controls">
  <div class="control-slider">
    <span>{tr('controls.rotate')}</span>
    <Selector
      items={ROTATIONS.map((r) => ({ id: String(r.value), label: tr(r.key) }))}
      label={tr('controls.rotate')}
      value={step}
      onChange={pickStep}
      buttonHeight
    />
  </div>
  <div class="icon-toggle-row">
    <Selector items={flipItems} label={tr('tabs.transform')} select="many" variant="chip" inline value={flips} onChange={toggleFlips} />
    <span bind:this={field} class="free-value">
      <input
        bind:this={input}
        type="text"
        inputmode="decimal"
        aria-label={tr('controls.rotateFree')}
        class:is-active={fieldActive}
        class:is-invalid={fieldInvalid}
        value={fieldText}
        oninput={(event) => typed(event.currentTarget.value)}
        onkeydown={key}
        onblur={leave}
      />
      <span class="free-value-unit" aria-hidden="true">°</span>
    </span>
  </div>
</div>
