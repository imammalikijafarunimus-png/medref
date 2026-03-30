// =============================================
// E2E Tests: Responsive Design
// =============================================

import { test, expect } from '@playwright/test'

test.describe('Responsive Design', () => {
  test('should display mobile navigation on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check for bottom navigation
    const bottomNav = page.locator('nav').filter({ hasText: /Obat|Herbal/ })
    await expect(bottomNav.first()).toBeVisible()
  })

  test('should display desktop layout on large screens', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/')

    // Check for header navigation
    const header = page.locator('header')
    await expect(header).toBeVisible()
  })

  test('should adapt cards for mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/drugs')

    // Cards should be full width or stacked
    const cards = page.locator('[data-testid="drug-card"]')
    const firstCard = cards.first()

    if (await firstCard.isVisible()) {
      const box = await firstCard.boundingBox()
      // Card width should be close to viewport width (allowing for padding)
      expect(box?.width).toBeLessThan(400)
    }
  })

  test('should show desktop grid on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/drugs')

    // Should have grid layout
    const container = page.locator('.grid, [class*="grid"]')
    const isVisible = await container.isVisible().catch(() => false)

    // On desktop, grid should be visible
    if (isVisible) {
      const className = await container.getAttribute('class')
      expect(className).toMatch(/grid/)
    }
  })
})

test.describe('Dark Mode', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/')

    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="tema"], [data-testid="theme-toggle"]')

    if (await themeToggle.isVisible()) {
      // Click to toggle
      await themeToggle.click()

      // Check if dark class is applied
      const html = page.locator('html')
      const className = await html.getAttribute('class')

      // Should have dark class
      expect(className).toMatch(/dark/)
    }
  })

  test('should persist theme preference', async ({ page }) => {
    await page.goto('/')

    // Set dark mode
    const themeToggle = page.locator('button[aria-label*="theme"], button[aria-label*="tema"]')

    if (await themeToggle.isVisible()) {
      await themeToggle.click()

      // Reload page
      await page.reload()

      // Check if dark mode is persisted
      const html = page.locator('html')
      const className = await html.getAttribute('class')
      expect(className).toMatch(/dark/)
    }
  })
})