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

// ─────────────────────────────────────────────────────────────────
// Popular Tags — kombinasi search log + view count
// ─────────────────────────────────────────────────────────────────

const FALLBACK_TAGS = ['Amoksisilin', 'Metformin', 'Kunyit', 'INR Lab', 'BMI'];

/**
 * Mengambil tag populer dari dua sumber:
 * 1. Query yang paling sering dicari (SearchLog) dalam 30 hari terakhir
 * 2. Obat & herbal dengan viewCount tertinggi
 *
 * Hasilnya digabung, dideduplikasi, dan dibatasi 8 tag.
 * Fallback ke data dummy jika DB belum punya data.
 */
export const ambilPopularTags = cache(async (): Promise<string[]> => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [topSearches, topDrugs, topHerbals] = await Promise.all([
      // Top 5 query dari search log 30 hari terakhir
      db.searchLog.groupBy({
        by: ['query'],
        _count: { query: true },
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { _count: { query: 'desc' } },
        take: 5,
      }),

      // Top 3 obat berdasarkan viewCount
      db.drug.findMany({
        select: { name: true },
        where: { viewCount: { gt: 0 } },
        orderBy: { viewCount: 'desc' },
        take: 3,
      }),

      // Top 2 herbal berdasarkan viewCount
      db.herbal.findMany({
        select: { name: true },
        where: { viewCount: { gt: 0 } },
        orderBy: { viewCount: 'desc' },
        take: 2,
      }),
    ]);

    // Gabungkan: search queries dulu (lebih relevan), lalu viewed items
    const searchTags = topSearches.map((s) => {
      // Kapitalisasi huruf pertama tiap kata agar konsisten di UI
      return s.query
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    });

    const viewTags = [
      ...topDrugs.map((d) => d.name),
      ...topHerbals.map((h) => h.name),
    ];

    // Deduplikasi case-insensitive, batasi 8 tag
    const seen = new Set<string>();
    const combined: string[] = [];

    for (const tag of [...searchTags, ...viewTags]) {
      const key = tag.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        combined.push(tag);
      }
      if (combined.length >= 8) break;
    }

    return combined.length > 0 ? combined : FALLBACK_TAGS;
  } catch {
    // Jika DB belum di-migrate atau terjadi error, fallback aman
    return FALLBACK_TAGS;
  }
});