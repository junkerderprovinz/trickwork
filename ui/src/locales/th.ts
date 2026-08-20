// ui/src/locales/th.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'แปลงภาพเป็นภาพศิลป์ ASCII',

  'tabs.adjust': 'ปรับแต่ง',
  'tabs.transform': 'แปลงรูป',
  'tabs.filters': 'ฟิลเตอร์',
  'nav.convert': 'แปลง',
  'nav.settings': 'การตั้งค่า',
  'nav.backToConvert': 'กลับ',
  'nav.undo': 'เลิกทำ',
  'nav.redo': 'ทำซ้ำ',

  'history.eyebrow': 'ประวัติ',

  'history.entryWidth': 'เปลี่ยนความกว้างแล้ว',

  'history.entryCharsetEdited': 'แก้ไขชุดอักขระแล้ว',

  'history.entryCharsetPreset': 'ชุดอักขระ: {preset}',

  'history.entryFont': 'เปลี่ยนแบบอักษรแล้ว',

  'history.entryRotated': 'หมุน {deg}° แล้ว',

  'history.entryFlipHorizontal': 'พลิกแนวนอนแล้ว',

  'history.entryFlipVertical': 'พลิกแนวตั้งแล้ว',

  'history.entryBrightness': 'เปลี่ยนความสว่างแล้ว',

  'history.entryContrast': 'เปลี่ยนความคมชัดแล้ว',

  'history.entryInvert': 'สลับการกลับสีแล้ว',

  'history.entryDither': 'สลับดิเธอร์แล้ว',

  'history.entryColor': 'สลับเอาต์พุตสีแล้ว',

  'history.entrySharpen': 'เปลี่ยนความคมชัดภาพแล้ว',

  'history.entryLevels': 'ปรับโทนสีแล้ว',

  'history.entryLevelsReset': 'รีเซ็ตโทนสีแล้ว',

  'history.entryCrop': 'เปลี่ยนการครอบตัดแล้ว',

  'history.entryCropCleared': 'ล้างการครอบตัดแล้ว',

  'history.entrySettingsImported': 'นำเข้าการตั้งค่าแล้ว',

  'history.logEmpty': 'ยังไม่มีการเปลี่ยนแปลง',

  'import.eyebrow': 'นำเข้า',
  'import.dropzoneText': 'ลากภาพมาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์',
  'import.ariaLabel': 'เลือกไฟล์ภาพที่ต้องการแปลง',

  'crop.eyebrow': 'ครอบตัด',
  'crop.hint': 'ลากบนรูปภาพด้านบนเพื่อแปลงเฉพาะบริเวณนั้น',
  'crop.clearButton': 'ล้างการเลือก',

  'preview.eyebrow': 'ตัวอย่าง',
  'preview.empty': 'ลากภาพมาวางด้านบนเพื่อดูเป็นภาพศิลป์ ASCII ที่นี่',
  'preview.zoomOut': 'ซูมออก',
  'preview.zoomIn': 'ซูมเข้า',
  'preview.zoomReset': 'รีเซ็ตการซูมเป็น 100%',
  'preview.copy': 'คัดลอกไปยังคลิปบอร์ด',
  'preview.copied': 'คัดลอกแล้ว!',

  'controls.eyebrow': 'ตัวควบคุม',
  'controls.width': 'ความกว้าง (คอลัมน์)',
  'controls.brightness': 'ความสว่าง',
  'controls.contrast': 'ความคมชัด',
  'controls.charset': 'ชุดอักขระ',
  'controls.charsetPresetLabel': 'พรีเซ็ตชุดอักขระ',
  'controls.charsetPresetStandard': 'มาตรฐาน',
  'controls.charsetPresetDetailed': 'รายละเอียด',
  'controls.charsetPresetBlocks': 'บล็อก',
  'controls.charsetPresetClassic': 'คลาสสิก',
  'controls.charsetPresetAlternate': 'ทางเลือก',
  'controls.charsetPresetCompact': 'กะทัดรัด',
  'controls.charsetPresetBold': 'ตัวหนา',
  'controls.charsetPresetSymbols': 'สัญลักษณ์',
  'controls.charsetPresetMinimal': 'น้อยที่สุด',
  'controls.charsetPresetBinary': 'ไบนารี',
  'controls.font': 'แบบอักษร',
  'controls.fontMonoSystem': 'ความกว้างคงที่ (ระบบ)',
  'controls.fontMonoAlt': 'ความกว้างคงที่ (สำรอง)',
  'controls.fontSerif': 'มีเชิง (สัดส่วน)',
  'controls.fontSans': 'ไม่มีเชิง (สัดส่วน)',
  'controls.rtfNote':
    'หมายเหตุ: การส่งออก RTF จะแสดงผลด้วยแบบอักษรความกว้างคงที่เสมอ ไม่ว่าจะเลือกแบบอักษรใดไว้ด้านบน เนื่องจากโปรแกรมอ่าน RTF ส่วนใหญ่ไม่สามารถแสดงแบบอักษรสัดส่วนใด ๆ ได้อย่างน่าเชื่อถือ',
  'controls.transform': 'แปลงรูป',
  'controls.rotate': 'หมุน',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'พลิกแนวนอน',
  'controls.flipVertical': 'พลิกแนวตั้ง',
  'controls.filters': 'ฟิลเตอร์',
  'controls.levels': 'ระดับ',
  'controls.levelsBlack': 'จุดดำ',
  'controls.levelsGamma': 'โทนกลาง (แกมมา)',
  'controls.levelsWhite': 'จุดขาว',
  'controls.levelsReset': 'รีเซ็ต',
  'controls.invert': 'กลับสี',
  'controls.dither': 'ดิเธอร์',
  'controls.sharpen': 'ความคม',
  'controls.sharpenNone': 'ไม่มี',
  'controls.sharpenSharpen': 'เพิ่มความคม',
  'controls.sharpenUnsharp': 'อันชาร์ปมาสก์',
  'controls.color': 'เอาต์พุตสี',
  'controls.colorTxtNote':
    'หมายเหตุ: การส่งออก TXT จะเป็นข้อความล้วนเสมอ ไม่มีการเก็บข้อมูลสี หากต้องการเอาต์พุตสีให้ใช้ XHTML, RTF หรือ PNG',

  'queue.eyebrow': 'คิว',
  'queue.empty': 'ยังไม่มีภาพ',
  'queue.statusPending': 'รอดำเนินการ',
  'queue.statusConverting': 'กำลังแปลง',
  'queue.statusConverted': 'แปลงแล้ว',
  'queue.statusExported': 'ส่งออกแล้ว',
  'queue.statusError': 'ข้อผิดพลาด',
  'queue.errorPrefix': 'ข้อผิดพลาด: {message}',
  'queue.errorUnknown': 'ไม่ทราบสาเหตุ',
  'queue.downscaledTitle': 'ภาพนี้มีขนาดเกินขีดจำกัดสูงสุดในการประมวลผล จึงถูกย่อขนาดโดยอัตโนมัติก่อนแปลง',
  'queue.downscaledLabel': 'ย่อขนาดแล้ว',
  'queue.previewAriaLabel': 'ดูตัวอย่าง {name}',

  'export.eyebrow': 'ส่งออก',
  'export.formatAriaLabel': 'ส่งออกภาพที่ใช้งานอยู่เป็น {format}',
  'export.batchButton': 'ส่งออกภาพทั้งหมดในคิวเป็น TXT',
  'export.noActiveImage': 'ไม่มีภาพที่ใช้งานอยู่สำหรับส่งออก',
  'export.cancelled': 'ยกเลิกการส่งออก "{name}" แล้ว',
  'export.exported': 'ส่งออก "{name}" เป็น {format} แล้ว',
  'export.failed': 'ส่งออกไม่สำเร็จ: {error}',
  'export.batchSummary': 'ส่งออกเป็นชุด: สำเร็จ {succeeded} รายการ ล้มเหลว {failed} รายการ{cancelledSuffix}',
  'export.batchCancelledSuffix': ' ยกเลิก {cancelled} รายการ',

  'appearance.eyebrow': 'ลักษณะที่ปรากฏ',
  'appearance.shape': 'รูปทรง',
  'appearance.round': 'มน',
  'appearance.soft': 'นุ่มนวล',
  'appearance.square': 'เหลี่ยม',
  'appearance.theme': 'ธีม',
  'appearance.dark': 'มืด',
  'appearance.light': 'สว่าง',
  'appearance.system': 'ตามระบบ',
  'appearance.accent': 'สีเน้น',
  'appearance.accentSunflower': 'ทานตะวัน',
  'appearance.accentBlue': 'น้ำเงิน',
  'appearance.accentGreen': 'เขียว',
  'appearance.accentRed': 'แดง',
  'appearance.accentPurple': 'ม่วง',
  'appearance.rainbow': 'โหมดสีรุ้ง',
  'appearance.rainbowPalette': 'จานสีรุ้ง',
  'appearance.resetToDefault': 'รีเซ็ตเป็นค่าเริ่มต้น',
  'appearance.language': 'ภาษา',
  'presets.eyebrow': 'พรีเซ็ต',
  'presets.exportButton': 'ส่งออกการตั้งค่า',
  'presets.importButton': 'นำเข้าการตั้งค่า',
  'presets.exported': 'ส่งออกการตั้งค่าแล้ว',
  'presets.exportCancelled': 'ยกเลิกการส่งออกแล้ว',
  'presets.imported': 'นำเข้าการตั้งค่าแล้ว',
  'presets.importInvalid': 'ไฟล์นี้ไม่ใช่พรีเซ็ต TrickWork ที่ถูกต้อง',
}

export default dict
