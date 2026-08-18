import { describe, expect, it } from 'vitest'
import { computeDownscaleDimensions } from './downscale'

describe('computeDownscaleDimensions', () => {
  it('leaves an image untouched when already within bounds', () => {
    const result = computeDownscaleDimensions(800, 600, 1200)
    expect(result).toEqual({ width: 800, height: 600, scaled: false })
  })

  it('leaves an image untouched when exactly at the boundary', () => {
    const result = computeDownscaleDimensions(1200, 900, 1200)
    expect(result.scaled).toBe(false)
  })

  it('scales a landscape image down, preserving aspect ratio', () => {
    const result = computeDownscaleDimensions(4000, 2000, 1000)
    expect(result).toEqual({ width: 1000, height: 500, scaled: true })
  })

  it('scales a portrait image down using the taller dimension', () => {
    const result = computeDownscaleDimensions(1000, 4000, 800)
    expect(result).toEqual({ width: 200, height: 800, scaled: true })
  })

  it('rounds fractional results to whole pixels', () => {
    const result = computeDownscaleDimensions(4001, 3001, 1000)
    expect(Number.isInteger(result.width)).toBe(true)
    expect(Number.isInteger(result.height)).toBe(true)
  })
})
