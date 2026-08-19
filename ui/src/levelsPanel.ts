// ui/src/levelsPanel.ts
//
// ASCGen2's "Levels" tab (WidgetTextSettings.cs, a JMLevels control: histogram
// + black/median/white point sliders, Photoshop-style) - folded into the
// Filters card as one more always-visible block instead of a separate dialog/
// tab, matching TrickWork's "every generation-affecting control is live at
// once" layout. Mounted by filtersPanel.ts.

import { computeLuminanceHistogram, type LevelsSpec } from 'trickwork-core'
import { subscribeLocale, t } from './i18n'
import type { Store } from './state'

const IDENTITY_LEVELS: LevelsSpec = { black: 0, gamma: 1, white: 255 }
const MIN_GAMMA = 0.1
const MAX_GAMMA = 9.99

function levelsOf(store: Store): LevelsSpec {
  return store.getState().options.levels ?? IDENTITY_LEVELS
}

/**
 * Where the midtone handle sits on the shared 0..255 track for a given
 * gamma - the inverse of applyLevels' own curve (filters.ts), solved for the
 * input value that maps to output 0.5: normalized^(1/gamma) = 0.5 =>
 * normalized = 0.5^gamma. gamma=1 centers it; gamma>1 (brighten) pulls it
 * toward black; gamma<1 (darken) pushes it toward white - the same direction
 * Photoshop's own gray-point slider moves.
 */
function gammaTrackPosition(levels: LevelsSpec): number {
  return levels.black + (levels.white - levels.black) * Math.pow(0.5, levels.gamma)
}

function gammaFromTrackPosition(pos: number, black: number, white: number): number {
  const span = white - black || 1
  const normalized = Math.min(1 - 1e-4, Math.max(1e-4, (pos - black) / span))
  const gamma = Math.log(normalized) / Math.log(0.5)
  return Math.min(MAX_GAMMA, Math.max(MIN_GAMMA, gamma))
}

function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

export function mountLevelsPanel(container: HTMLElement, store: Store): void {
  const wrap = document.createElement('div')
  wrap.className = 'control-slider'
  container.appendChild(wrap)

  const labelRow = document.createElement('div')
  labelRow.className = 'levels-caption-row'
  const labelText = document.createElement('span')
  const resetButton = document.createElement('button')
  resetButton.type = 'button'
  resetButton.className = 'levels-reset-button'
  labelRow.append(labelText, resetButton)
  wrap.appendChild(labelRow)

  const canvasWrap = document.createElement('div')
  canvasWrap.className = 'levels-canvas-wrap glim-well'
  wrap.appendChild(canvasWrap)

  const canvas = document.createElement('canvas')
  canvas.className = 'levels-histogram'
  canvasWrap.appendChild(canvas)

  const track = document.createElement('div')
  track.className = 'levels-track'
  canvasWrap.appendChild(track)

  function makeHandle(modifier: string): HTMLInputElement {
    const input = document.createElement('input')
    input.type = 'range'
    input.className = `levels-handle-input levels-handle-input--${modifier}`
    input.min = '0'
    input.max = '255'
    track.appendChild(input)
    return input
  }
  const blackInput = makeHandle('black')
  const gammaInput = makeHandle('gamma')
  const whiteInput = makeHandle('white')

  function syncHandles(): void {
    const levels = levelsOf(store)
    blackInput.value = String(levels.black)
    whiteInput.value = String(levels.white)
    // The gamma handle's own draggable range is bounded by the current
    // black/white points, not the full 0..255 track - it can never cross
    // either outer point.
    gammaInput.min = String(levels.black)
    gammaInput.max = String(levels.white)
    gammaInput.value = String(Math.round(gammaTrackPosition(levels)))
    const title = `${t('controls.levelsBlack')}: ${levels.black} · ${t('controls.levelsGamma')}: ${levels.gamma.toFixed(2)} · ${t('controls.levelsWhite')}: ${levels.white}`
    blackInput.title = title
    gammaInput.title = title
    whiteInput.title = title
  }

  function commit(patch: Partial<LevelsSpec>): void {
    const next = { ...levelsOf(store), ...patch }
    store.setState({ options: { ...store.getState().options, levels: next } })
    syncHandles()
  }

  // Same gesture-aware undo pattern as numberSlider (controls.ts): snapshot
  // once per drag/keyboard gesture, not once per 'input' tick, so a whole
  // drag undoes as a single step back to the value before the drag began.
  function wireGestureUndo(input: HTMLInputElement): void {
    let committedThisGesture = false
    function commitGestureStart(): void {
      if (committedThisGesture) return
      committedThisGesture = true
      store.commitOptionsSnapshot()
    }
    input.addEventListener('pointerdown', commitGestureStart)
    input.addEventListener('keydown', commitGestureStart)
    input.addEventListener('blur', () => {
      committedThisGesture = false
    })
  }
  wireGestureUndo(blackInput)
  wireGestureUndo(whiteInput)
  wireGestureUndo(gammaInput)

  blackInput.addEventListener('input', () => {
    const white = levelsOf(store).white
    commit({ black: Math.min(Number(blackInput.value), white - 1) })
  })
  whiteInput.addEventListener('input', () => {
    const black = levelsOf(store).black
    commit({ white: Math.max(Number(whiteInput.value), black + 1) })
  })
  gammaInput.addEventListener('input', () => {
    const { black, white } = levelsOf(store)
    commit({ gamma: gammaFromTrackPosition(Number(gammaInput.value), black, white) })
  })
  resetButton.addEventListener('click', () => {
    store.commitOptionsSnapshot()
    commit({ ...IDENTITY_LEVELS })
  })

  // The histogram itself only depends on the active image (recompute on
  // switch), never on the levels values themselves - only the three handle
  // positions above react to those on every drag frame.
  let lastImageId: string | null = null
  let lastHistogram: Uint32Array | null = null

  function drawHistogram(): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const width = canvas.clientWidth || 280
    const height = 64
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
    ctx.clearRect(0, 0, width, height)
    if (!lastHistogram) return
    const max = Math.max(1, ...lastHistogram)
    const barWidth = width / 256
    ctx.fillStyle = cssVar('--accent') || '#FCC419'
    for (let bucket = 0; bucket < 256; bucket++) {
      const count = lastHistogram[bucket] ?? 0
      if (count === 0) continue
      // sqrt compresses tall spikes so smaller buckets next to them stay
      // visible, the same reason most histogram widgets don't plot linearly.
      const barHeight = Math.max(1, Math.round((Math.sqrt(count / max) * height)))
      ctx.fillRect(bucket * barWidth, height - barHeight, Math.max(1, barWidth), barHeight)
    }
  }

  function refreshImage(): void {
    const state = store.getState()
    const activeItem = state.items.find((item) => item.id === state.activeItemId)
    const imageId = activeItem?.imageData ? activeItem.id : null
    if (imageId === lastImageId) return
    lastImageId = imageId
    lastHistogram = activeItem?.imageData ? computeLuminanceHistogram(activeItem.imageData) : null
    drawHistogram()
  }

  store.subscribe(refreshImage)

  function applyLabels(): void {
    labelText.textContent = t('controls.levels')
    resetButton.textContent = t('controls.levelsReset')
    const blackLabel = t('controls.levelsBlack')
    const gammaLabel = t('controls.levelsGamma')
    const whiteLabel = t('controls.levelsWhite')
    blackInput.setAttribute('aria-label', blackLabel)
    gammaInput.setAttribute('aria-label', gammaLabel)
    whiteInput.setAttribute('aria-label', whiteLabel)
    syncHandles()
  }
  applyLabels()
  subscribeLocale(applyLabels)

  refreshImage()
  // The canvas's own clientWidth is 0 until it's actually laid out in the
  // DOM (container.appendChild above only attaches it) - re-measure once
  // after layout so the very first histogram isn't drawn at a 0px width.
  requestAnimationFrame(drawHistogram)

  // Re-syncs the three handle positions after an undo/redo changes `levels`
  // from outside this panel - see state.ts's subscribeHistory doc comment.
  store.subscribeHistory(syncHandles)
}
