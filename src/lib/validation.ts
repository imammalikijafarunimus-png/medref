// Skema Validasi Input menggunakan Zod
// Melindungi dari injeksi data tidak valid/berbahaya

import { z } from 'zod';

// Skema field umum
const skemaNama = z.string().min(1).max(200).trim();
const skemaDeskripsi = z.string().max(5000).optional();
const stringOpsional = z.string().max(500).optional();

// Skema validasi obat
export const skemaBuatObat = z.object({
  name: skemaNama,
  genericName: stringOpsional,
  brandNames: z.array(z.string().max(100)).max(20).optional(),
  drugClass: z.enum([
    'antibiotik', 'antiviral', 'antijamur', 'kardiovaskular',
    'respirasi', 'gastrointestinal', 'neurologi', 'psikiatri',
    'analgesik', 'antiinflamasi', 'hormonal', 'imunologis',
    'onkologi', 'antidiabetes', 'lainnya'
  ]).optional(),
  mechanism: skemaDeskripsi,
  route: z.enum(['oral', 'iv', 'im', 'sc', 'topikal', 'inhalasi', 'rektal', 'oftalmik', 'otik', 'nasal']).optional(),
  halfLife: stringOpsional,
  excretion: stringOpsional,
  pregnancyCat: z.enum(['a', 'b', 'c', 'd', 'x', 'n']).optional(),
  lactation: stringOpsional,
  storage: stringOpsional,
  notes: skemaDeskripsi,
});

export const skemaUpdateObat = skemaBuatObat.partial();

// Skema dosis obat
export const skemaDosisObat = z.object({
  indication: stringOpsional,
  adultDose: z.string().min(1).max(200),
  pediatricDose: stringOpsional,
  pediatricMinAge: stringOpsional,
  pediatricMaxAge: stringOpsional,
  maxDose: stringOpsional,
  maxDoseUnit: z.enum(['mg', 'g', 'mcg', 'IU', 'mL', 'units']).optional(),
  frequency: stringOpsional,
  duration: stringOpsional,
  renalAdjust: stringOpsional,
  hepaticAdjust: stringOpsional,
  notes: skemaDeskripsi,
});

// Skema indikasi obat
export const skemaIndikasiObat = z.object({
  indication: skemaNama,
  icdCode: z.string().max(20).optional(),
  priority: z.number().int().min(0).max(100).optional(),
  notes: skemaDeskripsi,
});

// Skema kontraindikasi obat
export const skemaKontraindikasiObat = z.object({
  contraindication: skemaNama,
  severity: z.enum(['absolut', 'relatif']).optional(),
  notes: skemaDeskripsi,
});

// Skema interaksi obat
export const skemaInteraksiObat = z.object({
  interactingDrugId: z.string().cuid(),
  interactionType: z.enum(['mayor', 'moderat', 'minor']).optional(),
  effect: skemaDeskripsi,
  mechanism: skemaDeskripsi,
  management: skemaDeskripsi,
});

// Skema validasi herbal
export const skemaBuatHerbal = z.object({
  name: skemaNama,
  latinName: stringOpsional,
  commonNames: z.array(z.string().max(100)).max(20).optional(),
  plantPart: stringOpsional,
  preparation: stringOpsional,
  traditionalUse: skemaDeskripsi,
  safetyRating: z.enum(['aman', 'hati-hati', 'tidak aman']).optional(),
  pregnancySafety: stringOpsional,
  lactationSafety: stringOpsional,
  pediatricSafety: stringOpsional,
  regulatoryStatus: stringOpsional,
  references: skemaDeskripsi,
  notes: skemaDeskripsi,
});

export const skemaUpdateHerbal = skemaBuatHerbal.partial();

// Skema indikasi herbal
export const skemaIndikasiHerbal = z.object({
  indication: skemaNama,
  evidenceLevel: z.enum(['kuat', 'moderat', 'lemah', 'tradisional']).optional(),
  studyType: stringOpsional,
  dosage: stringOpsional,
  duration: stringOpsional,
  notes: skemaDeskripsi,
});

// Skema catatan klinis
export const skemaBuatCatatanKlinis = z.object({
  title: z.string().min(1).max(300).trim(),
  content: z.string().min(1).max(50000),
  category: z.string().min(1).max(100),
  specialty: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  source: stringOpsional,
  author: stringOpsional,
  isPublished: z.boolean().optional(),
});

export const skemaUpdateCatatanKlinis = skemaBuatCatatanKlinis.partial();

// Skema gejala
export const skemaBuatGejala = z.object({
  name: skemaNama,
  category: z.string().max(100).optional(),
  description: skemaDeskripsi,
});

export const skemaUpdateGejala = skemaBuatGejala.partial();

// Skema mapping gejala-obat
export const skemaMappingGejalaObat = z.object({
  drugId: z.string().cuid(),
  priority: z.number().int().min(0).max(100).optional(),
  isFirstLine: z.boolean().optional(),
  notes: skemaDeskripsi,
});

// Skema pencarian
export const skemaPencarian = z.object({
  q: z.string().max(200).optional(),
  type: z.enum(['all', 'drugs', 'herbals', 'notes', 'symptoms']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// Skema pagination
export const skemaPagination = z.object({
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Skema kalkulator
export const skemaInputKalkulator = z.object({
  drugId: z.string().cuid(),
  weight: z.number().positive().max(500),
  age: z.number().min(0).max(150).optional(),
});

// Skema login admin
export const skemaLoginAdmin = z.object({
  password: z.string().min(1).max(100),
});

// Skema favorit
export const skemaFavorit = z.object({
  itemType: z.enum(['drug', 'herbal', 'note']),
  itemId: z.string().cuid(),
});

// Sanitasi string input untuk mencegah XSS
export function sanitasiString(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validasi dan sanitasi input
export function validasiInput<T>(
  skema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = skema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error };
}

// Format error Zod untuk response API
export function formatErrorZod(errors: z.ZodError): string[] {
  return errors.issues.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  });
}