/// <reference types="node" />
// The motion engine's promises, read from the stylesheets themselves. The bare
// :root carries subtle and declares every dial. Off and storm declare every dial
// too, so neither inherits subtle's numbers, while wild may lean on the calm
// root where the two agree. No rule keys off subtle, since a page without the
// attribute would miss it.

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const tokens = readFileSync(new URL('./design/tokens.css', import.meta.url), 'utf8')
const style = readFileSync(new URL('./style.css', import.meta.url), 'utf8')

const LEVELS = ['wild', 'off', 'storm'] as const
const SELF_CONTAINED = ['off', 'storm'] as const
const DIAL = /(--(?:motion|drag)-[a-z-]+)\s*:/g

/** The dials declared in every rule whose selector is exactly `selector`. */
function declared(css: string, selector: string): Set<string> {
  const names = new Set<string>()
  // Innermost rules only: a selector and a body without braces.
  for (const rule of css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (rule[1]?.trim() !== selector) continue
    for (const dial of (rule[2] ?? '').matchAll(DIAL)) names.add(dial[1] as string)
  }
  return names
}

describe('motion levels', () => {
  const byLevel = Object.fromEntries(LEVELS.map((l) => [l, declared(tokens, `:root[data-motion='${l}']`)]))
  // A dial is whatever some level sets; the calm default is the bare :root.
  const dials = new Set(LEVELS.flatMap((l) => [...(byLevel[l] ?? [])]))

  it('finds the dials at all', () => {
    expect(dials.size).toBeGreaterThanOrEqual(15)
  })

  for (const level of SELF_CONTAINED) {
    it(`${level} declares every dial`, () => {
      const missing = [...dials].filter((d) => !byLevel[level]?.has(d))
      expect(missing).toEqual([])
    })
  }

  it('the calm default declares every dial', () => {
    const root = declared(tokens, ':root')
    expect([...dials].filter((d) => !root.has(d))).toEqual([])
  })

  it('no rule keys off the subtle level', () => {
    for (const css of [tokens, style]) {
      expect(css).not.toMatch(/data-motion=['"]subtle['"]/)
    }
  })
})
