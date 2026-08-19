// ui/src/presetsPanel.ts
//
// Save/load the full generation-affecting `options` object as a shareable
// JSON file - goes beyond ASCGen2's own settings.dat, which only persisted a
// handful of fields (not even the character set) and couldn't be shared or
// swapped between multiple named presets at all. Lives in the Settings view
// as its own card (a global, non-preview action, same footing as Shape/
// Theme/Accent/Language), not folded into the Adjust card.

import type { MappingOptions } from 'trickwork-core'
import { downloadBlob } from './download'
import { subscribeLocale, t } from './i18n'
import type { Store } from './state'

const PRESET_FORMAT_VERSION = 1

interface PresetFile {
  trickworkPreset: number
  options: MappingOptions
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * Rebuilds a MappingOptions from untrusted parsed JSON field by field,
 * accepting only well-formed values - a hand-edited or corrupted file must
 * fail closed (null) rather than hand assembleGrid something that crashes it
 * mid-render (e.g. columns: 0, or a charset that isn't actually an array).
 */
function validateOptions(value: unknown): MappingOptions | null {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>

  if (!isFiniteNumber(v.columns) || v.columns <= 0) return null
  if (!isFiniteNumber(v.brightness)) return null
  if (!isFiniteNumber(v.contrast)) return null
  if (
    !Array.isArray(v.charset) ||
    v.charset.length === 0 ||
    !v.charset.every((ch) => typeof ch === 'string' && ch.length >= 1)
  ) {
    return null
  }
  if (!v.font || typeof v.font !== 'object') return null
  const font = v.font as Record<string, unknown>
  if (typeof font.family !== 'string' || !isFiniteNumber(font.sizePx)) return null

  const options: MappingOptions = {
    columns: v.columns,
    brightness: v.brightness,
    contrast: v.contrast,
    charset: v.charset as string[],
    font: { family: font.family, sizePx: font.sizePx },
  }

  if (typeof v.color === 'boolean') options.color = v.color
  if (typeof v.dither === 'boolean') options.dither = v.dither
  if (v.rotate === 0 || v.rotate === 90 || v.rotate === 180 || v.rotate === 270) options.rotate = v.rotate
  if (typeof v.flipHorizontal === 'boolean') options.flipHorizontal = v.flipHorizontal
  if (typeof v.flipVertical === 'boolean') options.flipVertical = v.flipVertical
  if (typeof v.invert === 'boolean') options.invert = v.invert
  if (v.sharpen === 'none' || v.sharpen === 'sharpen' || v.sharpen === 'unsharp') options.sharpen = v.sharpen
  if (v.levels && typeof v.levels === 'object') {
    const levels = v.levels as Record<string, unknown>
    if (isFiniteNumber(levels.black) && isFiniteNumber(levels.gamma) && isFiniteNumber(levels.white)) {
      options.levels = { black: levels.black, gamma: levels.gamma, white: levels.white }
    }
  }

  return options
}

/** Exported for direct unit testing - see presetsPanel.test.ts. */
export function parsePresetFile(text: string): MappingOptions | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return null
  }
  if (!parsed || typeof parsed !== 'object') return null
  const obj = parsed as Record<string, unknown>
  if (typeof obj.trickworkPreset !== 'number') return null
  return validateOptions(obj.options)
}

export function mountPresetsPanel(container: HTMLElement, store: Store): void {
  const eyebrow = document.createElement('div')
  eyebrow.className = 'glim-eyebrow'
  container.appendChild(eyebrow)

  const panel = document.createElement('div')
  panel.className = 'presets-panel'
  container.appendChild(panel)

  const buttonRow = document.createElement('div')
  buttonRow.className = 'presets-button-row'

  const exportButton = document.createElement('button')
  exportButton.type = 'button'
  const importButton = document.createElement('button')
  importButton.type = 'button'
  buttonRow.append(exportButton, importButton)

  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = 'application/json,.json'
  fileInput.style.display = 'none'

  const summary = document.createElement('p')
  summary.className = 'controls-note'

  panel.append(buttonRow, fileInput, summary)

  exportButton.addEventListener('click', () => {
    void (async () => {
      const options = store.getState().options
      const file: PresetFile = { trickworkPreset: PRESET_FORMAT_VERSION, options }
      const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
      const delivered = await downloadBlob(blob, 'trickwork-preset.json')
      summary.textContent = t(delivered ? 'presets.exported' : 'presets.exportCancelled')
    })()
  })

  importButton.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', () => {
    void (async () => {
      const file = fileInput.files?.[0]
      fileInput.value = ''
      if (!file) return
      const text = await file.text()
      const options = parsePresetFile(text)
      if (!options) {
        summary.textContent = t('presets.importInvalid')
        return
      }
      // A whole-settings swap is exactly the kind of change a user wants to
      // step back from with Ctrl+Z if the loaded preset turns out wrong -
      // replaceOptions() gets that AND re-syncs every control's displayed
      // value, the same as an undo/redo jump (see state.ts).
      store.replaceOptions(options)
      summary.textContent = t('presets.imported')
    })()
  })

  function applyLabels(): void {
    eyebrow.textContent = t('presets.eyebrow')
    exportButton.textContent = t('presets.exportButton')
    importButton.textContent = t('presets.importButton')
    fileInput.setAttribute('aria-label', t('presets.importButton'))
  }
  applyLabels()
  subscribeLocale(applyLabels)
}
