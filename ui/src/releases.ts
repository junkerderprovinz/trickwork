// What the Version card knows about releases: the notes each one ships with,
// from .github/release-notes, and whether another release is newer.

const NOTES = import.meta.glob<string>('../../.github/release-notes/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** The notes of `version`, the same file its release page is made from. */
export function releaseNotes(version: string): string | undefined {
  return NOTES[`../../.github/release-notes/v${version}.md`]
}

/** Whether release `latest` (a tag such as v1.5.0) is newer than `running`. */
export function isNewer(latest: string, running: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0)
  const a = parse(latest)
  const b = parse(running)
  for (let i = 0; i < 3; i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0)
  }
  return false
}
