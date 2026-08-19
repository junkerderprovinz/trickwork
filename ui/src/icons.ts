// ui/src/icons.ts
//
// Minimal inline SVG icons, monochrome, matching BombVault/KnightLoader's own
// sidebar icon treatment exactly (20x20 viewBox, currentColor, strokeWidth
// 1.5 for stroked glyphs) so TrickWork's nav reads as the same family.

function svg(inner: string, viewBox = '0 0 20 20'): string {
  return `<svg width="22" height="22" viewBox="${viewBox}" fill="none" class="nav-icon" aria-hidden="true">${inner}</svg>`
}

// Sliders/tuner glyph - the Adjust panel (width/brightness/contrast/charset/font).
export function iconAdjust(): string {
  return svg(
    `<path d="M3 6h9M15 6h2M3 14h2M8 14h9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
     <circle cx="13.5" cy="6" r="2" fill="var(--carbon-sidebar)" stroke="currentColor" stroke-width="1.5" />
     <circle cx="6.5" cy="14" r="2" fill="var(--carbon-sidebar)" stroke="currentColor" stroke-width="1.5" />`,
  )
}

// Rotate arrow - the Transform panel (rotate/flip).
export function iconTransform(): string {
  return svg(
    `<path d="M10 3.125a6.875 6.875 0 1 0 6.5 4.625" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
     <path d="M16.875 2.5v4H12.875" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />`,
  )
}

// Funnel - the Filters panel (invert/dither/sharpen/colour).
export function iconFilters(): string {
  return svg(
    `<path d="M3 4h14l-5.5 6.5v5L8.5 17v-6.5L3 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />`,
  )
}

// Stacked list - the Queue panel.
export function iconQueue(): string {
  return svg(
    `<rect x="3" y="4.5" width="14" height="2.5" rx="1" fill="currentColor" />
     <rect x="3" y="8.75" width="14" height="2.5" rx="1" fill="currentColor" opacity=".6" />
     <rect x="3" y="13" width="14" height="2.5" rx="1" fill="currentColor" opacity=".4" />`,
  )
}

// Tray with a down arrow - the Export panel (matches BombVault's own
// download/receiver-style tray glyph family).
export function iconExport(): string {
  return svg(
    `<path d="M3 12.5 4.4 5.2A1.75 1.75 0 0 1 6.1 3.75h7.8a1.75 1.75 0 0 1 1.7 1.45L17 12.5v2.75a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.25V12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
     <path d="M3 12.5h3.5a1 1 0 0 1 1 1 1.5 1.5 0 0 0 1.5 1.5h2a1.5 1.5 0 0 0 1.5-1.5 1 1 0 0 1 1-1H17" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
     <path d="M10 5.75v4.5M8 8.25l2 2 2-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />`,
  )
}

// Standard 8-tooth cog - Appearance/settings, identical concept to BV/KL's own Settings glyph.
export function iconAppearance(): string {
  return svg(
    `<path fill-rule="evenodd" clip-rule="evenodd" fill="currentColor" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1 2.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 0 1 2.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 0 1 .947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 0 1-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 0 1-2.287-.947zM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />`,
  )
}
