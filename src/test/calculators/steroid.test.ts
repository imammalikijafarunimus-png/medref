// ===========================================
// STEROID CONVERSION TESTS
// ===========================================

import { describe, it, expect } from 'vitest'
import { 
  convertSteroid, 
  steroidConversions 
} from '@/components/medical/calculators/calculations'

describe('steroidConversions', () => {
  it('should have all common steroids', () => {
    expect(steroidConversions['prednisone']).toBeDefined()
    expect(steroidConversions['prednisolone']).toBeDefined()
    expect(steroidConversions['dexamethasone']).toBeDefined()
    expect(steroidConversions['hydrocortisone']).toBeDefined()
    expect(steroidConversions['methylprednisolone']).toBeDefined()
  })

  it('should have consistent equivalent doses', () => {
    // Prednisone 5mg should equal Prednisolone 5mg
    expect(steroidConversions['prednisone'].equivalentDose).toBe(
      steroidConversions['prednisolone'].equivalentDose
    )
    
    // Dexamethasone is much more potent
    expect(steroidConversions['dexamethasone'].equivalentDose).toBeLessThan(
      steroidConversions['prednisone'].equivalentDose
    )
  })

  it('should have mineralocorticoid activity defined', () => {
    expect(steroidConversions['hydrocortisone'].mineralocorticoid).toBeGreaterThan(0)
    expect(steroidConversions['dexamethasone'].mineralocorticoid).toBe(0)
  })
})

describe('convertSteroid', () => {
  describe('valid conversions', () => {
    it('should convert prednisone to hydrocortisone', () => {
      const result = convertSteroid('prednisone', 10, 'hydrocortisone')
      expect(result).not.toBeNull()
      // 10mg prednisone = 40mg hydrocortisone (10/5 * 20)
      expect(result!.equivalentDose).toBe(40)
      expect(result!.prednisoneEquivalent).toBe(10)
    })

    it('should convert hydrocortisone to prednisone', () => {
      const result = convertSteroid('hydrocortisone', 40, 'prednisone')
      expect(result).not.toBeNull()
      // 40mg hydrocortisone = 10mg prednisone
      expect(result!.equivalentDose).toBe(10)
    })

    it('should convert dexamethasone to prednisone', () => {
      const result = convertSteroid('dexamethasone', 2, 'prednisone')
      expect(result).not.toBeNull()
      // 2mg dexamethasone = 13.33mg prednisone (2/0.75 * 5)
      expect(result!.equivalentDose).toBeCloseTo(13.33, 1)
    })

    it('should convert between same steroid (no change)', () => {
      const result = convertSteroid('prednisone', 20, 'prednisone')
      expect(result).not.toBeNull()
      expect(result!.equivalentDose).toBe(20)
    })

    it('should convert methylprednisolone to prednisone', () => {
      const result = convertSteroid('methylprednisolone', 16, 'prednisone')
      expect(result).not.toBeNull()
      // 16mg methylprednisolone = 20mg prednisone
      expect(result!.equivalentDose).toBe(20)
    })

    it('should include steroid info in result', () => {
      const result = convertSteroid('prednisone', 10, 'dexamethasone')
      expect(result).not.toBeNull()
      expect(result!.fromInfo.name).toBe('Prednisone')
      expect(result!.toInfo.name).toBe('Dexamethasone')
    })
  })

  describe('edge cases', () => {
    it('should handle very small doses', () => {
      const result = convertSteroid('prednisone', 0.5, 'dexamethasone')
      expect(result).not.toBeNull()
      expect(result!.equivalentDose).toBeGreaterThan(0)
    })

    it('should handle very large doses', () => {
      const result = convertSteroid('prednisone', 1000, 'hydrocortisone')
      expect(result).not.toBeNull()
      expect(result!.equivalentDose).toBe(4000)
    })

    it('should handle decimal doses', () => {
      const result = convertSteroid('prednisone', 7.5, 'prednisolone')
      expect(result).not.toBeNull()
      expect(result!.equivalentDose).toBe(7.5)
    })
  })

  describe('invalid inputs', () => {
    it('should return null for unknown steroid', () => {
      const result = convertSteroid('unknown_steroid', 10, 'prednisone')
      expect(result).toBeNull()
    })

    it('should return null for unknown target steroid', () => {
      const result = convertSteroid('prednisone', 10, 'unknown_steroid')
      expect(result).toBeNull()
    })

    it('should throw error for zero dose', () => {
      expect(() => convertSteroid('prednisone', 0, 'dexamethasone')).toThrow()
    })

    it('should throw error for negative dose', () => {
      expect(() => convertSteroid('prednisone', -10, 'dexamethasone')).toThrow()
    })
  })

  describe('clinical scenarios', () => {
    it('should convert stress dose hydrocortisone equivalent', () => {
      // Common stress dose: 50mg prednisone equivalent
      const result = convertSteroid('prednisone', 50, 'hydrocortisone')
      expect(result).not.toBeNull()
      expect(result!.equivalentDose).toBe(200) // 50mg pred = 200mg hydrocortisone
    })

    it('should convert high dose dexamethasone (Dexamethasone Suppression Test)', () => {
      // DST: 1mg dexamethasone
      const result = convertSteroid('dexamethasone', 1, 'prednisone')
      expect(result).not.toBeNull()
      expect(result!.equivalentDose).toBeCloseTo(6.67, 1)
    })
  })
})