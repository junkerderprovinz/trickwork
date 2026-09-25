import {
  applyImageFilters,
  assembleGrid,
  buildFontWidthTable,
  createCanvasGlyphMeasurer,
  createCanvasWidthMeasurer,
  measureCellSize,
  toImage,
  toRTF,
  toText,
  toXHTML,
} from 'trickwork-core'
import { downloadBlob } from './download'
import { applyHueVars, glimButton, updateButton } from './controlWidgets'
import { subscribeRainbow } from './design/appearance'
import { infoIcon } from './design/tooltip'
import { iconCheck, iconCopy, iconDownload } from './icons'
import { subscribeLocale, t } from './i18n'
import { replay } from './motion'
import type { BatchItem, Store } from './state'

type ExportFormat = 'txt' | 'xhtml' | 'rtf' | 'png'

const COPIED_FEEDBACK_MS = 1500

export function mountExportPanel(container: HTMLElement, store: Store): void {
  // The info bubble beside the eyebrow explains that TXT carries no colour.
  const eyebrowRow = document.createElement('div')
  eyebrowRow.className = 'eyebrow-row'
  const eyebrow = document.createElement('span')
  eyebrow.className = 'glim-eyebrow'
  const eyebrowInfo = infoIcon('')
  eyebrowRow.append(eyebrow, eyebrowInfo)
  container.appendChild(eyebrowRow)

  const panel = document.createElement('div')
  panel.className = 'export-panel'

  const summary = document.createElement('p')
  summary.className = 'export-summary'

  // Copying the text is an export too, so Copy sits at the end of the format
  // row.
  const copyButton = glimButton({ label: t('preview.copy'), glyph: iconCopy(), variant: 'icon' })

  const formatRow = document.createElement('div')
  formatRow.className = 'export-format-row'
  const formatButtons: { format: ExportFormat; button: HTMLButtonElement }[] = []
  ;(['txt', 'xhtml', 'rtf', 'png'] as ExportFormat[]).forEach((format, index) => {
    // The format is the label's content rather than a verb, so it shows in
    // every mode.
    const button: HTMLButtonElement = glimButton({
      label: format.toUpperCase(),
      keepLabel: true,
      stage: 'none',
      onClick: () => void exportActive(store, format, summary, button),
    })
    formatRow.appendChild(button)
    formatButtons.push({ format, button })
  })
  formatRow.appendChild(copyButton)
  // The formats and Copy are actions, not a selection: each owns a rainbow
  // position, but .glim-tint-hover shows it only on hover and focus.
  ;[...formatButtons.map((f) => f.button), copyButton].forEach((button, index) => {
    if (applyHueVars(button, index)) button.classList.add('glim-hue', 'glim-tint-hover')
  })
  panel.appendChild(formatRow)

  const batchButton = glimButton({
    label: t('export.batchButton'),
    glyph: iconDownload(),
    onClick: () => void exportAllAsText(store, summary),
  })
  panel.appendChild(batchButton)

  panel.appendChild(summary)
  container.appendChild(panel)

  let copiedFeedbackTimer: ReturnType<typeof setTimeout> | null = null

  function applyLabels(): void {
    eyebrow.textContent = t('export.eyebrow')
    for (const { format, button } of formatButtons) {
      // The accessible name is the full sentence; the visible label stays the
      // short format code.
      const label = t('export.formatAriaLabel', { format: format.toUpperCase() })
      button.setAttribute('aria-label', label)
      button.title = label
    }
    updateButton(batchButton, { label: t('export.batchButton') })
    eyebrowInfo.setAttribute('data-tip', t('controls.colorTxtNote'))
    eyebrowInfo.setAttribute('aria-label', t('controls.colorTxtNote'))
    // Skipped while "copied" shows, or a locale switch would cut it short.
    if (!copiedFeedbackTimer) updateButton(copyButton, { label: t('preview.copy') })
  }
  applyLabels()
  subscribeLocale(applyLabels)

  copyButton.addEventListener('click', () => {
    const state = store.getState()
    const item = state.items.find((i) => i.id === state.activeItemId)
    if (!item) return
    void buildOutput(item, store, 'txt')
      .then((blob) => blob.text())
      .then((text) => navigator.clipboard.writeText(text))
      .then(() => {
        if (copiedFeedbackTimer) clearTimeout(copiedFeedbackTimer)
        updateButton(copyButton, { label: t('preview.copied'), glyph: iconCheck() })
        copyButton.classList.add('is-copied')
        replay(copyButton, 'glim-confirm')
        copiedFeedbackTimer = setTimeout(() => {
          copiedFeedbackTimer = null
          updateButton(copyButton, { label: t('preview.copy'), glyph: iconCopy() })
          copyButton.classList.remove('is-copied')
        }, COPIED_FEEDBACK_MS)
      })
  })

  // These buttons are built once, so a palette edit or a mode switch has to
  // re-apply the hue vars.
  function syncRainbow(): void {
    ;[...formatButtons.map((f) => f.button), copyButton].forEach((button, index) => {
      const applied = applyHueVars(button, index)
      button.classList.toggle('glim-hue', applied)
      button.classList.toggle('glim-tint-hover', applied)
    })
  }
  subscribeRainbow(syncRainbow)
}

async function buildOutput(item: BatchItem, store: Store, format: ExportFormat): Promise<Blob> {
  if (!item.imageData) {
    throw new Error(`buildOutput: item "${item.file.name}" has no decoded image data`)
  }
  const options = store.getState().options
  const measure = createCanvasGlyphMeasurer()
  const table = buildFontWidthTable(options.charset, options.font, measure)
  const transformed = applyImageFilters(item.imageData, options)
  const grid = assembleGrid(transformed, table, options)

  switch (format) {
    case 'txt':
      return new Blob([toText(grid)], { type: 'text/plain' })
    case 'xhtml':
      // Black on white, like the preview.
      return new Blob([toXHTML(grid, { background: '#ffffff', foreground: '#000000' })], {
        type: 'application/xhtml+xml',
      })
    case 'rtf':
      return new Blob([toRTF(grid)], { type: 'application/rtf' })
    case 'png':
      // The PNG renders with the selected font, so its cell pitch comes from
      // that font too.
      return toImage(
        grid,
        {
          ...measureCellSize(options.font, createCanvasWidthMeasurer()),
          background: '#ffffff',
          foreground: '#000000',
        },
        (w, h) => {
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          return {
            width: w,
            height: h,
            getContext: (kind) => canvas.getContext(kind),
            convertToBlob: (opts) =>
              new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                  if (blob) resolve(blob)
                  else reject(new Error('canvas.toBlob returned null'))
                }, opts?.type ?? 'image/png')
              }),
          }
        },
      )
  }
}

// The button answers as well as the line under it: it lights up when the file
// is out and shakes when there was nothing to export or it failed.
async function exportActive(store: Store, format: ExportFormat, summary: HTMLElement, button: HTMLElement): Promise<void> {
  const state = store.getState()
  const item = state.items.find((i) => i.id === state.activeItemId)
  if (!item) {
    summary.textContent = t('export.noActiveImage')
    replay(button, 'glim-shake')
    return
  }
  try {
    const blob = await buildOutput(item, store, format)
    const delivered = await downloadBlob(blob, `${item.file.name}.${format}`)
    if (!delivered) {
      summary.textContent = t('export.cancelled', { name: item.file.name })
      return
    }
    store.updateItem(item.id, { status: 'exported' })
    summary.textContent = t('export.exported', { name: item.file.name, format: format.toUpperCase() })
    replay(button, 'glim-confirm')
  } catch (error) {
    summary.textContent = t('export.failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    replay(button, 'glim-shake')
  }
}

async function exportAllAsText(store: Store, summary: HTMLElement): Promise<void> {
  const state = store.getState()
  let succeeded = 0
  let failed = 0
  let cancelled = 0
  for (const item of state.items) {
    if (item.status !== 'converted' && item.status !== 'exported') continue
    try {
      const blob = await buildOutput(item, store, 'txt')
      // One failing item does not abort the rest of the batch.
      if (await downloadBlob(blob, `${item.file.name}.txt`)) {
        store.updateItem(item.id, { status: 'exported' })
        succeeded++
      } else {
        cancelled++
      }
    } catch {
      failed++
    }
  }
  const cancelledSuffix = cancelled > 0 ? t('export.batchCancelledSuffix', { cancelled }) : ''
  summary.textContent = t('export.batchSummary', { succeeded, failed, cancelledSuffix })
}
