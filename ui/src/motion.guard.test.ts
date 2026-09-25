/// <reference types="node" />
// The motion engine's two promises, read from the stylesheets themselves: every
// level declares every dial, so a quiet level never inherits a lively number,
// and no rule names a lively level, so a level added above still gets it.

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const tokens = readFileSync(new URL('./design/tokens.css', import.meta.url), 'utf8')
const style = readFileSync(new URL('./style.css', import.meta.url), 'utf8')

const LEVELS = ['subtle', 'off', 'storm'] as const
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
  // A dial is whatever some level sets; the lively default is the bare :root.
  const dials = new Set(LEVELS.flatMap((l) => [...(byLevel[l] ?? [])]))

  it('finds the dials at all', () => {
    expect(dials.size).toBeGreaterThanOrEqual(15)
  })

  for (const level of LEVELS) {
    it(`${level} declares every dial`, () => {
      const missing = [...dials].filter((d) => !byLevel[level]?.has(d))
      expect(missing).toEqual([])
    })
  }

  it('the lively default declares every dial', () => {
    const root = declared(tokens, ':root')
    expect([...dials].filter((d) => !root.has(d))).toEqual([])
  })

  it('no rule names the lively level', () => {
    for (const css of [tokens, style]) {
      expect(css).not.toMatch(/data-motion=['"]wild['"]/)
    }
  })
})
