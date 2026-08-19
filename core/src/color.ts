// core/src/color.ts
import type { RGB } from './types'

function hex2(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
}

export function rgbToHex(color: RGB): string {
  return `#${hex2(color.r)}${hex2(color.g)}${hex2(color.b)}`
}

export function sameColor(a: RGB | undefined, b: RGB | undefined): boolean {
  if (!a || !b) return a === b
  return a.r === b.r && a.g === b.g && a.b === b.b
}
