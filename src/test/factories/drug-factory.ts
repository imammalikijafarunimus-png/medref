import { DrugWithRelations } from "@/services/drug-service";

export const createMockDrug = (overrides: Partial<DrugWithRelations> = {}): DrugWithRelations => {
  return {
    id: "mock-id-" + Math.random().toString(36).substr(2, 9),
    name: "Paracetamol",
    genericName: "Paracetamol",
    brandNames: "Sanmol, Panadol",
    drugClass: "Analgesic",
    category: "B", // Kategori Kehamilan
    description: "Obat penurun demam dan pereda nyeri.",
    indication: "Demam, sakit kepala, nyeri gigi.",
    dosage: "Dewasa: 500mg - 1g setiap 4-6 jam.",
    sideEffects: "Mual, ruam kulit, gangguan hati pada dosis besar.",
    contraindication: "Hipersensitivitas, gangguan fungsi hati berat.",
    mechanism: "Menghambat sintesis prostaglandin di SSP.",
    interactions: "Meningkatkan risiko kerusakan hati jika diminum dengan alkohol.",
    storage: "Simpan pada suhu di bawah 30°C.",
    notes: "Hati-hati pada pasien gangguan ginjal.",
    isHerbal: false,
    isFavorite: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    doses: [],
    indications: [],
    _count: { interactions: 0, contraindications: 0 },
    // Masukkan properti lain sesuai skema Prisma/Type Anda
    ...overrides, // Data yang Anda masukkan di test akan menimpa data default ini
  } as DrugWithRelations;
};

// Helper untuk membuat banyak data sekaligus
export const createMockDrugs = (count: number): DrugWithRelations[] => {
  return Array.from({ length: count }, (_, i) => 
    createMockDrug({ id: `id-${i}`, name: `Drug ${i}` })
  );
};