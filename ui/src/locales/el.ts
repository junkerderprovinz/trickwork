// ui/src/locales/el.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': 'Εικόνα σε ASCII τέχνη',

  'tabs.adjust': 'Προσαρμογή',
  'tabs.transform': 'Μετασχηματισμός',
  'tabs.filters': 'Φίλτρα',
  'nav.convert': 'Μετατροπή',
  'nav.settings': 'Ρυθμίσεις',
  'nav.backToConvert': 'Πίσω',
  'nav.undo': 'Αναίρεση',
  'nav.redo': 'Επανάληψη',

  'history.eyebrow': 'Ιστορικό',

  'history.entryWidth': 'Το πλάτος άλλαξε',

  'history.entryCharsetEdited': 'Το σύνολο χαρακτήρων επεξεργάστηκε',

  'history.entryCharsetPreset': 'Σύνολο χαρακτήρων: {preset}',

  'history.entryFont': 'Η γραμματοσειρά άλλαξε',

  'history.entryRotated': 'Περιστράφηκε {deg}°',

  'history.entryFlipHorizontal': 'Οριζόντια αναστροφή',

  'history.entryFlipVertical': 'Κατακόρυφη αναστροφή',

  'history.entryBrightness': 'Η φωτεινότητα άλλαξε',

  'history.entryContrast': 'Η αντίθεση άλλαξε',

  'history.entryInvert': 'Η αντιστροφή χρωμάτων εναλλάχθηκε',

  'history.entryDither': 'Το dithering εναλλάχθηκε',

  'history.entryColor': 'Η έγχρωμη έξοδος εναλλάχθηκε',

  'history.entrySharpen': 'Η όξυνση άλλαξε',

  'history.entryLevels': 'Τα επίπεδα προσαρμόστηκαν',

  'history.entryLevelsReset': 'Τα επίπεδα επαναφέρθηκαν',

  'history.entryCrop': 'Η περικοπή άλλαξε',

  'history.entryCropCleared': 'Η περικοπή αφαιρέθηκε',

  'history.entrySettingsImported': 'Οι ρυθμίσεις εισήχθησαν',

  'history.logEmpty': 'Καμία αλλαγή ακόμα.',

  'import.eyebrow': 'Εισαγωγή',
  'import.dropzoneText': 'Αφήστε εικόνες εδώ, ή κάντε κλικ για να επιλέξετε αρχεία',
  'import.ariaLabel': 'Επιλέξτε αρχεία εικόνων προς μετατροπή',

  'crop.eyebrow': 'Περικοπή',
  'crop.hint': 'Σύρετε πάνω στην εικόνα παραπάνω για να μετατρέψετε μόνο αυτήν την περιοχή.',
  'crop.clearButton': 'Καθαρισμός επιλογής',

  'preview.eyebrow': 'Προεπισκόπηση',
  'preview.empty': 'Αφήστε μια εικόνα παραπάνω για να τη δείτε εδώ ως ASCII τέχνη.',
  'preview.zoomOut': 'Σμίκρυνση',
  'preview.zoomIn': 'Μεγέθυνση',
  'preview.zoomReset': 'Επαναφορά ζουμ στο 100%',
  'preview.copy': 'Αντιγραφή στο πρόχειρο',
  'preview.copied': 'Αντιγράφηκε!',

  'controls.eyebrow': 'Ρυθμίσεις',
  'controls.width': 'Πλάτος (στήλες)',
  'controls.brightness': 'Φωτεινότητα',
  'controls.contrast': 'Αντίθεση',
  'controls.charset': 'Σύνολο χαρακτήρων',
  'controls.charsetPresetLabel': 'Προεπιλογή συνόλου χαρακτήρων',
  'controls.charsetPresetStandard': 'Βασικό',
  'controls.charsetPresetDetailed': 'Λεπτομερές',
  'controls.charsetPresetBlocks': 'Μπλοκ',
  'controls.charsetPresetClassic': 'Κλασικό',
  'controls.charsetPresetAlternate': 'Εναλλακτικό',
  'controls.charsetPresetCompact': 'Συμπαγές',
  'controls.charsetPresetBold': 'Έντονο',
  'controls.charsetPresetSymbols': 'Σύμβολα',
  'controls.charsetPresetMinimal': 'Ελάχιστο',
  'controls.charsetPresetBinary': 'Δυαδικό',
  'controls.font': 'Γραμματοσειρά',
  'controls.fontMonoSystem': 'Σταθερού πλάτους (σύστημα)',
  'controls.fontMonoAlt': 'Σταθερού πλάτους (εναλλακτική)',
  'controls.fontSerif': 'Serif (αναλογική)',
  'controls.fontSans': 'Sans (αναλογική)',
  'controls.rtfNote':
    'Σημείωση: η εξαγωγή RTF εμφανίζεται πάντα με σταθερή γραμματοσειρά σταθερού πλάτους, ανεξάρτητα από τη γραμματοσειρά που επιλέχθηκε παραπάνω, οι περισσότεροι αναγνώστες RTF δεν μπορούν να εμφανίσουν αξιόπιστα μια τυχαία αναλογική γραμματοσειρά.',
  'controls.transform': 'Μετασχηματισμός',
  'controls.rotate': 'Περιστροφή',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Οριζόντια αναστροφή',
  'controls.flipVertical': 'Κατακόρυφη αναστροφή',
  'controls.filters': 'Φίλτρα',
  'controls.levels': 'Τόνοι',
  'controls.levelsBlack': 'Σημείο μαύρου',
  'controls.levelsGamma': 'Ενδιάμεσοι τόνοι (γάμα)',
  'controls.levelsWhite': 'Σημείο λευκού',
  'controls.levelsReset': 'Επαναφορά',
  'controls.invert': 'Αντιστροφή χρωμάτων',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Όξυνση',
  'controls.sharpenNone': 'Καμία',
  'controls.sharpenSharpen': 'Όξυνση',
  'controls.sharpenUnsharp': 'Μάσκα όξυνσης',
  'controls.color': 'Έγχρωμη έξοδος',
  'controls.colorTxtNote':
    'Σημείωση: η εξαγωγή TXT είναι πάντα απλό κείμενο, το χρώμα δεν διατηρείται. Χρησιμοποιήστε XHTML, RTF ή PNG για έγχρωμη έξοδο.',

  'queue.eyebrow': 'Ουρά',
  'queue.empty': 'Δεν υπάρχουν ακόμα εικόνες.',
  'queue.statusPending': 'σε αναμονή',
  'queue.statusConverting': 'μετατρέπεται',
  'queue.statusConverted': 'μετατράπηκε',
  'queue.statusExported': 'εξήχθη',
  'queue.statusError': 'σφάλμα',
  'queue.errorPrefix': 'σφάλμα: {message}',
  'queue.errorUnknown': 'άγνωστο',
  'queue.downscaledTitle':
    'Αυτή η εικόνα υπερέβη τη μέγιστη διάσταση εργασίας και σμικρύνθηκε αυτόματα πριν από τη μετατροπή.',
  'queue.downscaledLabel': 'σμικρύνθηκε',
  'queue.previewAriaLabel': 'Προεπισκόπηση {name}',

  'export.eyebrow': 'Εξαγωγή',
  'export.formatAriaLabel': 'Εξαγωγή ενεργής εικόνας ως {format}',
  'export.batchButton': 'Εξαγωγή όλων των εικόνων της ουράς ως TXT',
  'export.noActiveImage': 'Δεν υπάρχει ενεργή εικόνα προς εξαγωγή.',
  'export.cancelled': 'Η εξαγωγή του "{name}" ακυρώθηκε.',
  'export.exported': 'Το "{name}" εξήχθη ως {format}.',
  'export.failed': 'Η εξαγωγή απέτυχε: {error}',
  'export.batchSummary': 'Μαζική εξαγωγή: {succeeded} επιτυχείς, {failed} απέτυχαν{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} ακυρώθηκαν',

  'appearance.eyebrow': 'Εμφάνιση',
  'appearance.shape': 'Σχήμα',
  'appearance.round': 'Στρογγυλό',
  'appearance.soft': 'Απαλό',
  'appearance.square': 'Τετράγωνο',
  'appearance.theme': 'Θέμα',
  'appearance.dark': 'Σκούρο',
  'appearance.light': 'Ανοιχτό',
  'appearance.system': 'Σύστημα',
  'appearance.accent': 'Χρώμα έμφασης',
  'appearance.accentPresets': 'Προεπιλογές',
  'appearance.accentSunflower': 'Ηλίανθος',
  'appearance.accentBlue': 'Μπλε',
  'appearance.accentGreen': 'Πράσινο',
  'appearance.accentRed': 'Κόκκινο',
  'appearance.accentPurple': 'Μοβ',
  'appearance.rainbow': 'Λειτουργία ουράνιου τόξου',
  'appearance.rainbowPalette': 'Παλέτα ουράνιου τόξου',
  'appearance.resetToDefault': 'Επαναφορά προεπιλογής',
  'appearance.language': 'Γλώσσα',
  'presets.eyebrow': 'Προεπιλογές',
  'presets.exportButton': 'Εξαγωγή ρυθμίσεων',
  'presets.importButton': 'Εισαγωγή ρυθμίσεων',
  'presets.exported': 'Οι ρυθμίσεις εξήχθησαν.',
  'presets.exportCancelled': 'Η εξαγωγή ακυρώθηκε.',
  'presets.imported': 'Οι ρυθμίσεις εισήχθησαν.',
  'presets.importInvalid': 'Αυτό το αρχείο δεν είναι έγκυρη προεπιλογή TrickWork.',
  'cards.reorderHandle': 'Σύρετε για αναδιάταξη',
}

export default dict
