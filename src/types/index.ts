// =============================================================================
// TIPE DATA OBAT
// =============================================================================

export interface Drug {
  id: string;
  name: string;
  genericName: string | null;
  brandNames: string | null;
  drugClass: string | null;
  category: string | null;
  description: string | null;
  mechanism: string | null;
  route: string | null;
  halfLife: string | null;
  excretion: string | null;
  pregnancyCat: string | null;
  lactation: string | null;
  storage: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  doses?: DrugDose[];
  indications?: DrugIndication[];
  contraindications?: DrugContraindication[];
  interactions?: DrugInteraction[];
  isFavorite?: boolean;
  _count?: {
    interactions: number;
    contraindications: number;
  };
}

export interface DrugSummary {
  id: string;
  name: string;
  genericName: string | null;
}

export interface DrugDose {
  id: string;
  name: string;
  genericName: string | null;
  brandNames: string | null;
  drugClass: string | null;
  mechanism: string | null;
  route: string | null;
  halfLife: string | null;
  excretion: string | null;
  pregnancyCat: string | null;
  lactation: string | null;
  storage: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  doses?: DrugDose[];
  indications?: DrugIndication[];
  contraindications?: DrugContraindication[];
  interactions?: DrugInteraction[];
  isFavorite?: boolean;
}

export interface DrugDose {
  id: string;
  drugId: string;
  indication: string | null;
  adultDose: string;
  pediatricDose: string | null;
  pediatricMinAge: string | null;
  pediatricMaxAge: string | null;
  maxDose: string | null;
  maxDoseUnit: string | null;
  frequency: string | null;
  duration: string | null;
  renalAdjust: string | null;
  hepaticAdjust: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrugIndication {
  id: string;
  drugId: string;
  indication: string;
  icdCode: string | null;
  priority: number;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrugContraindication {
  id: string;
  drugId: string;
  contraindication: string;
  severity: 'absolut' | 'relatif' | string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DrugInteraction {
  id: string;
  drugId: string;
  interactingDrugId: string;
  interactionType: 'mayor' | 'moderat' | 'minor' | string | null;
  effect: string | null;
  mechanism: string | null;
  management: string | null;
  createdAt: Date;
  updatedAt: Date;
  interactingDrug?: DrugSummary;
}

// =============================================================================
// TIPE DATA HERBAL
// =============================================================================

export interface Herbal {
  id: string;
  name: string;
  latinName: string | null;
  commonNames: string | null;
  plantPart: string | null;
  preparation: string | null;
  traditionalUse: string | null;
  safetyRating: 'aman' | 'hati-hati' | 'tidak aman' | string | null;
  pregnancySafety: string | null;
  lactationSafety: string | null;
  pediatricSafety: string | null;
  regulatoryStatus: string | null;
  references: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  compounds?: HerbalCompound[];
  indications?: HerbalIndication[];
  interactions?: HerbalInteraction[];
  isFavorite?: boolean;
}

export interface HerbalCompound {
  id: string;
  herbalId: string;
  compoundName: string;
  concentration: string | null;
  pharmacology: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HerbalIndication {
  id: string;
  herbalId: string;
  indication: string;
  evidenceLevel: 'kuat' | 'moderat' | 'lemah' | 'tradisional' | string | null;
  studyType: string | null;
  dosage: string | null;
  duration: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface HerbalInteraction {
  id: string;
  herbalId: string;
  interactingDrugId: string | null;
  interactingHerbalId: string | null;
  interactionType: 'mayor' | 'moderat' | 'minor' | string | null;
  effect: string | null;
  mechanism: string | null;
  management: string | null;
  references: string | null;
  createdAt: Date;
  updatedAt: Date;
  interactingDrug?: DrugSummary;
  interactingHerbal?: Herbal;
}

// =============================================================================
// TIPE DATA CATATAN KLINIS
// =============================================================================

export interface ClinicalNote {
  id: string;
  title: string;
  content: string;
  category: string;
  specialty: string | null;
  tags: string | null;
  source: string | null;
  author: string | null;
  version: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
}

// =============================================================================
// TIPE DATA GEJALA
// =============================================================================

export interface Symptom {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  drugMappings?: SymptomDrugMapping[];
}

export interface SymptomDrugMapping {
  id: string;
  symptomId: string;
  drugId: string;
  priority: number;
  isFirstLine: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  drug?: Drug;
  symptom?: Symptom;
}

// =============================================================================
// TIPE DATA FAVORIT
// =============================================================================

export interface Favorite {
  id: string;
  userId: string;
  itemType: 'drug' | 'herbal' | 'note';
  drugId: string | null;
  herbalId: string | null;
  noteId: string | null;
  notes: string | null;
  createdAt: Date;
  drug?: Drug;
  herbal?: Herbal;
  note?: ClinicalNote;
}

// =============================================================================
// TIPE DATA PENGGUNA
// =============================================================================

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// TIPE RESPONSE API
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// =============================================================================
// TIPE PENCARIAN
// =============================================================================

export interface SearchResult {
  type: 'drug' | 'herbal' | 'note' | 'symptom';
  id: string;
  name: string;
  description: string | null;
  relevance: number;
  matchType?: 'exact' | 'startsWith' | 'contains' | 'fuzzy';
  category?: string | null;
}

export interface GroupedSearchResults {
  drugs: SearchResult[];
  herbals: SearchResult[];
  symptoms: SearchResult[];
  notes: SearchResult[];
  totalResults: number;
  query: string;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  drugClass?: string;
  safetyRating?: string;
  evidenceLevel?: string;
  page?: number;
  pageSize?: number;
}

// =============================================================================
// TIPE KALKULATOR DOSIS
// =============================================================================

export interface DoseCalculation {
  drugId: string;
  drugName: string;
  weight: number;
  dosePerKg: number;
  calculatedDose: number;
  unit: string;
  frequency: string | null;
  maxDose: number | null;
  maxDoseUnit: string | null;
  isWithinMax: boolean;
  warning?: string;
}

export interface PediatricCalculationInput {
  drugId: string;
  weight: number;
  age?: number;
}

// =============================================================================
// KATEGORI
// =============================================================================

export const KELAS_OBAT = [
  'antibiotik',
  'antiviral',
  'antijamur',
  'kardiovaskular',
  'respirasi',
  'gastrointestinal',
  'neurologi',
  'psikiatri',
  'analgesik',
  'antiinflamasi',
  'hormonal',
  'imunologis',
  'onkologi',
  'antidiabetes',
  'lainnya',
] as const;

export const SPESIALIS_NOTES = [
  'kardiologi',
  'dermatologi',
  'igd',
  'gastroenterologi',
  'neurologi',
  'obstetri',
  'onkologi',
  'ortopedi',
  'pediatri',
  'psikiatri',
  'pulmonologi',
  'bedah',
  'urologi',
  'umum',
] as const;

export const KATEGORI_GEJALA = [
  'kardiovaskular',
  'respirasi',
  'gastrointestinal',
  'neurologi',
  'dermatologi',
  'muskuloskeletal',
  'psikiatri',
  'urologi',
  'umum',
] as const;

export type KelasObat = typeof KELAS_OBAT[number];
export type SpesialisNotes = typeof SPESIALIS_NOTES[number];
export type KategoriGejala = typeof KATEGORI_GEJALA[number];