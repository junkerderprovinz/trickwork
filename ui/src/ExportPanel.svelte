<script lang="ts">
  import { Button, InfoBubble, useRainbow } from '@glimstone/svelte'
  import { svgSnippet, tr } from './live.svelte'
  import { iconCheck, iconCopy, iconExport } from './icons'
  import { replay } from './motion'
  import { buildOutput, exportActive, exportAllAsText, type ExportFormat } from './exporting'
  import type { Store } from './state'

  let { store }: { store: Store } = $props()

  const FORMATS: ExportFormat[] = ['txt', 'xhtml', 'rtf', 'png']
  const COPIED_FEEDBACK_MS = 1500

  const exportGlyph = svgSnippet(iconExport())
  const copyGlyph = svgSnippet(iconCopy())
  const checkGlyph = svgSnippet(iconCheck())
  const rainbow = useRainbow()

  let summary = $state('')
  let copied = $state(false)
  let copiedTimer: ReturnType<typeof setTimeout> | undefined
  let formatRow: HTMLDivElement
  let copyButton: HTMLElement | null = $state(null)

  // The button answers as well as the line under it: it lights up when the
  // file is out and shakes when there was nothing to export or it failed.
  async function exportFormat(format: ExportFormat): Promise<void> {
    const result = await exportActive(store, format)
    summary = result.message
    const button = formatRow.querySelector<HTMLElement>(`[data-format="${format}"]`)
    if (button && result.outcome) replay(button, result.outcome === 'done' ? 'glim-confirm' : 'glim-shake')
  }

  async function copy(): Promise<void> {
    const state = store.getState()
    const item = state.items.find((i) => i.id === state.activeItemId)
    if (!item) return
    const text = await (await buildOutput(item, store, 'txt')).text()
    await navigator.clipboard.writeText(text)
    clearTimeout(copiedTimer)
    copied = true
    if (copyButton) replay(copyButton, 'glim-confirm')
    copiedTimer = setTimeout(() => (copied = false), COPIED_FEEDBACK_MS)
  }

  // The formats and Copy are actions, not a selection: each owns a rainbow
  // position, but .glim-tint-hover shows it only on hover and focus.
  const hue = (index: number) => (rainbow.current.on ? { hueIndex: index } : {})
</script>

<!-- The info bubble beside the eyebrow explains that TXT carries no colour. -->
<div class="eyebrow-row">
  <span class="glim-eyebrow">{tr('export.eyebrow')}</span>
  <InfoBubble tip={tr('controls.colorTxtNote')} />
</div>
<div class="export-panel">
  <!-- Copying the text is an export too, so Copy sits at the end of the format row. -->
  <div bind:this={formatRow} class="export-format-row">
    {#each FORMATS as format, index (format)}
      <!-- The format is the label's content rather than a verb, so it shows in
           every mode; the accessible name is the full sentence. -->
      <Button
        data-format={format}
        label={format.toUpperCase()}
        labelKey={null}
        glyph={exportGlyph}
        tone="subtle"
        keepLabel
        {...hue(index)}
        class="glim-tint-hover"
        aria-label={tr('export.formatAriaLabel', { format: format.toUpperCase() })}
        title={tr('export.formatAriaLabel', { format: format.toUpperCase() })}
        onClick={() => void exportFormat(format)}
      />
    {/each}
    <Button
      bind:ref={copyButton}
      label={copied ? tr('preview.copied') : tr('preview.copy')}
      labelKey={null}
      glyph={copied ? checkGlyph : copyGlyph}
      tone="subtle"
      variant="icon"
      {...hue(FORMATS.length)}
      class={copied ? 'glim-tint-hover is-copied' : 'glim-tint-hover'}
      onClick={() => void copy()}
    />
  </div>
  <Button
    label={tr('export.batchButton')}
    labelKey={null}
    glyph={exportGlyph}
    tone="subtle"
    onClick={() => void exportAllAsText(store).then((message) => (summary = message))}
  />
  <p class="export-summary">{summary}</p>
</div>
