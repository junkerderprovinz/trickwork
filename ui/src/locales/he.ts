// ui/src/locales/he.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'tabs.adjust': 'כוונון',
  'tabs.transform': 'טרנספורמציה',
  'tabs.filters': 'מסננים',
  'nav.convert': 'המרה',
  'nav.settings': 'הגדרות',
  'nav.backToConvert': 'חזרה',
  'nav.undo': 'בטל',
  'nav.redo': 'בצע שוב',

  'history.eyebrow': 'היסטוריה',

  'history.entryWidth': 'הרוחב השתנה',

  'history.entryHeight': 'הגובה השתנה',

  'history.entryAspectLocked': 'יחס הממדים ננעל',

  'history.entryCharsetEdited': 'ערכת התווים נערכה',

  'history.entryCharsetPreset': 'ערכת תווים: {preset}',

  'history.entryFont': 'הגופן השתנה',

  'history.entryRotated': 'סובב ב-{deg}°',

  'history.entryFlipHorizontal': 'הופך אופקית',

  'history.entryFlipVertical': 'הופך אנכית',

  'history.entryBrightness': 'הבהירות השתנתה',

  'history.entryContrast': 'הניגודיות השתנתה',

  'history.entryInvert': 'היפוך הצבעים הוחלף',

  'history.entryDither': 'הדיתור הוחלף',

  'history.entryColor': 'הפלט הצבעוני הוחלף',

  'history.entrySharpen': 'החידוד השתנה',

  'history.entryLevels': 'הרמות הותאמו',

  'history.entryLevelsReset': 'הרמות אופסו',

  'history.entryCrop': 'החיתוך השתנה',

  'history.entryCropCleared': 'החיתוך הוסר',

  'history.entrySettingsImported': 'ההגדרות יובאו',

  'history.logEmpty': 'אין שינויים עדיין.',

  'import.eyebrow': 'ייבוא',
  'import.dropzoneText': 'גררו תמונות לכאן, או לחצו לבחירת קבצים',
  'import.ariaLabel': 'בחירת קובצי תמונה להמרה',

  'crop.eyebrow': 'חיתוך',
  'crop.hint': 'גרור מעל התמונה למעלה כדי להמיר רק את האזור הזה.',
  'crop.clearButton': 'נקה בחירה',

  'preview.eyebrow': 'תצוגה מקדימה',
  'preview.empty': 'גררו תמונה למעלה כדי לראות אותה כאן כאמנות ASCII.',
  'preview.zoomOut': 'התרחקות',
  'preview.zoomIn': 'התקרבות',
  'preview.zoomReset': 'איפוס התקריב ל-100%',
  'preview.copy': 'העתק ללוח',
  'preview.copied': 'הועתק!',

  'controls.eyebrow': 'בקרות',
  'controls.width': 'רוחב (עמודות)',
  'controls.height': 'גובה (שורות)',
  'controls.aspectLocked': 'יחס הממדים נעול - הגובה עוקב אחר הרוחב',
  'controls.aspectUnlocked': 'יחס הממדים פתוח - הגובה בלתי תלוי',
  'controls.brightness': 'בהירות',
  'controls.contrast': 'ניגודיות',
  'controls.charset': 'ערכת תווים',
  'controls.charsetPresetLabel': 'הגדרה קבועה מראש של ערכת תווים',
  'controls.charsetPresetStandard': 'רגיל',
  'controls.charsetPresetDetailed': 'מפורט',
  'controls.charsetPresetBlocks': 'בלוקים',
  'controls.charsetPresetClassic': 'קלאסי',
  'controls.charsetPresetAlternate': 'חלופי',
  'controls.charsetPresetCompact': 'קומפקטי',
  'controls.charsetPresetBold': 'מודגש',
  'controls.charsetPresetSymbols': 'סמלים',
  'controls.charsetPresetMinimal': 'מינימלי',
  'controls.charsetPresetBinary': 'בינארי',
  'controls.font': 'גופן',
  'controls.fontMonoSystem': 'רוחב קבוע (מערכת)',
  'controls.fontMonoAlt': 'רוחב קבוע (חלופי)',
  'controls.fontSerif': 'סריף (רוחב משתנה)',
  'controls.fontSans': 'סנס-סריף (רוחב משתנה)',
  'controls.rtfNote':
    'הערה: ייצוא RTF תמיד מוצג בגופן קבוע ברוחב אחיד, ללא קשר לגופן שנבחר למעלה, רוב קוראי ה-RTF אינם יכולים להציג באופן אמין גופן ברוחב משתנה כלשהו.',
  'controls.transform': 'טרנספורמציה',
  'controls.rotate': 'סיבוב',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'היפוך אופקי',
  'controls.flipVertical': 'היפוך אנכי',
  'controls.filters': 'מסננים',
  'controls.levels': 'רמות',
  'controls.levelsBlack': 'נקודת שחור',
  'controls.levelsGamma': 'גווני ביניים (גאמא)',
  'controls.levelsWhite': 'נקודת לבן',
  'controls.levelsReset': 'איפוס',
  'controls.invert': 'היפוך צבעים',
  'controls.dither': 'דיתור (Dithering)',
  'controls.sharpen': 'חידוד',
  'controls.sharpenNone': 'ללא',
  'controls.sharpenSharpen': 'חידוד',
  'controls.sharpenUnsharp': 'מסכת חידוד',
  'controls.color': 'פלט צבעוני',
  'controls.colorTxtNote':
    'הערה: ייצוא TXT הוא תמיד טקסט רגיל, הצבע אינו נשמר. להפקת פלט צבעוני יש להשתמש ב-XHTML, RTF או PNG.',

  'queue.eyebrow': 'תור',
  'queue.empty': 'אין עדיין תמונות.',
  'queue.statusPending': 'ממתין',
  'queue.statusConverting': 'בהמרה',
  'queue.statusConverted': 'הומר',
  'queue.statusExported': 'יוצא',
  'queue.statusError': 'שגיאה',
  'queue.errorPrefix': 'שגיאה: {message}',
  'queue.errorUnknown': 'לא ידועה',
  'queue.downscaledTitle': 'תמונה זו חרגה מגודל העבודה המרבי וכווצה אוטומטית לפני ההמרה.',
  'queue.downscaledLabel': 'כווצה',
  'queue.previewAriaLabel': 'תצוגה מקדימה של {name}',

  'export.eyebrow': 'ייצוא',
  'export.formatAriaLabel': 'ייצוא התמונה הפעילה כ-{format}',
  'export.batchButton': 'ייצוא כל התמונות בתור כ-TXT',
  'export.noActiveImage': 'אין תמונה פעילה לייצוא.',
  'export.cancelled': 'ייצוא "{name}" בוטל.',
  'export.exported': '"{name}" יוצא כ-{format}.',
  'export.failed': 'הייצוא נכשל: {error}',
  'export.batchSummary': 'ייצוא מרוכז: {succeeded} הצליחו, {failed} נכשלו{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} בוטלו',

  'appearance.eyebrow': 'מראה',
  'appearance.shape': 'צורה',
  'appearance.round': 'עגול',
  'appearance.soft': 'רך',
  'appearance.square': 'מרובע',
  'appearance.theme': 'ערכת נושא',
  'appearance.dark': 'כהה',
  'appearance.light': 'בהיר',
  'appearance.system': 'מערכת',
  'appearance.accent': 'צבע הדגשה',
  'appearance.accentPresets': 'הגדרות קבועות מראש',
  'appearance.accentSunflower': 'חמנית',
  'appearance.accentBlue': 'כחול',
  'appearance.accentGreen': 'ירוק',
  'appearance.accentRed': 'אדום',
  'appearance.accentPurple': 'סגול',
  'appearance.rainbow': 'מצב קשת',
  'appearance.rainbowPalette': 'פלטת קשת',
  'appearance.resetToDefault': 'איפוס לברירת המחדל',
  'appearance.language': 'שפה',
  'presets.eyebrow': 'הגדרות קבועות מראש',
  'presets.exportButton': 'ייצוא הגדרות',
  'presets.importButton': 'ייבוא הגדרות',
  'presets.exported': 'ההגדרות יוצאו.',
  'presets.exportCancelled': 'הייצוא בוטל.',
  'presets.imported': 'ההגדרות יובאו.',
  'presets.importInvalid': 'קובץ זה אינו הגדרה קבועה מראש תקפה של TrickWork.',
  'cards.reorderHandle': 'גרור לסידור מחדש',
}

export default dict
