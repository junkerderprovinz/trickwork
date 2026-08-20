import type { SharpenMethod } from 'trickwork-core'
import { iconToggleButton, segmentedRow } from './controlWidgets'
import { numberSlider } from './controls'
import { iconColor, iconDither, iconInvert } from './icons'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import { mountLevelsPanel } from './levelsPanel'
import type { Store } from './state'

const SHARPEN_METHODS: { value: SharpenMethod; key: TranslationKey }[] = [
  { value: 'none', key: 'controls.sharpenNone' },
  { value: 'sharpen', key: 'controls.sharpenSharpen' },
  { value: 'unsharp', key: 'controls.sharpenUnsharp' },
]

/** The Filters card: tonal operations (invert/dither/sharpen) plus colour output, matching ASCGen2's Edit > Output submenu. */
export function mountFiltersPanel(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  // Mounted once, OUTSIDE build() below - it holds its own permanent
  // store.subscribe() (to redraw the histogram when the active image
  // changes), so it must not be torn down and recreated on every locale
  // switch the way the plain checkbox/segmented rows in `panel` are. Sits
  // first, matching ASCGen2's own tab order (Levels before Brightness/
  // Contrast/Dither in its Text Settings widget).
  const levelsContainer = document.createElement('div')
  container.appendChild(levelsContainer)
  mountLevelsPanel(levelsContainer, store)

  const panel = document.createElement('div')
  panel.className = 'controls'
  container.appendChild(panel)

  function build(): void {
    eyebrow.textContent = t('tabs.filters')
    panel.innerHTML = ''
    const options = store.getState().options

    // Moved here from the Adjust card, directly under Levels in the same
    // card (jdp: "Die Regler von Helligkeit und Kontrast sollen unter das
    // Tonwertkorrektur, in die gleiche Card") - ASCGen2's own tab order was
    // already Levels before Brightness/Contrast/Dither, so this is the first
    // time TrickWork's own layout actually matches it end to end.
    const brightness = numberSlider(
      t('controls.brightness'),
      -1,
      1,
      options.brightness,
      (value) => {
        store.setState({ options: { ...store.getState().options, brightness: value } })
      },
      0.05,
      () => store.commitOptionsSnapshot(),
    )

    const contrast = numberSlider(
      t('controls.contrast'),
      -1,
      1,
      options.contrast,
      (value) => {
        store.setState({ options: { ...store.getState().options, contrast: value } })
      },
      0.05,
      () => store.commitOptionsSnapshot(),
    )

    const toggleRow = document.createElement('div')
    toggleRow.className = 'icon-toggle-row'

    const invert = iconToggleButton(
      t('controls.invert'),
      iconInvert(),
      !!options.invert,
      (checked) => {
        store.setState({ options: { ...store.getState().options, invert: checked } })
      },
      () => store.commitOptionsSnapshot(),
    )
    const dither = iconToggleButton(
      t('controls.dither'),
      iconDither(),
      !!options.dither,
      (checked) => {
        store.setState({ options: { ...store.getState().options, dither: checked } })
      },
      () => store.commitOptionsSnapshot(),
    )
    const color = iconToggleButton(
      t('controls.color'),
      iconColor(),
      !!options.color,
      (checked) => {
        store.setState({ options: { ...store.getState().options, color: checked } })
      },
      () => store.commitOptionsSnapshot(),
    )
    toggleRow.append(invert, dither, color)
    // The "TXT never carries colour" caveat lives in the Export tab instead,
    // right next to the TXT button it's actually about.

    const sharpenRow = segmentedRow(
      t('controls.sharpen'),
      SHARPEN_METHODS.map((s) => ({ value: s.value, label: t(s.key) })),
      options.sharpen ?? 'none',
      (value) => {
        store.setState({ options: { ...store.getState().options, sharpen: value } })
      },
      () => store.commitOptionsSnapshot(),
    )

    panel.append(brightness, contrast, toggleRow, sharpenRow)
  }

  build()
  subscribeLocale(build)
  // See controls.ts: re-syncs invert/dither/sharpen/color after an undo/
  // redo changes them from outside this panel. levelsPanel.ts wires its own
  // history subscription separately (it isn't rebuilt by this build()).
  store.subscribeHistory(build)
}
