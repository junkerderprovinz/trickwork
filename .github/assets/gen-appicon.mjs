// Composes the desktop app icon (a plain square tile - the OS applies its
// own corner mask, so this stays unrounded): the ribbon logo centred on the
// app's own dark ground colour (GlimStone's --carbon-bg, #161616), scaled to
// leave comfortable padding. Wails reads desktop/build/appicon.png (1024x1024)
// and generates the platform .ico/.icns from it at build time - that file is
// the one exception carved out of desktop/build/'s own .gitignore rule (a
// real repo asset, not a build output; see the .gitignore comment).
// Run: node .github/assets/gen-appicon.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { execSync } from "node:child_process";

const require = createRequire(import.meta.url);
const groot = execSync("npm root -g").toString().trim();
const { Resvg } = require(`${groot}/@resvg/resvg-js`);

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dir, "../..");
const LOGO = readFileSync(join(REPO, ".github/assets/logo.svg"), "utf8").replace(/<\?xml[^>]*\?>\s*/, "");
const VB_W = 223.97, VB_H = 76.87;

const SIZE = 1024;
const BG = "#161616";
const PAD = 0.07; // fraction of SIZE reserved as margin on each side
const availW = SIZE * (1 - PAD * 2);
const availH = SIZE * (1 - PAD * 2);
// Fit the wide ribbon inside the available box, preserving aspect ratio.
const scale = Math.min(availW / VB_W, availH / VB_H);
const logoW = VB_W * scale, logoH = VB_H * scale;
const x = (SIZE - logoW) / 2, y = (SIZE - logoH) / 2;

const embedded = LOGO.replace(
  /<svg\b[^>]*>/,
  `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${logoW.toFixed(1)}" height="${logoH.toFixed(1)}" viewBox="0 0 ${VB_W} ${VB_H}" xmlns="http://www.w3.org/2000/svg">`,
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>
  ${embedded}
</svg>
`;

const outSvg = join(REPO, ".github/assets/trickwork-appicon.svg");
writeFileSync(outSvg, svg);
const png = new Resvg(svg, { background: BG, fitTo: { mode: "width", value: SIZE } }).render().asPng();
writeFileSync(join(REPO, "desktop/build/appicon.png"), png);
writeFileSync(join(REPO, ".github/assets/trickwork-appicon.png"), png);
console.log("wrote appicon.png (" + png.length + " bytes) + trickwork-appicon.svg/.png");
