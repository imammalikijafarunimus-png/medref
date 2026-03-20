// ===========================================
// WARFARIN DOSING TESTS
// ===========================================

import { describe, it, expect } from 'vitest'
import { calculateWarfarinDose } from '@/components/medical/calculators/calculations'

describe('calculateWarfarinDose', () => {
  describe('standard target INR (2.0-3.0)', () => {
    it('should recommend increase for very low INR', () => {
      const result = calculateWarfarinDose(1.2, 2.0, 3.0)
      expect(result.action).toContain('Tingkatkan')
      expect(result.action).toContain('10-20%')
      expect(result.nextInr).toBe('5-7 hari')
    })

    it('should recommend increase for subtherapeutic INR', () => {
      const result = calculateWarfarinDose(1.7, 2.0, 3.0)
      expect(result.action).toContain('Tingkatkan')
      expect(result.action).toContain('5-10%')
    })

    it('should recommend maintenance for therapeutic INR', () => {
      const result = calculateWarfarinDose(2.5, 2.0, 3.0)
      expect(result.action).toContain('Pertahankan')
      expect(result.nextInr).toBe('4-6 minggu')
      expect(result.notes).toContain('terapeutik')
    })

    it('should recommend slight decrease for slightly high INR', () => {
      const result = calculateWarfarinDose(3.3, 2.0, 3.0)
      expect(result.action).toContain('Kurangi')
      expect(result.nextInr).toBe('3-5 hari')
    })

    it('should recommend skip dose for moderately high INR', () => {
      const result = calculateWarfarinDose(4.0, 2.0, 3.0)
      expect(result.action).toContain('Lewati')
      expect(result.notes).toContain('Vitamin K')
    })

    it('should recommend Vitamin K for very high INR (5-9)', () => {
      const result = calculateWarfarinDose(7.0, 2.0, 3.0)
      expect(result.action).toContain('Vitamin K')
      expect(result.action).toContain('2.5-5mg')
      expect(result.nextInr).toBe('24-48 jam')
    })

    it('should recommend urgent intervention for critical INR (>9)', () => {
      const result = calculateWarfarinDose(10.0, 2.0, 3.0)
      expect(result.action).toContain('Hentikan')
      expect(result.action).toContain('10mg')
      expect(result.action).toContain('IV')
      expect(result.notes).toContain('HEMATOLOGI')
    })
  })

  describe('higher target INR (2.5-3.5)', () => {
    it('should use correct target range', () => {
      const result = calculateWarfarinDose(2.2, 2.5, 3.5)
      expect(result.action).toContain('Tingkatkan')
    })

    it('should maintain for therapeutic INR in higher range', () => {
      const result = calculateWarfarinDose(3.0, 2.5, 3.5)
      expect(result.action).toContain('Pertahankan')
    })

    it('should handle INR at upper boundary', () => {
      const result = calculateWarfarinDose(3.8, 2.5, 3.5)
      expect(result.action).toContain('Kurangi')
    })
  })

  describe('edge cases', () => {
    it('should handle INR at exact target min', () => {
      const result = calculateWarfarinDose(2.0, 2.0, 3.0)
      expect(result.action).toContain('Pertahankan')
    })

    it('should handle INR at exact target max', () => {
      const result = calculateWarfarinDose(3.0, 2.0, 3.0)
      expect(result.action).toContain('Pertahankan')
    })

    it('should handle INR just above target max', () => {
      const result = calculateWarfarinDose(3.1, 2.0, 3.0)
      expect(result.action).toContain('Kurangi')
    })

    it('should handle INR at exactly 5.0', () => {
      const result = calculateWarfarinDose(5.0, 2.0, 3.0)
      expect(result.action).toContain('Lewati')
    })

    it('should handle INR at exactly 9.0', () => {
      const result = calculateWarfarinDose(9.0, 2.0, 3.0)
      expect(result.action).toContain('Vitamin K')
    })
  })

  describe('invalid inputs', () => {
    it('should throw error for zero INR', () => {
      expect(() => calculateWarfarinDose(0, 2.0, 3.0)).toThrow()
    })

    it('should throw error for negative INR', () => {
      expect(() => calculateWarfarinDose(-2.5, 2.0, 3.0)).toThrow()
    })

    it('should throw error for invalid target range', () => {
      expect(() => calculateWarfarinDose(2.5, 3.0, 2.0)).toThrow()
    })

    it('should throw error for zero target values', () => {
      expect(() => calculateWarfarinDose(2.5, 0, 3.0)).toThrow()
    })
  })

  describe('clinical notes', () => {
    it('should include relevant notes for each INR range', () => {
      const lowResult = calculateWarfarinDose(1.3, 2.0, 3.0)
      expect(lowResult.notes.length).toBeGreaterThan(0)
      
      const highResult = calculateWarfarinDose(8.0, 2.0, 3.0)
      expect(highResult.notes).toContain('perdarahan')
      
      const criticalResult = calculateWarfarinDose(12.0, 2.0, 3.0)
      expect(criticalResult.notes).toContain('FFP')
    })
  })
})