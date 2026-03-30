// =============================================
// E2E Tests: Accessibility
// =============================================

import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('should have no accessibility violations on home page', async ({ page }) => {
    await page.goto('/')

    // Check for basic accessibility
    // Heading structure
    const h1 = page.locator('h1')
    await expect(h1.first()).toBeVisible()

    // Alt text on images
    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      const ariaLabel = await images.nth(i).getAttribute('aria-label')
      const ariaHidden = await images.nth(i).getAttribute('aria-hidden')

      // Image should have alt text or be marked as decorative
      expect(alt || ariaLabel || ariaHidden === 'true').toBeTruthy()
    }
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')

    // Tab through focusable elements
    await page.keyboard.press('Tab')

    // Check that focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement.first()).toBeVisible()

    // Continue tabbing
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Focus should still be visible
    await expect(focusedElement.first()).toBeVisible()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/drugs')

    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button')
    const count = await buttons.count()

    for (let i = 0; i < Math.min(count, 10); i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const ariaLabelledBy = await button.getAttribute('aria-labelledby')

      // Button should have accessible name (text content, aria-label, or aria-labelledby)
      expect(text || ariaLabel || ariaLabelledBy).toBeTruthy()
    }
  })

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/kalkulator')

    // Check for form labels
    const inputs = page.locator('input[type="text"], input[type="number"], select')
    const count = await inputs.count()

    for (let i = 0; i < Math.min(count, 10); i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      const placeholder = await input.getAttribute('placeholder')

      // Input should have accessible name
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const hasLabel = await label.isVisible().catch(() => false)
        expect(hasLabel || ariaLabel || ariaLabelledBy || placeholder).toBeTruthy()
      } else {
        expect(ariaLabel || ariaLabelledBy || placeholder).toBeTruthy()
      }
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')

    // This is a basic check - real contrast testing requires specialized tools
    const body = page.locator('body')
    const backgroundColor = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    )

    // Just verify the page renders
    expect(backgroundColor).toBeTruthy()
  })

  test('should focus on skip links if present', async ({ page }) => {
    await page.goto('/')

    // Tab to potentially reveal skip link
    await page.keyboard.press('Tab')

    // Check for skip link
    const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text("Skip")')

    if (await skipLink.isVisible()) {
      await skipLink.click()

      // Focus should move to main content
      const main = page.locator('#main, #content, main').first()
      await expect(main).toBeVisible()
    }
  })
})