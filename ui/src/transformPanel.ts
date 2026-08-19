import type { Rotation } from 'trickwork-core'
import { checkboxRow, segmentedRow } from './controlWidgets'
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

    const rotateRow = segmentedRow(
      t('controls.rotate'),
      ROTATIONS.map((r) => ({ value: String(r.value), label: t(r.key) })),
      String(options.rotate ?? 0),
      (value) => {
        store.setState({ options: { ...store.getState().options, rotate: Number(value) as Rotation } })
      },
    )

    const flipH = checkboxRow(
      t('controls.flipHorizontal'),
      !!options.flipHorizontal,
      (checked) => {
        store.setState({ options: { ...store.getState().options, flipHorizontal: checked } })
      },
      iconFlipHorizontal(),
    )
    const flipV = checkboxRow(
      t('controls.flipVertical'),
      !!options.flipVertical,
      (checked) => {
        store.setState({ options: { ...store.getState().options, flipVertical: checked } })
      },
      iconFlipVertical(),
    )

    panel.append(rotateRow, flipH, flipV)
  }

  build()
  subscribeLocale(build)
}
