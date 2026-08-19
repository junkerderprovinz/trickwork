# TrickWork v1.1 — ASCGen2 Parity + i18n + Settings Restyle — Design Spec

**Status:** Approved by jdp across two scoping rounds (2026-08-19). This spec documents the decisions already made and the technical approach for the two genuinely open architectural questions (colour mode, dithering).

## 1. Purpose

After reviewing the live v1 app, jdp flagged three concrete gaps against the original ASCGen2-parity goal and the established GlimStone sibling-app pattern:

1. The Appearance-settings panel (Shape/Theme/Accent, built in the previous session) is a one-off visual invention that doesn't match BombVault's or CannonadeCommand's actual control styling.
2. TrickWork has none of ASCGen2's real image-processing menu (rotate/flip, invert, dithering, sharpening, colour output) — verified against ASCGen2's actual C# source (`github.com/jason-jxc/Ascii-Generator-2`), not assumed.
3. TrickWork has no language switching at all, while BombVault ships a full 26-locale i18n system.

## 2. Decisions locked (via two AskUserQuestion rounds, 2026-08-19)

- **Settings panel:** keep the full GlimStone axis set (Shape + Theme incl. System + Accent + — new — Language), but restyle the controls to match BombVault's actual visual language: circle swatches with a border-colour highlight ring on the active preset (not a box-shadow ring), a native `<input type="color">`, and a plain-text "Reset" link — not the invented pill-segmented-row look built previously.
- **ASCGen2 parity, three feature clusters approved:**
  - (a) Image transforms: rotate 90°/180°/270°, flip horizontal/vertical — applied to the source image before conversion.
  - (b) Filters: invert, dithering, sharpening (None / Sharpen / Unsharp Mask).
  - (c) Colour output mode.
  - Explicitly **not** wanted: a separate batch-conversion dialog (the existing sidebar queue already covers batch).
- **Colour scope, verified against ASCGen2's own `OutputCreator.cs`:** `CreateHtml()` and `CreateRtf()` both accept an optional `Color[][]`; plain-text creation has no colour parameter at all. **TXT export stays glyph-only, always** — documented in-UI exactly like the existing "RTF is always monospace" note. XHTML, RTF, and PNG get colour.
- **Language switcher location:** inside the Appearance-settings card, as the fourth GlimStone user-owned axis (Shape/Theme/Accent/Language), not a separate header control — matches `docs/design-language.md`'s own axis list and keeps all "applied once at the app root" controls in one place.
- **i18n breadth:** the same 26 locales BombVault ships (en + de inline as source-of-truth, 24 more lazy-loaded), not a smaller starter set.

## 3. Architecture

### 3.1 Colour mode

`CharCell` (in `core/src/types.ts`) gains an optional field:

```ts
export interface CharCell {
  char: string
  font: FontSpec
  color?: { r: number; g: number; b: number }
}
```

`MappingOptions` gains `color: boolean` (default `false` — fully additive, no change to the 26 existing tests when unset).

`core/src/mapping.ts` gains `computeBlockAverageColor(imageData, x, y, w, h): {r,g,b}`, mirroring `computeBlockLuminance`'s exact loop shape (same block bounds, same iteration), returning the mean R/G/B instead of the luma-weighted sum. `grid.ts`'s `assembleGrid` calls it only when `options.color` is true, attaching the result to the cell — the extra pass is skipped entirely when colour is off, so the hot slider-drag path is unaffected by default.

Rendering/export changes, one file at a time:

- **`renderGridToCanvas.ts`** — per cell, `ctx.fillStyle = cell.color ? rgbToCss(cell.color) : options.foreground` instead of always `options.foreground`. `toImage.ts` gets colour for free through this (it already calls `renderGridToCanvas`), and so does the live preview canvas.
- **`toXHTML.ts`** — when the grid carries colour, walk each row and group consecutive cells that share the same colour into one `<span style="color:#rrggbb">…</span>` run (never one span per character) — the same run-length approach `OutputCreator.CreateHtml()` uses (`characterToColor[y][x] = -1` when a cell matches its predecessor's colour). When the grid carries no colour (existing callers, existing tests), emit the exact current single flat-`<pre>` output unchanged.
- **`toRTF.ts`** — when coloured, build a `\colortbl` of the grid's unique colours and prefix each same-colour run with `\cfN` (same run-length grouping as XHTML). Uncoloured grids keep the current colour-table-less output byte-for-byte.
- **`toText.ts`** — untouched. No colour parameter, ever.

UI: a single "Colour" toggle in the Controls card (a checkbox styled like the rest of `.control-slider`), sitting alongside the existing brightness/contrast/charset/font controls — not a separate "mode" surface. A note next to the TXT export button (mirroring the existing RTF-monospace note): *"TXT export is always plain text — colour is not carried. Use XHTML, RTF, or PNG for coloured output."*

### 3.2 Image transforms (rotate / flip / invert / sharpen)

New module `core/src/filters.ts`, pure functions on `ImageData`, mirroring ASCGen2's own separation of these into standalone filter classes (`Filters/Flip.cs`, `Filters/Sharpen.cs`, `Filters/UnsharpMask.cs`) rather than folding them into the mapping loop:

```ts
export function invertImage(imageData: ImageData): ImageData
export function rotateImage(imageData: ImageData, degrees: 0 | 90 | 180 | 270): ImageData
export function flipImage(imageData: ImageData, horizontal: boolean, vertical: boolean): ImageData
export function sharpenImage(imageData: ImageData, method: 'none' | 'sharpen' | 'unsharp'): ImageData
```

- `invertImage` — `255 - channel` per pixel.
- `rotateImage` — 90°/270° swap width and height; 180° is a simple reverse. Pure geometry, no interpolation needed (axis-aligned only, matching ASCGen2's own menu which only offers these three angles, never an arbitrary one).
- `flipImage` — mirror across the relevant axis.
- `sharpenImage('sharpen')` — standard 3×3 convolution kernel `[[0,-1,0],[-1,5,-1],[0,-1,0]]`.
- `sharpenImage('unsharp')` — box-blur the image, then `output = original + amount * (original - blurred)`, clamped to `[0,255]`. Standard unsharp-mask formulation; ASCGen2's own `Filters/UnsharpMask.cs` implements the same well-known algorithm, so no source-level porting is needed, just the conventional approach.

`MappingOptions` gains `rotate: 0 | 90 | 180 | 270`, `flipHorizontal: boolean`, `flipVertical: boolean`, `invert: boolean`, `sharpen: 'none' | 'sharpen' | 'unsharp'` (all defaulting to no-op values, so every existing test and call site is unaffected until a UI control sets one).

New shared helper `core/src/pipeline.ts`:

```ts
export function applyImageFilters(imageData: ImageData, options: MappingOptions): ImageData
```

Applies rotate → flip → invert → sharpen in that fixed order (matching ASCGen2's own Edit menu ordering: Input transforms — rotate/flip — before Output transforms — invert/stretch/sharpen). Both `preview.ts` and `exportPanel.ts` call this ONE helper before `assembleGrid` (avoids the exact "two independently-reimplemented call sites" class of bug the whole-branch review caught earlier this project). `item.imageData` in `state.ts`'s `BatchItem` stays the pristine decoded source forever — the filter pipeline runs fresh from the options on every render/export, exactly like brightness/contrast already do, so toggling a transform on and off never accumulates lossy re-application.

Perf: all four operations are single-pass or 3×3-kernel O(W×H) work on an image already capped at `MAX_WORKING_DIMENSION = 1600` by `ingest.ts` — within the existing "no perceptible slider lag" budget, but the exact combined cost (all four chained on every keystroke) gets a real check during implementation, same deferral pattern the original spec used for the downscale threshold.

### 3.3 Dithering

Unlike the four filters above, dithering is **not** a pre-mapping pixel filter — it has to run inside `assembleGrid`'s own raster-order cell loop, because it diffuses the *character-selection* quantization error (target luminance vs. the ink coverage of the glyph actually chosen) to neighbouring cells, not raw pixel error. This is standard Floyd–Steinberg error diffusion applied to the ASCII grid instead of a pixel bitmap:

```
for each cell in raster order (row-major):
  target = post-brightness/contrast luminance + accumulated diffused error
  char = mapLuminanceToChar(target, table)
  achieved = the inkCoverage-derived luminance of the chosen char
  error = target - achieved
  diffuse error to: right (7/16), below-left (3/16), below (5/16), below-right (1/16)
```

`MappingOptions` gains `dither: boolean` (default `false`). When on, `assembleGrid` keeps a mutable `Float64Array` of per-cell accumulated error alongside its existing loop instead of calling `mapLuminanceToChar` directly per cell — same public function, called from inside the new diffusion bookkeeping rather than replaced.

### 3.4 i18n

BombVault's `i18n.ts` is React-Context-based (`createContext`/`useState`) — TrickWork's `ui/` has no React (vanilla TS, DOM built directly, reactivity via `Store`'s `Set<Listener>` + `notify()` in `state.ts`). The equivalent for this codebase:

New `ui/src/i18n.ts`:

- `en` (English) as an inline `const` object — the source-of-truth key set. `type TranslationKey = keyof typeof en`.
- `de` also inline (mirrors BombVault: the two most-likely languages ship in the main bundle, never lazy-loaded).
- 24 more locale files under `ui/src/locales/<code>.ts`, each `export default` a `Partial<Record<TranslationKey, string>>`, loaded via `import('./locales/xx')` — dynamic, not eager, matching the lazy-load-locale-chunks precedent (a prior project's main bundle grew ~150kB from eager-importing all locales).
- Module-level `currentLocale` + a `Set<() => void>` of subscribers with its own `subscribeLocale()`/`notifyLocale()` — a second, independent reactive source alongside `Store`, not merged into `AppState` (image-conversion state and UI-language state are unrelated concerns; merging them would make every language change trigger a re-run of the conversion pipeline for no reason).
- `t(key: TranslationKey): string` — synchronous, reads the active dictionary, falling back to `en` for any key the active locale hasn't got (this is also what the parity test enforces should never actually happen for a complete locale).
- `setLocale(code: string): Promise<void>` — dynamically imports the target locale (no-op re-import if already cached this session), swaps the active dictionary, calls `notifyLocale()`. Until the import resolves, `t()` keeps returning the *previous* language's strings (not English, not raw keys) — same behaviour BombVault's own lazy-loading already documents.
- `LOCALES: {code: string; label: string; flag: string}[]` — the identical 26-entry list BombVault ships (`en`, `de`, `fr`, `es`, `it`, `pt`, `nl`, `pl`, `ru`, `uk`, `cs`, `sv`, `da`, `fi`, `no`, `tr`, `el`, `hu`, `ro`, `ja`, `ko`, `zh`, `ar`, `he`, `th`, `vi`).

Every existing UI-module `mount*()` function that currently hardcodes an English label (eyebrows, button text, empty-state copy, the RTF/TXT notes) switches to `t('some.key')`, and each such module additionally calls `subscribeLocale(rerenderLabels)` so a language change updates already-mounted UI without a page reload — following the same "each module owns its own reactive re-render" pattern `queue.ts`/`preview.ts` already use for `Store`.

Translation execution follows the house i18n conventions exactly (from prior BombVault incidents, directly applicable here):

- All 26 locales get every new key in the **same change** — never an English-only fallback with a "translate later" gap.
- The actual translation writing is done directly (not delegated to a sub-agent that might not commit).
- A parity test (`ui/src/i18n.parity.test.ts`) asserts every locale file's key set exactly matches `en`'s.

### 3.5 Settings-panel restyle

`ui/src/appearanceSettings.ts` (built previous session) gets restyled, not re-architected:

- Accent: replace the current filled square-ish swatch buttons with circles (`border-radius: 50%`) using a `border` colour-highlight on the active one (mirroring BombVault's `Settings.tsx` accent swatches almost exactly — `border-color: var(--carbon-text)` when active, `var(--carbon-border)` otherwise) instead of the current `box-shadow` ring. Native `<input type="color">` stays (already matches BombVault's own approach). "Reset to default" becomes a plain text link (already close; drop the button chrome).
- Shape and Theme: keep GlimStone's fuller spec (Shape has no BombVault precedent to match since BV doesn't have the axis at all; Theme keeps the System option BV's simpler dark/light toggle lacks) — but restyle the segmented row itself to read as a toggle-group rather than three isolated pill buttons: shared container with an inset well background, the active segment as a solid fill, closer to how a real toggle-switch group reads.
- Language: new fourth row, using `LOCALES` — a flag-icon dropdown or a compact flag row (implementation detail to resolve during the plan, following whichever of BombVault's own two patterns — the sidebar-footer language switcher — reads best inside a settings-panel row rather than a sidebar footer, since TrickWork has no sidebar).

## 4. Data flow (additions to the existing v1 flow)

1. User adjusts a transform/filter/colour control → `MappingOptions` updates in the `Store` exactly like brightness/contrast already do.
2. `preview.ts` and `exportPanel.ts` both call the new `applyImageFilters(item.imageData, options)` to get a transformed `ImageData`, then hand that (not the raw stored one) to `assembleGrid`.
3. `assembleGrid` additionally threads `options.color` (attaches per-cell colour) and `options.dither` (runs the Floyd–Steinberg diffusion loop instead of the plain per-cell lookup) through to grid construction.
4. Export serializers read `cell.color` when present; unchanged when absent.
5. Language changes go through the separate `i18n.ts` subscription, independent of steps 1–4 — never triggers a re-render of the conversion pipeline.

## 5. Error handling

- Rotate/flip/sharpen/invert are pure, total functions on valid `ImageData` — no new failure modes beyond what `ingest.ts` already guards (corrupt/unsupported files already fail before reaching this stage).
- A locale chunk failing to load (network blip in a container context) keeps the UI in the previously-active language and surfaces nothing destructive — `t()` never throws, it falls back.

## 6. Testing

- **Unit tests (Vitest):** `computeBlockAverageColor` (known synthetic block → exact expected RGB), each of the four `filters.ts` functions (rotate/flip/invert on a small synthetic `ImageData`, exact expected pixel values; sharpen/unsharp against a known input → known-shape output, not exact pixel match given kernel float rounding), the Floyd–Steinberg diffusion path in `assembleGrid` (a synthetic gradient that should visibly dither vs. the same input undithered), `toXHTML`/`toRTF`'s coloured-run-grouping (assert consecutive same-colour cells produce ONE span/`\cfN`, not one per cell), and the i18n parity test (all 26 locales, exact key-set match against `en`).
- **E2E (Playwright):** extend the existing smoke test to also toggle one transform, one filter, and colour mode, and assert the preview/export still produce non-empty output; a minimal language-switch check (switch to `de`, assert a known label changed).

## 7. Open questions (deferred to plan/implementation time, not blocking)

- Exact language-switcher control shape inside the settings card (flag dropdown vs. flag row) — a plan-time UI decision, not architectural.
- Exact sharpen/unsharp kernel *amount* defaults — tuned during implementation against real preview output, same as the original spec deferred the downscale threshold.
- Whether the combined filter pipeline needs a preview-time debounce if it turns out too slow on a 1600px image during rapid slider drags — deferred pending a real perf check.
