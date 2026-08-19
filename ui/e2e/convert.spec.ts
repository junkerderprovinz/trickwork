// ui/e2e/convert.spec.ts
import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ui/package.json has "type": "module", so this file runs as ESM under
// Playwright's test runner and __dirname is not defined; derive it from
// import.meta.url instead.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

  await page.getByRole('tab', { name: 'Export' }).click()
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

  await page.getByRole('tab', { name: 'Transform' }).click()
  await page.getByRole('button', { name: '90°' }).click()

  await page.getByRole('tab', { name: 'Filters' }).click()
  await page.getByLabel('Invert colors').check()
  await page.getByLabel('Color output').check()

  await expect
    .poll(async () => {
      const box = await canvas.boundingBox()
      return box ? box.width > 0 && box.height > 0 : false
    })
    .toBe(true)

  await page.getByRole('tab', { name: 'Export' }).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export active image as PNG' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('.png')
})

test('switching language updates tab labels and the active panel', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('tab', { name: 'Adjust', exact: true })).toBeVisible()
  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()

  await page.getByRole('tab', { name: 'Appearance', exact: true }).click()
  await page.getByLabel('Language').selectOption('de')

  // "Adjust" -> "Anpassen" and "Queue" -> "Warteschlange" are genuinely
  // distinct strings between the two languages - real positive proof the
  // switch propagated to the tab bar itself (always visible, regardless of
  // which panel is active).
  await expect(page.getByRole('tab', { name: 'Adjust', exact: true })).toHaveCount(0)
  await expect(page.getByRole('tab', { name: 'Anpassen', exact: true })).toBeVisible()
  await expect(page.getByRole('tab', { name: 'Warteschlange', exact: true })).toBeVisible()

  // Queue was never the active tab during the switch - proves an
  // already-mounted but hidden (display:none) panel's DOM updates too, not
  // just the currently visible one.
  await page.getByRole('tab', { name: 'Warteschlange', exact: true }).click()
  await expect(page.getByText('Noch keine Bilder.', { exact: true })).toBeVisible()

  await page.getByRole('tab', { name: 'Anpassen', exact: true }).click()
  await expect(page.getByText('Breite (Spalten)', { exact: true })).toBeVisible()
})
