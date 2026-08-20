// ui/src/locales/zh.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': '图片转 ASCII 艺术',

  'tabs.adjust': '调整',
  'tabs.transform': '变换',
  'tabs.filters': '滤镜',
  'nav.convert': '转换',
  'nav.settings': '设置',
  'nav.backToConvert': '返回',
  'nav.undo': '撤销',
  'nav.redo': '重做',

  'history.eyebrow': '历史',

  'history.entryWidth': '宽度已更改',

  'history.entryCharsetEdited': '字符集已编辑',

  'history.entryCharsetPreset': '字符集：{preset}',

  'history.entryFont': '字体已更改',

  'history.entryRotated': '已旋转 {deg}°',

  'history.entryFlipHorizontal': '已水平翻转',

  'history.entryFlipVertical': '已垂直翻转',

  'history.entryBrightness': '亮度已更改',

  'history.entryContrast': '对比度已更改',

  'history.entryInvert': '反转颜色已切换',

  'history.entryDither': '抖动已切换',

  'history.entryColor': '彩色输出已切换',

  'history.entrySharpen': '锐化已更改',

  'history.entryLevels': '色阶已调整',

  'history.entryLevelsReset': '色阶已重置',

  'history.entryCrop': '裁剪已更改',

  'history.entryCropCleared': '裁剪已清除',

  'history.entrySettingsImported': '设置已导入',

  'history.logEmpty': '尚无更改。',

  'import.eyebrow': '导入',
  'import.dropzoneText': '将图片拖到此处，或点击选择文件',
  'import.ariaLabel': '选择要转换的图片文件',

  'crop.eyebrow': '裁剪',
  'crop.hint': '在上方图片上拖动，仅转换该区域。',
  'crop.clearButton': '清除选区',

  'preview.eyebrow': '预览',
  'preview.empty': '将图片拖到上方，即可在此处以 ASCII 艺术形式查看。',
  'preview.zoomOut': '缩小',
  'preview.zoomIn': '放大',
  'preview.zoomReset': '将缩放重置为 100%',
  'preview.copy': '复制到剪贴板',
  'preview.copied': '已复制！',

  'controls.eyebrow': '控制项',
  'controls.width': '宽度(列数)',
  'controls.brightness': '亮度',
  'controls.contrast': '对比度',
  'controls.charset': '字符集',
  'controls.charsetPresetLabel': '字符集预设',
  'controls.charsetPresetStandard': '标准',
  'controls.charsetPresetDetailed': '详细',
  'controls.charsetPresetBlocks': '方块',
  'controls.charsetPresetClassic': '经典',
  'controls.charsetPresetAlternate': '备用',
  'controls.charsetPresetCompact': '紧凑',
  'controls.charsetPresetBold': '粗体',
  'controls.charsetPresetSymbols': '符号',
  'controls.charsetPresetMinimal': '最简',
  'controls.charsetPresetBinary': '二进制',
  'controls.font': '字体',
  'controls.fontMonoSystem': '等宽(系统)',
  'controls.fontMonoAlt': '等宽(备用)',
  'controls.fontSerif': '衬线(比例)',
  'controls.fontSans': '无衬线(比例)',
  'controls.rtfNote':
    '注意：无论上方选择的是什么字体，RTF 导出始终以固定等宽字体渲染，大多数 RTF 阅读器无法可靠地显示任意比例字体。',
  'controls.transform': '变换',
  'controls.rotate': '旋转',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': '水平翻转',
  'controls.flipVertical': '垂直翻转',
  'controls.filters': '滤镜',
  'controls.levels': '色阶',
  'controls.levelsBlack': '黑场',
  'controls.levelsGamma': '中间调(伽马)',
  'controls.levelsWhite': '白场',
  'controls.levelsReset': '重置',
  'controls.invert': '反转颜色',
  'controls.dither': '抖动',
  'controls.sharpen': '锐化',
  'controls.sharpenNone': '无',
  'controls.sharpenSharpen': '锐化',
  'controls.sharpenUnsharp': 'USM 锐化',
  'controls.color': '彩色输出',
  'controls.colorTxtNote': '注意：TXT 导出始终为纯文本，不会保留颜色。如需彩色输出，请使用 XHTML、RTF 或 PNG。',

  'queue.eyebrow': '队列',
  'queue.empty': '暂无图片。',
  'queue.statusPending': '等待中',
  'queue.statusConverting': '转换中',
  'queue.statusConverted': '已转换',
  'queue.statusExported': '已导出',
  'queue.statusError': '错误',
  'queue.errorPrefix': '错误：{message}',
  'queue.errorUnknown': '未知',
  'queue.downscaledTitle': '此图片超出了最大工作尺寸，转换前已自动缩小。',
  'queue.downscaledLabel': '已缩小',
  'queue.previewAriaLabel': '预览 {name}',

  'export.eyebrow': '导出',
  'export.formatAriaLabel': '将当前图片导出为 {format}',
  'export.batchButton': '将队列中的所有图片导出为 TXT',
  'export.noActiveImage': '没有可导出的当前图片。',
  'export.cancelled': '"{name}" 的导出已取消。',
  'export.exported': '"{name}" 已导出为 {format}。',
  'export.failed': '导出失败：{error}',
  'export.batchSummary': '批量导出：成功 {succeeded} 个，失败 {failed} 个{cancelledSuffix}。',
  'export.batchCancelledSuffix': '，已取消 {cancelled} 个',

  'appearance.eyebrow': '外观',
  'appearance.shape': '形状',
  'appearance.round': '圆形',
  'appearance.soft': '柔和',
  'appearance.square': '方形',
  'appearance.theme': '主题',
  'appearance.dark': '深色',
  'appearance.light': '浅色',
  'appearance.system': '跟随系统',
  'appearance.accent': '强调色',
  'appearance.accentPresets': '预设',
  'appearance.accentSunflower': '向日葵黄',
  'appearance.accentBlue': '蓝色',
  'appearance.accentGreen': '绿色',
  'appearance.accentRed': '红色',
  'appearance.accentPurple': '紫色',
  'appearance.rainbow': '彩虹模式',
  'appearance.rainbowPalette': '彩虹调色板',
  'appearance.resetToDefault': '恢复默认设置',
  'appearance.language': '语言',
  'presets.eyebrow': '预设',
  'presets.exportButton': '导出设置',
  'presets.importButton': '导入设置',
  'presets.exported': '设置已导出。',
  'presets.exportCancelled': '导出已取消。',
  'presets.imported': '设置已导入。',
  'presets.importInvalid': '该文件不是有效的 TrickWork 预设。',
}

export default dict
