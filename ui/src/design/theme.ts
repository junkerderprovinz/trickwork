// GlimStone's appearance.ts owns shape/accent/rainbow, but ships no theme
// function at all — theme is a pure tokens.css concern (the data-theme
// attribute), left for each adopting app to wire up. Per
// docs/design-language.md: an unset data-theme follows prefers-color-scheme
// via a media query already in tokens.css, and an explicit "dark"/"light"
// overrides it in either direction. Because the follow-the-OS behaviour
// lives entirely in CSS, "system" needs no matchMedia listener here — the
// browser re-evaluates the media query on its own whenever the OS setting
// changes.

export type ThemePref = 'dark' | 'light' | 'system'

const THEMES: ThemePref[] = ['dark', 'light', 'system']
const CACHE_KEY = 'trickwork-theme'

export function applyTheme(pref: ThemePref | string | undefined): void {
  const p = THEMES.includes(pref as ThemePref) ? (pref as ThemePref) : 'system'
  const root = document.documentElement
  if (p === 'system') {
    root.removeAttribute('data-theme')
  } else {
    root.setAttribute('data-theme', p)
  }
}

export function cacheTheme(pref: ThemePref): void {
  try {
    localStorage.setItem(CACHE_KEY, pref)
  } catch {
    // A browser with storage disabled simply pays one flash per load.
  }
}

export function cachedThemePref(): ThemePref {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (raw && THEMES.includes(raw as ThemePref)) return raw as ThemePref
  } catch {
    // fall through to system
  }
  return 'system'
}

/** Applied at boot, before the app renders anything. */
export function applyCachedTheme(): void {
  applyTheme(cachedThemePref())
}
