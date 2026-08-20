// ui/src/locales/no.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'Bilde til ASCII-kunst',

  'tabs.adjust': 'Juster',
  'tabs.transform': 'Transformer',
  'tabs.filters': 'Filtre',
  'nav.convert': 'Konverter',
  'nav.settings': 'Innstillinger',
  'nav.backToConvert': 'Tilbake',
  'nav.undo': 'Angre',
  'nav.redo': 'Gjør om',

  'history.eyebrow': 'Historikk',

  'history.entryWidth': 'Bredde endret',

  'history.entryCharsetEdited': 'Tegnsett redigert',

  'history.entryCharsetPreset': 'Tegnsett: {preset}',

  'history.entryFont': 'Skrift endret',

  'history.entryRotated': 'Rotert {deg}°',

  'history.entryFlipHorizontal': 'Snudd horisontalt',

  'history.entryFlipVertical': 'Snudd vertikalt',

  'history.entryBrightness': 'Lysstyrke endret',

  'history.entryContrast': 'Kontrast endret',

  'history.entryInvert': 'Invertering vekslet',

  'history.entryDither': 'Dithering vekslet',

  'history.entryColor': 'Fargeutdata vekslet',

  'history.entrySharpen': 'Skarphet endret',

  'history.entryLevels': 'Nivåer justert',

  'history.entryLevelsReset': 'Nivåer tilbakestilt',

  'history.entryCrop': 'Beskjæring endret',

  'history.entryCropCleared': 'Beskjæring fjernet',

  'history.entrySettingsImported': 'Innstillinger importert',

  'history.logEmpty': 'Ingen endringer ennå.',

  'import.eyebrow': 'Importer',
  'import.dropzoneText': 'Slipp bilder her, eller klikk for å velge filer',
  'import.ariaLabel': 'Velg bildefiler som skal konverteres',

  'crop.eyebrow': 'Beskjæring',
  'crop.hint': 'Dra over bildet ovenfor for å konvertere bare det området.',
  'crop.clearButton': 'Fjern merking',

  'preview.eyebrow': 'Forhåndsvisning',
  'preview.empty': 'Slipp et bilde ovenfor for å se det her som ASCII-kunst.',
  'preview.zoomOut': 'Zoom ut',
  'preview.zoomIn': 'Zoom inn',
  'preview.zoomReset': 'Tilbakestill zoom til 100 %',
  'preview.copy': 'Kopier til utklippstavle',
  'preview.copied': 'Kopiert!',

  'controls.eyebrow': 'Innstillinger',
  'controls.width': 'Bredde (kolonner)',
  'controls.brightness': 'Lysstyrke',
  'controls.contrast': 'Kontrast',
  'controls.charset': 'Tegnsett',
  'controls.charsetPresetLabel': 'Tegnsett-forhåndsinnstilling',
  'controls.charsetPresetStandard': 'Standard',
  'controls.charsetPresetDetailed': 'Detaljert',
  'controls.charsetPresetBlocks': 'Blokker',
  'controls.charsetPresetClassic': 'Klassisk',
  'controls.charsetPresetAlternate': 'Alternativ',
  'controls.charsetPresetCompact': 'Kompakt',
  'controls.charsetPresetBold': 'Fet',
  'controls.charsetPresetSymbols': 'Symboler',
  'controls.charsetPresetMinimal': 'Minimal',
  'controls.charsetPresetBinary': 'Binær',
  'controls.font': 'Skrift',
  'controls.fontMonoSystem': 'Fast bredde (system)',
  'controls.fontMonoAlt': 'Fast bredde (alt)',
  'controls.fontSerif': 'Serif (proporsjonal)',
  'controls.fontSans': 'Sans (proporsjonal)',
  'controls.rtfNote':
    'Merk: RTF-eksport vises alltid med en fast skrift med jevn bredde, uansett hvilken skrift som er valgt ovenfor, de fleste RTF-lesere kan ikke vise en vilkårlig proporsjonal skrift på en pålitelig måte.',
  'controls.transform': 'Transformer',
  'controls.rotate': 'Roter',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Snu horisontalt',
  'controls.flipVertical': 'Snu vertikalt',
  'controls.filters': 'Filtre',
  'controls.levels': 'Nivåer',
  'controls.levelsBlack': 'Svartpunkt',
  'controls.levelsGamma': 'Mellomtoner (gamma)',
  'controls.levelsWhite': 'Hvitpunkt',
  'controls.levelsReset': 'Tilbakestill',
  'controls.invert': 'Inverter farger',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Skarphet',
  'controls.sharpenNone': 'Ingen',
  'controls.sharpenSharpen': 'Skjerp',
  'controls.sharpenUnsharp': 'Uskarp maske',
  'controls.color': 'Fargeutdata',
  'controls.colorTxtNote':
    'Merk: TXT-eksport er alltid ren tekst, farge blir ikke bevart. Bruk XHTML, RTF eller PNG for farget utdata.',

  'queue.eyebrow': 'Kø',
  'queue.empty': 'Ingen bilder ennå.',
  'queue.statusPending': 'venter',
  'queue.statusConverting': 'konverterer',
  'queue.statusConverted': 'konvertert',
  'queue.statusExported': 'eksportert',
  'queue.statusError': 'feil',
  'queue.errorPrefix': 'feil: {message}',
  'queue.errorUnknown': 'ukjent',
  'queue.downscaledTitle':
    'Dette bildet overskred den maksimale arbeidsdimensjonen og ble automatisk nedskalert før konverteringen.',
  'queue.downscaledLabel': 'nedskalert',
  'queue.previewAriaLabel': 'Forhåndsvis {name}',

  'export.eyebrow': 'Eksport',
  'export.formatAriaLabel': 'Eksporter aktivt bilde som {format}',
  'export.batchButton': 'Eksporter alle bilder i køen som TXT',
  'export.noActiveImage': 'Ingen aktivt bilde å eksportere.',
  'export.cancelled': 'Eksport av "{name}" avbrutt.',
  'export.exported': '"{name}" eksportert som {format}.',
  'export.failed': 'Eksport mislyktes: {error}',
  'export.batchSummary': 'Batcheksport: {succeeded} vellykket, {failed} mislyktes{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} avbrutt',

  'appearance.eyebrow': 'Utseende',
  'appearance.shape': 'Form',
  'appearance.round': 'Rund',
  'appearance.soft': 'Myk',
  'appearance.square': 'Firkantet',
  'appearance.theme': 'Tema',
  'appearance.dark': 'Mørk',
  'appearance.light': 'Lys',
  'appearance.system': 'System',
  'appearance.accent': 'Aksent',
  'appearance.accentPresets': 'Forhåndsinnstillinger',
  'appearance.accentSunflower': 'Solsikke',
  'appearance.accentBlue': 'Blå',
  'appearance.accentGreen': 'Grønn',
  'appearance.accentRed': 'Rød',
  'appearance.accentPurple': 'Lilla',
  'appearance.rainbow': 'Regnbuemodus',
  'appearance.rainbowPalette': 'Regnbuepalett',
  'appearance.resetToDefault': 'Tilbakestill til standard',
  'appearance.language': 'Språk',
  'presets.eyebrow': 'Forhåndsinnstillinger',
  'presets.exportButton': 'Eksporter innstillinger',
  'presets.importButton': 'Importer innstillinger',
  'presets.exported': 'Innstillinger eksportert.',
  'presets.exportCancelled': 'Eksport avbrutt.',
  'presets.imported': 'Innstillinger importert.',
  'presets.importInvalid': 'Denne filen er ikke en gyldig TrickWork-forhåndsinnstilling.',
}

export default dict
