export type NoteBlock = { kind: 'heading' | 'paragraph'; text: string } | { kind: 'list'; items: string[] }

/**
 * The notes as blocks: a line starting with "## " is a heading, a run of "- "
 * lines a list, and every other run of lines a paragraph. That is all the
 * notes use, and text stays text, so nothing in them can reach the page as
 * markup.
 */
export function noteBlocks(markdown: string): NoteBlock[] {
  const blocks: NoteBlock[] = []
  let list: string[] | null = null
  let paragraph: string[] = []

  function flushParagraph(): void {
    if (paragraph.length === 0) return
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
    paragraph = []
  }

  for (const raw of markdown.split(/\r?\n/)) {
    const line = raw.trim()
    if (line.startsWith('- ')) {
      flushParagraph()
      if (!list) {
        list = []
        blocks.push({ kind: 'list', items: list })
      }
      list.push(line.slice(2))
      continue
    }
    list = null
    if (line === '') {
      flushParagraph()
    } else if (line.startsWith('## ')) {
      flushParagraph()
      blocks.push({ kind: 'heading', text: line.slice(3) })
    } else {
      paragraph.push(line)
    }
  }
  flushParagraph()
  return blocks
}
