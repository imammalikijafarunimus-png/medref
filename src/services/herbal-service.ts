// Layanan Data Herbal (DTO + Mapper Version)
import { db } from '@/lib/db';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';

import {
  mapToHerbalListDTO,
  mapToHerbalDetailDTO,
} from '@/lib/mappers/herbal.mapper';

import type {
  HerbalListDTO,
  HerbalDetailDTO,
} from '@/types/dto/herbal.dto';

//
// ==========================
// 🔷 AMBIL DAFTAR HERBAL
// ==========================
//

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

  const cacheKey = CacheKeys.herbals.list({
    halaman,
    batas,
    cari,
    keamanan,
  });

  const cached = cache.get<{
    data: HerbalListDTO[];
    total: number;
    halaman: number;
    batas: number;
  }>(cacheKey);

  if (cached) return cached;

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

  const result = {
    data: data.map(mapToHerbalListDTO),
    total,
    halaman,
    batas,
  };

  cache.set(cacheKey, result, CacheTTL.list);

  return result;
}

//
// ==========================
// 🔷 AMBIL DETAIL HERBAL
// ==========================
//

export async function ambilDetailHerbal(
  id: string
): Promise<HerbalDetailDTO | null> {
  const cacheKey = CacheKeys.herbals.detail(id);

  const cached = cache.get<HerbalDetailDTO>(cacheKey);
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
          interactingDrug: true,
        },
      },
    },
  });

  if (!herbal) return null;

  const dto = mapToHerbalDetailDTO(herbal);

  cache.set(cacheKey, dto, CacheTTL.detail);

  return dto;
}

//
// ==========================
// 🔷 BUAT HERBAL
// ==========================
//

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
      commonNames: data.commonNames
        ? JSON.stringify(data.commonNames)
        : null,
    },
  });

  // invalidate cache
  cache.deletePattern('^herbals:list:');

  return herbal;
}

//
// ==========================
// 🔷 UPDATE HERBAL
// ==========================
//

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
      commonNames: data.commonNames
        ? JSON.stringify(data.commonNames)
        : undefined,
    },
  });

  // invalidate cache
  cache.delete(CacheKeys.herbals.detail(id));
  cache.deletePattern('^herbals:list:');

  return herbal;
}

//
// ==========================
// 🔷 HAPUS HERBAL
// ==========================
//

export async function hapusHerbal(id: string) {
  await db.herbal.delete({ where: { id } });

  cache.delete(CacheKeys.herbals.detail(id));
  cache.deletePattern('^herbals:list:');
}

//
// ==========================
// 🔷 TAMBAH SENYAWA
// ==========================
//

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

//
// ==========================
// 🔷 TAMBAH INDIKASI
// ==========================
//

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

//
// ==========================
// 🔷 TOTAL HERBAL
// ==========================
//

export async function hitungTotalHerbal() {
  return db.herbal.count();
}