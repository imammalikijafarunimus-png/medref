// ===========================================
// PEDIATRIC DOSE CALCULATOR TESTS
// ===========================================

import { describe, it, expect } from 'vitest'
import { 
  calculatePediatricDose, 
  parsePediatricDose,
  parseMaxDose 
} from '@/components/medical/calculators/calculations'

describe('parsePediatricDose', () => {
  describe('valid dose strings', () => {
    it('should parse range dose with per kg', () => {
      const result = parsePediatricDose('10-20 mg/kg/hari')
      expect(result).not.toBeNull()
      expect(result!.min).toBe(10)
      expect(result!.max).toBe(20)
      expect(result!.unit).toBe('mg')
      expect(result!.perKg).toBe(true)
      expect(result!.perDay).toBe(true)
    })

    it('should parse single dose with per kg', () => {
      const result = parsePediatricDose('15 mg/kg')
      expect(result).not.toBeNull()
      expect(result!.min).toBe(15)
      expect(result!.max).toBe(15)
      expect(result!.perKg).toBe(true)
    })

    it('should parse fixed dose without per kg', () => {
      const result = parsePediatricDose('500 mg')
      expect(result).not.toBeNull()
      expect(result!.min).toBe(500)
      expect(result!.max).toBe(500)
      expect(result!.perKg).toBe(false)
    })

    it('should parse dose with mcg unit', () => {
      const result = parsePediatricDose('100-200 mcg/kg')
      expect(result).not.toBeNull()
      expect(result!.unit).toBe('mcg')
    })

    it('should parse dose with g unit', () => {
      const result = parsePediatricDose('1-2 g')
      expect(result).not.toBeNull()
      expect(result!.unit).toBe('g')
    })

    it('should parse dose with IU unit', () => {
      const result = parsePediatricDose('1000-5000 IU')
      expect(result).not.toBeNull()
      expect(result!.unit).toBe('IU')
    })
  })

  describe('invalid dose strings', () => {
    it('should return null for empty string', () => {
      expect(parsePediatricDose('')).toBeNull()
    })

    it('should return null for null input', () => {
      expect(parsePediatricDose(null as unknown as string)).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(parsePediatricDose(undefined as unknown as string)).toBeNull()
    })

    it('should return null for non-numeric string', () => {
      expect(parsePediatricDose('invalid')).toBeNull()
    })
  })
})

describe('parseMaxDose', () => {
  it('should parse max dose with mg unit', () => {
    const result = parseMaxDose('4000 mg')
    expect(result).not.toBeNull()
    expect(result!.value).toBe(4000)
    expect(result!.unit).toBe('mg')
  })

  it('should convert g to mg', () => {
    const result = parseMaxDose('4 g')
    expect(result).not.toBeNull()
    expect(result!.value).toBe(4000)
    expect(result!.unit).toBe('mg')
  })

  it('should return null for null input', () => {
    expect(parseMaxDose(null)).toBeNull()
  })

  it('should return null for empty string', () => {
    expect(parseMaxDose('')).toBeNull()
  })
})

describe('calculatePediatricDose', () => {
  describe('dose calculations', () => {
    it('should calculate dose per kg correctly', () => {
      const result = calculatePediatricDose(
        '10-20 mg/kg/hari',
        20, // 20 kg weight
        5, // 5 years old
        '500 mg', // max dose
        '3x sehari',
        null
      )
      
      expect(result).not.toBeNull()
      expect(result!.minDose).toBe(200) // 10 * 20
      expect(result!.maxDose).toBe(400) // 20 * 20
      expect(result!.isWithinMax).toBe(true)
    })

    it('should cap dose at max dose', () => {
      const result = calculatePediatricDose(
        '20-30 mg/kg/hari',
        30, // 30 kg weight
        10,
        '500 mg', // max dose
        null,
        null
      )
      
      expect(result).not.toBeNull()
      expect(result!.maxDose).toBe(500) // capped at max
      expect(result!.isWithinMax).toBe(false)
      expect(result!.warnings.length).toBeGreaterThan(0)
    })

    it('should handle fixed dose without per kg', () => {
      const result = calculatePediatricDose(
        '500 mg',
        20,
        8,
        null,
        '2x sehari',
        null
      )
      
      expect(result).not.toBeNull()
      expect(result!.minDose).toBe(500)
      expect(result!.maxDose).toBe(500)
    })

    it('should generate formula string for per kg dose', () => {
      const result = calculatePediatricDose(
        '10-20 mg/kg',
        15,
        6,
        null,
        null,
        null
      )
      
      expect(result).not.toBeNull()
      expect(result!.formula).toContain('10-20')
      expect(result!.formula).toContain('15 kg')
    })
  })

  describe('age-based warnings', () => {
    it('should warn for newborn', () => {
      const result = calculatePediatricDose(
        '10 mg/kg',
        3,
        0.05, // ~2 months old (in years)
        null,
        null,
        null
      )
      
      expect(result).not.toBeNull()
      expect(result!.warnings.some(w => w.includes('baru lahir'))).toBe(true)
    })

    it('should warn for infant under 1 year', () => {
      const result = calculatePediatricDose(
        '10 mg/kg',
        8,
        0.5, // 6 months
        null,
        null,
        null
      )
      
      expect(result).not.toBeNull()
      expect(result!.warnings.some(w => w.includes('1 tahun'))).toBe(true)
    })

    it('should warn if age below pediatric minimum', () => {
      const result = calculatePediatricDose(
        '10 mg/kg',
        10,
        1, // 1 year = 12 months
        null,
        null,
        '24' // min 24 months
      )
      
      expect(result).not.toBeNull()
      expect(result!.warnings.some(w => w.includes('tidak direkomendasikan'))).toBe(true)
    })
  })

  describe('weight-based warnings', () => {
    it('should warn for very low weight', () => {
      const result = calculatePediatricDose(
        '10 mg/kg',
        2, // very low weight
        1,
        null,
        null,
        null
      )
      
      expect(result).not.toBeNull()
      expect(result!.warnings.some(w => w.includes('sangat rendah'))).toBe(true)
    })

    it('should suggest adult dose for weight > 40 kg', () => {
      const result = calculatePediatricDose(
        '10 mg/kg',
        45, // over 40 kg
        15,
        null,
        null,
        null
      )
      
      expect(result).not.toBeNull()
      expect(result!.warnings.some(w => w.includes('dosis dewasa'))).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should return null for invalid dose string', () => {
      const result = calculatePediatricDose(
        'invalid',
        20,
        5,
        null,
        null,
        null
      )
      
      expect(result).toBeNull()
    })
  })
})