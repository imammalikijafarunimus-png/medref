// Layanan Data Gejala
import { db } from '@/lib/db';
import type { Symptom, SymptomDrugMapping } from '@/types';

// Ambil daftar gejala
export async function ambilDaftarGejala(options: {
  halaman?: number;
  batas?: number;
  kategori?: string;
  cari?: string;
} = {}) {
  const { halaman = 1, batas = 20, kategori, cari } = options;
  const skip = (halaman - 1) * batas;

  const where: Record<string, unknown> = {};

  if (kategori) {
    where.category = kategori;
  }

  if (cari) {
    where.OR = [
      { name: { contains: cari, mode: 'insensitive' } },
      { description: { contains: cari, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    db.symptom.findMany({
      where,
      skip,
      take: batas,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { drugMappings: true },
        },
      },
    }),
    db.symptom.count({ where }),
  ]);

  return { data: data as Symptom[], total };
}

// Ambil detail gejala dengan rekomendasi obat
export async function ambilDetailGejala(id: string) {
  const gejala = await db.symptom.findUnique({
    where: { id },
    include: {
      drugMappings: {
        include: {
          drug: {
            select: {
              id: true,
              name: true,
              genericName: true,
              drugClass: true,
            },
          },
        },
        orderBy: [
          { isFirstLine: 'desc' },
          { priority: 'desc' },
        ],
      },
    },
  });

  return gejala as (Symptom & { drugMappings: SymptomDrugMapping[] }) | null;
}

// Ambil kategori gejala
export async function ambilKategoriGejala() {
  const result = await db.symptom.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  return result
    .map((r) => r.category)
    .filter((k): k is string => k !== null);
}

// Buat gejala baru
export async function buatGejala(data: {
  name: string;
  category?: string;
  description?: string;
}) {
  return db.symptom.create({ data });
}

// Update gejala
export async function updateGejala(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    description: string;
  }>
) {
  return db.symptom.update({
    where: { id },
    data,
  });
}

// Hapus gejala
export async function hapusGejala(id: string) {
  return db.symptom.delete({ where: { id } });
}

// Tambah mapping gejala-obat
export async function tambahMappingGejalaObat(
  symptomId: string,
  data: {
    drugId: string;
    priority?: number;
    isFirstLine?: boolean;
    notes?: string;
  }
) {
  return db.symptomDrugMapping.create({
    data: { ...data, symptomId },
  });
}

// Hitung total gejala
export async function hitungTotalGejala() {
  return db.symptom.count();
}