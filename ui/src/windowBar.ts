// The desktop window's title bar on Windows and Linux, GlimStone's
// reference/react/WindowBar.tsx without React: a strip to drag and the three
// window buttons. The brand card right below already shows the mark and the
// name, so the bar names the app for a screen reader only.

import { subscribeLocale, t } from './i18n'
import { buttonGlyph, WINDOW_GLYPHS } from './icons'
import { desktopRuntime } from './wails'

/** How long the page has to stop resizing before the window is asked whether it is maximised. */
const SETTLE_MS = 100

interface WailsHost {
  _wails?: { setResizable?: (on: boolean) => void }
}

// The button takes the bar's full height and shows the house square inside, so
// a pointer thrown into the corner of a maximised window still lands on close.
function windowButton(onPress: () => void): { button: HTMLButtonElement; square: HTMLSpanElement } {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'glim-window-button'
  const square = document.createElement('span')
  square.className = 'glim-window-square'
  button.appendChild(square)
  button.addEventListener('click', onPress)
  return { button, square }
}

function name(part: { button: HTMLButtonElement; square: HTMLSpanElement }, label: string, glyph: string): void {
  part.button.setAttribute('aria-label', label)
  part.button.setAttribute('data-tip', label)
  part.square.innerHTML = glyph
}

export function mountWindowBar(): void {
  const bar = document.createElement('header')
  bar.className = 'glim-window-bar'
  bar.setAttribute('aria-label', 'TrickWork')

  // The window keeps working if the shell refuses a call, so a refusal is not
  // worth a toast.
  const call = (method: 'Minimise' | 'ToggleMaximise' | 'Close') => () =>
    void desktopRuntime()
      .then((runtime) => runtime.Window[method]())
      .catch(() => {})

  const minimise = windowButton(call('Minimise'))
  const maximise = windowButton(call('ToggleMaximise'))
  const close = windowButton(call('Close'))
  bar.append(minimise.button, maximise.button, close.button)

  let maximised = false
  function paint(): void {
    name(minimise, t('frame.minimise'), buttonGlyph(WINDOW_GLYPHS.minimise))
    name(
      maximise,
      t(maximised ? 'frame.restore' : 'frame.maximise'),
      buttonGlyph(maximised ? WINDOW_GLYPHS.restore : WINDOW_GLYPHS.maximise),
    )
    name(close, t('common.close'), buttonGlyph(WINDOW_GLYPHS.close))
  }

  // The move starts on the first move, not on the press, so a click and a
  // double click on the bar stay clicks.
  const onButton = (event: MouseEvent) => (event.target as Element).closest('button') !== null
  let pressed = false
  bar.addEventListener('mousedown', (event) => {
    pressed = event.button === 0 && !event.defaultPrevented && !onButton(event)
  })
  bar.addEventListener('mousemove', (event) => {
    if (!pressed) return
    pressed = false
    if (event.buttons === 1) void desktopRuntime().then((runtime) => runtime.System.invoke('wails:drag'))
  })
  bar.addEventListener('mouseup', () => (pressed = false))
  bar.addEventListener('dblclick', (event) => {
    if (!onButton(event)) call('ToggleMaximise')()
  })

  // Maximising and restoring resize the page whatever started them, the bar, a
  // snap or a key, so a resize that has settled is the cue to ask. A maximised
  // window has no edge to pull, and its corner belongs to close.
  function ask(): void {
    void desktopRuntime()
      .then((runtime) => runtime.Window.IsMaximised())
      .then((now) => {
        maximised = now
        ;(window as WailsHost)._wails?.setResizable?.(!now)
        paint()
      })
      .catch(() => {})
  }
  let timer: number | undefined
  window.addEventListener('resize', () => {
    window.clearTimeout(timer)
    timer = window.setTimeout(ask, SETTLE_MS)
  })

  paint()
  ask()
  subscribeLocale(paint)
  document.body.prepend(bar)
}
