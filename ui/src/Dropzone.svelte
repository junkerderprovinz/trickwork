<script lang="ts">
  import { iconUpload } from './icons'
  import { tr } from './live.svelte'
  import type { Store } from './state'

  let { store }: { store: Store } = $props()

  let input: HTMLInputElement
  let active = $state(false)

  function take(files: FileList | null | undefined): void {
    const list = Array.from(files ?? [])
    if (list.length > 0) void store.addFiles(list)
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      input.click()
    }
  }

  function onDrop(event: DragEvent): void {
    event.preventDefault()
    active = false
    take(event.dataTransfer?.files)
  }
</script>

<div class="glim-eyebrow glim-hue glim-notch-hue">{tr('import.eyebrow')}</div>
<div
  class="dropzone glim-well"
  class:dropzone--active={active}
  tabindex="0"
  role="button"
  aria-label={tr('import.ariaLabel')}
  onclick={() => input.click()}
  onkeydown={onKeydown}
  ondragover={(event) => {
    event.preventDefault()
    active = true
  }}
  ondragleave={() => (active = false)}
  ondrop={onDrop}
>
  <div class="dropzone-icon">{@html iconUpload()}</div>
  <span class="dropzone-text">{tr('import.dropzoneText')}</span>
</div>
<input
  bind:this={input}
  type="file"
  accept="image/*"
  multiple
  style="display: none"
  onchange={() => {
    take(input.files)
    input.value = ''
  }}
/>
