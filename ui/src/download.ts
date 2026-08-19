// ui/src/download.ts
//
// Shared file-save path for anything that produces a downloadable Blob -
// image/text export (exportPanel.ts) and settings-preset export
// (presetsPanel.ts) both route through the same native-dialog-or-browser-
// download logic, extracted here so the desktop/browser distinction is
// implemented exactly once.

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
export async function downloadBlob(blob: Blob, filename: string): Promise<boolean> {
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
