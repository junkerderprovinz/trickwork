import { normalizeRotation, type Rotation } from 'trickwork-core'
import { iconToggleButton, segmentedRow } from './controlWidgets'
import { subscribeRainbow } from './design/appearance'
import { enableWheelStep } from './design/selectScroll'
import { iconFlipHorizontal, iconFlipVertical } from './icons'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import { replay } from './motion'
import type { Store } from './state'

const ROTATIONS: { value: Rotation; key: TranslationKey }[] = [
  { value: 0, key: 'controls.rotate0' },
  { value: 90, key: 'controls.rotate90' },
  { value: 180, key: 'controls.rotate180' },
  { value: 270, key: 'controls.rotate270' },
]

/** A turn in tenths of a degree within [0, 360), the precision the field offers. */
function tidyTurn(degrees: number): number {
  return normalizeRotation(Math.round(normalizeRotation(degrees) * 10) / 10)
}

/** The typed angle, or null. A comma counts as a decimal point. */
function parseTurn(text: string): number | null {
  const trimmed = text.trim().replace(',', '.').replace('°', '')
  if (!/^[-−]?\d+(\.\d*)?$/.test(trimmed)) return null
  return tidyTurn(Number(trimmed.replace('−', '-')))
}

const isStep = (turn: number): boolean => ROTATIONS.some((r) => r.value === turn)

/** The Transform card: geometric operations on the source image (rotate/flip), matching ASCGen2's Edit > Input submenu. */
export function mountTransformPanel(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const panel = document.createElement('div')
  panel.className = 'controls'
  container.appendChild(panel)

  function setTurn(turn: number): void {
    store.setState({ options: { ...store.getState().options, rotate: turn } })
  }

  // The four steps and a field for any other angle share one row, as the
  // PayPal window's amounts do: a valid angle in the field takes the selection
  // away from the steps, and a step clears the field.
  function rotateBlock(): HTMLElement {
    const turn = tidyTurn(store.getState().options.rotate ?? 0)
    const wrap = document.createElement('div')
    wrap.className = 'control-slider'
    const label = document.createElement('span')
    label.textContent = t('controls.rotate')
    const row = document.createElement('div')
    row.className = 'preset-free-row'

    const field = document.createElement('span')
    field.className = 'free-value'
    const input = document.createElement('input')
    input.type = 'text'
    input.inputMode = 'decimal'
    input.setAttribute('aria-label', t('controls.rotateFree'))
    input.value = isStep(turn) ? '' : String(turn)
    input.classList.toggle('is-active', !isStep(turn))
    const unit = document.createElement('span')
    unit.className = 'free-value-unit'
    unit.setAttribute('aria-hidden', 'true')
    unit.textContent = '°'
    field.append(input, unit)

    function stepRow(value: string): HTMLElement {
      return segmentedRow({
        ariaLabel: t('controls.rotate'),
        choices: ROTATIONS.map((r) => ({ value: String(r.value), label: t(r.key) })),
        value,
        onChange: (next) => {
          setTurn(Number(next))
          input.value = ''
          input.classList.remove('is-active', 'is-invalid')
        },
        onBeforeChange: (next) => store.commitOptionsSnapshot(t('history.entryRotated', { deg: next })),
        rainbowBaseIndex: 0,
      })
    }
    let steps = stepRow(isStep(turn) ? String(turn) : '')
    // The steps are drawn again rather than unmarked, so a click on the step
    // that was chosen before still counts as a change.
    function showStep(value: string): void {
      const next = stepRow(value)
      steps.replaceWith(next)
      steps = next
    }

    // One undo step per visit to the field, not per keystroke.
    let committed = false
    function apply(next: number): void {
      if (!committed) {
        committed = true
        store.commitOptionsSnapshot(t('history.entryRotated', { deg: next }))
      }
      setTurn(next)
      input.classList.add('is-active')
      input.classList.remove('is-invalid')
      if (steps.querySelector('.segmented-button--active')) showStep('')
    }
    function nudge(by: number): void {
      const next = tidyTurn((store.getState().options.rotate ?? 0) + by)
      input.value = String(next)
      apply(next)
    }

    input.addEventListener('input', () => {
      const next = parseTurn(input.value)
      if (next !== null) apply(next)
      else input.classList.toggle('is-invalid', input.value.trim() !== '')
    })
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()
        nudge((event.key === 'ArrowUp' ? 1 : -1) * (event.shiftKey ? 15 : 1))
      } else if (event.key === 'Enter') {
        input.blur()
      }
    })
    enableWheelStep(input, (delta) => nudge(-delta))
    // Leaving the field shows the angle as stored, so -15 reads 345, and hands
    // a quarter turn back to its step. Nothing else is redrawn, or a click on a
    // step that took the focus away would land on a button already replaced.
    input.addEventListener('blur', () => {
      committed = false
      const stored = tidyTurn(store.getState().options.rotate ?? 0)
      // Leaving the field with text that is no angle refuses it visibly.
      if (input.classList.contains('is-invalid')) replay(field, 'glim-shake')
      input.classList.remove('is-invalid')
      if (!isStep(stored)) {
        input.value = String(stored)
        return
      }
      input.value = ''
      if (!input.classList.contains('is-active')) return
      input.classList.remove('is-active')
      showStep(String(stored))
    })

    row.append(steps, field)
    wrap.append(label, row)
    return wrap
  }

  function build(): void {
    eyebrow.textContent = t('tabs.transform')
    panel.innerHTML = ''
    const options = store.getState().options

    const flipRow = document.createElement('div')
    flipRow.className = 'icon-toggle-row'

    const flipH = iconToggleButton(
      t('controls.flipHorizontal'),
      iconFlipHorizontal(),
      !!options.flipHorizontal,
      (checked) => {
        store.setState({ options: { ...store.getState().options, flipHorizontal: checked } })
      },
      () => store.commitOptionsSnapshot(t('history.entryFlipHorizontal')),
      0,
    )
    const flipV = iconToggleButton(
      t('controls.flipVertical'),
      iconFlipVertical(),
      !!options.flipVertical,
      (checked) => {
        store.setState({ options: { ...store.getState().options, flipVertical: checked } })
      },
      () => store.commitOptionsSnapshot(t('history.entryFlipVertical')),
      1,
    )
    flipRow.append(flipH, flipV)

    panel.append(rotateBlock(), flipRow)
  }

  build()
  subscribeLocale(build)
  // Re-syncs after an undo or redo, without rebuilding on every options change,
  // which would break a drag in progress elsewhere.
  store.subscribeHistory(build)
  // The widgets read their rainbow colour once, at build time.
  subscribeRainbow(build)
}
