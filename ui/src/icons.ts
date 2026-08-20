// ui/src/icons.ts
//
// Minimal inline SVG icons, monochrome, matching BombVault/KnightLoader's own
// sidebar icon treatment (20x20 viewBox, currentColor, strokeWidth 1.5 for
// stroked glyphs). TrickWork itself uses the corner Settings badge instead of
// a full sidebar (a deliberate GlimStone-documented exception - see main.ts
// and the vault project note), so the badge's own two icons live here
// alongside the icon-only toggle buttons iconToggleButton() (controlWidgets.ts)
// uses for Flip/Invert/Dither/Color - aria-hidden everywhere since the
// button's own title/aria-label (the hover tooltip) carries the accessible
// name, not visible text next to the glyph anymore.

function svg(inner: string, viewBox = '0 0 20 20'): string {
  return `<svg width="22" height="22" viewBox="${viewBox}" fill="none" class="nav-icon" aria-hidden="true">${inner}</svg>`
}

// Sized to be the ENTIRE content of a toggle button, not a small aside next
// to label text anymore - bumped up from the original 16px now that the
// icon alone has to carry the option.
function controlSvg(inner: string): string {
  return `<svg width="19" height="19" viewBox="0 0 20 20" fill="none" class="control-icon" aria-hidden="true">${inner}</svg>`
}

// Two triangles pointing away from a dashed vertical mirror axis - flips
// left-right across that axis.
export function iconFlipHorizontal(): string {
  return controlSvg(
    `<path d="M10 3v14" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-dasharray="2 2.5" />` +
      `<path d="M7 7 3 10l4 3z" fill="currentColor" />` +
      `<path d="M13 7l4 3-4 3z" fill="currentColor" />`,
  )
}

// Same idea rotated a quarter turn - flips top-bottom across a horizontal axis.
export function iconFlipVertical(): string {
  return controlSvg(
    `<path d="M3 10h14" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-dasharray="2 2.5" />` +
      `<path d="M7 7 10 3l3 4z" fill="currentColor" />` +
      `<path d="M7 13l3 4 3-4z" fill="currentColor" />`,
  )
}

// Half-filled circle - the standard "invert/contrast" glyph, one ring split
// light/dark down the middle.
export function iconInvert(): string {
  return controlSvg(
    `<circle cx="10" cy="10" r="7.25" stroke="currentColor" stroke-width="1.25" />` +
      `<path d="M10 2.75a7.25 7.25 0 0 0 0 14.5z" fill="currentColor" />`,
  )
}

// A loose scatter of varying-size dots - the halftone/noise pattern
// dithering actually produces, rather than a generic settings glyph.
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

// A paint droplet - color output.
export function iconColor(): string {
  return controlSvg(
    `<path d="M10 2.8c-2.7 3.3-5.1 6.5-5.1 9.3a5.1 5.1 0 0 0 10.2 0c0-2.8-2.4-6-5.1-9.3z" fill="currentColor" />`,
  )
}

// An arrow rising into a receiving tray - the dropzone's own icon, sized up
// from the toolbar glyphs (36px) since it's the sole visual anchor of a
// genuinely inviting drop target, not a small aside next to text.
export function iconUpload(): string {
  return `<svg width="36" height="36" viewBox="0 0 20 20" fill="none" aria-hidden="true">` +
    `<path d="M10 3v10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />` +
    `<path d="M5.5 8.5 10 4l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />` +
    `<path d="M3.5 14.5v1.5a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-1.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" fill="none" />` +
    `</svg>`
}

// Left arrow - the settings badge's own state once Settings is open (toggles
// back to Convert), matching the corner-badge alternative documented in
// GlimStone's "The sidebar" section for a genuinely simple, single-workspace app.
export function iconBack(): string {
  return svg(
    `<path d="M12.5 4 6 10l6.5 6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />`,
  )
}

// Corner-up-left arrow - Undo, in the header's undo/redo button pair.
export function iconUndo(): string {
  return svg(
    `<path d="M7.5 12 3.5 8l4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />` +
      `<path d="M16.5 16v-4.5A3.5 3.5 0 0 0 13 8H3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
  )
}

// Mirror of iconUndo() - Redo.
export function iconRedo(): string {
  return svg(
    `<path d="M12.5 12 16.5 8l-4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />` +
      `<path d="M3.5 16v-4.5A3.5 3.5 0 0 1 7 8h9.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
  )
}

// A counter-clockwise circular arrow - "reset to default", matching
// CannonadeCommand's own reset badge (a Font Awesome fa-undo glyph) rather
// than iconUndo()'s corner-turn arrow, which already means something more
// specific ("step back in history") elsewhere in this app.
export function iconReset(): string {
  return controlSvg(
    `<path d="M4 10a6 6 0 1 1 1.9 4.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" fill="none" />` +
      `<path d="M4 6v4h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" fill="none" />`,
  )
}

// A clipboard glyph - "copy to clipboard", the preview panel's Copy badge.
export function iconCopy(): string {
  return controlSvg(
    `<rect x="6" y="4.5" width="9" height="12" rx="1.5" stroke="currentColor" stroke-width="1.3" fill="none" />` +
      `<path d="M8.5 4.5V3.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1" stroke="currentColor" stroke-width="1.3" fill="none" />`,
  )
}

// A checkmark - the Copy badge's own momentary "copied" confirmation.
export function iconCheck(): string {
  return controlSvg(`<path d="M4.5 10.5l3.5 3.5 7-8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none" />`)
}

// Standard 8-tooth cog - Appearance/settings, identical concept to BV/KL's own Settings glyph.
export function iconAppearance(): string {
  return svg(
    `<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />`,
  )
}
