/**
 * Generates the TrickWork banners (1600x500):
 *
 *   trickwork-banner.svg/.png       light, logo, name and claim   (README, light)
 *   trickwork-banner-dark.svg/.png  dark, logo, name and claim    (README, GitHub dark)
 *   trickwork-banner-logo.svg/.png  light, logo only              (support thread)
 *
 * The Unraid support thread wants a banner without any text, so the "-banner-logo"
 * variant is always generated alongside the README banners.
 *
 * One logo file serves both themes. Unlike the ring logos of the other repos, whose
 * ring has to match the surface, this one is a self-contained teal graphic that
 * reads on white and on near-black alike.
 *
 * Text is converted to SVG paths (opentype.js) so the SVG needs no font and renders
 * the same in resvg and a browser. Bree Serif (name) and Lato (claim) are the brand
 * fonts shared with BombVault, featherdrop and ShipLog; the app itself uses the
 * system font stack, but the banner is a marketing surface.
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
const W = 1600, H = 500;
const LOGO_FILE = "logo.svg";
// The logo is a wide ribbon, not a square coin, so it gets a height in
// proportion to the text block instead of the house 400x400 square, and its
// width follows the real aspect ratio.
const LOGO_VB_W = 223.97, LOGO_VB_H = 76.87;
const LH = 210, LW = LH * (LOGO_VB_W / LOGO_VB_H);
// House banner standard: name 132, claim 44, logo-to-text gap 70, name-to-claim gap 8.
const nameSize = 132, claimSize = 44, gap = 70, lineGap = 8;

const THEMES = [
  { suffix: "", bg: "#ffffff", name: "#1f2328", claim: "#5a5d5e" },
  { suffix: "-dark", bg: "#0d1117", name: "#e6edf3", claim: "#9aa4ad" },
];

const fontPath = join(tmpdir(), "TrickWork-BreeSerif-Regular.ttf");
if (!existsSync(fontPath)) {
  const url = "https://github.com/google/fonts/raw/main/ofl/breeserif/BreeSerif-Regular.ttf";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`font fetch ${res.status}`);
  writeFileSync(fontPath, Buffer.from(await res.arrayBuffer()));
}
const font = opentype.parse(readFileSync(fontPath));

const claimFontPath = join(tmpdir(), "TrickWork-Lato-Regular.ttf");
if (!existsSync(claimFontPath)) {
  const r = await fetch("https://github.com/google/fonts/raw/main/ofl/lato/Lato-Regular.ttf");
  if (!r.ok) throw new Error(`claim font fetch ${r.status}`);
  writeFileSync(claimFontPath, Buffer.from(await r.arrayBuffer()));
}
const claimFont = opentype.parse(readFileSync(claimFontPath));

// Logo, name and claim are centred horizontally as one group.
const nameW = font.getAdvanceWidth(NAME, nameSize);
const claimW = claimFont.getAdvanceWidth(CLAIM, claimSize);
const groupW = LW + gap + Math.max(nameW, claimW);
const startX = Math.max(60, (W - groupW) / 2);
const LX = startX, LY = (H - LH) / 2;
const textX = startX + LW + gap;

const sc = (s) => s / font.unitsPerEm;
const nameAsc = font.ascender * sc(nameSize);
const nameDesc = -font.descender * sc(nameSize);
const claimAsc = claimFont.ascender * (claimSize / claimFont.unitsPerEm);
const blockH = nameAsc + nameDesc + lineGap + claimAsc;
const nameBaseline = H / 2 - blockH / 2 + nameAsc;
const claimBaseline = nameBaseline + nameDesc + lineGap + claimAsc;

const namePath = font.getPath(NAME, textX, nameBaseline, nameSize).toPathData(2);
const claimPath = claimFont.getPath(CLAIM, textX, claimBaseline, claimSize).toPathData(2);

// Embeds the logo at (x, y, w, h), keeping the file's own viewBox.
function embedLogo(logoFile, x, y, w, h) {
  const raw = readFileSync(join(__dir, logoFile), "utf8").replace(/<\?xml[^>]*\?>\s*/, "");
  const vb = (raw.match(/viewBox="([^"]+)"/) || [, `0 0 ${LOGO_VB_W} ${LOGO_VB_H}`])[1];
  return raw.replace(
    /<svg\b[^>]*>/,
    `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">`,
  );
}

function emit(name, svg, bg) {
  writeFileSync(join(__dir, `${name}.svg`), svg);
  const png = new Resvg(svg, { background: bg, fitTo: { mode: "width", value: W } }).render().asPng();
  writeFileSync(join(__dir, `${name}.png`), png);
  console.log(`wrote ${name}.svg + .png`);
}

for (const t of THEMES) {
  const full = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  ${embedLogo(LOGO_FILE, LX, LY, LW, LH)}
  <path d="${namePath}" fill="${t.name}"/>
  <path d="${claimPath}" fill="${t.claim}"/>
</svg>
`;
  emit(`trickwork-banner${t.suffix}`, full, t.bg);
}

// Support-thread banner: logo only.
const logoLX = (W - LW) / 2, logoLY = (H - LH) / 2;
const lt = THEMES[0];
const logoOnly = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${lt.bg}"/>
  ${embedLogo(LOGO_FILE, logoLX, logoLY, LW, LH)}
</svg>
`;
emit("trickwork-banner-logo", logoOnly, lt.bg);
