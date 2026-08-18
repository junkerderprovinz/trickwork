# ASCII SuperGenerator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single TypeScript/Canvas ASCII-art conversion engine and UI (feature parity with the abandoned ASCGen2 — proportional/variable-width font-aware character mapping, real-time interactive preview, TXT/XHTML/RTF/PNG export), packaged twice with zero logic duplication: a Wails-wrapped portable desktop app (Windows/Linux/macOS) and a thin Go static-file-server Docker container with an Unraid CA template.

**Architecture:** "Ansatz B" from the design spec — `core/` (pure TS conversion engine) + `ui/` (the interactive web app) are built once as a static SPA bundle. `desktop/` (Go + Wails v2) and `container/` (Go + `net/http`) each embed that same built bundle via `go:embed` and add nothing but chrome (native save dialogs / plain static serving). No conversion logic exists in Go anywhere.

**Tech Stack:** TypeScript (strict) + Vite for `core/`+`ui/`, no frontend framework (vanilla TS + Canvas — matches `core/`'s framework-free requirement and keeps the bundle small enough to embed twice); Vitest for unit tests; Playwright for E2E; Go 1.26 (`toolchain go1.26.6`) + Wails v2.13.0 for `desktop/`; Go 1.26 (`toolchain go1.26.6`) + stdlib `net/http` for `container/`; GlimStone v1.0.0 design tokens (copy-paste adoption) for the UI's look.

## Global Constraints

- TypeScript `strict: true` in every `tsconfig.json` (core, ui). No `any` in `core/` — it is the tested, pure-function differentiator.
- `core/` stays framework-free and DOM-free wherever the underlying operation is pure: every Canvas/DOM dependency (glyph measurement, image decode, grid-to-canvas render) is injected as a parameter, never imported/reached-for globally, so it can run under Vitest/Node without a real browser (spec §4, §7).
- v1 export formats: TXT, XHTML, RTF, PNG — exactly these four, no more (spec §4). RTF is always monospace regardless of the on-screen font, and the UI must say so (spec §6) — not treated as a bug.
- v1 non-goals, do not build: video/webcam capture, server-side persistence/accounts/multi-user, cloud/SaaS hosting (spec §2).
- Font set decision (resolves spec §8 open question): v1 ships **4 font choices via CSS font stacks, no bundled font files** — `Monospace (system)` (`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`), `Monospace (alt)` (`Consolas, "Courier New", monospace`), `Serif (proportional)` (`ui-serif, Georgia, "Times New Roman", serif`), `Sans (proportional)` (`ui-sans-serif, system-ui, "Segoe UI", sans-serif`). This sidesteps font licensing entirely ([[no-commercial-assets-in-public-repos]]) while still delivering the proportional-width differentiator, since the serif/sans stacks resolve to genuinely proportional system fonts.
- Character set presets (also resolves part of spec §8): `Standard` = `" .:-=+*#%@"`, `Detailed` = `" .'\`^\",:;Il!i><~+_-?][}{1)(|\\\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"`, `Blocks` = `" ░▒▓█"`, `Custom` = user-entered string (darkest-to-lightest order is the user's own responsibility for Custom).
- Go module + toolchain pin for the root `go.mod` and `desktop/go.mod`: `go 1.26` / `toolchain go1.26.6` (matches every other repo's post-CVE-audit pin this session).
- Wails pin for `desktop/go.mod`: `github.com/wailsapp/wails/v2 v2.13.0` (matches KnightLoader's current pin — v2, not v3).
- `//go:embed` directives cannot reference paths outside their own file's directory (no `..` path elements — a hard Go compiler restriction). This is why the built `ui/dist` bundle is embedded exactly ONCE, by a `webembed/` package that is part of the repo's ROOT Go module, rather than separately by `desktop/` and `container/` — mirroring KnightLoader's real precedent (its `web/embed.go` is the sole embed, reused by both the server and `desktop/main.go`).
- Container final stage: `gcr.io/distroless/static-debian12:latest@sha256:a9fcaedd4c9b59e12dd65d954f0b5044f19b0647a8a3712e77205df9e7b102cd` (digest-pinned, matches featherdrop/shiplog).
- House boot-READY banner convention: container prints a line containing the exact substring `ASCII SUPERGENERATOR IS READY` (green ANSI, `✓` prefix) on successful startup — this is what a future CI boot-smoke gate or house tooling greps for ([[ready-log-banner-standard]]).
- GlimStone v1.0.0 design tokens (`reference/tokens.css`, `reference/appearance.ts`) are copy-paste-adopted into `ui/` per the standard adoption model (no package, no build step) — [[GlimStone]]. The UI must display its own version next to the adopted GlimStone version somewhere visible (matches the convention already live in KnightLoader/CannonadeCommand/ShipLog).
- Working title "ASCII SuperGenerator" is used verbatim in every config/package name/window title in this plan (repo slug: `ascii-supergenerator`, npm scope-less package names `ascii-supergenerator-core`/`ascii-supergenerator-ui`, Go module `github.com/junkerderprovinz/ascii-supergenerator`). A later naming pass will do a single find-and-replace pass across the repo — not this plan's concern.
- No AI attribution in any commit message. English code/comments/commit messages throughout (this is a public repo).
- LF line endings everywhere (`.gitattributes` `* text=auto eol=lf`, matching every sibling repo).
- License: AGPL-3.0, copied verbatim from an existing sibling repo (e.g. `d:\nextcloud\it\github\shiplog\LICENSE`) — [[repos-agpl-license-and-name-reservation]].

---

## File Structure

```
ascii-supergenerator/
├── package.json                  # npm workspaces root (core, ui)
├── tsconfig.base.json            # shared strict TS config, extended by core/ui
├── .gitignore
├── .gitattributes
├── LICENSE                       # AGPL-3.0, copied verbatim from a sibling repo
├── README.md
├── core/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── types.ts                    # CharCell, Grid, FontSpec, FontWidthTable, GlyphMetrics, MappingOptions
│       ├── charsets.ts                 # Standard/Detailed/Blocks presets
│       ├── glyphMeasure.ts             # real browser GlyphMeasurer (Canvas-based)
│       ├── glyphMeasure.test.ts
│       ├── fontWidthTable.ts           # buildFontWidthTable(chars, font, measure)
│       ├── fontWidthTable.test.ts
│       ├── downscale.ts                # computeDownscaleDimensions (pure math)
│       ├── downscale.test.ts
│       ├── ingest.ts                   # decodeImage / downscaleImageIfNeeded (browser Canvas glue)
│       ├── mapping.ts                  # computeBlockLuminance, mapLuminanceToChar
│       ├── mapping.test.ts
│       ├── grid.ts                     # assembleGrid
│       ├── grid.test.ts
│       ├── renderGridToCanvas.ts       # shared by ui/ live preview AND toImage
│       ├── renderGridToCanvas.test.ts
│       ├── export/
│       │   ├── toText.ts
│       │   ├── toText.test.ts
│       │   ├── toXHTML.ts
│       │   ├── toXHTML.test.ts
│       │   ├── toRTF.ts
│       │   ├── toRTF.test.ts
│       │   ├── toImage.ts
│       │   └── toImage.test.ts
│       └── index.ts                    # public API barrel
├── ui/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── postcss.config.js
│   ├── public/
│   ├── e2e/
│   │   ├── playwright.config.ts
│   │   └── convert.spec.ts
│   │   └── fixtures/small.png
│   └── src/
│       ├── main.ts
│       ├── style.css                   # imports design/tokens.css, app-specific rules
│       ├── design/
│       │   ├── tokens.css              # copied verbatim from glimstone/reference/tokens.css
│       │   └── appearance.ts           # copied verbatim from glimstone/reference/appearance.ts
│       ├── state.ts                    # BatchItem, AppState, store
│       ├── dropzone.ts
│       ├── preview.ts
│       ├── controls.ts
│       ├── queue.ts
│       ├── exportPanel.ts
│       └── version.ts                  # APP_VERSION + GLIMSTONE_VERSION display
├── go.mod                         # root module: github.com/junkerderprovinz/ascii-supergenerator
├── go.sum
├── webembed/
│   ├── embed.go                   # //go:embed all:dist, strips the "dist/" prefix via fs.Sub
│   └── dist/                      # gitignored - populated by copying ui/dist here at build time
├── desktop/
│   ├── go.mod                     # separate nested module, `replace .../ascii-supergenerator => ../`
│   ├── go.sum
│   ├── wails.json
│   ├── main.go
│   ├── savedialog.go
│   └── README.md
├── container/
│   ├── main.go                    # part of the ROOT module, imports webembed
│   ├── Dockerfile
│   └── README.md
├── .github/
│   └── workflows/
│       ├── ci.yml                      # core+ui unit tests, typecheck, lint
│       ├── container.yml               # container build + boot-smoke + push
│       └── desktop.yml                 # 3-platform Wails build, release-gated
└── docs/
    └── superpowers/
        ├── specs/2026-08-18-ascii-supergenerator-design.md
        └── plans/2026-08-18-ascii-supergenerator.md   # this file
```

---

### Task 1: Repo scaffold and shared tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `.gitattributes`
- Create: `LICENSE`
- Create: `README.md`

**Interfaces:**
- Produces: an npm workspace root that `core/` and `ui/` join via their own `package.json` `"name"` fields; `tsconfig.base.json` is `extends`-ed by both.

- [ ] **Step 1: Create the workspace root `package.json`**

```json
{
  "name": "ascii-supergenerator",
  "private": true,
  "version": "0.1.0",
  "workspaces": [
    "core",
    "ui"
  ],
  "scripts": {
    "build": "npm run build --workspace core && npm run build --workspace ui",
    "test": "npm run test --workspace core",
    "typecheck": "npm run typecheck --workspace core && npm run typecheck --workspace ui",
    "e2e": "npm run e2e --workspace ui"
  }
}
```

- [ ] **Step 2: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
dist/
build/
*.log
.DS_Store
desktop/build/
webembed/dist/
```

- [ ] **Step 4: Create `.gitattributes`**

```
* text=auto eol=lf
*.png binary
*.woff2 binary
```

- [ ] **Step 5: Copy the AGPL-3.0 license text verbatim**

Run: `cp /d/nextcloud/it/github/shiplog/LICENSE /d/nextcloud/it/github/ascii-supergenerator/LICENSE`
Expected: byte-identical AGPL-3.0 full text, no repo-specific placeholders inside it (the AGPL text itself never names the licensee).

- [ ] **Step 6: Write a minimal `README.md` stub**

```markdown
# ASCII SuperGenerator (working title)

Turns images into proportional-font-aware ASCII art, with a live interactive
preview and TXT / XHTML / RTF / PNG export — the ASCGen2 feature set, rebuilt.

Ships two ways from one shared TypeScript/Canvas core: a portable desktop app
(Windows/Linux/macOS, via Wails) and a self-hosted Docker container (with an
Unraid Community Applications template).

> Working title. Final name pending — see `docs/superpowers/specs/2026-08-18-ascii-supergenerator-design.md` §8.

## Status

Pre-release, under active implementation. Not yet installable.
```

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.base.json .gitignore .gitattributes LICENSE README.md
git commit -m "chore: scaffold workspace root, tooling config, and license"
```

---

### Task 2: `core/` package scaffold and shared types

**Files:**
- Create: `core/package.json`
- Create: `core/tsconfig.json`
- Create: `core/vitest.config.ts`
- Create: `core/src/types.ts`
- Create: `core/src/charsets.ts`

**Interfaces:**
- Produces: `Grid`, `CharCell`, `FontSpec`, `GlyphMetrics`, `FontWidthTable`, `MappingOptions` types consumed by every later `core/` task. `CHARSET_PRESETS` consumed by `ui/` controls (Task 12) and usable as defaults in `core/` tests.

- [ ] **Step 1: Create `core/package.json`**

```json
{
  "name": "ascii-supergenerator-core",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create `core/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true,
    "lib": ["ES2022", "DOM"]
  },
  "include": ["src"]
}
```

`"DOM"` is included in `lib` only so the type-checker knows about `CanvasRenderingContext2D`/`ImageData`/`OffscreenCanvas` — `core/` never imports `document`/`window` directly, only accepts these types as injected parameters (Global Constraints).

- [ ] **Step 3: Create `core/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```

`environment: 'node'` is deliberate — every `core/` test must pass without a browser or jsdom, proving the pure-function design actually holds (Global Constraints, spec §7).

- [ ] **Step 4: Create `core/src/types.ts`**

```ts
export interface FontSpec {
  /** CSS font-family stack, e.g. "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" */
  family: string
  /** Font size in CSS pixels used for measurement and rendering. */
  sizePx: number
}

export interface GlyphMetrics {
  char: string
  /** Fraction of the glyph's em-box covered by "ink" (0 = fully blank, 1 = fully covered). */
  inkCoverage: number
}

/** Glyph metrics for a character set at a specific font, sorted ascending by inkCoverage. */
export interface FontWidthTable {
  font: FontSpec
  entries: GlyphMetrics[]
}

/** Measures one glyph's ink coverage at the given font. Injected so core/ stays DOM-free. */
export type GlyphMeasurer = (char: string, font: FontSpec) => GlyphMetrics

export interface CharCell {
  char: string
  font: FontSpec
}

export type Grid = CharCell[][]

export interface MappingOptions {
  columns: number
  brightness: number // -1..1, additive
  contrast: number // -1..1, multiplicative around 0.5 midpoint
  charset: string[] // darkest-to-lightest is NOT required; buildFontWidthTable re-sorts by measured coverage
  font: FontSpec
}
```

- [ ] **Step 5: Create `core/src/charsets.ts`**

```ts
export const CHARSET_PRESETS = {
  standard: ' .:-=+*#%@'.split(''),
  detailed:
    ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'.split(
      '',
    ),
  blocks: ' ░▒▓█'.split(''),
} as const

export type CharsetPresetKey = keyof typeof CHARSET_PRESETS
```

- [ ] **Step 6: Verify it compiles**

Run: `npm install && npm run typecheck --workspace core`
Expected: exits 0, no errors (there is no logic yet to test, only types — `vitest run` would correctly report "no test files found", so this task's verification is typecheck, not vitest).

- [ ] **Step 7: Commit**

```bash
git add core/package.json core/tsconfig.json core/vitest.config.ts core/src/types.ts core/src/charsets.ts
git commit -m "feat(core): scaffold core package with shared types and charset presets"
```

---

### Task 3: Glyph measurement (the ink-coverage differentiator)

**Files:**
- Create: `core/src/glyphMeasure.ts`
- Test: `core/src/glyphMeasure.test.ts`

**Interfaces:**
- Consumes: `FontSpec`, `GlyphMetrics`, `GlyphMeasurer` from `core/src/types.ts` (Task 2).
- Produces: `createCanvasGlyphMeasurer(): GlyphMeasurer` — the real, browser-based measurer that `ui/` and `desktop/`'s embedded webview construct once per session and pass into `buildFontWidthTable` (Task 4).

This is the actual ASCGen2 differentiator: not just advance-width from `measureText`, but rendered visual "ink" density, read back via pixel sampling. `measureText` alone cannot tell you how much of a glyph's box is filled — a lowercase `i` and an uppercase `M` can have similar advance width in a proportional font but wildly different ink coverage.

- [ ] **Step 1: Write the failing test**

```ts
// core/src/glyphMeasure.test.ts
import { describe, expect, it } from 'vitest'
import { createCanvasGlyphMeasurer } from './glyphMeasure'

function makeFakeCanvasFactory(coverageByChar: Record<string, number>) {
  // A fake 2D context that reports a deterministic "ink coverage" per char
  // by returning ImageData whose alpha-channel fill fraction matches the
  // requested coverage, so the measurer's pixel-counting logic is exercised
  // for real without needing an actual browser canvas.
  return (sizePx: number) => {
    const dim = sizePx * 2
    const ctx = {
      font: '',
      textBaseline: 'top' as CanvasTextBaseline,
      textAlign: 'left' as CanvasTextAlign,
      clearRect: () => {},
      fillText: (char: string) => {
        ctx.__lastChar = char
      },
      getImageData: (_x: number, _y: number, w: number, h: number) => {
        const coverage = coverageByChar[ctx.__lastChar ?? ''] ?? 0
        const total = w * h
        const filled = Math.round(total * coverage)
        const data = new Uint8ClampedArray(total * 4)
        for (let i = 0; i < filled; i++) {
          data[i * 4 + 3] = 255 // alpha channel = "ink"
        }
        return { data, width: w, height: h } as ImageData
      },
      __lastChar: undefined as string | undefined,
    }
    const canvas = { width: dim, height: dim, getContext: () => ctx }
    return canvas as unknown as HTMLCanvasElement
  }
}

describe('createCanvasGlyphMeasurer', () => {
  it('reports near-zero ink coverage for a blank glyph', () => {
    const measure = createCanvasGlyphMeasurer(
      makeFakeCanvasFactory({ ' ': 0 }),
    )
    const result = measure(' ', { family: 'monospace', sizePx: 16 })
    expect(result.char).toBe(' ')
    expect(result.inkCoverage).toBeCloseTo(0, 2)
  })

  it('reports high ink coverage for a dense glyph', () => {
    const measure = createCanvasGlyphMeasurer(
      makeFakeCanvasFactory({ '@': 0.9 }),
    )
    const result = measure('@', { family: 'monospace', sizePx: 16 })
    expect(result.inkCoverage).toBeCloseTo(0.9, 2)
  })

  it('orders coverage correctly between a sparse and a dense glyph', () => {
    const measure = createCanvasGlyphMeasurer(
      makeFakeCanvasFactory({ '.': 0.1, '#': 0.6 }),
    )
    const dot = measure('.', { family: 'monospace', sizePx: 16 })
    const hash = measure('#', { family: 'monospace', sizePx: 16 })
    expect(dot.inkCoverage).toBeLessThan(hash.inkCoverage)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- glyphMeasure`
Expected: FAIL with `Cannot find module './glyphMeasure'` (or similar — the module does not exist yet).

- [ ] **Step 3: Write the implementation**

```ts
// core/src/glyphMeasure.ts
import type { FontSpec, GlyphMeasurer, GlyphMetrics } from './types'

type CanvasFactory = (sizePx: number) => HTMLCanvasElement | OffscreenCanvas

/**
 * Creates a real, Canvas-backed GlyphMeasurer: renders each glyph to an
 * offscreen square canvas sized to 2x the font size (generous margin for
 * ascenders/descenders/overshoot), then counts the fraction of pixels with
 * non-zero alpha as the glyph's "ink coverage". This is what lets the
 * character mapping account for a glyph's rendered visual density instead
 * of assuming every character in a monospace grid looks equally "full".
 */
export function createCanvasGlyphMeasurer(
  canvasFactory: CanvasFactory = defaultCanvasFactory,
): GlyphMeasurer {
  return (char: string, font: FontSpec): GlyphMetrics => {
    const sizePx = font.sizePx
    const canvas = canvasFactory(sizePx)
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null
    if (!ctx) {
      throw new Error('createCanvasGlyphMeasurer: 2D context unavailable')
    }

    const dim = canvas.width
    ctx.clearRect(0, 0, dim, dim)
    ctx.font = `${sizePx}px ${font.family}`
    ctx.textBaseline = 'top'
    ctx.textAlign = 'left'
    ctx.fillText(char, dim * 0.25, dim * 0.25)

    const imageData = ctx.getImageData(0, 0, dim, dim)
    let filled = 0
    const pixelCount = imageData.width * imageData.height
    for (let i = 0; i < pixelCount; i++) {
      const alpha = imageData.data[i * 4 + 3]
      if (alpha !== undefined && alpha > 0) filled++
    }

    return { char, inkCoverage: pixelCount === 0 ? 0 : filled / pixelCount }
  }
}

function defaultCanvasFactory(sizePx: number): HTMLCanvasElement {
  const dim = sizePx * 2
  const canvas = document.createElement('canvas')
  canvas.width = dim
  canvas.height = dim
  return canvas
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- glyphMeasure`
Expected: PASS, all 3 assertions green.

- [ ] **Step 5: Commit**

```bash
git add core/src/glyphMeasure.ts core/src/glyphMeasure.test.ts
git commit -m "feat(core): add canvas-backed glyph ink-coverage measurer"
```

---

### Task 4: Font-width table construction

**Files:**
- Create: `core/src/fontWidthTable.ts`
- Test: `core/src/fontWidthTable.test.ts`

**Interfaces:**
- Consumes: `GlyphMeasurer`, `FontSpec`, `FontWidthTable`, `GlyphMetrics` (Task 2/3).
- Produces: `buildFontWidthTable(chars: string[], font: FontSpec, measure: GlyphMeasurer): FontWidthTable`, consumed by `mapping.ts` (Task 6) and `grid.ts` (Task 7).

- [ ] **Step 1: Write the failing test**

```ts
// core/src/fontWidthTable.test.ts
import { describe, expect, it } from 'vitest'
import { buildFontWidthTable } from './fontWidthTable'
import type { GlyphMeasurer } from './types'

const fakeMeasure: GlyphMeasurer = (char) => {
  const coverageByChar: Record<string, number> = {
    ' ': 0,
    '.': 0.1,
    '*': 0.4,
    '#': 0.6,
    '@': 0.9,
  }
  return { char, inkCoverage: coverageByChar[char] ?? 0 }
}

describe('buildFontWidthTable', () => {
  it('produces one entry per input character', () => {
    const table = buildFontWidthTable(
      [' ', '.', '*', '#', '@'],
      { family: 'monospace', sizePx: 16 },
      fakeMeasure,
    )
    expect(table.entries).toHaveLength(5)
  })

  it('sorts entries ascending by measured ink coverage, not input order', () => {
    const table = buildFontWidthTable(
      ['@', ' ', '#', '.', '*'],
      { family: 'monospace', sizePx: 16 },
      fakeMeasure,
    )
    expect(table.entries.map((e) => e.char)).toEqual([
      ' ',
      '.',
      '*',
      '#',
      '@',
    ])
  })

  it('carries the font spec through unchanged', () => {
    const font = { family: 'serif', sizePx: 20 }
    const table = buildFontWidthTable([' ', '@'], font, fakeMeasure)
    expect(table.font).toEqual(font)
  })

  it('deduplicates repeated input characters', () => {
    const table = buildFontWidthTable(
      ['.', '.', '@'],
      { family: 'monospace', sizePx: 16 },
      fakeMeasure,
    )
    expect(table.entries).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- fontWidthTable`
Expected: FAIL with `Cannot find module './fontWidthTable'`.

- [ ] **Step 3: Write the implementation**

```ts
// core/src/fontWidthTable.ts
import type { FontSpec, FontWidthTable, GlyphMeasurer } from './types'

export function buildFontWidthTable(
  chars: string[],
  font: FontSpec,
  measure: GlyphMeasurer,
): FontWidthTable {
  const unique = Array.from(new Set(chars))
  const entries = unique
    .map((char) => measure(char, font))
    .sort((a, b) => a.inkCoverage - b.inkCoverage)
  return { font, entries }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- fontWidthTable`
Expected: PASS, all 4 assertions green.

- [ ] **Step 5: Commit**

```bash
git add core/src/fontWidthTable.ts core/src/fontWidthTable.test.ts
git commit -m "feat(core): build sorted font-width tables from measured glyphs"
```

---

### Task 5: Downscale math

**Files:**
- Create: `core/src/downscale.ts`
- Test: `core/src/downscale.test.ts`

**Interfaces:**
- Produces: `computeDownscaleDimensions(width: number, height: number, maxDim: number): { width: number; height: number; scaled: boolean }`, consumed by `ingest.ts` (Task 6).

- [ ] **Step 1: Write the failing test**

```ts
// core/src/downscale.test.ts
import { describe, expect, it } from 'vitest'
import { computeDownscaleDimensions } from './downscale'

describe('computeDownscaleDimensions', () => {
  it('leaves an image untouched when already within bounds', () => {
    const result = computeDownscaleDimensions(800, 600, 1200)
    expect(result).toEqual({ width: 800, height: 600, scaled: false })
  })

  it('leaves an image untouched when exactly at the boundary', () => {
    const result = computeDownscaleDimensions(1200, 900, 1200)
    expect(result.scaled).toBe(false)
  })

  it('scales a landscape image down, preserving aspect ratio', () => {
    const result = computeDownscaleDimensions(4000, 2000, 1000)
    expect(result).toEqual({ width: 1000, height: 500, scaled: true })
  })

  it('scales a portrait image down using the taller dimension', () => {
    const result = computeDownscaleDimensions(1000, 4000, 800)
    expect(result).toEqual({ width: 200, height: 800, scaled: true })
  })

  it('rounds fractional results to whole pixels', () => {
    const result = computeDownscaleDimensions(4001, 3001, 1000)
    expect(Number.isInteger(result.width)).toBe(true)
    expect(Number.isInteger(result.height)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- downscale`
Expected: FAIL with `Cannot find module './downscale'`.

- [ ] **Step 3: Write the implementation**

```ts
// core/src/downscale.ts
export interface DownscaleResult {
  width: number
  height: number
  scaled: boolean
}

export function computeDownscaleDimensions(
  width: number,
  height: number,
  maxDim: number,
): DownscaleResult {
  const largest = Math.max(width, height)
  if (largest <= maxDim) {
    return { width, height, scaled: false }
  }
  const ratio = maxDim / largest
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
    scaled: true,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- downscale`
Expected: PASS, all 5 assertions green.

- [ ] **Step 5: Commit**

```bash
git add core/src/downscale.ts core/src/downscale.test.ts
git commit -m "feat(core): add pure downscale-dimension math"
```

---

### Task 6: Image ingestion (browser glue)

**Files:**
- Create: `core/src/ingest.ts`

**Interfaces:**
- Consumes: `computeDownscaleDimensions` (Task 5).
- Produces: `decodeAndPrepareImage(source: Blob, maxDim: number): Promise<{ imageData: ImageData; wasDownscaled: boolean }>`, consumed by `ui/src/state.ts` (Task 12).

This file is intentionally thin and untested-in-isolation: it is the one place `core/` legitimately touches the browser's Canvas/`createImageBitmap` APIs directly (spec §4 "Image ingestion"), because there is no pure logic left here once `computeDownscaleDimensions` is factored out — it is pure browser-API sequencing. It is exercised indirectly by the Playwright E2E test (Task 17), which is the right level for browser-API glue per the spec's own testing strategy (spec §7: Vitest for pure logic, Playwright for the real browser path).

- [ ] **Step 1: Write the implementation**

```ts
// core/src/ingest.ts
import { computeDownscaleDimensions } from './downscale'

export interface IngestResult {
  imageData: ImageData
  wasDownscaled: boolean
}

const MAX_WORKING_DIMENSION = 1600

export async function decodeAndPrepareImage(
  source: Blob,
  maxDim: number = MAX_WORKING_DIMENSION,
): Promise<IngestResult> {
  const bitmap = await createImageBitmap(source)
  const { width, height, scaled } = computeDownscaleDimensions(
    bitmap.width,
    bitmap.height,
    maxDim,
  )

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('decodeAndPrepareImage: 2D context unavailable')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return { imageData: ctx.getImageData(0, 0, width, height), wasDownscaled: scaled }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck --workspace core`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add core/src/ingest.ts
git commit -m "feat(core): add browser image decode+downscale glue"
```

---

### Task 7: Block-to-character mapping

**Files:**
- Create: `core/src/mapping.ts`
- Test: `core/src/mapping.test.ts`

**Interfaces:**
- Consumes: `FontWidthTable`, `CharCell` (Task 2), output shape of `decodeAndPrepareImage` (Task 6, `ImageData`).
- Produces: `computeBlockLuminance(imageData: ImageData, x: number, y: number, blockW: number, blockH: number): number` and `mapLuminanceToChar(luminance: number, table: FontWidthTable): string`, both consumed by `grid.ts` (Task 8).

- [ ] **Step 1: Write the failing test**

```ts
// core/src/mapping.test.ts
import { describe, expect, it } from 'vitest'
import { computeBlockLuminance, mapLuminanceToChar } from './mapping'
import type { FontWidthTable } from './types'

function makeImageData(pixels: number[][]): ImageData {
  const height = pixels.length
  const width = pixels[0]?.length ?? 0
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gray = pixels[y]?.[x] ?? 0
      const i = (y * width + x) * 4
      data[i] = gray
      data[i + 1] = gray
      data[i + 2] = gray
      data[i + 3] = 255
    }
  }
  return { data, width, height, colorSpace: 'srgb' } as ImageData
}

describe('computeBlockLuminance', () => {
  it('returns 0 for an all-black block', () => {
    const img = makeImageData([
      [0, 0],
      [0, 0],
    ])
    expect(computeBlockLuminance(img, 0, 0, 2, 2)).toBeCloseTo(0, 2)
  })

  it('returns 1 for an all-white block', () => {
    const img = makeImageData([
      [255, 255],
      [255, 255],
    ])
    expect(computeBlockLuminance(img, 0, 0, 2, 2)).toBeCloseTo(1, 2)
  })

  it('averages a mixed block to mid-gray', () => {
    const img = makeImageData([
      [0, 255],
      [255, 0],
    ])
    expect(computeBlockLuminance(img, 0, 0, 2, 2)).toBeCloseTo(0.5, 2)
  })

  it('reads only the requested sub-region, not the whole image', () => {
    const img = makeImageData([
      [0, 0, 255, 255],
      [0, 0, 255, 255],
    ])
    expect(computeBlockLuminance(img, 2, 0, 2, 2)).toBeCloseTo(1, 2)
    expect(computeBlockLuminance(img, 0, 0, 2, 2)).toBeCloseTo(0, 2)
  })
})

describe('mapLuminanceToChar', () => {
  const table: FontWidthTable = {
    font: { family: 'monospace', sizePx: 16 },
    entries: [
      { char: '@', inkCoverage: 0.9 }, // darkest ink = should map to darkest luminance
      { char: '#', inkCoverage: 0.6 },
      { char: '*', inkCoverage: 0.4 },
      { char: '.', inkCoverage: 0.1 },
      { char: ' ', inkCoverage: 0 }, // no ink = should map to brightest luminance
    ],
  }

  it('maps low luminance (dark source pixel) to the highest-ink-coverage glyph', () => {
    expect(mapLuminanceToChar(0, table)).toBe('@')
  })

  it('maps high luminance (bright source pixel) to the lowest-ink-coverage glyph', () => {
    expect(mapLuminanceToChar(1, table)).toBe(' ')
  })

  it('maps mid luminance to a mid-coverage glyph', () => {
    // luminance 0.5 -> target ink coverage (1 - 0.5) = 0.5 -> nearest is '#' (0.6) or '*' (0.4), '#' is closer
    expect(mapLuminanceToChar(0.5, table)).toBe('#')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- mapping`
Expected: FAIL with `Cannot find module './mapping'`.

- [ ] **Step 3: Write the implementation**

```ts
// core/src/mapping.ts
import type { FontWidthTable } from './types'

export function computeBlockLuminance(
  imageData: ImageData,
  x: number,
  y: number,
  blockW: number,
  blockH: number,
): number {
  const { data, width, height } = imageData
  let sum = 0
  let count = 0
  const endX = Math.min(x + blockW, width)
  const endY = Math.min(y + blockH, height)
  for (let py = y; py < endY; py++) {
    for (let px = x; px < endX; px++) {
      const i = (py * width + px) * 4
      const r = data[i] ?? 0
      const g = data[i + 1] ?? 0
      const b = data[i + 2] ?? 0
      // Rec. 601 luma weights, matching standard grayscale conversion.
      sum += (0.299 * r + 0.587 * g + 0.114 * b) / 255
      count++
    }
  }
  return count === 0 ? 0 : sum / count
}

/**
 * Picks the glyph whose ink coverage best matches the block's darkness.
 * Luminance 0 (black) wants the highest-ink glyph; luminance 1 (white)
 * wants the lowest-ink glyph — so target coverage is (1 - luminance).
 */
export function mapLuminanceToChar(
  luminance: number,
  table: FontWidthTable,
): string {
  const targetCoverage = 1 - luminance
  let best = table.entries[0]
  if (!best) {
    throw new Error('mapLuminanceToChar: font width table has no entries')
  }
  let bestDistance = Math.abs(best.inkCoverage - targetCoverage)
  for (const entry of table.entries) {
    const distance = Math.abs(entry.inkCoverage - targetCoverage)
    if (distance < bestDistance) {
      best = entry
      bestDistance = distance
    }
  }
  return best.char
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- mapping`
Expected: PASS, all 7 assertions green.

- [ ] **Step 5: Commit**

```bash
git add core/src/mapping.ts core/src/mapping.test.ts
git commit -m "feat(core): map source luminance to the nearest ink-coverage glyph"
```

---

### Task 8: Grid assembly (including brightness/contrast)

**Files:**
- Create: `core/src/grid.ts`
- Test: `core/src/grid.test.ts`

**Interfaces:**
- Consumes: `computeBlockLuminance`, `mapLuminanceToChar` (Task 7), `FontWidthTable`, `MappingOptions`, `Grid`, `CharCell` (Task 2).
- Produces: `assembleGrid(imageData: ImageData, table: FontWidthTable, options: MappingOptions): Grid`, consumed by `renderGridToCanvas.ts` (Task 9), every `export/*` serializer (Tasks 10-13), and `ui/src/preview.ts` (Task 14).

- [ ] **Step 1: Write the failing test**

```ts
// core/src/grid.test.ts
import { describe, expect, it } from 'vitest'
import { assembleGrid } from './grid'
import type { FontWidthTable, MappingOptions } from './types'

function makeImageData(pixels: number[][]): ImageData {
  const height = pixels.length
  const width = pixels[0]?.length ?? 0
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gray = pixels[y]?.[x] ?? 0
      const i = (y * width + x) * 4
      data[i] = gray
      data[i + 1] = gray
      data[i + 2] = gray
      data[i + 3] = 255
    }
  }
  return { data, width, height, colorSpace: 'srgb' } as ImageData
}

const table: FontWidthTable = {
  font: { family: 'monospace', sizePx: 16 },
  entries: [
    { char: '@', inkCoverage: 1 },
    { char: ' ', inkCoverage: 0 },
  ],
}

describe('assembleGrid', () => {
  it('produces a grid with the requested column count, and a proportionally-scaled row count', () => {
    const img = makeImageData([
      [0, 0, 255, 255],
      [0, 0, 255, 255],
    ])
    const options: MappingOptions = {
      columns: 2,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
    }
    const grid = assembleGrid(img, table, options)
    expect(grid).toHaveLength(1) // 4x2 image, 2 columns -> 2px-wide blocks -> 1 row
    expect(grid[0]).toHaveLength(2)
  })

  it('maps a dark block to the dark glyph and a bright block to the blank glyph', () => {
    const img = makeImageData([
      [0, 0, 255, 255],
      [0, 0, 255, 255],
    ])
    const options: MappingOptions = {
      columns: 2,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font: { family: 'monospace', sizePx: 16 },
    }
    const grid = assembleGrid(img, table, options)
    expect(grid[0]?.[0]?.char).toBe('@')
    expect(grid[0]?.[1]?.char).toBe(' ')
  })

  it('carries the requested font onto every cell', () => {
    const img = makeImageData([[0, 255]])
    const font = { family: 'serif', sizePx: 20 }
    const options: MappingOptions = {
      columns: 2,
      brightness: 0,
      contrast: 0,
      charset: ['@', ' '],
      font,
    }
    const grid = assembleGrid(img, table, options)
    expect(grid[0]?.[0]?.font).toEqual(font)
  })

  it('positive brightness pushes output toward the blank glyph', () => {
    const img = makeImageData([[0, 0]]) // fully black source
    const dim = { columns: 2, brightness: 0, contrast: 0, charset: ['@', ' '], font: { family: 'monospace', sizePx: 16 } }
    const bright: MappingOptions = { ...dim, brightness: 1 }
    const darkResult = assembleGrid(img, table, dim)
    const brightResult = assembleGrid(img, table, bright)
    expect(darkResult[0]?.[0]?.char).toBe('@')
    expect(brightResult[0]?.[0]?.char).toBe(' ')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- grid`
Expected: FAIL with `Cannot find module './grid'`.

- [ ] **Step 3: Write the implementation**

```ts
// core/src/grid.ts
import { computeBlockLuminance, mapLuminanceToChar } from './mapping'
import type { FontWidthTable, Grid, MappingOptions } from './types'

/**
 * Character cells are roughly twice as tall as they are wide on screen, so
 * sampling square pixel blocks would visibly stretch the output vertically.
 * This compensates by sampling taller blocks than the column width implies.
 */
const CELL_ASPECT_COMPENSATION = 2

export function assembleGrid(
  imageData: ImageData,
  table: FontWidthTable,
  options: MappingOptions,
): Grid {
  const { width, height } = imageData
  const columns = Math.max(1, options.columns)
  const blockW = width / columns
  const blockH = blockW * CELL_ASPECT_COMPENSATION
  const rows = Math.max(1, Math.round(height / blockH))

  const grid: Grid = []
  for (let row = 0; row < rows; row++) {
    const cells = []
    for (let col = 0; col < columns; col++) {
      const x = Math.floor(col * blockW)
      const y = Math.floor(row * blockH)
      const w = Math.max(1, Math.round(blockW))
      const h = Math.max(1, Math.round(blockH))
      const rawLuminance = computeBlockLuminance(imageData, x, y, w, h)
      const luminance = applyBrightnessContrast(
        rawLuminance,
        options.brightness,
        options.contrast,
      )
      const char = mapLuminanceToChar(luminance, table)
      cells.push({ char, font: options.font })
    }
    grid.push(cells)
  }
  return grid
}

function applyBrightnessContrast(
  luminance: number,
  brightness: number,
  contrast: number,
): number {
  const contrastFactor = 1 + contrast
  const contrasted = (luminance - 0.5) * contrastFactor + 0.5
  const adjusted = contrasted + brightness
  return Math.min(1, Math.max(0, adjusted))
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- grid`
Expected: PASS, all 4 assertions green.

- [ ] **Step 5: Commit**

```bash
git add core/src/grid.ts core/src/grid.test.ts
git commit -m "feat(core): assemble the character grid with brightness/contrast"
```

---

### Task 9: Shared canvas grid renderer

**Files:**
- Create: `core/src/renderGridToCanvas.ts`
- Test: `core/src/renderGridToCanvas.test.ts`

**Interfaces:**
- Consumes: `Grid`, `CharCell` (Task 2).
- Produces: `renderGridToCanvas(ctx: CanvasRenderingContext2D, grid: Grid, options: RenderOptions): { pixelWidth: number; pixelHeight: number }`, consumed by BOTH `ui/src/preview.ts` (Task 14, the live preview) and `export/toImage.ts` (Task 13) — a single implementation, per Global Constraints' anti-duplication requirement (the spec explicitly warns against re-implementing the same renderer twice).

- [ ] **Step 1: Write the failing test**

```ts
// core/src/renderGridToCanvas.test.ts
import { describe, expect, it, vi } from 'vitest'
import { renderGridToCanvas } from './renderGridToCanvas'
import type { Grid } from './types'

function makeFakeCtx() {
  const calls: { fillText: [string, number, number][] } = { fillText: [] }
  const ctx = {
    font: '',
    fillStyle: '',
    textBaseline: 'top' as CanvasTextBaseline,
    textAlign: 'left' as CanvasTextAlign,
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: (char: string, x: number, y: number) => {
      calls.fillText.push([char, x, y])
    },
    canvas: { width: 0, height: 0 },
  }
  return { ctx, calls }
}

describe('renderGridToCanvas', () => {
  it('draws exactly one fillText call per grid cell', () => {
    const { ctx, calls } = makeFakeCtx()
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 } },
        { char: 'B', font: { family: 'monospace', sizePx: 10 } },
      ],
      [
        { char: 'C', font: { family: 'monospace', sizePx: 10 } },
        { char: 'D', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    renderGridToCanvas(ctx as unknown as CanvasRenderingContext2D, grid, {
      cellWidthPx: 8,
      cellHeightPx: 16,
      background: '#000000',
      foreground: '#ffffff',
    })
    expect(calls.fillText).toHaveLength(4)
    expect(calls.fillText.map((c) => c[0])).toEqual(['A', 'B', 'C', 'D'])
  })

  it('reports the total pixel dimensions the grid occupies', () => {
    const { ctx } = makeFakeCtx()
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 } },
        { char: 'B', font: { family: 'monospace', sizePx: 10 } },
        { char: 'C', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    const result = renderGridToCanvas(
      ctx as unknown as CanvasRenderingContext2D,
      grid,
      { cellWidthPx: 10, cellHeightPx: 20, background: '#000', foreground: '#fff' },
    )
    expect(result).toEqual({ pixelWidth: 30, pixelHeight: 20 })
  })

  it('positions each cell at its column/row offset', () => {
    const { ctx, calls } = makeFakeCtx()
    const grid: Grid = [
      [
        { char: 'X', font: { family: 'monospace', sizePx: 10 } },
        { char: 'Y', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    renderGridToCanvas(ctx as unknown as CanvasRenderingContext2D, grid, {
      cellWidthPx: 12,
      cellHeightPx: 24,
      background: '#000',
      foreground: '#fff',
    })
    expect(calls.fillText[0]).toEqual(['X', 0, 0])
    expect(calls.fillText[1]).toEqual(['Y', 12, 0])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- renderGridToCanvas`
Expected: FAIL with `Cannot find module './renderGridToCanvas'`.

- [ ] **Step 3: Write the implementation**

```ts
// core/src/renderGridToCanvas.ts
import type { Grid } from './types'

export interface RenderOptions {
  cellWidthPx: number
  cellHeightPx: number
  background: string
  foreground: string
}

export interface RenderResult {
  pixelWidth: number
  pixelHeight: number
}

export function renderGridToCanvas(
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  options: RenderOptions,
): RenderResult {
  const rows = grid.length
  const columns = grid[0]?.length ?? 0
  const pixelWidth = columns * options.cellWidthPx
  const pixelHeight = rows * options.cellHeightPx

  ctx.fillStyle = options.background
  ctx.fillRect(0, 0, pixelWidth, pixelHeight)

  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillStyle = options.foreground

  for (let row = 0; row < rows; row++) {
    const cells = grid[row] ?? []
    for (let col = 0; col < cells.length; col++) {
      const cell = cells[col]
      if (!cell) continue
      ctx.font = `${cell.font.sizePx}px ${cell.font.family}`
      ctx.fillText(cell.char, col * options.cellWidthPx, row * options.cellHeightPx)
    }
  }

  return { pixelWidth, pixelHeight }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- renderGridToCanvas`
Expected: PASS, all 3 assertions green.

- [ ] **Step 5: Commit**

```bash
git add core/src/renderGridToCanvas.ts core/src/renderGridToCanvas.test.ts
git commit -m "feat(core): add the shared grid-to-canvas renderer (preview + PNG export)"
```

---

### Task 10: Export serializer — TXT

**Files:**
- Create: `core/src/export/toText.ts`
- Test: `core/src/export/toText.test.ts`

**Interfaces:**
- Consumes: `Grid` (Task 2).
- Produces: `toText(grid: Grid): string`, consumed by `ui/src/exportPanel.ts` (Task 16).

- [ ] **Step 1: Write the failing test**

```ts
// core/src/export/toText.test.ts
import { describe, expect, it } from 'vitest'
import { toText } from './toText'
import type { Grid } from '../types'

describe('toText', () => {
  it('joins cells in a row with no separator and rows with newlines', () => {
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 } },
        { char: 'B', font: { family: 'monospace', sizePx: 10 } },
      ],
      [
        { char: 'C', font: { family: 'monospace', sizePx: 10 } },
        { char: 'D', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    expect(toText(grid)).toBe('AB\nCD')
  })

  it('returns an empty string for an empty grid', () => {
    expect(toText([])).toBe('')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- toText`
Expected: FAIL with `Cannot find module './toText'`.

- [ ] **Step 3: Write the implementation**

```ts
// core/src/export/toText.ts
import type { Grid } from '../types'

export function toText(grid: Grid): string {
  return grid.map((row) => row.map((cell) => cell.char).join('')).join('\n')
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- toText`
Expected: PASS, both assertions green.

- [ ] **Step 5: Commit**

```bash
git add core/src/export/toText.ts core/src/export/toText.test.ts
git commit -m "feat(core): add plain-text export serializer"
```

---

### Task 11: Export serializer — XHTML

**Files:**
- Create: `core/src/export/toXHTML.ts`
- Test: `core/src/export/toXHTML.test.ts`

**Interfaces:**
- Consumes: `Grid` (Task 2).
- Produces: `toXHTML(grid: Grid, options: { background: string; foreground: string }): string`, consumed by `ui/src/exportPanel.ts` (Task 16).

- [ ] **Step 1: Write the failing test**

```ts
// core/src/export/toXHTML.test.ts
import { describe, expect, it } from 'vitest'
import { toXHTML } from './toXHTML'
import type { Grid } from '../types'

describe('toXHTML', () => {
  it('wraps escaped grid content in a styled <pre> inside a full XHTML document', () => {
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 } },
        { char: '<', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    const html = toXHTML(grid, { background: '#000000', foreground: '#ffffff' })
    expect(html).toContain('<?xml version="1.0" encoding="UTF-8"?>')
    expect(html).toContain('<pre')
    expect(html).toContain('background-color: #000000')
    expect(html).toContain('color: #ffffff')
    expect(html).toContain('A&lt;')
    expect(html).not.toContain('A<') // the raw '<' must never appear unescaped
  })

  it('escapes ampersands and quotes as well as angle brackets', () => {
    const grid: Grid = [[{ char: '&', font: { family: 'monospace', sizePx: 10 } }]]
    const html = toXHTML(grid, { background: '#000', foreground: '#fff' })
    expect(html).toContain('&amp;')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- toXHTML`
Expected: FAIL with `Cannot find module './toXHTML'`.

- [ ] **Step 3: Write the implementation**

```ts
// core/src/export/toXHTML.ts
import type { Grid } from '../types'
import { toText } from './toText'

export interface XHTMLOptions {
  background: string
  foreground: string
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function toXHTML(grid: Grid, options: XHTMLOptions): string {
  const escaped = escapeXml(toText(grid))
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>ASCII SuperGenerator export</title>
</head>
<body style="background-color: ${options.background}; margin: 0;">
<pre style="background-color: ${options.background}; color: ${options.foreground}; margin: 0; padding: 1em; white-space: pre; font-family: monospace;">
${escaped}
</pre>
</body>
</html>
`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- toXHTML`
Expected: PASS, both assertions green.

- [ ] **Step 5: Commit**

```bash
git add core/src/export/toXHTML.ts core/src/export/toXHTML.test.ts
git commit -m "feat(core): add XHTML export serializer"
```

---

### Task 12: Export serializer — RTF

**Files:**
- Create: `core/src/export/toRTF.ts`
- Test: `core/src/export/toRTF.test.ts`

**Interfaces:**
- Consumes: `Grid` (Task 2).
- Produces: `toRTF(grid: Grid): string`, consumed by `ui/src/exportPanel.ts` (Task 16).

RTF always renders monospace regardless of the grid's per-cell font (spec §6, Global Constraints) — this serializer deliberately ignores `cell.font` entirely and hardcodes a monospace font table entry.

- [ ] **Step 1: Write the failing test**

```ts
// core/src/export/toRTF.test.ts
import { describe, expect, it } from 'vitest'
import { toRTF } from './toRTF'
import type { Grid } from '../types'

describe('toRTF', () => {
  it('wraps rows in an RTF document with a monospace font table entry', () => {
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'serif', sizePx: 20 } }, // font is deliberately ignored
        { char: 'B', font: { family: 'serif', sizePx: 20 } },
      ],
    ]
    const rtf = toRTF(grid)
    expect(rtf).toContain('{\\rtf1')
    expect(rtf).toContain('Courier New')
    expect(rtf).toContain('AB')
  })

  it('escapes RTF control characters in the content', () => {
    const grid: Grid = [[{ char: '\\', font: { family: 'monospace', sizePx: 10 } }]]
    const rtf = toRTF(grid)
    expect(rtf).toContain('\\\\')
  })

  it('separates rows with an RTF line break, not a raw newline', () => {
    const grid: Grid = [
      [{ char: 'A', font: { family: 'monospace', sizePx: 10 } }],
      [{ char: 'B', font: { family: 'monospace', sizePx: 10 } }],
    ]
    const rtf = toRTF(grid)
    expect(rtf).toContain('A\\line')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- toRTF`
Expected: FAIL with `Cannot find module './toRTF'`.

- [ ] **Step 3: Write the implementation**

```ts
// core/src/export/toRTF.ts
import type { Grid } from '../types'

function escapeRtf(char: string): string {
  if (char === '\\') return '\\\\'
  if (char === '{') return '\\{'
  if (char === '}') return '\\}'
  const code = char.codePointAt(0) ?? 0
  if (code > 127) return `\\u${code}?`
  return char
}

export function toRTF(grid: Grid): string {
  const body = grid
    .map((row) => row.map((cell) => escapeRtf(cell.char)).join(''))
    .join('\\line\n')
  return `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0\\fmodern\\fcharset0 Courier New;}}
\\f0\\fs20
${body}
}
`
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- toRTF`
Expected: PASS, all 3 assertions green.

- [ ] **Step 5: Commit**

```bash
git add core/src/export/toRTF.ts core/src/export/toRTF.test.ts
git commit -m "feat(core): add RTF export serializer (always-monospace by design)"
```

---

### Task 13: Export serializer — PNG image

**Files:**
- Create: `core/src/export/toImage.ts`
- Test: `core/src/export/toImage.test.ts`
- Modify: `core/package.json` (add `canvas` devDependency for the Node-side test double)

**Interfaces:**
- Consumes: `Grid` (Task 2), `renderGridToCanvas` (Task 9).
- Produces: `toImage(grid: Grid, options: RenderOptions, canvasFactory: (w: number, h: number) => CanvasLike): Promise<Blob>`, consumed by `ui/src/exportPanel.ts` (Task 16).

`toImage` reuses `renderGridToCanvas` from Task 9 rather than re-implementing glyph drawing — this is the anti-duplication requirement from Global Constraints made concrete: the live preview and the PNG export share one renderer.

- [ ] **Step 1: Write the failing test**

```ts
// core/src/export/toImage.test.ts
import { describe, expect, it, vi } from 'vitest'
import { toImage } from './toImage'
import type { Grid } from '../types'

function makeFakeCanvas() {
  const ctx = {
    font: '',
    fillStyle: '',
    textBaseline: 'top' as CanvasTextBaseline,
    textAlign: 'left' as CanvasTextAlign,
    fillRect: vi.fn(),
    fillText: vi.fn(),
  }
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => ctx,
    convertToBlob: async () => new Blob(['fake-png-bytes'], { type: 'image/png' }),
  }
  return canvas
}

describe('toImage', () => {
  it('sizes the canvas to fit the full grid before rendering', async () => {
    const grid: Grid = [
      [
        { char: 'A', font: { family: 'monospace', sizePx: 10 } },
        { char: 'B', font: { family: 'monospace', sizePx: 10 } },
      ],
    ]
    let sizedCanvas: { width: number; height: number } | null = null
    const factory = (w: number, h: number) => {
      const canvas = makeFakeCanvas()
      canvas.width = w
      canvas.height = h
      sizedCanvas = canvas
      return canvas
    }
    await toImage(
      grid,
      { cellWidthPx: 8, cellHeightPx: 16, background: '#000', foreground: '#fff' },
      factory,
    )
    expect(sizedCanvas).not.toBeNull()
    expect(sizedCanvas!.width).toBe(16) // 2 columns * 8px
    expect(sizedCanvas!.height).toBe(16) // 1 row * 16px
  })

  it('resolves with a PNG blob', async () => {
    const grid: Grid = [[{ char: 'A', font: { family: 'monospace', sizePx: 10 } }]]
    const blob = await toImage(
      grid,
      { cellWidthPx: 8, cellHeightPx: 16, background: '#000', foreground: '#fff' },
      (w, h) => {
        const canvas = makeFakeCanvas()
        canvas.width = w
        canvas.height = h
        return canvas
      },
    )
    expect(blob.type).toBe('image/png')
  })

  it('rejects if the factory yields a canvas with no 2D context', async () => {
    const grid: Grid = [[{ char: 'A', font: { family: 'monospace', sizePx: 10 } }]]
    const badFactory = () => ({
      width: 0,
      height: 0,
      getContext: () => null,
      convertToBlob: async () => new Blob([]),
    })
    await expect(
      toImage(
        grid,
        { cellWidthPx: 8, cellHeightPx: 16, background: '#000', foreground: '#fff' },
        badFactory as never,
      ),
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test --workspace core -- toImage`
Expected: FAIL with `Cannot find module './toImage'`.

- [ ] **Step 3: Write the implementation**

```ts
// core/src/export/toImage.ts
import { renderGridToCanvas, type RenderOptions } from '../renderGridToCanvas'
import type { Grid } from '../types'

export interface CanvasLike {
  width: number
  height: number
  getContext(kind: '2d'): CanvasRenderingContext2D | null
  convertToBlob(options?: { type?: string }): Promise<Blob>
}

export type CanvasFactory = (width: number, height: number) => CanvasLike

export async function toImage(
  grid: Grid,
  options: RenderOptions,
  canvasFactory: CanvasFactory,
): Promise<Blob> {
  const rows = grid.length
  const columns = grid[0]?.length ?? 0
  const pixelWidth = columns * options.cellWidthPx
  const pixelHeight = rows * options.cellHeightPx

  const canvas = canvasFactory(pixelWidth, pixelHeight)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('toImage: 2D context unavailable from canvasFactory')
  }

  renderGridToCanvas(ctx, grid, options)

  return canvas.convertToBlob({ type: 'image/png' })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test --workspace core -- toImage`
Expected: PASS, all 3 assertions green.

- [ ] **Step 5: Add `core/src/index.ts` public API barrel**

```ts
// core/src/index.ts
export * from './types'
export * from './charsets'
export { createCanvasGlyphMeasurer } from './glyphMeasure'
export { buildFontWidthTable } from './fontWidthTable'
export { computeDownscaleDimensions } from './downscale'
export { decodeAndPrepareImage } from './ingest'
export { computeBlockLuminance, mapLuminanceToChar } from './mapping'
export { assembleGrid } from './grid'
export { renderGridToCanvas, type RenderOptions, type RenderResult } from './renderGridToCanvas'
export { toText } from './export/toText'
export { toXHTML, type XHTMLOptions } from './export/toXHTML'
export { toRTF } from './export/toRTF'
export { toImage, type CanvasLike, type CanvasFactory } from './export/toImage'
```

- [ ] **Step 6: Run the full core test suite**

Run: `npm run test --workspace core`
Expected: all test files pass (types, charsets, glyphMeasure, fontWidthTable, downscale, mapping, grid, renderGridToCanvas, export/toText, export/toXHTML, export/toRTF, export/toImage).

- [ ] **Step 7: Commit**

```bash
git add core/src/export/toImage.ts core/src/export/toImage.test.ts core/src/index.ts
git commit -m "feat(core): add PNG export serializer and public API barrel"
```

---

### Task 14: `ui/` scaffold, GlimStone adoption, and version display

**Files:**
- Create: `ui/package.json`
- Create: `ui/vite.config.ts`
- Create: `ui/tsconfig.json`
- Create: `ui/index.html`
- Create: `ui/src/main.ts`
- Create: `ui/src/style.css`
- Create: `ui/src/design/tokens.css` (copied from glimstone)
- Create: `ui/src/design/appearance.ts` (copied from glimstone)
- Create: `ui/src/version.ts`

**Interfaces:**
- Consumes: `ascii-supergenerator-core` (Task 13, via npm workspace dependency).
- Produces: the app shell that Tasks 15-18 (dropzone, preview, controls, queue, export) mount into.

- [ ] **Step 1: Create `ui/package.json`**

```json
{
  "name": "ascii-supergenerator-ui",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "e2e": "playwright test -c e2e/playwright.config.ts"
  },
  "dependencies": {
    "ascii-supergenerator-core": "*"
  },
  "devDependencies": {
    "vite": "^6.0.7",
    "typescript": "^5.7.2",
    "@playwright/test": "^1.49.0"
  }
}
```

- [ ] **Step 2: Create `ui/vite.config.ts`**

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
```

- [ ] **Step 3: Create `ui/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Copy GlimStone's reference files verbatim**

Run:
```bash
cp /d/nextcloud/it/github/glimstone/reference/tokens.css /d/nextcloud/it/github/ascii-supergenerator/ui/src/design/tokens.css
cp /d/nextcloud/it/github/glimstone/reference/appearance.ts /d/nextcloud/it/github/ascii-supergenerator/ui/src/design/appearance.ts
```
Expected: both files copied byte-for-byte (GlimStone's adoption model is explicit copy-paste, not a package dependency — [[GlimStone]]).

- [ ] **Step 5: Create `ui/src/version.ts`**

```ts
export const APP_VERSION = '0.1.0'
// Bump by hand whenever design/tokens.css / design/appearance.ts are
// re-copied from a newer github.com/junkerderprovinz/glimstone release.
export const GLIMSTONE_VERSION = '1.0.0'
```

- [ ] **Step 6: Create `ui/src/style.css`**

```css
@import './design/tokens.css';

html, body {
  margin: 0;
  height: 100%;
  background: var(--glim-bg);
  color: var(--glim-text);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.app-footer {
  margin-top: auto;
  padding: var(--glim-space-2, 0.5rem);
  font-size: 0.75rem;
  color: var(--glim-text-muted);
  text-align: right;
}
```

- [ ] **Step 7: Create `ui/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ASCII SuperGenerator</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `ui/src/main.ts`** (shell only — dropzone/preview/controls/queue/exportPanel are mounted here in Tasks 15-18)

```ts
import { APP_VERSION, GLIMSTONE_VERSION } from './version'
import { applyAppearance } from './design/appearance'

const app = document.getElementById('app')
if (!app) {
  throw new Error('main.ts: #app root element missing from index.html')
}

applyAppearance()

const footer = document.createElement('footer')
footer.className = 'app-footer'
footer.textContent = `ASCII SuperGenerator v${APP_VERSION} · GlimStone v${GLIMSTONE_VERSION}`
app.appendChild(footer)
```

`applyAppearance()` is GlimStone's own exported entry point for wiring the four user-facing axes (shape/accent/theme/language) — its exact signature comes from the copied `appearance.ts` file (Step 4) and is not re-declared here.

- [ ] **Step 9: Verify it builds and runs**

Run: `npm install && npm run build --workspace ui`
Expected: exits 0, `ui/dist/` contains `index.html` + hashed JS/CSS assets.

Run: `npm run dev --workspace ui` (manual check, then Ctrl+C)
Expected: dev server starts, opening the printed local URL shows a blank page with the footer text `ASCII SuperGenerator v0.1.0 · GlimStone v1.0.0` in the bottom-right, styled with GlimStone's tokens (dark background, no visible errors in the browser console).

- [ ] **Step 10: Commit**

```bash
git add ui/package.json ui/vite.config.ts ui/tsconfig.json ui/index.html ui/src/main.ts ui/src/style.css ui/src/design ui/src/version.ts
git commit -m "feat(ui): scaffold the app shell with GlimStone design tokens"
```

---

### Task 15: State store, drop-zone, and batch queue data model

**Files:**
- Create: `ui/src/state.ts`
- Create: `ui/src/dropzone.ts`

**Interfaces:**
- Consumes: `decodeAndPrepareImage` from `ascii-supergenerator-core` (Task 6/13).
- Produces: `BatchItem`, `AppState`, `createStore()` from `state.ts`, consumed by `preview.ts` (Task 16), `controls.ts` (Task 17), `queue.ts` (Task 18), `exportPanel.ts` (Task 19).

- [ ] **Step 1: Create `ui/src/state.ts`**

```ts
import { decodeAndPrepareImage, CHARSET_PRESETS, type MappingOptions } from 'ascii-supergenerator-core'

export type BatchItemStatus = 'pending' | 'converting' | 'converted' | 'exported' | 'error'

export interface BatchItem {
  id: string
  file: File
  status: BatchItemStatus
  errorMessage?: string
  imageData?: ImageData
  wasDownscaled?: boolean
}

export interface AppState {
  items: BatchItem[]
  activeItemId: string | null
  options: MappingOptions
}

export type Listener = (state: AppState) => void

export function createStore() {
  let state: AppState = {
    items: [],
    activeItemId: null,
    options: {
      columns: 120,
      brightness: 0,
      contrast: 0,
      charset: [...CHARSET_PRESETS.standard],
      font: { family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', sizePx: 14 },
    },
  }
  const listeners = new Set<Listener>()

  function notify() {
    for (const listener of listeners) listener(state)
  }

  function setState(patch: Partial<AppState>) {
    state = { ...state, ...patch }
    notify()
  }

  function updateItem(id: string, patch: Partial<BatchItem>) {
    setState({
      items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    })
  }

  async function addFiles(files: File[]) {
    const newItems: BatchItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
    }))
    setState({
      items: [...state.items, ...newItems],
      activeItemId: state.activeItemId ?? newItems[0]?.id ?? null,
    })

    for (const item of newItems) {
      updateItem(item.id, { status: 'converting' })
      try {
        const { imageData, wasDownscaled } = await decodeAndPrepareImage(item.file)
        updateItem(item.id, { status: 'converted', imageData, wasDownscaled })
      } catch (error) {
        updateItem(item.id, {
          status: 'error',
          errorMessage: error instanceof Error ? error.message : String(error),
        })
      }
    }
  }

  return {
    getState: () => state,
    subscribe: (listener: Listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    setState,
    updateItem,
    addFiles,
  }
}

export type Store = ReturnType<typeof createStore>
```

- [ ] **Step 2: Create `ui/src/dropzone.ts`**

```ts
import type { Store } from './state'

export function mountDropzone(container: HTMLElement, store: Store): void {
  const zone = document.createElement('div')
  zone.className = 'dropzone'
  zone.textContent = 'Drop images here, or click to choose files'
  zone.tabIndex = 0

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.multiple = true
  input.style.display = 'none'

  zone.addEventListener('click', () => input.click())
  zone.addEventListener('dragover', (event) => {
    event.preventDefault()
    zone.classList.add('dropzone--active')
  })
  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dropzone--active')
  })
  zone.addEventListener('drop', (event) => {
    event.preventDefault()
    zone.classList.remove('dropzone--active')
    const files = Array.from(event.dataTransfer?.files ?? [])
    if (files.length > 0) void store.addFiles(files)
  })
  input.addEventListener('change', () => {
    const files = Array.from(input.files ?? [])
    if (files.length > 0) void store.addFiles(files)
    input.value = ''
  })

  container.appendChild(zone)
  container.appendChild(input)
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npm run typecheck --workspace ui`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add ui/src/state.ts ui/src/dropzone.ts
git commit -m "feat(ui): add app state store and drop-zone/file-picker"
```

---

### Task 16: Live preview canvas

**Files:**
- Create: `ui/src/preview.ts`

**Interfaces:**
- Consumes: `Store` (Task 15), `buildFontWidthTable`, `createCanvasGlyphMeasurer`, `assembleGrid`, `renderGridToCanvas` from `ascii-supergenerator-core` (Task 13).

- [ ] **Step 1: Create `ui/src/preview.ts`**

```ts
import {
  assembleGrid,
  buildFontWidthTable,
  createCanvasGlyphMeasurer,
  renderGridToCanvas,
} from 'ascii-supergenerator-core'
import type { Store } from './state'

const PREVIEW_CELL_WIDTH_PX = 8
const PREVIEW_CELL_HEIGHT_PX = 16

export function mountPreview(container: HTMLElement, store: Store): void {
  const canvas = document.createElement('canvas')
  canvas.className = 'preview-canvas'
  container.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('mountPreview: 2D context unavailable')
  }

  const measure = createCanvasGlyphMeasurer()

  function render() {
    const state = store.getState()
    const activeItem = state.items.find((item) => item.id === state.activeItemId)
    if (!activeItem?.imageData) {
      canvas.width = 0
      canvas.height = 0
      return
    }

    const table = buildFontWidthTable(state.options.charset, state.options.font, measure)
    const grid = assembleGrid(activeItem.imageData, table, state.options)

    const columns = grid[0]?.length ?? 0
    const rows = grid.length
    canvas.width = columns * PREVIEW_CELL_WIDTH_PX
    canvas.height = rows * PREVIEW_CELL_HEIGHT_PX

    renderGridToCanvas(ctx, grid, {
      cellWidthPx: PREVIEW_CELL_WIDTH_PX,
      cellHeightPx: PREVIEW_CELL_HEIGHT_PX,
      background: '#000000',
      foreground: '#ffffff',
    })
  }

  store.subscribe(render)
  render()
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck --workspace ui`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add ui/src/preview.ts
git commit -m "feat(ui): wire the live preview canvas to core's mapping pipeline"
```

---

### Task 17: Parameter controls

**Files:**
- Create: `ui/src/controls.ts`

**Interfaces:**
- Consumes: `Store` (Task 15), `CHARSET_PRESETS` from `ascii-supergenerator-core` (Task 13).

- [ ] **Step 1: Create `ui/src/controls.ts`**

```ts
import { CHARSET_PRESETS, type CharsetPresetKey } from 'ascii-supergenerator-core'
import type { Store } from './state'

const FONT_CHOICES = [
  { label: 'Monospace (system)', family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
  { label: 'Monospace (alt)', family: 'Consolas, "Courier New", monospace' },
  { label: 'Serif (proportional)', family: 'ui-serif, Georgia, "Times New Roman", serif' },
  { label: 'Sans (proportional)', family: 'ui-sans-serif, system-ui, "Segoe UI", sans-serif' },
] as const

export function mountControls(container: HTMLElement, store: Store): void {
  const panel = document.createElement('div')
  panel.className = 'controls'

  const columns = numberSlider('Width (columns)', 20, 400, store.getState().options.columns, (value) => {
    store.setState({ options: { ...store.getState().options, columns: value } })
  })

  const brightness = numberSlider('Brightness', -1, 1, store.getState().options.brightness, (value) => {
    store.setState({ options: { ...store.getState().options, brightness: value } })
  }, 0.05)

  const contrast = numberSlider('Contrast', -1, 1, store.getState().options.contrast, (value) => {
    store.setState({ options: { ...store.getState().options, contrast: value } })
  }, 0.05)

  const charsetSelect = document.createElement('select')
  for (const key of Object.keys(CHARSET_PRESETS) as CharsetPresetKey[]) {
    const opt = document.createElement('option')
    opt.value = key
    opt.textContent = key
    charsetSelect.appendChild(opt)
  }
  const customOpt = document.createElement('option')
  customOpt.value = 'custom'
  customOpt.textContent = 'custom'
  charsetSelect.appendChild(customOpt)

  const customInput = document.createElement('input')
  customInput.type = 'text'
  customInput.placeholder = 'darkest..lightest characters'
  customInput.style.display = 'none'

  charsetSelect.addEventListener('change', () => {
    const key = charsetSelect.value
    if (key === 'custom') {
      customInput.style.display = ''
      return
    }
    customInput.style.display = 'none'
    store.setState({
      options: { ...store.getState().options, charset: [...CHARSET_PRESETS[key as CharsetPresetKey]] },
    })
  })
  customInput.addEventListener('input', () => {
    store.setState({
      options: { ...store.getState().options, charset: customInput.value.split('') },
    })
  })

  const fontSelect = document.createElement('select')
  for (const choice of FONT_CHOICES) {
    const opt = document.createElement('option')
    opt.value = choice.family
    opt.textContent = choice.label
    fontSelect.appendChild(opt)
  }
  fontSelect.addEventListener('change', () => {
    const options = store.getState().options
    store.setState({ options: { ...options, font: { ...options.font, family: fontSelect.value } } })
  })

  const rtfNote = document.createElement('p')
  rtfNote.className = 'controls-note'
  rtfNote.textContent =
    'Note: RTF export always renders in a fixed monospace font, regardless of the font selected above — most RTF readers cannot reliably honor an arbitrary proportional font.'

  panel.append(columns, brightness, contrast, charsetSelect, customInput, fontSelect, rtfNote)
  container.appendChild(panel)
}

function numberSlider(
  label: string,
  min: number,
  max: number,
  initial: number,
  onChange: (value: number) => void,
  step = 1,
): HTMLElement {
  const wrapper = document.createElement('label')
  wrapper.className = 'control-slider'
  wrapper.textContent = label

  const input = document.createElement('input')
  input.type = 'range'
  input.min = String(min)
  input.max = String(max)
  input.step = String(step)
  input.value = String(initial)
  input.addEventListener('input', () => onChange(Number(input.value)))

  wrapper.appendChild(input)
  return wrapper
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck --workspace ui`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add ui/src/controls.ts
git commit -m "feat(ui): add parameter controls (columns, brightness, contrast, charset, font)"
```

---

### Task 18: Batch queue view

**Files:**
- Create: `ui/src/queue.ts`

**Interfaces:**
- Consumes: `Store`, `BatchItem` (Task 15).

- [ ] **Step 1: Create `ui/src/queue.ts`**

```ts
import type { BatchItem, Store } from './state'

export function mountQueue(container: HTMLElement, store: Store): void {
  const list = document.createElement('ul')
  list.className = 'queue-list'
  container.appendChild(list)

  function render() {
    const state = store.getState()
    list.innerHTML = ''
    for (const item of state.items) {
      list.appendChild(renderItem(item, item.id === state.activeItemId, store))
    }
  }

  store.subscribe(render)
  render()
}

function renderItem(item: BatchItem, isActive: boolean, store: Store): HTMLLIElement {
  const li = document.createElement('li')
  li.className = `queue-item queue-item--${item.status}${isActive ? ' queue-item--active' : ''}`

  const name = document.createElement('span')
  name.className = 'queue-item-name'
  name.textContent = item.file.name

  const status = document.createElement('span')
  status.className = 'queue-item-status'
  status.textContent = item.status === 'error' ? `error: ${item.errorMessage ?? 'unknown'}` : item.status

  li.append(name, status)

  if (item.wasDownscaled) {
    const downscaledNote = document.createElement('span')
    downscaledNote.className = 'queue-item-downscaled'
    downscaledNote.title = 'This image exceeded the maximum working dimension and was automatically downscaled before conversion.'
    downscaledNote.textContent = 'downscaled'
    li.append(downscaledNote)
  }

  li.addEventListener('click', () => {
    if (item.status === 'converted' || item.status === 'exported') {
      store.setState({ activeItemId: item.id })
    }
  })
  return li
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck --workspace ui`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add ui/src/queue.ts
git commit -m "feat(ui): add batch queue view with per-item status"
```

---

### Task 19: Export panel

**Files:**
- Create: `ui/src/exportPanel.ts`

**Interfaces:**
- Consumes: `Store` (Task 15), `buildFontWidthTable`, `createCanvasGlyphMeasurer`, `assembleGrid`, `toText`, `toXHTML`, `toRTF`, `toImage` from `ascii-supergenerator-core` (Task 13).

- [ ] **Step 1: Create `ui/src/exportPanel.ts`**

```ts
import {
  assembleGrid,
  buildFontWidthTable,
  createCanvasGlyphMeasurer,
  toImage,
  toRTF,
  toText,
  toXHTML,
} from 'ascii-supergenerator-core'
import type { BatchItem, Store } from './state'

type ExportFormat = 'txt' | 'xhtml' | 'rtf' | 'png'

const EXPORT_CELL_WIDTH_PX = 8
const EXPORT_CELL_HEIGHT_PX = 16

export function mountExportPanel(container: HTMLElement, store: Store): void {
  const panel = document.createElement('div')
  panel.className = 'export-panel'

  const summary = document.createElement('p')
  summary.className = 'export-summary'

  for (const format of ['txt', 'xhtml', 'rtf', 'png'] as ExportFormat[]) {
    const button = document.createElement('button')
    button.textContent = `Export active image as ${format.toUpperCase()}`
    button.addEventListener('click', () => void exportActive(store, format, summary))
    panel.appendChild(button)
  }

  const batchButton = document.createElement('button')
  batchButton.textContent = 'Export all queued images as TXT'
  batchButton.addEventListener('click', () => void exportAllAsText(store, summary))
  panel.appendChild(batchButton)

  panel.appendChild(summary)
  container.appendChild(panel)
}

async function buildOutput(item: BatchItem, store: Store, format: ExportFormat): Promise<Blob> {
  if (!item.imageData) {
    throw new Error(`buildOutput: item "${item.file.name}" has no decoded image data`)
  }
  const options = store.getState().options
  const measure = createCanvasGlyphMeasurer()
  const table = buildFontWidthTable(options.charset, options.font, measure)
  const grid = assembleGrid(item.imageData, table, options)

  switch (format) {
    case 'txt':
      return new Blob([toText(grid)], { type: 'text/plain' })
    case 'xhtml':
      return new Blob([toXHTML(grid, { background: '#000000', foreground: '#ffffff' })], {
        type: 'application/xhtml+xml',
      })
    case 'rtf':
      return new Blob([toRTF(grid)], { type: 'application/rtf' })
    case 'png':
      return toImage(
        grid,
        {
          cellWidthPx: EXPORT_CELL_WIDTH_PX,
          cellHeightPx: EXPORT_CELL_HEIGHT_PX,
          background: '#000000',
          foreground: '#ffffff',
        },
        (w, h) => {
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          return {
            width: w,
            height: h,
            getContext: (kind) => canvas.getContext(kind),
            convertToBlob: (opts) =>
              new Promise((resolve, reject) => {
                canvas.toBlob((blob) => {
                  if (blob) resolve(blob)
                  else reject(new Error('canvas.toBlob returned null'))
                }, opts?.type ?? 'image/png')
              }),
          }
        },
      )
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

async function exportActive(store: Store, format: ExportFormat, summary: HTMLElement): Promise<void> {
  const state = store.getState()
  const item = state.items.find((i) => i.id === state.activeItemId)
  if (!item) {
    summary.textContent = 'No active image to export.'
    return
  }
  try {
    const blob = await buildOutput(item, store, format)
    downloadBlob(blob, `${item.file.name}.${format}`)
    store.updateItem(item.id, { status: 'exported' })
    summary.textContent = `Exported "${item.file.name}" as ${format.toUpperCase()}.`
  } catch (error) {
    summary.textContent = `Export failed: ${error instanceof Error ? error.message : String(error)}`
  }
}

async function exportAllAsText(store: Store, summary: HTMLElement): Promise<void> {
  const state = store.getState()
  let succeeded = 0
  let failed = 0
  for (const item of state.items) {
    if (item.status !== 'converted' && item.status !== 'exported') continue
    try {
      const blob = await buildOutput(item, store, 'txt')
      downloadBlob(blob, `${item.file.name}.txt`)
      store.updateItem(item.id, { status: 'exported' })
      succeeded++
    } catch {
      failed++
    }
  }
  summary.textContent = `Batch export: ${succeeded} succeeded, ${failed} failed.`
}
```

- [ ] **Step 2: Wire the whole app together in `ui/src/main.ts`**

Modify `ui/src/main.ts` (from Task 14) to mount every panel:

```ts
import { APP_VERSION, GLIMSTONE_VERSION } from './version'
import { applyAppearance } from './design/appearance'
import { createStore } from './state'
import { mountDropzone } from './dropzone'
import { mountPreview } from './preview'
import { mountControls } from './controls'
import { mountQueue } from './queue'
import { mountExportPanel } from './exportPanel'

const app = document.getElementById('app')
if (!app) {
  throw new Error('main.ts: #app root element missing from index.html')
}

applyAppearance()

const store = createStore()

const main = document.createElement('main')
main.className = 'app-main'
mountDropzone(main, store)
mountPreview(main, store)
mountControls(main, store)
mountQueue(main, store)
mountExportPanel(main, store)
app.appendChild(main)

const footer = document.createElement('footer')
footer.className = 'app-footer'
footer.textContent = `ASCII SuperGenerator v${APP_VERSION} · GlimStone v${GLIMSTONE_VERSION}`
app.appendChild(footer)
```

- [ ] **Step 3: Verify it compiles and builds**

Run: `npm run typecheck --workspace ui && npm run build --workspace ui`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add ui/src/exportPanel.ts ui/src/main.ts
git commit -m "feat(ui): add export panel and wire the full app shell together"
```

---

### Task 20: Playwright E2E smoke test

**Files:**
- Create: `ui/e2e/playwright.config.ts`
- Create: `ui/e2e/fixtures/small.png`
- Create: `ui/e2e/convert.spec.ts`

**Interfaces:**
- Consumes: the running `ui/` dev/preview server (Tasks 14-19).

- [ ] **Step 1: Create a tiny fixture image**

Run:
```bash
node -e "
const { createCanvas } = require('canvas');
const fs = require('fs');
const canvas = createCanvas(16, 16);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, 16, 16);
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, 8, 8);
fs.writeFileSync('ui/e2e/fixtures/small.png', canvas.toBuffer('image/png'));
"
```
Expected: `ui/e2e/fixtures/small.png` exists, a 16x16 PNG with a white square in one corner (guarantees the mapping produces at least two distinct characters).

If `canvas` is not installed as a devDependency yet, run `npm install -D canvas --workspace ui` first (needed only to generate this fixture at plan-authoring time — not a runtime dependency of the app itself).

- [ ] **Step 2: Create `ui/e2e/playwright.config.ts`**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  webServer: {
    command: 'npm run preview -- --port 4173',
    port: 4173,
    cwd: '..',
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
})
```

- [ ] **Step 3: Write the E2E test**

```ts
// ui/e2e/convert.spec.ts
import { test, expect } from '@playwright/test'
import path from 'node:path'

test('drop an image, see ASCII output, export as TXT', async ({ page }) => {
  await page.goto('/')

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))

  const canvas = page.locator('canvas.preview-canvas')
  await expect(canvas).toBeVisible()
  await expect
    .poll(async () => {
      const box = await canvas.boundingBox()
      return box ? box.width > 0 : false
    })
    .toBe(true)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export active image as TXT' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toContain('.txt')
  const streamPath = await download.path()
  expect(streamPath).not.toBeNull()
})
```

- [ ] **Step 4: Install Playwright browsers and run the test**

Run: `npx playwright install --with-deps chromium && npm run build --workspace ui && npm run e2e --workspace ui`
Expected: PASS — 1 test, the preview canvas becomes visible with non-zero width after the file is dropped, and a `.txt` download fires when the export button is clicked.

- [ ] **Step 5: Commit**

```bash
git add ui/e2e
git commit -m "test(ui): add Playwright E2E smoke test for the convert-and-export flow"
```

---

### Task 21: Root Go module and the shared `webembed` package

**Files:**
- Create: `go.mod`
- Create: `webembed/embed.go`

**Interfaces:**
- Produces: `webembed.Dist` (`fs.FS`), the single embedded copy of the built `ui/dist` bundle. Consumed by `desktop/main.go` (Task 22, via a `replace` directive) and `container/main.go` (Task 23, same module, direct import).

`//go:embed` directives cannot reference paths outside their own file's directory (no `..` — a hard Go restriction), so the bundle is embedded exactly once, here, and reused by both packaging targets — this is what "built once, embedded twice" (spec §3) actually requires in Go, and matches KnightLoader's real `web/embed.go` precedent.

- [ ] **Step 1: Create the root `go.mod`**

```
module github.com/junkerderprovinz/ascii-supergenerator

go 1.26

toolchain go1.26.6
```

- [ ] **Step 2: Create `webembed/embed.go`**

```go
// Package webembed holds the single embedded copy of the built ui/ bundle.
// webembed/dist is not committed to source control - it is populated by
// copying ui/dist here immediately before a Go build that needs it (see
// container/Dockerfile's COPY step and desktop/README.md's build step).
package webembed

import (
	"embed"
	"io/fs"
)

//go:embed all:dist
var raw embed.FS

// Dist serves the bundle at its own root (index.html at "/", not
// "/dist/index.html") by stripping the embed's "dist/" prefix.
var Dist fs.FS = mustSub(raw, "dist")

func mustSub(f embed.FS, dir string) fs.FS {
	sub, err := fs.Sub(f, dir)
	if err != nil {
		panic(err)
	}
	return sub
}
```

- [ ] **Step 3: Create a placeholder so the package compiles before `ui/` has ever been built**

Run:
```bash
mkdir -p webembed/dist
echo '<!doctype html><title>ASCII SuperGenerator (not yet built)</title>' > webembed/dist/index.html
```
Expected: `go build ./...` at the repo root succeeds even before Task 20's real `ui/dist` output exists. This placeholder file is gitignored (Task 1's `.gitignore` already covers `webembed/dist/`) — it only exists on disk to unblock local `go build`/`go vet` runs before the frontend has been built at least once.

- [ ] **Step 4: Verify it compiles**

Run: `go build ./webembed/...`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add go.mod webembed/embed.go
git commit -m "feat: add the shared webembed package for the built ui/ bundle"
```

---

### Task 22: `desktop/` Wails wrapper

**Files:**
- Create: `desktop/go.mod`
- Create: `desktop/wails.json`
- Create: `desktop/main.go`
- Create: `desktop/savedialog.go`
- Create: `desktop/README.md`

**Interfaces:**
- Consumes: `webembed.Dist` (Task 21), via a `replace` directive back to the root module — this is exactly KnightLoader's `desktop/go.mod` `replace github.com/junkerderprovinz/knightloader => ../` pattern.
- Produces: three portable binaries (Windows/Linux/macOS), matching KnightLoader's precedent exactly.

- [ ] **Step 1: Create `desktop/go.mod`**

```
module github.com/junkerderprovinz/ascii-supergenerator/desktop

go 1.26

toolchain go1.26.6

require (
	github.com/junkerderprovinz/ascii-supergenerator v0.0.0-00010101000000-000000000000
	github.com/wailsapp/wails/v2 v2.13.0
)

replace github.com/junkerderprovinz/ascii-supergenerator => ../
```

- [ ] **Step 2: Create `desktop/wails.json`**

```json
{
  "$schema": "https://wails.io/schemas/config.v2.json",
  "name": "ASCII SuperGenerator",
  "outputfilename": "ASCIISuperGenerator",
  "info": {
    "productName": "ASCII SuperGenerator",
    "comments": "Turns images into proportional-font-aware ASCII art"
  },
  "frontend:dir": "../ui",
  "frontend:install": "npm install",
  "frontend:build": "npm run build",
  "frontend:dev:serverUrl": "auto"
}
```

Wails still runs `npm run build` in `ui/` on every `wails build` (so a developer never has to remember a separate frontend-build step), but the resulting `ui/dist` is consumed via `webembed.Dist`, not via Wails' own asset-copying — Step 4 below copies `ui/dist` into `webembed/dist` as part of the same build sequence.

- [ ] **Step 3: Create `desktop/savedialog.go`**

```go
package main

import (
	"context"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App exposes Go-side methods to the frontend via Wails bindings, so the
// desktop build can offer a native save dialog instead of a browser download
// prompt when exporting (spec §4 "desktop/").
type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// SaveExport opens a native "Save As" dialog for the given suggested
// filename, then writes data to the chosen path. Returns the chosen path,
// or an empty string if the user cancelled.
func (a *App) SaveExport(suggestedFilename string, data []byte) (string, error) {
	path, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		DefaultFilename: suggestedFilename,
	})
	if err != nil {
		return "", err
	}
	if path == "" {
		return "", nil // user cancelled
	}
	if err := os.WriteFile(path, data, 0o644); err != nil {
		return "", err
	}
	return path, nil
}
```

- [ ] **Step 4: Create `desktop/main.go`**

```go
package main

import (
	"github.com/junkerderprovinz/ascii-supergenerator/webembed"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

func main() {
	app := NewApp()

	err := wails.Run(&options.App{
		Title:  "ASCII SuperGenerator",
		Width:  1200,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: webembed.Dist,
		},
		OnStartup: app.startup,
		Bind: []interface{}{
			app,
		},
	})
	if err != nil {
		println("Error:", err.Error())
	}
}
```

- [ ] **Step 5: Create `desktop/README.md`**

```markdown
# ASCII SuperGenerator — desktop build

Portable Wails v2 wrapper. Reuses the exact same built `ui/` bundle the
container serves, via the root module's `webembed` package.

## Build locally

```
npm run build --workspace ui
rm -rf ../webembed/dist && cp -r ../ui/dist ../webembed/dist
cd desktop
go mod tidy
wails build
```

Output: `desktop/build/bin/ASCIISuperGenerator[.exe]` — a single portable
binary, no installer, no code signing configured.

Linux requires `libgtk-3-dev` and `libwebkit2gtk-4.1-dev` at build time and
`libwebkit2gtk-4.1-0` at runtime.
```

- [ ] **Step 6: Verify the desktop build compiles**

Run:
```bash
npm run build --workspace ui
rm -rf webembed/dist && cp -r ui/dist webembed/dist
cd desktop && go mod tidy && wails build -platform linux/amd64 -clean
```
(substitute the current OS's platform if not on Linux)
Expected: exits 0, produces `desktop/build/bin/ASCIISuperGenerator` (or platform-appropriate filename).

- [ ] **Step 7: Commit**

```bash
git add desktop/go.mod desktop/go.sum desktop/wails.json desktop/main.go desktop/savedialog.go desktop/README.md
git commit -m "feat(desktop): add Wails v2 wrapper embedding the shared webembed bundle"
```

---

### Task 23: `container/` Go static server

**Files:**
- Create: `container/main.go`
- Create: `container/Dockerfile`
- Create: `container/README.md`

**Interfaces:**
- Consumes: `webembed.Dist` (Task 21) — `container/main.go` is part of the ROOT module (no separate `go.mod`), so it imports `webembed` directly, no `replace` needed.

- [ ] **Step 1: Create `container/main.go`**

```go
package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/junkerderprovinz/ascii-supergenerator/webembed"
)

const readyBanner = `
   _   ____   ____ ____ ___    ____                       _____
  / \ / ___| / ___|_ _|_ _|   / ___|_   _ _ __   ___ _ __ / ____|___ _ __
 / _ \\___ \| |    | | | |   | |  _| | | | '_ \ / _ \ '__| |  _ / _ \ '_ \
/ ___ \___) | |___ | | | |   | |_| | |_| | | | |  __/ |  | |_| |  __/ | | |
/_/   \_\____/ \____|___|___|  \____|\__,_|_| |_|\___|_|   \____\___|_| |_|
`

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "3210"
	}

	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.FS(webembed.Dist)))

	fmt.Println(readyBanner)
	fmt.Println("  ASCII SuperGenerator - image to ASCII art, self-hosted")
	fmt.Println()
	fmt.Printf("  \033[0;32m✓ ASCII SUPERGENERATOR IS READY\033[0m - listening on http://0.0.0.0:%s\n", port)
	fmt.Println()

	if err := http.ListenAndServe(":"+port, mux); err != nil {
		fmt.Fprintf(os.Stderr, "server error: %v\n", err)
		os.Exit(1)
	}
}
```

- [ ] **Step 2: Create `container/Dockerfile`**, mirroring featherdrop's three-stage pattern — the `gobuild` stage now copies the whole root module (`go.mod`, `webembed/`, `container/`), not just a `container/` subtree, since `container/main.go` belongs to the root module:

```dockerfile
# syntax=docker/dockerfile:1
ARG NODE_VERSION=24
ARG GO_VERSION=1.26

FROM node:${NODE_VERSION}-slim AS client
WORKDIR /app
COPY package.json ./
COPY core/package.json core/
COPY ui/package.json ui/
RUN npm install
COPY core ./core
COPY ui ./ui
RUN npm run build --workspace ui

FROM golang:${GO_VERSION} AS gobuild
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY webembed ./webembed
COPY container ./container
COPY --from=client /app/ui/dist ./webembed/dist
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/ascii-supergenerator ./container

FROM gcr.io/distroless/static-debian12:latest@sha256:a9fcaedd4c9b59e12dd65d954f0b5044f19b0647a8a3712e77205df9e7b102cd AS runtime
LABEL org.opencontainers.image.title="ASCII SuperGenerator" \
      org.opencontainers.image.description="Turns images into proportional-font-aware ASCII art, self-hosted" \
      org.opencontainers.image.source="https://github.com/junkerderprovinz/ascii-supergenerator" \
      org.opencontainers.image.licenses="AGPL-3.0"
COPY --from=gobuild /out/ascii-supergenerator /ascii-supergenerator
ENV PORT=3210
EXPOSE 3210
ENTRYPOINT ["/ascii-supergenerator"]
```

- [ ] **Step 3: Create `container/README.md`**

```markdown
# ASCII SuperGenerator — container build

A minimal Go HTTP server whose only job is serving the same built `ui/`
bundle the desktop build embeds (via the shared `webembed` package) — no API
endpoints, no backend logic, no database, no volumes required.

## Run locally

```
docker build -t ascii-supergenerator:dev -f container/Dockerfile .
docker run -p 3210:3210 ascii-supergenerator:dev
```

Open `http://localhost:3210/`.
```

- [ ] **Step 4: Verify the image builds and serves**

Run: `docker build -t ascii-supergenerator:dev -f container/Dockerfile .`
Expected: exits 0.

Run: `docker run -d --name asg-smoke -p 3210:3210 ascii-supergenerator:dev && sleep 2 && curl -fsS -o /dev/null -w '%{http_code}\n' http://localhost:3210/ && docker logs asg-smoke && docker rm -f asg-smoke`
Expected: prints `200`, and the logs contain the substring `ASCII SUPERGENERATOR IS READY`.

- [ ] **Step 5: Commit**

```bash
git add container/main.go container/Dockerfile container/README.md
git commit -m "feat(container): add the static-file-server Docker image"
```

---

### Task 24: Desktop CI (3-platform build matrix)

**Files:**
- Create: `.github/workflows/desktop.yml`

**Interfaces:**
- Consumes: `desktop/` (Task 22), `webembed/` (Task 21).

- [ ] **Step 1: Create `.github/workflows/desktop.yml`**, mirroring KnightLoader's `desktop.yml` matrix exactly (same OS images, same Wails version pin, same Linux system deps, same webkit2_41 tag), with an explicit `ui/dist` → `webembed/dist` copy step before `wails build` (Task 22's local-build note applies here too):

```yaml
name: Desktop build

on:
  workflow_dispatch:
  push:
    tags:
      - "v*.*.*"

jobs:
  build:
    strategy:
      matrix:
        include:
          - os: windows-latest
            platform: windows/amd64
            slug: windows-amd64
            extra: ""
          - os: macos-latest
            platform: darwin/universal
            slug: macos-universal
            extra: ""
          - os: ubuntu-latest
            platform: linux/amd64
            slug: linux-amd64
            extra: "-tags webkit2_41"
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-go@v5
        with:
          go-version-file: go.mod

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Linux system deps
        if: runner.os == 'Linux'
        run: sudo apt-get update && sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.1-dev

      - name: Install Wails CLI
        run: go install github.com/wailsapp/wails/v2/cmd/wails@v2.13.0

      - name: Build ui/ and populate webembed/dist
        run: |
          npm install
          npm run build --workspace ui
          rm -rf webembed/dist
          cp -r ui/dist webembed/dist

      - name: Build
        working-directory: desktop
        run: |
          go mod tidy
          wails build -platform ${{ matrix.platform }} -clean ${{ matrix.extra }}

      - uses: actions/upload-artifact@v4
        with:
          name: ascii-supergenerator-${{ matrix.slug }}
          path: desktop/build/bin/*
```

`go-version-file: go.mod` points at the **root** `go.mod`, not `desktop/go.mod` — matching KnightLoader's own deliberate choice (`desktop/`'s module replaces the root module and inherits its `go` directive).

- [ ] **Step 2: Verify the workflow YAML is syntactically valid**

Run: `python -c "import yaml; yaml.safe_load(open('.github/workflows/desktop.yml'))"`
Expected: exits 0, no exception.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/desktop.yml
git commit -m "ci: add 3-platform Wails desktop build workflow"
```

---

### Task 25: Container CI (build, boot-smoke, push)

**Files:**
- Create: `.github/workflows/container.yml`

**Interfaces:**
- Consumes: `container/Dockerfile` (Task 23).

- [ ] **Step 1: Create `.github/workflows/container.yml`**, mirroring featherdrop's `build.yml` boot-smoke pattern (curl-based `/` check, no log-grep gate, dual amd64/arm64 smoke images before the real multi-arch push):

```yaml
name: Container build

on:
  push:
    branches: [main]
    paths-ignore:
      - "**.md"
      - "LICENSE"
      - "docs/**"
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-qemu-action@v4
      - uses: docker/setup-buildx-action@v4

      - name: Build smoke images (amd64 + arm64, not pushed)
        run: |
          docker buildx build --platform linux/amd64 -f container/Dockerfile -t asg:smoke-amd64 --load .
          docker buildx build --platform linux/arm64 -f container/Dockerfile -t asg:smoke-arm64 --load .

      - name: Boot-smoke both architectures
        run: |
          smoke() {
            local platform="$1" tag="$2" budget="$3"
            local name="asg-smoke-$RANDOM"
            docker run -d --name "$name" --platform "$platform" -p 3210:3210 "$tag"
            for i in $(seq 1 "$budget"); do
              if curl -fsS -o /dev/null http://localhost:3210/; then
                echo "OK: ${platform} served / after ${i}s"
                docker rm -f "$name"
                return 0
              fi
              sleep 1
            done
            echo "FAIL: ${platform} never served / within ${budget}s"
            docker logs "$name" || true
            docker rm -f "$name"
            return 1
          }
          smoke linux/amd64 asg:smoke-amd64 40
          smoke linux/arm64 asg:smoke-arm64 150

      - name: Log in to GHCR
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v4
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/metadata-action@v6
        id: meta
        with:
          images: ghcr.io/junkerderprovinz/ascii-supergenerator
          tags: |
            type=raw,value=latest,enable={{is_default_branch}}
            type=sha,prefix=sha-,format=short

      - name: Build and push
        if: github.event_name != 'pull_request'
        uses: docker/build-push-action@v7
        with:
          context: .
          file: container/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          provenance: true
          sbom: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
```

- [ ] **Step 2: Verify the workflow YAML is syntactically valid**

Run: `python -c "import yaml; yaml.safe_load(open('.github/workflows/container.yml'))"`
Expected: exits 0, no exception.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/container.yml
git commit -m "ci: add container build with dual-arch boot-smoke gate and GHCR push"
```

---

### Task 26: Unraid CA template

**Files:**
- Create (in the sibling `unraid-apps` repo, NOT this repo — matching the single-CA-feed-repo house convention): `unraid-apps/ascii-supergenerator/ascii-supergenerator.xml`

**Interfaces:**
- Consumes: the published `ghcr.io/junkerderprovinz/ascii-supergenerator:latest` image (Task 25 — this task cannot be completed until Task 25 has actually pushed at least one image, since the CA install flow pulls it live).

- [ ] **Step 1: Create the CA template**, mirroring featherdrop's plain-container XML shape but with NO Data/Config Path Configs (this app is stateless — spec §3):

```xml
<?xml version="1.0"?>
<Container version="2">
  <Name>ascii-supergenerator</Name>
  <Repository>junkerderprovinz/ascii-supergenerator:latest</Repository>
  <Registry>https://hub.docker.com/r/junkerderprovinz/ascii-supergenerator</Registry>
  <Network>bridge</Network>
  <MyIP/>
  <Shell>sh</Shell>
  <Privileged>false</Privileged>
  <Support>https://github.com/junkerderprovinz/ascii-supergenerator/issues</Support>
  <Project>https://github.com/junkerderprovinz/ascii-supergenerator</Project>
  <Overview>Turns images into proportional-font-aware ASCII art, with a live interactive preview and TXT / XHTML / RTF / PNG export. Stateless - no volumes required.</Overview>
  <Category>Tools:</Category>
  <WebUI>http://[IP]:[PORT:3210]/</WebUI>
  <TemplateURL>https://raw.githubusercontent.com/junkerderprovinz/unraid-apps/main/ascii-supergenerator/ascii-supergenerator.xml</TemplateURL>
  <Icon>https://raw.githubusercontent.com/junkerderprovinz/unraid-apps/main/ascii-supergenerator/icon.png?v=1</Icon>
  <ExtraParams>--restart unless-stopped</ExtraParams>
  <Config Name="WebUI Port" Target="3210" Default="3210" Mode="tcp" Description="Port for the web UI" Type="Port" Display="always" Required="true" Mask="false">3210</Config>
</Container>
```

- [ ] **Step 2: Verify the XML is well-formed**

Run: `python -c "import xml.dom.minidom as m; m.parse('unraid-apps/ascii-supergenerator/ascii-supergenerator.xml')"`
Expected: exits 0, no exception.

- [ ] **Step 3: Commit** (in the `unraid-apps` repo)

```bash
git -C ../unraid-apps add ascii-supergenerator/ascii-supergenerator.xml
git -C ../unraid-apps commit -m "feat: add ascii-supergenerator CA template"
```

Note: the `<Icon>` URL will 404 until a logo exists and a matching `logo-rollout` pass adds `ascii-supergenerator/icon.png` to `unraid-apps` — out of scope for this plan (no logo has been designed yet; the working title itself is provisional per spec §8). Do not publish/announce this template until that happens.

---

## Post-plan notes (explicitly out of scope, not TODOs left dangling)

- Final product naming pass (spec §8) — deferred by explicit user instruction, revisit the name-forge shortlist (Trickwork recommended) once the tool is feature-complete.
- Headless/watch-folder batch mode for the container (spec §8) — plausible v2, no task here.
- Persisting last-used parameter settings in `localStorage` (spec §8) — nice-to-have, no task here.
- Logo design and the `logo-rollout` skill pass — blocks only Task 25's `<Icon>` URL and CA feed publication, not the app itself.
