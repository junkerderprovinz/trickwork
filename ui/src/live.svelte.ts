import { createRawSnippet, type Snippet } from 'svelte'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import type { AppState, Store } from './state'

let localeVersion = $state(0)
subscribeLocale(() => {
  localeVersion++
})

/** t() that a component re-reads when the language changes. */
export function tr(key: TranslationKey, params?: Record<string, string | number>): string {
  void localeVersion
  return t(key, params)
}

/** The store's state as a value components can read reactively. */
export function liveState(store: Store): { readonly current: AppState } {
  let state = $state.raw(store.getState())
  store.subscribe((next) => {
    state = next
  })
  return {
    get current() {
      return state
    },
  }
}

/** An SVG string as the glyph snippet GlimStone's components take. */
export function svgSnippet(svg: string): Snippet {
  return createRawSnippet(() => ({ render: () => svg }))
}
