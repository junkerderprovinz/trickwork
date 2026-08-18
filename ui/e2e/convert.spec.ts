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
