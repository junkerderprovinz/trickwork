// ASCGen2's Levels control, a histogram with black, gamma and white handles,
// shown inside the Filters card instead of a separate dialog.

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
 * Where the midtone handle sits on the 0..255 track: the input applyLevels
 * maps to 0.5, which is 0.5^gamma of the span. A gamma above 1 pulls it toward
 * black, as Photoshop's gray point moves.
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

  // The well frames only the histogram; the handles sit on the card surface.
  const canvasWrap = document.createElement('div')
  canvasWrap.className = 'levels-canvas-wrap glim-well'
  wrap.appendChild(canvasWrap)

  const canvas = document.createElement('canvas')
  canvas.className = 'levels-histogram'
  canvasWrap.appendChild(canvas)

  const track = document.createElement('div')
  track.className = 'levels-track'
  wrap.appendChild(track)

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

  // The values stay visible rather than behind a hover, as in ASCGen2.
  const readoutRow = document.createElement('div')
  readoutRow.className = 'levels-readout-row'
  const blackReadout = document.createElement('span')
  blackReadout.className = 'levels-readout levels-readout--black glim-num'
  const gammaReadout = document.createElement('span')
  gammaReadout.className = 'levels-readout levels-readout--gamma glim-num'
  const whiteReadout = document.createElement('span')
  whiteReadout.className = 'levels-readout levels-readout--white glim-num'
  readoutRow.append(blackReadout, gammaReadout, whiteReadout)
  wrap.appendChild(readoutRow)

  function syncHandles(): void {
    const levels = levelsOf(store)
    blackInput.value = String(levels.black)
    whiteInput.value = String(levels.white)
    // The gamma handle stays between the black and white points.
    gammaInput.min = String(levels.black)
    gammaInput.max = String(levels.white)
    gammaInput.value = String(Math.round(gammaTrackPosition(levels)))
    const title = `${t('controls.levelsBlack')}: ${levels.black} · ${t('controls.levelsGamma')}: ${levels.gamma.toFixed(2)} · ${t('controls.levelsWhite')}: ${levels.white}`
    blackInput.title = title
    gammaInput.title = title
    whiteInput.title = title
    blackReadout.textContent = String(levels.black)
    gammaReadout.textContent = levels.gamma.toFixed(2)
    whiteReadout.textContent = String(levels.white)
  }

  function commit(patch: Partial<LevelsSpec>): void {
    const next = { ...levelsOf(store), ...patch }
    store.setState({ options: { ...store.getState().options, levels: next } })
    syncHandles()
  }

  // One undo step per drag or keyboard gesture, as in numberSlider.
  function wireGestureUndo(input: HTMLInputElement): void {
    let committedThisGesture = false
    function commitGestureStart(): void {
      if (committedThisGesture) return
      committedThisGesture = true
      store.commitOptionsSnapshot(t('history.entryLevels'))
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

  // A double-click resets one handle; the Reset button resets all three.
  blackInput.addEventListener('dblclick', () => {
    if (levelsOf(store).black === IDENTITY_LEVELS.black) return
    store.commitOptionsSnapshot(t('history.entryLevels'))
    commit({ black: IDENTITY_LEVELS.black })
  })
  whiteInput.addEventListener('dblclick', () => {
    if (levelsOf(store).white === IDENTITY_LEVELS.white) return
    store.commitOptionsSnapshot(t('history.entryLevels'))
    commit({ white: IDENTITY_LEVELS.white })
  })
  gammaInput.addEventListener('dblclick', () => {
    if (levelsOf(store).gamma === IDENTITY_LEVELS.gamma) return
    store.commitOptionsSnapshot(t('history.entryLevels'))
    commit({ gamma: IDENTITY_LEVELS.gamma })
  })

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
    store.commitOptionsSnapshot(t('history.entryLevelsReset'))
    commit({ ...IDENTITY_LEVELS })
  })

  // The histogram depends on the active image only.
  let lastImageId: string | null = null
  let lastHistogram: Uint32Array | null = null

  function drawHistogram(): void {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // The buffer follows the laid-out CSS box times the device pixel ratio,
    // since a canvas stretched by CSS or drawn at 1x on a scaled display blurs.
    const width = canvas.clientWidth || 280
    const height = canvas.clientHeight || 84
    const dpr = window.devicePixelRatio || 1
    const bufferWidth = Math.round(width * dpr)
    const bufferHeight = Math.round(height * dpr)
    if (canvas.width !== bufferWidth) canvas.width = bufferWidth
    if (canvas.height !== bufferHeight) canvas.height = bufferHeight
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, width, height)
    if (!lastHistogram) return
    const max = Math.max(1, ...lastHistogram)
    const barWidth = width / 256
    ctx.fillStyle = cssVar('--accent') || '#FCC419'
    // Log scale, so the long tail of small counts stays visible next to the
    // few tall peaks of a photo.
    const logMax = Math.log1p(max)
    for (let bucket = 0; bucket < 256; bucket++) {
      const count = lastHistogram[bucket] ?? 0
      if (count === 0) continue
      const barHeight = Math.max(2, Math.round((Math.log1p(count) / logMax) * height))
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
  // clientWidth is 0 until layout, so draw again after the first frame.
  requestAnimationFrame(drawHistogram)

  // Re-syncs the handles after an undo or redo.
  store.subscribeHistory(syncHandles)
}
