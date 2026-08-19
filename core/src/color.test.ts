import { describe, expect, it } from 'vitest'
import { rgbToHex, sameColor } from './color'

describe('rgbToHex', () => {
  it('formats a colour as a lowercase 6-digit hex string', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 128 })).toBe('#ff0080')
  })

  it('pads single-digit hex values with a leading zero', () => {
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe('#010203')
  })

  it('clamps out-of-range channel values instead of producing invalid hex', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe('#ff0080')
  })
})

describe('sameColor', () => {
  it('is true for two equal colours', () => {
    expect(sameColor({ r: 1, g: 2, b: 3 }, { r: 1, g: 2, b: 3 })).toBe(true)
  })

  it('is false when any channel differs', () => {
    expect(sameColor({ r: 1, g: 2, b: 3 }, { r: 1, g: 2, b: 4 })).toBe(false)
  })

  it('is true when both are undefined', () => {
    expect(sameColor(undefined, undefined)).toBe(true)
  })

  it('is false when only one is undefined', () => {
    expect(sameColor({ r: 1, g: 2, b: 3 }, undefined)).toBe(false)
    expect(sameColor(undefined, { r: 1, g: 2, b: 3 })).toBe(false)
  })
})
