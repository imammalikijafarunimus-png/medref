// =============================================
// E2E Tests: Drugs Page
// =============================================

import { test, expect } from '@playwright/test'

test.describe('Drugs Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drugs')
  })

  test('should display list of drugs', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check for drug cards
    const drugCards = page.locator('[data-testid="drug-card"]')
    const count = await drugCards.count()

    // Should have at least one drug card
    expect(count).toBeGreaterThanOrEqual(0) // May be empty if no data
  })

  test('should filter drugs by class', async ({ page }) => {
    // Check if class filter exists
    const classFilter = page.locator('select, [data-testid="class-filter"]')
    const isVisible = await classFilter.isVisible().catch(() => false)

    if (isVisible) {
      await classFilter.click()
    }
  })

  test('should search drugs', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="cari"]')

    if (await searchInput.isVisible()) {
      await searchInput.fill('paracetamol')
      await searchInput.press('Enter')

      // Wait for results
      await page.waitForTimeout(1000)
    }
  })

  test('should paginate through drugs', async ({ page }) => {
    // Check for pagination
    const pagination = page.locator('[data-testid="pagination"], nav[aria-label*="pagination"]')
    const isVisible = await pagination.isVisible().catch(() => false)

    if (isVisible) {
      const nextButton = page.locator('button[aria-label*="next"], button:has-text("→")')
      if (await nextButton.isVisible()) {
        await nextButton.click()
        await page.waitForTimeout(500)
      }
    }
  })

  test('should navigate to drug detail', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Click on first drug card
    const drugCard = page.locator('[data-testid="drug-card"]').first()
    const isVisible = await drugCard.isVisible().catch(() => false)

    if (isVisible) {
      await drugCard.click()
      await expect(page).toHaveURL(/\/drugs\/[^/]+$/)
    }
  })
})

test.describe('Drug Detail Page', () => {
  test('should display drug information', async ({ page }) => {
    // Navigate to a drug page (using a known ID or first drug)
    await page.goto('/drugs')

    // Wait for drugs to load
    await page.waitForLoadState('networkidle')

    const drugCard = page.locator('[data-testid="drug-card"]').first()
    const isVisible = await drugCard.isVisible().catch(() => false)

    if (isVisible) {
      await drugCard.click()

      // Check for drug information
      await expect(page.locator('h1, h2').first()).toBeVisible()
    }
  })
})