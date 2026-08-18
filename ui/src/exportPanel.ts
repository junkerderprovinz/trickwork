import {
  assembleGrid,
  buildFontWidthTable,
  createCanvasGlyphMeasurer,
  toImage,
  toRTF,
  toText,
  toXHTML,
} from 'ascii-supergenerator-core'
import type { BatchItem, Store } from './state'

type ExportFormat = 'txt' | 'xhtml' | 'rtf' | 'png'

const EXPORT_CELL_WIDTH_PX = 8
const EXPORT_CELL_HEIGHT_PX = 16

export function mountExportPanel(container: HTMLElement, store: Store): void {
  const panel = document.createElement('div')
  panel.className = 'export-panel'

  const summary = document.createElement('p')
  summary.className = 'export-summary'

  for (const format of ['txt', 'xhtml', 'rtf', 'png'] as ExportFormat[]) {
    const button = document.createElement('button')
    button.textContent = `Export active image as ${format.toUpperCase()}`
    button.addEventListener('click', () => void exportActive(store, format, summary))
    panel.appendChild(button)
  }

  const batchButton = document.createElement('button')
  batchButton.textContent = 'Export all queued images as TXT'
  batchButton.addEventListener('click', () => void exportAllAsText(store, summary))
  panel.appendChild(batchButton)

  panel.appendChild(summary)
  container.appendChild(panel)
}

async function buildOutput(item: BatchItem, store: Store, format: ExportFormat): Promise<Blob> {
  if (!item.imageData) {
    throw new Error(`buildOutput: item "${item.file.name}" has no decoded image data`)
  }
  const options = store.getState().options
  const measure = createCanvasGlyphMeasurer()
  const table = buildFontWidthTable(options.charset, options.font, measure)
  const grid = assembleGrid(item.imageData, table, options)

  switch (format) {
    case 'txt':
      return new Blob([toText(grid)], { type: 'text/plain' })
    case 'xhtml':
      return new Blob([toXHTML(grid, { background: '#000000', foreground: '#ffffff' })], {
        type: 'application/xhtml+xml',
      })
    case 'rtf':
      return new Blob([toRTF(grid)], { type: 'application/rtf' })
    case 'png':
      return toImage(
        grid,
        {
          cellWidthPx: EXPORT_CELL_WIDTH_PX,
          cellHeightPx: EXPORT_CELL_HEIGHT_PX,
          background: '#000000',
          foreground: '#ffffff',
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

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function exportActive(store: Store, format: ExportFormat, summary: HTMLElement): Promise<void> {
  const state = store.getState()
  const item = state.items.find((i) => i.id === state.activeItemId)
  if (!item) {
    summary.textContent = 'No active image to export.'
    return
  }
  try {
    const blob = await buildOutput(item, store, format)
    downloadBlob(blob, `${item.file.name}.${format}`)
    store.updateItem(item.id, { status: 'exported' })
    summary.textContent = `Exported "${item.file.name}" as ${format.toUpperCase()}.`
  } catch (error) {
    summary.textContent = `Export failed: ${error instanceof Error ? error.message : String(error)}`
  }
}

async function exportAllAsText(store: Store, summary: HTMLElement): Promise<void> {
  const state = store.getState()
  let succeeded = 0
  let failed = 0
  for (const item of state.items) {
    if (item.status !== 'converted' && item.status !== 'exported') continue
    try {
      const blob = await buildOutput(item, store, 'txt')
      downloadBlob(blob, `${item.file.name}.txt`)
      store.updateItem(item.id, { status: 'exported' })
      succeeded++
    } catch {
      failed++
    }
  }
  summary.textContent = `Batch export: ${succeeded} succeeded, ${failed} failed.`
}
