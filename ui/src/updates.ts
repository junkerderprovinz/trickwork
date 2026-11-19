// The toast that says a downloaded version waits for the next start of the
// desktop app.

import { t } from './i18n'
import { showToast } from './toast'
import { desktopRuntime } from './wails'

const READY_EVENT = 'update:ready'

export function listenForUpdates(): void {
  void desktopRuntime().then((runtime) =>
    runtime.Events.On(READY_EVENT, (event) => {
      showToast(t('update.ready', { version: String(event.data) }))
    }),
  )
}
