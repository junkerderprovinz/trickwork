import type { SharpenMethod } from 'trickwork-core'
import { checkboxRow, segmentedRow } from './controlWidgets'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import type { Store } from './state'

const SHARPEN_METHODS: { value: SharpenMethod; key: TranslationKey }[] = [
  { value: 'none', key: 'controls.sharpenNone' },
  { value: 'sharpen', key: 'controls.sharpenSharpen' },
  { value: 'unsharp', key: 'controls.sharpenUnsharp' },
]

/** The Filters tab: tonal operations (invert/dither/sharpen) plus colour output, matching ASCGen2's Edit > Output submenu. */
export function mountFiltersPanel(container: HTMLElement, store: Store): void {
  const panel = document.createElement('div')
  panel.className = 'controls'
  container.appendChild(panel)

  function build(): void {
    panel.innerHTML = ''
    const options = store.getState().options

    const invert = checkboxRow(t('controls.invert'), !!options.invert, (checked) => {
      store.setState({ options: { ...store.getState().options, invert: checked } })
    })
    const dither = checkboxRow(t('controls.dither'), !!options.dither, (checked) => {
      store.setState({ options: { ...store.getState().options, dither: checked } })
    })

    const sharpenRow = segmentedRow(
      t('controls.sharpen'),
      SHARPEN_METHODS.map((s) => ({ value: s.value, label: t(s.key) })),
      options.sharpen ?? 'none',
      (value) => {
        store.setState({ options: { ...store.getState().options, sharpen: value } })
      },
    )

    const color = checkboxRow(t('controls.color'), !!options.color, (checked) => {
      store.setState({ options: { ...store.getState().options, color: checked } })
    })
    // The "TXT never carries colour" caveat lives in the Export tab instead,
    // right next to the TXT button it's actually about.

    panel.append(invert, dither, sharpenRow, color)
  }

  build()
  subscribeLocale(build)
}
