// ui/e2e/convert.spec.ts
import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// ui/package.json has "type": "module", so this file runs as ESM under
// Playwright's test runner and __dirname is not defined; derive it from
// import.meta.url instead.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Nav items are plain buttons (real page-navigation semantics via
// aria-current, not the ARIA tabs pattern - see sidebarNav.ts), and several
// of their labels ("Export", "Queue") are also substrings of buttons living
// inside the panels themselves, so every nav click needs exact:true to avoid
// a Playwright strict-mode ambiguity between the two.
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

  await nav(page, 'Export').click()
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

  await nav(page, 'Transform').click()
  await page.getByRole('button', { name: '90°' }).click()

  await nav(page, 'Filters').click()
  await page.getByLabel('Invert colors').check()
  await page.getByLabel('Color output').check()

  await expect
    .poll(async () => {
      const box = await canvas.boundingBox()
      return box ? box.width > 0 && box.height > 0 : false
    })
    .toBe(true)

  await nav(page, 'Export').click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export active image as PNG' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('.png')
})

test('switching language updates nav labels and the active panel', async ({ page }) => {
  await page.goto('/')

  await expect(nav(page, 'Adjust')).toBeVisible()
  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()

  await nav(page, 'Appearance').click()
  await page.getByLabel('Language').selectOption('de')

  // "Adjust" -> "Anpassen" and "Queue" -> "Warteschlange" are genuinely
  // distinct strings between the two languages - real positive proof the
  // switch propagated to the nav rail itself (always visible, regardless of
  // which panel is active).
  await expect(nav(page, 'Adjust')).toHaveCount(0)
  await expect(nav(page, 'Anpassen')).toBeVisible()
  await expect(nav(page, 'Warteschlange')).toBeVisible()

  // Queue was never the active panel during the switch - proves an
  // already-mounted but hidden (display:none) panel's DOM updates too, not
  // just the currently visible one.
  await nav(page, 'Warteschlange').click()
  await expect(page.getByText('Noch keine Bilder.', { exact: true })).toBeVisible()

  await nav(page, 'Anpassen').click()
  await expect(page.getByText('Breite (Spalten)', { exact: true })).toBeVisible()
})
