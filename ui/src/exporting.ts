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
import { t } from './i18n'
import type { BatchItem, Store } from './state'

export type ExportFormat = 'txt' | 'xhtml' | 'rtf' | 'png'

export async function buildOutput(item: BatchItem, store: Store, format: ExportFormat): Promise<Blob> {
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

/** What an export says under the buttons, and whether its button lights up or shakes. */
export interface ExportResult {
  message: string
  outcome?: 'done' | 'refused'
}

export async function exportActive(store: Store, format: ExportFormat): Promise<ExportResult> {
  const state = store.getState()
  const item = state.items.find((i) => i.id === state.activeItemId)
  if (!item) return { message: t('export.noActiveImage'), outcome: 'refused' }
  try {
    const blob = await buildOutput(item, store, format)
    const delivered = await downloadBlob(blob, `${item.file.name}.${format}`)
    if (!delivered) return { message: t('export.cancelled', { name: item.file.name }) }
    store.updateItem(item.id, { status: 'exported' })
    return { message: t('export.exported', { name: item.file.name, format: format.toUpperCase() }), outcome: 'done' }
  } catch (error) {
    return {
      message: t('export.failed', { error: error instanceof Error ? error.message : String(error) }),
      outcome: 'refused',
    }
  }
}

export async function exportAllAsText(store: Store): Promise<string> {
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
  return t('export.batchSummary', { succeeded, failed, cancelledSuffix })
}
