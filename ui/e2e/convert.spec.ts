// ui/e2e/convert.spec.ts
import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ui/package.json has "type": "module", so this file runs as ESM under
// Playwright's test runner and __dirname is not defined; derive it from
// import.meta.url instead.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Nav items are plain buttons (real page-navigation semantics via
// aria-current, not the ARIA tabs pattern - see sidebarNav.ts). Only two
// exist now (Convert/Settings) - every generation-affecting card (Adjust/
// Transform/Filters/Queue/Export) lives on the Convert page simultaneously,
// never gated behind a nav click.
function nav(page: import('@playwright/test').Page, name: string) {
  return page.getByRole('button', { name, exact: true })
}

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

  const fileInput = page.locator('input[type="file"]')
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

  await expect(nav(page, 'Convert')).toBeVisible()
  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()

  await nav(page, 'Settings').click()

  // The entire Convert workspace - preview, Import, every generation card -
  // is hidden while Settings is active (sidebarNav.ts toggles display:none,
  // it doesn't remove the DOM, so toBeHidden() is the correct check here,
  // not toHaveCount(0) - the nodes still exist, just aren't rendered).
  await expect(page.getByText('Width (columns)', { exact: true })).toBeHidden()
  await expect(page.locator('canvas.preview-canvas')).toBeHidden()
  await expect(page.getByText('Shape', { exact: true })).toBeVisible()

  await nav(page, 'Convert').click()
  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()
  await expect(page.getByText('Shape', { exact: true })).toBeHidden()
})

test('switching language updates nav labels and every card, including ones on the other page', async ({ page }) => {
  await page.goto('/')

  await expect(nav(page, 'Convert')).toBeVisible()
  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()

  await nav(page, 'Settings').click()
  await page.getByLabel('Language').selectOption('de')

  // "Convert" -> "Konvertieren" and "Settings" -> "Einstellungen" are
  // genuinely distinct strings between the two languages - real positive
  // proof the switch propagated to the nav rail itself.
  await expect(nav(page, 'Convert')).toHaveCount(0)
  await expect(nav(page, 'Konvertieren')).toBeVisible()
  await expect(nav(page, 'Einstellungen')).toBeVisible()

  // The Convert page's cards were not showing during the switch - proves an
  // already-mounted but hidden (display:none) view's DOM updates too, not
  // just the currently visible one.
  await nav(page, 'Konvertieren').click()
  await expect(page.getByText('Breite (Spalten)', { exact: true })).toBeVisible()
})
