import { mount, onMount, unmount, type Component } from 'svelte'
import { focusedAsker, returnFocus, stackWindow } from '@glimstone/core'
import { desktopRuntime, isDesktop } from './wails'

/**
 * Mounts a window on the page's body, where no card's transform can pin its
 * fixed backdrop to the card, and takes it away again on close.
 */
export function openWindow<P extends { onClose: () => void }>(component: Component<P>, props: Omit<P, 'onClose'>): void {
  const app: Record<string, unknown> = mount(component, {
    target: document.body,
    props: { ...props, onClose: () => void unmount(app) } as P,
  })
}

/**
 * Puts a giving window on GlimStone's window stack: Escape closes it, Tab stays
 * inside it and the focus goes back where it came from. GlimStone's giving
 * dialogs leave that to the app; its Window does it itself.
 */
export function stackOnMount(card: () => HTMLElement | null, close: () => void): void {
  const asker = focusedAsker()
  onMount(() => {
    const unstack = stackWindow(card, close)
    card()?.focus()
    return () => {
      unstack()
      returnFocus(asker)
    }
  })
}

/** Opens a link outside the app: through the shell in the desktop build, in a new tab elsewhere. */
export function openExternal(url: string): void {
  if (isDesktop()) void desktopRuntime().then((runtime) => runtime.Browser.OpenURL(url))
  else window.open(url, '_blank', 'noopener,noreferrer')
}
