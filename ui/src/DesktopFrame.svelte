<script lang="ts">
  import { onMount } from 'svelte'
  import { WindowBar } from '@glimstone/svelte'
  import { tr } from './live.svelte'
  import { desktopRuntime } from './wails'

  /** How long the page has to stop resizing before the window is asked whether it is maximised. */
  const SETTLE_MS = 100

  interface WailsHost {
    _wails?: { setResizable?: (on: boolean) => void }
  }

  let maximised = $state(false)

  // The window keeps working if the shell refuses a call, so a refusal is not
  // worth a toast.
  const call = (method: 'Minimise' | 'ToggleMaximise' | 'Close') => () =>
    void desktopRuntime()
      .then((runtime) => runtime.Window[method]())
      .catch(() => {})

  // Maximising and restoring resize the page whatever started them, the bar, a
  // snap or a key, so a resize that has settled is the cue to ask. A maximised
  // window has no edge to pull, and its corner belongs to close.
  function ask(): void {
    void desktopRuntime()
      .then((runtime) => runtime.Window.IsMaximised())
      .then((now) => {
        maximised = now
        ;(window as WailsHost)._wails?.setResizable?.(!now)
      })
      .catch(() => {})
  }

  onMount(() => {
    let timer: number | undefined
    const settle = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(ask, SETTLE_MS)
    }
    window.addEventListener('resize', settle)
    ask()
    return () => window.removeEventListener('resize', settle)
  })
</script>

<WindowBar
  appName="TrickWork"
  {maximised}
  text={{ minimise: tr('frame.minimise'), maximise: tr('frame.maximise'), restore: tr('frame.restore'), close: tr('common.close') }}
  onMinimise={call('Minimise')}
  onToggleMaximise={call('ToggleMaximise')}
  onClose={call('Close')}
  onDragStart={() => void desktopRuntime().then((runtime) => runtime.System.invoke('wails:drag'))}
/>
