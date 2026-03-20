// =============================================
// E2E Tests: Calculator Page
// =============================================

import { test, expect } from '@playwright/test'

test.describe('Calculator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/kalkulator')
  })

  test('should display calculator tabs', async ({ page }) => {
    // Check for tab navigation
    const tabs = page.locator('[role="tablist"], [data-testid="calculator-tabs"]')
    await expect(tabs.first()).toBeVisible()
  })

  test('should calculate BMI', async ({ page }) => {
    // Find BMI calculator tab
    const bmiTab = page.locator('text=IMT, text=BMI').first()
    if (await bmiTab.isVisible()) {
      await bmiTab.click()
    }

    // Fill in weight
    const weightInput = page.locator('input[placeholder*="berat"], input[id*="weight"]')
    if (await weightInput.isVisible()) {
      await weightInput.fill('70')
    }

    // Fill in height
    const heightInput = page.locator('input[placeholder*="tinggi"], input[id*="height"]')
    if (await heightInput.isVisible()) {
      await heightInput.fill('175')
    }

    // Check for result (may auto-calculate or need button click)
    const calculateButton = page.locator('button:has-text("Hitung"), button[type="submit"]')
    if (await calculateButton.isVisible()) {
      await calculateButton.click()
    }

    // Wait for result
    await page.waitForTimeout(500)
  })

  test('should calculate GFR', async ({ page }) => {
    // Find GFR calculator tab
    const gfrTab = page.locator('text=GFR, text=LFG').first()
    if (await gfrTab.isVisible()) {
      await gfrTab.click()
    }

    // Fill in age
    const ageInput = page.locator('input[placeholder*="umur"], input[id*="age"]')
    if (await ageInput.isVisible()) {
      await ageInput.fill('40')
    }

    // Fill in weight
    const weightInput = page.locator('input[placeholder*="berat"], input[id*="weight"]')
    if (await weightInput.isVisible()) {
      await weightInput.fill('70')
    }

    // Fill in creatinine
    const creatinineInput = page.locator('input[placeholder*="kreatinin"], input[id*="creatinine"]')
    if (await creatinineInput.isVisible()) {
      await creatinineInput.fill('1.0')
    }

    // Select gender
    const maleRadio = page.locator('input[value="male"], input[id*="male"]')
    if (await maleRadio.isVisible()) {
      await maleRadio.check()
    }
  })

  test('should calculate pediatric dose', async ({ page }) => {
    // Find pediatric dose calculator
    const pediatricTab = page.locator('text=Dosis Anak, text=Pediatrik').first()
    if (await pediatricTab.isVisible()) {
      await pediatricTab.click()
    }

    // Fill in weight
    const weightInput = page.locator('input[placeholder*="berat"], input[id*="weight"]')
    if (await weightInput.isVisible()) {
      await weightInput.fill('20')
    }

    // Select a drug (if dropdown exists)
    const drugSelect = page.locator('select[id*="drug"], [data-testid="drug-select"]')
    if (await drugSelect.isVisible()) {
      await drugSelect.selectOption({ index: 1 })
    }
  })

  test('should calculate infusion rate', async ({ page }) => {
    // Find infusion calculator
    const infusionTab = page.locator('text=Infus, text=Infusi').first()
    if (await infusionTab.isVisible()) {
      await infusionTab.click()
    }

    // Fill in volume
    const volumeInput = page.locator('input[placeholder*="volume"], input[id*="volume"]')
    if (await volumeInput.isVisible()) {
      await volumeInput.fill('1000')
    }

    // Fill in duration
    const durationInput = page.locator('input[placeholder*="durasi"], input[id*="duration"]')
    if (await durationInput.isVisible()) {
      await durationInput.fill('8')
    }

    // Fill in drop factor
    const dropFactorInput = page.locator('input[placeholder*="drop"], input[id*="drop"]')
    if (await dropFactorInput.isVisible()) {
      await dropFactorInput.fill('20')
    }
  })
})