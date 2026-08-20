// ui/src/locales/ko.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': '이미지를 ASCII 아트로',

  'tabs.adjust': '조정',
  'tabs.transform': '변형',
  'tabs.filters': '필터',
  'nav.convert': '변환',
  'nav.settings': '설정',
  'nav.backToConvert': '뒤로',
  'nav.undo': '실행 취소',
  'nav.redo': '다시 실행',

  'history.eyebrow': '기록',

  'history.entryWidth': '너비 변경됨',

  'history.entryCharsetEdited': '문자 세트 편집됨',

  'history.entryCharsetPreset': '문자 세트: {preset}',

  'history.entryFont': '글꼴 변경됨',

  'history.entryRotated': '{deg}° 회전됨',

  'history.entryFlipHorizontal': '좌우 반전됨',

  'history.entryFlipVertical': '상하 반전됨',

  'history.entryBrightness': '밝기 변경됨',

  'history.entryContrast': '대비 변경됨',

  'history.entryInvert': '색상 반전 전환됨',

  'history.entryDither': '디더링 전환됨',

  'history.entryColor': '컬러 출력 전환됨',

  'history.entrySharpen': '선명도 변경됨',

  'history.entryLevels': '레벨 조정됨',

  'history.entryLevelsReset': '레벨 재설정됨',

  'history.entryCrop': '자르기 변경됨',

  'history.entryCropCleared': '자르기 제거됨',

  'history.entrySettingsImported': '설정 가져옴',

  'history.logEmpty': '아직 변경 사항이 없습니다.',

  'import.eyebrow': '가져오기',
  'import.dropzoneText': '이미지를 여기에 놓거나 클릭하여 파일을 선택하세요',
  'import.ariaLabel': '변환할 이미지 파일 선택',

  'crop.eyebrow': '자르기',
  'crop.hint': '위 이미지를 드래그하여 해당 영역만 변환합니다.',
  'crop.clearButton': '선택 해제',

  'preview.eyebrow': '미리보기',
  'preview.empty': '위에 이미지를 놓으면 여기에 ASCII 아트로 표시됩니다.',
  'preview.zoomOut': '축소',
  'preview.zoomIn': '확대',
  'preview.zoomReset': '확대/축소를 100%로 재설정',
  'preview.copy': '클립보드에 복사',
  'preview.copied': '복사됨!',

  'controls.eyebrow': '설정',
  'controls.width': '너비(열)',
  'controls.brightness': '밝기',
  'controls.contrast': '대비',
  'controls.charset': '문자 세트',
  'controls.charsetPresetLabel': '문자 세트 프리셋',
  'controls.charsetPresetStandard': '표준',
  'controls.charsetPresetDetailed': '상세',
  'controls.charsetPresetBlocks': '블록',
  'controls.charsetPresetClassic': '클래식',
  'controls.charsetPresetAlternate': '대체',
  'controls.charsetPresetCompact': '컴팩트',
  'controls.charsetPresetBold': '굵게',
  'controls.charsetPresetSymbols': '기호',
  'controls.charsetPresetMinimal': '최소',
  'controls.charsetPresetBinary': '이진',
  'controls.font': '글꼴',
  'controls.fontMonoSystem': '고정폭(시스템)',
  'controls.fontMonoAlt': '고정폭(대체)',
  'controls.fontSerif': '세리프(가변폭)',
  'controls.fontSans': '산세리프(가변폭)',
  'controls.rtfNote':
    '참고: RTF 내보내기는 위에서 선택한 글꼴과 관계없이 항상 고정된 고정폭 글꼴로 렌더링됩니다. 대부분의 RTF 리더는 임의의 가변폭 글꼴을 안정적으로 표시하지 못합니다.',
  'controls.transform': '변형',
  'controls.rotate': '회전',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': '좌우 반전',
  'controls.flipVertical': '상하 반전',
  'controls.filters': '필터',
  'controls.levels': '레벨',
  'controls.levelsBlack': '검정점',
  'controls.levelsGamma': '중간톤(감마)',
  'controls.levelsWhite': '흰점',
  'controls.levelsReset': '재설정',
  'controls.invert': '색상 반전',
  'controls.dither': '디더링',
  'controls.sharpen': '선명도',
  'controls.sharpenNone': '없음',
  'controls.sharpenSharpen': '선명하게',
  'controls.sharpenUnsharp': '언샤프 마스크',
  'controls.color': '컬러 출력',
  'controls.colorTxtNote':
    '참고: TXT 내보내기는 항상 일반 텍스트이며 색상 정보가 유지되지 않습니다. 컬러 출력을 원하면 XHTML, RTF 또는 PNG를 사용하세요.',

  'queue.eyebrow': '대기열',
  'queue.empty': '아직 이미지가 없습니다.',
  'queue.statusPending': '대기 중',
  'queue.statusConverting': '변환 중',
  'queue.statusConverted': '변환됨',
  'queue.statusExported': '내보냄',
  'queue.statusError': '오류',
  'queue.errorPrefix': '오류: {message}',
  'queue.errorUnknown': '알 수 없음',
  'queue.downscaledTitle': '이 이미지는 최대 작업 크기를 초과하여 변환 전에 자동으로 축소되었습니다.',
  'queue.downscaledLabel': '축소됨',
  'queue.previewAriaLabel': '{name} 미리보기',

  'export.eyebrow': '내보내기',
  'export.formatAriaLabel': '활성 이미지를 {format}(으)로 내보내기',
  'export.batchButton': '대기열의 모든 이미지를 TXT로 내보내기',
  'export.noActiveImage': '내보낼 활성 이미지가 없습니다.',
  'export.cancelled': '"{name}" 내보내기가 취소되었습니다.',
  'export.exported': '"{name}"을(를) {format}(으)로 내보냈습니다.',
  'export.failed': '내보내기 실패: {error}',
  'export.batchSummary': '일괄 내보내기: 성공 {succeeded}건, 실패 {failed}건{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', 취소 {cancelled}건',

  'appearance.eyebrow': '모양',
  'appearance.shape': '형태',
  'appearance.round': '둥근형',
  'appearance.soft': '부드러운형',
  'appearance.square': '각진형',
  'appearance.theme': '테마',
  'appearance.dark': '다크',
  'appearance.light': '라이트',
  'appearance.system': '시스템',
  'appearance.accent': '강조 색상',
  'appearance.accentSunflower': '해바라기',
  'appearance.accentBlue': '파랑',
  'appearance.accentGreen': '초록',
  'appearance.accentRed': '빨강',
  'appearance.accentPurple': '보라',
  'appearance.rainbow': '무지개',
  'appearance.rainbowPalette': '레인보우 팔레트',
  'appearance.resetToDefault': '기본값으로 재설정',
  'appearance.language': '언어',
  'presets.eyebrow': '프리셋',
  'presets.exportButton': '설정 내보내기',
  'presets.importButton': '설정 가져오기',
  'presets.exported': '설정을 내보냈습니다.',
  'presets.exportCancelled': '내보내기가 취소되었습니다.',
  'presets.imported': '설정을 가져왔습니다.',
  'presets.importInvalid': '이 파일은 유효한 TrickWork 프리셋이 아닙니다.',
}

export default dict
