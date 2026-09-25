import { test, expect } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The package is an ES module, so __dirname does not exist.
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The badge's name switches between Settings and Back and follows the locale,
// so it is found by its class.
function settingsButton(page: import('@playwright/test').Page) {
  return page.locator('.settings-button')
}

function settingsTab(page: import('@playwright/test').Page, name: string) {
  return page.getByRole('tablist', { name: 'Settings section' }).getByRole('tab', { name, exact: true })
}

test('drop an image, see ASCII output, export as TXT', async ({ page }) => {
  await page.goto('/')

  // The presets import in the hidden Settings view is a file input too.
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

  // The Export card is always visible beside the preview.
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export active image as TXT' }).click()
  const download = await downloadPromise

  expect(download.suggestedFilename()).toContain('.txt')
  const streamPath = await download.path()
  expect(streamPath).not.toBeNull()
})

test('rotate, invert, and color output all still produce a non-empty preview and export', async ({ page }) => {
  await page.goto('/')

  const fileInput = page.locator('input[type="file"][accept="image/*"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png'))

  const canvas = page.locator('canvas.preview-canvas')
  await expect(canvas).toBeVisible()

  // Invert and Color are icon toggle buttons named by their aria-label.
  await page.getByRole('tab', { name: '90°' }).click()
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

  // "0°" is a substring of "90°", "180°" and "270°".
  const rotate90 = page.getByRole('tab', { name: '90°', exact: true })
  const rotate0 = page.getByRole('tab', { name: '0°', exact: true })
  await expect(rotate0).toHaveClass(/segmented-button--active/)

  await rotate90.click()
  await expect(rotate90).toHaveClass(/segmented-button--active/)

  await page.keyboard.press('Control+z')
  await expect(rotate0).toHaveClass(/segmented-button--active/)

  await page.keyboard.press('Control+y')
  await expect(rotate90).toHaveClass(/segmented-button--active/)
})

test('undo and redo buttons reflect history state and a dragged slider undoes as one step', async ({
  page,
}) => {
  await page.goto('/')

  const undoButton = page.getByRole('button', { name: 'Undo' })
  const redoButton = page.getByRole('button', { name: 'Redo' })
  await expect(undoButton).toBeDisabled()
  await expect(redoButton).toBeDisabled()

  // Found by label text, since the accessible name includes the live value
  // ("Width (columns) 120") and changes with every key press.
  const widthSlider = page
    .locator('.control-slider', { hasText: 'Width (columns)' })
    .locator('input[type="range"]')
  await widthSlider.focus()
  // All presses fall into one focus session and so into one undo step.
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

test('the character set field is plain editable text', async ({ page }) => {
  await page.goto('/')

  const charsetField = page.getByLabel('Character set', { exact: true })
  const presetSelect = page.getByLabel('Character set preset', { exact: true })
  // ASCGen2's dark-to-light order, with the blank last.
  await expect(charsetField).toHaveValue('@%#*+=-:. ')
  await expect(presetSelect).toHaveValue('standard')

  await charsetField.click()
  await charsetField.press('Control+a')
  await charsetField.pressSequentially('@%#')
  // A charset matching no preset leaves the select empty.
  await expect(presetSelect).toHaveValue('')

  await charsetField.press('Backspace')
  await charsetField.blur()
  // On blur the field redraws from whatever was actually committed ("@%").
  await expect(charsetField).toHaveValue('@%')
})

test('typing a character more than once keeps every repeat', async ({ page }) => {
  await page.goto('/')

  // A repeated character is weighted more, so the field keeps every repeat.
  const charsetField = page.getByLabel('Character set', { exact: true })
  await charsetField.click()
  await charsetField.press('Control+a')
  await charsetField.pressSequentially(' .aaa@')
  await charsetField.blur()
  await expect(charsetField).toHaveValue(' .aaa@')
})

test('a closed select answers the mouse wheel only while it has focus', async ({ page }) => {
  await page.goto('/')

  // The aria-label of the Font info icon contains "font" as well.
  const fontSelect = page.getByLabel('Font', { exact: true })
  const before = await fontSelect.inputValue()
  await fontSelect.hover()
  await page.mouse.wheel(0, 100)
  // Hovered alone it leaves the value to whatever the page scrolls past.
  expect(await fontSelect.inputValue()).toBe(before)

  // That wheel scrolled the page, so the pointer goes back over the select.
  await fontSelect.focus()
  await fontSelect.hover()
  await page.mouse.wheel(0, 100)
  expect(await fontSelect.inputValue()).not.toBe(before)
})

test('Settings replaces the whole page: no preview, no working cards', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()
  const badge = settingsButton(page)
  await expect(badge).toHaveAccessibleName('Settings')

  await badge.click()

  // main.ts hides the Convert view with display: none, so its nodes stay in
  // the DOM and toBeHidden is the check.
  await expect(page.getByText('Width (columns)', { exact: true })).toBeHidden()
  await expect(page.locator('canvas.preview-canvas')).toBeHidden()
  await expect(page.getByText('Presets', { exact: true })).toBeVisible()
  await expect(badge).toHaveAccessibleName('Back')
  await expect(page.locator('.about-versions')).toContainText('GlimStone')

  await badge.click()
  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()
  await expect(page.getByText('Presets', { exact: true })).toBeHidden()
  await expect(badge).toHaveAccessibleName('Settings')
})

test('Settings sorts its cards into three tabs between the brand card and the Back button', async ({ page }) => {
  await page.goto('/')
  const brand = page.locator('.brand-card')
  const onConvert = await brand.boundingBox()

  await settingsButton(page).click()
  const tabs = page.getByRole('tablist', { name: 'Settings section' })
  await expect(tabs.getByRole('tab')).toHaveText(['General', 'Look', 'App'])
  await expect(settingsTab(page, 'General')).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByText('Presets', { exact: true })).toBeVisible()
  await expect(page.getByText('About TrickWork', { exact: true })).toBeVisible()
  await expect(page.getByText('Shape', { exact: true })).toBeHidden()
  await expect(page.locator('.app-rows')).toBeHidden()

  // The language is a look of the app, like theme and shape.
  await settingsTab(page, 'Look').click()
  await expect(page.getByRole('button', { name: 'Language', exact: true })).toBeVisible()
  await expect(page.getByText('Shape', { exact: true })).toBeVisible()
  await expect(page.getByText('Presets', { exact: true })).toBeHidden()

  await page.keyboard.press('ArrowRight')
  await expect(settingsTab(page, 'App')).toHaveAttribute('aria-selected', 'true')
  await expect(page.locator('.app-rows')).toBeVisible()
  await expect(page.getByText('Shape', { exact: true })).toBeHidden()

  const onSettings = await brand.boundingBox()
  const strip = await tabs.boundingBox()
  const back = await settingsButton(page).boundingBox()
  const middle = await page.evaluate(() => document.documentElement.clientWidth / 2)
  if (!onConvert || !onSettings || !strip || !back) throw new Error('boxes missing')
  // Beside the preview the card stands on the right. On Settings it takes the
  // top left corner and Back the top right one, and the tabs stand in the
  // middle of the screen.
  expect(onConvert.x).toBeGreaterThan(strip.x)
  expect(onSettings.x + onSettings.width).toBeLessThanOrEqual(strip.x)
  expect(back.x).toBeGreaterThanOrEqual(strip.x + strip.width)
  expect(Math.abs(strip.x + strip.width / 2 - middle)).toBeLessThan(2)
  expect(Math.abs(onSettings.y - strip.y)).toBeLessThan(2)
  expect(Math.abs(back.y - strip.y)).toBeLessThan(2)

  // Settings opens on the tab it was left on.
  await settingsButton(page).click()
  await settingsButton(page).click()
  await expect(settingsTab(page, 'App')).toHaveAttribute('aria-selected', 'true')
})

test('switching language updates the badge label and every card, including ones on the other page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Width (columns)', { exact: true })).toBeVisible()

  const badge = settingsButton(page)
  await badge.click()
  await settingsTab(page, 'Look').click()
  // The language picker is a custom dropdown: open it, then pick the option.
  await page.getByRole('button', { name: 'Language', exact: true }).click()
  await page.getByRole('option', { name: 'Deutsch' }).click()

  await expect(badge).toHaveAccessibleName('Zurück')

  // The Convert view was hidden during the switch and still has to update.
  await badge.click()
  await expect(page.getByText('Breite (Spalten)', { exact: true })).toBeVisible()
  await expect(badge).toHaveAccessibleName('Einstellungen')
})

test('exporting then importing settings round-trips a change through a real JSON file', async ({ page }) => {
  await page.goto('/')

  const rotate90 = page.getByRole('tab', { name: '90°', exact: true })
  const rotate0 = page.getByRole('tab', { name: '0°', exact: true })
  await rotate90.click()
  await expect(rotate90).toHaveClass(/segmented-button--active/)

  await settingsButton(page).click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export settings' }).click()
  const download = await downloadPromise
  const exportedPath = await download.path()
  expect(exportedPath).not.toBeNull()

  // Change the setting again so the import below has something real to undo.
  await settingsButton(page).click()
  await rotate0.click()
  await expect(rotate0).toHaveClass(/segmented-button--active/)
  await settingsButton(page).click()

  await page.locator('input[type="file"][accept*="json"]').setInputFiles(exportedPath as string)
  await expect(page.getByText('Settings imported.')).toBeVisible()

  await settingsButton(page).click()
  await expect(rotate90).toHaveClass(/segmented-button--active/)
})

test('a malformed settings file is rejected with an error, not a silent crash', async ({ page }) => {
  await page.goto('/')

  await settingsButton(page).click()
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

  // Selecting another image resets the zoom. addFiles keeps the active image,
  // so the second copy of the fixture is selected explicitly.
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
  // Well past the minimum drag, so it counts as a selection.
  await page.mouse.move(box.x + 5, box.y + 5)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.6, { steps: 8 })
  await page.mouse.up()

  await expect(overlay).toBeVisible()
  await expect(clearButton).toBeVisible()

  // A roughly proportional crop barely changes the grid size, so the check is
  // the overlay surviving undo and redo.
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

  // A drag from inside moves the selection at its size.
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

  // A drag from the bottom-right corner grows it around the fixed top-left.
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
  expect(Math.abs(resized.x - moved.x)).toBeLessThan(2)
  expect(Math.abs(resized.y - moved.y)).toBeLessThan(2)
})

test('rainbow mode gives each queue row its own hue, and the language picker shows flags', async ({ page }) => {
  await page.goto('/')

  // The language options carry a flag emoji.
  await settingsButton(page).click()
  await settingsTab(page, 'Look').click()
  await page.getByRole('button', { name: 'Language', exact: true }).click()
  const firstOptionText = await page.getByRole('option').first().textContent()
  // A flag emoji is two regional indicator symbols, both above 0xFFFF.
  expect(Array.from(firstOptionText ?? '').some((ch) => (ch.codePointAt(0) ?? 0) > 0xffff)).toBe(true)
  await page.keyboard.press('Escape')

  await page.getByRole('switch', { name: 'Rainbow' }).click()
  await settingsButton(page).click()

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

test('height slider follows width while locked, and becomes independent once unlocked', async ({ page }) => {
  await page.goto('/')

  const fileInput = page.locator('input[type="file"][accept="image/*"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures', 'small.png')) // 16x16, square

  const widthSlider = page
    .locator('.control-slider', { hasText: 'Width (columns)' })
    .locator('input[type="range"]')
  const heightSlider = page
    .locator('.control-slider', { hasText: 'Height (rows)' })
    .locator('input[type="range"]')
  // Found through its wrapper: its name follows the lock state, and the class
  // alone would also match Flip, Invert, Dither and Color.
  const lockToggle = page.locator('.control-slider-with-toggle .icon-toggle-button')

  // Locked by default: a square source at 120 columns gives 60 rows, since
  // CELL_ASPECT_COMPENSATION is 2.
  await expect(heightSlider).toHaveValue('60')
  await expect(heightSlider).toBeDisabled()
  await expect(lockToggle).toHaveAttribute('aria-pressed', 'true')

  // While locked, Width moves the displayed Height, which only the second
  // slider's <input> can show, not the store.
  await widthSlider.focus()
  await widthSlider.fill('60') // half the default width, same square source -> half the rows too
  await expect(heightSlider).toHaveValue('30')

  // Unlocked, Height is a control of its own.
  await lockToggle.click()
  await expect(lockToggle).toHaveAttribute('aria-pressed', 'false')
  await expect(heightSlider).toBeEnabled()
  await heightSlider.focus()
  await heightSlider.fill('99')
  await expect(heightSlider).toHaveValue('99')

  // Widening again leaves the unlocked Height alone.
  await widthSlider.fill('200')
  await expect(heightSlider).toHaveValue('99')

  // Locking again drops the override and returns to the auto value for 200
  // columns.
  await lockToggle.click()
  await expect(lockToggle).toHaveAttribute('aria-pressed', 'true')
  await expect(heightSlider).toBeDisabled()
  await expect(heightSlider).toHaveValue('100')
})

test('a card dragged by its handle lands in its new place, and Escape puts it back', async ({ page }) => {
  await page.goto('/')
  const order = () => page.locator('.app-secondary > .glim-card').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.cardId))
  const handleOf = (id: string) => page.locator(`.app-secondary > [data-card-id="${id}"] .card-drag-handle`)
  await expect.poll(order).toEqual(['adjust', 'transform', 'filters', 'history', 'queue', 'export'])

  const from = await handleOf('adjust').boundingBox()
  const past = await page.locator('.app-secondary > [data-card-id="transform"]').boundingBox()
  if (!from || !past) throw new Error('card boxes missing')
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2)
  await page.mouse.down()
  await page.mouse.move(from.x + from.width / 2, past.y + past.height, { steps: 10 })
  await expect(page.locator('.glim-drag-lift')).toHaveCount(1)
  await page.mouse.up()
  await expect.poll(order).toEqual(['transform', 'adjust', 'filters', 'history', 'queue', 'export'])

  const again = await handleOf('history').boundingBox()
  if (!again) throw new Error('history handle missing')
  await page.mouse.move(again.x + again.width / 2, again.y + again.height / 2)
  await page.mouse.down()
  await page.mouse.move(again.x + again.width / 2, again.y + 300, { steps: 10 })
  await page.keyboard.press('Escape')
  await page.mouse.up()
  await expect(page.locator('.glim-drag-lift, .glim-drag-settle')).toHaveCount(0)
  await expect.poll(order).toEqual(['transform', 'adjust', 'filters', 'history', 'queue', 'export'])

  await page.reload()
  await expect.poll(order).toEqual(['transform', 'adjust', 'filters', 'history', 'queue', 'export'])
})

test('the App card in the browser offers the desktop downloads of the running version', async ({ page }) => {
  await page.goto('/')
  await settingsButton(page).click()
  await settingsTab(page, 'App').click()
  const buttons = page.locator('.app-rows a.readme-btn')
  await expect(buttons).toHaveCount(5)
  const version = await page.locator('.about-versions a').first().textContent()
  for (const href of await buttons.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).href))) {
    expect(href).toContain(`/releases/download/v${version}/trickwork-`)
  }
  await expect(page.getByRole('link', { name: 'ARM64 Windows' })).toHaveAttribute('href', /windows-arm64-installer\.exe$/)
})

test('an App card button shows its second line only under the pointer, over the whole unit', async ({ page }) => {
  await page.goto('/')
  await settingsButton(page).click()
  await settingsTab(page, 'App').click()
  const windows = page.locator('.app-rows .readme-btn-unit').first()
  const lines = windows.locator('.readme-btn-sub')
  await expect(lines).toHaveCount(3)
  for (const line of await lines.all()) await expect(line).toHaveCSS('opacity', '0')

  // The pointer on a segment brings in the lines of the button it hangs on too.
  await page.getByRole('link', { name: 'Portable Windows' }).hover()
  for (const line of await lines.all()) await expect(line).toHaveCSS('opacity', '0.9')
  await expect(windows.locator('.readme-btn').first()).toHaveCSS('background-color', 'rgb(0, 120, 212)')
  await expect(page.locator('.app-rows .readme-btn-unit').nth(1).locator('.readme-btn-sub')).toHaveCSS('opacity', '0')
})

test('the About card gives with the README buttons, the coffee one in its own artwork', async ({ page }) => {
  await page.goto('/')
  await settingsButton(page).click()
  const coffee = page.getByRole('button', { name: 'Buy me a coffee', exact: true })
  await expect(coffee).toHaveClass(/readme-btn/)
  await expect(coffee.locator('.readme-btn-art svg path')).toHaveCount(7)
  for (const name of ['PayPal', 'Crypto', 'GitHub', 'Email']) {
    const btn = page.getByRole('button', { name, exact: true })
    await expect(btn).toHaveClass(/readme-btn/)
    // One line each, so the name stays in the middle.
    await expect(btn.locator('.readme-btn-sub')).toHaveCount(0)
  }
  await coffee.hover()
  await expect(coffee).toHaveCSS('background-color', 'rgb(255, 221, 0)')
})

test('the About card opens the crypto window, which shows the picked coin and closes with Escape', async ({ page }) => {
  await page.goto('/')
  await settingsButton(page).click()
  await page.getByRole('button', { name: 'Crypto' }).click()
  const window = page.getByRole('dialog')
  await expect(window).toBeVisible()
  await expect(window.locator('.donate-address')).toHaveText(/^bc1q/)
  await window.getByRole('option', { name: 'Solana (SOL)' }).click()
  await expect(window.locator('.donate-address')).toHaveText('GrTyhSbZVArdaZAr3TqWDrkEGahomLtNZJ41qPLm3dHd')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
})
