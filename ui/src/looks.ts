// The two looks GlimStone leaves to the app to store: the motion level and the
// disco switch. The walk itself lives in design/disco.ts.

import { applyMotion, DEFAULT_MOTION, MOTION_STORED, type Motion } from './design/appearance'

const MOTION_KEY = 'trickwork-motion'
const DISCO_KEY = 'trickwork-disco'

export function storedMotion(): Motion {
  try {
    const raw = localStorage.getItem(MOTION_KEY)
    if (MOTION_STORED.includes(raw as Motion)) return raw as Motion
  } catch {
    // Blocked storage falls through to the default.
  }
  return DEFAULT_MOTION
}

export function setMotion(motion: Motion): void {
  try {
    localStorage.setItem(MOTION_KEY, motion)
  } catch {
    // Without storage the level holds until the page reloads.
  }
  applyMotion(motion)
}

export function storedDisco(): boolean {
  try {
    return localStorage.getItem(DISCO_KEY) === 'on'
  } catch {
    return false
  }
}

export function storeDisco(on: boolean): void {
  try {
    localStorage.setItem(DISCO_KEY, on ? 'on' : 'off')
  } catch {
    // Without storage the switch holds until the page reloads.
  }
}
