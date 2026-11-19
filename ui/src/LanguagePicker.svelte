<script lang="ts">
  import { onMount } from 'svelte'
  import { flagEmoji } from '@glimstone/core/flagEmoji'
  import { enableWheelStep, stepIndex } from '@glimstone/core/selectScroll'
  import { tr } from './live.svelte'
  import { currentLocale, LOCALES, setLocale } from './i18n'

  // A button and listbox after BombVault's language picker, since a native
  // <select> is too small and its option list cannot be padded. It opens
  // downward, since it sits mid-page. The flag stands in its own element, as a
  // space between an emoji and text is too narrow a gap.
  const options = LOCALES.map((locale) => ({ value: locale.code, label: locale.label, flag: flagEmoji(locale.flag) }))

  let current = $state(currentLocale())
  let open = $state(false)
  let wrap: HTMLDivElement
  let trigger: HTMLButtonElement

  const chosen = $derived(options.find((o) => o.value === current))

  function select(value: string): void {
    if (value === current) return
    current = value
    void setLocale(value)
  }

  // Focus goes back to the trigger, which is what lets the wheel step the
  // value from there.
  function pick(value: string): void {
    select(value)
    open = false
    trigger.focus()
  }

  onMount(() => {
    enableWheelStep(trigger, (delta) => {
      const next = options[stepIndex(options.length, options.findIndex((o) => o.value === current), delta)]
      if (next) select(next.value)
    })
  })
</script>

<svelte:document
  onmousedown={(event) => {
    if (open && !wrap.contains(event.target as Node)) open = false
  }}
  onkeydown={(event) => {
    if (open && event.key === 'Escape') open = false
  }}
/>

<div bind:this={wrap} class="dropdown-wrap">
  <!-- A fixed accessible name, whatever value the trigger shows. -->
  <button
    bind:this={trigger}
    type="button"
    class="dropdown-trigger"
    aria-haspopup="listbox"
    aria-expanded={open}
    aria-label={tr('appearance.language')}
    onclick={() => (open = !open)}
  >
    {#if chosen}<span class="dropdown-option-flag">{chosen.flag}</span><span>{chosen.label}</span>{/if}
  </button>
  <div class="dropdown-listbox" role="listbox" aria-label={tr('appearance.language')} style:display={open ? 'block' : 'none'}>
    {#each options as option (option.value)}
      <button
        type="button"
        class="dropdown-option"
        class:dropdown-option--active={option.value === current}
        role="option"
        aria-selected={option.value === current}
        onclick={() => pick(option.value)}
      >
        <span class="dropdown-option-flag">{option.flag}</span><span>{option.label}</span>
      </button>
    {/each}
  </div>
</div>
