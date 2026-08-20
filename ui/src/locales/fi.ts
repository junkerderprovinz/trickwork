// ui/src/locales/fi.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'Kuvasta ASCII-taiteeksi',

  'tabs.adjust': 'Säädä',
  'tabs.transform': 'Muunnos',
  'tabs.filters': 'Suodattimet',
  'nav.convert': 'Muunna',
  'nav.settings': 'Asetukset',
  'nav.backToConvert': 'Takaisin',
  'nav.undo': 'Kumoa',
  'nav.redo': 'Tee uudelleen',

  'history.eyebrow': 'Historia',

  'history.entryWidth': 'Leveys muutettu',

  'history.entryCharsetEdited': 'Merkistöä muokattu',

  'history.entryCharsetPreset': 'Merkistö: {preset}',

  'history.entryFont': 'Fontti vaihdettu',

  'history.entryRotated': 'Kierretty {deg}°',

  'history.entryFlipHorizontal': 'Peilattu vaakasuunnassa',

  'history.entryFlipVertical': 'Peilattu pystysuunnassa',

  'history.entryBrightness': 'Kirkkaus muutettu',

  'history.entryContrast': 'Kontrasti muutettu',

  'history.entryInvert': 'Värien kääntö vaihdettu',

  'history.entryDither': 'Rasterointi vaihdettu',

  'history.entryColor': 'Värillinen tuloste vaihdettu',

  'history.entrySharpen': 'Terävöinti muutettu',

  'history.entryLevels': 'Tasoja säädetty',

  'history.entryLevelsReset': 'Tasot palautettu',

  'history.entryCrop': 'Rajausta muutettu',

  'history.entryCropCleared': 'Rajaus poistettu',

  'history.entrySettingsImported': 'Asetukset tuotu',

  'history.logEmpty': 'Ei vielä muutoksia.',

  'import.eyebrow': 'Tuo',
  'import.dropzoneText': 'Pudota kuvat tähän tai valitse tiedostot napsauttamalla',
  'import.ariaLabel': 'Valitse muunnettavat kuvatiedostot',

  'crop.eyebrow': 'Rajaus',
  'crop.hint': 'Vedä yllä olevan kuvan päällä muuntaaksesi vain sen alueen.',
  'crop.clearButton': 'Tyhjennä valinta',

  'preview.eyebrow': 'Esikatselu',
  'preview.empty': 'Pudota kuva yllä nähdäksesi sen tässä ASCII-taiteena.',
  'preview.zoomOut': 'Loitonna',
  'preview.zoomIn': 'Lähennä',
  'preview.zoomReset': 'Palauta zoomaus 100 %:iin',
  'preview.copy': 'Kopioi leikepöydälle',
  'preview.copied': 'Kopioitu!',

  'controls.eyebrow': 'Säädöt',
  'controls.width': 'Leveys (sarakkeet)',
  'controls.brightness': 'Kirkkaus',
  'controls.contrast': 'Kontrasti',
  'controls.charset': 'Merkistö',
  'controls.charsetPresetLabel': 'Merkistön esiasetus',
  'controls.charsetPresetStandard': 'Vakio',
  'controls.charsetPresetDetailed': 'Yksityiskohtainen',
  'controls.charsetPresetBlocks': 'Lohkot',
  'controls.charsetPresetClassic': 'Klassinen',
  'controls.charsetPresetAlternate': 'Vaihtoehtoinen',
  'controls.charsetPresetCompact': 'Tiivis',
  'controls.charsetPresetBold': 'Lihavoitu',
  'controls.charsetPresetSymbols': 'Symbolit',
  'controls.charsetPresetMinimal': 'Minimaalinen',
  'controls.charsetPresetBinary': 'Binaari',
  'controls.font': 'Fontti',
  'controls.fontMonoSystem': 'Tasavälinen (järjestelmä)',
  'controls.fontMonoAlt': 'Tasavälinen (vaihtoehtoinen)',
  'controls.fontSerif': 'Antiikva (suhteellinen)',
  'controls.fontSans': 'Groteski (suhteellinen)',
  'controls.rtfNote':
    'Huom: RTF-vienti näytetään aina kiinteällä tasavälisellä fontilla riippumatta yllä valitusta fontista, useimmat RTF-lukijat eivät pysty luotettavasti näyttämään mielivaltaista suhteellista fonttia.',
  'controls.transform': 'Muunnos',
  'controls.rotate': 'Kierrä',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Peilaa vaakasuunnassa',
  'controls.flipVertical': 'Peilaa pystysuunnassa',
  'controls.filters': 'Suodattimet',
  'controls.levels': 'Tasot',
  'controls.levelsBlack': 'Mustapiste',
  'controls.levelsGamma': 'Keskisävyt (gamma)',
  'controls.levelsWhite': 'Valkopiste',
  'controls.levelsReset': 'Palauta',
  'controls.invert': 'Käännä värit',
  'controls.dither': 'Rasterointi',
  'controls.sharpen': 'Terävöinti',
  'controls.sharpenNone': 'Ei mitään',
  'controls.sharpenSharpen': 'Terävöitä',
  'controls.sharpenUnsharp': 'Epäterävä maski',
  'controls.color': 'Värillinen tuloste',
  'controls.colorTxtNote':
    'Huom: TXT-vienti on aina pelkkää tekstiä, väri ei säily. Käytä XHTML-, RTF- tai PNG-muotoa värillistä tulostetta varten.',

  'queue.eyebrow': 'Jono',
  'queue.empty': 'Ei vielä kuvia.',
  'queue.statusPending': 'odottaa',
  'queue.statusConverting': 'muunnetaan',
  'queue.statusConverted': 'muunnettu',
  'queue.statusExported': 'viety',
  'queue.statusError': 'virhe',
  'queue.errorPrefix': 'virhe: {message}',
  'queue.errorUnknown': 'tuntematon',
  'queue.downscaledTitle':
    'Tämä kuva ylitti suurimman sallitun työskentelykoon ja sitä pienennettiin automaattisesti ennen muuntamista.',
  'queue.downscaledLabel': 'pienennetty',
  'queue.previewAriaLabel': 'Esikatsele {name}',

  'export.eyebrow': 'Vienti',
  'export.formatAriaLabel': 'Vie aktiivinen kuva muodossa {format}',
  'export.batchButton': 'Vie kaikki jonossa olevat kuvat TXT-muodossa',
  'export.noActiveImage': 'Ei aktiivista kuvaa vietäväksi.',
  'export.cancelled': 'Kuvan "{name}" vienti peruutettu.',
  'export.exported': '"{name}" viety muodossa {format}.',
  'export.failed': 'Vienti epäonnistui: {error}',
  'export.batchSummary': 'Eräajovienti: {succeeded} onnistui, {failed} epäonnistui{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} peruutettu',

  'appearance.eyebrow': 'Ulkoasu',
  'appearance.shape': 'Muoto',
  'appearance.round': 'Pyöreä',
  'appearance.soft': 'Pehmeä',
  'appearance.square': 'Kulmikas',
  'appearance.theme': 'Teema',
  'appearance.dark': 'Tumma',
  'appearance.light': 'Vaalea',
  'appearance.system': 'Järjestelmä',
  'appearance.accent': 'Korostusväri',
  'appearance.accentPresets': 'Esiasetukset',
  'appearance.accentSunflower': 'Auringonkukka',
  'appearance.accentBlue': 'Sininen',
  'appearance.accentGreen': 'Vihreä',
  'appearance.accentRed': 'Punainen',
  'appearance.accentPurple': 'Violetti',
  'appearance.rainbow': 'Sateenkaaritila',
  'appearance.rainbowPalette': 'Sateenkaaripaletti',
  'appearance.resetToDefault': 'Palauta oletusasetukset',
  'appearance.language': 'Kieli',
  'presets.eyebrow': 'Esiasetukset',
  'presets.exportButton': 'Vie asetukset',
  'presets.importButton': 'Tuo asetukset',
  'presets.exported': 'Asetukset viety.',
  'presets.exportCancelled': 'Vienti peruutettu.',
  'presets.imported': 'Asetukset tuotu.',
  'presets.importInvalid': 'Tämä tiedosto ei ole kelvollinen TrickWork-esiasetus.',
  'cards.reorderHandle': 'Vedä järjestääksesi uudelleen',
}

export default dict
