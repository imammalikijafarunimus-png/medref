'use server';

import { cache } from 'react';
import { db } from '@/lib/db';
import { z } from 'zod';

/**
 * Skema validasi jumlah data untuk akses cepat.
 */
const CountSchema = z.object({
  drugsCount: z.number().int().nonnegative(),
  herbalsCount: z.number().int().nonnegative(),
  notesCount: z.number().int().nonnegative(),
  symptomsCount: z.number().int().nonnegative(),
});

/**
 * Mengambil jumlah data untuk akses cepat, dengan cache dan validasi schema.
 * @returns {Promise<{ drugsCount: number; herbalsCount: number; notesCount: number; symptomsCount: number }>}
 */
export const ambilJumlahData = cache(async () => {
  const [drugsCount, herbalsCount, notesCount, symptomsCount] = await Promise.all([
    db.drug.count(),
    db.herbal.count(),
    db.clinicalNote.count({ where: { isPublished: true } }),
    db.symptom.count(),
  ]);
  return CountSchema.parse({ drugsCount, herbalsCount, notesCount, symptomsCount });
});