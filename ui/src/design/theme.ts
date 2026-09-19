// GlimStone's appearance.ts has no theme function; the theme is the data-theme
// attribute that tokens.css reads. Without the attribute a media query follows
// prefers-color-scheme, so "system" needs no matchMedia listener.

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
    // With storage disabled the default theme flashes once per load.
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
