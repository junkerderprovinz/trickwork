import {
  SHAPES_STORED,
  DEFAULT_SHAPE,
  RAINBOW,
  applyRainbow,
  cacheAppearance,
  rainbowState,
  SYSTEM_ACCENT,
  type Motion,
  type Shape,
} from '@glimstone/core/appearance'
import { getLabelMode, type LabelMode } from '@glimstone/core/controls'
import { cacheTheme, cachedThemePref, type ThemePref } from './theme'
import { storedDisco, storedMotion } from './looks'
import { motionMs } from './motion'

// What the Look and Colours cards set, shared by both.

const APPEARANCE_CACHE_KEY = 'glim-appearance'
const HEX_RE = /^#[0-9a-fA-F]{6}$/

// The page's palette positions in the order things stand: the four settings
// tabs first, then one colour for each selector of the Look card.
export const HUE_OFFSET = { tabs: 0, theme: 4, shape: 5, motion: 6, labels: 7 }

function readCached(): { shape?: string; accent?: string } {
  try {
    const raw = localStorage.getItem(APPEARANCE_CACHE_KEY)
    return raw ? (JSON.parse(raw) as { shape?: string; accent?: string }) : {}
  } catch {
    return {}
  }
}

const cached = readCached()

export const look = $state({
  shape: SHAPES_STORED.includes(cached.shape as Shape) ? (cached.shape as Shape) : DEFAULT_SHAPE,
  // '' means no custom accent: cacheAppearance needs a string, and applying ''
  // clears the override. SYSTEM_ACCENT follows the system's colour.
  accent: cached.accent && (HEX_RE.test(cached.accent) || cached.accent === SYSTEM_ACCENT) ? cached.accent : '',
  theme: cachedThemePref() as ThemePref,
  motion: storedMotion() as Motion,
  labelMode: getLabelMode('buttons') as LabelMode,
  disco: storedDisco(),
})

// The eggs are offered while chosen, and otherwise only while the Look tab
// stays open, so what was found lives here and never in storage.
export const eggs = $state({
  leaf: look.shape === 'leaf',
  storm: look.motion === 'storm',
  disco: look.disco,
})
export const leafTaps = { taps: 0 }
export const stormTaps = { taps: 0 }
export const discoTaps = { taps: 0, last: 0 }

export function persist(): void {
  cacheAppearance(look.shape, look.accent, rainbowState())
  cacheTheme(look.theme)
}

/** Colour rotation moves the palette on by one colour at every visit. */
export function rotateOnVisit(): void {
  const loaded = rainbowState()
  if (!loaded.on || !loaded.rotate) return
  applyRainbow({ ...loaded, seed: (loaded.seed + 1) % RAINBOW.length })
  persist()
}

/** Leaving the Look tab, to another tab or out of Settings, puts back what was not chosen. */
export function leaveLook(): void {
  eggs.leaf = look.shape === 'leaf'
  eggs.storm = look.motion === 'storm'
  eggs.disco = look.disco
  leafTaps.taps = 0
  stormTaps.taps = 0
}

let wipeTimer: number | undefined

/**
 * Lets the next change of the rainbow wipe across the page instead of every
 * hued element snapping on its own. The class stays only as long as the wipe,
 * so ordinary hovers keep their own timing. Not for a colour being dragged in
 * the picker, which has to follow the pointer.
 */
export function wipeColours(): void {
  const root = document.documentElement
  root.classList.add('glim-colour-wipe')
  window.clearTimeout(wipeTimer)
  wipeTimer = window.setTimeout(() => root.classList.remove('glim-colour-wipe'), motionMs('--motion-wipe-dur') + 50)
}
