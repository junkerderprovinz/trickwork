/**
 * Generates the TrickWork banners:
 *
 *   trickwork-banner.svg/.png       1600x500, light, logo, name and claim  (README, light)
 *   trickwork-banner-dark.svg/.png  1600x500, dark, logo, name and claim   (README, GitHub dark)
 *   trickwork-banner-logo.svg/.png  1600x500, light, logo only             (support thread)
 *   social-preview.png              1280x640, dark, logo, name and claim   (GitHub's link preview)
 *
 * The Unraid support thread wants a banner without any text, so the "-banner-logo"
 * variant is always generated alongside the README banners.
 *
 * One logo serves both themes: its teal shield reads on white and on near-black
 * alike. It is anchored by its ink, at most 400px either way, its left edge at
 * x=165 and its centre on the middle line, the layout of the other apps' banners.
 *
 * Text is converted to SVG paths (opentype.js) so the SVG needs no font and renders
 * the same in resvg and a browser. Bree Serif (name) and Lato (claim) are the brand
 * fonts the other apps' banners use.
 *
 * Deps (global): opentype.js, @resvg/resvg-js. Fonts are fetched to the OS temp dir.
 * Run: node .github/assets/gen-banner.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const require = createRequire(import.meta.url);
const groot = execSync("npm root -g").toString().trim();
const opentype = require(`${groot}/opentype.js`);
const { Resvg } = require(`${groot}/@resvg/resvg-js`);

const __dir = dirname(fileURLToPath(import.meta.url));

const NAME = "TrickWork";
const CLAIM = "Worth 1,000 words? We use way more.";
const INK = 400, LEFT = 165;
const nameSize = 132, claimSize = 44, gap = 70, lineGap = 8;

const LIGHT = { bg: "#ffffff", name: "#1f2328", claim: "#5a5d5e" };
const DARK = { bg: "#0d1117", name: "#e6edf3", claim: "#9aa4ad" };

async function loadFont(file, url) {
  const path = join(tmpdir(), file);
  if (!existsSync(path)) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`font fetch ${res.status}: ${url}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
  }
  return opentype.parse(readFileSync(path));
}
const font = await loadFont("TrickWork-BreeSerif-Regular.ttf", "https://github.com/google/fonts/raw/main/ofl/breeserif/BreeSerif-Regular.ttf");
const claimFont = await loadFont("TrickWork-Lato-Regular.ttf", "https://github.com/google/fonts/raw/main/ofl/lato/Lato-Regular.ttf");

const master = readFileSync(join(__dir, "logo.svg"), "utf8").replace(/<\?xml[^>]*\?>\s*/, "");
const vb = master.match(/viewBox="([^"]+)"/)[1];
const [vbX, vbY, vbW, vbH] = vb.split(/[\s,]+/).map(Number);
// Anchored by ink rather than by the box, so a mark inset in its viewBox still
// lands on the line. innerBBox is in the master's own units.
const ink = new Resvg(master).innerBBox();
if (!ink) throw new Error("no ink in logo.svg");
const scale = INK / Math.max(ink.width, ink.height);
const inkW = ink.width * scale;

// The logo with its ink's left edge at x and its ink centred on cy.
function logoAt(x, cy) {
  const lx = x - (ink.x - vbX) * scale;
  const ly = cy - (ink.y - vbY + ink.height / 2) * scale;
  return master.replace(
    /<svg\b[^>]*>/,
    `<svg x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" width="${(vbW * scale).toFixed(2)}" height="${(vbH * scale).toFixed(2)}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">`,
  );
}

const nameW = font.getAdvanceWidth(NAME, nameSize);
const claimW = claimFont.getAdvanceWidth(CLAIM, claimSize);
const nameAsc = font.ascender * (nameSize / font.unitsPerEm);
const nameDesc = -font.descender * (nameSize / font.unitsPerEm);
const claimAsc = claimFont.ascender * (claimSize / claimFont.unitsPerEm);
const blockH = nameAsc + nameDesc + lineGap + claimAsc;

// Logo, name and claim on a w by h ground, the logo's left edge at left.
function full(w, h, left, t) {
  const textX = left + inkW + gap;
  const nameBaseline = h / 2 - blockH / 2 + nameAsc;
  const claimBaseline = nameBaseline + nameDesc + lineGap + claimAsc;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${t.bg}"/>
  ${logoAt(left, h / 2)}
  <path d="${font.getPath(NAME, textX, nameBaseline, nameSize).toPathData(2)}" fill="${t.name}"/>
  <path d="${claimFont.getPath(CLAIM, textX, claimBaseline, claimSize).toPathData(2)}" fill="${t.claim}"/>
</svg>
`;
}

function emit(name, svg, bg, width, keepSvg = true) {
  if (keepSvg) writeFileSync(join(__dir, `${name}.svg`), svg);
  writeFileSync(join(__dir, `${name}.png`), new Resvg(svg, { background: bg, fitTo: { mode: "width", value: width } }).render().asPng());
  console.log(`wrote ${name}${keepSvg ? ".svg + " : ""}.png`);
}

emit("trickwork-banner", full(1600, 500, LEFT, LIGHT), LIGHT.bg, 1600);
emit("trickwork-banner-dark", full(1600, 500, LEFT, DARK), DARK.bg, 1600);

const logoOnly = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="500" viewBox="0 0 1600 500">
  <rect width="1600" height="500" fill="${LIGHT.bg}"/>
  ${logoAt((1600 - inkW) / 2, 250)}
</svg>
`;
emit("trickwork-banner-logo", logoOnly, LIGHT.bg, 1600);

// The link preview centres the whole group, since it has no column to line up with.
const groupW = inkW + gap + Math.max(nameW, claimW);
emit("social-preview", full(1280, 640, (1280 - groupW) / 2, DARK), DARK.bg, 1280, false);
