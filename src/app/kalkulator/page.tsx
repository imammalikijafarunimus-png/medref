'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Calculator, Baby, Activity, Droplets, Flame, Scale, 
  AlertTriangle, Info, Heart, User, RefreshCw, Pill,
  Syringe, Timer, Beaker, Percent, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// =============================================
// TYPES
// =============================================
interface DrugDose {
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

interface DrugInfo {
  id: string;
  name: string;
  genericName: string | null;
  doses: DrugDose[];
}

type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Parse dosis pediatrik (contoh: "10-15 mg/kg" atau "20 mg/kg/hari")
function parsePediatricDose(doseStr: string): { min: number; max: number; unit: string; perKg: boolean; perDay: boolean } | null {
  if (!doseStr) return null;
  
  const rangeMatch = doseStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(mg|mcg|g|unit|IU)?\s*\/?\s*(kg)?\/?\s*(hari|day)?/i);
  const singleMatch = doseStr.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g|unit|IU)?\s*\/?\s*(kg)?\/?\s*(hari|day)?/i);
  
  if (rangeMatch) {
    return {
      min: parseFloat(rangeMatch[1]),
      max: parseFloat(rangeMatch[2]),
      unit: rangeMatch[3] || 'mg',
      perKg: !!rangeMatch[4],
      perDay: !!rangeMatch[5],
    };
  } else if (singleMatch) {
    const val = parseFloat(singleMatch[1]);
    return {
      min: val,
      max: val,
      unit: singleMatch[2] || 'mg',
      perKg: !!singleMatch[3],
      perDay: !!singleMatch[4],
    };
  }
  return null;
}

// Parse max dose (contoh: "4000 mg" atau "4 g")
function parseMaxDose(maxStr: string | null): { value: number; unit: string } | null {
  if (!maxStr) return null;
  const match = maxStr.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|g)?/i);
  if (match) {
    let value = parseFloat(match[1]);
    const unit = match[2] || 'mg';
    if (unit.toLowerCase() === 'g') {
      value = value * 1000;
    }
    return { value, unit: 'mg' };
  }
  return null;
}

// =============================================
// BMI CALCULATOR
// =============================================
function calculateBMI(weight: number, height: number): { bmi: number; category: string; color: string } {
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  
  let category: string;
  let color: string;
  
  if (bmi < 18.5) {
    category = 'Berat badan kurang';
    color = 'text-amber-600';
  } else if (bmi < 25) {
    category = 'Berat badan normal';
    color = 'text-emerald-600';
  } else if (bmi < 30) {
    category = 'Berat badan berlebih (overweight)';
    color = 'text-orange-600';
  } else {
    category = 'Obesitas';
    color = 'text-rose-600';
  }
  
  return { bmi: Math.round(bmi * 10) / 10, category, color };
}

// =============================================
// GFR CALCULATOR (Cockcroft-Gault)
// =============================================
function calculateGFR(
  age: number,
  weight: number,
  serumCr: number,
  gender: Gender
): { gfr: number; stage: string; description: string; color: string } {
  let gfr = ((140 - age) * weight) / (72 * serumCr);
  if (gender === 'female') {
    gfr *= 0.85;
  }
  
  let stage: string;
  let description: string;
  let color: string;
  
  if (gfr >= 90) {
    stage = 'G1';
    description = 'Fungsi ginjal normal atau tinggi';
    color = 'text-emerald-600';
  } else if (gfr >= 60) {
    stage = 'G2';
    description = 'Penurunan ringan fungsi ginjal';
    color = 'text-lime-600';
  } else if (gfr >= 45) {
    stage = 'G3a';
    description = 'Penurunan sedang hingga berat';
    color = 'text-amber-600';
  } else if (gfr >= 30) {
    stage = 'G3b';
    description = 'Penurunan sedang hingga berat';
    color = 'text-orange-600';
  } else if (gfr >= 15) {
    stage = 'G4';
    description = 'Penurunan berat fungsi ginjal';
    color = 'text-rose-600';
  } else {
    stage = 'G5';
    description = 'Gagal ginjal terminal';
    color = 'text-red-600';
  }
  
  return { gfr: Math.round(gfr), stage, description, color };
}

// =============================================
// CALORIE CALCULATOR (Mifflin-St Jeor)
// =============================================
function calculateCalories(
  age: number,
  weight: number,
  height: number,
  gender: Gender,
  activityLevel: ActivityLevel
): { bmr: number; tdee: number; protein: string; carbs: string; fat: string } {
  let bmr: number;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  
  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
  
  const protein = `${Math.round(weight * 0.8)}-${Math.round(weight * 1.2)} g`;
  const carbs = `${Math.round(tdee * 0.45 / 4)}-${Math.round(tdee * 0.65 / 4)} g`;
  const fat = `${Math.round(tdee * 0.2 / 9)}-${Math.round(tdee * 0.35 / 9)} g`;
  
  return { bmr: Math.round(bmr), tdee, protein, carbs, fat };
}

// =============================================
// IDEAL BODY WEIGHT CALCULATOR
// =============================================
function calculateIdealWeight(
  height: number,
  gender: Gender
): { devine: number; robinson: number; miller: number; bmiRange: { min: number; max: number } } {
  const heightInches = height / 2.54;
  const heightOver5ft = heightInches - 60;
  
  const devine = gender === 'male'
    ? 50 + 2.3 * heightOver5ft
    : 45.5 + 2.3 * heightOver5ft;
  
  const robinson = gender === 'male'
    ? 52 + 1.9 * heightOver5ft
    : 49 + 1.7 * heightOver5ft;
  
  const miller = gender === 'male'
    ? 56.2 + 1.41 * heightOver5ft
    : 53.1 + 1.36 * heightOver5ft;
  
  const heightM = height / 100;
  const bmiRange = {
    min: Math.round(18.5 * heightM * heightM * 10) / 10,
    max: Math.round(25 * heightM * heightM * 10) / 10,
  };
  
  return {
    devine: Math.round(devine * 10) / 10,
    robinson: Math.round(robinson * 10) / 10,
    miller: Math.round(miller * 10) / 10,
    bmiRange,
  };
}

// =============================================
// BODY SURFACE AREA CALCULATOR
// =============================================
function calculateBSA(weight: number, height: number): { mosteller: number; dubois: number; haycock: number } {
  const mosteller = Math.sqrt((weight * height) / 3600);
  const dubois = 0.007184 * Math.pow(weight, 0.425) * Math.pow(height, 0.725);
  const haycock = 0.024265 * Math.pow(weight, 0.5378) * Math.pow(height, 0.3964);
  
  return {
    mosteller: Math.round(mosteller * 100) / 100,
    dubois: Math.round(dubois * 100) / 100,
    haycock: Math.round(haycock * 100) / 100,
  };
}

// =============================================
// INFUSION CALCULATOR
// =============================================
function calculateInfusion(
  volume: number,
  duration: number,
  dropFactor: number
): { flowRateMlHr: number; dripRate: number; volumePerMin: number } {
  const flowRateMlHr = Math.round((volume / duration) * 60 * 10) / 10;
  const volumePerMin = volume / duration / 60;
  const dripRate = Math.round((volumePerMin * dropFactor) * 10) / 10;
  
  return { flowRateMlHr, dripRate, volumePerMin };
}

// =============================================
// ANESTHESIA CALCULATORS
// =============================================

// MAC (Minimum Alveolar Concentration)
const macValues: Record<string, number> = {
  'sevoflurane': 1.8,
  'isoflurane': 1.15,
  'desflurane': 6.0,
  'halothane': 0.75,
  'enflurane': 1.68,
  'nitrous_oxide': 105, // Actually 105% but used as reference
};

function calculateMAC(
  agent: string,
  age: number,
  temp: number,
  nitrousOxide: number // percentage of N2O used
): { mac: number; ageAdjustedMac: number; macWithN2O: number; recommendedConcentration: string } {
  const baseMAC = macValues[agent] || 1;
  
  // Age adjustment: MAC decreases 6% per decade after 40
  let ageAdjustment = 1;
  if (age > 40) {
    ageAdjustment = 1 - ((age - 40) / 10 * 0.06);
  }
  const ageAdjustedMac = Math.round(baseMAC * ageAdjustment * 100) / 100;
  
  // Temperature adjustment (MAC decreases ~5% per degree below 37)
  let tempAdjustment = 1;
  if (temp < 37) {
    tempAdjustment = 1 - ((37 - temp) * 0.05);
  }
  const tempAdjustedMac = ageAdjustedMac * tempAdjustment;
  
  // N2O contribution (reduces MAC of volatile agent)
  const n2OContribution = nitrousOxide / 100 * macValues['nitrous_oxide'] / baseMAC;
  const macWithN2O = tempAdjustedMac * (1 - n2OContribution * 0.5);
  
  // Recommended concentration for 1 MAC
  const recommendedConcentration = `${Math.round(macWithN2O * 100) / 100}%`;
  
  return {
    mac: baseMAC,
    ageAdjustedMac,
    macWithN2O: Math.round(macWithN2O * 100) / 100,
    recommendedConcentration,
  };
}

// =============================================
// STEROID CONVERSION
// =============================================
interface SteroidConversion {
  name: string;
  equivalentDose: number; // mg equivalent to 5mg prednisone
  antiInflammatory: number;
  mineralocorticoid: number;
  duration: string;
}

const steroidConversions: Record<string, SteroidConversion> = {
  'prednisone': { name: 'Prednisone', equivalentDose: 5, antiInflammatory: 4, mineralocorticoid: 0.8, duration: '12-36 jam' },
  'prednisolone': { name: 'Prednisolone', equivalentDose: 5, antiInflammatory: 4, mineralocorticoid: 0.8, duration: '12-36 jam' },
  'methylprednisolone': { name: 'Methylprednisolone', equivalentDose: 4, antiInflammatory: 5, mineralocorticoid: 0.5, duration: '12-36 jam' },
  'dexamethasone': { name: 'Dexamethasone', equivalentDose: 0.75, antiInflammatory: 25, mineralocorticoid: 0, duration: '36-54 jam' },
  'betamethasone': { name: 'Betamethasone', equivalentDose: 0.75, antiInflammatory: 25, mineralocorticoid: 0, duration: '36-54 jam' },
  'hydrocortisone': { name: 'Hydrocortisone', equivalentDose: 20, antiInflammatory: 1, mineralocorticoid: 2, duration: '8-12 jam' },
  'cortisone': { name: 'Cortisone', equivalentDose: 25, antiInflammatory: 0.8, mineralocorticoid: 2, duration: '8-12 jam' },
  'triamcinolone': { name: 'Triamcinolone', equivalentDose: 4, antiInflammatory: 5, mineralocorticoid: 0, duration: '12-36 jam' },
  'deflazacort': { name: 'Deflazacort', equivalentDose: 6, antiInflammatory: 4, mineralocorticoid: 0, duration: '12-36 jam' },
};

function convertSteroid(fromSteroid: string, dose: number, toSteroid: string): { 
  equivalentDose: number; 
  fromInfo: SteroidConversion; 
  toInfo: SteroidConversion;
  prednisoneEquivalent: number;
} {
  const from = steroidConversions[fromSteroid];
  const to = steroidConversions[toSteroid];
  
  // Convert to prednisone equivalent first
  const prednisoneEquivalent = (dose / from.equivalentDose) * 5;
  
  // Then convert to target steroid
  const equivalentDose = (prednisoneEquivalent / 5) * to.equivalentDose;
  
  return {
    equivalentDose: Math.round(equivalentDose * 100) / 100,
    fromInfo: from,
    toInfo: to,
    prednisoneEquivalent: Math.round(prednisoneEquivalent * 100) / 100,
  };
}

// =============================================
// WARFARIN/ANTICOAGULANT DOSING
// =============================================
interface WarfarinRecommendation {
  dose: number;
  action: string;
  nextInr: string;
  notes: string;
}

function calculateWarfarinDose(currentInr: number, targetInrMin: number, targetInrMax: number): WarfarinRecommendation {
  if (currentInr < 1.5) {
    return {
      dose: 0,
      action: 'Tingkatkan dosis 10-20%',
      nextInr: '5-7 hari',
      notes: 'Periksa faktor yang mempengaruhi (diet, obat lain, kepatuhan)',
    };
  } else if (currentInr < targetInrMin) {
    return {
      dose: 0,
      action: 'Tingkatkan dosis 5-10%',
      nextInr: '5-7 hari',
      notes: 'Evaluasi penyebab INR rendah',
    };
  } else if (currentInr >= targetInrMin && currentInr <= targetInrMax) {
    return {
      dose: 0,
      action: 'Pertahankan dosis saat ini',
      nextInr: '4-6 minggu',
      notes: 'INR terapeutik, lanjutkan monitoring rutin',
    };
  } else if (currentInr <= targetInrMax + 0.5) {
    return {
      dose: 0,
      action: 'Kurangi dosis 5-10% atau lewati 1 dosis',
      nextInr: '3-5 hari',
      notes: 'INR sedikit di atas target',
    };
  } else if (currentInr <= 5) {
    return {
      dose: 0,
      action: 'Lewati 1-2 dosis, kurangi dosis maintenance',
      nextInr: '2-3 hari',
      notes: 'Pertimbangkan Vitamin K oral 1-2.5mg jika perlu',
    };
  } else if (currentInr <= 9) {
    return {
      dose: 0,
      action: 'Lewati dosis, Vitamin K 2.5-5mg oral',
      nextInr: '24-48 jam',
      notes: 'Monitor perdarahan, pertimbangkan FFP jika perdarahan aktif',
    };
  } else {
    return {
      dose: 0,
      action: 'Hentikan warfarin, Vitamin K 10mg IV/slow infusion',
      nextInr: '12-24 jam',
      notes: 'Berikan FFP atau PCC jika perdarahan. KONSULTASI HEMATOLOGI',
    };
  }
}

// =============================================
// CREATININE CLEARANCE (CG) & eGFR (CKD-EPI)
// =============================================
function calculateCrCl(age: number, weight: number, scr: number, gender: Gender, height?: number): { 
  cg: number; 
  ckdEpi: number;
  bsa: number;
} {
  // Cockcroft-Gault
  let cg = ((140 - age) * weight) / (72 * scr);
  if (gender === 'female') cg *= 0.85;
  
  // CKD-EPI 2021 (without race)
  const kappa = gender === 'female' ? 0.7 : 0.9;
  const alpha = gender === 'female' ? -0.241 : -0.302;
  const genderFactor = gender === 'female' ? 1.012 : 1;
  const scrNorm = scr / kappa;
  let ckdEpi = 142 * Math.pow(Math.min(scrNorm, 1), alpha) * 
               Math.pow(Math.max(scrNorm, 1), -1.200) * 
               Math.pow(0.9938, age) * genderFactor;
  
  // BSA (for indexed values)
  const bsa = height ? Math.sqrt((weight * height) / 3600) : 0;
  
  return {
    cg: Math.round(cg),
    ckdEpi: Math.round(ckdEpi),
    bsa: Math.round(bsa * 100) / 100,
  };
}

// =============================================
// CORRECTED SODIUM
// =============================================
function calculateCorrectedSodium(
  measuredNa: number,
  glucose: number,
  triglycerides?: number,
  protein?: number
): { 
  correctedForGlucose: number; 
  correctedForLipids: number | null;
  correctedForProtein: number | null;
  interpretation: string;
} {
  // Corrected for hyperglycemia (Katz formula)
  // Na decreases 1.6 mEq/L for each 100 mg/dL glucose above normal
  const glucoseExcess = Math.max(0, glucose - 100);
  const correctedForGlucose = measuredNa + (glucoseExcess / 100) * 1.6;
  
  // Corrected for hyperlipidemia
  let correctedForLipids: number | null = null;
  if (triglycerides && triglycerides > 150) {
    // Simplified: each 500 mg/dL TG decreases Na by ~1 mEq/L
    correctedForLipids = measuredNa + (triglycerides / 500);
  }
  
  // Corrected for hyperproteinemia
  let correctedForProtein: number | null = null;
  if (protein && protein > 8) {
    // Each 1 g/dL protein above 8 decreases Na by ~0.25 mEq/L
    correctedForProtein = measuredNa + ((protein - 8) * 0.25);
  }
  
  let interpretation = '';
  const finalNa = correctedForGlucose;
  if (finalNa < 135) {
    interpretation = 'Hiponatremia - evaluasi volume status dan penyebab';
  } else if (finalNa > 145) {
    interpretation = 'Hipernatremia - evaluasi hidrasi dan penyebab';
  } else {
    interpretation = 'Sodium dalam rentang normal (135-145 mEq/L)';
  }
  
  return {
    correctedForGlucose: Math.round(correctedForGlucose * 10) / 10,
    correctedForLipids: correctedForLipids ? Math.round(correctedForLipids * 10) / 10 : null,
    correctedForProtein: correctedForProtein ? Math.round(correctedForProtein * 10) / 10 : null,
    interpretation,
  };
}

// =============================================
// ANION GAP & METABOLIC ANALYSIS
// =============================================
function calculateAnionGap(
  na: number,
  cl: number,
  hco3: number,
  albumin?: number
): { 
  anionGap: number; 
  correctedGap: number;
  deltaRatio: number | null;
  interpretation: string;
} {
  // Anion Gap = Na - (Cl + HCO3)
  const anionGap = na - (cl + hco3);
  
  // Corrected for albumin (normal 4 g/dL)
  // AG decreases by 2.5 for each 1 g/dL decrease in albumin
  let correctedGap = anionGap;
  if (albumin) {
    correctedGap = anionGap + (4 - albumin) * 2.5;
  }
  
  // Delta ratio interpretation (if metabolic acidosis present)
  let interpretation = '';
  if (anionGap > 12) {
    interpretation = 'High anion gap metabolic acidosis (HAGMA). Pertimbangkan: MUDPILES (Methanol, Uremia, DKA, Propylene glycol, Isoniazid/Iron, Lactic acid, Ethylene glycol, Salicylates)';
  } else if (anionGap < 8) {
    interpretation = 'Low anion gap. Pertimbangkan: hipoalbuminemia, multiple myeloma, lithium toxicity';
  } else {
    interpretation = 'Anion gap normal (8-12 mEq/L)';
  }
  
  return {
    anionGap: Math.round(anionGap * 10) / 10,
    correctedGap: Math.round(correctedGap * 10) / 10,
    deltaRatio: null,
    interpretation,
  };
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function KalkulatorPage() {
  const [activeTab, setActiveTab] = useState('pediatric');

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 shrink-0">
          <Calculator className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Kalkulator Medis</h1>
          <p className="text-sm text-muted-foreground">
            Kalkulator dosis, BMI, GFR, kalori, dan lainnya
          </p>
        </div>
      </div>

      {/* Tab Navigation - Scrollable */}
      <div className="relative -mx-4 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap gap-1 h-auto p-1 bg-transparent">
            <TabsTrigger value="pediatric" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Pill className="h-3.5 w-3.5 mr-1.5" />Dosis Anak
            </TabsTrigger>
            <TabsTrigger value="infusion" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Syringe className="h-3.5 w-3.5 mr-1.5" />Infus
            </TabsTrigger>
            <TabsTrigger value="anesthesia" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Zap className="h-3.5 w-3.5 mr-1.5" />Anestesi
            </TabsTrigger>
            <TabsTrigger value="steroid" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Beaker className="h-3.5 w-3.5 mr-1.5" />Steroid
            </TabsTrigger>
            <TabsTrigger value="warfarin" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="h-3.5 w-3.5 mr-1.5" />Warfarin
            </TabsTrigger>
            <TabsTrigger value="bmi" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Scale className="h-3.5 w-3.5 mr-1.5" />BMI
            </TabsTrigger>
            <TabsTrigger value="gfr" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Droplets className="h-3.5 w-3.5 mr-1.5" />GFR
            </TabsTrigger>
            <TabsTrigger value="calorie" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Flame className="h-3.5 w-3.5 mr-1.5" />Kalori
            </TabsTrigger>
            <TabsTrigger value="ideal" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="h-3.5 w-3.5 mr-1.5" />BB Ideal
            </TabsTrigger>
            <TabsTrigger value="bsa" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Percent className="h-3.5 w-3.5 mr-1.5" />BSA
            </TabsTrigger>
            <TabsTrigger value="electrolyte" className="text-xs px-3 py-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Timer className="h-3.5 w-3.5 mr-1.5" />Elektrolit
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="pediatric"><PediatricDoseCalculator /></TabsContent>
            <TabsContent value="infusion"><InfusionCalculator /></TabsContent>
            <TabsContent value="anesthesia"><AnesthesiaCalculator /></TabsContent>
            <TabsContent value="steroid"><SteroidCalculator /></TabsContent>
            <TabsContent value="warfarin"><WarfarinCalculator /></TabsContent>
            <TabsContent value="bmi"><BMICalculator /></TabsContent>
            <TabsContent value="gfr"><GFRCalculator /></TabsContent>
            <TabsContent value="calorie"><CalorieCalculator /></TabsContent>
            <TabsContent value="ideal"><IdealWeightCalculator /></TabsContent>
            <TabsContent value="bsa"><BSACalculator /></TabsContent>
            <TabsContent value="electrolyte"><ElectrolyteCalculator /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

// =============================================
// PEDIATRIC DOSE CALCULATOR
// =============================================
function PediatricDoseCalculator() {
  const [drugs, setDrugs] = useState<DrugInfo[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<DrugInfo | null>(null);
  const [selectedDose, setSelectedDose] = useState<DrugDose | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [result, setResult] = useState<{
    minDose: number;
    maxDose: number;
    maxAllowed: number | null;
    unit: string;
    frequency: string | null;
    isWithinMax: boolean;
    formula: string;
    warnings: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchDrugs() {
      try {
        const res = await fetch('/api/drugs?limit=200');
        const data = await res.json();
        if (data.success) {
          const pediatricDrugs = data.data.filter(
            (drug: DrugInfo) => drug.doses?.some((d: DrugDose) => d.pediatricDose)
          );
          setDrugs(pediatricDrugs);
        }
      } catch (error) {
        console.error('Error fetching drugs:', error);
        toast.error('Gagal memuat data obat');
      }
    }
    fetchDrugs();
  }, []);

  const handleCalculate = useCallback(() => {
    if (!selectedDose || !weight) {
      toast.error('Pilih obat dan masukkan berat badan');
      return;
    }

    setLoading(true);

    try {
      const weightNum = parseFloat(weight);
      const ageNum = age ? parseFloat(age) : null;
      const warnings: string[] = [];

      const doseInfo = parsePediatricDose(selectedDose.pediatricDose || '');
      if (!doseInfo) {
        toast.error('Format dosis tidak dikenali');
        setLoading(false);
        return;
      }

      let minDose = doseInfo.min;
      let maxDose = doseInfo.max;
      
      if (doseInfo.perKg) {
        minDose = doseInfo.min * weightNum;
        maxDose = doseInfo.max * weightNum;
      }

      const maxAllowed = parseMaxDose(selectedDose.maxDose);
      const isWithinMax = maxAllowed ? maxDose <= maxAllowed.value : true;
      
      if (!isWithinMax) {
        warnings.push(`Dosis maksimal (${maxDose.toFixed(1)} mg) melebihi batas ${maxAllowed!.value} mg/hari.`);
        maxDose = maxAllowed!.value;
        minDose = Math.min(minDose, maxDose);
      }

      if (ageNum !== null) {
        if (ageNum < 0.083) {
          warnings.push('Bayi baru lahir memerlukan penyesuaian dosis khusus.');
        } else if (ageNum < 1) {
          warnings.push('Bayi < 1 tahun memerlukan pengawasan ketat.');
        }
        
        if (selectedDose.pediatricMinAge || selectedDose.pediatricMaxAge) {
          const minAgeMonths = selectedDose.pediatricMinAge ? parseFloat(selectedDose.pediatricMinAge) : 0;
          if (ageNum * 12 < minAgeMonths) {
            warnings.push(`Dosis ini tidak direkomendasikan untuk usia < ${minAgeMonths} bulan.`);
          }
        }
      }

      if (weightNum < 3) {
        warnings.push('Berat badan sangat rendah. Perhatian khusus.');
      } else if (weightNum > 40) {
        warnings.push('Berat badan > 40 kg. Pertimbangkan dosis dewasa.');
      }

      const formula = doseInfo.perKg
        ? `${doseInfo.min}-${doseInfo.max} ${doseInfo.unit}/kg × ${weightNum} kg`
        : `${doseInfo.min}-${doseInfo.max} ${doseInfo.unit}`;

      setResult({
        minDose: Math.round(minDose * 10) / 10,
        maxDose: Math.round(maxDose * 10) / 10,
        maxAllowed: maxAllowed?.value || null,
        unit: doseInfo.unit,
        frequency: selectedDose.frequency,
        isWithinMax,
        formula,
        warnings,
      });

      if (warnings.length > 0) {
        toast.warning('Ada peringatan pada hasil');
      }
    } catch (error) {
      console.error('Error calculating dose:', error);
      toast.error('Gagal menghitung dosis');
    }

    setLoading(false);
  }, [selectedDose, weight, age]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Baby className="h-5 w-5 text-sky-600" />
            Kalkulator Dosis Pediatrik
          </CardTitle>
          <CardDescription>Hitung dosis obat berdasarkan berat badan anak</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pilih Obat</Label>
            <Select
              value={selectedDrug?.id || ''}
              onValueChange={(value) => {
                const drug = drugs.find((d) => d.id === value);
                setSelectedDrug(drug || null);
                setSelectedDose(null);
                setResult(null);
              }}
            >
              <SelectTrigger><SelectValue placeholder="Pilih obat..." /></SelectTrigger>
              <SelectContent>
                {drugs.map((drug) => (
                  <SelectItem key={drug.id} value={drug.id}>
                    {drug.name} {drug.genericName ? `(${drug.genericName})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDrug && selectedDrug.doses.length > 0 && (
            <div className="space-y-2">
              <Label>Indikasi</Label>
              <Select
                value={selectedDose?.id || ''}
                onValueChange={(value) => {
                  const dose = selectedDrug?.doses.find((d) => d.id === value);
                  setSelectedDose(dose || null);
                  setResult(null);
                }}
              >
                <SelectTrigger><SelectValue placeholder="Pilih indikasi..." /></SelectTrigger>
                <SelectContent>
                  {selectedDrug.doses.filter((d) => d.pediatricDose).map((dose) => (
                    <SelectItem key={dose.id} value={dose.id}>
                      {dose.indication || 'Dosis umum'} - {dose.pediatricDose}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Berat Badan (kg)</Label>
              <Input type="number" step="0.1" min="0.5" max="150" placeholder="10" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Usia (tahun)</Label>
              <Input type="number" step="0.1" min="0" max="18" placeholder="Opsional" value={age} onChange={(e) => setAge(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleCalculate} disabled={!selectedDose || !weight || loading} className="w-full">
            {loading ? 'Menghitung...' : 'Hitung Dosis'}
          </Button>
        </CardContent>
      </Card>

      {selectedDose && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-sm">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-muted-foreground">Informasi Dosis:</p>
                <p><strong>Pediatrik:</strong> {selectedDose.pediatricDose}</p>
                {selectedDose.maxDose && <p><strong>Maks:</strong> {selectedDose.maxDose} {selectedDose.maxDoseUnit}</p>}
                {selectedDose.frequency && <p><strong>Frekuensi:</strong> {selectedDose.frequency}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card className={cn(result.warnings.length > 0 ? 'border-amber-200 dark:border-amber-900' : 'border-emerald-200 dark:border-emerald-900')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Hasil Perhitungan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-center">
                <p className="text-xs text-muted-foreground">Dosis</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  {result.minDose === result.maxDose ? `${result.maxDose} ${result.unit}` : `${result.minDose}-${result.maxDose} ${result.unit}`}
                </p>
                {result.frequency && <p className="text-xs text-muted-foreground mt-1">{result.frequency}</p>}
              </div>
              {result.maxAllowed && (
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Dosis Maks</p>
                  <p className="text-xl font-bold">{result.maxAllowed} mg</p>
                  <p className="text-xs text-muted-foreground mt-1">per hari</p>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Formula:</p>
              <p className="font-mono text-sm mt-1">{result.formula}</p>
            </div>

            {result.warnings.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <Alert className="text-xs">
              <AlertDescription>
                <strong>Disclaimer:</strong> Hasil perhitungan ini hanya untuk referensi. Selalu verifikasi dengan panduan dosis resmi.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// =============================================
// INFUSION CALCULATOR
// =============================================
function InfusionCalculator() {
  const [volume, setVolume] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [dropFactor, setDropFactor] = useState<string>('20');
  const [result, setResult] = useState<ReturnType<typeof calculateInfusion> | null>(null);

  const handleCalculate = useCallback(() => {
    if (!volume || !duration) {
      toast.error('Masukkan volume dan durasi');
      return;
    }
    const result = calculateInfusion(
      parseFloat(volume),
      parseFloat(duration),
      parseFloat(dropFactor)
    );
    setResult(result);
  }, [volume, duration, dropFactor]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Syringe className="h-5 w-5 text-purple-600" />
          Kalkulator Infus
        </CardTitle>
        <CardDescription>Hitung kecepatan infus dan tetesan per menit</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Volume (mL)</Label>
            <Input type="number" placeholder="500" value={volume} onChange={(e) => setVolume(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Durasi (jam)</Label>
            <Input type="number" step="0.5" placeholder="8" value={duration} onChange={(e) => setDuration(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Drop Factor (tetes/mL)</Label>
          <Select value={dropFactor} onValueChange={setDropFactor}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 (Makroset - dewasa)</SelectItem>
              <SelectItem value="15">15 (Makroset - standar)</SelectItem>
              <SelectItem value="20">20 (Makroset - umum)</SelectItem>
              <SelectItem value="60">60 (Mikroset - pediatrik)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCalculate} disabled={!volume || !duration} className="w-full">Hitung Infus</Button>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-center">
                <p className="text-xs text-muted-foreground">Kecepatan</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{result.flowRateMlHr}</p>
                <p className="text-xs text-muted-foreground">mL/jam</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-center">
                <p className="text-xs text-muted-foreground">Tetesan</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{result.dripRate}</p>
                <p className="text-xs text-muted-foreground">tetes/menit</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-2">Rumus:</p>
              <p>Flow Rate = Volume ÷ Durasi</p>
              <p>Drip Rate = (Volume ÷ Durasi × 60) × Drop Factor</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// ANESTHESIA CALCULATOR
// =============================================
function AnesthesiaCalculator() {
  const [agent, setAgent] = useState<string>('sevoflurane');
  const [age, setAge] = useState<string>('40');
  const [temp, setTemp] = useState<string>('37');
  const [nitrousOxide, setNitrousOxide] = useState<string>('0');
  const [result, setResult] = useState<ReturnType<typeof calculateMAC> | null>(null);

  const handleCalculate = useCallback(() => {
    const result = calculateMAC(agent, parseFloat(age), parseFloat(temp), parseFloat(nitrousOxide));
    setResult(result);
  }, [agent, age, temp, nitrousOxide]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-600" />
          Kalkulator MAC (Anestesi)
        </CardTitle>
        <CardDescription>Minimum Alveolar Concentration untuk anestesi volatil</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Agent Volatil</Label>
          <Select value={agent} onValueChange={setAgent}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sevoflurane">Sevoflurane</SelectItem>
              <SelectItem value="isoflurane">Isoflurane</SelectItem>
              <SelectItem value="desflurane">Desflurane</SelectItem>
              <SelectItem value="halothane">Halothane</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Usia (tahun)</Label>
            <Input type="number" placeholder="40" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Suhu (°C)</Label>
            <Input type="number" step="0.1" placeholder="37" value={temp} onChange={(e) => setTemp(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>N₂O (%)</Label>
            <Input type="number" min="0" max="70" placeholder="0" value={nitrousOxide} onChange={(e) => setNitrousOxide(e.target.value)} />
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 text-center">
              <p className="text-xs text-muted-foreground">MAC yang Direkomendasikan</p>
              <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{result.recommendedConcentration}</p>
              <p className="text-xs text-muted-foreground mt-1">untuk 1 MAC efektif</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm space-y-1">
              <p><strong>MAC standar:</strong> {result.mac}%</p>
              <p><strong>MAC usia-adjusted:</strong> {result.ageAdjustedMac}%</p>
              <p><strong>MAC dengan N₂O:</strong> {result.macWithN2O}%</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-xs">
              <p className="font-medium mb-1">Catatan:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>MAC menurun ~6% per dekade setelah usia 40</li>
                <li>MAC menurun ~5% per derajat di bawah 37°C</li>
                <li>N₂O mengurangi kebutuhan volatil</li>
                <li>0.5-0.7 MAC cukup untuk sedasi</li>
                <li>1.0-1.5 MAC untuk anestesi umum</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// STEROID CALCULATOR
// =============================================
function SteroidCalculator() {
  const [fromSteroid, setFromSteroid] = useState<string>('prednisone');
  const [dose, setDose] = useState<string>('5');
  const [toSteroid, setToSteroid] = useState<string>('dexamethasone');
  const [result, setResult] = useState<ReturnType<typeof convertSteroid> | null>(null);

  const handleCalculate = useCallback(() => {
    if (!dose) {
      toast.error('Masukkan dosis');
      return;
    }
    const result = convertSteroid(fromSteroid, parseFloat(dose), toSteroid);
    setResult(result);
  }, [fromSteroid, dose, toSteroid]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const steroidOptions = Object.keys(steroidConversions);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Beaker className="h-5 w-5 text-orange-600" />
          Konversi Steroid
        </CardTitle>
        <CardDescription>Konversi dosis antar jenis steroid</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Dari Steroid</Label>
            <Select value={fromSteroid} onValueChange={setFromSteroid}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {steroidOptions.map((s) => (
                  <SelectItem key={s} value={s}>{steroidConversions[s].name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dosis (mg)</Label>
            <Input type="number" step="0.5" placeholder="5" value={dose} onChange={(e) => setDose(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ke Steroid</Label>
          <Select value={toSteroid} onValueChange={setToSteroid}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {steroidOptions.map((s) => (
                <SelectItem key={s} value={s}>{steroidConversions[s].name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-center">
              <p className="text-xs text-muted-foreground">Dosis Ekuivalen</p>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">
                {result.equivalentDose} mg
              </p>
              <p className="text-sm text-muted-foreground mt-1">{result.toInfo.name}</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-2">Prednisone Ekuivalen:</p>
              <p className="text-lg font-bold">{dose} mg {result.fromInfo.name} = {result.prednisoneEquivalent} mg Prednisone</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-xs">
              <p className="font-medium mb-2">Perbandingan Potensi:</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-medium">{result.fromInfo.name}</p>
                  <p>Antiinflamasi: {result.fromInfo.antiInflammatory}x</p>
                  <p>Mineralokortikoid: {result.fromInfo.mineralocorticoid}x</p>
                  <p>Durasi: {result.fromInfo.duration}</p>
                </div>
                <div>
                  <p className="font-medium">{result.toInfo.name}</p>
                  <p>Antiinflamasi: {result.toInfo.antiInflammatory}x</p>
                  <p>Mineralokortikoid: {result.toInfo.mineralocorticoid}x</p>
                  <p>Durasi: {result.toInfo.duration}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// WARFARIN CALCULATOR
// =============================================
function WarfarinCalculator() {
  const [currentInr, setCurrentInr] = useState<string>('');
  const [targetMin, setTargetMin] = useState<string>('2.0');
  const [targetMax, setTargetMax] = useState<string>('3.0');
  const [result, setResult] = useState<WarfarinRecommendation | null>(null);

  const handleCalculate = useCallback(() => {
    if (!currentInr) {
      toast.error('Masukkan nilai INR');
      return;
    }
    const inr = parseFloat(currentInr);
    const min = parseFloat(targetMin);
    const max = parseFloat(targetMax);
    
    const result = calculateWarfarinDose(inr, min, max);
    setResult(result);
  }, [currentInr, targetMin, targetMax]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-5 w-5 text-red-600" />
          Panduan Dosis Warfarin
        </CardTitle>
        <CardDescription>Rekomendasi penyesuaian dosis berdasarkan INR</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>INR Saat Ini</Label>
            <Input type="number" step="0.1" placeholder="2.5" value={currentInr} onChange={(e) => setCurrentInr(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Target Min</Label>
            <Input type="number" step="0.1" placeholder="2.0" value={targetMin} onChange={(e) => setTargetMin(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Target Max</Label>
            <Input type="number" step="0.1" placeholder="3.0" value={targetMax} onChange={(e) => setTargetMax(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleCalculate} disabled={!currentInr} className="w-full">Lihat Rekomendasi</Button>

        {result && (
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-lg text-center",
              parseFloat(currentInr) >= parseFloat(targetMin) && parseFloat(currentInr) <= parseFloat(targetMax)
                ? "bg-emerald-50 dark:bg-emerald-950/30"
                : "bg-amber-50 dark:bg-amber-950/30"
            )}>
              <p className="text-sm text-muted-foreground">Tindakan</p>
              <p className="text-lg font-bold mt-1">{result.action}</p>
              <p className="text-sm text-muted-foreground mt-2">Cek INR ulang: {result.nextInr}</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium">Catatan:</p>
              <p>{result.notes}</p>
            </div>

            <Alert className="text-xs">
              <AlertDescription>
                <strong>Peringatan:</strong> Panduan ini bersifat umum. Selalu pertimbangkan kondisi klinis pasien, 
                riwayat perdarahan, obat lain yang dikonsumsi, dan konsultasi dengan tim antikoagulasi.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// BMI CALCULATOR COMPONENT
// =============================================
function BMICalculator() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [result, setResult] = useState<ReturnType<typeof calculateBMI> | null>(null);

  const handleCalculate = useCallback(() => {
    if (!weight || !height) {
      toast.error('Masukkan berat badan dan tinggi badan');
      return;
    }
    const result = calculateBMI(parseFloat(weight), parseFloat(height));
    setResult(result);
  }, [weight, height]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Scale className="h-5 w-5 text-emerald-600" />
          Kalkulator BMI / IMT
        </CardTitle>
        <CardDescription>Indeks Massa Tubuh (Body Mass Index)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Berat Badan (kg)</Label>
            <Input type="number" step="0.1" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tinggi Badan (cm)</Label>
            <Input type="number" step="0.1" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleCalculate} disabled={!weight || !height} className="w-full">Hitung BMI</Button>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">BMI Anda</p>
              <p className={cn('text-3xl font-bold mt-1', result.color)}>{result.bmi}</p>
              <p className={cn('text-sm font-medium mt-1', result.color)}>{result.category}</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-2">Kategori BMI:</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span>&lt; 18.5: Kurang</span>
                <span className="text-emerald-600">18.5-24.9: Normal</span>
                <span className="text-orange-600">25-29.9: Overweight</span>
                <span className="text-rose-600">≥ 30: Obesitas</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// GFR CALCULATOR COMPONENT
// =============================================
function GFRCalculator() {
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [serumCr, setSerumCr] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [result, setResult] = useState<ReturnType<typeof calculateGFR> | null>(null);

  const handleCalculate = useCallback(() => {
    if (!age || !weight || !serumCr) {
      toast.error('Lengkapi semua data');
      return;
    }
    const result = calculateGFR(parseFloat(age), parseFloat(weight), parseFloat(serumCr), gender);
    setResult(result);
  }, [age, weight, serumCr, gender]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Droplets className="h-5 w-5 text-blue-600" />
          Kalkulator GFR (Cockcroft-Gault)
        </CardTitle>
        <CardDescription>Laju Filtrasi Glomerulus untuk fungsi ginjal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Jenis Kelamin</Label>
          <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Laki-laki</SelectItem>
              <SelectItem value="female">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Usia (tahun)</Label>
            <Input type="number" placeholder="45" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>BB (kg)</Label>
            <Input type="number" step="0.1" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Kreatinin (mg/dL)</Label>
            <Input type="number" step="0.01" placeholder="1.0" value={serumCr} onChange={(e) => setSerumCr(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleCalculate} disabled={!age || !weight || !serumCr} className="w-full">Hitung GFR</Button>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Laju Filtrasi Glomerulus</p>
              <p className={cn('text-3xl font-bold mt-1', result.color)}>{result.gfr} <span className="text-lg">mL/min</span></p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge variant="outline" className={result.color}>Stage {result.stage}</Badge>
                <span className={cn('text-sm', result.color)}>{result.description}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-xs">
              <p className="font-medium mb-2">Stadium CKD:</p>
              <div className="space-y-1">
                <p>G1: ≥90 mL/min (Normal)</p>
                <p>G2: 60-89 mL/min (Ringan)</p>
                <p>G3a: 45-59 mL/min (Sedang)</p>
                <p>G3b: 30-44 mL/min (Sedang-Berat)</p>
                <p>G4: 15-29 mL/min (Berat)</p>
                <p>G5: &lt;15 mL/min (Gagal Ginjal)</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// CALORIE CALCULATOR COMPONENT
// =============================================
function CalorieCalculator() {
  const [age, setAge] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [result, setResult] = useState<ReturnType<typeof calculateCalories> | null>(null);

  const activityLabels: Record<ActivityLevel, string> = {
    sedentary: 'Jarang bergerak',
    light: 'Ringan (1-3x/minggu)',
    moderate: 'Sedang (3-5x/minggu)',
    active: 'Aktif (6-7x/minggu)',
    very_active: 'Sangat aktif',
  };

  const handleCalculate = useCallback(() => {
    if (!age || !weight || !height) {
      toast.error('Lengkapi semua data');
      return;
    }
    const result = calculateCalories(parseFloat(age), parseFloat(weight), parseFloat(height), gender, activityLevel);
    setResult(result);
  }, [age, weight, height, gender, activityLevel]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-600" />
          Kalkulator Kalori (BMR & TDEE)
        </CardTitle>
        <CardDescription>Kebutuhan kalori harian berdasarkan aktivitas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Jenis Kelamin</Label>
          <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Laki-laki</SelectItem>
              <SelectItem value="female">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Usia</Label>
            <Input type="number" placeholder="30" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>BB (kg)</Label>
            <Input type="number" step="0.1" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>TB (cm)</Label>
            <Input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tingkat Aktivitas</Label>
          <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(activityLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCalculate} disabled={!age || !weight || !height} className="w-full">Hitung Kalori</Button>

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/30 text-center">
                <p className="text-xs text-muted-foreground">BMR (Basal)</p>
                <p className="text-2xl font-bold text-sky-700 dark:text-sky-400">{result.bmr}</p>
                <p className="text-xs text-muted-foreground">kkal/hari</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-center">
                <p className="text-xs text-muted-foreground">TDEE (Total)</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{result.tdee}</p>
                <p className="text-xs text-muted-foreground">kkal/hari</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-2">Rekomendasi Makro:</p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-red-50 dark:bg-red-950/30">
                  <p className="font-medium text-red-700">Protein</p>
                  <p>{result.protein}</p>
                </div>
                <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30">
                  <p className="font-medium text-amber-700">Karbo</p>
                  <p>{result.carbs}</p>
                </div>
                <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30">
                  <p className="font-medium text-emerald-700">Lemak</p>
                  <p>{result.fat}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-xs">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Defisit 500 kkal/hari = turun ~0.5 kg/minggu</li>
                <li>Surplus 500 kkal/hari = naik ~0.5 kg/minggu</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// IDEAL WEIGHT CALCULATOR COMPONENT
// =============================================
function IdealWeightCalculator() {
  const [height, setHeight] = useState<string>('');
  const [gender, setGender] = useState<Gender>('male');
  const [result, setResult] = useState<ReturnType<typeof calculateIdealWeight> | null>(null);

  const handleCalculate = useCallback(() => {
    if (!height) {
      toast.error('Masukkan tinggi badan');
      return;
    }
    const result = calculateIdealWeight(parseFloat(height), gender);
    setResult(result);
  }, [height, gender]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-5 w-5 text-purple-600" />
          Kalkulator Berat Badan Ideal
        </CardTitle>
        <CardDescription>Estimasi berat badan ideal berdasarkan tinggi badan</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Jenis Kelamin</Label>
          <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Laki-laki</SelectItem>
              <SelectItem value="female">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Tinggi Badan (cm)</Label>
          <Input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
        </div>

        <Button onClick={handleCalculate} disabled={!height} className="w-full">Hitung BB Ideal</Button>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Berat Badan Ideal (BMI 18.5-25)</p>
              <p className="text-2xl font-bold text-primary">{result.bmiRange.min} - {result.bmiRange.max} kg</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-2">Formula Lainnya:</p>
              <div className="space-y-1">
                <p>Devine: <span className="font-medium">{result.devine} kg</span></p>
                <p>Robinson: <span className="font-medium">{result.robinson} kg</span></p>
                <p>Miller: <span className="font-medium">{result.miller} kg</span></p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// BSA CALCULATOR COMPONENT
// =============================================
function BSACalculator() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [result, setResult] = useState<ReturnType<typeof calculateBSA> | null>(null);

  const handleCalculate = useCallback(() => {
    if (!weight || !height) {
      toast.error('Masukkan berat badan dan tinggi badan');
      return;
    }
    const result = calculateBSA(parseFloat(weight), parseFloat(height));
    setResult(result);
  }, [weight, height]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Percent className="h-5 w-5 text-teal-600" />
          Kalkulator BSA (Luas Permukaan Tubuh)
        </CardTitle>
        <CardDescription>Body Surface Area untuk dosis kemoterapi dll</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Berat Badan (kg)</Label>
            <Input type="number" step="0.1" placeholder="70" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tinggi Badan (cm)</Label>
            <Input type="number" placeholder="170" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleCalculate} disabled={!weight || !height} className="w-full">Hitung BSA</Button>

        {result && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-teal-50 dark:bg-teal-950/30 text-center">
              <p className="text-xs text-muted-foreground">Luas Permukaan Tubuh (Mosteller)</p>
              <p className="text-3xl font-bold text-teal-700 dark:text-teal-400">{result.mosteller} <span className="text-lg">m²</span></p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="font-medium mb-2">Perbandingan Formula:</p>
              <div className="space-y-1">
                <p>Mosteller: <span className="font-medium">{result.mosteller} m²</span></p>
                <p>Du Bois: <span className="font-medium">{result.dubois} m²</span></p>
                <p>Haycock: <span className="font-medium">{result.haycock} m²</span></p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-xs">
              <p className="font-medium mb-1">Kegunaan BSA:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Dosis kemoterapi</li>
                <li>Dosis obat kardiak (digoxin)</li>
                <li>Perhitungan cairan resusitasi</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================
// ELECTROLYTE CALCULATOR COMPONENT
// =============================================
function ElectrolyteCalculator() {
  const [activeCalc, setActiveCalc] = useState<'sodium' | 'gap'>('sodium');
  const [measuredNa, setMeasuredNa] = useState<string>('');
  const [glucose, setGlucose] = useState<string>('');
  const [na, setNa] = useState<string>('');
  const [cl, setCl] = useState<string>('');
  const [hco3, setHco3] = useState<string>('');
  const [result, setResult] = useState<{ sodium?: ReturnType<typeof calculateCorrectedSodium>; gap?: ReturnType<typeof calculateAnionGap> } | null>(null);

  const handleCalculateSodium = useCallback(() => {
    if (!measuredNa || !glucose) {
      toast.error('Masukkan sodium dan glukosa');
      return;
    }
    const sodiumResult = calculateCorrectedSodium(parseFloat(measuredNa), parseFloat(glucose));
    setResult({ sodium: sodiumResult });
  }, [measuredNa, glucose]);

  const handleCalculateGap = useCallback(() => {
    if (!na || !cl || !hco3) {
      toast.error('Lengkapi semua data');
      return;
    }
    const gapResult = calculateAnionGap(parseFloat(na), parseFloat(cl), parseFloat(hco3));
    setResult({ gap: gapResult });
  }, [na, cl, hco3]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Timer className="h-5 w-5 text-cyan-600" />
          Kalkulator Elektrolit
        </CardTitle>
        <CardDescription>Sodium koreksi dan Anion Gap</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            variant={activeCalc === 'sodium' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveCalc('sodium')}
          >
            Na Koreksi
          </Button>
          <Button 
            variant={activeCalc === 'gap' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveCalc('gap')}
          >
            Anion Gap
          </Button>
        </div>

        {activeCalc === 'sodium' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Sodium Terukur (mEq/L)</Label>
                <Input type="number" placeholder="130" value={measuredNa} onChange={(e) => setMeasuredNa(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Glukosa (mg/dL)</Label>
                <Input type="number" placeholder="300" value={glucose} onChange={(e) => setGlucose(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleCalculateSodium} disabled={!measuredNa || !glucose} className="w-full">Hitung Koreksi</Button>
          </>
        )}

        {activeCalc === 'gap' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Na (mEq/L)</Label>
                <Input type="number" placeholder="140" value={na} onChange={(e) => setNa(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Cl (mEq/L)</Label>
                <Input type="number" placeholder="100" value={cl} onChange={(e) => setCl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>HCO₃ (mEq/L)</Label>
                <Input type="number" placeholder="24" value={hco3} onChange={(e) => setHco3(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleCalculateGap} disabled={!na || !cl || !hco3} className="w-full">Hitung Anion Gap</Button>
          </>
        )}

        {result?.sodium && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/30 text-center">
              <p className="text-xs text-muted-foreground">Sodium Terkoreksi (Glukosa)</p>
              <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-400">{result.sodium.correctedForGlucose} mEq/L</p>
              <p className="text-sm text-muted-foreground mt-2">{result.sodium.interpretation}</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-xs">
              <p className="font-medium mb-1">Rumus Koreksi:</p>
              <p>Na_corr = Na_measured + (glukosa - 100)/100 × 1.6</p>
            </div>
          </div>
        )}

        {result?.gap && (
          <div className="space-y-4">
            <div className={cn(
              "p-4 rounded-lg text-center",
              result.gap.anionGap > 12 ? "bg-amber-50 dark:bg-amber-950/30" : "bg-emerald-50 dark:bg-emerald-950/30"
            )}>
              <p className="text-xs text-muted-foreground">Anion Gap</p>
              <p className={cn(
                "text-3xl font-bold",
                result.gap.anionGap > 12 ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
              )}>{result.gap.anionGap} mEq/L</p>
              <p className="text-sm text-muted-foreground mt-2">{result.gap.interpretation}</p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-xs">
              <p className="font-medium mb-1">Rumus:</p>
              <p>Anion Gap = Na - (Cl + HCO₃)</p>
              <p className="mt-1">Normal: 8-12 mEq/L</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}