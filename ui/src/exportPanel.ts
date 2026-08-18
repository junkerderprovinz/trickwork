import {
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
import type { BatchItem, Store } from './state'

type ExportFormat = 'txt' | 'xhtml' | 'rtf' | 'png'

export function mountExportPanel(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  eyebrow.textContent = 'Export'
  container.appendChild(eyebrow)

  const panel = document.createElement('div')
  panel.className = 'export-panel'

  const summary = document.createElement('p')
  summary.className = 'export-summary'

  const formatRow = document.createElement('div')
  formatRow.className = 'export-format-row'
  for (const format of ['txt', 'xhtml', 'rtf', 'png'] as ExportFormat[]) {
    const button = document.createElement('button')
    button.textContent = format.toUpperCase()
    // aria-label carries the full sentence as the accessible name (what
    // screen readers and Playwright's getByRole both read), while the
    // visible label stays a compact format code.
    button.setAttribute('aria-label', `Export active image as ${format.toUpperCase()}`)
    button.title = `Export active image as ${format.toUpperCase()}`
    button.addEventListener('click', () => void exportActive(store, format, summary))
    formatRow.appendChild(button)
  }
  panel.appendChild(formatRow)

  const batchButton = document.createElement('button')
  batchButton.className = 'export-batch-button'
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
      // The PNG is the one export that renders with the actual selected font,
      // so its cell pitch has to come from that font too — a fixed 8x16px grid
      // overlapped the proportional stacks badly (Georgia/Arial measure ~14px
      // wide at a 14px font size, not 8px).
      return toImage(
        grid,
        {
          ...measureCellSize(options.font, createCanvasWidthMeasurer()),
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

declare global {
  interface Window {
    go?: {
      main?: {
        App?: {
          SaveExport?: (suggestedFilename: string, data: number[]) => Promise<string>
        }
      }
    }
  }
}

type NativeSaveOutcome =
  /** No Go backend bound - a plain browser tab, i.e. the container deployment. */
  | 'unavailable'
  /** The native dialog wrote the file. */
  | 'saved'
  /** The native dialog opened and the user declined. */
  | 'cancelled'

/**
 * Routes a download through the desktop build's native save dialog when one is
 * there. Wails v2 binds Go methods onto window.go.<package>.<struct>, and
 * desktop/savedialog.go declares `func (a *App) SaveExport(...)` in package
 * main, so the path is window.go.main.App.SaveExport.
 *
 * Worth the feature detection: the <a download> blob-click fallback below is
 * unreliable inside Wails' webviews (WKWebView on macOS, WebKit2GTK on Linux),
 * which is exactly where a native dialog is available instead.
 */
async function saveViaWails(blob: Blob, filename: string): Promise<NativeSaveOutcome> {
  const saveExport = window.go?.main?.App?.SaveExport
  if (!saveExport) return 'unavailable'

  const buffer = await blob.arrayBuffer()
  // Wails JSON.stringify's the argument list and unmarshals it Go-side with
  // encoding/json, whose slice decoder accepts a JSON array of numbers for a
  // []byte parameter (verified against wails v2.13.0's BoundMethod.ParseArgs).
  // Do NOT hand it the Uint8Array itself: JSON.stringify renders a typed array
  // as {"0":137,"1":80,...}, and Go rejects that object outright.
  const bytes = Array.from(new Uint8Array(buffer))
  const path = await saveExport(filename, bytes)
  // SaveExport's contract: empty path means the user cancelled.
  return path === '' ? 'cancelled' : 'saved'
}

/** Resolves true when the file actually reached disk (or the browser's downloads). */
async function downloadBlob(blob: Blob, filename: string): Promise<boolean> {
  const outcome = await saveViaWails(blob, filename)
  if (outcome === 'saved') return true
  // A cancel is a deliberate "no" - falling through to a browser download would
  // hand the user the very file they just declined. Only a missing Wails API
  // (plain browser / container) falls back.
  if (outcome === 'cancelled') return false

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return true
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
    const delivered = await downloadBlob(blob, `${item.file.name}.${format}`)
    if (!delivered) {
      summary.textContent = `Export of "${item.file.name}" cancelled.`
      return
    }
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
  const cancelledNote = cancelled > 0 ? `, ${cancelled} cancelled` : ''
  summary.textContent = `Batch export: ${succeeded} succeeded, ${failed} failed${cancelledNote}.`
}
