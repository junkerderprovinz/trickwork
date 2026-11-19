import '@fontsource-variable/noto-sans'
import '@fontsource-variable/noto-sans-arabic'
import '@fontsource-variable/noto-sans-hebrew'
import '@fontsource-variable/noto-sans-thai'
import { mount } from 'svelte'
import { setGlyphResolver } from '@glimstone/svelte'
import { applyCachedAppearance, applyMotion, takePageHue } from '@glimstone/core/appearance'
import { applyStoredLabelModes } from '@glimstone/core/controls'
import { applyDisco } from '@glimstone/core/disco'
import { enableSelectScrollForAll } from '@glimstone/core/selectScroll'
import { wireTooltips } from '@glimstone/core/tooltip'
import { applyCachedTheme } from './theme'
import { applyCachedLocale, subscribeLocale } from './i18n'
import { createStore } from './state'
import { storedDisco, storedMotion } from './looks'
import { drawsOwnFrame } from './wails'
import { watchSystemAccent } from './systemAccent'
import { iconClose, iconCopy } from './icons'
import { svgSnippet } from './live.svelte'
import App from './App.svelte'
import DesktopFrame from './DesktopFrame.svelte'

const app = document.getElementById('app')
if (!app) {
  throw new Error('main.ts: #app root element missing from index.html')
}

applyCachedAppearance()
watchSystemAccent()
applyCachedTheme()
applyMotion(storedMotion())
applyStoredLabelModes()
applyDisco(storedDisco())
void applyCachedLocale()
// GlimStone's own windows name their buttons by key, and these are the marks
// TrickWork wears for them.
const keyGlyphs: Record<string, ReturnType<typeof svgSnippet>> = {
  'common.close': svgSnippet(iconClose()),
  'common.cancel': svgSnippet(iconClose()),
  'common.copy': svgSnippet(iconCopy()),
}
setGlyphResolver((key) => keyGlyphs[key])
// Turns the native `title` of every icon-only button into the styled bubble.
wireTooltips()
// Under rainbow each button takes the colour of its place on the page as the
// pointer or the keyboard reaches it.
for (const type of ['pointerover', 'focusin'] as const) {
  document.addEventListener(type, (event) => {
    const btn = event.target instanceof Element ? event.target.closest('.glim-btn-neutral, .glim-btn-subtle, .glim-btn-bare') : null
    if (btn instanceof HTMLElement) takePageHue(btn)
  })
}

const store = createStore()

mount(App, { target: app, props: { store } })
if (drawsOwnFrame()) mount(DesktopFrame, { target: document.body, anchor: app })

// Two frames after the first paint, so the first radii never animate and every
// later change of shape does.
requestAnimationFrame(() => requestAnimationFrame(() => document.documentElement.classList.add('glim-shape-transitions')))

// Ctrl+Z, Ctrl+Shift+Z and Ctrl+Y, or Cmd on macOS. A focused text field
// keeps its own native undo.
window.addEventListener('keydown', (event) => {
  const mod = event.ctrlKey || event.metaKey
  if (!mod) return
  const target = event.target as HTMLElement | null
  const isTextField =
    target instanceof HTMLInputElement
      ? target.type === 'text' || target.type === 'color'
      : target instanceof HTMLTextAreaElement
  if (isTextField) return

  const key = event.key.toLowerCase()
  if (key === 'z' && !event.shiftKey) {
    event.preventDefault()
    store.undo()
  } else if ((key === 'z' && event.shiftKey) || key === 'y') {
    event.preventDefault()
    store.redo()
  }
})

// A language switch rebuilds the <select> elements, and enableSelectScroll is
// idempotent, so the whole page is scanned again.
enableSelectScrollForAll(app)
subscribeLocale(() => enableSelectScrollForAll(app))
