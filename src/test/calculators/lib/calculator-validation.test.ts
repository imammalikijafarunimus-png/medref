// ===========================================
// CALCULATOR VALIDATION SCHEMA TESTS
// ===========================================

import { describe, it, expect } from 'vitest'
import {
  bmiInputSchema,
  pediatricDoseInputSchema,
  gfrInputSchema,
  calorieInputSchema,
  warfarinInputSchema,
  steroidConversionInputSchema,
  validateInput,
} from '@/lib/calculator-validation'

describe('bmiInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid weight and height', () => {
      const result = bmiInputSchema.safeParse({ weight: 70, height: 175 })
      expect(result.success).toBe(true)
    })

    it('should accept minimum valid values', () => {
      const result = bmiInputSchema.safeParse({ weight: 1, height: 30 })
      expect(result.success).toBe(true)
    })

    it('should accept maximum valid values', () => {
      const result = bmiInputSchema.safeParse({ weight: 500, height: 300 })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject zero weight', () => {
      const result = bmiInputSchema.safeParse({ weight: 0, height: 175 })
      expect(result.success).toBe(false)
    })

    it('should reject negative weight', () => {
      const result = bmiInputSchema.safeParse({ weight: -70, height: 175 })
      expect(result.success).toBe(false)
    })

    it('should reject weight below minimum', () => {
      const result = bmiInputSchema.safeParse({ weight: 0.5, height: 175 })
      expect(result.success).toBe(false)
    })

    it('should reject zero height', () => {
      const result = bmiInputSchema.safeParse({ weight: 70, height: 0 })
      expect(result.success).toBe(false)
    })

    it('should reject height below minimum', () => {
      const result = bmiInputSchema.safeParse({ weight: 70, height: 25 })
      expect(result.success).toBe(false)
    })

    it('should reject weight above maximum', () => {
      const result = bmiInputSchema.safeParse({ weight: 600, height: 175 })
      expect(result.success).toBe(false)
    })

    it('should reject missing fields', () => {
      const result = bmiInputSchema.safeParse({ weight: 70 })
      expect(result.success).toBe(false)
    })

    it('should reject string values', () => {
      const result = bmiInputSchema.safeParse({ weight: '70', height: 175 })
      expect(result.success).toBe(false)
    })
  })
})

describe('pediatricDoseInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid dose string and weight', () => {
      const result = pediatricDoseInputSchema.safeParse({
        doseString: '10-20 mg/kg/hari',
        weight: 15,
        age: 5,
      })
      expect(result.success).toBe(true)
    })

    it('should accept optional fields as null', () => {
      const result = pediatricDoseInputSchema.safeParse({
        doseString: '500 mg',
        weight: 20,
        age: null,
        maxDose: null,
        frequency: null,
        pediatricMinAge: null,
      })
      expect(result.success).toBe(true)
    })

    it('should accept minimum valid weight', () => {
      const result = pediatricDoseInputSchema.safeParse({
        doseString: '10 mg/kg',
        weight: 0.5,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject dose string without numbers', () => {
      const result = pediatricDoseInputSchema.safeParse({
        doseString: 'invalid dose',
        weight: 15,
      })
      expect(result.success).toBe(false)
    })

    it('should reject empty dose string', () => {
      const result = pediatricDoseInputSchema.safeParse({
        doseString: '',
        weight: 15,
      })
      expect(result.success).toBe(false)
    })

    it('should reject age above 18', () => {
      const result = pediatricDoseInputSchema.safeParse({
        doseString: '10 mg/kg',
        weight: 15,
        age: 25,
      })
      expect(result.success).toBe(false)
    })

    it('should reject weight above maximum', () => {
      const result = pediatricDoseInputSchema.safeParse({
        doseString: '10 mg/kg',
        weight: 250,
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('gfrInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid GFR inputs', () => {
      const result = gfrInputSchema.safeParse({
        age: 50,
        weight: 70,
        serumCreatinine: 1.2,
        gender: 'male',
      })
      expect(result.success).toBe(true)
    })

    it('should accept female gender', () => {
      const result = gfrInputSchema.safeParse({
        age: 45,
        weight: 60,
        serumCreatinine: 0.9,
        gender: 'female',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject invalid gender', () => {
      const result = gfrInputSchema.safeParse({
        age: 50,
        weight: 70,
        serumCreatinine: 1.0,
        gender: 'other',
      })
      expect(result.success).toBe(false)
    })

    it('should reject zero creatinine', () => {
      const result = gfrInputSchema.safeParse({
        age: 50,
        weight: 70,
        serumCreatinine: 0,
        gender: 'male',
      })
      expect(result.success).toBe(false)
    })

    it('should reject creatinine below minimum', () => {
      const result = gfrInputSchema.safeParse({
        age: 50,
        weight: 70,
        serumCreatinine: 0.05,
        gender: 'male',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('calorieInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid calorie inputs', () => {
      const result = calorieInputSchema.safeParse({
        age: 30,
        weight: 75,
        height: 175,
        gender: 'male',
        activityLevel: 'moderate',
      })
      expect(result.success).toBe(true)
    })

    it('should accept all activity levels', () => {
      const levels = ['sedentary', 'light', 'moderate', 'active', 'very_active']
      levels.forEach(level => {
        const result = calorieInputSchema.safeParse({
          age: 30,
          weight: 75,
          height: 175,
          gender: 'male',
          activityLevel: level,
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('invalid inputs', () => {
    it('should reject invalid activity level', () => {
      const result = calorieInputSchema.safeParse({
        age: 30,
        weight: 75,
        height: 175,
        gender: 'male',
        activityLevel: 'extreme',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('warfarinInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid warfarin inputs', () => {
      const result = warfarinInputSchema.safeParse({
        currentInr: 2.5,
        targetInrMin: 2.0,
        targetInrMax: 3.0,
      })
      expect(result.success).toBe(true)
    })

    it('should accept higher target range', () => {
      const result = warfarinInputSchema.safeParse({
        currentInr: 3.0,
        targetInrMin: 2.5,
        targetInrMax: 3.5,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('should reject when targetMin >= targetMax', () => {
      const result = warfarinInputSchema.safeParse({
        currentInr: 2.5,
        targetInrMin: 3.0,
        targetInrMax: 2.0,
      })
      expect(result.success).toBe(false)
    })

    it('should reject when targetMin equals targetMax', () => {
      const result = warfarinInputSchema.safeParse({
        currentInr: 2.5,
        targetInrMin: 3.0,
        targetInrMax: 3.0,
      })
      expect(result.success).toBe(false)
    })

    it('should reject INR below minimum', () => {
      const result = warfarinInputSchema.safeParse({
        currentInr: 0.3,
        targetInrMin: 2.0,
        targetInrMax: 3.0,
      })
      expect(result.success).toBe(false)
    })

    it('should reject INR above maximum', () => {
      const result = warfarinInputSchema.safeParse({
        currentInr: 25,
        targetInrMin: 2.0,
        targetInrMax: 3.0,
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('steroidConversionInputSchema', () => {
  describe('valid inputs', () => {
    it('should accept valid steroid conversion', () => {
      const result = steroidConversionInputSchema.safeParse({
        fromSteroid: 'prednisone',
        dose: 10,
        toSteroid: 'dexamethasone',
      })
      expect(result.success).toBe(true)
    })

    it('should accept all valid steroids', () => {
      const steroids = ['prednisone', 'prednisolone', 'dexamethasone', 
                       'hydrocortisone', 'methylprednisolone', 'betamethasone']
      steroids.forEach(steroid => {
        const result = steroidConversionInputSchema.safeParse({
          fromSteroid: steroid,
          dose: 10,
          toSteroid: 'prednisone',
        })
        expect(result.success).toBe(true)
      })
    })
  })

  describe('invalid inputs', () => {
    it('should reject invalid steroid name', () => {
      const result = steroidConversionInputSchema.safeParse({
        fromSteroid: 'invalid_steroid',
        dose: 10,
        toSteroid: 'prednisone',
      })
      expect(result.success).toBe(false)
    })

    it('should reject zero dose', () => {
      const result = steroidConversionInputSchema.safeParse({
        fromSteroid: 'prednisone',
        dose: 0,
        toSteroid: 'dexamethasone',
      })
      expect(result.success).toBe(false)
    })

    it('should reject negative dose', () => {
      const result = steroidConversionInputSchema.safeParse({
        fromSteroid: 'prednisone',
        dose: -10,
        toSteroid: 'dexamethasone',
      })
      expect(result.success).toBe(false)
    })
  })
})

describe('validateInput helper', () => {
  it('should return success with data for valid input', () => {
    const result = validateInput(bmiInputSchema, { weight: 70, height: 175 })
    expect(result.success).toBe(true)
    expect(result.data).toEqual({ weight: 70, height: 175 })
    expect(result.errors).toBeUndefined()
  })

  it('should return errors for invalid input', () => {
    const result = validateInput(bmiInputSchema, { weight: 0, height: 0 })
    expect(result.success).toBe(false)
    expect(result.data).toBeUndefined()
    expect(result.errors).toBeDefined()
    expect(Object.keys(result.errors!).length).toBeGreaterThan(0)
  })

  it('should collect all validation errors', () => {
    const result = validateInput(bmiInputSchema, {})
    expect(result.success).toBe(false)
    expect(Object.keys(result.errors!).length).toBe(2) // weight and height
  })
})