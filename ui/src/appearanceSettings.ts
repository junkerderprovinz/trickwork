import {
  SHAPES,
  SHAPES_STORED,
  DEFAULT_SHAPE,
  ACCENTS,
  RAINBOW,
  DEFAULT_ACCENT,
  MOTION_LEVELS,
  applyShape,
  applyAccent,
  applyRainbow,
  cacheAppearance,
  leafTap,
  stormTap,
  rainbowState,
  subscribeRainbow,
  type Motion,
  type Shape,
} from './design/appearance'
import { applyDisco, discoTap } from './design/disco'
import { LABEL_MODES, getLabelMode, setLabelMode, type LabelMode } from './design/controls'
import { applyTheme, cacheTheme, cachedThemePref, type ThemePref } from './design/theme'
import { flagEmoji } from './design/flagEmoji'
import { openColorPickerPopover } from './design/colorPicker'
import { infoIcon } from './design/tooltip'
import { customDropdown, glimButton, repaintButtons, segmentedRow, switchRow } from './controlWidgets'
import { setMotion, storedDisco, storedMotion, storeDisco } from './looks'
import { iconReset } from './icons'
import { currentLocale, LOCALES, setLocale, subscribeLocale, t, type TranslationKey } from './i18n'

const APPEARANCE_CACHE_KEY = 'glim-appearance'
const HEX_RE = /^#[0-9a-fA-F]{6}$/

interface CachedAppearance {
  shape?: string
  accent?: string
}

function readCachedAppearance(): CachedAppearance {
  try {
    const raw = localStorage.getItem(APPEARANCE_CACHE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as CachedAppearance
  } catch {
    return {}
  }
}

const SHAPE_KEYS: Record<Shape, TranslationKey> = {
  round: 'appearance.round',
  soft: 'appearance.soft',
  square: 'appearance.square',
  leaf: 'appearance.leaf',
}

const MOTION_KEYS: Record<Motion, TranslationKey> = {
  off: 'appearance.motionOff',
  subtle: 'appearance.motionSubtle',
  wild: 'appearance.motionWild',
  storm: 'appearance.motionStorm',
}

const LABEL_KEYS: Record<LabelMode, TranslationKey> = {
  text: 'appearance.labelText',
  textGlyph: 'appearance.labelTextGlyph',
  glyph: 'appearance.labelGlyph',
  reactive: 'appearance.labelReactive',
}

const THEME_CHOICES: { value: ThemePref; key: TranslationKey }[] = [
  { value: 'dark', key: 'appearance.dark' },
  { value: 'light', key: 'appearance.light' },
  { value: 'system', key: 'appearance.system' },
]

const ACCENT_KEYS: Record<string, TranslationKey> = {
  Sunflower: 'appearance.accentSunflower',
  Blue: 'appearance.accentBlue',
  Green: 'appearance.accentGreen',
  Red: 'appearance.accentRed',
  Purple: 'appearance.accentPurple',
  Orange: 'appearance.accentOrange',
  Teal: 'appearance.accentTeal',
  Magenta: 'appearance.accentMagenta',
}

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * The preset slot a colour belongs to: the nearest by plain squared RGB
 * distance, which only has to be stable across widely separated hues.
 */
function nearestPreset(hex: string): number {
  const [r, g, b] = rgb(hex)
  let best = 0
  let bestDistance = Infinity
  ACCENTS.forEach((preset, i) => {
    const [pr, pg, pb] = rgb(preset.hex)
    const d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
    if (d < bestDistance) {
      bestDistance = d
      best = i
    }
  })
  return best
}

// Where each picker starts in the palette, so stacked pickers do not repeat
// one colour straight down the page.
const HUE_OFFSET = { shape: 0, theme: 3, motion: 5, labels: 1 }

/**
 * Mounts the appearance card. The returned function is for leaving the
 * Settings view: an egg found there is offered only until then.
 */
export function mountAppearanceSettings(container: HTMLElement): () => void {
  const panel = document.createElement('div')
  panel.className = 'appearance-settings'
  container.appendChild(panel)

  const cached = readCachedAppearance()
  let shape: Shape = SHAPES_STORED.includes(cached.shape as Shape) ? (cached.shape as Shape) : DEFAULT_SHAPE
  // '' means no custom accent: cacheAppearance needs a string, and applying ''
  // clears the override.
  let accent = cached.accent && HEX_RE.test(cached.accent) ? cached.accent : ''
  let theme: ThemePref = cachedThemePref()
  let motion: Motion = storedMotion()
  let labelMode: LabelMode = getLabelMode('buttons')
  let discoOn = storedDisco()

  // The eggs are offered while chosen, and otherwise only while this screen
  // stays open, so what was found lives here and never in storage.
  const leafState = { taps: 0 }
  const stormState = { taps: 0 }
  const discoState = { taps: 0, last: 0 }
  let leafFound = shape === 'leaf'
  let stormFound = motion === 'storm'
  let discoFound = discoOn
  // A rebuild would detach the swatch an open picker is anchored to, so the
  // rainbow's own rebuild waits until the picker closes.
  let pickerOpen = false

  function persist(): void {
    cacheAppearance(shape, accent, rainbowState())
    cacheTheme(theme)
  }

  // A locale switch is rare, so the whole panel is rebuilt instead of patching
  // each label.
  function build(): void {
    if (pickerOpen) return
    panel.innerHTML = ''

    const shapes = shape === 'leaf' || leafFound ? [...SHAPES, 'leaf' as const] : SHAPES
    const shapeRow = segmentedRow({
      label: t('appearance.shape'),
      choices: shapes.map((s) => ({ value: s, label: t(SHAPE_KEYS[s]) })),
      value: shape,
      scale: 'big',
      rainbowBaseIndex: HUE_OFFSET.shape,
      onTap: (tapped) => {
        if (!leafTap(leafState, tapped, shape)) return
        leafFound = true
        shape = 'leaf'
        applyShape(shape)
        persist()
        build()
      },
      onChange: (value) => {
        shape = value
        applyShape(shape)
        persist()
      },
    })

    const themeRow = segmentedRow({
      label: t('appearance.theme'),
      choices: THEME_CHOICES.map((c) => ({ value: c.value, label: t(c.key) })),
      value: theme,
      scale: 'big',
      rainbowBaseIndex: HUE_OFFSET.theme,
      onChange: (value) => {
        theme = value
        applyTheme(theme)
        persist()
      },
    })

    const motions = motion === 'storm' || stormFound ? [...MOTION_LEVELS, 'storm' as const] : MOTION_LEVELS
    const motionRow = segmentedRow({
      label: t('appearance.motion'),
      labelExtra: infoIcon(t('appearance.motionHint')),
      choices: motions.map((m) => ({ value: m, label: t(MOTION_KEYS[m]) })),
      value: motion,
      scale: 'big',
      rainbowBaseIndex: HUE_OFFSET.motion,
      onTap: (tapped) => {
        if (!stormTap(stormState, tapped, motion)) return
        stormFound = true
        motion = 'storm'
        setMotion(motion)
        build()
      },
      onChange: (value) => {
        motion = value
        setMotion(motion)
      },
    })

    const labelsRow = segmentedRow({
      label: t('appearance.labels'),
      labelExtra: infoIcon(t('appearance.labelsHint')),
      choices: LABEL_MODES.map((m) => ({ value: m, label: t(LABEL_KEYS[m]) })),
      value: labelMode,
      scale: 'big',
      rainbowBaseIndex: HUE_OFFSET.labels,
      onChange: (value) => {
        labelMode = value
        setLabelMode('buttons', labelMode)
        repaintButtons()
      },
    })

    panel.append(shapeRow, themeRow, motionRow, labelsRow, colourBlock(), languageBlock())
  }

  // The accent row and the palette row: whichever one the rainbow switch does
  // not use is dimmed and inert.
  function colourBlock(): HTMLElement {
    const block = document.createElement('div')
    block.className = 'appearance-colours'
    const rainbowOn = rainbowState().on

    const accentWrap = document.createElement('div')
    accentWrap.className = 'control-slider'
    const accentLabelRow = document.createElement('div')
    accentLabelRow.className = 'control-slider-label-row'
    const accentLabel = document.createElement('span')
    accentLabel.textContent = t('appearance.accent')
    accentLabelRow.appendChild(accentLabel)
    // The bubble explains a temporary state, so it stands only while that
    // state holds, and outside the dimmed parts so it stays readable.
    if (rainbowOn) accentLabelRow.appendChild(infoIcon(t('appearance.accentRainbowHint')))

    const accentRow = document.createElement('div')
    accentRow.className = 'accent-row'
    const live = accent || DEFAULT_ACCENT
    const selected = nearestPreset(live)
    ACCENTS.forEach((preset, i) => {
      const isSelected = i === selected
      // The selected slot wears the live colour, which the picker may have
      // moved off the preset; then the hex is its name.
      const colour = isSelected ? live : preset.hex
      const name =
        isSelected && live.toLowerCase() !== preset.hex.toLowerCase()
          ? live.toUpperCase()
          : t(ACCENT_KEYS[preset.name] ?? 'appearance.accent')
      const sw = document.createElement('button')
      sw.type = 'button'
      sw.className = 'accent-swatch' + (isSelected ? ' accent-swatch--active' : '')
      sw.style.backgroundColor = colour
      sw.setAttribute('data-tip', name)
      sw.setAttribute('aria-label', name)
      sw.setAttribute('aria-pressed', String(isSelected))
      // A click selects, and a click on the one already selected edits it.
      sw.addEventListener('click', () => {
        if (!isSelected) {
          accent = preset.hex
          applyAccent(accent)
          persist()
          build()
          return
        }
        openColorPickerPopover(
          sw,
          live,
          (hex) => {
            accent = hex
            applyAccent(accent)
            persist()
            sw.style.backgroundColor = hex
          },
          build,
        )
      })
      accentRow.appendChild(sw)
    })
    accentRow.appendChild(
      glimButton({
        label: t('appearance.resetToDefault'),
        glyph: iconReset(),
        variant: 'icon',
        onClick: () => {
          accent = ''
          applyAccent(undefined)
          persist()
          build()
        },
      }),
    )
    if (rainbowOn) {
      accentLabel.classList.add('is-dimmed')
      accentRow.classList.add('is-dimmed')
    }
    accentWrap.append(accentLabelRow, accentRow)

    const rainbowWrap = document.createElement('div')
    rainbowWrap.className = 'control-slider'
    const rainbowRow = switchRow(t('appearance.rainbow'), rainbowOn, (checked) => {
      // Counted before the rainbow's rebuild, so the disco row is in it.
      if (discoTap(discoState, checked, { now: performance.now() })) {
        discoFound = true
        discoOn = true
        storeDisco(true)
      }
      // Spread the current state, or the switch would reset a custom palette.
      applyRainbow({ ...rainbowState(), on: checked })
      persist()
      applyDisco(discoOn)
    })

    const paletteRow = document.createElement('div')
    paletteRow.className = 'palette-swatch-row'
    paletteRow.setAttribute('role', 'group')
    paletteRow.setAttribute('aria-label', t('appearance.rainbowPalette'))
    const palette = [...rainbowState().palette]
    // All eight are in force at once, so there is no selection and a click can
    // only mean edit.
    palette.forEach((hex, index) => {
      const sw = document.createElement('button')
      sw.type = 'button'
      sw.className = 'palette-swatch'
      sw.style.backgroundColor = hex
      sw.setAttribute('data-tip', hex.toUpperCase())
      sw.setAttribute('aria-label', hex.toUpperCase())
      sw.addEventListener('click', () => {
        pickerOpen = true
        openColorPickerPopover(
          sw,
          hex,
          (newHex) => {
            palette[index] = newHex
            sw.style.backgroundColor = newHex
            // applyRainbow merges onto the defaults of the off state, so the
            // current state is spread first or an edit would switch it off.
            applyRainbow({ ...rainbowState(), palette: [...palette] })
            persist()
            applyDisco(discoOn)
          },
          () => {
            pickerOpen = false
            build()
          },
        )
      })
      paletteRow.appendChild(sw)
    })
    paletteRow.appendChild(
      glimButton({
        label: t('appearance.resetToDefault'),
        glyph: iconReset(),
        variant: 'icon',
        onClick: () => {
          applyRainbow({ ...rainbowState(), palette: [...RAINBOW] })
          persist()
          applyDisco(discoOn)
        },
      }),
    )
    if (!rainbowOn) paletteRow.classList.add('is-dimmed')
    rainbowWrap.append(rainbowRow, paletteRow)

    block.append(accentWrap, rainbowWrap)

    if (discoFound || discoOn) {
      block.appendChild(
        switchRow(
          t('appearance.disco'),
          discoOn,
          (checked) => {
            discoOn = checked
            storeDisco(discoOn)
            applyDisco(discoOn)
          },
          infoIcon(t('appearance.discoHint')),
        ),
      )
    }
    return block
  }

  function languageBlock(): HTMLElement {
    const languageWrap = document.createElement('div')
    languageWrap.className = 'control-slider'
    const languageLabel = document.createElement('span')
    languageLabel.textContent = t('appearance.language')
    const languageOptions = LOCALES.map((locale) => ({
      value: locale.code,
      label: locale.label,
      flag: flagEmoji(locale.flag),
    }))
    const languageDropdown = customDropdown(languageOptions, currentLocale(), (value) => {
      void setLocale(value)
    }, t('appearance.language'))
    languageWrap.append(languageLabel, languageDropdown)
    return languageWrap
  }

  build()
  subscribeLocale(build)
  subscribeRainbow(build)

  return () => {
    leafFound = shape === 'leaf'
    stormFound = motion === 'storm'
    discoFound = discoOn
    leafState.taps = 0
    stormState.taps = 0
    build()
  }
}
