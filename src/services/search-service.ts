// Layanan Pencarian Terpadu
import { db } from '@/lib/db';
import { fuzzyMatch } from '@/lib/fuzzy-search';
import { cache, CacheKeys, CacheTTL } from '@/lib/cache';
import type { SearchResult, GroupedSearchResults } from '@/types';

// Tipe hasil pencarian
export interface HasilPencarianItem {
  type: 'drug' | 'herbal' | 'note' | 'symptom';
  id: string;
  name: string;
  description: string | null;
  relevance: number;
  matchType: 'exact' | 'startsWith' | 'contains' | 'fuzzy';
  category?: string | null;
}

// Hitung skor relevansi dengan tipe pencocokan
function hitungRelevansi(
  nama: string,
  alternatif: string,
  query: string
): { skor: number; tipe: HasilPencarianItem['matchType'] } {
  const cariLower = query.toLowerCase();
  const namaLower = nama.toLowerCase();
  const alternatifLower = alternatif.toLowerCase();

  // Cocok sempurna
  if (namaLower === cariLower || alternatifLower === cariLower) {
    return { skor: 100, tipe: 'exact' };
  }

  // Diawali dengan
  if (namaLower.startsWith(cariLower) || alternatifLower.startsWith(cariLower)) {
    return { skor: 90, tipe: 'startsWith' };
  }

  // Mengandung kata utuh
  const kataNama = namaLower.split(/\s+/);
  const kataAlternatif = alternatifLower.split(/\s+/);
  if (kataNama.some((k) => k === cariLower) || kataAlternatif.some((k) => k === cariLower)) {
    return { skor: 80, tipe: 'contains' };
  }

  // Mengandung substring
  if (namaLower.includes(cariLower) || alternatifLower.includes(cariLower)) {
    return { skor: 70, tipe: 'contains' };
  }

  // Kata diawali dengan
  if (kataNama.some((k) => k.startsWith(cariLower)) || kataAlternatif.some((k) => k.startsWith(cariLower))) {
    return { skor: 60, tipe: 'contains' };
  }

  // Fuzzy match
  const skorNama = fuzzyMatch(nama, query);
  const skorAlternatif = fuzzyMatch(alternatif, query);
  const skorTerbaik = Math.max(skorNama, skorAlternatif);

  if (skorTerbaik >= 20) {
    return { skor: skorTerbaik, tipe: 'fuzzy' };
  }

  return { skor: 0, tipe: 'fuzzy' };
}

// Pencarian global dengan hasil terkelompok
export async function pencarianGlobal(
  query: string,
  options: {
    batasPerKategori?: number;
    termasukFuzzy?: boolean;
    skorMinimal?: number;
  } = {}
): Promise<GroupedSearchResults> {
  const { batasPerKategori = 5, termasukFuzzy = true, skorMinimal = 20 } = options;

  if (!query.trim()) {
    return {
      drugs: [],
      herbals: [],
      symptoms: [],
      notes: [],
      totalResults: 0,
      query: '',
    };
  }

  const queryNormal = query.trim().toLowerCase();

  // Cek cache untuk query pendek
  if (queryNormal.length <= 10) {
    const cacheKey = CacheKeys.search.global(queryNormal, `grouped-${batasPerKategori}`);
    const cached = cache.get<GroupedSearchResults>(cacheKey);
    if (cached) return cached;
  }

  // Jalankan semua pencarian paralel
  const [drugs, herbals, symptoms, notes] = await Promise.all([
    cariObat(query, batasPerKategori, termasukFuzzy, skorMinimal),
    cariHerbal(query, batasPerKategori, termasukFuzzy, skorMinimal),
    cariGejala(query, batasPerKategori, termasukFuzzy, skorMinimal),
    cariCatatan(query, batasPerKategori, termasukFuzzy, skorMinimal),
  ]);

  const hasil: GroupedSearchResults = {
    drugs,
    herbals,
    symptoms,
    notes,
    totalResults: drugs.length + herbals.length + symptoms.length + notes.length,
    query: queryNormal,
  };

  // Simpan ke cache
  if (queryNormal.length <= 10) {
    const cacheKey = CacheKeys.search.global(queryNormal, `grouped-${batasPerKategori}`);
    cache.set(cacheKey, hasil, CacheTTL.search);
  }

  return hasil;
}

// Cari obat
async function cariObat(
  query: string,
  limit: number,
  includeFuzzy: boolean,
  minScore: number
): Promise<SearchResult[]> {
  const prefixLength = Math.min(3, query.length);
  const prefix = query.slice(0, prefixLength);

  const obatList = await db.drug.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { name: { startsWith: prefix, mode: 'insensitive' } },
        { genericName: { contains: query, mode: 'insensitive' } },
        { genericName: { startsWith: prefix, mode: 'insensitive' } },
        { drugClass: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      genericName: true,
      drugClass: true,
    },
    take: 100,
  });

  const hasil: SearchResult[] = [];
  const sudahAda = new Set<string>();

  for (const obat of obatList) {
    if (sudahAda.has(obat.id)) continue;
    sudahAda.add(obat.id);

    const { skor, tipe } = hitungRelevansi(obat.name, obat.genericName || '', query);
    const skorKelas = obat.drugClass ? fuzzyMatch(obat.drugClass, query, 0.3) : 0;
    const skorAkhir = Math.max(skor, skorKelas);

    if (skorAkhir >= minScore) {
      hasil.push({
        type: 'drug',
        id: obat.id,
        name: obat.name,
        description: obat.genericName || obat.drugClass || null,
        relevance: skorAkhir,
        matchType: skorKelas > skor && tipe === 'fuzzy' ? 'contains' : tipe,
        category: obat.drugClass,
      });
    }
  }

  hasil.sort((a, b) => b.relevance - a.relevance);
  return hasil.slice(0, limit);
}

// Cari herbal
async function cariHerbal(
  query: string,
  limit: number,
  includeFuzzy: boolean,
  minScore: number
): Promise<SearchResult[]> {
  const prefixLength = Math.min(3, query.length);
  const prefix = query.slice(0, prefixLength);

  const herbalList = await db.herbal.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { name: { startsWith: prefix, mode: 'insensitive' } },
        { latinName: { contains: query, mode: 'insensitive' } },
        { latinName: { startsWith: prefix, mode: 'insensitive' } },
        { commonNames: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      latinName: true,
    },
    take: 100,
  });

  const hasil: SearchResult[] = [];
  const sudahAda = new Set<string>();

  for (const herbal of herbalList) {
    if (sudahAda.has(herbal.id)) continue;
    sudahAda.add(herbal.id);

    const { skor, tipe } = hitungRelevansi(herbal.name, herbal.latinName || '', query);

    if (skor >= minScore) {
      hasil.push({
        type: 'herbal',
        id: herbal.id,
        name: herbal.name,
        description: herbal.latinName || null,
        relevance: skor,
        matchType: tipe,
        category: 'Herbal',
      });
    }
  }

  hasil.sort((a, b) => b.relevance - a.relevance);
  return hasil.slice(0, limit);
}

// Cari gejala
async function cariGejala(
  query: string,
  limit: number,
  includeFuzzy: boolean,
  minScore: number
): Promise<SearchResult[]> {
  const prefixLength = Math.min(3, query.length);
  const prefix = query.slice(0, prefixLength);

  const gejalaList = await db.symptom.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { name: { startsWith: prefix, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      category: true,
      description: true,
    },
    take: 100,
  });

  const hasil: SearchResult[] = [];
  const sudahAda = new Set<string>();

  for (const gejala of gejalaList) {
    if (sudahAda.has(gejala.id)) continue;
    sudahAda.add(gejala.id);

    const { skor, tipe } = hitungRelevansi(gejala.name, gejala.description || '', query);

    if (skor >= minScore) {
      hasil.push({
        type: 'symptom',
        id: gejala.id,
        name: gejala.name,
        description: gejala.description || gejala.category || null,
        relevance: skor,
        matchType: tipe,
        category: gejala.category,
      });
    }
  }

  hasil.sort((a, b) => b.relevance - a.relevance);
  return hasil.slice(0, limit);
}

// Cari catatan klinis
async function cariCatatan(
  query: string,
  limit: number,
  includeFuzzy: boolean,
  minScore: number
): Promise<SearchResult[]> {
  const prefixLength = Math.min(3, query.length);
  const prefix = query.slice(0, prefixLength);

  const catatanList = await db.clinicalNote.findMany({
    where: {
      isPublished: true,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { title: { startsWith: prefix, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { tags: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      title: true,
      category: true,
      specialty: true,
    },
    take: 100,
  });

  const hasil: SearchResult[] = [];
  const sudahAda = new Set<string>();

  for (const catatan of catatanList) {
    if (sudahAda.has(catatan.id)) continue;
    sudahAda.add(catatan.id);

    const { skor, tipe } = hitungRelevansi(catatan.title, catatan.category || '', query);

    if (skor >= minScore) {
      hasil.push({
        type: 'note',
        id: catatan.id,
        name: catatan.title,
        description: catatan.category || catatan.specialty || null,
        relevance: skor,
        matchType: tipe,
        category: catatan.category,
      });
    }
  }

  hasil.sort((a, b) => b.relevance - a.relevance);
  return hasil.slice(0, limit);
}

// Pencarian gejala saja
export async function cariGejalaSaja(query: string, limit = 10) {
  if (!query.trim()) return [];

  return db.symptom.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    },
    include: {
      drugMappings: {
        include: {
          drug: {
            select: { id: true, name: true, genericName: true },
          },
        },
        orderBy: { priority: 'desc' },
        take: 3,
      },
    },
    take: limit,
    orderBy: { name: 'asc' },
  });
}

// Ambil pencarian terakhir dari localStorage
export function ambilPencarianTerakhir(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('medref_pencarian_terakhir');
  return stored ? JSON.parse(stored) : [];
}

// Simpan pencarian terakhir
export function simpanPencarianTerakhir(query: string): void {
  if (typeof window === 'undefined') return;

  const pencarian = ambilPencarianTerakhir();
  const filtered = pencarian.filter((p) => p !== query);
  const updated = [query, ...filtered].slice(0, 10);

  localStorage.setItem('medref_pencarian_terakhir', JSON.stringify(updated));
}

// Hapus pencarian terakhir
export function hapusPencarianTerakhir(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('medref_pencarian_terakhir');
}