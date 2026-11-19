import { GLIMSTONE_VERSION } from '@glimstone/core/version'
import { currentLocale } from './i18n'
import type { Store } from './state'
import { APP_VERSION } from './version'
import { isDesktop } from './wails'

const LOOK_KEYS = ['glim-appearance', 'trickwork-theme', 'trickwork-motion', 'trickwork-disco']

/**
 * What the bug report holds: the versions, where TrickWork runs, the language,
 * the look and the conversion settings. No file names and no images, since
 * those can say who somebody is.
 */
export function bugReport(store: Store): object {
  const look: Record<string, string | null> = {}
  for (const key of LOOK_KEYS) {
    try {
      look[key] = localStorage.getItem(key)
    } catch {
      look[key] = null
    }
  }
  const root = document.documentElement
  return {
    trickwork: APP_VERSION,
    glimstone: GLIMSTONE_VERSION,
    build: isDesktop() ? 'desktop' : 'container',
    userAgent: navigator.userAgent,
    language: currentLocale(),
    labels: root.getAttribute('data-labels-buttons'),
    rainbow: root.getAttribute('data-rainbow'),
    look,
    images: store.getState().items.length,
    options: store.getState().options,
  }
}
