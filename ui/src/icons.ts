// Monochrome inline SVG icons on a 20x20 viewBox in currentColor, like the
// BombVault and KnightLoader sidebars. They are aria-hidden because the
// button's title and aria-label carry the name.

function svg(inner: string, viewBox = '0 0 20 20'): string {
  return `<svg width="22" height="22" viewBox="${viewBox}" fill="none" class="nav-icon" aria-hidden="true">${inner}</svg>`
}

// A toggle button shows nothing but its icon, so the icon is larger.
function controlSvg(inner: string): string {
  return `<svg width="19" height="19" viewBox="0 0 20 20" fill="none" class="control-icon" aria-hidden="true">${inner}</svg>`
}

// Two triangles pointing away from a dashed vertical mirror axis.
export function iconFlipHorizontal(): string {
  return controlSvg(
    `<path d="M10 3v14" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-dasharray="2 2.5" />` +
      `<path d="M7 7 3 10l4 3z" fill="currentColor" />` +
      `<path d="M13 7l4 3-4 3z" fill="currentColor" />`,
  )
}

// The same, turned a quarter, with a horizontal axis.
export function iconFlipVertical(): string {
  return controlSvg(
    `<path d="M3 10h14" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-dasharray="2 2.5" />` +
      `<path d="M7 7 10 3l3 4z" fill="currentColor" />` +
      `<path d="M7 13l3 4 3-4z" fill="currentColor" />`,
  )
}

// A half-filled circle, the usual invert glyph.
export function iconInvert(): string {
  return controlSvg(
    `<circle cx="10" cy="10" r="7.25" stroke="currentColor" stroke-width="1.25" />` +
      `<path d="M10 2.75a7.25 7.25 0 0 0 0 14.5z" fill="currentColor" />`,
  )
}

// A loose scatter of dots of varying size, the pattern dithering produces.
export function iconDither(): string {
  return controlSvg(
    `<circle cx="5" cy="6" r="1.5" fill="currentColor" />` +
      `<circle cx="10.5" cy="5" r="0.9" fill="currentColor" />` +
      `<circle cx="15.5" cy="7.5" r="1.7" fill="currentColor" />` +
      `<circle cx="5.5" cy="12" r="0.9" fill="currentColor" />` +
      `<circle cx="11" cy="13" r="1.5" fill="currentColor" />` +
      `<circle cx="16" cy="12" r="0.75" fill="currentColor" />` +
      `<circle cx="4" cy="17" r="0.65" fill="currentColor" />` +
      `<circle cx="10" cy="17.5" r="1.2" fill="currentColor" />` +
      `<circle cx="15" cy="16.5" r="0.9" fill="currentColor" />`,
  )
}

// A closed padlock: the aspect-ratio lock is on and Height follows Width.
export function iconLockClosed(): string {
  return controlSvg(
    `<rect x="4.5" y="9" width="11" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none" />` +
      `<path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" />`,
  )
}

// The shackle swung open: Height is its own slider.
export function iconLockOpen(): string {
  return controlSvg(
    `<rect x="4.5" y="9" width="11" height="8" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none" />` +
      `<path d="M7 9V6.5a3 3 0 0 1 5.7-1.3" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round" />`,
  )
}

// A paint droplet for colour output.
export function iconColor(): string {
  return controlSvg(
    `<path d="M10 2.8c-2.7 3.3-5.1 6.5-5.1 9.3a5.1 5.1 0 0 0 10.2 0c0-2.8-2.4-6-5.1-9.3z" fill="currentColor" />`,
  )
}

// An image placeholder (frame, sun and mountain line) for the dropzone, at
// 40px since it is the only visual anchor of the drop target.
export function iconUpload(): string {
  return `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">` +
    `<rect x="2.75" y="4.75" width="18.5" height="14.5" rx="2.5" stroke="currentColor" stroke-width="1.3" />` +
    `<circle cx="8.25" cy="10" r="1.5" stroke="currentColor" stroke-width="1.3" />` +
    `<path d="M4.25 16.5 9 11.75l3.5 3.5 2.75-2.75L19.75 16.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" fill="none" />` +
    `</svg>`
}

// A left arrow: the settings badge while Settings is open, leading back to
// Convert.
export function iconBack(): string {
  return svg(
    `<path d="M12.5 4 6 10l6.5 6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />`,
  )
}

// A corner-up-left arrow for Undo.
export function iconUndo(): string {
  return svg(
    `<path d="M7.5 12 3.5 8l4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />` +
      `<path d="M16.5 16v-4.5A3.5 3.5 0 0 0 13 8H3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
  )
}

// The mirror of iconUndo() for Redo.
export function iconRedo(): string {
  return svg(
    `<path d="M12.5 12 16.5 8l-4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />` +
      `<path d="M3.5 16v-4.5A3.5 3.5 0 0 1 7 8h9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
  )
}

// A counter-clockwise circular arrow for reset to default, as in
// CannonadeCommand; the corner arrow of iconUndo() already means a step back
// in history.
export function iconReset(): string {
  return controlSvg(
    `<path d="M4 10a6 6 0 1 1 1.9 4.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />` +
      `<path d="M4 6v4h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
  )
}

// A clipboard for the preview's Copy badge.
export function iconCopy(): string {
  return controlSvg(
    `<rect x="6" y="4.5" width="9" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none" />` +
      `<path d="M8.5 4.5V3.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.3" fill="none" />`,
  )
}

// A checkmark for the Copy badge's brief "copied" state.
export function iconCheck(): string {
  return controlSvg(`<path d="M4.5 10.5l3.5 3.5 7-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />`)
}

// A six-dot grip for a sidecard's drag handle.
export function iconGrip(): string {
  return controlSvg(
    [7, 13]
      .flatMap((x) => [4, 10, 16].map((y) => `<circle cx="${x}" cy="${y}" r="1.3" fill="currentColor" />`))
      .join(''),
  )
}

// An 8-tooth cog for Settings, as in BombVault and KnightLoader.
export function iconAppearance(): string {
  return svg(
    `<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />`,
  )
}

// A cross for clearing a selection.
export function iconClear(): string {
  return controlSvg(`<path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" />`)
}

// An arrow into a tray, for saving a file.
export function iconDownload(): string {
  return controlSvg(
    `<path d="M10 3.5v9M6 8.5l4 4 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />` +
      `<path d="M4 14.5v1.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
  )
}

// The mirror of iconDownload(), for reading a file in.
export function iconImport(): string {
  return controlSvg(
    `<path d="M10 12.5v-9M6 7.5l4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />` +
      `<path d="M4 14.5v1.5a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
  )
}
