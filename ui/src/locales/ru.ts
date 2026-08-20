// ui/src/locales/ru.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'Изображение в ASCII-арт',

  'tabs.adjust': 'Настройка',
  'tabs.transform': 'Трансформация',
  'tabs.filters': 'Фильтры',
  'nav.convert': 'Конвертировать',
  'nav.settings': 'Настройки',
  'nav.backToConvert': 'Назад',
  'nav.undo': 'Отменить',
  'nav.redo': 'Повторить',

  'history.eyebrow': 'История',

  'history.entryWidth': 'Ширина изменена',

  'history.entryCharsetEdited': 'Набор символов изменён',

  'history.entryCharsetPreset': 'Набор символов: {preset}',

  'history.entryFont': 'Шрифт изменён',

  'history.entryRotated': 'Повёрнуто на {deg}°',

  'history.entryFlipHorizontal': 'Отражено по горизонтали',

  'history.entryFlipVertical': 'Отражено по вертикали',

  'history.entryBrightness': 'Яркость изменена',

  'history.entryContrast': 'Контраст изменён',

  'history.entryInvert': 'Инверсия цветов переключена',

  'history.entryDither': 'Дизеринг переключён',

  'history.entryColor': 'Цветной вывод переключён',

  'history.entrySharpen': 'Резкость изменена',

  'history.entryLevels': 'Уровни скорректированы',

  'history.entryLevelsReset': 'Уровни сброшены',

  'history.entryCrop': 'Обрезка изменена',

  'history.entryCropCleared': 'Обрезка удалена',

  'history.entrySettingsImported': 'Настройки импортированы',

  'history.logEmpty': 'Пока нет изменений.',

  'import.eyebrow': 'Импорт',
  'import.dropzoneText': 'Перетащите изображения сюда или нажмите, чтобы выбрать файлы',
  'import.ariaLabel': 'Выбрать файлы изображений для конвертации',

  'crop.eyebrow': 'Обрезка',
  'crop.hint': 'Перетащите на изображении выше, чтобы преобразовать только эту область.',
  'crop.clearButton': 'Очистить выделение',

  'preview.eyebrow': 'Просмотр',
  'preview.empty': 'Перетащите изображение выше, чтобы увидеть его здесь в виде ASCII-арта.',
  'preview.zoomOut': 'Уменьшить',
  'preview.zoomIn': 'Увеличить',
  'preview.zoomReset': 'Сбросить масштаб до 100%',
  'preview.copy': 'Копировать в буфер обмена',
  'preview.copied': 'Скопировано!',

  'controls.eyebrow': 'Настройки',
  'controls.width': 'Ширина (столбцы)',
  'controls.brightness': 'Яркость',
  'controls.contrast': 'Контраст',
  'controls.charset': 'Набор символов',
  'controls.charsetPresetLabel': 'Пресет набора символов',
  'controls.charsetPresetStandard': 'Стандартный',
  'controls.charsetPresetDetailed': 'Подробный',
  'controls.charsetPresetBlocks': 'Блоки',
  'controls.charsetPresetClassic': 'Классический',
  'controls.charsetPresetAlternate': 'Альтернативный',
  'controls.charsetPresetCompact': 'Компактный',
  'controls.charsetPresetBold': 'Жирный',
  'controls.charsetPresetSymbols': 'Символы',
  'controls.charsetPresetMinimal': 'Минимальный',
  'controls.charsetPresetBinary': 'Двоичный',
  'controls.font': 'Шрифт',
  'controls.fontMonoSystem': 'Моноширинный (системный)',
  'controls.fontMonoAlt': 'Моноширинный (альт.)',
  'controls.fontSerif': 'Serif (пропорциональный)',
  'controls.fontSans': 'Sans (пропорциональный)',
  'controls.rtfNote':
    'Примечание: экспорт в RTF всегда отображается моноширинным шрифтом фиксированной ширины, независимо от выбранного выше шрифта, большинство программ для чтения RTF не могут надёжно отобразить произвольный пропорциональный шрифт.',
  'controls.transform': 'Трансформация',
  'controls.rotate': 'Поворот',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Отразить по горизонтали',
  'controls.flipVertical': 'Отразить по вертикали',
  'controls.filters': 'Фильтры',
  'controls.levels': 'Уровни',
  'controls.levelsBlack': 'Точка черного',
  'controls.levelsGamma': 'Полутона (гамма)',
  'controls.levelsWhite': 'Точка белого',
  'controls.levelsReset': 'Сбросить',
  'controls.invert': 'Инвертировать цвета',
  'controls.dither': 'Дизеринг',
  'controls.sharpen': 'Резкость',
  'controls.sharpenNone': 'Нет',
  'controls.sharpenSharpen': 'Повысить резкость',
  'controls.sharpenUnsharp': 'Нерезкое маскирование',
  'controls.color': 'Цветной вывод',
  'controls.colorTxtNote':
    'Примечание: экспорт в TXT всегда представляет собой обычный текст, цвет не сохраняется. Для цветного вывода используйте XHTML, RTF или PNG.',

  'queue.eyebrow': 'Очередь',
  'queue.empty': 'Пока нет изображений.',
  'queue.statusPending': 'в очереди',
  'queue.statusConverting': 'конвертируется',
  'queue.statusConverted': 'конвертировано',
  'queue.statusExported': 'экспортировано',
  'queue.statusError': 'ошибка',
  'queue.errorPrefix': 'ошибка: {message}',
  'queue.errorUnknown': 'неизвестно',
  'queue.downscaledTitle':
    'Это изображение превысило максимальный рабочий размер и было автоматически уменьшено перед конвертацией.',
  'queue.downscaledLabel': 'уменьшено',
  'queue.previewAriaLabel': 'Просмотр {name}',

  'export.eyebrow': 'Экспорт',
  'export.formatAriaLabel': 'Экспортировать активное изображение как {format}',
  'export.batchButton': 'Экспортировать все изображения из очереди как TXT',
  'export.noActiveImage': 'Нет активного изображения для экспорта.',
  'export.cancelled': 'Экспорт "{name}" отменён.',
  'export.exported': '"{name}" экспортировано как {format}.',
  'export.failed': 'Ошибка экспорта: {error}',
  'export.batchSummary': 'Пакетный экспорт: {succeeded} успешно, {failed} с ошибкой{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} отменено',

  'appearance.eyebrow': 'Внешний вид',
  'appearance.shape': 'Форма',
  'appearance.round': 'Круглая',
  'appearance.soft': 'Мягкая',
  'appearance.square': 'Квадратная',
  'appearance.theme': 'Тема',
  'appearance.dark': 'Тёмная',
  'appearance.light': 'Светлая',
  'appearance.system': 'Системная',
  'appearance.accent': 'Акцент',
  'appearance.accentPresets': 'Пресеты',
  'appearance.accentSunflower': 'Подсолнух',
  'appearance.accentBlue': 'Синий',
  'appearance.accentGreen': 'Зелёный',
  'appearance.accentRed': 'Красный',
  'appearance.accentPurple': 'Фиолетовый',
  'appearance.rainbow': 'Радужный режим',
  'appearance.rainbowPalette': 'Радужная палитра',
  'appearance.resetToDefault': 'Сбросить по умолчанию',
  'appearance.language': 'Язык',
  'presets.eyebrow': 'Пресеты',
  'presets.exportButton': 'Экспортировать настройки',
  'presets.importButton': 'Импортировать настройки',
  'presets.exported': 'Настройки экспортированы.',
  'presets.exportCancelled': 'Экспорт отменён.',
  'presets.imported': 'Настройки импортированы.',
  'presets.importInvalid': 'Этот файл не является допустимым пресетом TrickWork.',
}

export default dict
