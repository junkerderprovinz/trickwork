// The Updates card in the desktop build's App tab, and the toast that says a
// downloaded version waits for the next start. The setting itself lives on the
// Go side, which reads it before this page has loaded.

import { switchRow } from './controlWidgets'
import { infoIcon } from './design/tooltip'
import { subscribeLocale, t } from './i18n'
import { replay } from './motion'
import { showToast } from './toast'

const READY_EVENT = 'update:ready'

export function mountUpdatePanel(container: HTMLElement): void {
  const heading = document.createElement('div')
  heading.className = 'glim-eyebrow'
  const wrap = document.createElement('div')
  wrap.className = 'control-slider'
  container.append(heading, wrap)

  let on = true

  // The switch moves at once; a refused save puts it back, shakes it and says
  // why in a toast.
  async function save(checked: boolean): Promise<void> {
    try {
      await window.go?.main?.App?.SetAutoUpdate?.(checked)
      on = checked
    } catch {
      render()
      replay(wrap.querySelector<HTMLElement>('.toggle-switch')!, 'glim-shake')
      showToast(t('update.saveFailed'), 'fail')
    }
  }

  function render(): void {
    heading.textContent = t('update.title')
    wrap.replaceChildren(switchRow(t('update.auto'), on, (checked) => void save(checked), infoIcon(t('update.autoHint'))))
  }

  render()
  subscribeLocale(render)
  void window.go?.main?.App?.AutoUpdate?.().then((value) => {
    on = value
    render()
  })
}

export function listenForUpdates(): void {
  window.runtime?.EventsOn?.(READY_EVENT, (version) => {
    showToast(t('update.ready', { version: String(version) }))
  })
}
