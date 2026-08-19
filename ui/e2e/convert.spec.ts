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
  await page.getByRole('button', { name: '90°' }).click()
  await page.getByLabel('Invert colors').check()
  await page.getByLabel('Color output').check()

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

test('the character-set ramp is directly editable: remove a tile, add a character', async ({ page }) => {
  await page.goto('/')

  const removeAt = page.getByRole('button', { name: 'Remove "@" from the character set' })
  await expect(removeAt).toBeVisible()
  await removeAt.click()
  await expect(removeAt).toHaveCount(0)

  // Editing the ramp away from any preset's exact contents flips the preset
  // picker to "custom". exact:true matters here - Playwright's getByLabel
  // does a case-insensitive substring match by default, and every tile's own
  // aria-label ("Remove ... from the character set") contains this same
  // text, so a loose match resolves to 11 elements instead of one.
  await expect(page.getByLabel('Character set', { exact: true })).toHaveValue('custom')

  const addInput = page.getByPlaceholder('Add characters…')
  await addInput.fill('&')
  await addInput.press('Enter')
  await expect(page.getByRole('button', { name: 'Remove "&" from the character set' })).toBeVisible()
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
