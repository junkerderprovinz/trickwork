<script lang="ts">
  import { Button } from '@glimstone/svelte'
  import { svgSnippet, tr } from './live.svelte'
  import { downloadBlob } from './download'
  import { iconExport, iconImport } from './icons'
  import { replay } from './motion'
  import { parsePresetFile, PRESET_FORMAT_VERSION, type PresetFile } from './presets'
  import type { Store } from './state'

  let { store }: { store: Store } = $props()

  let summary = $state('')
  let exportButton: HTMLElement | null = $state(null)
  let importButton: HTMLElement | null = $state(null)
  let fileInput: HTMLInputElement

  async function exportPreset(): Promise<void> {
    const file: PresetFile = { trickworkPreset: PRESET_FORMAT_VERSION, options: store.getState().options }
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
    const delivered = await downloadBlob(blob, 'trickwork-preset.json')
    summary = tr(delivered ? 'presets.exported' : 'presets.exportCancelled')
    if (delivered && exportButton) replay(exportButton, 'glim-confirm')
  }

  async function importPreset(): Promise<void> {
    const file = fileInput.files?.[0]
    fileInput.value = ''
    if (!file) return
    const options = parsePresetFile(await file.text())
    if (!options) {
      summary = tr('presets.importInvalid')
      if (importButton) replay(importButton, 'glim-shake')
      return
    }
    // replaceOptions records an undo step and re-syncs every control.
    store.replaceOptions(options, tr('history.entrySettingsImported'))
    summary = tr('presets.imported')
    if (importButton) replay(importButton, 'glim-confirm')
  }
</script>

<div class="glim-eyebrow">{tr('presets.eyebrow')}</div>
<div class="presets-panel">
  <p class="controls-note">{summary}</p>
  <input
    bind:this={fileInput}
    type="file"
    accept="application/json,.json"
    style:display="none"
    aria-label={tr('presets.importButton')}
    onchange={() => void importPreset()}
  />
  <div class="presets-button-row">
    <Button bind:ref={exportButton} label={tr('presets.exportButton')} labelKey={null} glyph={svgSnippet(iconExport())} tone="subtle" onClick={() => void exportPreset()} />
    <Button bind:ref={importButton} label={tr('presets.importButton')} labelKey={null} glyph={svgSnippet(iconImport())} tone="subtle" onClick={() => fileInput.click()} />
  </div>
</div>
