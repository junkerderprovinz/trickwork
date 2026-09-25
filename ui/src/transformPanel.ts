import type { Rotation } from 'trickwork-core'
import { iconToggleButton, segmentedRow } from './controlWidgets'
import { subscribeRainbow } from './design/appearance'
import { iconFlipHorizontal, iconFlipVertical } from './icons'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import type { Store } from './state'

const ROTATIONS: { value: Rotation; key: TranslationKey }[] = [
  { value: 0, key: 'controls.rotate0' },
  { value: 90, key: 'controls.rotate90' },
  { value: 180, key: 'controls.rotate180' },
  { value: 270, key: 'controls.rotate270' },
]

/** The Transform card: geometric operations on the source image (rotate/flip), matching ASCGen2's Edit > Input submenu. */
export function mountTransformPanel(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const panel = document.createElement('div')
  panel.className = 'controls'
  container.appendChild(panel)

  function build(): void {
    eyebrow.textContent = t('tabs.transform')
    panel.innerHTML = ''
    const options = store.getState().options

    const rotateRow = segmentedRow({
      label: t('controls.rotate'),
      choices: ROTATIONS.map((r) => ({ value: String(r.value), label: t(r.key) })),
      value: String(options.rotate ?? 0),
      onChange: (value) => {
        store.setState({ options: { ...store.getState().options, rotate: Number(value) as Rotation } })
      },
      onBeforeChange: (value) => store.commitOptionsSnapshot(t('history.entryRotated', { deg: value })),
      rainbowBaseIndex: 0,
    })

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

    panel.append(rotateRow, flipRow)
  }

  build()
  subscribeLocale(build)
  // Re-syncs after an undo or redo, without rebuilding on every options change,
  // which would break a drag in progress elsewhere.
  store.subscribeHistory(build)
  // The widgets read their rainbow colour once, at build time.
  subscribeRainbow(build)
}
