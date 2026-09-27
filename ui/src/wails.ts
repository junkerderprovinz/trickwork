// What the desktop build's Wails runtime puts on window. The container has none
// of it, so every member is optional.

declare global {
  interface Window {
    go?: {
      main?: {
        App?: {
          SaveExport?: (suggestedFilename: string, data: number[]) => Promise<string>
          AutoUpdate?: () => Promise<boolean>
          SetAutoUpdate?: (on: boolean) => Promise<void>
        }
      }
    }
    runtime?: {
      BrowserOpenURL?: (url: string) => void
      EventsOn?: (name: string, callback: (...data: unknown[]) => void) => () => void
    }
  }
}

export {}
