// ===========================================
// GFR CALCULATOR TESTS
// ===========================================

import { describe, it, expect } from 'vitest'
import { calculateGFR, calculateCrCl } from '@/components/medical/calculators/calculations'

describe('calculateGFR', () => {
  describe('valid inputs', () => {
    it('should calculate GFR correctly for male', () => {
      const result = calculateGFR(50, 70, 1.0, 'male')
      // Cockcroft-Gault: ((140-50) * 70) / (72 * 1.0) = 87.5
      expect(result.gfr).toBe(88) // rounded
      expect(result.stage).toBe('G2')
      expect(result.color).toBe('info')
    })

    it('should calculate GFR correctly for female', () => {
      const result = calculateGFR(50, 60, 1.0, 'female')
      // ((140-50) * 60) / (72 * 1.0) * 0.85 = 63.75
      expect(result.gfr).toBe(64) // rounded
      expect(result.stage).toBe('G2')
    })

    it('should identify normal kidney function (G1)', () => {
      const result = calculateGFR(25, 70, 0.8, 'male')
      expect(result.gfr).toBeGreaterThanOrEqual(90)
      expect(result.stage).toBe('G1')
      expect(result.description).toContain('normal')
    })

    it('should identify G3b stage', () => {
      const result = calculateGFR(70, 60, 1.5, 'male')
      // ((140-70) * 60) / (72 * 1.5) = 38.9
      expect(result.gfr).toBeLessThan(45)
      expect(result.stage).toBe('G3b')
      expect(result.color).toBe('warning')
    })

    it('should identify G5 (kidney failure)', () => {
      const result = calculateGFR(70, 50, 4.0, 'male')
      // ((140-70) * 50) / (72 * 4.0) = 12.2
      expect(result.gfr).toBeLessThan(15)
      expect(result.stage).toBe('G5')
      expect(result.description).toContain('terminal')
      expect(result.color).toBe('danger')
    })
  })

  describe('edge cases', () => {
    it('should handle very young age', () => {
      const result = calculateGFR(20, 60, 0.9, 'male')
      expect(result.gfr).toBeGreaterThan(0)
    })

    it('should handle elderly patient', () => {
      const result = calculateGFR(85, 55, 1.2, 'female')
      expect(result.gfr).toBeGreaterThan(0)
      expect(result.gfr).toBeLessThan(60)
    })

    it('should handle high creatinine', () => {
      const result = calculateGFR(50, 70, 5.0, 'male')
      expect(result.gfr).toBeLessThan(30)
      expect(result.stage).toBe('G4')
    })

    it('should handle low creatinine', () => {
      const result = calculateGFR(40, 80, 0.5, 'male')
      expect(result.gfr).toBeGreaterThan(150)
    })
  })

  describe('invalid inputs', () => {
    it('should throw error for zero age', () => {
      expect(() => calculateGFR(0, 70, 1.0, 'male')).toThrow()
    })

    it('should throw error for zero weight', () => {
      expect(() => calculateGFR(50, 0, 1.0, 'male')).toThrow()
    })

    it('should throw error for zero creatinine', () => {
      expect(() => calculateGFR(50, 70, 0, 'male')).toThrow()
    })

    it('should throw error for negative values', () => {
      expect(() => calculateGFR(-50, 70, 1.0, 'male')).toThrow()
    })
  })
})

describe('calculateCrCl', () => {
  describe('valid inputs', () => {
    it('should calculate both Cockcroft-Gault and CKD-EPI', () => {
      const result = calculateCrCl(50, 70, 1.0, 'male')
      expect(result.cockcroftGault).toBeGreaterThan(0)
      expect(result.ckdEpi).toBeGreaterThan(0)
    })

    it('should calculate BSA when height provided', () => {
      const result = calculateCrCl(50, 70, 1.0, 'male', 175)
      expect(result.bsa).toBeGreaterThan(0)
      expect(result.bsa).toBeCloseTo(1.84, 1) // Mosteller formula
    })

    it('should return 0 BSA when height not provided', () => {
      const result = calculateCrCl(50, 70, 1.0, 'male')
      expect(result.bsa).toBe(0)
    })

    it('should calculate correctly for female', () => {
      const result = calculateCrCl(50, 60, 1.0, 'female')
      expect(result.cockcroftGault).toBeGreaterThan(0)
      expect(result.ckdEpi).toBeGreaterThan(0)
    })
  })

  describe('comparison between CG and CKD-EPI', () => {
    it('should produce different values for CG and CKD-EPI', () => {
      const result = calculateCrCl(65, 75, 1.5, 'male', 170)
      // CG and CKD-EPI typically produce different results
      expect(result.cockcroftGault).not.toBe(result.ckdEpi)
    })
  })

  describe('invalid inputs', () => {
    it('should throw error for zero creatinine', () => {
      expect(() => calculateCrCl(50, 70, 0, 'male')).toThrow()
    })

    it('should throw error for negative values', () => {
      expect(() => calculateCrCl(-50, 70, 1.0, 'male')).toThrow()
    })
  })
})