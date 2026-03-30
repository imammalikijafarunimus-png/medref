import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  ambilDaftarGejala,
  ambilDetailGejala,
  ambilKategoriGejala,
  buatGejala,
  updateGejala,
  hapusGejala,
  tambahMappingGejalaObat,
  hitungTotalGejala,
} from './symptom-service'
import { db } from '@/lib/db'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    symptom: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    symptomDrugMapping: {
      create: vi.fn(),
    },
  },
}))

describe('Symptom Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockSymptom = {
    id: 'symptom-1',
    name: 'Demam',
    category: 'Umum',
    description: 'Peningkatan suhu tubuh',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('ambilDaftarGejala', () => {
    it('should return paginated symptoms', async () => {
      vi.mocked(db.symptom.findMany).mockResolvedValue([mockSymptom])
      vi.mocked(db.symptom.count).mockResolvedValue(1)

      const result = await ambilDaftarGejala({ halaman: 1, batas: 20 })

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should filter by category', async () => {
      vi.mocked(db.symptom.findMany).mockResolvedValue([mockSymptom])
      vi.mocked(db.symptom.count).mockResolvedValue(1)

      await ambilDaftarGejala({ kategori: 'Umum' })

      expect(db.symptom.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { category: 'Umum' },
        })
      )
    })

    it('should search by query', async () => {
      vi.mocked(db.symptom.findMany).mockResolvedValue([mockSymptom])
      vi.mocked(db.symptom.count).mockResolvedValue(1)

      await ambilDaftarGejala({ cari: 'demam' })

      expect(db.symptom.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'demam', mode: 'insensitive' } },
              { description: { contains: 'demam', mode: 'insensitive' } },
            ],
          },
        })
      )
    })

    it('should return empty array when no symptoms', async () => {
      vi.mocked(db.symptom.findMany).mockResolvedValue([])
      vi.mocked(db.symptom.count).mockResolvedValue(0)

      const result = await ambilDaftarGejala()

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('ambilDetailGejala', () => {
    it('should return symptom detail with drug mappings', async () => {
      const mockDetail = {
        ...mockSymptom,
        drugMappings: [],
      }
      vi.mocked(db.symptom.findUnique).mockResolvedValue(mockDetail as any)

      const result = await ambilDetailGejala('symptom-1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('symptom-1')
    })

    it('should return null when not found', async () => {
      vi.mocked(db.symptom.findUnique).mockResolvedValue(null)

      const result = await ambilDetailGejala('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('ambilKategoriGejala', () => {
    it('should return unique categories', async () => {
      vi.mocked(db.symptom.findMany).mockResolvedValue([
        { category: 'Umum' },
        { category: 'Respirasi' },
        { category: 'Umum' },
      ] as any)

      const result = await ambilKategoriGejala()

      expect(result).toContain('Umum')
      expect(result).toContain('Respirasi')
    })

    it('should return empty array when no categories', async () => {
      vi.mocked(db.symptom.findMany).mockResolvedValue([])

      const result = await ambilKategoriGejala()

      expect(result).toEqual([])
    })
  })

  describe('buatGejala', () => {
    it('should create a new symptom', async () => {
      vi.mocked(db.symptom.create).mockResolvedValue(mockSymptom)

      const result = await buatGejala({
        name: 'Demam',
        category: 'Umum',
        description: 'Test',
      })

      expect(result).toEqual(mockSymptom)
    })
  })

  describe('updateGejala', () => {
    it('should update symptom', async () => {
      vi.mocked(db.symptom.update).mockResolvedValue({
        ...mockSymptom,
        description: 'Updated',
      })

      const result = await updateGejala('symptom-1', { description: 'Updated' })

      expect(result.description).toBe('Updated')
    })
  })

  describe('hapusGejala', () => {
    it('should delete symptom', async () => {
      vi.mocked(db.symptom.delete).mockResolvedValue(mockSymptom)

      await hapusGejala('symptom-1')

      expect(db.symptom.delete).toHaveBeenCalledWith({
        where: { id: 'symptom-1' },
      })
    })
  })

  describe('tambahMappingGejalaObat', () => {
    it('should create drug-symptom mapping', async () => {
      const mockMapping = {
        id: 'mapping-1',
        symptomId: 'symptom-1',
        drugId: 'drug-1',
        priority: 1,
        isFirstLine: true,
        notes: null,
      }
      vi.mocked(db.symptomDrugMapping.create).mockResolvedValue(mockMapping as any)

      const result = await tambahMappingGejalaObat('symptom-1', {
        drugId: 'drug-1',
        priority: 1,
        isFirstLine: true,
      })

      expect(result).toEqual(mockMapping)
    })
  })

  describe('hitungTotalGejala', () => {
    it('should return total count', async () => {
      vi.mocked(db.symptom.count).mockResolvedValue(10)

      const result = await hitungTotalGejala()

      expect(result).toBe(10)
    })
  })
})