<script lang="ts">
  import { useRainbow } from '@glimstone/svelte'
  import { hueVars } from '@glimstone/core/appearance'

  // `onBeforeChange` fires once per drag or keyboard gesture, from the first
  // pointerdown or keydown until blur, so a whole drag undoes as one step.
  let {
    label,
    min,
    max,
    value,
    step = 1,
    onChange,
    onBeforeChange,
    hueIndex,
    defaultValue,
    disabled = false,
  }: {
    label: string
    min: number
    max: number
    value: number
    step?: number
    onChange: (value: number) => void
    onBeforeChange?: () => void
    /** Colours the thumb, which reads --accent. */
    hueIndex?: number
    /** A double-click on the thumb resets to this. */
    defaultValue: number
    disabled?: boolean
  } = $props()

  const rainbow = useRainbow()
  const hued = $derived(hueIndex !== undefined && rainbow.current.on)
  const hueStyle = $derived(
    hued && hueIndex !== undefined
      ? Object.entries(hueVars(hueIndex))
          .map(([prop, v]) => `${prop}: ${v}`)
          .join('; ')
      : undefined,
  )

  let committed = false
  function gestureStart(): void {
    if (committed) return
    committed = true
    onBeforeChange?.()
  }

  // The reset is an undo step of its own.
  function reset(): void {
    if (value === defaultValue) return
    onBeforeChange?.()
    onChange(defaultValue)
  }
</script>

<label class="control-slider">
  <div class="control-slider-row">
    <span>{label}</span>
    <span class="control-slider-value glim-num">{value}</span>
  </div>
  <input
    type="range"
    {min}
    {max}
    {step}
    {value}
    {disabled}
    class:glim-hue={hued}
    style={hueStyle}
    onpointerdown={gestureStart}
    onkeydown={gestureStart}
    onblur={() => (committed = false)}
    oninput={(event) => onChange(Number(event.currentTarget.value))}
    ondblclick={reset}
  />
</label>
