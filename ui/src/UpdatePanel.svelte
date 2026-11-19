<script lang="ts">
  import { onMount } from 'svelte'
  import { FieldRow, Toggle } from '@glimstone/svelte'
  import { tr } from './live.svelte'
  import { showToast } from './toast'
  import { callApp, isFlatpak } from './wails'

  // The Updates card in the desktop build's General tab. The setting itself
  // lives on the Go side, which reads it before this page has loaded. A Flatpak
  // cannot replace itself, so there the switch stays off and says why.
  let on = $state(true)
  let flatpak = $state(false)
  let shakes = $state(0)

  // The switch moves at once; a refused save puts it back, shakes it and says
  // why in a toast.
  async function save(checked: boolean): Promise<void> {
    const before = on
    on = checked
    try {
      await callApp('SetAutoUpdate', checked)
    } catch {
      on = before
      shakes++
      showToast(tr('update.saveFailed'), 'fail')
    }
  }

  onMount(() => {
    void Promise.all([callApp<boolean>('AutoUpdate'), isFlatpak()]).then(([value, sandboxed]) => {
      on = value
      flatpak = sandboxed
    })
  })
</script>

<div class="glim-eyebrow">{tr('update.title')}</div>
<div class="control-slider">
  <FieldRow label={tr('update.auto')} hint={tr(flatpak ? 'update.flatpakHint' : 'update.autoHint')}>
    {#key shakes}
      <Toggle checked={on} disabled={flatpak} class={shakes ? 'glim-shake' : ''} onChange={(next) => void save(next)} />
    {/key}
  </FieldRow>
</div>
