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
import { applyHueVars } from './controlWidgets'
import { subscribeRainbow } from './design/appearance'
import { infoIcon } from './design/tooltip'
import { subscribeLocale, t } from './i18n'
import type { BatchItem, Store } from './state'

type ExportFormat = 'txt' | 'xhtml' | 'rtf' | 'png'

export function mountExportPanel(container: HTMLElement, store: Store): void {
  // Eyebrow + info icon share a row (GlimStone rule 8: explanations live in
  // a bubble, not printed under the control) - the TXT-carries-no-colour
  // caveat used to be an always-visible paragraph under the button row.
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

  const formatRow = document.createElement('div')
  formatRow.className = 'export-format-row'
  const formatButtons: { format: ExportFormat; button: HTMLButtonElement }[] = []
  ;(['txt', 'xhtml', 'rtf', 'png'] as ExportFormat[]).forEach((format, index) => {
    const button = document.createElement('button')
    button.textContent = format.toUpperCase()
    button.addEventListener('click', () => void exportActive(store, format, summary))
    // The four formats are an equal-member set (jdp: "die ganzen badges und
    // schaltflächen werden nicht eingefärbt") - each owns a fixed rainbow
    // position, applied once at mount and re-applied on toggle (these
    // buttons are never rebuilt the way a panel's own build() is).
    if (applyHueVars(button, index)) button.classList.add('glim-hue', 'glim-tint')
    formatRow.appendChild(button)
    formatButtons.push({ format, button })
  })
  panel.appendChild(formatRow)

  const batchButton = document.createElement('button')
  batchButton.className = 'export-batch-button'
  batchButton.addEventListener('click', () => void exportAllAsText(store, summary))
  panel.appendChild(batchButton)

  panel.appendChild(summary)
  container.appendChild(panel)

  function applyLabels(): void {
    eyebrow.textContent = t('export.eyebrow')
    for (const { format, button } of formatButtons) {
      // aria-label carries the full sentence as the accessible name (what
      // screen readers and Playwright's getByRole both read), while the
      // visible label stays a compact format code.
      const label = t('export.formatAriaLabel', { format: format.toUpperCase() })
      button.setAttribute('aria-label', label)
      button.title = label
    }
    batchButton.textContent = t('export.batchButton')
    eyebrowInfo.setAttribute('data-tip', t('controls.colorTxtNote'))
    eyebrowInfo.setAttribute('aria-label', t('controls.colorTxtNote'))
  }
  applyLabels()
  subscribeLocale(applyLabels)

  // Unlike a panel with its own build(), these buttons are created once and
  // never torn down - re-applying the hue vars is what picks up a palette
  // edit or a mode toggle (applyHueVars() itself is idempotent and a no-op
  // once rainbow is off, so this is safe to call unconditionally).
  function syncRainbow(): void {
    formatButtons.forEach(({ button }, index) => {
      const applied = applyHueVars(button, index)
      button.classList.toggle('glim-hue', applied)
      button.classList.toggle('glim-tint', applied)
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
      // White page / black ink, matching the live preview and RTF's implicit
      // white-page default - see preview.ts.
      return new Blob([toXHTML(grid, { background: '#ffffff', foreground: '#000000' })], {
        type: 'application/xhtml+xml',
      })
    case 'rtf':
      return new Blob([toRTF(grid)], { type: 'application/rtf' })
    case 'png':
      // The PNG is the one export that renders with the actual selected font,
      // so its cell pitch has to come from that font too — a fixed 8x16px grid
      // overlapped the proportional stacks badly (Georgia/Arial measure ~14px
      // wide at a 14px font size, not 8px).
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

async function exportActive(store: Store, format: ExportFormat, summary: HTMLElement): Promise<void> {
  const state = store.getState()
  const item = state.items.find((i) => i.id === state.activeItemId)
  if (!item) {
    summary.textContent = t('export.noActiveImage')
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
  } catch (error) {
    summary.textContent = t('export.failed', {
      error: error instanceof Error ? error.message : String(error),
    })
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
      // One item erroring must never abort the rest of the batch (spec §6).
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
