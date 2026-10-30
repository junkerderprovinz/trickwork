// The window behind the Version card's Release notes button: the notes of the
// running version as the build carries them. TrickWork marks no changes on the
// page, so the window has no Changes tab (GlimStone, "First start and what's
// new").

import { glimButton } from './controlWidgets'
import { openExternal } from './donateWindows'
import { REPO } from './donate'
import { t } from './i18n'
import { iconClose, iconExternalLink } from './icons'
import { releaseNotes } from './releases'
import { APP_VERSION } from './version'

/**
 * The notes as blocks: a line starting with "## " is a heading, a run of "- "
 * lines a list, and every other run of lines a paragraph. That is all the
 * notes use, and text stays text, so nothing in them can reach the page as
 * markup.
 */
export function renderNotes(markdown: string): HTMLElement[] {
  const blocks: HTMLElement[] = []
  let list: HTMLUListElement | null = null
  let paragraph: string[] = []

  function flushParagraph(): void {
    if (paragraph.length === 0) return
    const p = document.createElement('p')
    p.className = 'notes-paragraph'
    p.textContent = paragraph.join(' ')
    blocks.push(p)
    paragraph = []
  }

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim()
    if (line.startsWith('- ')) {
      flushParagraph()
      if (!list) {
        list = document.createElement('ul')
        list.className = 'notes-list'
        blocks.push(list)
      }
      const li = document.createElement('li')
      li.textContent = line.slice(2)
      list.appendChild(li)
      continue
    }
    list = null
    if (line === '') {
      flushParagraph()
    } else if (line.startsWith('## ')) {
      flushParagraph()
      const heading = document.createElement('h3')
      heading.className = 'glim-eyebrow notes-heading'
      heading.textContent = line.slice(3)
      blocks.push(heading)
    } else {
      paragraph.push(line)
    }
  }
  flushParagraph()
  return blocks
}

export function openReleaseNotes(): void {
  const opener = document.activeElement as HTMLElement | null
  const backdrop = document.createElement('div')
  backdrop.className = 'glim-modal-backdrop window-backdrop'
  const card = document.createElement('div')
  card.className = 'glim-card glim-section glim-modal-card notes-window'
  card.setAttribute('role', 'dialog')
  card.setAttribute('aria-modal', 'true')
  card.tabIndex = -1
  const heading = document.createElement('div')
  heading.className = 'glim-eyebrow'
  heading.id = 'notes-title'
  heading.textContent = t('info.notesTitle', { version: APP_VERSION })
  card.setAttribute('aria-labelledby', heading.id)

  const body = document.createElement('div')
  body.className = 'notes-body'
  const notes = releaseNotes(APP_VERSION)
  if (notes) {
    body.append(...renderNotes(notes))
  } else {
    const empty = document.createElement('p')
    empty.className = 'notes-paragraph'
    empty.textContent = t('info.notesMissing')
    body.appendChild(empty)
  }

  // The link out of the app opens the foot, and the way out ends it.
  const footer = document.createElement('div')
  footer.className = 'window-footer'
  const releasePage = glimButton({
    label: t('info.releasePage'),
    glyph: iconExternalLink(),
    onClick: () => openExternal(`${REPO}/releases/tag/v${APP_VERSION}`),
  })
  const closeButton = glimButton({ label: t('common.close'), glyph: iconClose(), tone: 'neutral', onClick: close })
  footer.append(releasePage, closeButton)
  card.append(heading, body, footer)
  backdrop.appendChild(card)

  function onKey(event: KeyboardEvent): void {
    if (event.key === 'Escape') close()
  }
  function close(): void {
    document.removeEventListener('keydown', onKey)
    backdrop.remove()
    opener?.focus()
  }
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) close()
  })
  document.addEventListener('keydown', onKey)
  document.body.appendChild(backdrop)
  closeButton.focus()
}
