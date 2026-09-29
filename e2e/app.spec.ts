import { AxeBuilder } from '@axe-core/playwright'
import { test as base, expect, type Page } from '@playwright/test'

/** Opens the app and fails the test on page errors, console errors and Content-Security-Policy violations. */
const test = base.extend<{ app: Page }>({
  app: async ({ page }, use) => {
    const problems: string[] = []
    page.on('pageerror', (error) => problems.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(message.text())
    })
    await page.addInitScript(() =>
      document.addEventListener('securitypolicyviolation', (e) =>
        console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`),
      ),
    )
    await page.goto('/')
    await expect(page.getByText('Ready to roll')).toBeVisible()
    await use(page)
    expect(problems).toEqual([])
  },
})

const dice = (page: Page) => page.locator('.dice svg[role=img]')
const roll = async (page: Page) => {
  await page.getByRole('button', { name: /^Roll/ }).click()
  await expect(page.locator('.total-value')).toBeVisible()
}

test('basic mode rolls d6s and totals them', async ({ app: page }) => {
  await page.getByRole('button', { name: 'More dice' }).click()
  await roll(page)
  const labels = await dice(page).evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')))
  expect(labels).toHaveLength(3)
  for (const label of labels) expect(label).toMatch(/^d6 showing [1-6]$/)
  const sum = labels.reduce((total, label) => total + Number(label!.split(' ').at(-1)), 0)
  await expect(page.locator('.total-value')).toHaveText(String(sum))
  await expect(page.locator('#history-list li')).toHaveCount(1)
})

test('hides the total while the dice roll, without moving the layout', async ({ app: page }) => {
  await roll(page)
  // Samples every animation frame from the tap until the total appears.
  const frames = await page.evaluate(async () => {
    const box = (selector: string) => {
      const { x, y, width, height } = document.querySelector(selector)!.getBoundingClientRect()
      return { x, y, width, height }
    }
    const total = document.querySelector('.total-value')!
    ;(document.querySelector('.roll') as HTMLButtonElement).click()
    const samples = []
    do {
      await new Promise(requestAnimationFrame)
      samples.push({
        visible: getComputedStyle(total).visibility === 'visible',
        label: box('.total-label'),
        button: box('.roll'),
      })
    } while (!samples.at(-1)!.visible && samples.length < 200)
    return samples
  })
  // The final total is laid out but hidden (so not announced) until the animation ends.
  expect(frames.length).toBeGreaterThan(3)
  expect(frames.slice(0, -1).every((f) => !f.visible)).toBe(true)
  expect(frames.at(-1)!.visible).toBe(true)
  for (const f of frames) {
    expect(f.label).toEqual(frames[0]!.label)
    expect(f.button).toEqual(frames[0]!.button)
  }
})

test('advanced mode rolls the selected dice', async ({ app: page }) => {
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('switch', { name: 'Advanced mode' }).check()
  await page.keyboard.press('Escape')
  await expect(page.locator('.summary')).toHaveText('2d6')
  await page.getByRole('button', { name: 'Add d20' }).click()
  await expect(page.getByRole('button', { name: /^Roll/ })).toHaveText('Roll 3 dice')
  await roll(page)
  await expect(dice(page).nth(2)).toHaveAttribute('aria-label', /^d20 showing \d+$/)
  await expect(page.locator('#history-list li').first()).toContainText('[2d6]')
})

test('settings survive a reload but history does not', async ({ app: page }) => {
  await page.getByRole('button', { name: 'More dice' }).click()
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByLabel('Theme').selectOption('dark')
  await page.keyboard.press('Escape')
  await roll(page)
  await page.reload()
  await expect(page.getByText('Ready to roll')).toBeVisible()
  await expect(page.locator('.summary')).toHaveText('3')
  await expect(page.locator('#history-list')).toHaveCount(0)
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(19, 19, 19)')
  const stored = await page.evaluate(() => Object.keys(localStorage))
  expect(stored).toEqual(['randomatizer:settings'])
})

test('works offline after the first load', async ({ app: page, context }) => {
  await page.evaluate(() => navigator.serviceWorker.ready)
  await context.setOffline(true)
  await page.reload()
  await roll(page)
  await expect(dice(page)).toHaveCount(2)
})

for (const theme of ['light', 'dark'] as const) {
  test(`has no detectable accessibility issues (${theme})`, async ({ app: page }) => {
    await page.emulateMedia({ colorScheme: theme })
    await roll(page)
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByRole('radio', { name: 'Custom' }).check()
    const settings = await new AxeBuilder({ page }).analyze()
    expect(settings.violations).toEqual([])
    await page.keyboard.press('Escape')
    const main = await new AxeBuilder({ page }).analyze()
    expect(main.violations).toEqual([])
  })
}
