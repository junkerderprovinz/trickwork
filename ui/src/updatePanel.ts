// The desktop build's Update automatically switch, which the Version card puts
// under TrickWork's row, and the toast that says a downloaded version waits for
// the next start. The setting itself lives on the Go side, which reads it
// before this page has loaded.

import { switchRow } from './controlWidgets'
import { infoIcon } from './design/tooltip'
import { subscribeLocale, t } from './i18n'
import { replay } from './motion'
import { showToast } from './toast'
import { callApp, desktopRuntime } from './wails'

const READY_EVENT = 'update:ready'

export function autoUpdateSwitch(): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'control-slider version-settings'

  let on = true

  // The switch moves at once; a refused save puts it back, shakes it and says
  // why in a toast.
  async function save(checked: boolean): Promise<void> {
    try {
      await callApp('SetAutoUpdate', checked)
      on = checked
    } catch {
      render()
      replay(wrap.querySelector<HTMLElement>('.toggle-switch')!, 'glim-shake')
      showToast(t('update.saveFailed'), 'fail')
    }
  }

  function render(): void {
    wrap.replaceChildren(switchRow(t('update.auto'), on, (checked) => void save(checked), infoIcon(t('update.autoHint'))))
  }

  render()
  subscribeLocale(render)
  void callApp<boolean>('AutoUpdate').then((value) => {
    on = value
    render()
  })
  return wrap
}

export function listenForUpdates(): void {
  void desktopRuntime().then((runtime) =>
    runtime.Events.On(READY_EVENT, (event) => {
      showToast(t('update.ready', { version: String(event.data) }))
    }),
  )
}
