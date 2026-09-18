import {expect, test} from '@playwright/test'

test.describe('localized website', () => {
  test('detects English and falls back to Dutch', async ({browser}) => {
    const english = await browser.newContext({locale: 'en-US'})
    const englishPage = await english.newPage()
    await englishPage.goto('/')
    await expect(englishPage).toHaveURL(/\/en$/)
    await expect(englishPage.locator('html')).toHaveAttribute('lang', 'en')
    await english.close()

    const dutch = await browser.newContext({locale: 'nl-NL'})
    const dutchPage = await dutch.newPage()
    await dutchPage.goto('/')
    await expect(dutchPage).toHaveURL(/\/nl$/)
    await expect(dutchPage.locator('html')).toHaveAttribute('lang', 'nl')
    await dutch.close()
  })

  test('language switch keeps the current hash', async ({page}) => {
    await page.goto('/nl#projects')
    await page.getByRole('link', {name: 'EN', exact: true}).click()
    await expect(page).toHaveURL(/\/en#projects$/)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  })

  test('both project indexes use localized links', async ({page}) => {
    for (const locale of ['nl', 'en'] as const) {
      await page.goto(`/${locale}/projects`)
      const firstProject = page.locator(`a[href^="/${locale}/projects/"]`).first()
      await expect(firstProject).toBeVisible({timeout: 20000})
    }
  })
})
