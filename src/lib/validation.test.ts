// =============================================
// Unit Tests for Validation Functions
// =============================================
// These tests verify input validation for medical data
// which is critical for data integrity and security

import { describe, it, expect } from 'vitest'
import {
  skemaBuatObat,
  skemaUpdateObat,
  skemaDosisObat,
  skemaIndikasiObat,
  skemaKontraindikasiObat,
  skemaInteraksiObat,
  skemaBuatHerbal,
  skemaUpdateHerbal,
  skemaIndikasiHerbal,
  skemaBuatCatatanKlinis,
  skemaUpdateCatatanKlinis,
  skemaBuatGejala,
  skemaPencarian,
  skemaPagination,
  skemaInputKalkulator,
  skemaLoginAdmin,
  skemaFavorit,
  sanitasiString,
  validasiInput,
  formatErrorZod,
} from './validation'

// =============================================
// SANITASI STRING TESTS
// =============================================
describe('sanitasiString', () => {
  it('should escape HTML tags', () => {
    const result = sanitasiString('<script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })

  it('should escape quotes', () => {
    const result = sanitasiString('Test "quotes" and \'apostrophes\'')
    expect(result).toContain('&quot;')
    expect(result).toContain('&#x27;')
  })

  it('should escape forward slashes', () => {
    const result = sanitasiString('</div>')
    expect(result).toContain('&#x2F;')
  })

  it('should return unchanged string if no special chars', () => {
    const result = sanitasiString('Normal text without special characters')
    expect(result).toBe('Normal text without special characters')
  })
})

// =============================================
// VALIDASI INPUT HELPER TESTS
// =============================================
describe('validasiInput', () => {
  it('should return success for valid data', () => {
    const data = { name: 'Test Drug' }
    const result = validasiInput(skemaBuatObat, data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Test Drug')
    }
  })

  it('should return errors for invalid data', () => {
    const data = {} // Missing required name
    const result = validasiInput(skemaBuatObat, data)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toBeDefined()
    }
  })

  it('should trim whitespace from string fields', () => {
    const data = { name: '  Trimmed Name  ' }
    const result = validasiInput(skemaBuatObat, data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Trimmed Name')
    }
  })
})

// =============================================
// FORMAT ERROR ZOD TESTS
// =============================================
describe('formatErrorZod', () => {
  it('should format validation errors as string array', () => {
    const data = {} // Invalid: missing required fields
    const result = skemaBuatObat.safeParse(data)
    if (!result.success) {
      const formatted = formatErrorZod(result.error)
      expect(Array.isArray(formatted)).toBe(true)
      expect(formatted.length).toBeGreaterThan(0)
      formatted.forEach(err => {
        expect(typeof err).toBe('string')
      })
    }
  })

  it('should include field path in error message', () => {
    const data = { name: '' } // Empty name should fail
    const result = skemaBuatObat.safeParse(data)
    if (!result.success) {
      const formatted = formatErrorZod(result.error)
      expect(formatted.some(err => err.includes('name'))).toBe(true)
    }
  })
})

// =============================================
// SKEMA BUAT OBAT TESTS
// =============================================
describe('skemaBuatObat', () => {
  it('should validate valid drug data', () => {
    const data = {
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      drugClass: 'analgesik',
      route: 'oral',
      pregnancyCat: 'b',
    }
    const result = skemaBuatObat.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require name field', () => {
    const data = { genericName: 'Test' }
    const result = skemaBuatObat.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should validate drug class enum', () => {
    const data = { name: 'Test', drugClass: 'invalid' }
    const result = skemaBuatObat.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should validate route enum', () => {
    const data = { name: 'Test', route: 'invalid' }
    const result = skemaBuatObat.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should validate pregnancy category enum', () => {
    const data = { name: 'Test', pregnancyCat: 'z' }
    const result = skemaBuatObat.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should allow valid pregnancy categories', () => {
    const categories = ['a', 'b', 'c', 'd', 'x', 'n']
    categories.forEach(cat => {
      const data = { name: 'Test', pregnancyCat: cat }
      const result = skemaBuatObat.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  it('should reject name longer than 200 chars', () => {
    const data = { name: 'a'.repeat(201) }
    const result = skemaBuatObat.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept brand names as array', () => {
    const data = {
      name: 'Paracetamol',
      brandNames: ['Panadol', 'Tylenol', 'Biogesic'],
    }
    const result = skemaBuatObat.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should limit brand names to 20 items', () => {
    const data = {
      name: 'Test',
      brandNames: Array(21).fill('Brand'),
    }
    const result = skemaBuatObat.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// =============================================
// SKEMA UPDATE OBAT TESTS
// =============================================
describe('skemaUpdateObat', () => {
  it('should allow partial updates', () => {
    const data = { name: 'Updated Name' }
    const result = skemaUpdateObat.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should allow empty object', () => {
    const data = {}
    const result = skemaUpdateObat.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should still validate provided fields', () => {
    const data = { drugClass: 'invalid' }
    const result = skemaUpdateObat.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// =============================================
// SKEMA DOSIS OBAT TESTS
// =============================================
describe('skemaDosisObat', () => {
  it('should validate valid dose data', () => {
    const data = {
      adultDose: '500mg every 6 hours',
      pediatricDose: '10-15 mg/kg/day',
      maxDose: '4000 mg',
      frequency: 'q6h',
    }
    const result = skemaDosisObat.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require adultDose', () => {
    const data = { pediatricDose: '10 mg/kg' }
    const result = skemaDosisObat.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should validate maxDoseUnit enum', () => {
    const data = {
      adultDose: '500mg',
      maxDoseUnit: 'invalid',
    }
    const result = skemaDosisObat.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept valid max dose units', () => {
    const units = ['mg', 'g', 'mcg', 'IU', 'mL', 'units']
    units.forEach(unit => {
      const data = { adultDose: '500mg', maxDoseUnit: unit }
      const result = skemaDosisObat.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})

// =============================================
// SKEMA INDIKASI OBAT TESTS
// =============================================
describe('skemaIndikasiObat', () => {
  it('should validate valid indication data', () => {
    const data = {
      indication: 'Pain relief',
      icdCode: 'R52',
      priority: 1,
    }
    const result = skemaIndikasiObat.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require indication', () => {
    const data = { icdCode: 'R52' }
    const result = skemaIndikasiObat.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should limit priority to 0-100', () => {
    const invalidData = { indication: 'Test', priority: 101 }
    const result = skemaIndikasiObat.safeParse(invalidData)
    expect(result.success).toBe(false)

    const validData = { indication: 'Test', priority: 50 }
    const validResult = skemaIndikasiObat.safeParse(validData)
    expect(validResult.success).toBe(true)
  })
})

// =============================================
// SKEMA KONTRAINDIKASI OBAT TESTS
// =============================================
describe('skemaKontraindikasiObat', () => {
  it('should validate valid contraindication', () => {
    const data = {
      contraindication: 'Hypersensitivity',
      severity: 'absolut',
    }
    const result = skemaKontraindikasiObat.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should accept relative severity', () => {
    const data = {
      contraindication: 'Renal impairment',
      severity: 'relatif',
    }
    const result = skemaKontraindikasiObat.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid severity', () => {
    const data = {
      contraindication: 'Test',
      severity: 'invalid',
    }
    const result = skemaKontraindikasiObat.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// =============================================
// SKEMA INTERAKSI OBAT TESTS
// =============================================
describe('skemaInteraksiObat', () => {
  it('should validate valid interaction data', () => {
    const data = {
      interactingDrugId: 'clh123456789abcdefghij', // CUID format
      interactionType: 'mayor',
      effect: 'Increased bleeding risk',
      mechanism: 'CYP450 inhibition',
    }
    const result = skemaInteraksiObat.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require valid CUID for interactingDrugId', () => {
    const data = {
      interactingDrugId: 'invalid-id',
      interactionType: 'moderat',
    }
    const result = skemaInteraksiObat.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should validate interaction type enum', () => {
    const validTypes = ['mayor', 'moderat', 'minor']
    validTypes.forEach(type => {
      const data = {
        interactingDrugId: 'clh123456789abcdefghij',
        interactionType: type,
      }
      const result = skemaInteraksiObat.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})

// =============================================
// SKEMA BUAT HERBAL TESTS
// =============================================
describe('skemaBuatHerbal', () => {
  it('should validate valid herbal data', () => {
    const data = {
      name: 'Ginger',
      latinName: 'Zingiber officinale',
      safetyRating: 'aman',
      pregnancySafety: 'Likely safe',
    }
    const result = skemaBuatHerbal.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require name', () => {
    const data = { latinName: 'Test' }
    const result = skemaBuatHerbal.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should validate safety rating enum', () => {
    const data = { name: 'Test', safetyRating: 'invalid' }
    const result = skemaBuatHerbal.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept valid safety ratings', () => {
    const ratings = ['aman', 'hati-hati', 'tidak aman']
    ratings.forEach(rating => {
      const data = { name: 'Test', safetyRating: rating }
      const result = skemaBuatHerbal.safeParse(data)
      expect(result.success).toBe(true)
    })
  })
})

// =============================================
// SKEMA CATATAN KLINIS TESTS
// =============================================
describe('skemaBuatCatatanKlinis', () => {
  it('should validate valid clinical note', () => {
    const data = {
      title: 'Diabetes Management Protocol',
      content: 'Detailed clinical content...',
      category: 'Endocrinology',
      specialty: 'Endocrinology',
      tags: ['diabetes', 'protocol', 'insulin'],
    }
    const result = skemaBuatCatatanKlinis.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require title, content, and category', () => {
    const data = { tags: ['test'] }
    const result = skemaBuatCatatanKlinis.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should limit title to 300 chars', () => {
    const data = {
      title: 'a'.repeat(301),
      content: 'Content',
      category: 'Test',
    }
    const result = skemaBuatCatatanKlinis.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should limit content to 50000 chars', () => {
    const data = {
      title: 'Test',
      content: 'a'.repeat(50001),
      category: 'Test',
    }
    const result = skemaBuatCatatanKlinis.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should limit tags to 20 items', () => {
    const data = {
      title: 'Test',
      content: 'Content',
      category: 'Test',
      tags: Array(21).fill('tag'),
    }
    const result = skemaBuatCatatanKlinis.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// =============================================
// SKEMA PENCARIAN TESTS
// =============================================
describe('skemaPencarian', () => {
  it('should validate valid search params', () => {
    const data = {
      q: 'paracetamol',
      type: 'drugs',
      limit: 20,
    }
    const result = skemaPencarian.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should allow all optional fields', () => {
    const data = {}
    const result = skemaPencarian.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should validate type enum', () => {
    const data = { type: 'invalid' }
    const result = skemaPencarian.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should coerce limit to number', () => {
    const data = { limit: '20' }
    const result = skemaPencarian.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(typeof result.data.limit).toBe('number')
    }
  })

  it('should limit query to 200 chars', () => {
    const data = { q: 'a'.repeat(201) }
    const result = skemaPencarian.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should limit limit to max 100', () => {
    const data = { limit: 101 }
    const result = skemaPencarian.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// =============================================
// SKEMA PAGINATION TESTS
// =============================================
describe('skemaPagination', () => {
  it('should validate valid pagination params', () => {
    const data = { page: 1, pageSize: 20 }
    const result = skemaPagination.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should use default values', () => {
    const data = {}
    const result = skemaPagination.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(20)
    }
  })

  it('should coerce string numbers', () => {
    const data = { page: '2', pageSize: '50' }
    const result = skemaPagination.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.pageSize).toBe(50)
    }
  })

  it('should limit page to max 1000', () => {
    const data = { page: 1001 }
    const result = skemaPagination.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should limit pageSize to max 100', () => {
    const data = { pageSize: 101 }
    const result = skemaPagination.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// =============================================
// SKEMA INPUT KALKULATOR TESTS
// =============================================
describe('skemaInputKalkulator', () => {
  it('should validate valid calculator input', () => {
    const data = {
      drugId: 'clh123456789abcdefghij',
      weight: 70,
      age: 30,
    }
    const result = skemaInputKalkulator.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require drugId and weight', () => {
    const data = { age: 30 }
    const result = skemaInputKalkulator.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should limit weight to max 500', () => {
    const data = { drugId: 'clh123456789abcdefghij', weight: 501 }
    const result = skemaInputKalkulator.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should limit age to max 150', () => {
    const data = {
      drugId: 'clh123456789abcdefghij',
      weight: 70,
      age: 151,
    }
    const result = skemaInputKalkulator.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should require positive weight', () => {
    const data = { drugId: 'clh123456789abcdefghij', weight: -10 }
    const result = skemaInputKalkulator.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// =============================================
// SKEMA LOGIN ADMIN TESTS
// =============================================
describe('skemaLoginAdmin', () => {
  it('should validate valid password', () => {
    const data = { password: 'securepassword123' }
    const result = skemaLoginAdmin.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should require password', () => {
    const data = {}
    const result = skemaLoginAdmin.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should limit password to 100 chars', () => {
    const data = { password: 'a'.repeat(101) }
    const result = skemaLoginAdmin.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject empty password', () => {
    const data = { password: '' }
    const result = skemaLoginAdmin.safeParse(data)
    expect(result.success).toBe(false)
  })
})

// =============================================
// SKEMA FAVORIT TESTS
// =============================================
describe('skemaFavorit', () => {
  it('should validate valid favorite data', () => {
    const data = {
      itemType: 'drug',
      itemId: 'clh123456789abcdefghij',
    }
    const result = skemaFavorit.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should validate itemType enum', () => {
    const data = { itemType: 'invalid', itemId: 'clh123456789abcdefghij' }
    const result = skemaFavorit.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should accept all valid item types', () => {
    const types = ['drug', 'herbal', 'note']
    types.forEach(type => {
      const data = { itemType: type, itemId: 'clh123456789abcdefghij' }
      const result = skemaFavorit.safeParse(data)
      expect(result.success).toBe(true)
    })
  })

  it('should require valid CUID for itemId', () => {
    const data = { itemType: 'drug', itemId: 'invalid' }
    const result = skemaFavorit.safeParse(data)
    expect(result.success).toBe(false)
  })
})