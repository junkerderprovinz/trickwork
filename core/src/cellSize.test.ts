// core/src/cellSize.test.ts
import { describe, expect, it } from 'vitest'
import { measureCellSize } from './cellSize'
import { CELL_ASPECT_COMPENSATION } from './grid'
import type { FontSpec, FontWidthMeasurer } from './types'

const MONO: FontSpec = { family: 'monospace', sizePx: 14 }
const SERIF: FontSpec = { family: 'Georgia, serif', sizePx: 14 }

/** Stands in for a real canvas measureText, so the arithmetic is testable in Node. */
function fakeMeasurer(widthByFamily: Record<string, number>): FontWidthMeasurer {
  return (font) => widthByFamily[font.family] ?? 0
}

describe('measureCellSize', () => {
  it('uses the measured advance width as the cell width', () => {
    const size = measureCellSize(MONO, fakeMeasurer({ monospace: 8 }))
    expect(size.cellWidthPx).toBe(8)
  })

  it('rounds a fractional measurement up, so glyphs never overlap', () => {
    // Real measurement: Georgia 'W' is ~13.66px at a 14px font size.
    const size = measureCellSize(SERIF, fakeMeasurer({ 'Georgia, serif': 13.66 }))
    expect(size.cellWidthPx).toBe(14)
  })

  it('derives height from width via the shared grid aspect compensation', () => {
    const size = measureCellSize(MONO, fakeMeasurer({ monospace: 8 }))
    expect(size.cellHeightPx).toBe(8 * CELL_ASPECT_COMPENSATION)
  })

  it('gives a proportional font a wider cell than a monospace one', () => {
    const measure = fakeMeasurer({ monospace: 8.4, 'Georgia, serif': 13.66 })
    expect(measureCellSize(SERIF, measure).cellWidthPx).toBeGreaterThan(
      measureCellSize(MONO, measure).cellWidthPx,
    )
  })

  it('passes the font through to the measurer unchanged', () => {
    const seen: FontSpec[] = []
    measureCellSize(SERIF, (font) => {
      seen.push(font)
      return 10
    })
    expect(seen).toEqual([SERIF])
  })

  it('falls back to a 1px cell when the measurement is zero', () => {
    // A canvas that cannot resolve the font family reports 0 width; a 0px cell
    // would collapse the preview canvas to nothing.
    const size = measureCellSize(MONO, () => 0)
    expect(size).toEqual({ cellWidthPx: 1, cellHeightPx: CELL_ASPECT_COMPENSATION })
  })

  it('falls back to a 1px cell when the measurement is not a finite number', () => {
    const size = measureCellSize(MONO, () => Number.NaN)
    expect(size).toEqual({ cellWidthPx: 1, cellHeightPx: CELL_ASPECT_COMPENSATION })
  })
})
