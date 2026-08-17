# ASCII SuperGenerator (working title) — Design Spec

**Status:** Approved by jdp (design), final product name deferred to a later naming pass.

## 1. Purpose

Revive the niche left behind by **ASCGen2** (SourceForge, C#/.NET, GPLv2, last updated 2015 — dead). ASCGen2's differentiator was a combination no actively-maintained modern tool matches:

- **Proportional/variable-width font-aware character mapping** — characters are chosen not just by brightness but by how much visual "ink" they cover at the selected font, so the output reads correctly even with a non-monospace font.
- **Real-time interactive preview** — parameters (brightness, contrast, character set, output width, font) are adjusted with immediate visual feedback, no re-render delay.
- **Multi-format export** — TXT, XHTML, RTF, and rendered image (PNG).

Verified via research (2026-08-17): chafa, ascii-image-converter, jp2a, and img2txt/libcaca are all actively maintained but CLI-only, monospace-only, and offer none of the three differentiators above. No modern tool fills this gap.

## 2. Non-goals (v1)

- No video/webcam capture (ASCGen2 never had this either).
- No server-side persistence, accounts, or multi-user features — the tool is stateless, single-session, one operator at a time.
- No cloud/SaaS hosting — self-hosted container or local desktop binary only.

## 3. Architecture

**Chosen approach ("Ansatz B"):** a single TypeScript/Canvas web application is the *only* place the conversion algorithm lives. It is packaged two ways, with no server-side business logic duplicated anywhere:

```
                    ┌─────────────────────────┐
                    │   core/ + ui/ (TS/Canvas) │
                    │   THE web app - all logic │
                    │   lives here, exactly once │
                    └───────────┬─────────────┘
                                │ built once, embedded twice
              ┌─────────────────┴─────────────────┐
              ▼                                     ▼
   ┌─────────────────────┐              ┌─────────────────────────┐
   │   desktop/ (Wails)   │              │   container/ (Go)        │
   │  Go + native webview  │              │  Go static-file server   │
   │  → 3 portable binaries│              │  → Docker image + Unraid │
   │  (Win/Linux/macOS)     │              │     CA template          │
   └─────────────────────┘              └─────────────────────────┘
```

Rationale for rejecting the alternative ("Ansatz A" — Go core + two wrappers): would require reimplementing the conversion algorithm in Go *and* keeping a live-preview-capable copy in the browser anyway (the live slider feedback loop cannot round-trip to a server without perceptible lag), meaning the algorithm would need to be written and kept in sync in two languages. Ansatz B has exactly one implementation.

The tool needs no database and no persistent state: every operation is "load an image (or several), adjust, export" — there is nothing to remember between sessions beyond browser-local UI preferences (last-used settings), which is out of scope for v1.

## 4. Components

### `core/` — the conversion engine (TypeScript, framework-free, unit-testable in isolation)

- **Image ingestion:** decode via the browser's Canvas API (`createImageBitmap` / `drawImage`), downscale automatically if the image exceeds a maximum working dimension (keeps the live-preview loop fast; see §6).
- **Font-width table:** for the selected font, measure (via `CanvasRenderingContext2D.measureText` and/or an offscreen glyph-coverage render) the effective visual "ink" width/coverage of each candidate character in the active character set. This table is the actual differentiator — it is what lets the mapping account for a character's *rendered* width and density rather than assuming monospace.
- **Block-to-character mapping:** for each sample block of the source image, compute average luminance (and optionally local contrast/edge information for a sharper mapping), then pick the character from the font-width table whose ink coverage best matches — this is the proportional-width-aware step ASCGen2 was known for.
- **Grid assembly:** produce a 2D character grid plus enough metadata (per-cell font, color if a color mode is later added) to render a preview and to serialize to every export format.
- **Export serializers:** pure functions, one per format:
  - `toText(grid): string` — plain TXT.
  - `toXHTML(grid, options): string` — a `<pre>`-based XHTML document with inline styling.
  - `toRTF(grid, options): string` — RTF document (monospace run of the same characters; RTF has no reliable way to declare arbitrary proportional fonts across readers, so RTF export always renders in a monospace font regardless of the font chosen for the on-screen/image preview — call this out in the UI so it isn't a surprise).
  - `toImage(grid, options): canvas → PNG blob` — re-renders the character grid onto an offscreen canvas using the actual chosen font, then exports as PNG. This is the one export format that can faithfully reproduce a non-monospace/proportional look, since TXT/XHTML/RTF all ultimately depend on the *viewer's* font rendering.

All of the above are pure functions operating on plain data (no DOM, no global state), so they are directly unit-testable with Vitest.

### `ui/` — the interactive web application (TypeScript, thin framework or framework-free; final choice at implementation time)

- Image drop-zone / file picker (supports selecting multiple files for batch mode).
- Live preview canvas, re-rendered on every parameter change.
- Parameter controls: brightness, contrast, character set (selectable presets + custom), output width (columns), font choice (from a small bundled set of common monospace *and* proportional fonts, since proportional-font handling is the whole point).
- Batch queue view: thumbnail list of loaded images with per-item status (pending / converted / exported / error), so one bad file doesn't block the rest (see §6).
- Export panel: pick format(s), trigger download.

### `desktop/` — Wails wrapper (Go)

- Embeds the built `ui/` bundle (Vite or equivalent build output) into a Wails app.
- No custom Go business logic beyond what Wails itself needs (window chrome, file-system save-dialogs for export, since a native save dialog is nicer than a browser download prompt when running as a desktop app).
- Cross-compiled to three portable, single-file binaries: Windows, Linux, macOS — matching the KnightLoader precedent (Go + Wails).

### `container/` — Docker + Unraid packaging (Go)

- A minimal Go HTTP server whose only job is serving the same built `ui/` bundle as static files. No API endpoints, no backend logic — the browser tab does 100% of the work, identically to the desktop build's embedded webview.
- Dockerfile + Unraid Community Applications template (`.xml`), matching the house pattern for every other self-hosted tool (BombVault, ShipLog, etc.) — even though this one has no volumes to speak of beyond, optionally, a folder for batch input/output if that turns out to be convenient for headless/Unraid use (open question, see §8).

## 5. Data flow

1. User drops/selects one or more images.
2. For the *active* image, `core/` decodes it, downscales if needed, and runs the block-to-character mapping using the current parameter values and the font-width table for the selected font.
3. `ui/` renders the resulting grid live onto the preview canvas.
4. User adjusts any parameter (slider, dropdown) → step 2 re-runs for the active image only → preview updates. Target: no perceptible lag (well under a video-frame's worth of delay) for typical photo sizes after downscaling.
5. User picks an export format (or several) → the matching serializer in `core/` runs → file(s) offered for download (browser) or a native save dialog (desktop, via Wails' Go-side file APIs).
6. In batch mode, steps 2–5 run per queued image; the currently-*previewed* image is whichever one is selected in the queue, but export can target "this one" or "all queued."

## 6. Error handling

- **Corrupt/unsupported image file:** the specific file is marked `error` in the batch queue with a short reason; nothing else in the queue is affected; single-image mode shows the same message inline.
- **Very large images:** automatically downscaled to a maximum working dimension before the live-preview loop starts (exact threshold to be tuned during implementation against real-world "flush the slider fast" testing); the UI notes that downscaling happened. A future "process at full resolution just for the final export" toggle is a plausible v2 addition, not required for v1.
- **RTF font limitation:** documented in-UI (see §4, `toRTF`) rather than treated as a bug — RTF viewers cannot reliably honor an arbitrary proportional font, so RTF export is always monospace by design, and the UI should say so rather than silently producing a result that looks different from the live preview.
- **Batch partial failure:** the export step never aborts the whole batch because one item errored; a summary at the end reports how many succeeded/failed.

## 7. Testing

- **Unit tests (Vitest):** the `core/` module is pure functions on plain data — test the font-width table construction, the block-to-character mapping (given a known small synthetic image and a known font-width table, assert the exact expected character grid), and each export serializer (snapshot or exact-string assertions for TXT/XHTML/RTF; a PNG byte-diff or dimension/pixel-sample check for `toImage`).
- **E2E smoke test (Playwright):** load the app → drop a small fixture image → assert ASCII output appears in the preview → trigger a TXT export → assert a file download occurs with non-empty, expected-shaped content. Mirrors the house convention already used elsewhere (BombVault, etc.).
- **Boot-smoke CI:** the container image must actually start and serve the UI (HTTP 200 on the root path) in CI, matching the existing convention (`ci-boot-smoke-gate`). The desktop build should be confirmed to actually build successfully for all three target platforms in CI; a full GUI smoke test of the native Wails window is not required for v1 (out of scope — no established house pattern for that yet either).

## 8. Open questions (deferred, not blocking implementation start)

- Final product name (deferred per jdp's explicit instruction — working title "ASCII SuperGenerator" until a dedicated naming pass at the end). Name-forge research already produced a verified-clear shortlist (Trickwork *recommended*, Escutcheon, Inkhorn, Emblazoner, Pursuivant) to revisit then.
- Whether the container variant should also support a headless/watch-folder batch mode (convert everything dropped into a mounted folder, no browser interaction) for Unraid users who want pure automation — plausible v2, not required for v1's interactive-first scope.
- Exact bundled font set (which monospace and which proportional fonts ship by default) — an implementation-time decision, not architectural.
- Whether to persist last-used parameter settings in `localStorage` (desktop) — nice-to-have, not required for v1.

## 9. Repo structure (working layout, local path `d:\nextcloud\it\github\ascii-supergenerator`)

```
ascii-supergenerator/
├── core/           # TS conversion engine, framework-free, unit tested
├── ui/             # TS web app (drop zone, live preview, controls, batch queue, export)
├── desktop/        # Wails Go wrapper → 3 portable binaries
├── container/      # Go static-file server + Dockerfile + Unraid CA template
├── docs/
│   └── superpowers/
│       ├── specs/  # this file
│       └── plans/  # implementation plan (next step)
├── LICENSE
└── README.md
```
