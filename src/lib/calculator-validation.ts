// =============================================
// MEDICAL CALCULATOR VALIDATION SCHEMAS
// Using Zod for runtime validation
// =============================================

import { z } from 'zod'

// =============================================
// COMMON FIELD SCHEMAS
// =============================================

export const positiveNumber = z.number().positive({ message: 'Nilai harus positif' })

export const positiveNumberWithMax = (max: number, unit: string = '') => 
  z.number()
    .positive({ message: 'Nilai harus positif' })
    .max(max, { message: `Nilai tidak boleh lebih dari ${max}${unit}` })

export const nonNegativeNumber = z.number().nonnegative({ message: 'Nilai tidak boleh negatif' })

export const genderSchema = z.enum(['male', 'female'] as const, {
  message: 'Jenis kelamin harus "male" atau "female"',
})

export const activityLevelSchema = z.enum(
  ['sedentary', 'light', 'moderate', 'active', 'very_active'] as const,
  {
    message: 'Level aktivitas tidak valid',
  }
)

// =============================================
// BMI CALCULATOR SCHEMA
// =============================================

export const bmiInputSchema = z.object({
  weight: positiveNumberWithMax(500, ' kg')
    .refine(val => val >= 1, { message: 'Berat badan minimal 1 kg' }),
  height: positiveNumberWithMax(300, ' cm')
    .refine(val => val >= 30, { message: 'Tinggi badan minimal 30 cm' }),
})

export type BMIInput = z.infer<typeof bmiInputSchema>

// =============================================
// PEDIATRIC DOSE CALCULATOR SCHEMA
// =============================================

export const pediatricDoseInputSchema = z.object({
  doseString: z.string()
    .trim()
    .min(1, { message: 'String dosis tidak boleh kosong' })
    .max(200, { message: 'String dosis terlalu panjang' })
    .regex(/\d/, { message: 'String dosis harus mengandung angka' }),
  weight: positiveNumberWithMax(200, ' kg')
    .refine(val => val >= 0.5, { message: 'Berat badan minimal 0.5 kg' }),
  age: z.number()
    .min(0, { message: 'Usia tidak boleh negatif' })
    .max(18, { message: 'Kalkulator pediatrik untuk usia 0-18 tahun' })
    .optional()
    .nullable(),
  maxDose: z.string().max(50).optional().nullable(),
  frequency: z.string().max(100).optional().nullable(),
  pediatricMinAge: z.string().max(50).optional().nullable(),
})

export type PediatricDoseInput = z.infer<typeof pediatricDoseInputSchema>

// =============================================
// GFR CALCULATOR SCHEMA
// =============================================

export const gfrInputSchema = z.object({
  age: positiveNumberWithMax(150, ' tahun')
    .refine(val => val >= 1, { message: 'Usia minimal 1 tahun' }),
  weight: positiveNumberWithMax(300, ' kg')
    .refine(val => val >= 1, { message: 'Berat badan minimal 1 kg' }),
  serumCreatinine: positiveNumberWithMax(25, ' mg/dL')
    .refine(val => val >= 0.1, { message: 'Kreatinin serum minimal 0.1 mg/dL' }),
  gender: genderSchema,
})

export type GFRInput = z.infer<typeof gfrInputSchema>

// =============================================
// CALORIE CALCULATOR SCHEMA
// =============================================

export const calorieInputSchema = z.object({
  age: positiveNumberWithMax(150, ' tahun')
    .refine(val => val >= 1, { message: 'Usia minimal 1 tahun' }),
  weight: positiveNumberWithMax(500, ' kg')
    .refine(val => val >= 1, { message: 'Berat badan minimal 1 kg' }),
  height: positiveNumberWithMax(300, ' cm')
    .refine(val => val >= 50, { message: 'Tinggi badan minimal 50 cm' }),
  gender: genderSchema,
  activityLevel: activityLevelSchema,
})

export type CalorieInput = z.infer<typeof calorieInputSchema>

// =============================================
// IDEAL WEIGHT CALCULATOR SCHEMA
// =============================================

export const idealWeightInputSchema = z.object({
  height: positiveNumberWithMax(300, ' cm')
    .refine(val => val >= 50, { message: 'Tinggi badan minimal 50 cm' }),
  gender: genderSchema,
})

export type IdealWeightInput = z.infer<typeof idealWeightInputSchema>

// =============================================
// INFUSION CALCULATOR SCHEMA
// =============================================

export const infusionInputSchema = z.object({
  volume: positiveNumberWithMax(10000, ' mL')
    .refine(val => val >= 1, { message: 'Volume minimal 1 mL' }),
  durationHours: positiveNumberWithMax(168, ' jam') // Max 1 week
    .refine(val => val >= 0.1, { message: 'Durasi minimal 0.1 jam (6 menit)' }),
  dropFactor: z.number()
    .int({ message: 'Drop factor harus bilangan bulat' })
    .positive({ message: 'Drop factor harus positif' })
    .max(60, { message: 'Drop factor maksimal 60' }),
})

export type InfusionInput = z.infer<typeof infusionInputSchema>

// =============================================
// STEROID CONVERSION SCHEMA
// =============================================

export const validSteroids = [
  'prednisone',
  'prednisolone',
  'methylprednisolone',
  'dexamethasone',
  'betamethasone',
  'hydrocortisone',
  'cortisone',
  'triamcinolone',
  'deflazacort',
] as const

export const steroidConversionInputSchema = z.object({
  fromSteroid: z.enum(validSteroids, {
    message: 'Steroid sumber tidak valid',
  }),
  dose: positiveNumberWithMax(10000, ' mg'),
  toSteroid: z.enum(validSteroids, {
    message: 'Steroid target tidak valid',
  }),
})

export type SteroidConversionInput = z.infer<typeof steroidConversionInputSchema>

// =============================================
// WARFARIN DOSING SCHEMA
// =============================================

export const warfarinInputSchema = z.object({
  currentInr: positiveNumberWithMax(20, '')
    .refine(val => val >= 0.5, { message: 'INR minimal 0.5' }),
  targetInrMin: positiveNumberWithMax(5, '')
    .refine(val => val >= 1.5, { message: 'Target INR minimal 1.5' }),
  targetInrMax: positiveNumberWithMax(5, '')
    .refine(val => val >= 2.0, { message: 'Target INR maksimal minimal 2.0' }),
}).refine(
  (data) => data.targetInrMin < data.targetInrMax,
  { message: 'Target INR minimum harus lebih kecil dari maksimum' }
)

export type WarfarinInput = z.infer<typeof warfarinInputSchema>

// =============================================
// CORRECTED SODIUM SCHEMA
// =============================================

export const correctedSodiumInputSchema = z.object({
  measuredNa: positiveNumberWithMax(200, ' mEq/L')
    .refine(val => val >= 100, { message: 'Sodium minimal 100 mEq/L' }),
  glucose: nonNegativeNumber.max(1000, { message: 'Glukosa maksimal 1000 mg/dL' }),
  triglycerides: nonNegativeNumber.max(5000, { message: 'Trigliserida maksimal 5000 mg/dL' }).optional(),
  protein: nonNegativeNumber.max(15, { message: 'Protein maksimal 15 g/dL' }).optional(),
})

export type CorrectedSodiumInput = z.infer<typeof correctedSodiumInputSchema>

// =============================================
// ANION GAP SCHEMA
// =============================================

export const anionGapInputSchema = z.object({
  sodium: positiveNumberWithMax(200, ' mEq/L')
    .refine(val => val >= 100, { message: 'Sodium minimal 100 mEq/L' }),
  chloride: positiveNumberWithMax(160, ' mEq/L')
    .refine(val => val >= 50, { message: 'Klorida minimal 50 mEq/L' }),
  bicarbonate: positiveNumberWithMax(60, ' mEq/L')
    .refine(val => val >= 5, { message: 'Bikarbonat minimal 5 mEq/L' }),
  albumin: nonNegativeNumber.max(10, { message: 'Albumin maksimal 10 g/dL' }).optional(),
})

export type AnionGapInput = z.infer<typeof anionGapInputSchema>

// =============================================
// MAC (ANESTHESIA) CALCULATOR SCHEMA
// =============================================

export const validAnestheticAgents = [
  'sevoflurane',
  'isoflurane',
  'desflurane',
  'halothane',
  'enflurane',
  'nitrous_oxide',
] as const

export const macInputSchema = z.object({
  agent: z.enum(validAnestheticAgents, {
    message: 'Agen anestesi tidak valid',
  }),
  age: positiveNumberWithMax(150, ' tahun'),
  temperature: z.number()
    .min(30, { message: 'Suhu minimal 30°C' })
    .max(45, { message: 'Suhu maksimal 45°C' }),
  nitrousOxide: z.number()
    .min(0, { message: 'Konsentrasi N2O tidak boleh negatif' })
    .max(100, { message: 'Konsentrasi N2O maksimal 100%' }),
})

export type MACInput = z.infer<typeof macInputSchema>

// =============================================
// VALIDATION HELPER FUNCTIONS
// =============================================

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: Record<string, string[]>
}

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors: Record<string, string[]> = {}
  result.error.issues.forEach((err) => {
  const path = err.path.join('.')
  if (!errors[path]) {
    errors[path] = []
  }
  errors[path].push(err.message)
})
  
  return { success: false, errors }
}

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Format validation errors for display
export function formatValidationErrors(
  errors: Record<string, string[]>
): string[] {
  const formatted: string[] = []
  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach(msg => {
      formatted.push(`${field}: ${msg}`)
    })
  })
  return formatted
}