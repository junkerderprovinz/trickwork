// ui/src/locales/uk.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'tabs.adjust': 'Налаштування',
  'tabs.transform': 'Трансформація',
  'tabs.filters': 'Фільтри',
  'nav.convert': 'Конвертувати',
  'nav.settings': 'Налаштування',
  'nav.backToConvert': 'Назад',
  'nav.undo': 'Скасувати',
  'nav.redo': 'Повторити',

  'history.eyebrow': 'Історія',

  'history.entryWidth': 'Ширину змінено',

  'history.entryHeight': 'Висоту змінено',

  'history.entryAspectLocked': 'Співвідношення сторін заблоковано',

  'history.entryCharsetEdited': 'Набір символів відредаговано',

  'history.entryCharsetPreset': 'Набір символів: {preset}',

  'history.entryFont': 'Шрифт змінено',

  'history.entryRotated': 'Повернуто на {deg}°',

  'history.entryFlipHorizontal': 'Віддзеркалено горизонтально',

  'history.entryFlipVertical': 'Віддзеркалено вертикально',

  'history.entryBrightness': 'Яскравість змінено',

  'history.entryContrast': 'Контраст змінено',

  'history.entryInvert': 'Інверсію кольорів перемкнуто',

  'history.entryDither': 'Дизеринг перемкнуто',

  'history.entryColor': 'Кольоровий вивід перемкнуто',

  'history.entrySharpen': 'Різкість змінено',

  'history.entryLevels': 'Рівні скориговано',

  'history.entryLevelsReset': 'Рівні скинуто',

  'history.entryCrop': 'Обрізку змінено',

  'history.entryCropCleared': 'Обрізку видалено',

  'history.entrySettingsImported': 'Налаштування імпортовано',

  'history.logEmpty': 'Поки що без змін.',

  'import.eyebrow': 'Імпорт',
  'import.dropzoneText': 'Перетягніть зображення сюди або натисніть, щоб вибрати файли',
  'import.ariaLabel': 'Вибрати файли зображень для конвертації',

  'crop.eyebrow': 'Обрізка',
  'crop.hint': 'Перетягніть на зображенні вище, щоб перетворити лише цю область.',
  'crop.clearButton': 'Очистити виділення',

  'preview.eyebrow': 'Перегляд',
  'preview.empty': 'Перетягніть зображення вище, щоб побачити його тут як ASCII-арт.',
  'preview.zoomOut': 'Зменшити',
  'preview.zoomIn': 'Збільшити',
  'preview.zoomReset': 'Скинути масштаб до 100%',
  'preview.copy': 'Копіювати в буфер обміну',
  'preview.copied': 'Скопійовано!',

  'controls.eyebrow': 'Налаштування',
  'controls.width': 'Ширина (стовпці)',
  'controls.height': 'Висота (рядки)',
  'controls.aspectLocked': 'Співвідношення сторін заблоковано - висота слідує за шириною',
  'controls.aspectUnlocked': 'Співвідношення сторін розблоковано - висота незалежна',
  'controls.brightness': 'Яскравість',
  'controls.contrast': 'Контраст',
  'controls.charset': 'Набір символів',
  'controls.charsetPresetLabel': 'Пресет набору символів',
  'controls.charsetPresetStandard': 'Стандартний',
  'controls.charsetPresetDetailed': 'Детальний',
  'controls.charsetPresetBlocks': 'Блоки',
  'controls.charsetPresetClassic': 'Класичний',
  'controls.charsetPresetAlternate': 'Альтернативний',
  'controls.charsetPresetCompact': 'Компактний',
  'controls.charsetPresetBold': 'Жирний',
  'controls.charsetPresetSymbols': 'Символи',
  'controls.charsetPresetMinimal': 'Мінімальний',
  'controls.charsetPresetBinary': 'Двійковий',
  'controls.font': 'Шрифт',
  'controls.fontMonoSystem': 'Моноширинний (системний)',
  'controls.fontMonoAlt': 'Моноширинний (альт.)',
  'controls.fontSerif': 'Serif (пропорційний)',
  'controls.fontSans': 'Sans (пропорційний)',
  'controls.rtfNote':
    'Примітка: експорт у RTF завжди відображається моноширинним шрифтом фіксованої ширини, незалежно від обраного вище шрифту, більшість програм для читання RTF не можуть надійно показати довільний пропорційний шрифт.',
  'controls.transform': 'Трансформація',
  'controls.rotate': 'Поворот',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Віддзеркалити горизонтально',
  'controls.flipVertical': 'Віддзеркалити вертикально',
  'controls.filters': 'Фільтри',
  'controls.levels': 'Рівні',
  'controls.levelsBlack': 'Точка чорного',
  'controls.levelsGamma': 'Півтони (гамма)',
  'controls.levelsWhite': 'Точка білого',
  'controls.levelsReset': 'Скинути',
  'controls.invert': 'Інвертувати кольори',
  'controls.dither': 'Дизеринг',
  'controls.sharpen': 'Різкість',
  'controls.sharpenNone': 'Немає',
  'controls.sharpenSharpen': 'Підвищити різкість',
  'controls.sharpenUnsharp': 'Нерізке маскування',
  'controls.color': 'Кольоровий вивід',
  'controls.colorTxtNote':
    'Примітка: експорт у TXT завжди є звичайним текстом, колір не зберігається. Для кольорового виводу використовуйте XHTML, RTF або PNG.',

  'queue.eyebrow': 'Черга',
  'queue.empty': 'Поки що немає зображень.',
  'queue.statusPending': 'у черзі',
  'queue.statusConverting': 'конвертується',
  'queue.statusConverted': 'конвертовано',
  'queue.statusExported': 'експортовано',
  'queue.statusError': 'помилка',
  'queue.errorPrefix': 'помилка: {message}',
  'queue.errorUnknown': 'невідома',
  'queue.downscaledTitle':
    'Це зображення перевищило максимальний робочий розмір і було автоматично зменшено перед конвертацією.',
  'queue.downscaledLabel': 'зменшено',
  'queue.previewAriaLabel': 'Перегляд {name}',

  'export.eyebrow': 'Експорт',
  'export.formatAriaLabel': 'Експортувати активне зображення як {format}',
  'export.batchButton': 'Експортувати всі зображення в черзі як TXT',
  'export.noActiveImage': 'Немає активного зображення для експорту.',
  'export.cancelled': 'Експорт "{name}" скасовано.',
  'export.exported': '"{name}" експортовано як {format}.',
  'export.failed': 'Помилка експорту: {error}',
  'export.batchSummary': 'Пакетний експорт: {succeeded} успішно, {failed} з помилкою{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} скасовано',

  'appearance.eyebrow': 'Зовнішній вигляд',
  'appearance.shape': 'Форма',
  'appearance.round': 'Кругла',
  'appearance.soft': "М'яка",
  'appearance.square': 'Квадратна',
  'appearance.theme': 'Тема',
  'appearance.dark': 'Темна',
  'appearance.light': 'Світла',
  'appearance.system': 'Системна',
  'appearance.accent': 'Акцент',
  'appearance.accentPresets': 'Пресети',
  'appearance.accentSunflower': 'Соняшник',
  'appearance.accentBlue': 'Синій',
  'appearance.accentGreen': 'Зелений',
  'appearance.accentRed': 'Червоний',
  'appearance.accentPurple': 'Фіолетовий',
  'appearance.rainbow': 'Райдужний режим',
  'appearance.rainbowPalette': 'Райдужна палітра',
  'appearance.resetToDefault': 'Скинути до типових',
  'appearance.language': 'Мова',
  'presets.eyebrow': 'Пресети',
  'presets.exportButton': 'Експортувати налаштування',
  'presets.importButton': 'Імпортувати налаштування',
  'presets.exported': 'Налаштування експортовано.',
  'presets.exportCancelled': 'Експорт скасовано.',
  'presets.imported': 'Налаштування імпортовано.',
  'presets.importInvalid': 'Цей файл не є дійсним пресетом TrickWork.',
  'cards.reorderHandle': 'Перетягніть, щоб змінити порядок',
}

export default dict
