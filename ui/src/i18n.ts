// The locale is a reactive source of its own beside the Store, since the
// language and the conversion state never need to trigger each other.

// en and de are the source languages and ship in the main bundle; the other
// 24 load lazily, so a visitor downloads only the language they read.
export const en = {
  'tabs.adjust': 'Adjust',
  'tabs.transform': 'Transform',
  'tabs.filters': 'Filters',
  'nav.convert': 'Convert',
  'nav.settings': 'Settings',
  'nav.backToConvert': 'Back',
  'nav.undo': 'Undo',
  'nav.redo': 'Redo',
  'settings.section': 'Settings section',
  'settings.general': 'General',
  'settings.look': 'Look',
  'settings.app': 'App',

  'history.eyebrow': 'History',

  'history.entryWidth': 'Width changed',

  'history.entryHeight': 'Height changed',

  'history.entryAspectLocked': 'Aspect ratio locked',

  'history.entryCharsetEdited': 'Charset edited',

  'history.entryCharsetPreset': 'Charset: {preset}',

  'history.entryFont': 'Font changed',

  'history.entryRotated': 'Rotated {deg}°',

  'history.entryFlipHorizontal': 'Flipped horizontal',

  'history.entryFlipVertical': 'Flipped vertical',

  'history.entryBrightness': 'Brightness changed',

  'history.entryContrast': 'Contrast changed',

  'history.entryInvert': 'Invert toggled',

  'history.entryDither': 'Dithering toggled',

  'history.entryColor': 'Color toggled',

  'history.entrySharpen': 'Sharpening changed',

  'history.entryLevels': 'Levels adjusted',

  'history.entryLevelsReset': 'Levels reset',

  'history.entryCrop': 'Crop changed',

  'history.entryCropCleared': 'Crop cleared',

  'history.entrySettingsImported': 'Settings imported',

  'history.logEmpty': 'No changes yet.',

  'import.eyebrow': 'Import',
  'import.dropzoneText': 'Drop images here, or click to choose files',
  'import.ariaLabel': 'Choose image files to convert',

  'crop.eyebrow': 'Crop',
  'crop.hint': 'Drag on the image above to convert just that region.',
  'crop.clearButton': 'Clear selection',

  'preview.eyebrow': 'Preview',
  'preview.empty': 'Drop an image above to see it here as ASCII art.',
  'preview.zoomOut': 'Zoom out',
  'preview.zoomIn': 'Zoom in',
  'preview.zoomReset': 'Reset zoom to 100%',
  'preview.copy': 'Copy to clipboard',
  'preview.copied': 'Copied!',

  'controls.eyebrow': 'Controls',
  'controls.width': 'Width (columns)',
  'controls.height': 'Height (rows)',
  'controls.aspectLocked': 'Aspect ratio locked - height follows width',
  'controls.aspectUnlocked': 'Aspect ratio unlocked - height is independent',
  'controls.brightness': 'Brightness',
  'controls.contrast': 'Contrast',
  'controls.charset': 'Character set',
  'controls.charsetPresetLabel': 'Character set preset',
  'controls.charsetPresetStandard': 'Standard',
  'controls.charsetPresetDetailed': 'Detailed',
  'controls.charsetPresetBlocks': 'Blocks',
  'controls.charsetPresetClassic': 'Classic',
  'controls.charsetPresetAlternate': 'Alternate',
  'controls.charsetPresetCompact': 'Compact',
  'controls.charsetPresetBold': 'Bold',
  'controls.charsetPresetSymbols': 'Symbols',
  'controls.charsetPresetMinimal': 'Minimal',
  'controls.charsetPresetBinary': 'Binary',
  'controls.font': 'Font',
  'controls.fontMonoSystem': 'Monospace (system)',
  'controls.fontMonoAlt': 'Monospace (alt)',
  'controls.fontSerif': 'Serif (proportional)',
  'controls.fontSans': 'Sans (proportional)',
  'controls.rtfNote':
    'Note: RTF export always renders in a fixed monospace font, regardless of the font selected above - most RTF readers cannot reliably honor an arbitrary proportional font.',
  'controls.transform': 'Transform',
  'controls.rotate': 'Rotate',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Flip horizontal',
  'controls.flipVertical': 'Flip vertical',
  'controls.filters': 'Filters',
  'controls.levels': 'Levels',
  'controls.levelsBlack': 'Black point',
  'controls.levelsGamma': 'Midtones (gamma)',
  'controls.levelsWhite': 'White point',
  'controls.levelsReset': 'Reset',
  'controls.invert': 'Invert colors',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Sharpening',
  'controls.sharpenNone': 'None',
  'controls.sharpenSharpen': 'Sharpen',
  'controls.sharpenUnsharp': 'Unsharp mask',
  'controls.color': 'Color output',
  'controls.colorTxtNote':
    'Note: TXT export is always plain text - color is not carried. Use XHTML, RTF, or PNG for colored output.',

  'queue.eyebrow': 'Queue',
  'queue.empty': 'No images yet.',
  'queue.statusPending': 'pending',
  'queue.statusConverting': 'converting',
  'queue.statusConverted': 'converted',
  'queue.statusExported': 'exported',
  'queue.statusError': 'error',
  'queue.errorPrefix': 'error: {message}',
  'queue.errorUnknown': 'unknown',
  'queue.downscaledTitle':
    'This image exceeded the maximum working dimension and was automatically downscaled before conversion.',
  'queue.downscaledLabel': 'downscaled',
  'queue.previewAriaLabel': 'Preview {name}',

  'export.eyebrow': 'Export',
  'export.formatAriaLabel': 'Export active image as {format}',
  'export.batchButton': 'Export all queued images as TXT',
  'export.noActiveImage': 'No active image to export.',
  'export.cancelled': 'Export of "{name}" cancelled.',
  'export.exported': 'Exported "{name}" as {format}.',
  'export.failed': 'Export failed: {error}',
  'export.batchSummary': 'Batch export: {succeeded} succeeded, {failed} failed{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} cancelled',

  'appearance.shape': 'Shape',
  'appearance.round': 'Round',
  'appearance.soft': 'Soft',
  'appearance.square': 'Square',
  'appearance.theme': 'Theme',
  'appearance.dark': 'Dark',
  'appearance.light': 'Light',
  'appearance.system': 'System',
  'appearance.accent': 'Accent',
  'appearance.accentSunflower': 'Sunflower',
  'appearance.accentBlue': 'Blue',
  'appearance.accentGreen': 'Green',
  'appearance.accentRed': 'Red',
  'appearance.accentPurple': 'Purple',
  'appearance.rainbow': 'Rainbow mode',
  'appearance.rainbowReactive': 'Reactive Mode',
  'appearance.rainbowReactiveHint': "When on, a row or item's colour only appears while you're hovering it, or while it's running or selected. Otherwise it stays neutral. When off, every coloured row and item shows its colour all the time.",
  'appearance.rainbowRotate': 'Colour Rotation',
  'appearance.rainbowRotateHint': "Shifts which colour in the palette counts as position 0, so the same list of rows doesn't always start on the exact same colour every time you turn Rainbow Mode on or reload the page.",
  'appearance.rainbowPalette': 'Rainbow palette',
  'appearance.resetToDefault': 'Reset to default',
  'appearance.language': 'Language',

  'presets.eyebrow': 'Presets',
  'presets.exportButton': 'Export settings',
  'presets.importButton': 'Import settings',
  'presets.exported': 'Settings exported.',
  'presets.exportCancelled': 'Export cancelled.',
  'presets.imported': 'Settings imported.',
  'presets.importInvalid': 'That file is not a valid TrickWork preset.',

  'appearance.leaf': 'Leaf',
  'appearance.motion': 'Animations',
  'appearance.motionHint': "How much every animation in the app moves: a manual dial that sits alongside your system's reduced-motion setting, never overrides it.",
  'appearance.motionOff': 'Off',
  'appearance.motionSubtle': 'Subtle',
  'appearance.motionWild': 'Wild',
  'appearance.motionStorm': 'Storm',
  'appearance.labels': 'Labels',
  'appearance.labelsHint': 'How much of a control is shown: its words, its symbol, or both. Reactive shows the symbol alone and slides the words back in when you point at it. Buttons keep the same width in all four, so switching never reshuffles the page.',
  'appearance.labelText': 'Text',
  'appearance.labelTextGlyph': 'Text and symbol',
  'appearance.labelGlyph': 'Symbol',
  'appearance.labelReactive': 'Reactive',
  'appearance.accentRainbowHint': 'Rainbow mode is on. Turn it off to choose an accent colour again.',
  'appearance.disco': 'Disco Mode',
  'appearance.discoHint': 'Every coloured row and item glides slowly to the next colour in the palette for as long as Rainbow Mode is on.',
  'appearance.accentOrange': 'Orange',
  'appearance.accentTeal': 'Teal',
  'appearance.accentMagenta': 'Magenta',
  'apps.desktopTitle': 'Desktop app',
  'apps.desktopHint': 'TrickWork as a program on your computer, in a window of its own. Every download is the version running here.',
  'apps.serverTitle': 'On a server',
  'apps.serverHint': "TrickWork on a server, where any browser on your network can open it. Install it from Unraid's Community Applications, run the Docker image, or build it from the source code.",
  'apps.windowsPortable': 'Windows portable',
  'apps.windowsArm': 'Windows ARM',
  'apps.dockerHint': 'A click copies the command that starts it:',
  'apps.copied': 'Copied',
  'apps.zip': 'Source code.zip',
  'apps.windows': 'Windows',
  'apps.macos': 'macOS',
  'apps.linux': 'Linux',
  'apps.unraid': 'Unraid',
  'apps.docker': 'Docker',

  'about.title': 'About TrickWork',
  'about.body': 'A one-knight crusade: good-looking open-source tools that did not exist in the shape I wanted, built until nothing is missing. It is free, with no accounts, no telemetry, no ads and no paid tier. No asterisk anywhere. Nothing readable ever leaves your own walls. Forged on evenings and weekends, with heart and stubbornness.',
  'about.coffee': "If TrickWork has earned a place on your server or computer, toss a coin to your knight: it helps cover the costs and keeps the project alive. It also makes this knight's heart beat a little faster. Three ways below, whichever suits you.",
  'about.coffeeButton': 'Buy me a coffee',
  'about.crypto': 'Crypto',
  'about.paypal': 'PayPal',
  'about.cryptoTitle': 'Donate with crypto',
  'about.donateAppeal': 'Toss a coin to your knight: it covers part of the costs and keeps the project alive. Everything I build costs nothing and shows no ads.',
  'about.cryptoIntro': 'Pick a currency and a network, then scan the code or copy the address.',
  'about.cryptoNetworks': 'Networks',
  'about.cryptoNoTag': 'No destination tag and no memo needed.',
  'about.coffeeIntro': 'The payment runs through Buy Me a Coffee. You do not need an account.',
  'about.paypalIntro': 'The payment runs through PayPal, with your PayPal account or by card without one.',
  'about.paypalFrequency': 'How often',
  'about.paypalOnce': 'Once',
  'about.paypalMonthly': 'Monthly',
  'about.paypalYearly': 'Yearly',
  'about.paypalAmount': 'Amount',
  'about.paypalOtherAmount': 'Other amount',
  'about.paypalLoading': 'Loading PayPal…',
  'about.paypalThanks': 'Thank you, your donation went through.',
  'about.paypalFailed': 'PayPal cannot be reached right now. Try again later or pick another way to give.',
  'about.report': "Problems, wishes or suggestions? You're welcome to open an issue on GitHub, or send an email.",
  'about.repo': 'GitHub',
  'about.mail': 'Email',
  'about.mailSubject': 'Feedback',
  'about.version': 'Version',
  'common.close': 'Close',
  'common.copy': 'Copy',

  'cards.reorderHandle': 'Drag to reorder',
}

export type TranslationKey = keyof typeof en
export type Translations = Partial<Record<TranslationKey, string>>

export const de: Translations = {
  'tabs.adjust': 'Anpassen',
  'tabs.transform': 'Transformation',
  'tabs.filters': 'Filter',
  'nav.convert': 'Konvertieren',
  'nav.settings': 'Einstellungen',
  'nav.backToConvert': 'Zurück',
  'nav.undo': 'Rückgängig',
  'nav.redo': 'Wiederherstellen',
  'settings.section': 'Einstellungsbereich',
  'settings.general': 'Allgemein',
  'settings.look': 'Aussehen',
  'settings.app': 'App',

  'history.eyebrow': 'Verlauf',

  'history.entryWidth': 'Breite geändert',

  'history.entryHeight': 'Höhe geändert',

  'history.entryAspectLocked': 'Seitenverhältnis gesperrt',

  'history.entryCharsetEdited': 'Zeichensatz bearbeitet',

  'history.entryCharsetPreset': 'Zeichensatz: {preset}',

  'history.entryFont': 'Schriftart geändert',

  'history.entryRotated': 'Um {deg}° gedreht',

  'history.entryFlipHorizontal': 'Horizontal gespiegelt',

  'history.entryFlipVertical': 'Vertikal gespiegelt',

  'history.entryBrightness': 'Helligkeit geändert',

  'history.entryContrast': 'Kontrast geändert',

  'history.entryInvert': 'Invertieren umgeschaltet',

  'history.entryDither': 'Dithering umgeschaltet',

  'history.entryColor': 'Farbausgabe umgeschaltet',

  'history.entrySharpen': 'Schärfen geändert',

  'history.entryLevels': 'Tonwertkorrektur angepasst',

  'history.entryLevelsReset': 'Tonwertkorrektur zurückgesetzt',

  'history.entryCrop': 'Zuschnitt geändert',

  'history.entryCropCleared': 'Zuschnitt entfernt',

  'history.entrySettingsImported': 'Einstellungen importiert',

  'history.logEmpty': 'Noch keine Änderungen.',

  'import.eyebrow': 'Import',
  'import.dropzoneText': 'Bilder hierher ziehen oder klicken zum Auswählen',
  'import.ariaLabel': 'Bilddateien zum Konvertieren auswählen',

  'crop.eyebrow': 'Zuschnitt',
  'crop.hint': 'Ziehe im Bild oben, um nur diesen Bereich zu konvertieren.',
  'crop.clearButton': 'Auswahl entfernen',

  'preview.eyebrow': 'Vorschau',
  'preview.empty': 'Ziehe oben ein Bild hinein, um es hier als ASCII-Kunst zu sehen.',
  'preview.zoomOut': 'Verkleinern',
  'preview.zoomIn': 'Vergrößern',
  'preview.zoomReset': 'Zoom auf 100 % zurücksetzen',
  'preview.copy': 'In Zwischenablage kopieren',
  'preview.copied': 'Kopiert!',

  'controls.eyebrow': 'Regler',
  'controls.width': 'Breite (Spalten)',
  'controls.height': 'Höhe (Zeilen)',
  'controls.aspectLocked': 'Seitenverhältnis gesperrt - Höhe folgt der Breite',
  'controls.aspectUnlocked': 'Seitenverhältnis entsperrt - Höhe ist unabhängig',
  'controls.brightness': 'Helligkeit',
  'controls.contrast': 'Kontrast',
  'controls.charset': 'Zeichensatz',
  'controls.charsetPresetLabel': 'Zeichensatz-Vorlage',
  'controls.charsetPresetStandard': 'Standard',
  'controls.charsetPresetDetailed': 'Detailliert',
  'controls.charsetPresetBlocks': 'Blöcke',
  'controls.charsetPresetClassic': 'Klassisch',
  'controls.charsetPresetAlternate': 'Alternativ',
  'controls.charsetPresetCompact': 'Kompakt',
  'controls.charsetPresetBold': 'Fett',
  'controls.charsetPresetSymbols': 'Symbole',
  'controls.charsetPresetMinimal': 'Minimal',
  'controls.charsetPresetBinary': 'Binär',
  'controls.font': 'Schriftart',
  'controls.fontMonoSystem': 'Monospace (System)',
  'controls.fontMonoAlt': 'Monospace (alternativ)',
  'controls.fontSerif': 'Serif (proportional)',
  'controls.fontSans': 'Sans (proportional)',
  'controls.rtfNote':
    'Hinweis: Der RTF-Export wird immer in einer festen Monospace-Schrift gerendert, unabhängig von der oben gewählten Schrift - die meisten RTF-Leser können keine beliebige proportionale Schrift zuverlässig darstellen.',
  'controls.transform': 'Transformation',
  'controls.rotate': 'Drehen',
  'controls.rotate0': '0°',
  'controls.rotate90': '90°',
  'controls.rotate180': '180°',
  'controls.rotate270': '270°',
  'controls.flipHorizontal': 'Horizontal spiegeln',
  'controls.flipVertical': 'Vertikal spiegeln',
  'controls.filters': 'Filter',
  'controls.levels': 'Tonwertkorrektur',
  'controls.levelsBlack': 'Schwarzpunkt',
  'controls.levelsGamma': 'Mitteltöne (Gamma)',
  'controls.levelsWhite': 'Weißpunkt',
  'controls.levelsReset': 'Zurücksetzen',
  'controls.invert': 'Farben invertieren',
  'controls.dither': 'Dithering',
  'controls.sharpen': 'Schärfen',
  'controls.sharpenNone': 'Keins',
  'controls.sharpenSharpen': 'Schärfen',
  'controls.sharpenUnsharp': 'Unscharf maskieren',
  'controls.color': 'Farbausgabe',
  'controls.colorTxtNote':
    'Hinweis: Der TXT-Export ist immer reiner Text - Farbe wird nicht übertragen. Für farbige Ausgabe XHTML, RTF oder PNG verwenden.',

  'queue.eyebrow': 'Warteschlange',
  'queue.empty': 'Noch keine Bilder.',
  'queue.statusPending': 'wartend',
  'queue.statusConverting': 'wird konvertiert',
  'queue.statusConverted': 'konvertiert',
  'queue.statusExported': 'exportiert',
  'queue.statusError': 'Fehler',
  'queue.errorPrefix': 'Fehler: {message}',
  'queue.errorUnknown': 'unbekannt',
  'queue.downscaledTitle':
    'Dieses Bild überschritt die maximale Arbeitsgröße und wurde vor der Konvertierung automatisch verkleinert.',
  'queue.downscaledLabel': 'verkleinert',
  'queue.previewAriaLabel': '{name} als Vorschau anzeigen',

  'export.eyebrow': 'Export',
  'export.formatAriaLabel': 'Aktives Bild als {format} exportieren',
  'export.batchButton': 'Alle Bilder in der Warteschlange als TXT exportieren',
  'export.noActiveImage': 'Kein aktives Bild zum Exportieren.',
  'export.cancelled': 'Export von "{name}" abgebrochen.',
  'export.exported': '"{name}" als {format} exportiert.',
  'export.failed': 'Export fehlgeschlagen: {error}',
  'export.batchSummary': 'Batch-Export: {succeeded} erfolgreich, {failed} fehlgeschlagen{cancelledSuffix}.',
  'export.batchCancelledSuffix': ', {cancelled} abgebrochen',

  'appearance.shape': 'Form',
  'appearance.round': 'Rund',
  'appearance.soft': 'Abgerundet',
  'appearance.square': 'Eckig',
  'appearance.theme': 'Thema',
  'appearance.dark': 'Dunkel',
  'appearance.light': 'Hell',
  'appearance.system': 'System',
  'appearance.accent': 'Akzent',
  'appearance.accentSunflower': 'Sonnenblume',
  'appearance.accentBlue': 'Blau',
  'appearance.accentGreen': 'Grün',
  'appearance.accentRed': 'Rot',
  'appearance.accentPurple': 'Lila',
  'appearance.rainbow': 'Regenbogen-Modus',
  'appearance.rainbowReactive': 'Reaktiver Modus',
  'appearance.rainbowReactiveHint': 'Wenn aktiv, bleiben farbige Zeilen und Elemente neutral, bis du sie mit der Maus berührst oder sie gerade laufen oder ausgewählt sind. Die Farbe erscheint also nur bei Bedarf. Wenn deaktiviert, zeigen alle farbigen Zeilen und Elemente ihre Farbe durchgehend.',
  'appearance.rainbowRotate': 'Farbenrotation',
  'appearance.rainbowRotateHint': 'Verschiebt, welche Farbe der Palette als Position 0 gilt, damit dieselbe Liste nicht bei jedem Aktivieren des Regenbogen-Modus oder jedem Neuladen der Seite mit genau derselben Farbe beginnt.',
  'appearance.rainbowPalette': 'Regenbogen-Palette',
  'appearance.resetToDefault': 'Auf Standard zurücksetzen',
  'appearance.language': 'Sprache',

  'presets.eyebrow': 'Vorlagen',
  'presets.exportButton': 'Einstellungen exportieren',
  'presets.importButton': 'Einstellungen importieren',
  'presets.exported': 'Einstellungen exportiert.',
  'presets.exportCancelled': 'Export abgebrochen.',
  'presets.imported': 'Einstellungen importiert.',
  'presets.importInvalid': 'Diese Datei ist keine gültige TrickWork-Vorlage.',

  'appearance.leaf': 'Blatt',
  'appearance.motion': 'Animationen',
  'appearance.motionHint': 'Wie stark sich alle Animationen der App bewegen: ein manueller Regler neben der Systemeinstellung für reduzierte Bewegung, der sie nie überschreibt.',
  'appearance.motionOff': 'Aus',
  'appearance.motionSubtle': 'Dezent',
  'appearance.motionWild': 'Wild',
  'appearance.motionStorm': 'Sturm',
  'appearance.labels': 'Beschriftungen',
  'appearance.labelsHint': 'Wie viel von einem Bedienelement gezeigt wird: seine Wörter, sein Symbol oder beides. Reaktiv zeigt nur das Symbol und blendet die Wörter ein, sobald du darauf zeigst. Buttons behalten in allen vier Fällen dieselbe Breite, das Umschalten verschiebt also nichts.',
  'appearance.labelText': 'Text',
  'appearance.labelTextGlyph': 'Text und Symbol',
  'appearance.labelGlyph': 'Symbol',
  'appearance.labelReactive': 'Reaktiv',
  'appearance.accentRainbowHint': 'Der Regenbogenmodus ist an. Schalte ihn aus, um wieder eine Akzentfarbe zu wählen.',
  'appearance.disco': 'Disco-Modus',
  'appearance.discoHint': 'Jede farbige Zeile und jedes farbige Element gleitet langsam zur nächsten Farbe der Palette, solange der Regenbogen-Modus aktiv ist.',
  'appearance.accentOrange': 'Orange',
  'appearance.accentTeal': 'Türkis',
  'appearance.accentMagenta': 'Magenta',
  'apps.desktopTitle': 'Desktop-App',
  'apps.desktopHint': 'TrickWork als Programm auf dem Rechner, in einem eigenen Fenster. Jeder Download ist die Version, die hier läuft.',
  'apps.serverTitle': 'Auf einem Server',
  'apps.serverHint': 'TrickWork auf einem Server, wo jeder Browser im Netzwerk es öffnen kann: aus den Community Applications von Unraid, als Docker-Image oder aus dem Quellcode gebaut.',
  'apps.windowsPortable': 'Windows portabel',
  'apps.windowsArm': 'Windows ARM',
  'apps.dockerHint': 'Ein Klick kopiert den Befehl, der es startet:',
  'apps.copied': 'Kopiert',
  'apps.zip': 'Quellcode.zip',
  'apps.windows': 'Windows',
  'apps.macos': 'macOS',
  'apps.linux': 'Linux',
  'apps.unraid': 'Unraid',
  'apps.docker': 'Docker',

  'about.title': 'Über TrickWork',
  'about.body': 'Ein einzelner Ritter, ein Feldzug: ansehnliche quelloffene Werkzeuge, die es in der Form, die ich wollte, nicht gab, gebaut, bis nichts mehr fehlt. Alles kostenlos, ohne Konten, ohne Telemetrie, ohne Werbung, ohne Bezahlstufen. Nirgends ein Sternchen. Nichts Lesbares verlässt je deine eigenen Mauern. An Abenden und Wochenenden geschmiedet, mit Herz und Dickkopf.',
  'about.coffee': 'Wenn sich TrickWork einen Platz auf deinem Server oder Rechner verdient hat: wirf deinem Ritter eine Münze zu. Sie hilft, die Kosten zu decken, und hält das Projekt am Leben. Und sie lässt das Herz dieses Ritters etwas höher schlagen. Drei Wege stehen unten, nimm den, der dir passt.',
  'about.coffeeButton': 'Kaffee spendieren',
  'about.crypto': 'Krypto',
  'about.paypal': 'PayPal',
  'about.cryptoTitle': 'Mit Krypto spenden',
  'about.donateAppeal': 'Wirf deinem Ritter eine Münze zu: Sie deckt einen Teil der Kosten und hält das Projekt am Leben. Alles, was ich baue, kostet nichts und zeigt keine Werbung.',
  'about.cryptoIntro': 'Wähle eine Währung und ein Netzwerk, dann scanne den Code oder kopiere die Adresse.',
  'about.cryptoNetworks': 'Netzwerke',
  'about.cryptoNoTag': 'Kein Destination Tag und kein Memo nötig.',
  'about.coffeeIntro': 'Die Zahlung läuft direkt bei Buy Me a Coffee. Ein Konto brauchst du nicht.',
  'about.paypalIntro': 'Die Zahlung läuft direkt bei PayPal, mit deinem PayPal-Konto oder mit Karte ohne Konto.',
  'about.paypalFrequency': 'Wie oft',
  'about.paypalOnce': 'Einmalig',
  'about.paypalMonthly': 'Monatlich',
  'about.paypalYearly': 'Jährlich',
  'about.paypalAmount': 'Betrag',
  'about.paypalOtherAmount': 'Anderer Betrag',
  'about.paypalLoading': 'PayPal wird geladen…',
  'about.paypalThanks': 'Danke, deine Spende ist angekommen.',
  'about.paypalFailed': 'PayPal ist gerade nicht erreichbar. Versuch es später noch einmal oder nimm einen anderen Weg.',
  'about.report': 'Probleme, Wünsche oder Verbesserungsvorschläge? Mach gern ein Issue auf GitHub auf, oder schick eine E-Mail.',
  'about.repo': 'GitHub',
  'about.mail': 'E-Mail',
  'about.mailSubject': 'Rückmeldung',
  'about.version': 'Version',
  'common.close': 'Schließen',
  'common.copy': 'Kopieren',

  'cards.reorderHandle': 'Zum Umsortieren ziehen',
}

export interface LocaleInfo {
  code: string
  label: string
  flag: string
}

// The same 26 locales as BombVault.
export const LOCALES: LocaleInfo[] = [
  { code: 'en', label: 'English', flag: 'gb' },
  { code: 'de', label: 'Deutsch', flag: 'de' },
  { code: 'fr', label: 'Français', flag: 'fr' },
  { code: 'es', label: 'Español', flag: 'es' },
  { code: 'it', label: 'Italiano', flag: 'it' },
  { code: 'pt', label: 'Português', flag: 'pt' },
  { code: 'nl', label: 'Nederlands', flag: 'nl' },
  { code: 'pl', label: 'Polski', flag: 'pl' },
  { code: 'ru', label: 'Русский', flag: 'ru' },
  { code: 'uk', label: 'Українська', flag: 'ua' },
  { code: 'cs', label: 'Čeština', flag: 'cz' },
  { code: 'sv', label: 'Svenska', flag: 'se' },
  { code: 'da', label: 'Dansk', flag: 'dk' },
  { code: 'fi', label: 'Suomi', flag: 'fi' },
  { code: 'no', label: 'Norsk', flag: 'no' },
  { code: 'tr', label: 'Türkçe', flag: 'tr' },
  { code: 'el', label: 'Ελληνικά', flag: 'gr' },
  { code: 'hu', label: 'Magyar', flag: 'hu' },
  { code: 'ro', label: 'Română', flag: 'ro' },
  { code: 'ja', label: '日本語', flag: 'jp' },
  { code: 'ko', label: '한국어', flag: 'kr' },
  { code: 'zh', label: '中文', flag: 'cn' },
  { code: 'ar', label: 'العربية', flag: 'sa' },
  { code: 'he', label: 'עברית', flag: 'il' },
  { code: 'th', label: 'ไทย', flag: 'th' },
  { code: 'vi', label: 'Tiếng Việt', flag: 'vn' },
]

const LAZY_LOCALES: Record<string, () => Promise<{ default: Translations }>> = {
  fr: () => import('./locales/fr'),
  es: () => import('./locales/es'),
  it: () => import('./locales/it'),
  pt: () => import('./locales/pt'),
  nl: () => import('./locales/nl'),
  pl: () => import('./locales/pl'),
  ru: () => import('./locales/ru'),
  uk: () => import('./locales/uk'),
  cs: () => import('./locales/cs'),
  sv: () => import('./locales/sv'),
  da: () => import('./locales/da'),
  fi: () => import('./locales/fi'),
  no: () => import('./locales/no'),
  tr: () => import('./locales/tr'),
  el: () => import('./locales/el'),
  hu: () => import('./locales/hu'),
  ro: () => import('./locales/ro'),
  ja: () => import('./locales/ja'),
  ko: () => import('./locales/ko'),
  zh: () => import('./locales/zh'),
  ar: () => import('./locales/ar'),
  he: () => import('./locales/he'),
  th: () => import('./locales/th'),
  vi: () => import('./locales/vi'),
}

const CACHE_KEY = 'trickwork-locale'

let currentCode = 'en'
let currentDict: Translations = en
const loadedLocales = new Map<string, Translations>([
  ['en', en],
  ['de', de],
])
const listeners = new Set<() => void>()

export function subscribeLocale(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notifyLocale(): void {
  for (const fn of listeners) fn()
}

export function currentLocale(): string {
  return currentCode
}

/**
 * Synchronous, since every mount function calls it while building its DOM. A
 * key missing from the active locale falls back to English.
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const template = currentDict[key] ?? en[key] ?? key
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}

/**
 * Loads the locale if needed, swaps the dictionary and notifies subscribers.
 * Until the import resolves, t() keeps returning the previous language.
 */
export async function setLocale(code: string): Promise<void> {
  if (!LOCALES.some((l) => l.code === code)) return

  const cached = loadedLocales.get(code)
  if (cached) {
    currentCode = code
    currentDict = cached
    persistLocale(code)
    notifyLocale()
    return
  }

  const loader = LAZY_LOCALES[code]
  if (!loader) return
  const module = await loader()
  loadedLocales.set(code, module.default)
  currentCode = code
  currentDict = module.default
  persistLocale(code)
  notifyLocale()
}

function persistLocale(code: string): void {
  try {
    localStorage.setItem(CACHE_KEY, code)
  } catch {
    // A browser with storage disabled just re-detects on next load.
  }
}

/** Applied at boot, before the app renders anything. */
export function applyCachedLocale(): void {
  let code: string | null = null
  try {
    code = localStorage.getItem(CACHE_KEY)
  } catch {
    code = null
  }
  if (code && code !== 'en' && LOCALES.some((l) => l.code === code)) {
    void setLocale(code)
  }
}
