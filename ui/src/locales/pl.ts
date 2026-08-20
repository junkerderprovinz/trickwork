// ui/src/locales/pl.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'Obraz na sztukę ASCII',

  'tabs.adjust': 'Dostosuj',
  'tabs.transform': 'Transformacja',
  'tabs.filters': 'Filtry',
  'nav.convert': 'Konwertuj',
  'nav.settings': 'Ustawienia',
  'nav.backToConvert': 'Wstecz',
  'nav.undo': 'Cofnij',
  'nav.redo': 'Ponów',

  'history.eyebrow': 'Historia',

  'history.entryWidth': 'Szerokość zmieniona',

  'history.entryCharsetEdited': 'Zestaw znaków edytowany',

  'history.entryCharsetPreset': 'Zestaw znaków: {preset}',

  'history.entryFont': 'Czcionka zmieniona',

  'history.entryRotated': 'Obrócono o {deg}°',

  'history.entryFlipHorizontal': 'Odbito poziomo',

  'history.entryFlipVertical': 'Odbito pionowo',

  'history.entryBrightness': 'Jasność zmieniona',

  'history.entryContrast': 'Kontrast zmieniony',

  'history.entryInvert': 'Przełączono odwracanie kolorów',

  'history.entryDither': 'Przełączono dithering',

  'history.entryColor': 'Przełączono wyjście kolorowe',

  'history.entrySharpen': 'Wyostrzanie zmienione',

  'history.entryLevels': 'Dostosowano poziomy',

  'history.entryLevelsReset': 'Zresetowano poziomy',

  'history.entryCrop': 'Kadr zmieniony',

  'history.entryCropCleared': 'Kadr usunięty',

  'history.entrySettingsImported': 'Zaimportowano ustawienia',

  'history.logEmpty': 'Jeszcze brak zmian.',

  'import.eyebrow': 'Import',
  'import.dropzoneText': 'Upuść tu obrazy albo kliknij, aby wybrać pliki',
  'import.ariaLabel': 'Wybierz pliki obrazów do konwersji',

  'crop.eyebrow': 'Przycinanie',
  'crop.hint': 'Przeciągnij po obrazie powyżej, aby przekonwertować tylko ten obszar.',
  'crop.clearButton': 'Wyczyść zaznaczenie',

  'preview.eyebrow': 'Podgląd',
  'preview.empty': 'Upuść obraz powyżej, aby zobaczyć go tutaj jako sztukę ASCII.',
  'preview.zoomOut': 'Pomniejsz',
  'preview.zoomIn': 'Powiększ',
  'preview.zoomReset': 'Zresetuj powiększenie do 100%',
  'preview.copy': 'Kopiuj do schowka',
  'preview.copied': 'Skopiowano!',

  'controls.eyebrow': 'Ustawienia',
  'controls.width': 'Szerokość (kolumny)',
  'controls.brightness': 'Jasność',
  'controls.contrast': 'Kontrast',
  'controls.charset': 'Zestaw znaków',
  'controls.charsetPresetLabel': 'Ustawienie predefiniowane zestawu znaków',
  'controls.charsetPresetStandard': 'Standardowy',
  'controls.charsetPresetDetailed': 'Szczegółowy',
  'controls.charsetPresetBlocks': 'Bloki',
  'controls.charsetPresetClassic': 'Klasyczny',
  'controls.charsetPresetAlternate': 'Alternatywny',
  'controls.charsetPresetCompact': 'Kompaktowy',
  'controls.charsetPresetBold': 'Pogrubiony',
  'controls.charsetPresetSymbols': 'Symbole',
  'controls.charsetPresetMinimal': 'Minimalny',
  'controls.charsetPresetBinary': 'Binarny',
  'controls.font': 'Czcionka',
  'controls.fontMonoSystem': 'Monospace (systemowa)',
  'controls.fontMonoAlt': 'Monospace (alternatywna)',
  'controls.fontSerif': 'Szeryfowa (proporcjonalna)',
  'controls.fontSans': 'Bezszeryfowa (proporcjonalna)',
  'controls.rtfNote':
    'Uwaga: eksport RTF zawsze jest renderowany stałą czcionką o stałej szerokości, niezależnie od czcionki wybranej powyżej, większość czytników RTF nie potrafi wiarygodnie wyświetlić dowolnej czcionki proporcjonalnej.',
  'controls.transform': 'Transformacja',
  'controls.rotate': 'Obrót',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Odbij poziomo',
  'controls.flipVertical': 'Odbij pionowo',
  'controls.filters': 'Filtry',
  'controls.levels': 'Poziomy',
  'controls.levelsBlack': 'Punkt czerni',
  'controls.levelsGamma': 'Półcienie (gamma)',
  'controls.levelsWhite': 'Punkt bieli',
  'controls.levelsReset': 'Resetuj',
  'controls.invert': 'Odwróć kolory',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Wyostrzanie',
  'controls.sharpenNone': 'Brak',
  'controls.sharpenSharpen': 'Wyostrz',
  'controls.sharpenUnsharp': 'Maska wyostrzająca',
  'controls.color': 'Wyjście kolorowe',
  'controls.colorTxtNote':
    'Uwaga: eksport TXT to zawsze zwykły tekst, kolor nie jest zachowywany. Użyj XHTML, RTF lub PNG dla kolorowego wyjścia.',

  'queue.eyebrow': 'Kolejka',
  'queue.empty': 'Brak obrazów.',
  'queue.statusPending': 'oczekuje',
  'queue.statusConverting': 'konwersja',
  'queue.statusConverted': 'przekonwertowany',
  'queue.statusExported': 'wyeksportowany',
  'queue.statusError': 'błąd',
  'queue.errorPrefix': 'błąd: {message}',
  'queue.errorUnknown': 'nieznany',
  'queue.downscaledTitle':
    'Ten obraz przekroczył maksymalny rozmiar roboczy i został automatycznie zmniejszony przed konwersją.',
  'queue.downscaledLabel': 'zmniejszony',
  'queue.previewAriaLabel': 'Podgląd {name}',

  'export.eyebrow': 'Eksport',
  'export.formatAriaLabel': 'Eksportuj aktywny obraz jako {format}',
  'export.batchButton': 'Eksportuj wszystkie obrazy z kolejki jako TXT',
  'export.noActiveImage': 'Brak aktywnego obrazu do eksportu.',
  'export.cancelled': 'Eksport "{name}" anulowany.',
  'export.exported': 'Wyeksportowano "{name}" jako {format}.',
  'export.failed': 'Eksport nieudany: {error}',
  'export.batchSummary': 'Eksport zbiorczy: {succeeded} udanych, {failed} nieudanych{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} anulowanych',

  'appearance.eyebrow': 'Wygląd',
  'appearance.shape': 'Kształt',
  'appearance.round': 'Okrągły',
  'appearance.soft': 'Miękki',
  'appearance.square': 'Kwadratowy',
  'appearance.theme': 'Motyw',
  'appearance.dark': 'Ciemny',
  'appearance.light': 'Jasny',
  'appearance.system': 'Systemowy',
  'appearance.accent': 'Akcent',
  'appearance.accentPresets': 'Ustawienia wstępne',
  'appearance.accentSunflower': 'Słonecznikowy',
  'appearance.accentBlue': 'Niebieski',
  'appearance.accentGreen': 'Zielony',
  'appearance.accentRed': 'Czerwony',
  'appearance.accentPurple': 'Fioletowy',
  'appearance.rainbow': 'Tryb tęczy',
  'appearance.rainbowPalette': 'Paleta tęczy',
  'appearance.resetToDefault': 'Przywróć domyślne',
  'appearance.language': 'Język',
  'presets.eyebrow': 'Ustawienia predefiniowane',
  'presets.exportButton': 'Eksportuj ustawienia',
  'presets.importButton': 'Importuj ustawienia',
  'presets.exported': 'Ustawienia wyeksportowane.',
  'presets.exportCancelled': 'Eksport anulowany.',
  'presets.imported': 'Ustawienia zaimportowane.',
  'presets.importInvalid': 'Ten plik nie jest prawidłowym presetem TrickWork.',
}

export default dict
