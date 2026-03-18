// =============================================
// CALCULATOR TYPES
// =============================================

export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export interface CalculatorResultBase {
  isValid: boolean;
}

export interface DrugDose {
  id: string;
  indication: string | null;
  adultDose: string;
  pediatricDose: string | null;
  pediatricMinAge: string | null;
  pediatricMaxAge: string | null;
  maxDose: string | null;
  maxDoseUnit: string | null;
  frequency: string | null;
}

export interface DrugInfo {
  id: string;
  name: string;
  genericName: string | null;
  doses: DrugDose[];
}

// Steroid conversion type
export interface SteroidConversion {
  name: string;
  equivalentDose: number;
  antiInflammatory: number;
  mineralocorticoid: number;
  duration: string;
}

// Warfarin recommendation type
export interface WarfarinRecommendation {
  dose: number;
  action: string;
  nextInr: string;
  notes: string;
}

// Calculator categories for organization
export type CalculatorCategory = 'dosing' | 'renal' | 'nutrition' | 'anesthesia' | 'electrolyte';

export interface CalculatorMeta {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: CalculatorCategory;
  icon: string;
}