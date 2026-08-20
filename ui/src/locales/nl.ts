// ui/src/locales/nl.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'Afbeelding naar ASCII-kunst',

  'tabs.adjust': 'Aanpassen',
  'tabs.transform': 'Transformatie',
  'tabs.filters': 'Filters',
  'nav.convert': 'Converteren',
  'nav.settings': 'Instellingen',
  'nav.backToConvert': 'Terug',
  'nav.undo': 'Ongedaan maken',
  'nav.redo': 'Opnieuw',

  'history.eyebrow': 'Geschiedenis',

  'history.entryWidth': 'Breedte gewijzigd',

  'history.entryCharsetEdited': 'Tekenset bewerkt',

  'history.entryCharsetPreset': 'Tekenset: {preset}',

  'history.entryFont': 'Lettertype gewijzigd',

  'history.entryRotated': '{deg}° gedraaid',

  'history.entryFlipHorizontal': 'Horizontaal gespiegeld',

  'history.entryFlipVertical': 'Verticaal gespiegeld',

  'history.entryBrightness': 'Helderheid gewijzigd',

  'history.entryContrast': 'Contrast gewijzigd',

  'history.entryInvert': 'Omkeren omgeschakeld',

  'history.entryDither': 'Dithering omgeschakeld',

  'history.entryColor': 'Kleurweergave omgeschakeld',

  'history.entrySharpen': 'Verscherpen gewijzigd',

  'history.entryLevels': 'Niveaus aangepast',

  'history.entryLevelsReset': 'Niveaus gereset',

  'history.entryCrop': 'Uitsnede gewijzigd',

  'history.entryCropCleared': 'Uitsnede verwijderd',

  'history.entrySettingsImported': 'Instellingen geïmporteerd',

  'history.logEmpty': 'Nog geen wijzigingen.',

  'import.eyebrow': 'Importeren',
  'import.dropzoneText': 'Sleep afbeeldingen hierheen, of klik om bestanden te kiezen',
  'import.ariaLabel': 'Kies afbeeldingsbestanden om te converteren',

  'crop.eyebrow': 'Bijsnijden',
  'crop.hint': 'Sleep over de afbeelding hierboven om alleen dat gebied te converteren.',
  'crop.clearButton': 'Selectie wissen',

  'preview.eyebrow': 'Voorbeeld',
  'preview.empty': 'Sleep hierboven een afbeelding om deze hier als ASCII-kunst te zien.',
  'preview.zoomOut': 'Uitzoomen',
  'preview.zoomIn': 'Inzoomen',
  'preview.zoomReset': 'Zoom resetten naar 100%',
  'preview.copy': 'Kopiëren naar klembord',
  'preview.copied': 'Gekopieerd!',

  'controls.eyebrow': 'Instellingen',
  'controls.width': 'Breedte (kolommen)',
  'controls.brightness': 'Helderheid',
  'controls.contrast': 'Contrast',
  'controls.charset': 'Tekenset',
  'controls.charsetPresetLabel': 'Tekenset-voorinstelling',
  'controls.charsetPresetStandard': 'Standaard',
  'controls.charsetPresetDetailed': 'Gedetailleerd',
  'controls.charsetPresetBlocks': 'Blokken',
  'controls.charsetPresetClassic': 'Klassiek',
  'controls.charsetPresetAlternate': 'Alternatief',
  'controls.charsetPresetCompact': 'Compact',
  'controls.charsetPresetBold': 'Vet',
  'controls.charsetPresetSymbols': 'Symbolen',
  'controls.charsetPresetMinimal': 'Minimaal',
  'controls.charsetPresetBinary': 'Binair',
  'controls.font': 'Lettertype',
  'controls.fontMonoSystem': 'Monospace (systeem)',
  'controls.fontMonoAlt': 'Monospace (alt)',
  'controls.fontSerif': 'Serif (proportioneel)',
  'controls.fontSans': 'Sans (proportioneel)',
  'controls.rtfNote':
    'Let op: RTF-export wordt altijd weergegeven in een vast monospace-lettertype, ongeacht het hierboven gekozen lettertype, de meeste RTF-lezers kunnen een willekeurig proportioneel lettertype niet betrouwbaar tonen.',
  'controls.transform': 'Transformatie',
  'controls.rotate': 'Draaien',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Horizontaal spiegelen',
  'controls.flipVertical': 'Verticaal spiegelen',
  'controls.filters': 'Filters',
  'controls.levels': 'Niveaus',
  'controls.levelsBlack': 'Zwartpunt',
  'controls.levelsGamma': 'Middentonen (gamma)',
  'controls.levelsWhite': 'Witpunt',
  'controls.levelsReset': 'Reset',
  'controls.invert': 'Kleuren omkeren',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Verscherpen',
  'controls.sharpenNone': 'Geen',
  'controls.sharpenSharpen': 'Verscherpen',
  'controls.sharpenUnsharp': 'Onscherp masker',
  'controls.color': 'Kleurweergave',
  'controls.colorTxtNote':
    'Let op: TXT-export is altijd platte tekst, kleur wordt niet meegenomen. Gebruik XHTML, RTF of PNG voor gekleurde uitvoer.',

  'queue.eyebrow': 'Wachtrij',
  'queue.empty': 'Nog geen afbeeldingen.',
  'queue.statusPending': 'wachtend',
  'queue.statusConverting': 'wordt geconverteerd',
  'queue.statusConverted': 'geconverteerd',
  'queue.statusExported': 'geëxporteerd',
  'queue.statusError': 'fout',
  'queue.errorPrefix': 'fout: {message}',
  'queue.errorUnknown': 'onbekend',
  'queue.downscaledTitle':
    'Deze afbeelding overschreed de maximale werkgrootte en is automatisch verkleind vóór de conversie.',
  'queue.downscaledLabel': 'verkleind',
  'queue.previewAriaLabel': 'Voorbeeld van {name}',

  'export.eyebrow': 'Exporteren',
  'export.formatAriaLabel': 'Actieve afbeelding exporteren als {format}',
  'export.batchButton': 'Alle afbeeldingen in de wachtrij exporteren als TXT',
  'export.noActiveImage': 'Geen actieve afbeelding om te exporteren.',
  'export.cancelled': 'Export van "{name}" geannuleerd.',
  'export.exported': '"{name}" geëxporteerd als {format}.',
  'export.failed': 'Export mislukt: {error}',
  'export.batchSummary': 'Batchexport: {succeeded} geslaagd, {failed} mislukt{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} geannuleerd',

  'appearance.eyebrow': 'Weergave',
  'appearance.shape': 'Vorm',
  'appearance.round': 'Rond',
  'appearance.soft': 'Zacht',
  'appearance.square': 'Vierkant',
  'appearance.theme': 'Thema',
  'appearance.dark': 'Donker',
  'appearance.light': 'Licht',
  'appearance.system': 'Systeem',
  'appearance.accent': 'Accent',
  'appearance.accentSunflower': 'Zonnebloem',
  'appearance.accentBlue': 'Blauw',
  'appearance.accentGreen': 'Groen',
  'appearance.accentRed': 'Rood',
  'appearance.accentPurple': 'Paars',
  'appearance.rainbow': 'Regenboogmodus',
  'appearance.rainbowPalette': 'Regenboogpalet',
  'appearance.resetToDefault': 'Terugzetten naar standaard',
  'appearance.language': 'Taal',
  'presets.eyebrow': 'Voorinstellingen',
  'presets.exportButton': 'Instellingen exporteren',
  'presets.importButton': 'Instellingen importeren',
  'presets.exported': 'Instellingen geëxporteerd.',
  'presets.exportCancelled': 'Export geannuleerd.',
  'presets.imported': 'Instellingen geïmporteerd.',
  'presets.importInvalid': 'Dit bestand is geen geldige TrickWork-voorinstelling.',
}

export default dict
