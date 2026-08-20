// ui/src/locales/ar.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'تحويل الصور إلى فن ASCII',

  'tabs.adjust': 'ضبط',
  'tabs.transform': 'تحويل',
  'tabs.filters': 'المرشحات',
  'nav.convert': 'تحويل',
  'nav.settings': 'الإعدادات',
  'nav.backToConvert': 'رجوع',
  'nav.undo': 'تراجع',
  'nav.redo': 'إعادة',

  'history.eyebrow': 'تاريخ',

  'history.entryWidth': 'تم تغيير العرض',

  'history.entryCharsetEdited': 'تم تعديل مجموعة الأحرف',

  'history.entryCharsetPreset': 'مجموعة الأحرف: {preset}',

  'history.entryFont': 'تم تغيير الخط',

  'history.entryRotated': 'تم التدوير {deg}°',

  'history.entryFlipHorizontal': 'تم القلب أفقيًا',

  'history.entryFlipVertical': 'تم القلب رأسيًا',

  'history.entryBrightness': 'تم تغيير السطوع',

  'history.entryContrast': 'تم تغيير التباين',

  'history.entryInvert': 'تم تبديل عكس الألوان',

  'history.entryDither': 'تم تبديل التنقيط',

  'history.entryColor': 'تم تبديل الإخراج الملون',

  'history.entrySharpen': 'تم تغيير الحدة',

  'history.entryLevels': 'تم ضبط المستويات',

  'history.entryLevelsReset': 'تمت إعادة تعيين المستويات',

  'history.entryCrop': 'تم تغيير القص',

  'history.entryCropCleared': 'تمت إزالة القص',

  'history.entrySettingsImported': 'تم استيراد الإعدادات',

  'history.logEmpty': 'لا توجد تغييرات بعد.',

  'import.eyebrow': 'استيراد',
  'import.dropzoneText': 'أفلت الصور هنا، أو انقر لاختيار الملفات',
  'import.ariaLabel': 'اختر ملفات الصور المراد تحويلها',

  'crop.eyebrow': 'قص',
  'crop.hint': 'اسحب فوق الصورة أعلاه لتحويل هذه المنطقة فقط.',
  'crop.clearButton': 'مسح التحديد',

  'preview.eyebrow': 'معاينة',
  'preview.empty': 'أفلت صورة أعلاه لرؤيتها هنا كفن ASCII.',
  'preview.zoomOut': 'تصغير',
  'preview.zoomIn': 'تكبير',
  'preview.zoomReset': 'إعادة ضبط التكبير إلى 100٪',
  'preview.copy': 'نسخ إلى الحافظة',
  'preview.copied': 'تم النسخ!',

  'controls.eyebrow': 'الإعدادات',
  'controls.width': 'العرض (أعمدة)',
  'controls.brightness': 'السطوع',
  'controls.contrast': 'التباين',
  'controls.charset': 'مجموعة الأحرف',
  'controls.charsetPresetLabel': 'قالب طقم الأحرف',
  'controls.charsetPresetStandard': 'قياسي',
  'controls.charsetPresetDetailed': 'مفصل',
  'controls.charsetPresetBlocks': 'كتل',
  'controls.charsetPresetClassic': 'كلاسيكي',
  'controls.charsetPresetAlternate': 'بديل',
  'controls.charsetPresetCompact': 'مضغوط',
  'controls.charsetPresetBold': 'عريض',
  'controls.charsetPresetSymbols': 'رموز',
  'controls.charsetPresetMinimal': 'أدنى',
  'controls.charsetPresetBinary': 'ثنائي',
  'controls.font': 'الخط',
  'controls.fontMonoSystem': 'أحادي التباعد (النظام)',
  'controls.fontMonoAlt': 'أحادي التباعد (بديل)',
  'controls.fontSerif': 'Serif (متناسب)',
  'controls.fontSans': 'Sans (متناسب)',
  'controls.rtfNote':
    'ملاحظة: يُعرض تصدير RTF دائمًا بخط أحادي التباعد ثابت، بغض النظر عن الخط المحدد أعلاه، فمعظم قارئات RTF لا تستطيع عرض خط متناسب عشوائي بشكل موثوق.',
  'controls.transform': 'تحويل',
  'controls.rotate': 'تدوير',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'قلب أفقي',
  'controls.flipVertical': 'قلب رأسي',
  'controls.filters': 'المرشحات',
  'controls.levels': 'مستويات',
  'controls.levelsBlack': 'نقطة السواد',
  'controls.levelsGamma': 'درجات المنتصف (جاما)',
  'controls.levelsWhite': 'نقطة البياض',
  'controls.levelsReset': 'إعادة تعيين',
  'controls.invert': 'عكس الألوان',
  'controls.dither': 'التنقيط (Dithering)',
  'controls.sharpen': 'الحدة',
  'controls.sharpenNone': 'بدون',
  'controls.sharpenSharpen': 'زيادة الحدة',
  'controls.sharpenUnsharp': 'قناع زيادة الحدة',
  'controls.color': 'إخراج ملون',
  'controls.colorTxtNote':
    'ملاحظة: تصدير TXT هو دائمًا نص عادي، ولا يتم نقل الألوان. استخدم XHTML أو RTF أو PNG للحصول على إخراج ملون.',

  'queue.eyebrow': 'قائمة الانتظار',
  'queue.empty': 'لا توجد صور بعد.',
  'queue.statusPending': 'قيد الانتظار',
  'queue.statusConverting': 'جارٍ التحويل',
  'queue.statusConverted': 'تم التحويل',
  'queue.statusExported': 'تم التصدير',
  'queue.statusError': 'خطأ',
  'queue.errorPrefix': 'خطأ: {message}',
  'queue.errorUnknown': 'غير معروف',
  'queue.downscaledTitle': 'تجاوزت هذه الصورة الحد الأقصى لأبعاد العمل، وتم تصغيرها تلقائيًا قبل التحويل.',
  'queue.downscaledLabel': 'تم التصغير',
  'queue.previewAriaLabel': 'معاينة {name}',

  'export.eyebrow': 'تصدير',
  'export.formatAriaLabel': 'تصدير الصورة النشطة بصيغة {format}',
  'export.batchButton': 'تصدير جميع الصور في قائمة الانتظار بصيغة TXT',
  'export.noActiveImage': 'لا توجد صورة نشطة للتصدير.',
  'export.cancelled': 'تم إلغاء تصدير "{name}".',
  'export.exported': 'تم تصدير "{name}" بصيغة {format}.',
  'export.failed': 'فشل التصدير: {error}',
  'export.batchSummary': 'تصدير دفعي: نجح {succeeded}، فشل {failed}{cancelledSuffix}.',
  'export.batchCancelledSuffix': '، تم إلغاء {cancelled}',

  'appearance.eyebrow': 'المظهر',
  'appearance.shape': 'الشكل',
  'appearance.round': 'دائري',
  'appearance.soft': 'ناعم',
  'appearance.square': 'مربع',
  'appearance.theme': 'السمة',
  'appearance.dark': 'داكن',
  'appearance.light': 'فاتح',
  'appearance.system': 'النظام',
  'appearance.accent': 'لون التمييز',
  'appearance.accentSunflower': 'عباد الشمس',
  'appearance.accentBlue': 'أزرق',
  'appearance.accentGreen': 'أخضر',
  'appearance.accentRed': 'أحمر',
  'appearance.accentPurple': 'بنفسجي',
  'appearance.rainbow': 'وضع قوس قزح',
  'appearance.rainbowPalette': 'لوحة قوس قزح',
  'appearance.resetToDefault': 'إعادة التعيين إلى الافتراضي',
  'appearance.language': 'اللغة',
  'presets.eyebrow': 'إعدادات مسبقة',
  'presets.exportButton': 'تصدير الإعدادات',
  'presets.importButton': 'استيراد الإعدادات',
  'presets.exported': 'تم تصدير الإعدادات.',
  'presets.exportCancelled': 'تم إلغاء التصدير.',
  'presets.imported': 'تم استيراد الإعدادات.',
  'presets.importInvalid': 'هذا الملف ليس قالب TrickWork صالحًا.',
}

export default dict
