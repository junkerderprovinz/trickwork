// ui/src/historyPanel.ts
//
// Undo/redo, moved here from the header (jdp: "die Pfeile sollen in einer
// seitlichen Card Platz finden") - sits first in the secondary column since
// it applies across every one of the cards below it, not tucked inside any
// single one of them.

import { iconRedo, iconUndo } from './icons'
import { subscribeLocale, t } from './i18n'
import type { Store } from './state'

export function mountHistoryPanel(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const row = document.createElement('div')
  row.className = 'icon-toggle-row'
  container.appendChild(row)

  const undoButton = document.createElement('button')
  undoButton.type = 'button'
  undoButton.className = 'history-button'
  undoButton.innerHTML = iconUndo()
  const redoButton = document.createElement('button')
  redoButton.type = 'button'
  redoButton.className = 'history-button'
  redoButton.innerHTML = iconRedo()
  row.append(undoButton, redoButton)

  undoButton.addEventListener('click', () => store.undo())
  redoButton.addEventListener('click', () => store.redo())

  // The log window (jdp: "ein kleines Protokollfenster") - a small scrollable
  // list of the recent, human-readable actions each commitOptionsSnapshot()
  // call site now labels (see state.ts's HistoryEntry). Most recent on top;
  // the underlying stack is already capped (HISTORY_LIMIT in state.ts), so
  // this only needs its own fixed height, not its own separate cap.
  const log = document.createElement('ul')
  log.className = 'history-log'
  container.appendChild(log)

  function renderLog(): void {
    const entries = store.historyLog()
    if (entries.length === 0) {
      log.innerHTML = ''
      const empty = document.createElement('li')
      empty.className = 'history-log-empty'
      empty.textContent = t('history.logEmpty')
      log.appendChild(empty)
      return
    }
    log.innerHTML = ''
    for (let i = entries.length - 1; i >= 0; i--) {
      const item = document.createElement('li')
      item.className = 'history-log-entry'
      item.textContent = entries[i] ?? ''
      log.appendChild(item)
    }
  }

  function refreshState(): void {
    undoButton.disabled = !store.canUndo()
    redoButton.disabled = !store.canRedo()
    renderLog()
  }
  store.subscribe(refreshState)
  refreshState()

  function applyLabels(): void {
    eyebrow.textContent = t('history.eyebrow')
    const undoLabel = t('nav.undo')
    const redoLabel = t('nav.redo')
    undoButton.title = undoLabel
    undoButton.setAttribute('aria-label', undoLabel)
    redoButton.title = redoLabel
    redoButton.setAttribute('aria-label', redoLabel)
    renderLog()
  }
  applyLabels()
  subscribeLocale(applyLabels)
}
