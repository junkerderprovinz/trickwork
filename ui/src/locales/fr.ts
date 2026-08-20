// ui/src/locales/fr.ts
import type { Translations } from '../i18n'

const dict: Translations = {
  'app.tagline': "Image vers art ASCII",

  'tabs.adjust': 'Ajuster',
  'tabs.transform': 'Transformation',
  'tabs.filters': 'Filtres',
  'nav.convert': 'Convertir',
  'nav.settings': 'Paramètres',
  'nav.backToConvert': 'Retour',
  'nav.undo': 'Annuler',
  'nav.redo': 'Rétablir',

  'history.eyebrow': 'Historique',

  'history.entryWidth': 'Largeur modifiée',

  'history.entryCharsetEdited': 'Jeu de caractères modifié',

  'history.entryCharsetPreset': 'Jeu de caractères : {preset}',

  'history.entryFont': 'Police modifiée',

  'history.entryRotated': 'Rotation de {deg}°',

  'history.entryFlipHorizontal': 'Retourné horizontalement',

  'history.entryFlipVertical': 'Retourné verticalement',

  'history.entryBrightness': 'Luminosité modifiée',

  'history.entryContrast': 'Contraste modifié',

  'history.entryInvert': 'Inversion des couleurs basculée',

  'history.entryDither': 'Tramage basculé',

  'history.entryColor': 'Sortie couleur basculée',

  'history.entrySharpen': 'Netteté modifiée',

  'history.entryLevels': 'Niveaux ajustés',

  'history.entryLevelsReset': 'Niveaux réinitialisés',

  'history.entryCrop': 'Recadrage modifié',

  'history.entryCropCleared': 'Recadrage effacé',

  'history.entrySettingsImported': 'Paramètres importés',

  'history.logEmpty': 'Aucune modification pour le moment.',

  'import.eyebrow': 'Import',
  'import.dropzoneText': 'Déposez des images ici, ou cliquez pour choisir des fichiers',
  'import.ariaLabel': 'Choisir des fichiers image à convertir',

  'crop.eyebrow': 'Recadrage',
  'crop.hint': 'Faites glisser sur l\'image ci-dessus pour ne convertir que cette région.',
  'crop.clearButton': 'Effacer la sélection',

  'preview.eyebrow': 'Aperçu',
  'preview.empty': "Déposez une image ci-dessus pour la voir ici en art ASCII.",
  'preview.zoomOut': 'Dézoomer',
  'preview.zoomIn': 'Zoomer',
  'preview.zoomReset': 'Réinitialiser le zoom à 100 %',
  'preview.copy': 'Copier dans le presse-papiers',
  'preview.copied': 'Copié !',

  'controls.eyebrow': 'Réglages',
  'controls.width': 'Largeur (colonnes)',
  'controls.brightness': 'Luminosité',
  'controls.contrast': 'Contraste',
  'controls.charset': 'Jeu de caractères',
  'controls.charsetPresetLabel': 'Préréglage du jeu de caractères',
  'controls.charsetPresetStandard': 'Standard',
  'controls.charsetPresetDetailed': 'Détaillé',
  'controls.charsetPresetBlocks': 'Blocs',
  'controls.charsetPresetClassic': 'Classique',
  'controls.charsetPresetAlternate': 'Alternatif',
  'controls.charsetPresetCompact': 'Compact',
  'controls.charsetPresetBold': 'Gras',
  'controls.charsetPresetSymbols': 'Symboles',
  'controls.charsetPresetMinimal': 'Minimal',
  'controls.charsetPresetBinary': 'Binaire',
  'controls.font': 'Police',
  'controls.fontMonoSystem': 'Monospace (système)',
  'controls.fontMonoAlt': 'Monospace (alt)',
  'controls.fontSerif': 'Serif (proportionnelle)',
  'controls.fontSans': 'Sans-serif (proportionnelle)',
  'controls.rtfNote':
    "Remarque : l'export RTF est toujours rendu dans une police monospace fixe, quelle que soit la police sélectionnée ci-dessus, la plupart des lecteurs RTF ne peuvent pas afficher de manière fiable une police proportionnelle arbitraire.",
  'controls.transform': 'Transformation',
  'controls.rotate': 'Rotation',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Retourner horizontalement',
  'controls.flipVertical': 'Retourner verticalement',
  'controls.filters': 'Filtres',
  'controls.levels': 'Niveaux',
  'controls.levelsBlack': 'Point noir',
  'controls.levelsGamma': 'Tons moyens (gamma)',
  'controls.levelsWhite': 'Point blanc',
  'controls.levelsReset': 'Réinitialiser',
  'controls.invert': 'Inverser les couleurs',
  'controls.dither': 'Tramage',
  'controls.sharpen': 'Netteté',
  'controls.sharpenNone': 'Aucune',
  'controls.sharpenSharpen': 'Netteté',
  'controls.sharpenUnsharp': 'Masque flou',
  'controls.color': 'Sortie couleur',
  'controls.colorTxtNote':
    "Remarque : l'export TXT est toujours en texte brut, la couleur n'est pas conservée. Utilisez XHTML, RTF ou PNG pour une sortie en couleur.",

  'queue.eyebrow': "File d'attente",
  'queue.empty': "Aucune image pour l'instant.",
  'queue.statusPending': 'en attente',
  'queue.statusConverting': 'conversion en cours',
  'queue.statusConverted': 'converti',
  'queue.statusExported': 'exporté',
  'queue.statusError': 'erreur',
  'queue.errorPrefix': 'erreur : {message}',
  'queue.errorUnknown': 'inconnue',
  'queue.downscaledTitle':
    'Cette image dépassait la dimension de travail maximale et a été réduite automatiquement avant la conversion.',
  'queue.downscaledLabel': 'réduite',
  'queue.previewAriaLabel': 'Aperçu de {name}',

  'export.eyebrow': 'Export',
  'export.formatAriaLabel': "Exporter l'image active au format {format}",
  'export.batchButton': "Exporter toutes les images en attente au format TXT",
  'export.noActiveImage': 'Aucune image active à exporter.',
  'export.cancelled': 'Export de « {name} » annulé.',
  'export.exported': '« {name} » exporté au format {format}.',
  'export.failed': "Échec de l'export : {error}",
  'export.batchSummary': 'Export groupé : {succeeded} réussis, {failed} échoués{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} annulés',

  'appearance.eyebrow': 'Apparence',
  'appearance.shape': 'Forme',
  'appearance.round': 'Rond',
  'appearance.soft': 'Doux',
  'appearance.square': 'Carré',
  'appearance.theme': 'Thème',
  'appearance.dark': 'Sombre',
  'appearance.light': 'Clair',
  'appearance.system': 'Système',
  'appearance.accent': 'Accent',
  'appearance.accentPresets': 'Préréglages',
  'appearance.accentSunflower': 'Tournesol',
  'appearance.accentBlue': 'Bleu',
  'appearance.accentGreen': 'Vert',
  'appearance.accentRed': 'Rouge',
  'appearance.accentPurple': 'Violet',
  'appearance.rainbow': 'Mode arc-en-ciel',
  'appearance.rainbowPalette': 'Palette arc-en-ciel',
  'appearance.resetToDefault': 'Réinitialiser',
  'appearance.language': 'Langue',
  'presets.eyebrow': 'Préréglages',
  'presets.exportButton': 'Exporter les réglages',
  'presets.importButton': 'Importer les réglages',
  'presets.exported': 'Réglages exportés.',
  'presets.exportCancelled': 'Export annulé.',
  'presets.imported': 'Réglages importés.',
  'presets.importInvalid': "Ce fichier n'est pas un préréglage TrickWork valide.",
}

export default dict
