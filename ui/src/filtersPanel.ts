import type { SharpenMethod } from 'trickwork-core'
import { iconToggleButton, segmentedRow } from './controlWidgets'
import { numberSlider } from './controls'
import { subscribeRainbow } from './design/appearance'
import { iconColor, iconDither, iconInvert } from './icons'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import { mountLevelsPanel } from './levelsPanel'
import type { Store } from './state'

const SHARPEN_METHODS: { value: SharpenMethod; key: TranslationKey }[] = [
  { value: 'none', key: 'controls.sharpenNone' },
  { value: 'sharpen', key: 'controls.sharpenSharpen' },
  { value: 'unsharp', key: 'controls.sharpenUnsharp' },
]

// A double-click on the thumb resets to these, the initial values in state.ts.
const DEFAULT_BRIGHTNESS = 0
const DEFAULT_CONTRAST = 0

/** The Filters card: tonal operations (invert/dither/sharpen) plus colour output, matching ASCGen2's Edit > Output submenu. */
export function mountFiltersPanel(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  // Mounted once outside build(), since it keeps its own store subscription
  // for the histogram. Levels comes first, as in ASCGen2.
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

    const brightness = numberSlider(
      t('controls.brightness'),
      -1,
      1,
      options.brightness,
      (value) => {
        store.setState({ options: { ...store.getState().options, brightness: value } })
      },
      0.05,
      () => store.commitOptionsSnapshot(t('history.entryBrightness')),
      0,
      DEFAULT_BRIGHTNESS,
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
      () => store.commitOptionsSnapshot(t('history.entryContrast')),
      1,
      DEFAULT_CONTRAST,
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
      () => store.commitOptionsSnapshot(t('history.entryInvert')),
      0,
    )
    const dither = iconToggleButton(
      t('controls.dither'),
      iconDither(),
      !!options.dither,
      (checked) => {
        store.setState({ options: { ...store.getState().options, dither: checked } })
      },
      () => store.commitOptionsSnapshot(t('history.entryDither')),
      1,
    )
    const color = iconToggleButton(
      t('controls.color'),
      iconColor(),
      !!options.color,
      (checked) => {
        store.setState({ options: { ...store.getState().options, color: checked } })
      },
      () => store.commitOptionsSnapshot(t('history.entryColor')),
      2,
    )
    toggleRow.append(invert, dither, color)

    const sharpenRow = segmentedRow({
      label: t('controls.sharpen'),
      choices: SHARPEN_METHODS.map((s) => ({ value: s.value, label: t(s.key) })),
      value: options.sharpen ?? 'none',
      onChange: (value) => {
        store.setState({ options: { ...store.getState().options, sharpen: value } })
      },
      onBeforeChange: () => store.commitOptionsSnapshot(t('history.entrySharpen')),
      rainbowBaseIndex: 0,
    })

    panel.append(brightness, contrast, toggleRow, sharpenRow)
  }

  build()
  subscribeLocale(build)
  // Re-syncs after an undo or redo; levelsPanel.ts subscribes on its own.
  store.subscribeHistory(build)
  // The widgets read their rainbow colour once, at build time.
  subscribeRainbow(build)
}
