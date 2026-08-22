// ui/src/presetsPanel.test.ts
import { describe, expect, it } from 'vitest'
import { parsePresetFile } from './presetsPanel'

const VALID_OPTIONS = {
  columns: 120,
  brightness: 0,
  contrast: 0,
  charset: [' ', '.', '@'],
  font: { family: 'monospace', sizePx: 14 },
}

function preset(options: unknown): string {
  return JSON.stringify({ trickworkPreset: 1, options })
}

describe('parsePresetFile', () => {
  it('accepts a well-formed minimal preset', () => {
    const result = parsePresetFile(preset(VALID_OPTIONS))
    expect(result).toEqual(VALID_OPTIONS)
  })

  it('accepts optional fields when present and well-typed', () => {
    const full = {
      ...VALID_OPTIONS,
      rows: 45,
      color: true,
      dither: true,
      rotate: 90,
      flipHorizontal: true,
      flipVertical: false,
      invert: true,
      sharpen: 'unsharp',
      levels: { black: 10, gamma: 1.5, white: 240 },
    }
    const result = parsePresetFile(preset(full))
    expect(result).toEqual(full)
  })

  it('ignores a non-positive rows value instead of rejecting the whole preset (falls back to auto)', () => {
    const result = parsePresetFile(preset({ ...VALID_OPTIONS, rows: 0 }))
    expect(result).toEqual(VALID_OPTIONS)
  })

  it('rejects invalid JSON entirely', () => {
    expect(parsePresetFile('{not json')).toBeNull()
  })

  it('rejects a file with no trickworkPreset marker (not a TrickWork export)', () => {
    expect(parsePresetFile(JSON.stringify({ options: VALID_OPTIONS }))).toBeNull()
  })

  it('rejects columns <= 0', () => {
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, columns: 0 }))).toBeNull()
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, columns: -5 }))).toBeNull()
  })

  it('rejects a non-finite brightness/contrast', () => {
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, brightness: Number.NaN }))).toBeNull()
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, contrast: 'zero' }))).toBeNull()
  })

  it('rejects an empty or non-array charset', () => {
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, charset: [] }))).toBeNull()
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, charset: 'abc' }))).toBeNull()
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, charset: ['a', 5, 'c'] }))).toBeNull()
  })

  it('rejects a missing or malformed font', () => {
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, font: undefined }))).toBeNull()
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, font: { family: 'mono' } }))).toBeNull()
    expect(parsePresetFile(preset({ ...VALID_OPTIONS, font: { family: 5, sizePx: 14 } }))).toBeNull()
  })

  it('ignores a malformed optional field instead of rejecting the whole preset', () => {
    // sharpen: 'extreme' isn't one of the three valid values - the required
    // core fields are still fine, so the preset loads with sharpen just
    // silently omitted rather than failing outright.
    const result = parsePresetFile(preset({ ...VALID_OPTIONS, sharpen: 'extreme' }))
    expect(result).not.toBeNull()
    expect(result?.sharpen).toBeUndefined()
  })

  it('rejects levels with a non-finite field', () => {
    const result = parsePresetFile(
      preset({ ...VALID_OPTIONS, levels: { black: 0, gamma: Number.POSITIVE_INFINITY, white: 255 } }),
    )
    expect(result?.levels).toBeUndefined()
  })
})
