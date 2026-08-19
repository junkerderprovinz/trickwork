// ui/src/icons.ts
//
// Minimal inline SVG icons, monochrome, matching BombVault/KnightLoader's own
// sidebar icon treatment (20x20 viewBox, currentColor, strokeWidth 1.5 for
// stroked glyphs). TrickWork itself uses the corner Settings badge instead of
// a full sidebar (a deliberate GlimStone-documented exception - see main.ts
// and the vault project note), so only the badge's own two icons live here.

function svg(inner: string, viewBox = '0 0 20 20'): string {
  return `<svg width="22" height="22" viewBox="${viewBox}" fill="none" class="nav-icon" aria-hidden="true">${inner}</svg>`
}

// Left arrow - the settings badge's own state once Settings is open (toggles
// back to Convert), matching the corner-badge alternative documented in
// GlimStone's "The sidebar" section for a genuinely simple, single-workspace app.
export function iconBack(): string {
  return svg(
    `<path d="M12.5 4 6 10l6.5 6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />`,
  )
}

// Standard 8-tooth cog - Appearance/settings, identical concept to BV/KL's own Settings glyph.
export function iconAppearance(): string {
  return svg(
    `<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />`,
  )
}
