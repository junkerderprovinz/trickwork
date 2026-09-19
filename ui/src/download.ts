// The save path for exports and presets: a native dialog in the desktop build,
// a browser download everywhere else.

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
  /** No Go backend bound: a plain browser tab, as in the container. */
  | 'unavailable'
  /** The native dialog wrote the file. */
  | 'saved'
  /** The native dialog opened and the user declined. */
  | 'cancelled'

/**
 * Saves through the desktop build's native dialog, which Wails binds at
 * window.go.main.App.SaveExport. The <a download> fallback is unreliable in the
 * Wails webviews (WKWebView, WebKit2GTK).
 */
async function saveViaWails(blob: Blob, filename: string): Promise<NativeSaveOutcome> {
  const saveExport = window.go?.main?.App?.SaveExport
  if (!saveExport) return 'unavailable'

  const buffer = await blob.arrayBuffer()
  // Wails passes the arguments as JSON, and Go decodes a []byte from an array
  // of numbers; JSON.stringify turns a Uint8Array into an object Go rejects.
  const bytes = Array.from(new Uint8Array(buffer))
  const path = await saveExport(filename, bytes)
  // An empty path means the user cancelled.
  return path === '' ? 'cancelled' : 'saved'
}

/** Resolves true when the file actually reached disk (or the browser's downloads). */
export async function downloadBlob(blob: Blob, filename: string): Promise<boolean> {
  const outcome = await saveViaWails(blob, filename)
  if (outcome === 'saved') return true
  // A browser download after a cancel would hand over the file just declined.
  if (outcome === 'cancelled') return false

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
  return true
}
