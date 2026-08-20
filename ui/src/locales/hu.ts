// ui/src/locales/hu.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'Képből ASCII-művészet',

  'tabs.adjust': 'Beállítás',
  'tabs.transform': 'Átalakítás',
  'tabs.filters': 'Szűrők',
  'nav.convert': 'Konvertálás',
  'nav.settings': 'Beállítások',
  'nav.backToConvert': 'Vissza',
  'nav.undo': 'Visszavonás',
  'nav.redo': 'Ismétlés',

  'history.eyebrow': 'Előzmények',

  'history.entryWidth': 'Szélesség megváltozott',

  'history.entryCharsetEdited': 'Karakterkészlet szerkesztve',

  'history.entryCharsetPreset': 'Karakterkészlet: {preset}',

  'history.entryFont': 'Betűtípus megváltozott',

  'history.entryRotated': '{deg}°-kal elforgatva',

  'history.entryFlipHorizontal': 'Vízszintesen tükrözve',

  'history.entryFlipVertical': 'Függőlegesen tükrözve',

  'history.entryBrightness': 'Fényerő megváltozott',

  'history.entryContrast': 'Kontraszt megváltozott',

  'history.entryInvert': 'Invertálás átkapcsolva',

  'history.entryDither': 'Dithering átkapcsolva',

  'history.entryColor': 'Színes kimenet átkapcsolva',

  'history.entrySharpen': 'Élesítés megváltozott',

  'history.entryLevels': 'Szintek módosítva',

  'history.entryLevelsReset': 'Szintek visszaállítva',

  'history.entryCrop': 'Vágás megváltozott',

  'history.entryCropCleared': 'Vágás eltávolítva',

  'history.entrySettingsImported': 'Beállítások importálva',

  'history.logEmpty': 'Még nincs változás.',

  'import.eyebrow': 'Importálás',
  'import.dropzoneText': 'Húzza ide a képeket, vagy kattintson fájlok kiválasztásához',
  'import.ariaLabel': 'Válassza ki az átalakítandó képfájlokat',

  'crop.eyebrow': 'Kivágás',
  'crop.hint': 'Húzza a fenti képen, hogy csak azt a területet alakítsa át.',
  'crop.clearButton': 'Kijelölés törlése',

  'preview.eyebrow': 'Előnézet',
  'preview.empty': 'Húzzon ide egy képet fentről, hogy itt ASCII-művészetként lássa.',
  'preview.zoomOut': 'Kicsinyítés',
  'preview.zoomIn': 'Nagyítás',
  'preview.zoomReset': 'Nagyítás visszaállítása 100%-ra',
  'preview.copy': 'Másolás vágólapra',
  'preview.copied': 'Másolva!',

  'controls.eyebrow': 'Beállítások',
  'controls.width': 'Szélesség (oszlopok)',
  'controls.brightness': 'Fényerő',
  'controls.contrast': 'Kontraszt',
  'controls.charset': 'Karakterkészlet',
  'controls.charsetPresetLabel': 'Karakterkészlet-előbeállítás',
  'controls.charsetPresetStandard': 'Alapértelmezett',
  'controls.charsetPresetDetailed': 'Részletes',
  'controls.charsetPresetBlocks': 'Blokkok',
  'controls.charsetPresetClassic': 'Klasszikus',
  'controls.charsetPresetAlternate': 'Alternatív',
  'controls.charsetPresetCompact': 'Kompakt',
  'controls.charsetPresetBold': 'Félkövér',
  'controls.charsetPresetSymbols': 'Szimbólumok',
  'controls.charsetPresetMinimal': 'Minimális',
  'controls.charsetPresetBinary': 'Bináris',
  'controls.font': 'Betűtípus',
  'controls.fontMonoSystem': 'Fix szélességű (rendszer)',
  'controls.fontMonoAlt': 'Fix szélességű (alt)',
  'controls.fontSerif': 'Talpas (arányos)',
  'controls.fontSans': 'Talpatlan (arányos)',
  'controls.rtfNote':
    'Megjegyzés: az RTF-exportálás mindig rögzített, fix szélességű betűtípussal jelenik meg, függetlenül a fent kiválasztott betűtípustól, a legtöbb RTF-olvasó nem tud megbízhatóan megjeleníteni tetszőleges arányos betűtípust.',
  'controls.transform': 'Átalakítás',
  'controls.rotate': 'Forgatás',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Vízszintes tükrözés',
  'controls.flipVertical': 'Függőleges tükrözés',
  'controls.filters': 'Szűrők',
  'controls.levels': 'Szintek',
  'controls.levelsBlack': 'Feketepont',
  'controls.levelsGamma': 'Középtónusok (gamma)',
  'controls.levelsWhite': 'Fehérpont',
  'controls.levelsReset': 'Visszaállítás',
  'controls.invert': 'Színek invertálása',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Élesítés',
  'controls.sharpenNone': 'Nincs',
  'controls.sharpenSharpen': 'Élesítés',
  'controls.sharpenUnsharp': 'Unsharp mask',
  'controls.color': 'Színes kimenet',
  'controls.colorTxtNote':
    'Megjegyzés: a TXT-exportálás mindig egyszerű szöveg, a szín nem marad meg. Színes kimenethez használjon XHTML, RTF vagy PNG formátumot.',

  'queue.eyebrow': 'Várólista',
  'queue.empty': 'Még nincsenek képek.',
  'queue.statusPending': 'várakozik',
  'queue.statusConverting': 'átalakítás folyamatban',
  'queue.statusConverted': 'átalakítva',
  'queue.statusExported': 'exportálva',
  'queue.statusError': 'hiba',
  'queue.errorPrefix': 'hiba: {message}',
  'queue.errorUnknown': 'ismeretlen',
  'queue.downscaledTitle':
    'Ez a kép meghaladta a maximális munkaméretet, ezért az átalakítás előtt automatikusan kicsinyítve lett.',
  'queue.downscaledLabel': 'kicsinyítve',
  'queue.previewAriaLabel': '{name} előnézete',

  'export.eyebrow': 'Exportálás',
  'export.formatAriaLabel': 'Aktív kép exportálása {format} formátumban',
  'export.batchButton': 'Az összes várólistán lévő kép exportálása TXT formátumban',
  'export.noActiveImage': 'Nincs aktív kép az exportáláshoz.',
  'export.cancelled': 'A(z) "{name}" exportálása megszakítva.',
  'export.exported': 'A(z) "{name}" exportálva {format} formátumban.',
  'export.failed': 'Az exportálás sikertelen: {error}',
  'export.batchSummary': 'Tömeges exportálás: {succeeded} sikeres, {failed} sikertelen{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} megszakítva',

  'appearance.eyebrow': 'Megjelenés',
  'appearance.shape': 'Alak',
  'appearance.round': 'Kerek',
  'appearance.soft': 'Lágy',
  'appearance.square': 'Szögletes',
  'appearance.theme': 'Téma',
  'appearance.dark': 'Sötét',
  'appearance.light': 'Világos',
  'appearance.system': 'Rendszer',
  'appearance.accent': 'Kiemelőszín',
  'appearance.accentSunflower': 'Napraforgó',
  'appearance.accentBlue': 'Kék',
  'appearance.accentGreen': 'Zöld',
  'appearance.accentRed': 'Piros',
  'appearance.accentPurple': 'Lila',
  'appearance.rainbow': 'Szivárvány mód',
  'appearance.rainbowPalette': 'Szivárvány paletta',
  'appearance.resetToDefault': 'Visszaállítás alapértelmezettre',
  'appearance.language': 'Nyelv',
  'presets.eyebrow': 'Előbeállítások',
  'presets.exportButton': 'Beállítások exportálása',
  'presets.importButton': 'Beállítások importálása',
  'presets.exported': 'Beállítások exportálva.',
  'presets.exportCancelled': 'Exportálás megszakítva.',
  'presets.imported': 'Beállítások importálva.',
  'presets.importInvalid': 'Ez a fájl nem érvényes TrickWork-előbeállítás.',
}

export default dict
