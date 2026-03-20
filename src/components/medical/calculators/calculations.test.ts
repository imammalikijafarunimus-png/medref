// =============================================
// Unit Tests for Medical Calculations
// =============================================
// Critical tests for medical calculation accuracy

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  calculateBMI,
  calculateGFR,
  calculateCalories,
  calculateIdealWeight,
  calculateBSA,
  calculateInfusion,
  calculateMAC,
  convertSteroid,
  calculateWarfarinDose,
  calculateCrCl,
  calculateCorrectedSodium,
  calculateAnionGap,
  calculatePediatricDose,
  parsePediatricDose,
  parseMaxDose,
  steroidConversions,
  macValues,
} from './calculations'

// ─────────────────────────────────────────
// BMI CALCULATOR TESTS
// ─────────────────────────────────────────

describe('calculateBMI', () => {
  describe('normal calculations', () => {
    it('should calculate BMI correctly for normal weight', () => {
      const result = calculateBMI(70, 175)
      expect(result.bmi).toBeCloseTo(22.9, 0)
      expect(result.category).toBe('Berat badan normal')
      expect(result.color).toBe('success')
    })

    it('should calculate BMI correctly for underweight', () => {
      const result = calculateBMI(50, 175)
      expect(result.bmi).toBeCloseTo(16.3, 0)
      expect(result.category).toBe('Berat badan kurang')
      expect(result.color).toBe('warning')
    })

    it('should calculate BMI correctly for overweight', () => {
      const result = calculateBMI(80, 175)
      expect(result.bmi).toBeCloseTo(26.1, 0)
      expect(result.category).toBe('Overweight')
      expect(result.color).toBe('warning')
    })

    it('should calculate BMI correctly for obesity', () => {
      const result = calculateBMI(100, 175)
      expect(result.bmi).toBeCloseTo(32.7, 0)
      expect(result.category).toBe('Obesitas')
      expect(result.color).toBe('danger')
    })
  })

  describe('edge cases', () => {
    it('should handle edge case at BMI 18.5', () => {
      const result = calculateBMI(56.7, 175)
      expect(result.bmi).toBeCloseTo(18.5, 0)
      expect(result.category).toBe('Berat badan normal')
    })

    it('should handle edge case at BMI 25', () => {
      const result = calculateBMI(76.6, 175)
      expect(result.bmi).toBeCloseTo(25, 0)
      expect(result.category).toBe('Overweight')
    })

    it('should handle edge case at BMI 30', () => {
      const result = calculateBMI(91.9, 175)
      expect(result.bmi).toBeCloseTo(30, 0)
      expect(result.category).toBe('Obesitas')
    })
  })

  describe('output validation', () => {
    it('should include interpretation text', () => {
      const result = calculateBMI(70, 175)
      expect(result.interpretation).toBeTruthy()
      expect(typeof result.interpretation).toBe('string')
    })

    it('should round BMI to 1 decimal place', () => {
      const result = calculateBMI(70.5, 175.3)
      expect(result.bmi.toString()).toMatch(/^\d+\.\d$/)
    })
  })
})

// ─────────────────────────────────────────
// GFR CALCULATOR TESTS
// ─────────────────────────────────────────

describe('calculateGFR', () => {
  describe('normal calculations', () => {
    it('should calculate GFR correctly for adult male', () => {
      const result = calculateGFR(40, 70, 1.0, 'male')
      expect(result.gfr).toBeGreaterThan(60)
      expect(result.stage).toBeDefined()
      expect(result.description).toBeDefined()
    })

    it('should calculate GFR correctly for adult female', () => {
      const result = calculateGFR(40, 60, 1.0, 'female')
      expect(result.gfr).toBeGreaterThan(50)
    })
  })

  describe('gender adjustment', () => {
    it('should adjust GFR for female (0.85 factor)', () => {
      const maleResult = calculateGFR(40, 70, 1.0, 'male')
      const femaleResult = calculateGFR(40, 70, 1.0, 'female')
      // Female GFR should be approximately 85% of male GFR
      expect(femaleResult.gfr).toBeLessThan(maleResult.gfr)
    })
  })

  describe('CKD staging', () => {
    it('should classify G1 (normal) correctly', () => {
      const result = calculateGFR(25, 80, 0.8, 'male')
      expect(result.gfr).toBeGreaterThanOrEqual(90)
      expect(result.stage).toBe('G1')
      expect(result.color).toBe('success')
    })

    it('should classify G5 (kidney failure) correctly', () => {
      const result = calculateGFR(80, 50, 3.0, 'male')
      expect(result.gfr).toBeLessThan(15)
      expect(result.stage).toBe('G5')
      expect(result.color).toBe('danger')
    })
  })
})

// ─────────────────────────────────────────
// CALORIE CALCULATOR TESTS
// ─────────────────────────────────────────

describe('calculateCalories', () => {
  describe('BMR calculations', () => {
    it('should calculate BMR correctly for male', () => {
      const result = calculateCalories(30, 70, 175, 'male', 'sedentary')
      expect(result.bmr).toBeGreaterThan(1500)
      expect(result.bmr).toBeLessThan(2000)
    })

    it('should calculate BMR correctly for female', () => {
      const result = calculateCalories(30, 60, 165, 'female', 'sedentary')
      expect(result.bmr).toBeGreaterThan(1200)
      expect(result.bmr).toBeLessThan(1600)
    })
  })

  describe('activity multipliers', () => {
    it('should apply activity multipliers correctly', () => {
      const base = calculateCalories(30, 70, 175, 'male', 'sedentary')
      const active = calculateCalories(30, 70, 175, 'male', 'active')
      expect(active.tdee).toBeGreaterThan(base.tdee)
    })

    it('should calculate higher TDEE for very active lifestyle', () => {
      const sedentary = calculateCalories(30, 70, 175, 'male', 'sedentary')
      const veryActive = calculateCalories(30, 70, 175, 'male', 'very_active')
      expect(veryActive.tdee).toBeGreaterThan(sedentary.tdee)
    })
  })

  describe('macronutrient output', () => {
    it('should return macronutrient ranges', () => {
      const result = calculateCalories(30, 70, 175, 'male', 'moderate')
      expect(result.protein).toContain('g')
      expect(result.carbs).toContain('g')
      expect(result.fat).toContain('g')
    })
  })
})

// ─────────────────────────────────────────
// IDEAL BODY WEIGHT TESTS
// ─────────────────────────────────────────

describe('calculateIdealWeight', () => {
  it('should calculate ideal weight for male', () => {
    const result = calculateIdealWeight(175, 'male')
    expect(result.devine).toBeGreaterThan(60)
    expect(result.devine).toBeLessThan(80)
    expect(result.robinson).toBeDefined()
    expect(result.miller).toBeDefined()
  })

  it('should calculate ideal weight for female', () => {
    const result = calculateIdealWeight(165, 'female')
    expect(result.devine).toBeGreaterThan(45)
    expect(result.devine).toBeLessThan(65)
  })

  it('should return BMI range', () => {
    const result = calculateIdealWeight(175, 'male')
    expect(result.bmiRange.min).toBeLessThan(result.bmiRange.max)
    expect(result.bmiRange.min).toBeGreaterThan(50)
  })

  it('should give higher ideal weight for taller people', () => {
    const short = calculateIdealWeight(160, 'male')
    const tall = calculateIdealWeight(180, 'male')
    expect(tall.devine).toBeGreaterThan(short.devine)
  })
})

// ─────────────────────────────────────────
// BSA CALCULATOR TESTS
// ─────────────────────────────────────────

describe('calculateBSA', () => {
  it('should calculate BSA using multiple formulas', () => {
    const result = calculateBSA(70, 175)
    expect(result.mosteller).toBeGreaterThan(1.5)
    expect(result.mosteller).toBeLessThan(2.5)
    expect(result.dubois).toBeGreaterThan(0)
    expect(result.haycock).toBeGreaterThan(0)
  })

  it('should give similar results across formulas', () => {
    const result = calculateBSA(70, 175)
    const values = [result.mosteller, result.dubois, result.haycock]
    const maxDiff = Math.max(...values) - Math.min(...values)
    expect(maxDiff).toBeLessThan(0.3)
  })

  it('should increase BSA with weight', () => {
    const light = calculateBSA(50, 175)
    const heavy = calculateBSA(90, 175)
    expect(heavy.mosteller).toBeGreaterThan(light.mosteller)
  })
})

// ─────────────────────────────────────────
// INFUSION CALCULATOR TESTS
// ─────────────────────────────────────────

describe('calculateInfusion', () => {
  it('should calculate flow rate correctly', () => {
    const result = calculateInfusion(1000, 8, 20)
    expect(result.flowRateMlHr).toBe(125)
  })

  it('should calculate drip rate correctly', () => {
    const result = calculateInfusion(1000, 8, 20)
    expect(result.dripRate).toBeCloseTo(41.7, 0)
  })

  it('should handle different drop factors', () => {
    const macroDrip = calculateInfusion(1000, 8, 20)
    const microDrip = calculateInfusion(1000, 8, 60)
    expect(microDrip.dripRate).toBeGreaterThan(macroDrip.dripRate)
  })

  it('should handle short infusion times', () => {
    const result = calculateInfusion(500, 0.5, 20)
    expect(result.flowRateMlHr).toBe(1000)
  })
})

// ─────────────────────────────────────────
// MAC (ANESTHESIA) CALCULATOR TESTS
// ─────────────────────────────────────────

describe('calculateMAC', () => {
  it('should return base MAC value', () => {
    const result = calculateMAC('sevoflurane', 40, 37, 0)
    expect(result.mac).toBe(macValues['sevoflurane'])
  })

  it('should adjust MAC for age', () => {
    const young = calculateMAC('sevoflurane', 30, 37, 0)
    const old = calculateMAC('sevoflurane', 70, 37, 0)
    expect(old.ageAdjustedMac).toBeLessThan(young.ageAdjustedMac)
  })

  it('should adjust MAC for nitrous oxide', () => {
    const withoutN2O = calculateMAC('sevoflurane', 40, 37, 0)
    const withN2O = calculateMAC('sevoflurane', 40, 37, 50)
    expect(withN2O.macWithN2O).toBeLessThan(withoutN2O.macWithN2O)
  })

  it('should work with different anesthetic agents', () => {
    const sevo = calculateMAC('sevoflurane', 40, 37, 0)
    const iso = calculateMAC('isoflurane', 40, 37, 0)
    const des = calculateMAC('desflurane', 40, 37, 0)
    expect(sevo.mac).not.toBe(iso.mac)
    expect(iso.mac).not.toBe(des.mac)
  })

  it('should return recommended concentration string', () => {
    const result = calculateMAC('sevoflurane', 40, 37, 0)
    expect(result.recommendedConcentration).toContain('%')
  })
})

// ─────────────────────────────────────────
// STEROID CONVERSION TESTS
// ─────────────────────────────────────────

describe('convertSteroid', () => {
  it('should convert prednisone to dexamethasone', () => {
    const result = convertSteroid('prednisone', 20, 'dexamethasone')
    expect(result).not.toBeNull()
    expect(result!.equivalentDose).toBeCloseTo(3, 0)
  })

  it('should convert hydrocortisone to prednisone', () => {
    const result = convertSteroid('hydrocortisone', 100, 'prednisone')
    expect(result).not.toBeNull()
    expect(result!.equivalentDose).toBeCloseTo(25, 0)
  })

  it('should return null for invalid steroid', () => {
    const result = convertSteroid('invalid', 10, 'prednisone')
    expect(result).toBeNull()
  })

  it('should include steroid info in result', () => {
    const result = convertSteroid('prednisone', 10, 'dexamethasone')
    expect(result!.fromInfo.name).toBe('Prednisone')
    expect(result!.toInfo.name).toBe('Dexamethasone')
  })

  it('should calculate prednisone equivalent', () => {
    const result = convertSteroid('hydrocortisone', 100, 'prednisone')
    expect(result!.prednisoneEquivalent).toBeCloseTo(25, 0)
  })

  it('should handle self-conversion', () => {
    const result = convertSteroid('prednisone', 10, 'prednisone')
    expect(result!.equivalentDose).toBe(10)
  })
})

// ─────────────────────────────────────────
// WARFARIN DOSING TESTS
// ─────────────────────────────────────────

describe('calculateWarfarinDose', () => {
  it('should recommend dose increase for low INR', () => {
    const result = calculateWarfarinDose(1.3, 2.0, 3.0)
    expect(result.action).toContain('Tingkatkan')
  })

  it('should maintain dose for therapeutic INR', () => {
    const result = calculateWarfarinDose(2.5, 2.0, 3.0)
    expect(result.action).toContain('Pertahankan')
  })

  it('should recommend dose reduction for high INR', () => {
    const result = calculateWarfarinDose(4.0, 2.0, 3.0)
    expect(result.action).toMatch(/Lewati|Kurangi/i)
  })

  it('should recommend vitamin K for very high INR', () => {
    const result = calculateWarfarinDose(7.0, 2.0, 3.0)
    expect(result.action).toContain('Vitamin K')
  })

  it('should require urgent consultation for critical INR', () => {
    const result = calculateWarfarinDose(10.0, 2.0, 3.0)
    expect(result.notes).toContain('HEMATOLOGI')
  })

  it('should specify next INR check timing', () => {
    const result = calculateWarfarinDose(2.5, 2.0, 3.0)
    expect(result.nextInr).toBeDefined()
  })

  it('should provide clinical notes', () => {
    const result = calculateWarfarinDose(2.5, 2.0, 3.0)
    expect(result.notes).toBeDefined()
    expect(result.notes.length).toBeGreaterThan(0)
  })
})

// ─────────────────────────────────────────
// PEDIATRIC DOSE TESTS
// ─────────────────────────────────────────

describe('parsePediatricDose', () => {
  it('should parse range dose with mg/kg/day', () => {
    const result = parsePediatricDose('10-20 mg/kg/hari')
    expect(result).not.toBeNull()
    expect(result!.min).toBe(10)
    expect(result!.max).toBe(20)
    expect(result!.unit).toBe('mg')
    expect(result!.perKg).toBe(true)
    expect(result!.perDay).toBe(true)
  })

  it('should parse single dose', () => {
    const result = parsePediatricDose('500 mg')
    expect(result).not.toBeNull()
    expect(result!.min).toBe(500)
    expect(result!.max).toBe(500)
    expect(result!.perKg).toBe(false)
  })

  it('should parse dose with mcg unit', () => {
    const result = parsePediatricDose('50-100 mcg/kg')
    expect(result).not.toBeNull()
    expect(result!.unit).toBe('mcg')
  })

  it('should return null for invalid format', () => {
    const result = parsePediatricDose('invalid')
    expect(result).toBeNull()
  })

  it('should handle empty string', () => {
    const result = parsePediatricDose('')
    expect(result).toBeNull()
  })
})

describe('parseMaxDose', () => {
  it('should parse max dose correctly', () => {
    const result = parseMaxDose('4000 mg')
    expect(result).not.toBeNull()
    expect(result!.value).toBe(4000)
    expect(result!.unit).toBe('mg')
  })

  it('should convert grams to mg', () => {
    const result = parseMaxDose('4 g')
    expect(result).not.toBeNull()
    expect(result!.value).toBe(4000)
    expect(result!.unit).toBe('mg')
  })

  it('should return null for null input', () => {
    const result = parseMaxDose(null)
    expect(result).toBeNull()
  })

  it('should handle dose without unit', () => {
    const result = parseMaxDose('4000')
    expect(result).not.toBeNull()
    expect(result!.value).toBe(4000)
    expect(result!.unit).toBe('mg')
  })
})

describe('calculatePediatricDose', () => {
  it('should calculate dose per kg', () => {
    const result = calculatePediatricDose(
      '10-20 mg/kg/hari',
      20,
      5,
      '500 mg',
      '2x sehari',
      null
    )
    expect(result).not.toBeNull()
    expect(result!.minDose).toBe(200)
    expect(result!.maxDose).toBe(400)
    expect(result!.unit).toBe('mg')
  })

  it('should cap dose at max dose', () => {
    const result = calculatePediatricDose(
      '20-30 mg/kg/hari',
      30,
      10,
      '500 mg',
      null,
      null
    )
    expect(result).not.toBeNull()
    expect(result!.maxDose).toBe(500)
    expect(result!.warnings.length).toBeGreaterThan(0)
  })

  it('should add warning for neonates', () => {
    const result = calculatePediatricDose(
      '10-20 mg/kg/hari',
      3,
      0.05,
      null,
      null,
      null
    )
    expect(result).not.toBeNull()
    expect(result!.warnings.some(w => w.includes('baru lahir'))).toBe(true)
  })

  it('should add warning for infants', () => {
    const result = calculatePediatricDose(
      '10-20 mg/kg/hari',
      8,
      0.5,
      null,
      null,
      null
    )
    expect(result).not.toBeNull()
    expect(result!.warnings.some(w => w.includes('< 1 tahun'))).toBe(true)
  })

  it('should warn about very low weight', () => {
    const result = calculatePediatricDose(
      '10-20 mg/kg/hari',
      2,
      0.5,
      null,
      null,
      null
    )
    expect(result).not.toBeNull()
    expect(result!.warnings.some(w => w.includes('sangat rendah'))).toBe(true)
  })

  it('should warn about weight > 40kg', () => {
    const result = calculatePediatricDose(
      '10-20 mg/kg/hari',
      45,
      12,
      null,
      null,
      null
    )
    expect(result).not.toBeNull()
    expect(result!.warnings.some(w => w.includes('dewasa'))).toBe(true)
  })

  it('should return formula string', () => {
    const result = calculatePediatricDose(
      '10-20 mg/kg/hari',
      20,
      5,
      null,
      '2x sehari',
      null
    )
    expect(result).not.toBeNull()
    expect(result!.formula).toContain('10-20')
    expect(result!.formula).toContain('20')
  })
})

// ─────────────────────────────────────────
// ELECTROLYTE CALCULATOR TESTS
// ─────────────────────────────────────────

describe('calculateCorrectedSodium', () => {
  it('should correct sodium for hyperglycemia', () => {
    const result = calculateCorrectedSodium(135, 400)
    expect(result.correctedForGlucose).toBeGreaterThan(135)
  })

  it('should not correct for normal glucose', () => {
    const result = calculateCorrectedSodium(140, 80)
    expect(result.correctedForGlucose).toBe(140)
  })

  it('should provide interpretation', () => {
    const normal = calculateCorrectedSodium(140, 100)
    expect(normal.interpretation).toContain('normal')

    const low = calculateCorrectedSodium(130, 100)
    expect(low.interpretation).toContain('Hiponatremia')

    const high = calculateCorrectedSodium(150, 100)
    expect(high.interpretation).toContain('Hipernatremia')
  })
})

describe('calculateAnionGap', () => {
  it('should calculate anion gap correctly', () => {
    const result = calculateAnionGap(140, 104, 24)
    expect(result.anionGap).toBe(12)
  })

  it('should identify normal anion gap', () => {
    const result = calculateAnionGap(140, 104, 24)
    expect(result.interpretation).toContain('normal')
  })

  it('should identify high anion gap', () => {
    const result = calculateAnionGap(140, 100, 14)
    expect(result.anionGap).toBeGreaterThan(12)
    expect(result.interpretation).toContain('HAGMA')
  })

  it('should identify low anion gap', () => {
    const result = calculateAnionGap(140, 110, 28)
    expect(result.anionGap).toBeLessThan(8)
    expect(result.interpretation).toContain('Low anion gap')
  })

  it('should correct for albumin when provided', () => {
    const result = calculateAnionGap(140, 104, 24, 2)
    expect(result.correctedGap).toBeGreaterThan(result.anionGap)
  })
})