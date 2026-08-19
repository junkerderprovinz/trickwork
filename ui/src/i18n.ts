// ui/src/i18n.ts
//
// BombVault's i18n.ts is React-Context-based (createContext/useState), which
// doesn't transplant to this app's vanilla-TS + Store architecture (see
// state.ts - reactivity here is a module-level Set<Listener> + notify()).
// This is the same idea built on that same shape: a second, independent
// reactive source alongside Store, since image-conversion state and UI-
// language state are unrelated concerns that shouldn't trigger each other.

// en + de are the two source-of-truth languages and stay in the main bundle,
// mirroring BombVault's own i18n.ts exactly. The other 24 are lazy-loaded so
// a visitor who reads one language never downloads the other 24 (a prior
// project's main bundle grew ~150kB from eager-importing every locale).
export const en = {
  'app.tagline': 'Image to ASCII art',

  'tabs.adjust': 'Adjust',
  'tabs.transform': 'Transform',
  'tabs.filters': 'Filters',
  'nav.convert': 'Convert',
  'nav.settings': 'Settings',

  'import.eyebrow': 'Import',
  'import.dropzoneText': 'Drop images here, or click to choose files',
  'import.ariaLabel': 'Choose image files to convert',

  'preview.eyebrow': 'Preview',
  'preview.empty': 'Drop an image above to see it here as ASCII art.',

  'controls.eyebrow': 'Controls',
  'controls.width': 'Width (columns)',
  'controls.brightness': 'Brightness',
  'controls.contrast': 'Contrast',
  'controls.charset': 'Character set',
  'controls.charsetCustomPlaceholder': 'darkest..lightest characters',
  'controls.charsetAddPlaceholder': 'Add characters…',
  'controls.charsetRemoveAriaLabel': 'Remove "{char}" from the character set',
  'controls.font': 'Font',
  'controls.fontMonoSystem': 'Monospace (system)',
  'controls.fontMonoAlt': 'Monospace (alt)',
  'controls.fontSerif': 'Serif (proportional)',
  'controls.fontSans': 'Sans (proportional)',
  'controls.rtfNote':
    'Note: RTF export always renders in a fixed monospace font, regardless of the font selected above - most RTF readers cannot reliably honor an arbitrary proportional font.',
  'controls.transform': 'Transform',
  'controls.rotate': 'Rotate',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Flip horizontal',
  'controls.flipVertical': 'Flip vertical',
  'controls.filters': 'Filters',
  'controls.invert': 'Invert colors',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Sharpening',
  'controls.sharpenNone': 'None',
  'controls.sharpenSharpen': 'Sharpen',
  'controls.sharpenUnsharp': 'Unsharp mask',
  'controls.color': 'Color output',
  'controls.colorTxtNote':
    'Note: TXT export is always plain text - color is not carried. Use XHTML, RTF, or PNG for colored output.',

  'queue.eyebrow': 'Queue',
  'queue.empty': 'No images yet.',
  'queue.statusPending': 'pending',
  'queue.statusConverting': 'converting',
  'queue.statusConverted': 'converted',
  'queue.statusExported': 'exported',
  'queue.statusError': 'error',
  'queue.errorPrefix': 'error: {message}',
  'queue.errorUnknown': 'unknown',
  'queue.downscaledTitle':
    'This image exceeded the maximum working dimension and was automatically downscaled before conversion.',
  'queue.downscaledLabel': 'downscaled',
  'queue.previewAriaLabel': 'Preview {name}',

  'export.eyebrow': 'Export',
  'export.formatAriaLabel': 'Export active image as {format}',
  'export.batchButton': 'Export all queued images as TXT',
  'export.noActiveImage': 'No active image to export.',
  'export.cancelled': 'Export of "{name}" cancelled.',
  'export.exported': 'Exported "{name}" as {format}.',
  'export.failed': 'Export failed: {error}',
  'export.batchSummary': 'Batch export: {succeeded} succeeded, {failed} failed{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} cancelled',

  'appearance.eyebrow': 'Appearance',
  'appearance.shape': 'Shape',
  'appearance.round': 'Round',
  'appearance.soft': 'Soft',
  'appearance.square': 'Square',
  'appearance.theme': 'Theme',
  'appearance.dark': 'Dark',
  'appearance.light': 'Light',
  'appearance.system': 'System',
  'appearance.accent': 'Accent',
  'appearance.accentSunflower': 'Sunflower',
  'appearance.accentBlue': 'Blue',
  'appearance.accentGreen': 'Green',
  'appearance.accentRed': 'Red',
  'appearance.accentPurple': 'Purple',
  'appearance.resetToDefault': 'Reset to default',
  'appearance.language': 'Language',
}

export type TranslationKey = keyof typeof en
export type Translations = Partial<Record<TranslationKey, string>>

export const de: Translations = {
  'app.tagline': 'Bild zu ASCII-Kunst',

  'tabs.adjust': 'Anpassen',
  'tabs.transform': 'Transformation',
  'tabs.filters': 'Filter',
  'nav.convert': 'Konvertieren',
  'nav.settings': 'Einstellungen',

  'import.eyebrow': 'Import',
  'import.dropzoneText': 'Bilder hierher ziehen oder klicken zum Auswählen',
  'import.ariaLabel': 'Bilddateien zum Konvertieren auswählen',

  'preview.eyebrow': 'Vorschau',
  'preview.empty': 'Ziehe oben ein Bild hinein, um es hier als ASCII-Kunst zu sehen.',

  'controls.eyebrow': 'Regler',
  'controls.width': 'Breite (Spalten)',
  'controls.brightness': 'Helligkeit',
  'controls.contrast': 'Kontrast',
  'controls.charset': 'Zeichensatz',
  'controls.charsetCustomPlaceholder': 'dunkelste..hellste Zeichen',
  'controls.charsetAddPlaceholder': 'Zeichen hinzufügen…',
  'controls.charsetRemoveAriaLabel': '"{char}" aus dem Zeichensatz entfernen',
  'controls.font': 'Schriftart',
  'controls.fontMonoSystem': 'Monospace (System)',
  'controls.fontMonoAlt': 'Monospace (alternativ)',
  'controls.fontSerif': 'Serif (proportional)',
  'controls.fontSans': 'Sans (proportional)',
  'controls.rtfNote':
    'Hinweis: Der RTF-Export wird immer in einer festen Monospace-Schrift gerendert, unabhängig von der oben gewählten Schrift - die meisten RTF-Leser können keine beliebige proportionale Schrift zuverlässig darstellen.',
  'controls.transform': 'Transformation',
  'controls.rotate': 'Drehen',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Horizontal spiegeln',
  'controls.flipVertical': 'Vertikal spiegeln',
  'controls.filters': 'Filter',
  'controls.invert': 'Farben invertieren',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Schärfen',
  'controls.sharpenNone': 'Keins',
  'controls.sharpenSharpen': 'Schärfen',
  'controls.sharpenUnsharp': 'Unscharf maskieren',
  'controls.color': 'Farbausgabe',
  'controls.colorTxtNote':
    'Hinweis: Der TXT-Export ist immer reiner Text - Farbe wird nicht übertragen. Für farbige Ausgabe XHTML, RTF oder PNG verwenden.',

  'queue.eyebrow': 'Warteschlange',
  'queue.empty': 'Noch keine Bilder.',
  'queue.statusPending': 'wartend',
  'queue.statusConverting': 'wird konvertiert',
  'queue.statusConverted': 'konvertiert',
  'queue.statusExported': 'exportiert',
  'queue.statusError': 'Fehler',
  'queue.errorPrefix': 'Fehler: {message}',
  'queue.errorUnknown': 'unbekannt',
  'queue.downscaledTitle':
    'Dieses Bild überschritt die maximale Arbeitsgröße und wurde vor der Konvertierung automatisch verkleinert.',
  'queue.downscaledLabel': 'verkleinert',
  'queue.previewAriaLabel': '{name} als Vorschau anzeigen',

  'export.eyebrow': 'Export',
  'export.formatAriaLabel': 'Aktives Bild als {format} exportieren',
  'export.batchButton': 'Alle Bilder in der Warteschlange als TXT exportieren',
  'export.noActiveImage': 'Kein aktives Bild zum Exportieren.',
  'export.cancelled': 'Export von "{name}" abgebrochen.',
  'export.exported': '"{name}" als {format} exportiert.',
  'export.failed': 'Export fehlgeschlagen: {error}',
  'export.batchSummary': 'Batch-Export: {succeeded} erfolgreich, {failed} fehlgeschlagen{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} abgebrochen',

  'appearance.eyebrow': 'Erscheinungsbild',
  'appearance.shape': 'Form',
  'appearance.round': 'Rund',
  'appearance.soft': 'Weich',
  'appearance.square': 'Eckig',
  'appearance.theme': 'Thema',
  'appearance.dark': 'Dunkel',
  'appearance.light': 'Hell',
  'appearance.system': 'System',
  'appearance.accent': 'Akzent',
  'appearance.accentSunflower': 'Sonnenblume',
  'appearance.accentBlue': 'Blau',
  'appearance.accentGreen': 'Grün',
  'appearance.accentRed': 'Rot',
  'appearance.accentPurple': 'Lila',
  'appearance.resetToDefault': 'Auf Standard zurücksetzen',
  'appearance.language': 'Sprache',
}

export interface LocaleInfo {
  code: string
  label: string
  flag: string
}

// Identical 26-entry set BombVault ships (web/src/lib/i18n.ts's LOCALES),
// per jdp's explicit "genau wie BombVault" scoping decision.
export const LOCALES: LocaleInfo[] = [
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'es', label: 'Español', flag: 'es' },
  { code: 'it', label: 'Italiano', flag: 'it' },
  { code: 'pt', label: 'Português', flag: 'pt' },
  { code: 'nl', label: 'Nederlands', flag: 'nl' },
  { code: 'pl', label: 'Polski', flag: 'pl' },
  { code: 'ru', label: 'Русский', flag: 'ru' },
  { code: 'uk', label: 'Українська', flag: 'ua' },
  { code: 'cs', label: 'Čeština', flag: 'cz' },
  { code: 'sv', label: 'Svenska', flag: 'se' },
  { code: 'da', label: 'Dansk', flag: 'dk' },
  { code: 'fi', label: 'Suomi', flag: 'fi' },
  { code: 'no', label: 'Norsk', flag: 'no' },
  { code: 'tr', label: 'Türkçe', flag: 'tr' },
  { code: 'el', label: 'Ελληνικά', flag: 'gr' },
  { code: 'hu', label: 'Magyar', flag: 'hu' },
  { code: 'ro', label: 'Română', flag: 'ro' },
  { code: 'ja', label: '日本語', flag: 'jp' },
  { code: 'ko', label: '한국어', flag: 'kr' },
  { code: 'zh', label: '中文', flag: 'cn' },
  { code: 'ar', label: 'العربية', flag: 'sa' },
  { code: 'he', label: 'עברית', flag: 'il' },
  { code: 'th', label: 'ไทย', flag: 'th' },
  { code: 'vi', label: 'Tiếng Việt', flag: 'vn' },
]

const LAZY_LOCALES: Record<string, () => Promise<{ default: Translations }>> = {
  fr: () => import('./locales/fr'),
  es: () => import('./locales/es'),
  it: () => import('./locales/it'),
  pt: () => import('./locales/pt'),
  nl: () => import('./locales/nl'),
  pl: () => import('./locales/pl'),
  ru: () => import('./locales/ru'),
  uk: () => import('./locales/uk'),
  cs: () => import('./locales/cs'),
  sv: () => import('./locales/sv'),
  da: () => import('./locales/da'),
  fi: () => import('./locales/fi'),
  no: () => import('./locales/no'),
  tr: () => import('./locales/tr'),
  el: () => import('./locales/el'),
  hu: () => import('./locales/hu'),
  ro: () => import('./locales/ro'),
  ja: () => import('./locales/ja'),
  ko: () => import('./locales/ko'),
  zh: () => import('./locales/zh'),
  ar: () => import('./locales/ar'),
  he: () => import('./locales/he'),
  th: () => import('./locales/th'),
  vi: () => import('./locales/vi'),
}

const CACHE_KEY = 'trickwork-locale'

let currentCode = 'en'
let currentDict: Translations = en
const loadedLocales = new Map<string, Translations>([
  ['en', en],
  ['de', de],
])
const listeners = new Set<() => void>()

export function subscribeLocale(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notifyLocale(): void {
  for (const fn of listeners) fn()
}

export function currentLocale(): string {
  return currentCode
}

/**
 * Synchronous by design: every mount*() function calls this directly while
 * building its DOM tree. Falls back through the active dictionary to en for
 * any key the active locale hasn't got - this is also exactly what the
 * parity test (i18n.parity.test.ts) exists to make unreachable for a
 * complete locale.
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const template = currentDict[key] ?? en[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

/**
 * Dynamically imports the target locale (a no-op if already cached this
 * session), swaps the active dictionary, and notifies subscribers. Until the
 * import resolves, t() keeps returning the PREVIOUS language's strings, not
 * English and not raw keys - matching BombVault's own documented lazy-load
 * behaviour.
 */
export async function setLocale(code: string): Promise<void> {
  if (!LOCALES.some((l) => l.code === code)) return

  const cached = loadedLocales.get(code)
  if (cached) {
    currentCode = code
    currentDict = cached
    persistLocale(code)
    notifyLocale()
    return
  }

  const loader = LAZY_LOCALES[code]
  if (!loader) return
  const module = await loader()
  loadedLocales.set(code, module.default)
  currentCode = code
  currentDict = module.default
  persistLocale(code)
  notifyLocale()
}

function persistLocale(code: string): void {
  try {
    localStorage.setItem(CACHE_KEY, code)
  } catch {
    // A browser with storage disabled just re-detects on next load.
  }
}

/** Applied at boot, before the app renders anything. */
export function applyCachedLocale(): void {
  let code: string | null = null
  try {
    code = localStorage.getItem(CACHE_KEY)
  } catch {
    code = null
  }
  if (code && code !== 'en' && LOCALES.some((l) => l.code === code)) {
    void setLocale(code)
  }
}
