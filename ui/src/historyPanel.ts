// The History sidecard: undo, redo and a log of the recent changes.

import { glimButton, updateButton } from './controlWidgets'
import { iconRedo, iconUndo } from './icons'
import { subscribeLocale, t } from './i18n'
import type { Store } from './state'

export function mountHistoryPanel(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const row = document.createElement('div')
  row.className = 'button-row'
  container.appendChild(row)

  const undoButton = glimButton({ label: t('nav.undo'), glyph: iconUndo(), variant: 'icon', onClick: () => store.undo() })
  const redoButton = glimButton({ label: t('nav.redo'), glyph: iconRedo(), variant: 'icon', onClick: () => store.redo() })
  row.append(undoButton, redoButton)

  // Undo and redo are momentary actions with no checked state, so they get no
  // rainbow colour.

  // Most recent first. The stack is capped at HISTORY_LIMIT, so the log only
  // needs a fixed height.
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
    updateButton(undoButton, { label: t('nav.undo') })
    updateButton(redoButton, { label: t('nav.redo') })
    renderLog()
  }
  applyLabels()
  subscribeLocale(applyLabels)
}
