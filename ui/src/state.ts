import { decodeAndPrepareImage, CHARSET_PRESETS, type MappingOptions } from 'trickwork-core'

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

// The store has no i18n, so `label` arrives translated from the widget layer.
export interface HistoryEntry {
  options: MappingOptions
  label: string
}

export type Listener = (state: AppState) => void

// crypto.randomUUID() exists only in a secure context, and the container is
// served over plain http on the LAN. Queue ids only need to be unique per page
// load.
let idCounter = 0
function nextId(): string {
  return `item-${Date.now()}-${idCounter++}`
}

// Undo covers `options` only; nobody expects Ctrl+Z to change which image is
// loaded.
const HISTORY_LIMIT = 50

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
  // Widgets keep their own DOM state and only push changes to the store, so
  // setState leaves them alone. Undo, redo and a preset import change options
  // from outside the widget showing them, and this channel lets widgets
  // re-sync then without rebuilding on every drag tick, which would steal
  // focus from the drag.
  const historyListeners = new Set<() => void>()
  let past: HistoryEntry[] = []
  let future: HistoryEntry[] = []

  function notify() {
    for (const listener of listeners) listener(state)
  }

  function notifyHistory() {
    for (const listener of historyListeners) listener()
  }

  function setState(patch: Partial<AppState>) {
    state = { ...state, ...patch }
    notify()
  }

  // Called once per gesture, a click or a whole drag, before the new value is
  // applied.
  function commitOptionsSnapshot(label: string) {
    past = [...past.slice(-(HISTORY_LIMIT - 1)), { options: state.options, label }]
    future = []
    notify()
  }

  // Replaces all options from outside the widgets, undoable and re-synced
  // like an undo.
  function replaceOptions(next: MappingOptions, label: string) {
    commitOptionsSnapshot(label)
    state = { ...state, options: next }
    notify()
    notifyHistory()
  }

  function undo() {
    const previous = past[past.length - 1]
    if (!previous) return
    past = past.slice(0, -1)
    future = [{ options: state.options, label: previous.label }, ...future]
    state = { ...state, options: previous.options }
    notify()
    notifyHistory()
  }

  function redo() {
    const next = future[0]
    if (!next) return
    future = future.slice(1)
    past = [...past, { options: state.options, label: next.label }]
    state = { ...state, options: next.options }
    notify()
    notifyHistory()
  }

  function updateItem(id: string, patch: Partial<BatchItem>) {
    setState({
      items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  async function addFiles(files: File[]) {
    const newItems: BatchItem[] = files.map((file) => ({
      id: nextId(),
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
    subscribeHistory: (listener: () => void) => {
      historyListeners.add(listener)
      return () => historyListeners.delete(listener)
    },
    setState,
    updateItem,
    addFiles,
    commitOptionsSnapshot,
    replaceOptions,
    undo,
    redo,
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    // Oldest first.
    historyLog: () => past.map((entry) => entry.label),
  }
}

export type Store = ReturnType<typeof createStore>
