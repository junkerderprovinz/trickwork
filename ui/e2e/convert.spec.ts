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

test('switching language updates visible labels', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Controls', { exact: true })).toBeVisible()
  await expect(page.getByText('No images yet.', { exact: true })).toBeVisible()

  await page.getByLabel('Language').selectOption('de')

  // "Controls" -> "Regler" and "No images yet." -> "Noch keine Bilder." are
  // both genuinely distinct strings between the two languages (unlike
  // "Import", which is a valid German loanword too and stays the same) -
  // real positive proof the switch propagated to already-mounted UI.
  await expect(page.getByText('Controls', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Regler', { exact: true })).toBeVisible()
  await expect(page.getByText('Noch keine Bilder.', { exact: true })).toBeVisible()
})
