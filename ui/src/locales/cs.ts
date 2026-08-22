// ui/src/locales/cs.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'tabs.adjust': 'Upravit',
  'tabs.transform': 'Transformace',
  'tabs.filters': 'Filtry',
  'nav.convert': 'Převést',
  'nav.settings': 'Nastavení',
  'nav.backToConvert': 'Zpět',
  'nav.undo': 'Zpět',
  'nav.redo': 'Znovu',

  'history.eyebrow': 'Historie',

  'history.entryWidth': 'Šířka změněna',

  'history.entryHeight': 'Výška změněna',

  'history.entryAspectLocked': 'Poměr stran uzamčen',

  'history.entryCharsetEdited': 'Znaková sada upravena',

  'history.entryCharsetPreset': 'Znaková sada: {preset}',

  'history.entryFont': 'Písmo změněno',

  'history.entryRotated': 'Otočeno o {deg}°',

  'history.entryFlipHorizontal': 'Překlopeno vodorovně',

  'history.entryFlipVertical': 'Překlopeno svisle',

  'history.entryBrightness': 'Jas změněn',

  'history.entryContrast': 'Kontrast změněn',

  'history.entryInvert': 'Přepnuta inverze barev',

  'history.entryDither': 'Přepnuto rozptylování',

  'history.entryColor': 'Přepnut barevný výstup',

  'history.entrySharpen': 'Doostření změněno',

  'history.entryLevels': 'Tóny upraveny',

  'history.entryLevelsReset': 'Tóny obnoveny',

  'history.entryCrop': 'Ořez změněn',

  'history.entryCropCleared': 'Ořez odstraněn',

  'history.entrySettingsImported': 'Nastavení importováno',

  'history.logEmpty': 'Zatím žádné změny.',

  'import.eyebrow': 'Import',
  'import.dropzoneText': 'Přetáhněte sem obrázky, nebo klikněte pro výběr souborů',
  'import.ariaLabel': 'Vyberte obrázkové soubory ke konverzi',

  'crop.eyebrow': 'Oříznutí',
  'crop.hint': 'Táhněte myší po obrázku výše a převeďte pouze tuto oblast.',
  'crop.clearButton': 'Zrušit výběr',

  'preview.eyebrow': 'Náhled',
  'preview.empty': 'Přetáhněte sem nahoru obrázek, abyste ho zde viděli jako ASCII art.',
  'preview.zoomOut': 'Oddálit',
  'preview.zoomIn': 'Přiblížit',
  'preview.zoomReset': 'Obnovit přiblížení na 100 %',
  'preview.copy': 'Kopírovat do schránky',
  'preview.copied': 'Zkopírováno!',

  'controls.eyebrow': 'Ovládání',
  'controls.width': 'Šířka (sloupce)',
  'controls.height': 'Výška (řádky)',
  'controls.aspectLocked': 'Poměr stran uzamčen - výška sleduje šířku',
  'controls.aspectUnlocked': 'Poměr stran odemčen - výška je nezávislá',
  'controls.brightness': 'Jas',
  'controls.contrast': 'Kontrast',
  'controls.charset': 'Znaková sada',
  'controls.charsetPresetLabel': 'Předvolba znakové sady',
  'controls.charsetPresetStandard': 'Standardní',
  'controls.charsetPresetDetailed': 'Podrobný',
  'controls.charsetPresetBlocks': 'Bloky',
  'controls.charsetPresetClassic': 'Klasický',
  'controls.charsetPresetAlternate': 'Alternativní',
  'controls.charsetPresetCompact': 'Kompaktní',
  'controls.charsetPresetBold': 'Tučný',
  'controls.charsetPresetSymbols': 'Symboly',
  'controls.charsetPresetMinimal': 'Minimální',
  'controls.charsetPresetBinary': 'Binární',
  'controls.font': 'Písmo',
  'controls.fontMonoSystem': 'Neproporcionální (systémové)',
  'controls.fontMonoAlt': 'Neproporcionální (alt)',
  'controls.fontSerif': 'Patkové (proporcionální)',
  'controls.fontSans': 'Bezpatkové (proporcionální)',
  'controls.rtfNote':
    'Poznámka: export do RTF se vždy vykresluje pevným neproporcionálním písmem bez ohledu na písmo vybrané výše, většina čteček RTF neumí spolehlivě zobrazit libovolné proporcionální písmo.',
  'controls.transform': 'Transformace',
  'controls.rotate': 'Otočit',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Překlopit vodorovně',
  'controls.flipVertical': 'Překlopit svisle',
  'controls.filters': 'Filtry',
  'controls.levels': 'Tóny',
  'controls.levelsBlack': 'Černý bod',
  'controls.levelsGamma': 'Střední tóny (gama)',
  'controls.levelsWhite': 'Bílý bod',
  'controls.levelsReset': 'Obnovit',
  'controls.invert': 'Invertovat barvy',
  'controls.dither': 'Rozptylování',
  'controls.sharpen': 'Doostření',
  'controls.sharpenNone': 'Žádné',
  'controls.sharpenSharpen': 'Zaostřit',
  'controls.sharpenUnsharp': 'Maska doostření',
  'controls.color': 'Barevný výstup',
  'controls.colorTxtNote':
    'Poznámka: export do TXT je vždy prostý text, barva se nezachovává. Pro barevný výstup použijte XHTML, RTF nebo PNG.',

  'queue.eyebrow': 'Fronta',
  'queue.empty': 'Zatím žádné obrázky.',
  'queue.statusPending': 'čeká',
  'queue.statusConverting': 'převádí se',
  'queue.statusConverted': 'převedeno',
  'queue.statusExported': 'exportováno',
  'queue.statusError': 'chyba',
  'queue.errorPrefix': 'chyba: {message}',
  'queue.errorUnknown': 'neznámá',
  'queue.downscaledTitle':
    'Tento obrázek překročil maximální pracovní rozměr a před konverzí byl automaticky zmenšen.',
  'queue.downscaledLabel': 'zmenšeno',
  'queue.previewAriaLabel': 'Náhled {name}',

  'export.eyebrow': 'Export',
  'export.formatAriaLabel': 'Exportovat aktivní obrázek jako {format}',
  'export.batchButton': 'Exportovat všechny obrázky ve frontě jako TXT',
  'export.noActiveImage': 'Žádný aktivní obrázek k exportu.',
  'export.cancelled': 'Export "{name}" zrušen.',
  'export.exported': '"{name}" exportováno jako {format}.',
  'export.failed': 'Export se nezdařil: {error}',
  'export.batchSummary': 'Hromadný export: {succeeded} úspěšně, {failed} neúspěšně{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} zrušeno',

  'appearance.eyebrow': 'Vzhled',
  'appearance.shape': 'Tvar',
  'appearance.round': 'Kulatý',
  'appearance.soft': 'Jemný',
  'appearance.square': 'Hranatý',
  'appearance.theme': 'Motiv',
  'appearance.dark': 'Tmavý',
  'appearance.light': 'Světlý',
  'appearance.system': 'Systémový',
  'appearance.accent': 'Akcent',
  'appearance.accentPresets': 'Předvolby',
  'appearance.accentSunflower': 'Slunečnicová',
  'appearance.accentBlue': 'Modrá',
  'appearance.accentGreen': 'Zelená',
  'appearance.accentRed': 'Červená',
  'appearance.accentPurple': 'Fialová',
  'appearance.rainbow': 'Duhový režim',
  'appearance.rainbowPalette': 'Duhová paleta',
  'appearance.resetToDefault': 'Obnovit výchozí',
  'appearance.language': 'Jazyk',
  'presets.eyebrow': 'Předvolby',
  'presets.exportButton': 'Exportovat nastavení',
  'presets.importButton': 'Importovat nastavení',
  'presets.exported': 'Nastavení exportováno.',
  'presets.exportCancelled': 'Export zrušen.',
  'presets.imported': 'Nastavení importováno.',
  'presets.importInvalid': 'Tento soubor není platná předvolba TrickWork.',
  'cards.reorderHandle': 'Přetažením přeuspořádat',
}

export default dict
