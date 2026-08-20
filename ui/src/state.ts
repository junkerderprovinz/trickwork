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

// A history entry pairs a snapshot with the human-readable action that
// produced it (jdp: "kleines Protokollfenster" - a small log of recent
// changes, not just a bare undo/redo count). state.ts stays i18n-free like
// the rest of it, so `label` arrives pre-translated from the widget layer
// (controls.ts/transformPanel.ts/etc.), which already calls t() anyway.
export interface HistoryEntry {
  options: MappingOptions
  label: string
}

export type Listener = (state: AppState) => void

// crypto.randomUUID() is secure-context only, and the container is served over
// plain http:// on a LAN host (http://tower:3210), where it is undefined — the
// first dropped file would throw. Queue ids only need to be unique per page
// load, so generate them locally.
let idCounter = 0
function nextId(): string {
  return `item-${Date.now()}-${idCounter++}`
}

// Undo/redo covers `options` only (the generation-affecting adjustments a
// user is actively tuning), never `items`/`activeItemId` - reverting "which
// image is loaded" isn't what a user reaches for Ctrl+Z expecting. Capped so
// a long editing session can't grow this unboundedly.
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
  // A second, narrower channel: every control widget (controls.ts,
  // transformPanel.ts, filtersPanel.ts, levelsPanel.ts) owns its OWN local
  // DOM state (a slider's value, a segmented row's active button) and only
  // pushes changes TO the store - it never reads the store back except at
  // mount time, so a plain setState (e.g. mid-drag, on every 'input' tick)
  // intentionally does NOT touch this. undo()/redo() are the one case where
  // `options` changes from OUTSIDE the widget that's displaying it, so
  // widgets subscribe here specifically to re-sync their displayed value
  // after a history jump, without rebuilding on every live drag tick (which
  // would yank focus out from under whatever the user is actively dragging).
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

  // Called once per discrete user gesture, BEFORE the change it's about to
  // make - the widget layer (controlWidgets.ts/controls.ts/levelsPanel.ts)
  // decides what "one gesture" means (a single click, or a whole drag from
  // pointerdown to blur) and calls this exactly once per gesture, right
  // before applying the new value via setState.
  function commitOptionsSnapshot(label: string) {
    past = [...past.slice(-(HISTORY_LIMIT - 1)), { options: state.options, label }]
    future = []
    notify()
  }

  // For a whole-options replacement from OUTSIDE any single widget's own
  // editing (presetsPanel.ts's import) - same "undoable + resync every
  // widget's displayed value" contract as undo()/redo() below, since a
  // preset swap is exactly as external to e.g. the rotate segmented row as
  // an undo jump is.
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
    // Oldest first, matching push order - historyPanel.ts's log window slices
    // from the end and reverses for a most-recent-first display.
    historyLog: () => past.map((entry) => entry.label),
  }
}

export type Store = ReturnType<typeof createStore>
