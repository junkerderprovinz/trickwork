import { decodeAndPrepareImage, CHARSET_PRESETS, type MappingOptions } from 'ascii-supergenerator-core'

export type BatchItemStatus = 'pending' | 'converting' | 'converted' | 'exported' | 'error'

export interface BatchItem {
  id: string
  file: File
  status: BatchItemStatus
  errorMessage?: string
  imageData?: ImageData
  wasDownscaled?: boolean
}

export interface AppState {
  items: BatchItem[]
  activeItemId: string | null
  options: MappingOptions
}

export type Listener = (state: AppState) => void

export function createStore() {
  let state: AppState = {
    items: [],
    activeItemId: null,
    options: {
      columns: 120,
      brightness: 0,
      contrast: 0,
      charset: [...CHARSET_PRESETS.standard],
      font: { family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', sizePx: 14 },
    },
  }
  const listeners = new Set<Listener>()

  function notify() {
    for (const listener of listeners) listener(state)
  }

  function setState(patch: Partial<AppState>) {
    state = { ...state, ...patch }
    notify()
  }

  function updateItem(id: string, patch: Partial<BatchItem>) {
    setState({
      items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  async function addFiles(files: File[]) {
    const newItems: BatchItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
    }))
    setState({
      items: [...state.items, ...newItems],
      activeItemId: state.activeItemId ?? newItems[0]?.id ?? null,
    })

    for (const item of newItems) {
      updateItem(item.id, { status: 'converting' })
      try {
        const { imageData, wasDownscaled } = await decodeAndPrepareImage(item.file)
        updateItem(item.id, { status: 'converted', imageData, wasDownscaled })
      } catch (error) {
        updateItem(item.id, {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  return {
    getState: () => state,
    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    setState,
    updateItem,
    addFiles,
  }
}

export type Store = ReturnType<typeof createStore>
