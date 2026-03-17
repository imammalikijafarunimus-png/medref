/**
 * Type definitions untuk seed data MedRef
 * Enterprise-Grade Medical Database Schema
 * Version: 2.0.0
 * 
 * Standards:
 * - Language consistency: Bahasa Indonesia untuk konten, English untuk field teknis
 * - Strict enum typing untuk mencegah typo dan inkonsistensi
 * - Structured objects untuk data kompleks
 * - ISO/ICD standards untuk coding
 */

// ============================================
// SHARED ENUM TYPES
// ============================================

/** Severity levels untuk contraindications dan interactions */
export type SeverityLevel = 'absolut' | 'relatif';

/** Interaction severity classification */
export type InteractionSeverity = 'mayor' | 'moderat' | 'minor';

/** Evidence level berdasarkan hierarchy of evidence */
export type EvidenceLevel = 'kuat' | 'moderat' | 'lemah' | 'tradisional' | 'teoritis';

/** Study types untuk evidence classification */
export type StudyType = 
  | 'meta-analysis'
  | 'systematic-review'
  | 'RCT-double-blind'
  | 'RCT-single-blind'
  | 'RCT-open-label'
  | 'RCT'  // Shorthand untuk RCT (details unknown)
  | 'RCT-kecil'  // Small RCT study
  | 'cohort-study'
  | 'case-control'
  | 'case-series'
  | 'case-report'
  | 'in-vitro'
  | 'animal-study'
  | 'observasi'  // Observational study (Indonesian)
  | 'observational'  // Observational study (English)
  | 'tradisional';

/** Safety rating untuk herbal products */
export type SafetyRating = 'aman' | 'hati-hati' | 'tidak-aman';

/** Pregnancy categories (FDA) */
export type PregnancyCategory = 'A' | 'B' | 'C' | 'D' | 'X' | 'N';

/** Drug categories - standardized */
export type DrugCategory = 
  | 'analgesic'
  | 'antibiotic'
  | 'antiviral'
  | 'antifungal'
  | 'antihypertensive'
  | 'cardiovascular'
  | 'endocrine'
  | 'respiratory'
  | 'neurology'
  | 'psychiatry'
  | 'gastrointestinal'
  | 'dermatology'
  | 'ophthalmology'
  | 'otolaryngology'
  | 'urology'
  | 'gynecology'
  | 'hematology'
  | 'immunology'
  | 'oncology'
  | 'anesthesia'
  | 'antidote'
  | 'vaccine'
  | 'vitamin-supplement'
  // Additional cardiovascular sub-categories
  | 'diuretic'
  | 'anticoagulant'
  | 'antiarrhythmic'
  | 'lipid-lowering'
  | 'antianginal'
  // Additional categories
  | 'antimigraine'
  | 'antigout'
  | 'antihistamine'
  | 'antiemetic'
  | 'laxative'
  | 'antidiabetic'
  | 'thyroid'
  | 'corticosteroid';

/** Herbal categories - standardized */
export type HerbalCategory =
  | 'digestive'
  | 'immunity'
  | 'antiinflammatory'
  | 'respiratory'
  | 'nervous'
  | 'cardiovascular'
  | 'metabolic'
  | 'skin-topical'
  | 'urinary'
  | 'reproductive'
  | 'analgesic';

// ============================================
// DRUG TYPES
// ============================================

/** Structured dosage information */
export type StructuredDosage = {
  /** Jumlah (e.g., "500") */
  amount: string;
  /** Satuan (mg, g, ml, mcg, unit) */
  unit: string;
  /** Frekuensi pemberian */
  frequency: string;
  /** Populasi target */
  population?: 'dewasa' | 'anak' | 'lanjut-usia' | 'semua';
};

export type DrugDoseData = {
  /** Indikasi spesifik untuk dosis ini */
  indication?: string;
  /** Dosis dewasa */
  adultDose: string;
  /** Dosis anak */
  pediatricDose?: string;
  /** Usia minimum anak (contoh: "2 tahun") */
  pediatricMinAge?: string;
  /** Usia maksimum anak */
  pediatricMaxAge?: string;
  /** Dosis maksimum per hari */
  maxDose?: string;
  /** Satuan dosis maks (mg, g, ml) */
  maxDoseUnit?: string;
  /** Frekuensi pemberian */
  frequency?: string;
  /** Durasi pengobatan */
  duration?: string;
  /** Penyesuaian dosis gangguan ginjal */
  renalAdjust?: string;
  /** Penyesuaian dosis gangguan hati */
  hepaticAdjust?: string;
  /** Catatan khusus */
  notes?: string;
  /** Structured dosage untuk parsing (opsional) */
  structuredDosage?: StructuredDosage;
};

export type DrugIndicationData = {
  /** Nama indikasi */
  indication: string;
  /** Kode ICD-10 */
  icdCode?: string;
  /** Prioritas (1 = utama) */
  priority?: number;
  /** Apakah indikasi FDA-approved */
  isFdaApproved?: boolean;
  /** Apakah indikasi BPOM-approved */
  isBpomApproved?: boolean;
  /** Catatan */
  notes?: string;
};

export type DrugContraindicationData = {
  /** Nama kontraindikasi */
  contraindication: string;
  /** Tingkat keparahan */
  severity?: SeverityLevel;
  /** Catatan */
  notes?: string;
};

export type DrugInteractionData = {
  /** ID obat yang berinteraksi */
  interactingDrugId: string;
  /** Nama obat (untuk readability) */
  interactingDrugName?: string;
  /** Jenis interaksi */
  interactionType?: InteractionSeverity;
  /** Efek interaksi */
  effect?: string;
  /** Mekanisme interaksi */
  mechanism?: string;
  /** Penatalaksanaan */
  management?: string;
  /** Level bukti interaksi */
  evidenceLevel?: EvidenceLevel;
  /** Referensi */
  references?: string;
};

/** Regulatory status object - structured */
export type RegulatoryStatus = {
  /** Status BPOM Indonesia */
  BPOM?: 'terdaftar' | 'obat-keras' | 'obat-bebas' | 'obat-bebas-terbatas' | 'psikotropika' | 'narkotika';
  /** Status FDA */
  FDA?: 'approved' | 'not-approved' | 'discontinued' | 'tentative-approval';
  /** Status EMA European */
  EMA?: 'authorized' | 'refused' | 'withdrawn';
  /** Status JKN/BPJS Kesehatan */
  JKN?: 'formularium' | 'non-formularium';
  /** Catatan regulasi */
  notes?: string;
};

export type DrugSeedData = {
  // ==================== IDENTITAS ====================
  /** ID unik dengan prefix kategori (e.g., 'antibio-amoxicillin') */
  id: string;
  /** Nama brand/umum */
  name: string;
  /** Nama generik */
  genericName?: string;
  /** Brand names (comma separated) */
  brandNames?: string;
  /** Kelas obat */
  drugClass?: string;
  /** Kategori (standardized) */
  category?: DrugCategory;
  
  // ==================== DESKRIPSI ====================
  /** Deskripsi lengkap */
  description?: string;
  /** Mekanisme kerja */
  mechanism?: string;
  /** Rute pemberian */
  route?: string;
  
  // ==================== FARMAKOKINETIK ====================
  /** Waktu paruh */
  halfLife?: string;
  /** Bioavailabilitas */
  bioavailability?: string;
  /** Protein binding */
  proteinBinding?: string;
  /** Metabolisme */
  metabolism?: string;
  /** Ekskresi */
  excretion?: string;
  
  // ==================== KEAMANAN ====================
  /** Kategori kehamilan (FDA) */
  pregnancyCat?: PregnancyCategory | string;
  /** Keamanan menyusui */
  lactation?: string;
  /** Black box warning */
  blackBoxWarning?: string;
  
  // ==================== REGULASI ====================
  /** Status regulasi (JSON string or object) */
  regulatoryStatus?: RegulatoryStatus | string;
  /** Parameter monitoring */
  monitoringParameters?: string;
  /** Edukasi pasien */
  counselingPoints?: string;
  
  // ==================== PENYIMPANAN ====================
  /** Cara penyimpanan */
  storage?: string;
  
  // ==================== CATATAN ====================
  /** Catatan tambahan */
  notes?: string;

  // ==================== RELATIONS ====================
  /** Dosis berbagai indikasi */
  doses?: DrugDoseData[];
  /** Indikasi */
  indications?: DrugIndicationData[];
  /** Kontraindikasi */
  contraindications?: (DrugContraindicationData | string)[];
  /** Interaksi */
  interactions?: DrugInteractionData[];
};

// ============================================
// HERBAL TYPES
// ============================================

export type HerbalCompoundData = {
  /** Nama senyawa aktif (gunakan nama standar internasional) */
  compoundName: string;
  /** Nama alternatif/sinonim */
  synonyms?: string;
  /** Konsentrasi */
  concentration?: string;
  /** Farmakologi senyawa */
  pharmacology?: string;
  /** Aktivitas biologis */
  biologicalActivity?: string;
  /** Catatan */
  notes?: string;
};

export type HerbalIndicationData = {
  /** Indikasi */
  indication: string;
  /** Level bukti */
  evidenceLevel?: EvidenceLevel;
  /** Jenis studi */
  studyType?: StudyType;
  /** Dosis untuk indikasi ini */
  dosage?: string;
  /** Structured dosage */
  structuredDosage?: StructuredDosage;
  /** Durasi pengobatan */
  duration?: string;
  /** Populasi studi */
  studyPopulation?: string;
  /** Hasil utama studi */
  studyResults?: string;
  /** Catatan */
  notes?: string;
  /** Referensi */
  references?: string;
};

export type HerbalInteractionData = {
  /** ID obat yang berinteraksi */
  interactingDrugId?: string;
  /** Nama obat (untuk readability) */
  interactingDrugName?: string;
  /** ID herbal yang berinteraksi */
  interactingHerbalId?: string;
  /** Nama herbal (untuk readability) */
  interactingHerbalName?: string;
  /** Jenis interaksi */
  interactionType?: InteractionSeverity;
  /** Efek interaksi */
  effect?: string;
  /** Mekanisme */
  mechanism?: string;
  /** Penatalaksanaan */
  management?: string;
  /** Level bukti */
  evidenceLevel?: EvidenceLevel;
  /** Referensi */
  references?: string;
};

/** Regulatory status untuk herbal */
export type HerbalRegulatoryStatus = {
  /** Status BPOM (Jamu, Fitofarmaka, Standardized Herbal, Suplemen Kesehatan) */
  BPOM?: 'jamu' | 'fitofarmaka' | 'standardized-herbal' | 'suplemen-kesehatan' | 'tidak-terdaftar';
  /** Status FDA (GRAS, Supplement, Drug) */
  FDA?: 'GRAS' | 'dietary-supplement' | 'approved-drug' | 'not-approved';
  /** Status EMA */
  EMA?: 'traditional-herbal' | 'well-established-use' | 'not-assessed';
  /** Monograph references */
  monographs?: string[];
  /** Catatan regulasi */
  notes?: string;
};

export type HerbalSeedData = {
  // ==================== IDENTITAS ====================
  /** ID unik dengan prefix kategori (e.g., 'digest-ginger') */
  id: string;
  /** Nama umum (Indonesia) */
  name: string;
  /** Nama latin */
  latinName?: string;
  /** Nama lain (comma separated) */
  commonNames?: string;
  /** Nama lokal Indonesia */
  localNames?: string;
  /** Family tanaman */
  plantFamily?: string;
  
  // ==================== DESKRIPSI ====================
  /** Kategori (standardized) */
  category?: HerbalCategory;
  /** Deskripsi */
  description?: string;
  /** Bagian tanaman yang digunakan */
  plantPart?: string;
  /** Cara preparasi */
  preparation?: string;
  /** Penggunaan tradisional */
  traditionalUse?: string;
  
  // ==================== KEAMANAN ====================
  /** Rating keamanan */
  safetyRating?: SafetyRating;
  /** Keamanan saat hamil */
  pregnancySafety?: string;
  /** Keamanan saat menyusui */
  lactationSafety?: string;
  /** Keamanan untuk anak */
  pediatricSafety?: string;
  /** Contraindications */
  contraindications?: string;
  /** Side effects */
  sideEffects?: string;
  /** Black box warning - peringatan keamanan penting */
  blackBoxWarning?: string;
  
  // ==================== REGULASI ====================
  /** Status regulasi (structured) */
  regulatoryStatus?: HerbalRegulatoryStatus;
  
  // ==================== REFERENSI ====================
  /** Referensi ilmiah */
  references?: string;
  /** Catatan tambahan */
  notes?: string;

  // ==================== RELATIONS ====================
  /** Senyawa aktif */
  compounds?: HerbalCompoundData[];
  /** Indikasi */
  indications?: HerbalIndicationData[];
  /** Interaksi */
  interactions?: HerbalInteractionData[];
};

// ============================================
// SYMPTOM TYPES
// ============================================

export type SymptomDrugMappingData = {
  /** ID obat */
  drugId: string;
  /** Nama obat (untuk readability) */
  drugName?: string;
  /** Prioritas (1 = tertinggi) */
  priority?: number;
  /** Apakah obat lini pertama */
  isFirstLine?: boolean;
  /** Level bukti */
  evidenceLevel?: EvidenceLevel;
  /** Catatan penggunaan */
  notes?: string;
};

export type SymptomSeedData = {
  /** ID unik */
  id: string;
  /** Nama gejala */
  name: string;
  /** Kategori gejala */
  category?: string;
  /** Deskripsi */
  description?: string;
  /** Kode ICD-10 */
  icdCode?: string;
  /** Mapping ke obat */
  drugMappings?: SymptomDrugMappingData[];
};

// ============================================
// CLINICAL NOTE TYPES
// ============================================

export type ClinicalNoteSeedData = {
  /** ID unik */
  id: string;
  /** Judul catatan */
  title: string;
  /** Konten (markdown-like) */
  content: string;
  /** Kategori */
  category: string;
  /** Spesialisasi */
  specialty?: string;
  /** Tags (comma separated) */
  tags?: string;
  /** Sumber referensi */
  source?: string;
  /** Penulis */
  author?: string;
  /** Versi dokumen */
  version?: number;
  /** Status publikasi */
  isPublished?: boolean;
  /** Last updated */
  lastUpdated?: string;
};

// ============================================
// DRUG INTERACTION TYPE (untuk file terpisah)
// ============================================

export type DrugInteractionSeedData = {
  /** ID obat A */
  drugAId: string;
  /** Nama obat A */
  drugAName?: string;
  /** ID obat B */
  drugBId: string;
  /** Nama obat B */
  drugBName?: string;
  /** Jenis interaksi */
  interactionType?: InteractionSeverity;
  /** Efek */
  effect?: string;
  /** Mekanisme */
  mechanism?: string;
  /** Penatalaksanaan */
  management?: string;
  /** Level bukti */
  evidenceLevel?: EvidenceLevel;
  /** Onset */
  onset?: 'rapid' | 'delayed';
  /** Referensi */
  references?: string;
};

// ============================================
// HELPER TYPES
// ============================================

/** Type untuk statistik database */
export type DatabaseStats = {
  totalDrugs: number;
  totalHerbals: number;
  totalSymptoms: number;
  totalInteractions: number;
  categoriesCount: Record<DrugCategory, number>;
  herbalCategoriesCount: Record<HerbalCategory, number>;
};

/** Type untuk validation result */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};