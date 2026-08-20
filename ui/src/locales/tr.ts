// ui/src/locales/tr.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': "Görüntüden ASCII sanatına",

  'tabs.adjust': 'Ayarla',
  'tabs.transform': 'Dönüştür',
  'tabs.filters': 'Filtreler',
  'nav.convert': 'Dönüştür',
  'nav.settings': 'Ayarlar',
  'nav.backToConvert': 'Geri',
  'nav.undo': 'Geri al',
  'nav.redo': 'Yinele',

  'history.eyebrow': 'Geçmiş',

  'history.entryWidth': 'Genişlik değiştirildi',

  'history.entryCharsetEdited': 'Karakter kümesi düzenlendi',

  'history.entryCharsetPreset': 'Karakter kümesi: {preset}',

  'history.entryFont': 'Yazı tipi değiştirildi',

  'history.entryRotated': '{deg}° döndürüldü',

  'history.entryFlipHorizontal': 'Yatay çevrildi',

  'history.entryFlipVertical': 'Dikey çevrildi',

  'history.entryBrightness': 'Parlaklık değiştirildi',

  'history.entryContrast': 'Kontrast değiştirildi',

  'history.entryInvert': 'Renk tersine çevirme değiştirildi',

  'history.entryDither': 'Dithering değiştirildi',

  'history.entryColor': 'Renkli çıktı değiştirildi',

  'history.entrySharpen': 'Keskinleştirme değiştirildi',

  'history.entryLevels': 'Tonlar ayarlandı',

  'history.entryLevelsReset': 'Tonlar sıfırlandı',

  'history.entryCrop': 'Kırpma değiştirildi',

  'history.entryCropCleared': 'Kırpma kaldırıldı',

  'history.entrySettingsImported': 'Ayarlar içe aktarıldı',

  'history.logEmpty': 'Henüz değişiklik yok.',

  'import.eyebrow': 'İçe Aktar',
  'import.dropzoneText': "Resimleri buraya bırakın veya dosya seçmek için tıklayın",
  'import.ariaLabel': "Dönüştürülecek resim dosyalarını seçin",

  'crop.eyebrow': 'Kırpma',
  'crop.hint': 'Sadece o bölgeyi dönüştürmek için yukarıdaki resmin üzerine sürükleyin.',
  'crop.clearButton': 'Seçimi temizle',

  'preview.eyebrow': 'Önizleme',
  'preview.empty': "ASCII sanatı olarak burada görmek için yukarıya bir resim bırakın.",
  'preview.zoomOut': 'Uzaklaştır',
  'preview.zoomIn': 'Yakınlaştır',
  'preview.zoomReset': "Yakınlaştırmayı %100'e sıfırla",
  'preview.copy': 'Panoya kopyala',
  'preview.copied': 'Kopyalandı!',

  'controls.eyebrow': 'Kontroller',
  'controls.width': 'Genişlik (sütun)',
  'controls.brightness': 'Parlaklık',
  'controls.contrast': 'Kontrast',
  'controls.charset': 'Karakter kümesi',
  'controls.charsetPresetLabel': 'Karakter kümesi ön ayarı',
  'controls.charsetPresetStandard': 'Standart',
  'controls.charsetPresetDetailed': 'Ayrıntılı',
  'controls.charsetPresetBlocks': 'Bloklar',
  'controls.charsetPresetClassic': 'Klasik',
  'controls.charsetPresetAlternate': 'Alternatif',
  'controls.charsetPresetCompact': 'Kompakt',
  'controls.charsetPresetBold': 'Kalın',
  'controls.charsetPresetSymbols': 'Semboller',
  'controls.charsetPresetMinimal': 'Minimal',
  'controls.charsetPresetBinary': 'İkili',
  'controls.font': 'Yazı tipi',
  'controls.fontMonoSystem': 'Sabit genişlikli (sistem)',
  'controls.fontMonoAlt': 'Sabit genişlikli (alt)',
  'controls.fontSerif': 'Serif (orantılı)',
  'controls.fontSans': 'Sans (orantılı)',
  'controls.rtfNote':
    "Not: RTF dışa aktarımı, yukarıda seçilen yazı tipinden bağımsız olarak her zaman sabit genişlikli bir yazı tipiyle işlenir, çoğu RTF okuyucu keyfi bir orantılı yazı tipini güvenilir şekilde gösteremez.",
  'controls.transform': 'Dönüştür',
  'controls.rotate': 'Döndür',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Yatay çevir',
  'controls.flipVertical': 'Dikey çevir',
  'controls.filters': 'Filtreler',
  'controls.levels': 'Seviyeler',
  'controls.levelsBlack': 'Siyah nokta',
  'controls.levelsGamma': 'Orta tonlar (gama)',
  'controls.levelsWhite': 'Beyaz nokta',
  'controls.levelsReset': 'Sıfırla',
  'controls.invert': 'Renkleri ters çevir',
  'controls.dither': 'Titreme (dithering)',
  'controls.sharpen': 'Netleştirme',
  'controls.sharpenNone': 'Yok',
  'controls.sharpenSharpen': 'Netleştir',
  'controls.sharpenUnsharp': 'Netleştirme maskesi',
  'controls.color': 'Renkli çıktı',
  'controls.colorTxtNote':
    "Not: TXT dışa aktarımı her zaman düz metindir, renk aktarılmaz. Renkli çıktı için XHTML, RTF veya PNG kullanın.",

  'queue.eyebrow': 'Sıra',
  'queue.empty': 'Henüz resim yok.',
  'queue.statusPending': 'bekliyor',
  'queue.statusConverting': 'dönüştürülüyor',
  'queue.statusConverted': 'dönüştürüldü',
  'queue.statusExported': 'dışa aktarıldı',
  'queue.statusError': 'hata',
  'queue.errorPrefix': 'hata: {message}',
  'queue.errorUnknown': 'bilinmiyor',
  'queue.downscaledTitle':
    'Bu resim maksimum çalışma boyutunu aştı ve dönüştürmeden önce otomatik olarak küçültüldü.',
  'queue.downscaledLabel': 'küçültüldü',
  'queue.previewAriaLabel': '{name} önizlemesi',

  'export.eyebrow': 'Dışa Aktar',
  'export.formatAriaLabel': 'Aktif resmi {format} olarak dışa aktar',
  'export.batchButton': 'Sıradaki tüm resimleri TXT olarak dışa aktar',
  'export.noActiveImage': 'Dışa aktarılacak aktif resim yok.',
  'export.cancelled': '"{name}" dışa aktarımı iptal edildi.',
  'export.exported': '"{name}", {format} olarak dışa aktarıldı.',
  'export.failed': 'Dışa aktarma başarısız oldu: {error}',
  'export.batchSummary': 'Toplu dışa aktarım: {succeeded} başarılı, {failed} başarısız{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} iptal edildi',

  'appearance.eyebrow': 'Görünüm',
  'appearance.shape': 'Şekil',
  'appearance.round': 'Yuvarlak',
  'appearance.soft': 'Yumuşak',
  'appearance.square': 'Köşeli',
  'appearance.theme': 'Tema',
  'appearance.dark': 'Koyu',
  'appearance.light': 'Açık',
  'appearance.system': 'Sistem',
  'appearance.accent': 'Vurgu',
  'appearance.accentSunflower': 'Ayçiçeği',
  'appearance.accentBlue': 'Mavi',
  'appearance.accentGreen': 'Yeşil',
  'appearance.accentRed': 'Kırmızı',
  'appearance.accentPurple': 'Mor',
  'appearance.rainbow': 'Gökkuşağı modu',
  'appearance.rainbowPalette': 'Gökkuşağı paleti',
  'appearance.resetToDefault': 'Varsayılana sıfırla',
  'appearance.language': 'Dil',
  'presets.eyebrow': 'Ön ayarlar',
  'presets.exportButton': 'Ayarları dışa aktar',
  'presets.importButton': 'Ayarları içe aktar',
  'presets.exported': 'Ayarlar dışa aktarıldı.',
  'presets.exportCancelled': 'Dışa aktarma iptal edildi.',
  'presets.imported': 'Ayarlar içe aktarıldı.',
  'presets.importInvalid': 'Bu dosya geçerli bir TrickWork ön ayarı değil.',
}

export default dict
