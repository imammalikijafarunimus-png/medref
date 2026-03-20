// =============================================
// MEDICAL CALCULATION FUNCTIONS
// Pure calculation logic - no UI dependencies
// These functions are tested independently
// =============================================

import type { Gender, ActivityLevel, SteroidConversion, WarfarinRecommendation } from './types'

// Re-export types for convenience
export type { Gender, ActivityLevel, SteroidConversion } from './types'

// =============================================
// PEDIATRIC DOSE CALCULATIONS
// =============================================

/**
 * Parse pediatric dose string to extract min, max, unit, and flags
 * @param doseStr - Dose string like "10-20 mg/kg/day" or "500 mg"
 * @returns Parsed dose info or null if invalid
 */
export function parsePediatricDose(doseStr: string): { 
  min: number
  max: number
  unit: string
  perKg: boolean
  perDay: boolean 
} | null {
  if (!doseStr || typeof doseStr !== 'string') return null
  
  const rangeMatch = doseStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(mg|mcg|g|unit|IU)?\s*\/?\s*(kg)?\/?\s*(hari|day)?/i)
  const singleMatch = doseStr.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|unit|IU)?\s*\/?\s*(kg)?\/?\s*(hari|day)?/i)
  
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2]),
      unit: rangeMatch[3] || 'mg',
      perKg: !!rangeMatch[4],
      perDay: !!rangeMatch[5],
    }
  } else if (singleMatch) {
    const val = parseFloat(singleMatch[1])
    return {
      min: val,
      max: val,
      unit: singleMatch[2] || 'mg',
      perKg: !!singleMatch[3],
      perDay: !!singleMatch[4],
    }
  }
  return null
}

/**
 * Parse max dose string to extract value and unit
 * @param maxStr - Max dose string like "4000 mg" or "4 g"
 * @returns Parsed max dose info or null if invalid
 */
export function parseMaxDose(maxStr: string | null): { value: number; unit: string } | null {
  if (!maxStr) return null
  const match = maxStr.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g)?/i)
  if (match) {
    let value = parseFloat(match[1])
    const unit = match[2] || 'mg'
    if (unit.toLowerCase() === 'g') {
      value = value * 1000
    }
    return { value, unit: 'mg' }
  }
  return null
}

export interface PediatricDoseResult {
  minDose: number
  maxDose: number
  maxAllowed: number | null
  unit: string
  frequency: string | null
  isWithinMax: boolean
  formula: string
  warnings: string[]
}

/**
 * Calculate pediatric dose based on weight
 * @param pediatricDoseStr - Pediatric dose string
 * @param weight - Weight in kg
 * @param age - Age in years (optional)
 * @param maxDoseStr - Maximum dose string (optional)
 * @param frequency - Dosing frequency (optional)
 * @param pediatricMinAge - Minimum age for dosing (optional)
 * @returns Calculated dose result or null if invalid
 */
export function calculatePediatricDose(
  pediatricDoseStr: string,
  weight: number,
  age: number | null,
  maxDoseStr: string | null,
  frequency: string | null,
  pediatricMinAge: string | null
): PediatricDoseResult | null {
  const doseInfo = parsePediatricDose(pediatricDoseStr)
  if (!doseInfo) return null

  const warnings: string[] = []
  let minDose = doseInfo.min
  let maxDose = doseInfo.max
  
  if (doseInfo.perKg) {
    minDose = doseInfo.min * weight
    maxDose = doseInfo.max * weight
  }

  const maxAllowed = parseMaxDose(maxDoseStr)
  const isWithinMax = maxAllowed ? maxDose <= maxAllowed.value : true
  
  if (!isWithinMax && maxAllowed) {
    warnings.push(`Dosis maksimal (${maxDose.toFixed(1)} mg) melebihi batas ${maxAllowed.value} mg/hari.`)
    maxDose = maxAllowed.value
    minDose = Math.min(minDose, maxDose)
  }

  if (age !== null) {
    if (age < 0.083) { // Less than 1 month
      warnings.push('Bayi baru lahir memerlukan penyesuaian dosis khusus.')
    } else if (age < 1) {
      warnings.push('Bayi < 1 tahun memerlukan pengawasan ketat.')
    }
    
    if (pediatricMinAge) {
      const minAgeMonths = parseFloat(pediatricMinAge)
      if (age * 12 < minAgeMonths) {
        warnings.push(`Dosis ini tidak direkomendasikan untuk usia < ${minAgeMonths} bulan.`)
      }
    }
  }

  if (weight < 3) {
    warnings.push('Berat badan sangat rendah. Perhatian khusus.')
  } else if (weight > 40) {
    warnings.push('Berat badan > 40 kg. Pertimbangkan dosis dewasa.')
  }

  const formula = doseInfo.perKg
    ? `${doseInfo.min}-${doseInfo.max} ${doseInfo.unit}/kg × ${weight} kg`
    : `${doseInfo.min}-${doseInfo.max} ${doseInfo.unit}`

  return {
    minDose: Math.round(minDose * 10) / 10,
    maxDose: Math.round(maxDose * 10) / 10,
    maxAllowed: maxAllowed?.value || null,
    unit: doseInfo.unit,
    frequency,
    isWithinMax,
    formula,
    warnings,
  }
}

// =============================================
// BMI CALCULATOR
// =============================================

export interface BMIResult {
  bmi: number
  category: string
  color: 'success' | 'warning' | 'danger'
  interpretation: string
}

/**
 * Calculate Body Mass Index
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @returns BMI result with category and interpretation
 */
export function calculateBMI(weight: number, height: number): BMIResult {
  if (weight <= 0 || height <= 0) {
    throw new Error('Weight and height must be positive values')
  }
  
  const heightM = height / 100
  const bmi = weight / (heightM * heightM)
  
  let category: string
  let color: 'success' | 'warning' | 'danger'
  let interpretation: string
  
  if (bmi < 18.5) {
    category = 'Berat badan kurang'
    color = 'warning'
    interpretation = 'Risiko malnutrisi. Pertimbangkan evaluasi lebih lanjut.'
  } else if (bmi < 25) {
    category = 'Berat badan normal'
    color = 'success'
    interpretation = 'BMI dalam rentang sehat.'
  } else if (bmi < 30) {
    category = 'Overweight'
    color = 'warning'
    interpretation = 'Risiko penyakit metabolik meningkat.'
  } else {
    category = 'Obesitas'
    color = 'danger'
    interpretation = 'Risiko tinggi penyakit kardiovaskular dan metabolik.'
  }
  
  return { 
    bmi: Math.round(bmi * 10) / 10, 
    category, 
    color,
    interpretation 
  }
}

// =============================================
// GFR CALCULATOR (Cockcroft-Gault)
// =============================================

export interface GFRResult {
  gfr: number
  stage: string
  description: string
  color: 'success' | 'info' | 'warning' | 'danger'
}

/**
 * Calculate Glomerular Filtration Rate using Cockcroft-Gault formula
 * @param age - Age in years
 * @param weight - Weight in kg
 * @param serumCr - Serum creatinine in mg/dL
 * @param gender - Gender ('male' or 'female')
 * @returns GFR result with CKD stage
 */
export function calculateGFR(
  age: number,
  weight: number,
  serumCr: number,
  gender: Gender
): GFRResult {
  if (age <= 0 || weight <= 0 || serumCr <= 0) {
    throw new Error('Age, weight, and serum creatinine must be positive values')
  }
  
  let gfr = ((140 - age) * weight) / (72 * serumCr)
  if (gender === 'female') {
    gfr *= 0.85
  }
  
  let stage: string
  let description: string
  let color: 'success' | 'info' | 'warning' | 'danger'
  
  if (gfr >= 90) {
    stage = 'G1'
    description = 'Fungsi ginjal normal atau tinggi'
    color = 'success'
  } else if (gfr >= 60) {
    stage = 'G2'
    description = 'Penurunan ringan'
    color = 'info'
  } else if (gfr >= 45) {
    stage = 'G3a'
    description = 'Penurunan sedang'
    color = 'warning'
  } else if (gfr >= 30) {
    stage = 'G3b'
    description = 'Penurunan sedang-berat'
    color = 'warning'
  } else if (gfr >= 15) {
    stage = 'G4'
    description = 'Penurunan berat'
    color = 'danger'
  } else {
    stage = 'G5'
    description = 'Gagal ginjal terminal'
    color = 'danger'
  }
  
  return { gfr: Math.round(gfr), stage, description, color }
}

// =============================================
// CALORIE CALCULATOR (Mifflin-St Jeor)
// =============================================

export interface CalorieResult {
  bmr: number
  tdee: number
  protein: string
  carbs: string
  fat: string
}

/**
 * Calculate daily calorie needs using Mifflin-St Jeor equation
 * @param age - Age in years
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @param gender - Gender ('male' or 'female')
 * @param activityLevel - Activity level
 * @returns Calorie calculation result with macros
 */
export function calculateCalories(
  age: number,
  weight: number,
  height: number,
  gender: Gender,
  activityLevel: ActivityLevel
): CalorieResult {
  if (age <= 0 || weight <= 0 || height <= 0) {
    throw new Error('Age, weight, and height must be positive values')
  }
  
  let bmr: number
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161
  }
  
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  
  const tdee = Math.round(bmr * activityMultipliers[activityLevel])
  
  const protein = `${Math.round(weight * 0.8)}-${Math.round(weight * 1.2)} g`
  const carbs = `${Math.round(tdee * 0.45 / 4)}-${Math.round(tdee * 0.65 / 4)} g`
  const fat = `${Math.round(tdee * 0.2 / 9)}-${Math.round(tdee * 0.35 / 9)} g`
  
  return { bmr: Math.round(bmr), tdee, protein, carbs, fat }
}

// =============================================
// IDEAL BODY WEIGHT CALCULATOR
// =============================================

export interface IdealWeightResult {
  devine: number
  robinson: number
  miller: number
  bmiRange: { min: number; max: number }
}

/**
 * Calculate ideal body weight using multiple formulas
 * @param height - Height in cm
 * @param gender - Gender ('male' or 'female')
 * @returns Ideal weight results from multiple formulas
 */
export function calculateIdealWeight(
  height: number,
  gender: Gender
): IdealWeightResult {
  if (height <= 0) {
    throw new Error('Height must be a positive value')
  }
  
  const heightInches = height / 2.54
  const heightOver5ft = heightInches - 60
  
  const devine = gender === 'male'
    ? 50 + 2.3 * heightOver5ft
    : 45.5 + 2.3 * heightOver5ft
  
  const robinson = gender === 'male'
    ? 52 + 1.9 * heightOver5ft
    : 49 + 1.7 * heightOver5ft
  
  const miller = gender === 'male'
    ? 56.2 + 1.41 * heightOver5ft
    : 53.1 + 1.36 * heightOver5ft
  
  const heightM = height / 100
  const bmiRange = {
    min: Math.round(18.5 * heightM * heightM * 10) / 10,
    max: Math.round(25 * heightM * heightM * 10) / 10,
  }
  
  return {
    devine: Math.round(devine * 10) / 10,
    robinson: Math.round(robinson * 10) / 10,
    miller: Math.round(miller * 10) / 10,
    bmiRange,
  }
}

// =============================================
// BODY SURFACE AREA CALCULATOR
// =============================================

export interface BSAResult {
  mosteller: number
  dubois: number
  haycock: number
}

/**
 * Calculate Body Surface Area using multiple formulas
 * @param weight - Weight in kg
 * @param height - Height in cm
 * @returns BSA results from multiple formulas
 */
export function calculateBSA(weight: number, height: number): BSAResult {
  if (weight <= 0 || height <= 0) {
    throw new Error('Weight and height must be positive values')
  }
  
  const mosteller = Math.sqrt((weight * height) / 3600)
  const dubois = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725)
  const haycock = 0.024265 * Math.pow(weight, 0.5378) * Math.pow(height, 0.3964)
  
  return {
    mosteller: Math.round(mosteller * 100) / 100,
    dubois: Math.round(dubois * 100) / 100,
    haycock: Math.round(haycock * 100) / 100,
  }
}

// =============================================
// INFUSION CALCULATOR
// =============================================

export interface InfusionResult {
  flowRateMlHr: number
  dripRate: number
  volumePerMin: number
}

/**
 * Calculate infusion rate
 * @param volume - Volume in mL
 * @param durationHours - Duration in hours
 * @param dropFactor - Drop factor (drops/mL)
 * @returns Infusion calculation results
 */
export function calculateInfusion(
  volume: number,
  durationHours: number,
  dropFactor: number
): InfusionResult {
  if (volume <= 0 || durationHours <= 0 || dropFactor <= 0) {
    throw new Error('Volume, duration, and drop factor must be positive values')
  }
  
  const flowRateMlHr = Math.round((volume / durationHours) * 10) / 10
  const volumePerMin = volume / durationHours / 60
  const dripRate = Math.round((volumePerMin * dropFactor) * 10) / 10
  
  return { flowRateMlHr, dripRate, volumePerMin }
}

// =============================================
// ANESTHESIA CALCULATOR (MAC)
// =============================================

export const macValues: Record<string, number> = {
  'sevoflurane': 1.8,
  'isoflurane': 1.15,
  'desflurane': 6.0,
  'halothane': 0.75,
  'enflurane': 1.68,
  'nitrous_oxide': 105,
}

export interface MACResult {
  mac: number
  ageAdjustedMac: number
  macWithN2O: number
  recommendedConcentration: string
}

/**
 * Calculate Minimum Alveolar Concentration (MAC)
 * @param agent - Anesthetic agent name
 * @param age - Age in years
 * @param temp - Body temperature in Celsius
 * @param nitrousOxide - N2O concentration percentage (0-100)
 * @returns MAC calculation results
 */
export function calculateMAC(
  agent: string,
  age: number,
  temp: number,
  nitrousOxide: number
): MACResult {
  if (age <= 0 || temp <= 0) {
    throw new Error('Age and temperature must be positive values')
  }
  
  if (nitrousOxide < 0 || nitrousOxide > 100) {
    throw new Error('Nitrous oxide must be between 0 and 100 percent')
  }
  
  const baseMAC = macValues[agent] || 1
  
  // Age adjustment: MAC decreases 6% per decade after 40
  let ageAdjustment = 1
  if (age > 40) {
    ageAdjustment = 1 - ((age - 40) / 10 * 0.06)
  }
  const ageAdjustedMac = Math.round(baseMAC * ageAdjustment * 100) / 100
  
  // Temperature adjustment (MAC decreases ~5% per degree below 37)
  let tempAdjustment = 1
  if (temp < 37) {
    tempAdjustment = 1 - ((37 - temp) * 0.05)
  }
  const tempAdjustedMac = ageAdjustedMac * tempAdjustment
  
  // N2O contribution (reduces MAC of volatile agent)
  const n2OContribution = nitrousOxide / 100 * macValues['nitrous_oxide'] / baseMAC
  const macWithN2O = tempAdjustedMac * (1 - n2OContribution * 0.5)
  
  const recommendedConcentration = `${Math.round(macWithN2O * 100) / 100}%`
  
  return {
    mac: baseMAC,
    ageAdjustedMac,
    macWithN2O: Math.round(macWithN2O * 100) / 100,
    recommendedConcentration,
  }
}

// =============================================
// STEROID CONVERSION
// =============================================

export const steroidConversions: Record<string, SteroidConversion> = {
  'prednisone': { name: 'Prednisone', equivalentDose: 5, antiInflammatory: 4, mineralocorticoid: 0.8, duration: '12-36 jam' },
  'prednisolone': { name: 'Prednisolone', equivalentDose: 5, antiInflammatory: 4, mineralocorticoid: 0.8, duration: '12-36 jam' },
  'methylprednisolone': { name: 'Methylprednisolone', equivalentDose: 4, antiInflammatory: 5, mineralocorticoid: 0.5, duration: '12-36 jam' },
  'dexamethasone': { name: 'Dexamethasone', equivalentDose: 0.75, antiInflammatory: 25, mineralocorticoid: 0, duration: '36-54 jam' },
  'betamethasone': { name: 'Betamethasone', equivalentDose: 0.75, antiInflammatory: 25, mineralocorticoid: 0, duration: '36-54 jam' },
  'hydrocortisone': { name: 'Hydrocortisone', equivalentDose: 20, antiInflammatory: 1, mineralocorticoid: 2, duration: '8-12 jam' },
  'cortisone': { name: 'Cortisone', equivalentDose: 25, antiInflammatory: 0.8, mineralocorticoid: 2, duration: '8-12 jam' },
  'triamcinolone': { name: 'Triamcinolone', equivalentDose: 4, antiInflammatory: 5, mineralocorticoid: 0, duration: '12-36 jam' },
  'deflazacort': { name: 'Deflazacort', equivalentDose: 6, antiInflammatory: 4, mineralocorticoid: 0, duration: '12-36 jam' },
}

export interface SteroidConversionResult {
  equivalentDose: number
  fromInfo: SteroidConversion
  toInfo: SteroidConversion
  prednisoneEquivalent: number
}

/**
 * Convert between different steroids
 * @param fromSteroid - Source steroid name
 * @param dose - Dose in mg
 * @param toSteroid - Target steroid name
 * @returns Conversion result or null if invalid steroid
 */
export function convertSteroid(
  fromSteroid: string, 
  dose: number, 
  toSteroid: string
): SteroidConversionResult | null {
  if (dose <= 0) {
    throw new Error('Dose must be a positive value')
  }
  
  const from = steroidConversions[fromSteroid]
  const to = steroidConversions[toSteroid]
  
  if (!from || !to) return null
  
  // Convert to prednisone equivalent first
  const prednisoneEquivalent = (dose / from.equivalentDose) * 5
  
  // Then convert to target steroid
  const equivalentDose = (prednisoneEquivalent / 5) * to.equivalentDose
  
  return {
    equivalentDose: Math.round(equivalentDose * 100) / 100,
    fromInfo: from,
    toInfo: to,
    prednisoneEquivalent: Math.round(prednisoneEquivalent * 100) / 100,
  }
}

// =============================================
// WARFARIN DOSING
// =============================================

/**
 * Calculate warfarin dose adjustment based on INR
 * @param currentInr - Current INR value
 * @param targetInrMin - Target INR minimum
 * @param targetInrMax - Target INR maximum
 * @returns Dosing recommendation
 */
export function calculateWarfarinDose(
  currentInr: number, 
  targetInrMin: number, 
  targetInrMax: number
): WarfarinRecommendation {
  if (currentInr <= 0 || targetInrMin <= 0 || targetInrMax <= 0) {
    throw new Error('INR values must be positive')
  }
  
  if (targetInrMin >= targetInrMax) {
    throw new Error('Target INR minimum must be less than maximum')
  }
  
  if (currentInr < 1.5) {
    return {
      action: 'Tingkatkan dosis 10-20%',
      nextInr: '5-7 hari',
      notes: 'Periksa faktor yang mempengaruhi (diet, obat lain, kepatuhan)',
    }
  } else if (currentInr < targetInrMin) {
    return {
      action: 'Tingkatkan dosis 5-10%',
      nextInr: '5-7 hari',
      notes: 'Evaluasi penyebab INR rendah',
    }
  } else if (currentInr >= targetInrMin && currentInr <= targetInrMax) {
    return {
      action: 'Pertahankan dosis saat ini',
      nextInr: '4-6 minggu',
      notes: 'INR terapeutik, lanjutkan monitoring rutin',
    }
  } else if (currentInr <= targetInrMax + 0.5) {
    return {
      action: 'Kurangi dosis 5-10% atau lewati 1 dosis',
      nextInr: '3-5 hari',
      notes: 'INR sedikit di atas target',
    }
  } else if (currentInr <= 5) {
    return {
      action: 'Lewati 1-2 dosis, kurangi dosis maintenance',
      nextInr: '2-3 hari',
      notes: 'Pertimbangkan Vitamin K oral 1-2.5mg jika perlu',
    }
  } else if (currentInr <= 9) {
    return {
      action: 'Lewati dosis, Vitamin K 2.5-5mg oral',
      nextInr: '24-48 jam',
      notes: 'Monitor perdarahan, pertimbangkan FFP jika perdarahan aktif',
    }
  } else {
    return {
      action: 'Hentikan warfarin, Vitamin K 10mg IV/slow infusion',
      nextInr: '12-24 jam',
      notes: 'Berikan FFP atau PCC jika perdarahan. KONSULTASI HEMATOLOGI',
    }
  }
}

// =============================================
// CREATININE CLEARANCE & eGFR
// =============================================

export interface CrClResult {
  cockcroftGault: number
  ckdEpi: number
  bsa: number
}

/**
 * Calculate creatinine clearance and eGFR
 * @param age - Age in years
 * @param weight - Weight in kg
 * @param scr - Serum creatinine in mg/dL
 * @param gender - Gender
 * @param height - Height in cm (optional, for BSA)
 * @returns CrCl and eGFR results
 */
export function calculateCrCl(
  age: number, 
  weight: number, 
  scr: number, 
  gender: Gender, 
  height?: number
): CrClResult {
  if (age <= 0 || weight <= 0 || scr <= 0) {
    throw new Error('Age, weight, and serum creatinine must be positive values')
  }
  
  // Cockcroft-Gault
  let cg = ((140 - age) * weight) / (72 * scr)
  if (gender === 'female') cg *= 0.85
  
  // CKD-EPI 2021 (without race)
  const kappa = gender === 'female' ? 0.7 : 0.9
  const alpha = gender === 'female' ? -0.241 : -0.302
  const genderFactor = gender === 'female' ? 1.012 : 1
  const scrNorm = scr / kappa
  let ckdEpi = 142 * Math.pow(Math.min(scrNorm, 1), alpha) * 
               Math.pow(Math.max(scrNorm, 1), -1.200) * 
               Math.pow(0.9938, age) * genderFactor
  
  // BSA (for indexed values)
  const bsa = height ? Math.sqrt((weight * height) / 3600) : 0
  
  return {
    cockcroftGault: Math.round(cg),
    ckdEpi: Math.round(ckdEpi),
    bsa: Math.round(bsa * 100) / 100,
  }
}

// =============================================
// CORRECTED SODIUM
// =============================================

export interface CorrectedSodiumResult {
  correctedForGlucose: number
  correctedForLipids: number | null
  correctedForProtein: number | null
  interpretation: string
}

/**
 * Calculate corrected sodium for hyperglycemia, hyperlipidemia, or hyperproteinemia
 * @param measuredNa - Measured sodium in mEq/L
 * @param glucose - Glucose in mg/dL
 * @param triglycerides - Triglycerides in mg/dL (optional)
 * @param protein - Total protein in g/dL (optional)
 * @returns Corrected sodium results
 */
export function calculateCorrectedSodium(
  measuredNa: number,
  glucose: number,
  triglycerides?: number,
  protein?: number
): CorrectedSodiumResult {
  if (measuredNa <= 0 || glucose < 0) {
    throw new Error('Sodium must be positive and glucose must be non-negative')
  }
  
  // Corrected for hyperglycemia (Katz formula)
  const glucoseExcess = Math.max(0, glucose - 100)
  const correctedForGlucose = measuredNa + (glucoseExcess / 100) * 1.6
  
  // Corrected for hyperlipidemia
  let correctedForLipids: number | null = null
  if (triglycerides && triglycerides > 150) {
    correctedForLipids = measuredNa + (triglycerides / 500)
  }
  
  // Corrected for hyperproteinemia
  let correctedForProtein: number | null = null
  if (protein && protein > 8) {
    correctedForProtein = measuredNa + ((protein - 8) * 0.25)
  }
  
  let interpretation = ''
  const finalNa = correctedForGlucose
  if (finalNa < 135) {
    interpretation = 'Hiponatremia - evaluasi volume status dan penyebab'
  } else if (finalNa > 145) {
    interpretation = 'Hipernatremia - evaluasi hidrasi dan penyebab'
  } else {
    interpretation = 'Sodium dalam rentang normal (135-145 mEq/L)'
  }
  
  return {
    correctedForGlucose: Math.round(correctedForGlucose * 10) / 10,
    correctedForLipids: correctedForLipids ? Math.round(correctedForLipids * 10) / 10 : null,
    correctedForProtein: correctedForProtein ? Math.round(correctedForProtein * 10) / 10 : null,
    interpretation,
  }
}

// =============================================
// ANION GAP
// =============================================

export interface AnionGapResult {
  anionGap: number
  correctedGap: number
  interpretation: string
}

/**
 * Calculate anion gap
 * @param na - Sodium in mEq/L
 * @param cl - Chloride in mEq/L
 * @param hco3 - Bicarbonate in mEq/L
 * @param albumin - Albumin in g/dL (optional)
 * @returns Anion gap result
 */
export function calculateAnionGap(
  na: number,
  cl: number,
  hco3: number,
  albumin?: number
): AnionGapResult {
  if (na <= 0 || cl <= 0 || hco3 <= 0) {
    throw new Error('Electrolyte values must be positive')
  }
  
  // Anion Gap = Na - (Cl + HCO3)
  const anionGap = na - (cl + hco3)
  
  // Corrected for albumin (normal 4 g/dL)
  let correctedGap = anionGap
  if (albumin !== undefined && albumin >= 0) {
    correctedGap = anionGap + (4 - albumin) * 2.5
  }
  
  let interpretation = ''
  if (anionGap > 12) {
    interpretation = 'High anion gap metabolic acidosis (HAGMA). Pertimbangkan: MUDPILES'
  } else if (anionGap < 8) {
    interpretation = 'Low anion gap. Pertimbangkan: hipoalbuminemia, multiple myeloma, lithium toxicity'
  } else {
    interpretation = 'Anion gap normal (8-12 mEq/L)'
  }
  
  return {
    anionGap: Math.round(anionGap * 10) / 10,
    correctedGap: Math.round(correctedGap * 10) / 10,
    interpretation,
  }
}