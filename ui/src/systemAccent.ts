// Where the system colour comes from. The desktop app asks its Go side, which
// reads the accent the operating system is set to (desktop/accent). A browser
// reads CSS AccentColor, which only Firefox and Safari fill with the system's
// colour, so in every other browser there is no source and no system swatch.

import { setSystemAccent } from './design/appearance'
import { watchBrowserAccent } from './design/browserAccent'
import { callApp, isDesktop } from './wails'

/** The colour in the Go side's answer, or undefined where the desktop names none. */
function accentFrom(answer: unknown): string | undefined {
  return typeof answer === 'string' && /^#[0-9a-f]{6}$/i.test(answer) ? answer : undefined
}

/**
 * Feeds setSystemAccent from this page's source, now and whenever the window
 * comes back to the front, which is when somebody returns from the system's
 * settings.
 */
export function watchSystemAccent(): void {
  if (!isDesktop()) {
    watchBrowserAccent(setSystemAccent)
    return
  }
  // A Go side that does not answer leaves the colour it gave last.
  const ask = () => void callApp<string>('SystemAccent').then((answer) => setSystemAccent(accentFrom(answer)), () => {})
  ask()
  window.addEventListener('focus', ask)
}
