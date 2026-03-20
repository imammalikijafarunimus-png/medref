// =============================================
// E2E Tests: Home Page
// =============================================

import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display home page with navigation', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/MedRef/)

    // Check header
    await expect(page.locator('header')).toBeVisible()

    // Check bottom navigation on mobile
    const bottomNav = page.locator('nav').filter({ hasText: /Obat|Herbal|Catatan/ })
    await expect(bottomNav.first()).toBeVisible()
  })

  test('should display quick access cards', async ({ page }) => {
    // Check for quick access cards
    const quickAccessCards = page.locator('[data-testid="quick-access-card"]')
    const count = await quickAccessCards.count()

    // Should have at least 4 quick access cards
    expect(count).toBeGreaterThanOrEqual(4)
  })

  test('should navigate to drugs page', async ({ page }) => {
    // Click on drugs link
    await page.click('text=Obat')

    // Should navigate to drugs page
    await expect(page).toHaveURL(/\/drugs/)
  })

  test('should navigate to herbals page', async ({ page }) => {
    // Click on herbals link
    await page.click('text=Herbal')

    // Should navigate to herbals page
    await expect(page).toHaveURL(/\/herbals/)
  })

  test('should display search bar', async ({ page }) => {
    // Check for search input
    const searchInput = page.locator('input[placeholder*="cari"]')
    await expect(searchInput).toBeVisible()
  })

  test('should search from home page', async ({ page }) => {
    // Type in search bar
    const searchInput = page.locator('input[placeholder*="cari"]')
    await searchInput.fill('paracetamol')
    await searchInput.press('Enter')

    // Should navigate to search page or show results
    await expect(page).toHaveURL(/search|cari/)
  })
})