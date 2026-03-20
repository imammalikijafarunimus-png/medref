// ===========================================
// BMI CALCULATOR TESTS
// ===========================================

import { describe, it, expect } from 'vitest'
import { calculateBMI } from '@/components/medical/calculators/calculations'

describe('calculateBMI', () => {
  describe('valid inputs', () => {
    it('should calculate BMI correctly for normal weight', () => {
      const result = calculateBMI(70, 175) // 70kg, 175cm
      expect(result.bmi).toBeCloseTo(22.9, 1)
      expect(result.category).toBe('Berat badan normal')
      expect(result.color).toBe('success')
    })

    it('should calculate BMI for underweight', () => {
      const result = calculateBMI(50, 175) // 50kg, 175cm
      expect(result.bmi).toBeCloseTo(16.3, 1)
      expect(result.category).toBe('Berat badan kurang')
      expect(result.color).toBe('warning')
    })

    it('should calculate BMI for overweight', () => {
      const result = calculateBMI(85, 175) // 85kg, 175cm
      expect(result.bmi).toBeCloseTo(27.8, 1)
      expect(result.category).toBe('Overweight')
      expect(result.color).toBe('warning')
    })

    it('should calculate BMI for obesity', () => {
      const result = calculateBMI(100, 175) // 100kg, 175cm
      expect(result.bmi).toBeCloseTo(32.7, 1)
      expect(result.category).toBe('Obesitas')
      expect(result.color).toBe('danger')
    })

    it('should handle edge case at BMI 18.5 boundary', () => {
      const result = calculateBMI(56.7, 175) // BMI ~18.5
      expect(result.bmi).toBeCloseTo(18.5, 1)
    })

    it('should handle tall people correctly', () => {
      const result = calculateBMI(90, 200) // 90kg, 200cm
      expect(result.bmi).toBeCloseTo(22.5, 1)
      expect(result.category).toBe('Berat badan normal')
    })

    it('should handle short people correctly', () => {
      const result = calculateBMI(50, 150) // 50kg, 150cm
      expect(result.bmi).toBeCloseTo(22.2, 1)
      expect(result.category).toBe('Berat badan normal')
    })
  })

  describe('invalid inputs', () => {
    it('should throw error for zero weight', () => {
      expect(() => calculateBMI(0, 175)).toThrow()
    })

    it('should throw error for negative weight', () => {
      expect(() => calculateBMI(-70, 175)).toThrow()
    })

    it('should throw error for zero height', () => {
      expect(() => calculateBMI(70, 0)).toThrow()
    })

    it('should throw error for negative height', () => {
      expect(() => calculateBMI(70, -175)).toThrow()
    })
  })

  describe('interpretation', () => {
    it('should provide correct interpretation for underweight', () => {
      const result = calculateBMI(45, 170)
      expect(result.interpretation).toContain('malnutrisi')
    })

    it('should provide correct interpretation for normal weight', () => {
      const result = calculateBMI(65, 170)
      expect(result.interpretation).toContain('sehat')
    })

    it('should provide correct interpretation for obesity', () => {
      const result = calculateBMI(100, 170)
      expect(result.interpretation).toContain('kardiovaskular')
    })
  })
})