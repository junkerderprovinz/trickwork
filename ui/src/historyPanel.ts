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

  function refreshState(): void {
    undoButton.disabled = !store.canUndo()
    redoButton.disabled = !store.canRedo()
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
  }
  applyLabels()
  subscribeLocale(applyLabels)
}
