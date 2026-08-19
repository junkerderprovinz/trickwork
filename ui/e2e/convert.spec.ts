// ui/e2e/convert.spec.ts
import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ui/package.json has "type": "module", so this file runs as ESM under
// Playwright's test runner and __dirname is not defined; derive it from
// import.meta.url instead.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// TrickWork deliberately skips GlimStone's own sidebar pattern (design-
// language.md, "The sidebar") - a single square corner badge toggles between
// Convert (every generation-affecting card visible together, never gated
// behind a click) and Settings instead, per the lightweight-alternative
// GlimStone documents for a genuinely simple, single-workspace app. The
// badge's accessible name flips between "Settings" and "Back" (translated)
// depending on which view is showing - located by its stable class instead
// of a name regex, since a regex written for the English strings stops
// matching the instant a locale switch changes the label underneath it.
function settingsBadge(page: import('@playwright/test').Page) {
  return page.locator('.settings-badge')
}

test('drop an image, see ASCII output, export as TXT', async ({ page }) => {
  await page.goto('/')

  // Scoped to the image dropzone's own accept attribute - the Settings
  // page's presets-import file input also matches a bare input[type="file"]
  // now, even while hidden behind display:none (both views stay mounted).
  const fileInput = page.locator('input[type="file"][accept="image/*"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))

  const canvas = page.locator('canvas.preview-canvas')
  await expect(canvas).toBeVisible()
  await expect
    .poll(async () => {
      const box = await canvas.boundingBox()
      return box ? box.width > 0 : false
    })
    .toBe(true)

  // No nav click needed - the Export card is always visible beside the preview.
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export active image as TXT' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toContain('.txt')
  const streamPath = await download.path()
  expect(streamPath).not.toBeNull()
})

test('rotate, invert, and color output all still produce a non-empty preview and export', async ({ page }) => {
  await page.goto('/')

  // Scoped to the image dropzone's own accept attribute - the Settings
  // page's presets-import file input also matches a bare input[type="file"]
  // now, even while hidden behind display:none (both views stay mounted).
  const fileInput = page.locator('input[type="file"][accept="image/*"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))

  const canvas = page.locator('canvas.preview-canvas')
  await expect(canvas).toBeVisible()

  // Transform and Filters are their own always-visible cards now, not
  // separate nav destinations - interact directly, no nav click first.
  // Invert/Color are icon-only toggle buttons (not checkboxes), so a click
  // toggles them - their accessible name comes from the button's own
  // title/aria-label, not adjacent label text.
  await page.getByRole('button', { name: '90°' }).click()
  await page.getByRole('button', { name: 'Invert colors' }).click()
  await page.getByRole('button', { name: 'Color output' }).click()

  await expect
    .poll(async () => {
      const box = await canvas.boundingBox()
      return box ? box.width > 0 && box.height > 0 : false
    })
    .toBe(true)

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export active image as PNG' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('.png')
})

test('Ctrl+Z undoes a rotate, Ctrl+Y redoes it', async ({ page }) => {
  await page.goto('/')

  // exact: true matters here - "0°" is a substring of "90°"/"180°"/"270°"
  // too, so a loose match resolves to all four rotate buttons.
  const rotate90 = page.getByRole('button', { name: '90°', exact: true })
  const rotate0 = page.getByRole('button', { name: '0°', exact: true })
  await expect(rotate0).toHaveClass(/segmented-button--active/)

  await rotate90.click()
  await expect(rotate90).toHaveClass(/segmented-button--active/)

  await page.keyboard.press('Control+z')
  await expect(rotate0).toHaveClass(/segmented-button--active/)

  await page.keyboard.press('Control+y')
  await expect(rotate90).toHaveClass(/segmented-button--active/)
})

test('undo/redo header buttons reflect history state and a dragged slider undoes as one step', async ({
  page,
}) => {
  await page.goto('/')

  const undoButton = page.getByRole('button', { name: 'Undo' })
  const redoButton = page.getByRole('button', { name: 'Redo' })
  await expect(undoButton).toBeDisabled()
  await expect(redoButton).toBeDisabled()

  // Located via the stable label text, not getByLabel(full accessible name)
  // - the accessible name here also concatenates the live numeric readout
  // ("Width (columns) 120"), which changes on every keypress and would make
  // a name-based locator stop matching after the very first ArrowRight.
  const widthSlider = page
    .locator('.control-slider', { hasText: 'Width (columns)' })
    .locator('input[type="range"]')
  await widthSlider.focus()
  // Each arrow-key press is one 'input' tick within the same focus session -
  // gesture-aware history should collapse all of them into ONE undo step.
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
  await expect(widthSlider).toHaveValue('125')
  await expect(undoButton).toBeEnabled()

  await undoButton.click()
  await expect(widthSlider).toHaveValue('120')
  await expect(undoButton).toBeDisabled()
  await expect(redoButton).toBeEnabled()

  await redoButton.click()
  await expect(widthSlider).toHaveValue('125')
})

test('the character set field is plain, freely editable text - no click-to-delete tiles', async ({ page }) => {
  await page.goto('/')

  // Distinct accessible names on purpose (controls.ts) - "Character set
  // preset" for the dropdown, "Character set" for the actual text field -
  // so this locator can only ever match the field, never the select too.
  const charsetField = page.getByLabel('Character set', { exact: true })
  const presetSelect = page.getByLabel('Character set preset', { exact: true })
  await expect(charsetField).toHaveValue(' .:-=+*#%@')
  await expect(presetSelect).toHaveValue('standard')

  // A real "select all, type over it" edit, exactly like editing any other
  // text field - not a series of tile clicks.
  await charsetField.click()
  await charsetField.press('Control+a')
  await charsetField.pressSequentially('@%#')
  await expect(presetSelect).toHaveValue('custom')

  // Backspacing removes a character the normal way too, no click-to-delete
  // affordance involved.
  await charsetField.press('Backspace')
  await charsetField.blur()
  // On blur the field redraws from the deduped canonical charset ("@%").
  await expect(charsetField).toHaveValue('@%')
})

test('a closed select answers the mouse wheel without opening', async ({ page }) => {
  await page.goto('/')

  const fontSelect = page.getByLabel('Font')
  const before = await fontSelect.inputValue()
  await fontSelect.hover()
  await page.mouse.wheel(0, 100)
  const after = await fontSelect.inputValue()
  expect(after).not.toBe(before)
  // Scrolling changed the value directly - it never needed a click to open first.
})

test('Settings replaces the whole page: no preview, no working cards', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()
  const badge = settingsBadge(page)
  await expect(badge).toHaveAccessibleName('Settings')

  await badge.click()

  // The entire Convert workspace - preview, Import, every generation card -
  // is hidden while Settings is active (main.ts toggles display:none, it
  // doesn't remove the DOM, so toBeHidden() is the correct check here, not
  // toHaveCount(0) - the nodes still exist, just aren't rendered).
  await expect(page.getByText('Width (columns)', { exact: true })).toBeHidden()
  await expect(page.locator('canvas.preview-canvas')).toBeHidden()
  await expect(page.getByText('Shape', { exact: true })).toBeVisible()
  await expect(badge).toHaveAccessibleName('Back')
  // Version numbers live in Settings, never a persistent footer.
  await expect(page.getByText(/TrickWork v.* · GlimStone v/)).toBeVisible()

  await badge.click()
  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()
  await expect(page.getByText('Shape', { exact: true })).toBeHidden()
  await expect(badge).toHaveAccessibleName('Settings')
})

test('switching language updates the badge label and every card, including ones on the other page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()

  const badge = settingsBadge(page)
  await badge.click()
  await page.getByLabel('Language').selectOption('de')

  // "Settings" -> "Einstellungen" is a genuinely distinct string between the
  // two languages - real positive proof the switch propagated to the badge.
  await expect(badge).toHaveAccessibleName('Zurück')

  // The Convert page's cards were not showing during the switch - proves an
  // already-mounted but hidden (display:none) view's DOM updates too, not
  // just the currently visible one.
  await badge.click()
  await expect(page.getByText('Breite (Spalten)', { exact: true })).toBeVisible()
  await expect(badge).toHaveAccessibleName('Einstellungen')
})

test('exporting then importing settings round-trips a change through a real JSON file', async ({ page }) => {
  await page.goto('/')

  const rotate90 = page.getByRole('button', { name: '90°', exact: true })
  const rotate0 = page.getByRole('button', { name: '0°', exact: true })
  await rotate90.click()
  await expect(rotate90).toHaveClass(/segmented-button--active/)

  await settingsBadge(page).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export settings' }).click()
  const download = await downloadPromise
  const exportedPath = await download.path()
  expect(exportedPath).not.toBeNull()

  // Change the setting again so the import below has something real to undo.
  await settingsBadge(page).click()
  await rotate0.click()
  await expect(rotate0).toHaveClass(/segmented-button--active/)
  await settingsBadge(page).click()

  await page.locator('input[type="file"][accept*="json"]').setInputFiles(exportedPath as string)
  await expect(page.getByText('Settings imported.')).toBeVisible()

  await settingsBadge(page).click()
  await expect(rotate90).toHaveClass(/segmented-button--active/)
})

test('a malformed settings file is rejected with an error, not a silent crash', async ({ page }) => {
  await page.goto('/')

  await settingsBadge(page).click()
  const badFile = {
    name: 'bad-preset.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ trickworkPreset: 1, options: { columns: -5 } })),
  }
  await page.locator('input[type="file"][accept*="json"]').setInputFiles(badFile)
  await expect(page.getByText('That file is not a valid TrickWork preset.')).toBeVisible()
})

test('preview zoom: buttons change the displayed canvas size and the label resets on a new image', async ({
  page,
}) => {
  await page.goto('/')

  const fileInput = page.locator('input[type="file"][accept="image/*"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))

  const canvas = page.locator('canvas.preview-canvas')
  await expect(canvas).toBeVisible()
  const zoomLabel = page.locator('.preview-zoom-label')
  await expect(zoomLabel).toHaveText('100%')
  const initialBox = await canvas.boundingBox()

  await page.getByRole('button', { name: 'Zoom in' }).click()
  await expect(zoomLabel).toHaveText('110%')
  const zoomedInBox = await canvas.boundingBox()
  expect(zoomedInBox?.width).toBeGreaterThan(initialBox?.width ?? 0)

  await zoomLabel.click()
  await expect(zoomLabel).toHaveText('100%')

  await page.getByRole('button', { name: 'Zoom out' }).click()
  await expect(zoomLabel).toHaveText('90%')

  // Switching the ACTIVE image (not just adding another to the queue -
  // addFiles never changes activeItemId once one is already set) resets the
  // zoom back to a predictable 100% rather than carrying over whatever the
  // previous image happened to be zoomed to. Upload the same fixture again
  // (a second, distinctly-id'd queue item under the same filename) and
  // select it explicitly.
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))
  await page.getByRole('button', { name: 'Preview small.png' }).last().click()
  await expect(zoomLabel).toHaveText('100%')
})

test('crop: dragging on the source image sets a selection that survives undo and Clear selection removes it', async ({
  page,
}) => {
  await page.goto('/')

  const fileInput = page.locator('input[type="file"][accept="image/*"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))

  const cropCanvas = page.locator('canvas.crop-source-canvas')
  await expect(cropCanvas).toBeVisible()
  const overlay = page.locator('.crop-overlay')
  await expect(overlay).toBeHidden()
  const clearButton = page.getByRole('button', { name: 'Clear selection' })
  await expect(clearButton).toBeHidden()

  const box = await cropCanvas.boundingBox()
  if (!box) throw new Error('crop canvas has no bounding box')
  // A real drag, well past the panel's own minimum-drag threshold, so this
  // reads as a deliberate selection rather than a stray click.
  await page.mouse.move(box.x + 5, box.y + 5)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6, { steps: 8 })
  await page.mouse.up()

  await expect(overlay).toBeVisible()
  await expect(clearButton).toBeVisible()

  // columns is a fixed option independent of crop, and a roughly
  // proportional crop leaves the sampled aspect ratio (and so the grid's
  // row count too) essentially unchanged - the reliable, meaningful check
  // here is the overlay's own visibility surviving undo/redo correctly,
  // not the preview canvas's pixel dimensions.
  await page.keyboard.press('Control+z')
  await expect(overlay).toBeHidden()

  await page.keyboard.press('Control+y')
  await expect(overlay).toBeVisible()

  await clearButton.click()
  await expect(overlay).toBeHidden()
  await expect(clearButton).toBeHidden()
})

test('crop: an existing selection can be moved and resized, not just redrawn from scratch', async ({ page }) => {
  await page.goto('/')

  const fileInput = page.locator('input[type="file"][accept="image/*"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))

  const cropCanvas = page.locator('canvas.crop-source-canvas')
  await expect(cropCanvas).toBeVisible()
  const overlay = page.locator('.crop-overlay')
  const box = await cropCanvas.boundingBox()
  if (!box) throw new Error('crop canvas has no bounding box')

  // Draw an initial selection roughly in the middle third of the canvas.
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.3)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6, { steps: 6 })
  await page.mouse.up()
  await expect(overlay).toBeVisible()
  const drawn = await overlay.boundingBox()
  if (!drawn) throw new Error('overlay has no bounding box after drawing')

  // Grab the INTERIOR (not a corner) and drag it - this should MOVE the
  // selection at its existing size, not start a brand new one.
  const interiorX = drawn.x + drawn.width / 2
  const interiorY = drawn.y + drawn.height / 2
  await page.mouse.move(interiorX, interiorY)
  await page.mouse.down()
  await page.mouse.move(interiorX + 20, interiorY + 15, { steps: 6 })
  await page.mouse.up()
  const moved = await overlay.boundingBox()
  if (!moved) throw new Error('overlay has no bounding box after moving')
  expect(Math.round(moved.width)).toBe(Math.round(drawn.width))
  expect(Math.round(moved.height)).toBe(Math.round(drawn.height))
  expect(moved.x).toBeGreaterThan(drawn.x + 10)
  expect(moved.y).toBeGreaterThan(drawn.y + 5)

  // Grab the bottom-right CORNER and drag it outward - this should RESIZE
  // (grow) the selection while its opposite (top-left) corner stays put.
  const cornerX = moved.x + moved.width
  const cornerY = moved.y + moved.height
  await page.mouse.move(cornerX, cornerY)
  await page.mouse.down()
  await page.mouse.move(cornerX + 25, cornerY + 20, { steps: 6 })
  await page.mouse.up()
  const resized = await overlay.boundingBox()
  if (!resized) throw new Error('overlay has no bounding box after resizing')
  expect(resized.width).toBeGreaterThan(moved.width + 10)
  expect(resized.height).toBeGreaterThan(moved.height + 8)
  // The top-left corner (the one NOT being dragged) stayed fixed.
  expect(Math.abs(resized.x - moved.x)).toBeLessThan(2)
  expect(Math.abs(resized.y - moved.y)).toBeLessThan(2)
})

test('rainbow mode gives each queue row its own hue, and the language picker shows flags', async ({ page }) => {
  await page.goto('/')

  // The language <select>'s own OPTIONS carry a flag-emoji prefix (a native
  // <option> can't hold an image/CSS background, see GlimStone's
  // design-language.md) - the closed select shows the selected option's own
  // text, flag included, with no extra wiring needed.
  await settingsBadge(page).click()
  const languageSelect = page.getByLabel('Language')
  const firstOptionText = await languageSelect.locator('option').first().textContent()
  // A flag emoji is two "regional indicator symbol" codepoints, both well
  // outside the Basic Multilingual Plane (> 0xFFFF) - a plain label
  // wouldn't have any character in that range at all.
  expect(Array.from(firstOptionText ?? '').some((ch) => (ch.codePointAt(0) ?? 0) > 0xffff)).toBe(true)

  await page.getByRole('button', { name: 'On', exact: true }).click()
  await settingsBadge(page).click()

  const fileInput = page.locator('input[type="file"][accept="image/*"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))

  const rows = page.locator('.queue-item')
  await expect(rows).toHaveCount(2)
  const hue0 = await rows.nth(0).evaluate((el) => (el as HTMLElement).style.getPropertyValue('--item-hue'))
  const hue1 = await rows.nth(1).evaluate((el) => (el as HTMLElement).style.getPropertyValue('--item-hue'))
  expect(hue0).not.toBe('')
  expect(hue1).not.toBe('')
  expect(hue0).not.toBe(hue1)
})
