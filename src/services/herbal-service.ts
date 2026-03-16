// Layanan Data Herbal
import { db } from '@/lib/db';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import type { Herbal } from '@/types';

// Ambil daftar herbal
export async function ambilDaftarHerbal(options: {
  halaman?: number;
  batas?: number;
  cari?: string;
  keamanan?: string;
} = {}) {
  const { halaman = 1, batas = 20, cari, keamanan } = options;
  const skip = (halaman - 1) * batas;

  const where: Record<string, unknown> = {};

  if (keamanan) {
    where.safetyRating = keamanan;
  }

  if (cari) {
    where.OR = [
      { name: { contains: cari, mode: 'insensitive' } },
      { latinName: { contains: cari, mode: 'insensitive' } },
      { commonNames: { contains: cari, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    db.herbal.findMany({
      where,
      skip,
      take: batas,
      orderBy: { name: 'asc' },
      include: {
        indications: { take: 3 },
        _count: {
          select: { interactions: true },
        },
      },
    }),
    db.herbal.count({ where }),
  ]);

  return { data: data as Herbal[], total };
}

// Ambil detail herbal
export async function ambilDetailHerbal(id: string) {
  const cacheKey = CacheKeys.herbals.detail(id);
  const cached = cache.get<Herbal>(cacheKey);
  if (cached) return cached;

  const herbal = await db.herbal.findUnique({
    where: { id },
    include: {
      compounds: true,
      indications: {
        orderBy: { evidenceLevel: 'asc' },
      },
      interactions: {
        where: { interactingDrugId: { not: null } },
        include: {
          interactingDrug: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (herbal) {
    cache.set(cacheKey, herbal as Herbal, CacheTTL.detail);
  }

  return herbal as Herbal | null;
}

// Buat herbal baru
export async function buatHerbal(data: {
  name: string;
  latinName?: string;
  commonNames?: string[];
  plantPart?: string;
  preparation?: string;
  traditionalUse?: string;
  safetyRating?: string;
  pregnancySafety?: string;
  lactationSafety?: string;
  pediatricSafety?: string;
  regulatoryStatus?: string;
  references?: string;
  notes?: string;
}) {
  const herbal = await db.herbal.create({
    data: {
      ...data,
      commonNames: data.commonNames ? JSON.stringify(data.commonNames) : null,
    },
  });

  cache.deletePattern('^herbals:list:');
  return herbal;
}

// Update herbal
export async function updateHerbal(
  id: string,
  data: Partial<{
    name: string;
    latinName: string;
    commonNames: string[];
    plantPart: string;
    preparation: string;
    traditionalUse: string;
    safetyRating: string;
    pregnancySafety: string;
    lactationSafety: string;
    pediatricSafety: string;
    regulatoryStatus: string;
    references: string;
    notes: string;
  }>
) {
  const herbal = await db.herbal.update({
    where: { id },
    data: {
      ...data,
      commonNames: data.commonNames ? JSON.stringify(data.commonNames) : undefined,
    },
  });

  cache.delete(CacheKeys.herbals.detail(id));
  cache.deletePattern('^herbals:list:');
  return herbal;
}

// Hapus herbal
export async function hapusHerbal(id: string) {
  await db.herbal.delete({ where: { id } });

  cache.delete(CacheKeys.herbals.detail(id));
  cache.deletePattern('^herbals:list:');
}

// Tambah senyawa aktif herbal
export async function tambahSenyawaHerbal(
  herbalId: string,
  data: {
    compoundName: string;
    concentration?: string;
    pharmacology?: string;
    notes?: string;
  }
) {
  const senyawa = await db.herbalCompound.create({
    data: { ...data, herbalId },
  });

  cache.delete(CacheKeys.herbals.detail(herbalId));
  return senyawa;
}

// Tambah indikasi herbal
export async function tambahIndikasiHerbal(
  herbalId: string,
  data: {
    indication: string;
    evidenceLevel?: string;
    studyType?: string;
    dosage?: string;
    duration?: string;
    notes?: string;
  }
) {
  const indikasi = await db.herbalIndication.create({
    data: { ...data, herbalId },
  });

  cache.delete(CacheKeys.herbals.detail(herbalId));
  return indikasi;
}

// Hitung total herbal
export async function hitungTotalHerbal() {
  return db.herbal.count();
}