// Layanan Catatan Klinis
import { db } from '@/lib/db';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import type { ClinicalNote } from '@/types';

// Ambil daftar catatan klinis
export async function ambilDaftarCatatan(options: {
  halaman?: number;
  batas?: number;
  kategori?: string;
  cari?: string;
} = {}) {
  const { halaman = 1, batas = 20, kategori, cari } = options;
  const skip = (halaman - 1) * batas;

  const where: Record<string, unknown> = { isPublished: true };

  if (kategori) {
    where.category = kategori;
  }

  if (cari) {
    where.OR = [
      { title: { contains: cari, mode: 'insensitive' } },
      { content: { contains: cari, mode: 'insensitive' } },
      { tags: { contains: cari, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    db.clinicalNote.findMany({
      where,
      skip,
      take: batas,
      orderBy: { updatedAt: 'desc' },
    }),
    db.clinicalNote.count({ where }),
  ]);

  return { data: data as ClinicalNote[], total };
}

// Ambil detail catatan
export async function ambilDetailCatatan(id: string) {
  const cacheKey = CacheKeys.notes.detail(id);
  const cached = cache.get<ClinicalNote>(cacheKey);
  if (cached) return cached;

  const catatan = await db.clinicalNote.findUnique({
    where: { id, isPublished: true },
  });

  if (catatan) {
    cache.set(cacheKey, catatan as ClinicalNote, CacheTTL.detail);
  }

  return catatan as ClinicalNote | null;
}

// Ambil kategori catatan
export async function ambilKategoriCatatan() {
  const cacheKey = CacheKeys.notes.categories();
  const cached = cache.get<string[]>(cacheKey);
  if (cached) return cached;

  const result = await db.clinicalNote.findMany({
    where: { isPublished: true },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  const kategori = result.map((r) => r.category);
  cache.set(cacheKey, kategori, CacheTTL.static);
  return kategori;
}

// Buat catatan baru
export async function buatCatatan(data: {
  title: string;
  content: string;
  category: string;
  specialty?: string;
  tags?: string[];
  source?: string;
  author?: string;
  isPublished?: boolean;
}) {
  const catatan = await db.clinicalNote.create({
    data: {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    },
  });

  cache.deletePattern('^notes:list:');
  return catatan;
}

// Update catatan
export async function updateCatatan(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    category: string;
    specialty: string;
    tags: string[];
    source: string;
    author: string;
    isPublished: boolean;
  }>
) {
  const catatan = await db.clinicalNote.update({
    where: { id },
    data: {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
      version: { increment: 1 },
    },
  });

  cache.delete(CacheKeys.notes.detail(id));
  cache.deletePattern('^notes:list:');
  return catatan;
}

// Hapus catatan
export async function hapusCatatan(id: string) {
  await db.clinicalNote.delete({ where: { id } });

  cache.delete(CacheKeys.notes.detail(id));
  cache.deletePattern('^notes:list:');
}

// Hitung total catatan
export async function hitungTotalCatatan() {
  return db.clinicalNote.count({ where: { isPublished: true } });
}