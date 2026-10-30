// The desktop build's way to its Go side. Wails serves its runtime at
// /wails/runtime.js inside the desktop window, matching the Go library it was
// built with, and the container never loads it.

/** The part of the Wails runtime this interface uses. */
interface Runtime {
  Call: { ByName(name: string, ...args: unknown[]): Promise<unknown> }
  Events: { On(name: string, callback: (event: { data: unknown }) => void): () => void }
  Browser: { OpenURL(url: string): Promise<void> }
  Window: {
    Minimise(): Promise<void>
    ToggleMaximise(): Promise<void>
    Close(): Promise<void>
    IsMaximised(): Promise<boolean>
  }
  System: { invoke(message: string): void }
}

// A variable, so Vite leaves the import to the browser.
const RUNTIME_URL = '/wails/runtime.js'

let runtime: Promise<Runtime> | undefined

/** Whether this page runs in the desktop app, which Wails serves from an origin of its own. */
export function isDesktop(): boolean {
  return window.location.protocol === 'wails:' || window.location.hostname === 'wails.localhost'
}

/**
 * Whether this page draws the window's title bar. The window is frameless on
 * Windows and Linux and keeps its own title bar on macOS, whose traffic lights
 * people expect; see desktop/main.go.
 */
export function drawsOwnFrame(): boolean {
  return isDesktop() && !/Macintosh/.test(navigator.userAgent)
}

/** Loads the runtime once; loading it also tells Wails the page is ready for events. */
export function desktopRuntime(): Promise<Runtime> {
  runtime ??= import(/* @vite-ignore */ RUNTIME_URL) as Promise<Runtime>
  return runtime
}

/** Calls a method of the Go App service that desktop/main.go binds. */
export async function callApp<T>(method: string, ...args: unknown[]): Promise<T> {
  const { Call } = await desktopRuntime()
  return (await Call.ByName(`main.App.${method}`, ...args)) as T
}
