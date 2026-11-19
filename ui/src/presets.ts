// The preset file: the whole `options` object as shareable JSON.

import { normalizeRotation, type MappingOptions } from 'trickwork-core'

export const PRESET_FORMAT_VERSION = 1

export interface PresetFile {
  trickworkPreset: number
  options: MappingOptions
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Rebuilds MappingOptions from untrusted JSON field by field, so a hand-edited
 * or corrupt file yields null instead of crashing assembleGrid mid-render.
 */
function validateOptions(value: unknown): MappingOptions | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>

  if (!isFiniteNumber(v.columns) || v.columns <= 0) return null
  if (!isFiniteNumber(v.brightness)) return null
  if (!isFiniteNumber(v.contrast)) return null
  if (
    !Array.isArray(v.charset) ||
    v.charset.length === 0 ||
    !v.charset.every((ch) => typeof ch === 'string' && ch.length >= 1)
  ) {
    return null
  }
  if (!v.font || typeof v.font !== 'object') return null
  const font = v.font as Record<string, unknown>
  if (typeof font.family !== 'string' || !isFiniteNumber(font.sizePx)) return null

  const options: MappingOptions = {
    columns: v.columns,
    brightness: v.brightness,
    contrast: v.contrast,
    charset: v.charset as string[],
    font: { family: font.family, sizePx: font.sizePx },
  }

  if (isFiniteNumber(v.rows) && v.rows > 0) options.rows = v.rows
  if (typeof v.color === 'boolean') options.color = v.color
  if (typeof v.dither === 'boolean') options.dither = v.dither
  if (isFiniteNumber(v.rotate)) options.rotate = normalizeRotation(v.rotate)
  if (typeof v.flipHorizontal === 'boolean') options.flipHorizontal = v.flipHorizontal
  if (typeof v.flipVertical === 'boolean') options.flipVertical = v.flipVertical
  if (typeof v.invert === 'boolean') options.invert = v.invert
  if (v.sharpen === 'none' || v.sharpen === 'sharpen' || v.sharpen === 'unsharp') options.sharpen = v.sharpen
  if (v.levels && typeof v.levels === 'object') {
    const levels = v.levels as Record<string, unknown>
    if (isFiniteNumber(levels.black) && isFiniteNumber(levels.gamma) && isFiniteNumber(levels.white)) {
      options.levels = { black: levels.black, gamma: levels.gamma, white: levels.white }
    }
  }

  return options
}

export function parsePresetFile(text: string): MappingOptions | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as Record<string, unknown>
  if (typeof obj.trickworkPreset !== 'number') return null
  return validateOptions(obj.options)
}
