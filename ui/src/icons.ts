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

// A filled glyph from the sets GlimStone's glyphs.md draws from, Streamline's
// free Core Solid (CC BY 4.0, https://streamlinehq.com) and Material Design
// Icons (Apache 2.0), cropped to its ink so marks side by side come out the
// same size.
function solidSvg(d: string, viewBox: string, size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="${viewBox}" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="${d}" /></svg>`
}

// Settings. Streamline interface-essential/cog.svg, IconGear in glyphs.md.
export function iconSettings(): string {
  return solidSvg(
    'm5.557 0.69 -0.463 1.195 -1.594 0.904 -1.27 -0.194a1.077 1.077 0 0 0 -1.078 0.528l-0.43 0.754a1.077 1.077 0 0 0 0.086 1.217l0.807 1.001v1.81L0.83 8.906a1.077 1.077 0 0 0 -0.086 1.217l0.43 0.754a1.077 1.077 0 0 0 1.078 0.528l1.27 -0.194 1.573 0.904 0.463 1.196a1.076 1.076 0 0 0 1 0.689h0.905a1.076 1.076 0 0 0 1.002 -0.69l0.463 -1.195 1.572 -0.904 1.27 0.194a1.077 1.077 0 0 0 1.078 -0.528l0.43 -0.754a1.077 1.077 0 0 0 -0.086 -1.217l-0.807 -1.001v-1.81l0.786 -1.001a1.077 1.077 0 0 0 0.086 -1.217l-0.43 -0.754a1.076 1.076 0 0 0 -1.078 -0.528l-1.27 0.194 -1.573 -0.904L8.443 0.689A1.077 1.077 0 0 0 7.442 0h-0.884a1.077 1.077 0 0 0 -1.001 0.69ZM7 9.25a2.25 2.25 0 1 0 0 -4.5 2.25 2.25 0 0 0 0 4.5Z',
    '0 0 14 14',
    22,
  )
}

// A settings tab's glyph is the rail's size, 20px.
function tabSvg(d: string, viewBox: string): string {
  return solidSvg(d, viewBox, 20)
}

// The General tab. Material Design Icons' tune.
export function iconGeneral(): string {
  return tabSvg(
    'M3,17V19H9V17H3M3,5V7H13V5H3M13,21V19H21V17H13V15H11V21H13M7,9V11H3V13H7V15H9V9H7M21,13V11H11V13H21M15,9H17V7H21V5H17V3H15V9Z',
    '3 3 18 18',
  )
}

// The Look tab. Streamline interface-essential/color-palette.svg.
export function iconLook(): string {
  return tabSvg(
    'M3.97352 4.06315C4.44759 2.85522 5.62392 2 7 2c1.37608 0 2.55241 0.85522 3.0265 2.06315C9.77381 4.02161 9.51443 4 9.25 4c-0.81407 0 -1.5803 0.20479 -2.25 0.56565C6.3303 4.20479 5.56407 4 4.75 4c-0.26443 0 -0.52381 0.02161 -0.77648 0.06315Zm-1.69089 0.62715C2.5596 2.33072 4.566 0.5 7 0.5c2.43399 0 4.4404 1.83072 4.7174 4.1903C13.0861 5.52393 14 7.03024 14 8.75c0 2.6234 -2.1266 4.75 -4.75 4.75 -0.81407 0 -1.5803 -0.2048 -2.25 -0.5657 -0.6697 0.3609 -1.43593 0.5657 -2.25 0.5657C2.12665 13.5 0 11.3734 0 8.75c0 -1.71976 0.913945 -3.22607 2.28263 -4.0597Zm7.94307 0.95872C9.91774 5.5522 9.58997 5.5 9.25 5.5c-0.31851 0 -0.62633 0.04582 -0.9172 0.13123 0.46551 0.53432 0.81345 1.17377 1.00351 1.87801 0.4786 -0.49482 0.80139 -1.14123 0.88939 -1.86022ZM9.46737 9.3097c1.02703 -0.62555 1.79803 -1.62987 2.11893 -2.81893 0.5656 0.58481 0.9137 1.38137 0.9137 2.25923 0 1.7949 -1.4551 3.25 -3.25 3.25 -0.31851 0 -0.62633 -0.0458 -0.9172 -0.1312 0.61163 -0.7021 1.0203 -1.5856 1.13457 -2.5591Zm-1.49162 -0.95872C7.88253 7.58958 7.526 6.90956 7 6.40479c-0.526 0.50477 -0.88253 1.18479 -0.97575 1.94619C6.33226 8.4478 6.66003 8.5 7 8.5s0.66774 -0.0522 0.97575 -0.14902ZM6.22353 9.93685C6.47619 9.97839 6.73557 10 7 10c0.26443 0 0.52381 -0.02161 0.77648 -0.06315 -0.17323 0.44135 -0.44023 0.83565 -0.77648 1.15835 -0.33625 -0.3227 -0.60325 -0.717 -0.77647 -1.15835Zm-1.6909 -0.62715c0.11427 0.9735 0.52294 1.857 1.13458 2.5591 -0.29088 0.0854 -0.5987 0.1312 -0.91721 0.1312 -1.79493 0 -3.25 -1.4551 -3.25 -3.25 0 -0.87786 0.34805 -1.67443 0.91369 -2.25924 0.3209 1.18906 1.09189 2.19339 2.11894 2.81894Zm0.13106 -1.80046c-0.4786 -0.49482 -0.80142 -1.14123 -0.88944 -1.86022C4.08226 5.5522 4.41003 5.5 4.75 5.5c0.31851 0 0.62633 0.04582 0.91721 0.13123 -0.46552 0.53432 -0.81346 1.17376 -1.00352 1.87801Z',
    '0 0.5 14 13',
  )
}

// The App tab. Streamline computer-devices/computer-pc-desktop.svg.
export function iconApp(): string {
  return tabSvg(
    'M8 2c-0.55229 0 -1 0.44772 -1 1v0.46875h0.5c1.51878 0 2.75 1.23122 2.75 2.75V6.375l3.75 0V3c0 -0.55228 -0.4477 -1 -1 -1H8Zm-0.10887 11.8713C7.96169 13.6668 8 13.4472 8 13.2188c0 -0.0991 -0.0072 -0.1964 -0.0211 -0.2916 1.29049 -0.2266 2.2711 -1.353 2.2711 -2.7084V7.625l3.75 0V13c0 0.5523 -0.4477 1 -1 1H8.5c-0.21677 0 -0.4228 -0.046 -0.60887 -0.1287Zm4.78077 -9.6838c0 0.42284 -0.3428 0.76562 -0.7657 0.76562 -0.4228 0 -0.7656 -0.34278 -0.7656 -0.76562s0.3428 -0.76562 0.7656 -0.76562c0.4229 0 0.7657 0.34278 0.7657 0.76562ZM0 6.21875c0 -0.82843 0.671573 -1.5 1.5 -1.5h6c0.82843 0 1.5 0.67157 1.5 1.5v4.00005c0 0.8284 -0.67157 1.5 -1.5 1.5H5.25v0.75H6c0.41421 0 0.75 0.3357 0.75 0.75 0 0.4142 -0.33579 0.75 -0.75 0.75H3c-0.41421 0 -0.75 -0.3358 -0.75 -0.75 0 -0.4143 0.33579 -0.75 0.75 -0.75h0.75v-0.75H1.5c-0.828427 0 -1.5 -0.6716 -1.5 -1.5V6.21875Z',
    '0 2 14 12',
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
