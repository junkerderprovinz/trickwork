import type { Grid } from '../types'

export function toText(grid: Grid): string {
  return grid.map((row) => row.map((cell) => cell.char).join('')).join('\n')
}
