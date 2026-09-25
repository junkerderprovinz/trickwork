# Changelog

All notable changes to TrickWork are documented here.

## Unreleased

### ✨ Added

- Rotate takes any angle. A field beside the four steps accepts degrees, negative ones and tenths included, and the arrow keys turn by 1° or, with Shift, by 15°. The image grows to hold the whole turn, and the corners that adds stay blank, inverted or not.

### 🐛 Fixed

- Every animation answers every Animations setting. Storm and Subtle had borrowed Wild's numbers in a few places (hovering buttons, lifting a dragged card, opening a window, sliding in a label), and a handful of transitions ran at a fixed speed whatever the setting said.
- The App and About buttons' sheen follows the Animations setting, and their names stand still when the system asks for less motion.

### 🎨 Design

- Settings has three tabs: General with the presets and the About card, Look with the language, shape, theme, animations, labels and colours, and App.
- On the Settings page the logo card moves to the top left corner and the Back button to the top right one, with the tabs and cards in the middle of the screen.
- The App tab offers its downloads as buttons in the shape of the README's, with Windows on ARM and the portable build as segments of the Windows button. At rest a button shows its mark and name; under the pointer it lights up in its brand's colour, the name moves up to make room for the second line, and a sheen runs across it once.
- Settings is a little wider, so the Windows button and its segments, macOS and Linux fit in one row.
- The About card gives and reports with the same buttons as the App tab, one line each. Buy Me a Coffee's button wears its own cup and lettering, as in the README.
- The General tab and the Settings button wear the glyphs every app of the family shares: sliders for General, Streamline's cog for Settings.
- Every selector spans the whole width of its card.
- The language list is as tall as a field, not a head taller.

## 1.2.0 - 2026-09-25

### ✨ Added

- An App card in Settings. In the browser it offers the desktop app for Windows (installer or portable), macOS and Linux; in the desktop app it offers Unraid's Community Applications, the Docker command and the source code.
- Settings for how much the interface moves (Off, Subtle, Wild) and for what the buttons show: their words, their symbol, both, or the symbol with the words sliding in under the pointer.
- An About card in Settings, in place of the version line: what TrickWork is, three ways to give (Buy Me a Coffee, PayPal once, monthly or yearly, and crypto), a way to report a problem on GitHub or by email, and the versions. Each way to give opens a window inside the app; in the desktop app on macOS and Linux PayPal opens its own page instead.
- A desktop build for Windows on ARM, as an installer and as a portable app, with its own download button and a tile on the App card.
- Three more accent colours: Orange, Teal and Magenta.
- Reactive Mode and Colour Rotation for the rainbow palette. Reactive shows a colour only under the pointer or on what is active; rotation starts the palette one colour further along at every visit.
- A dragged card floats under the pointer while the others make room, and slides into its gap when let go. Escape puts everything back, and with the handle focused the arrow keys move a card one place.

### 🎨 Design

- A new teal logo, in the README banner, the header, the desktop app's icon and the Unraid icon.
- The look follows GlimStone 2.10.1. Noto Sans ships with the app, so the interface looks the same on every system. In the round shape everything you press is a true pill, and a fresh install starts on soft corners.
- Every card heading is a filled badge sitting on the card's top edge, and in rainbow mode each card takes its own colour.
- The language list opens the Settings page.
- The logo sits in a card of its own at the top of the side column, as wide as the card, with the Settings button and its label below it.
- The browser tab shows the square TrickWork icon.
- A switch is a little smaller, and its knob takes the page's ground, so it is dark on the dark theme.
- Reactive Mode, Colour Rotation and the rainbow palette show only while rainbow mode is on, since none of them does anything while it is off.
- A selector's options sit in one groove sized to them, rather than stretched across the card.
- A filled control gets lighter under the pointer, one step up the surface ramp, instead of darker.
- A click on the chosen accent colour opens the colour picker, so the separate custom swatch is gone.
- The reset at the end of a colour row is the size of a swatch and shows only its symbol, whatever the button labels are set to.
- Whichever colour row rainbow mode is not using is dimmed. While rainbow mode is on, an (i) beside Accent says why.
- A dropdown answers the mouse wheel only after it has been clicked or reached with Tab, so scrolling the page past it leaves its value alone.

### ⚡ Improved

- Every desktop download is also attached without the version in its name, so a link to the latest release always reaches the newest build.
- The README has download buttons for every system, and TrickWork has a documentation site at https://junkerderprovinz.github.io/trickwork/. The README is shorter and points to it for installing and building.
- The screenshots show a knight's helmet turned into ASCII art.
- Tidied the code comments and log messages.

### 🐛 Fixed

- The container log opens with the house banner and the name TrickWork, where it showed the old working title.
- A tooltip no longer opens when focus arrives from a click, or when a dialog hands focus back to the control that opened it, so it cannot stay on the page where the pointer no longer is. Keyboard focus still opens it.

## 1.1.0 — 2026-08-22

### ✨ Added

- A Height (rows) slider beside Width (columns), with an aspect-ratio lock toggle next to it. Locked (the default) keeps height following width and the source image's own proportions automatically, exactly as every version before this one already did. Unlocked turns Height into a real, independent control.

### ⚡ Improved

- The container image now also mirrors to Docker Hub (`junkerderprovinz/trickwork`), alongside GHCR.

## 1.0.0 — 2026-08-21

The first public release. TrickWork turns images into proportional-font-aware ASCII art - a rebuild of the abandoned ASCGen2, with characters picked by how much visual "ink" they actually cover at your chosen font instead of by brightness alone.

### ✨ Added

- Core conversion engine: source image → character grid, driven by real measured glyph ink coverage (a canvas-rendered sample of each character, not an assumption that every glyph looks equally "full") - proportional (non-monospace) fonts render correctly instead of looking stretched or squashed.
- Nine of ASCII Gen 2's own original character ramps, fetched and verified byte-for-byte against its real 2011 source archive - including its own weighting mechanic (a character repeated in the ramp claims proportionally more of the brightness range), plus a bonus 70-character "Detailed" ramp for extra tonal range. The character-set field is fully free-text: paste, edit or hand-tune any ramp.
- Live interactive preview with zoom, alongside the source image and an adjustable crop region.
- Levels (black/gamma/white point, with a live histogram), Brightness/Contrast, Invert, Floyd-Steinberg Dithering, and Color output (per-cell average source colour, carried through every export except plain TXT).
- Sharpen and Unsharp Mask.
- Rotate (0/90/180/270°) and horizontal/vertical flip.
- A batch queue: convert several images with the same settings, export them together as one TXT file.
- Undo/redo history with a readable log of what changed, gesture-aware so a whole slider drag undoes as one step.
- Export to TXT, XHTML, RTF or PNG, or copy the active image straight to the clipboard.
- Export/import the full settings object as a JSON file, to save or share a configuration.
- Two ways to run it from one shared TypeScript/Canvas core, always pixel-for-pixel identical: a self-hosted Docker container (amd64 + arm64, with an Unraid Community Applications template) and a desktop app for Windows, macOS and Linux (via Wails - a portable, no-install 64-bit binary on Windows, a `.dmg` on macOS, a plain binary on Linux). Both are stateless - no database, no accounts, nothing to configure beyond the port.

### 🎨 Design

- A full GlimStone-based interface: dark/light/system theme, a Round/Soft/Square shape engine that reshapes every corner across the whole app at once, and an optional Rainbow mode that hands out a distinct colour per control instead of one flat accent.
- Drag-and-drop reorderable sidebar cards, so the working layout matches how you actually use it.
- Translated into 26 languages.
