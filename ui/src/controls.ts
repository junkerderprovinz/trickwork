import { CHARSET_PRESETS, type CharsetPresetKey } from 'trickwork-core'
import { enableSelectScroll } from './design/selectScroll'
import { subscribeLocale, t, type TranslationKey } from './i18n'
import type { Store } from './state'

// Display names for the preset dropdown - CHARSET_PRESETS' own keys are
// lowercase identifiers ("standard", "detailed"), never shown to a user
// directly (that produced an all-lowercase-looking dropdown).
const CHARSET_PRESET_KEYS: Record<CharsetPresetKey, TranslationKey> = {
  standard: 'controls.charsetPresetStandard',
  detailed: 'controls.charsetPresetDetailed',
  blocks: 'controls.charsetPresetBlocks',
  classic: 'controls.charsetPresetClassic',
  alternate: 'controls.charsetPresetAlternate',
  compact: 'controls.charsetPresetCompact',
  bold: 'controls.charsetPresetBold',
  symbols: 'controls.charsetPresetSymbols',
  minimal: 'controls.charsetPresetMinimal',
  binary: 'controls.charsetPresetBinary',
}

const FONT_CHOICES: { key: TranslationKey; family: string }[] = [
  { key: 'controls.fontMonoSystem', family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  { key: 'controls.fontMonoAlt', family: 'Consolas, "Courier New", monospace' },
  { key: 'controls.fontSerif', family: 'ui-serif, Georgia, "Times New Roman", serif' },
  { key: 'controls.fontSans', family: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif' },
]

/** The Adjust card: the core rendering parameters (not transform/filter/colour - see transformPanel.ts/filtersPanel.ts). */
export function mountControls(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const panel = document.createElement('div')
  panel.className = 'controls'
  container.appendChild(panel)

  function build(): void {
    eyebrow.textContent = t('controls.eyebrow')
    panel.innerHTML = ''
    const options = store.getState().options

    const columns = numberSlider(t('controls.width'), 20, 400, options.columns, (value) => {
      store.setState({ options: { ...store.getState().options, columns: value } })
    })

    const brightness = numberSlider(
      t('controls.brightness'),
      -1,
      1,
      options.brightness,
      (value) => {
        store.setState({ options: { ...store.getState().options, brightness: value } })
      },
      0.05,
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
    )

    const charsetWrap = document.createElement('div')
    charsetWrap.className = 'control-slider'
    const charsetLabelText = document.createElement('span')
    charsetLabelText.textContent = t('controls.charset')
    charsetWrap.appendChild(charsetLabelText)

    const charsetSelect = document.createElement('select')
    for (const key of Object.keys(CHARSET_PRESETS) as CharsetPresetKey[]) {
      const opt = document.createElement('option')
      opt.value = key
      opt.textContent = t(CHARSET_PRESET_KEYS[key])
      charsetSelect.appendChild(opt)
    }
    const customOpt = document.createElement('option')
    customOpt.value = 'custom'
    customOpt.textContent = t('controls.charsetPresetCustom')
    charsetSelect.appendChild(customOpt)
    // charsetWrap is a plain <div>, not a <label> - it also holds the ramp's
    // tile buttons and the add-characters field, and a <label> wrapping
    // multiple interactive controls forwards every click to the first one
    // (the exact trap GlimStone's design-language.md calls out for Field).
    // An explicit aria-label keeps the select's accessible name without it.
    charsetSelect.setAttribute('aria-label', t('controls.charset'))
    charsetWrap.appendChild(charsetSelect)
    enableSelectScroll(charsetSelect)

    // The live, editable ramp preview ASCGen2 had (its "Valid Ramp Chars"
    // dialog) and TrickWork didn't: every character actually in play, each
    // rendered at real size in the currently selected font - some presets
    // (the 70-character "detailed" one) are otherwise impossible to judge
    // from a plain option name. Order doesn't matter here: assembleGrid's
    // font-width table re-sorts by measured ink coverage regardless of the
    // order characters arrive in, so this is a set (click a tile to remove
    // it, type to add more), not a sequence to rearrange.
    const ramp = document.createElement('div')
    ramp.className = 'charset-ramp'
    charsetWrap.appendChild(ramp)

    // Lives INSIDE the ramp well, right after the last character - adding
    // and removing both happen in the one preview field instead of a tile
    // grid plus a separate input underneath it.
    const addInput = document.createElement('input')
    addInput.type = 'text'
    addInput.className = 'charset-add-input'
    addInput.placeholder = t('controls.charsetAddPlaceholder')

    function syncCharsetSelect(): void {
      const current = store.getState().options
      const preset = (Object.keys(CHARSET_PRESETS) as CharsetPresetKey[]).find((key) =>
        arraysEqual(CHARSET_PRESETS[key], current.charset),
      )
      charsetSelect.value = preset ?? 'custom'
    }
    syncCharsetSelect()

    function renderRamp(): void {
      const current = store.getState().options
      // Detaching addInput (via innerHTML='') drops its focus even though
      // it's the same node re-appended below - restore it after, so
      // pressing Enter repeatedly to add several characters in a row
      // doesn't kick focus out of the field each time.
      const hadFocus = document.activeElement === addInput
      ramp.innerHTML = ''
      ramp.style.fontFamily = current.font.family
      current.charset.forEach((ch, index) => {
        const tile = document.createElement('button')
        tile.type = 'button'
        tile.className = 'charset-tile'
        // A literal space renders as an invisible button; U+2423 OPEN BOX is
        // the conventional stand-in so the tile still shows something - the
        // actual stored character stays the real space either way.
        tile.textContent = ch === ' ' ? '␣' : ch
        const label = t('controls.charsetRemoveAriaLabel', { char: ch })
        tile.setAttribute('aria-label', label)
        tile.title = label
        tile.addEventListener('click', () => {
          const cur = store.getState().options
          store.setState({ options: { ...cur, charset: cur.charset.filter((_, i) => i !== index) } })
          syncCharsetSelect()
          renderRamp()
        })
        ramp.appendChild(tile)
      })
      ramp.appendChild(addInput)
      if (hadFocus) addInput.focus()
    }
    renderRamp()

    charsetSelect.addEventListener('change', () => {
      const key = charsetSelect.value
      if (key === 'custom') return // nothing to apply yet - edited via the tiles/add field below
      store.setState({
        options: { ...store.getState().options, charset: [...CHARSET_PRESETS[key as CharsetPresetKey]] },
      })
      renderRamp()
    })

    function commitAddInput(): void {
      if (addInput.value.length === 0) return
      const cur = store.getState().options
      // Array.from iterates by code point, so an astral character (emoji)
      // stays one charset entry instead of splitting into two lone
      // surrogates. Only genuinely new characters are appended - a tile
      // already covers "this one is in the ramp", clicking it is how it
      // comes back out.
      const additions = Array.from(addInput.value).filter((ch) => !cur.charset.includes(ch))
      if (additions.length > 0) {
        store.setState({ options: { ...cur, charset: [...cur.charset, ...additions] } })
      }
      addInput.value = ''
      syncCharsetSelect()
      renderRamp()
    }
    addInput.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter') return
      event.preventDefault()
      commitAddInput()
    })
    addInput.addEventListener('blur', commitAddInput)

    const fontLabel = document.createElement('label')
    fontLabel.className = 'control-slider'
    const fontLabelText = document.createElement('span')
    fontLabelText.textContent = t('controls.font')
    fontLabel.appendChild(fontLabelText)
    const fontSelect = document.createElement('select')
    for (const choice of FONT_CHOICES) {
      const opt = document.createElement('option')
      opt.value = choice.family
      opt.textContent = t(choice.key)
      fontSelect.appendChild(opt)
    }
    fontSelect.value = options.font.family
    fontSelect.addEventListener('change', () => {
      const current = store.getState().options
      store.setState({ options: { ...current, font: { ...current.font, family: fontSelect.value } } })
      renderRamp()
    })
    fontLabel.appendChild(fontSelect)
    enableSelectScroll(fontSelect)

    const rtfNote = document.createElement('p')
    rtfNote.className = 'controls-note'
    rtfNote.textContent = t('controls.rtfNote')

    panel.append(columns, brightness, contrast, charsetWrap, fontLabel, rtfNote)
  }

  build()
  subscribeLocale(build)
}

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}

export function numberSlider(
  label: string,
  min: number,
  max: number,
  initial: number,
  onChange: (value: number) => void,
  step = 1,
): HTMLElement {
  const wrapper = document.createElement('label')
  wrapper.className = 'control-slider'

  const row = document.createElement('div')
  row.className = 'control-slider-row'
  const labelText = document.createElement('span')
  labelText.textContent = label
  const valueText = document.createElement('span')
  valueText.className = 'control-slider-value glim-num'
  valueText.textContent = String(initial)
  row.append(labelText, valueText)

  const input = document.createElement('input')
  input.type = 'range'
  input.min = String(min)
  input.max = String(max)
  input.step = String(step)
  input.value = String(initial)
  input.addEventListener('input', () => {
    valueText.textContent = input.value
    onChange(Number(input.value))
  })

  wrapper.append(row, input)
  return wrapper
}
