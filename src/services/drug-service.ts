// Layanan Data Obat
import { db } from '@/lib/db';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import type { Drug, DrugDose, DrugIndication, DrugContraindication, DrugInteraction } from '@prisma/client';

// Type untuk obat dengan relasi (hasil dari Prisma include)
export type DrugWithRelations = Drug & {
  doses: DrugDose[];
  indications: DrugIndication[];
  _count: {
    interactions: number;
    contraindications: number;
  };
};

// Type untuk detail obat lengkap
export type DrugDetail = Drug & {
  doses: DrugDose[];
  indications: DrugIndication[];
  contraindications: DrugContraindication[];
  interactions: (DrugInteraction & {
    interactingDrug: {
      id: string;
      name: string;
      genericName: string | null;
    };
  })[];
};

// Ambil daftar obat dengan paginasi
export async function ambilDaftarObat(options: {
  halaman?: number;
  batas?: number;
  kelas?: string;
  cari?: string;
} = {}) {
  const { halaman = 1, batas = 20, kelas, cari } = options;
  const skip = (halaman - 1) * batas;

  // Cek cache
  const cacheKey = CacheKeys.drugs.list(halaman, batas, kelas);
  const cached = cache.get<{ data: DrugWithRelations[]; total: number }>(cacheKey);
  if (cached && !cari) return cached;

  const where: Record<string, unknown> = {};
  
  if (kelas) {
    where.drugClass = kelas;
  }
  
  if (cari) {
    where.OR = [
      { name: { contains: cari, mode: 'insensitive' } },
      { genericName: { contains: cari, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    db.drug.findMany({
      where,
      skip,
      take: batas,
      orderBy: { name: 'asc' },
      include: {
        doses: { take: 1 },
        indications: { take: 3, orderBy: { priority: 'desc' } },
        _count: {
          select: { interactions: true, contraindications: true },
        },
      },
    }),
    db.drug.count({ where }),
  ]);

  const result = { data, total };

  // Simpan ke cache jika bukan pencarian
  if (!cari) {
    cache.set(cacheKey, result, CacheTTL.list);
  }

  return result;
}

// Ambil detail obat berdasarkan ID
export async function ambilDetailObat(id: string): Promise<DrugDetail | null> {
  // Cek cache
  const cacheKey = CacheKeys.drugs.detail(id);
  const cached = cache.get<DrugDetail>(cacheKey);
  if (cached) return cached;

  const obat = await db.drug.findUnique({
    where: { id },
    include: {
      doses: {
        orderBy: { createdAt: 'asc' },
      },
      indications: {
        orderBy: { priority: 'desc' },
      },
      contraindications: {
        orderBy: { severity: 'asc' },
      },
      interactions: {
        include: {
          interactingDrug: {
            select: { id: true, name: true, genericName: true },
          },
        },
        orderBy: { interactionType: 'asc' },
      },
    },
  });

  if (obat) {
    // Cast melalui unknown karena Prisma return type sudah benar
    // tapi TypeScript tidak bisa memverifikasi secara penuh
    cache.set(cacheKey, obat as unknown as DrugDetail, CacheTTL.detail);
  }

  return obat as unknown as DrugDetail | null;
}

// Ambil kelas obat untuk filter
export async function ambilKelasObat() {
  const cacheKey = CacheKeys.drugs.classes();
  const cached = cache.get<string[]>(cacheKey);
  if (cached) return cached;

  const result = await db.drug.findMany({
    where: { drugClass: { not: null } },
    select: { drugClass: true },
    distinct: ['drugClass'],
    orderBy: { drugClass: 'asc' },
  });

  const kelas = result
    .map((r) => r.drugClass)
    .filter((k): k is string => k !== null);

  cache.set(cacheKey, kelas, CacheTTL.static);
  return kelas;
}

// Buat obat baru
export async function buatObat(data: {
  name: string;
  genericName?: string;
  brandNames?: string[];
  drugClass?: string;
  mechanism?: string;
  route?: string;
  halfLife?: string;
  excretion?: string;
  pregnancyCat?: string;
  lactation?: string;
  storage?: string;
  notes?: string;
}) {
  const obat = await db.drug.create({
    data: {
      ...data,
      brandNames: data.brandNames ? JSON.stringify(data.brandNames) : null,
    },
  });

  // Hapus cache terkait
  cache.deletePattern('^drugs:list:');

  return obat;
}

// Update obat
export async function updateObat(
  id: string,
  data: Partial<{
    name: string;
    genericName: string;
    brandNames: string[];
    drugClass: string;
    mechanism: string;
    route: string;
    halfLife: string;
    excretion: string;
    pregnancyCat: string;
    lactation: string;
    storage: string;
    notes: string;
  }>
) {
  const obat = await db.drug.update({
    where: { id },
    data: {
      ...data,
      brandNames: data.brandNames ? JSON.stringify(data.brandNames) : undefined,
    },
  });

  // Hapus cache
  cache.delete(CacheKeys.drugs.detail(id));
  cache.deletePattern('^drugs:list:');

  return obat;
}

// Hapus obat
export async function hapusObat(id: string) {
  await db.drug.delete({ where: { id } });

  // Hapus cache
  cache.delete(CacheKeys.drugs.detail(id));
  cache.deletePattern('^drugs:list:');
}

// Tambah dosis obat
export async function tambahDosisObat(
  drugId: string,
  data: {
    indication?: string;
    adultDose: string;
    pediatricDose?: string;
    pediatricMinAge?: string;
    pediatricMaxAge?: string;
    maxDose?: string;
    maxDoseUnit?: string;
    frequency?: string;
    duration?: string;
    renalAdjust?: string;
    hepaticAdjust?: string;
    notes?: string;
  }
) {
  const dosis = await db.drugDose.create({
    data: { ...data, drugId },
  });

  // Hapus cache detail obat
  cache.delete(CacheKeys.drugs.detail(drugId));

  return dosis;
}

// Tambah indikasi obat
export async function tambahIndikasiObat(
  drugId: string,
  data: {
    indication: string;
    icdCode?: string;
    priority?: number;
    notes?: string;
  }
) {
  const indikasi = await db.drugIndication.create({
    data: { ...data, drugId },
  });

  cache.delete(CacheKeys.drugs.detail(drugId));
  return indikasi;
}

// Tambah kontraindikasi obat
export async function tambahKontraindikasiObat(
  drugId: string,
  data: {
    contraindication: string;
    severity?: string;
    notes?: string;
  }
) {
  const kontraindikasi = await db.drugContraindication.create({
    data: { ...data, drugId },
  });

  cache.delete(CacheKeys.drugs.detail(drugId));
  return kontraindikasi;
}

// Tambah interaksi obat
export async function tambahInteraksiObat(
  drugId: string,
  data: {
    interactingDrugId: string;
    interactionType?: string;
    effect?: string;
    mechanism?: string;
    management?: string;
  }
) {
  const interaksi = await db.drugInteraction.create({
    data: { ...data, drugId },
  });

  cache.delete(CacheKeys.drugs.detail(drugId));
  cache.delete(CacheKeys.drugs.detail(data.interactingDrugId));
  return interaksi;
}

// Cek interaksi antara dua obat
export async function cekInteraksiObat(drugId1: string, drugId2: string) {
  const interaksi = await db.drugInteraction.findFirst({
    where: {
      OR: [
        { drugId: drugId1, interactingDrugId: drugId2 },
        { drugId: drugId2, interactingDrugId: drugId1 },
      ],
    },
    include: {
      drug: { select: { id: true, name: true } },
      interactingDrug: { select: { id: true, name: true } },
    },
  });

  return interaksi;
}

// Hitung jumlah total obat
export async function hitungTotalObat() {
  return db.drug.count();
}