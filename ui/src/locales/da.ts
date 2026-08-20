// ui/src/locales/da.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'Billede til ASCII-kunst',

  'tabs.adjust': 'Juster',
  'tabs.transform': 'Transformer',
  'tabs.filters': 'Filtre',
  'nav.convert': 'Konverter',
  'nav.settings': 'Indstillinger',
  'nav.backToConvert': 'Tilbage',
  'nav.undo': 'Fortryd',
  'nav.redo': 'Gentag',

  'history.eyebrow': 'Historik',

  'history.entryWidth': 'Bredde ændret',

  'history.entryCharsetEdited': 'Tegnsæt redigeret',

  'history.entryCharsetPreset': 'Tegnsæt: {preset}',

  'history.entryFont': 'Skrifttype ændret',

  'history.entryRotated': 'Drejet {deg}°',

  'history.entryFlipHorizontal': 'Vendt vandret',

  'history.entryFlipVertical': 'Vendt lodret',

  'history.entryBrightness': 'Lysstyrke ændret',

  'history.entryContrast': 'Kontrast ændret',

  'history.entryInvert': 'Invertering skiftet',

  'history.entryDither': 'Dithering skiftet',

  'history.entryColor': 'Farveudskrift skiftet',

  'history.entrySharpen': 'Skarphed ændret',

  'history.entryLevels': 'Toner justeret',

  'history.entryLevelsReset': 'Toner nulstillet',

  'history.entryCrop': 'Beskæring ændret',

  'history.entryCropCleared': 'Beskæring fjernet',

  'history.entrySettingsImported': 'Indstillinger importeret',

  'history.logEmpty': 'Ingen ændringer endnu.',

  'import.eyebrow': 'Importer',
  'import.dropzoneText': 'Slip billeder her, eller klik for at vælge filer',
  'import.ariaLabel': 'Vælg billedfiler der skal konverteres',

  'crop.eyebrow': 'Beskæring',
  'crop.hint': 'Træk hen over billedet ovenfor for kun at konvertere det område.',
  'crop.clearButton': 'Ryd markering',

  'preview.eyebrow': 'Forhåndsvisning',
  'preview.empty': 'Slip et billede ovenfor for at se det her som ASCII-kunst.',
  'preview.zoomOut': 'Zoom ud',
  'preview.zoomIn': 'Zoom ind',
  'preview.zoomReset': 'Nulstil zoom til 100 %',
  'preview.copy': 'Kopiér til udklipsholder',
  'preview.copied': 'Kopieret!',

  'controls.eyebrow': 'Indstillinger',
  'controls.width': 'Bredde (kolonner)',
  'controls.brightness': 'Lysstyrke',
  'controls.contrast': 'Kontrast',
  'controls.charset': 'Tegnsæt',
  'controls.charsetPresetLabel': 'Tegnsæt-forudindstilling',
  'controls.charsetPresetStandard': 'Standard',
  'controls.charsetPresetDetailed': 'Detaljeret',
  'controls.charsetPresetBlocks': 'Blokke',
  'controls.charsetPresetClassic': 'Klassisk',
  'controls.charsetPresetAlternate': 'Alternativ',
  'controls.charsetPresetCompact': 'Kompakt',
  'controls.charsetPresetBold': 'Fed',
  'controls.charsetPresetSymbols': 'Symboler',
  'controls.charsetPresetMinimal': 'Minimal',
  'controls.charsetPresetBinary': 'Binær',
  'controls.font': 'Skrifttype',
  'controls.fontMonoSystem': 'Monospace (system)',
  'controls.fontMonoAlt': 'Monospace (alt)',
  'controls.fontSerif': 'Serif (proportional)',
  'controls.fontSans': 'Sans (proportional)',
  'controls.rtfNote':
    'Bemærk: RTF-eksport gengives altid med en fast monospace-skrifttype, uanset hvilken skrifttype der er valgt ovenfor, de fleste RTF-læsere kan ikke pålideligt vise en vilkårlig proportional skrifttype.',
  'controls.transform': 'Transformer',
  'controls.rotate': 'Rotér',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Vend vandret',
  'controls.flipVertical': 'Vend lodret',
  'controls.filters': 'Filtre',
  'controls.levels': 'Toner',
  'controls.levelsBlack': 'Sortpunkt',
  'controls.levelsGamma': 'Mellemtoner (gamma)',
  'controls.levelsWhite': 'Hvidpunkt',
  'controls.levelsReset': 'Nulstil',
  'controls.invert': 'Invertér farver',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Skarphed',
  'controls.sharpenNone': 'Ingen',
  'controls.sharpenSharpen': 'Skærp',
  'controls.sharpenUnsharp': 'Uskarp maske',
  'controls.color': 'Farveudskrift',
  'controls.colorTxtNote':
    'Bemærk: TXT-eksport er altid almindelig tekst, farve bevares ikke. Brug XHTML, RTF eller PNG til farvet output.',

  'queue.eyebrow': 'Kø',
  'queue.empty': 'Ingen billeder endnu.',
  'queue.statusPending': 'venter',
  'queue.statusConverting': 'konverterer',
  'queue.statusConverted': 'konverteret',
  'queue.statusExported': 'eksporteret',
  'queue.statusError': 'fejl',
  'queue.errorPrefix': 'fejl: {message}',
  'queue.errorUnknown': 'ukendt',
  'queue.downscaledTitle':
    'Dette billede oversteg den maksimale arbejdsdimension og blev automatisk nedskaleret før konverteringen.',
  'queue.downscaledLabel': 'nedskaleret',
  'queue.previewAriaLabel': 'Forhåndsvis {name}',

  'export.eyebrow': 'Eksport',
  'export.formatAriaLabel': 'Eksportér aktivt billede som {format}',
  'export.batchButton': 'Eksportér alle billeder i køen som TXT',
  'export.noActiveImage': 'Intet aktivt billede at eksportere.',
  'export.cancelled': 'Eksport af "{name}" annulleret.',
  'export.exported': '"{name}" eksporteret som {format}.',
  'export.failed': 'Eksport mislykkedes: {error}',
  'export.batchSummary': 'Batcheksport: {succeeded} lykkedes, {failed} mislykkedes{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} annulleret',

  'appearance.eyebrow': 'Udseende',
  'appearance.shape': 'Form',
  'appearance.round': 'Rund',
  'appearance.soft': 'Blød',
  'appearance.square': 'Firkantet',
  'appearance.theme': 'Tema',
  'appearance.dark': 'Mørk',
  'appearance.light': 'Lys',
  'appearance.system': 'System',
  'appearance.accent': 'Accent',
  'appearance.accentSunflower': 'Solsikke',
  'appearance.accentBlue': 'Blå',
  'appearance.accentGreen': 'Grøn',
  'appearance.accentRed': 'Rød',
  'appearance.accentPurple': 'Lilla',
  'appearance.rainbow': 'Regnbue',
  'appearance.rainbowPalette': 'Regnbuepalet',
  'appearance.resetToDefault': 'Nulstil til standard',
  'appearance.language': 'Sprog',
  'presets.eyebrow': 'Forudindstillinger',
  'presets.exportButton': 'Eksportér indstillinger',
  'presets.importButton': 'Importér indstillinger',
  'presets.exported': 'Indstillinger eksporteret.',
  'presets.exportCancelled': 'Eksport annulleret.',
  'presets.imported': 'Indstillinger importeret.',
  'presets.importInvalid': 'Denne fil er ikke en gyldig TrickWork-forudindstilling.',
}

export default dict
