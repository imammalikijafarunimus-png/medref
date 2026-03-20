// =============================================
// Unit Tests for Drug Service
// =============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the modules BEFORE any imports
vi.mock('@/lib/db', () => ({
  db: {
    drug: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    drugInteraction: {
      findFirst: vi.fn(),
    },
  },
}))

vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    deletePattern: vi.fn(),
    clear: vi.fn(),
  },
  CacheKeys: {
    drugs: {
      list: (page: number, limit: number, drugClass?: string) => `drugs:list:${page}:${limit}:${drugClass || 'all'}`,
      detail: (id: string) => `drugs:detail:${id}`,
      search: (query: string) => `drugs:search:${query}`,
      classes: () => 'drugs:classes',
    },
  },
  CacheTTL: {
    search: 30000,
    list: 120000,
    detail: 300000,
    static: 900000,
  },
}))

// Import AFTER mocking
import { db } from '@/lib/db'
import { cache } from '@/lib/cache'
import {
  ambilDaftarObat,
  ambilDetailObat,
  ambilKelasObat,
  buatObat,
  updateObat,
  hapusObat,
  hitungTotalObat,
  cekInteraksiObat,
} from './drug-service'

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

describe('ambilDaftarObat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cache.get).mockReturnValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should return list of drugs with default pagination', async () => {
    const mockDrugs = [
      { id: '1', name: 'Paracetamol', doses: [], indications: [], _count: { interactions: 0, contraindications: 0 } },
      { id: '2', name: 'Amoxicillin', doses: [], indications: [], _count: { interactions: 0, contraindications: 0 } },
    ]

    vi.mocked(db.drug.findMany).mockResolvedValue(mockDrugs as any)
    vi.mocked(db.drug.count).mockResolvedValue(2)

    const result = await ambilDaftarObat()

    expect(result.data).toHaveLength(2)
    expect(result.total).toBe(2)
  })

  it('should handle custom pagination', async () => {
    vi.mocked(db.drug.findMany).mockResolvedValue([])
    vi.mocked(db.drug.count).mockResolvedValue(0)

    await ambilDaftarObat({ halaman: 3, batas: 50 })

    expect(db.drug.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 100,
        take: 50,
      })
    )
  })

  it('should filter by drug class', async () => {
    vi.mocked(db.drug.findMany).mockResolvedValue([])
    vi.mocked(db.drug.count).mockResolvedValue(0)

    await ambilDaftarObat({ kelas: 'antibiotik' })

    expect(db.drug.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { drugClass: 'antibiotik' },
      })
    )
  })

  it('should search by name', async () => {
    vi.mocked(db.drug.findMany).mockResolvedValue([])
    vi.mocked(db.drug.count).mockResolvedValue(0)

    await ambilDaftarObat({ cari: 'paracetamol' })

    expect(db.drug.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: 'paracetamol', mode: 'insensitive' } },
            { genericName: { contains: 'paracetamol', mode: 'insensitive' } },
          ],
        },
      })
    )
  })

  it('should return cached data when available', async () => {
    const cachedData = {
      data: [{ id: '1', name: 'Cached Drug' }],
      total: 1,
    }

    vi.mocked(cache.get).mockReturnValue(cachedData)

    const result = await ambilDaftarObat()

    expect(result).toEqual(cachedData)
    expect(db.drug.findMany).not.toHaveBeenCalled()
  })

  it('should cache results for non-search queries', async () => {
    const mockDrugs = [{ id: '1', name: 'Drug' }]
    vi.mocked(db.drug.findMany).mockResolvedValue(mockDrugs as any)
    vi.mocked(db.drug.count).mockResolvedValue(1)

    await ambilDaftarObat({ halaman: 1, batas: 20 })

    expect(cache.set).toHaveBeenCalled()
  })

  it('should not cache search results', async () => {
    vi.mocked(db.drug.findMany).mockResolvedValue([])
    vi.mocked(db.drug.count).mockResolvedValue(0)

    await ambilDaftarObat({ cari: 'test' })

    expect(cache.set).not.toHaveBeenCalled()
  })
})

describe('ambilDetailObat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cache.get).mockReturnValue(null)
  })

  it('should return drug detail by ID', async () => {
    const mockDrug = {
      id: 'drug-123',
      name: 'Paracetamol',
      doses: [],
      indications: [],
      contraindications: [],
      interactions: [],
    }

    vi.mocked(db.drug.findUnique).mockResolvedValue(mockDrug as any)

    const result = await ambilDetailObat('drug-123')

    expect(result).not.toBeNull()
    expect(result?.name).toBe('Paracetamol')
  })

  it('should return null for non-existent drug', async () => {
    vi.mocked(db.drug.findUnique).mockResolvedValue(null)

    const result = await ambilDetailObat('non-existent')

    expect(result).toBeNull()
  })

  it('should return cached drug detail', async () => {
    const cachedDrug = { id: 'drug-123', name: 'Cached Drug' }
    vi.mocked(cache.get).mockReturnValue(cachedDrug)

    const result = await ambilDetailObat('drug-123')

    expect(result).toEqual(cachedDrug)
    expect(db.drug.findUnique).not.toHaveBeenCalled()
  })

  it('should cache drug detail after fetching', async () => {
    const mockDrug = { id: 'drug-123', name: 'Drug' }
    vi.mocked(db.drug.findUnique).mockResolvedValue(mockDrug as any)

    await ambilDetailObat('drug-123')

    expect(cache.set).toHaveBeenCalled()
  })
})

describe('ambilKelasObat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cache.get).mockReturnValue(null)
  })

  it('should return list of drug classes', async () => {
    vi.mocked(db.drug.findMany).mockResolvedValue([
      { drugClass: 'analgesik' },
      { drugClass: 'antibiotik' },
      { drugClass: 'antiviral' },
    ] as any)

    const result = await ambilKelasObat()

    expect(result).toContain('analgesik')
    expect(result).toContain('antibiotik')
    expect(result).toContain('antiviral')
  })

  it('should filter out null drug classes', async () => {
    vi.mocked(db.drug.findMany).mockResolvedValue([
      { drugClass: 'analgesik' },
      { drugClass: null },
      { drugClass: 'antibiotik' },
    ] as any)

    const result = await ambilKelasObat()

    expect(result).toHaveLength(2)
    expect(result).not.toContain(null)
  })

  it('should return cached classes', async () => {
    vi.mocked(cache.get).mockReturnValue(['cached', 'classes'])

    const result = await ambilKelasObat()

    expect(result).toEqual(['cached', 'classes'])
    expect(db.drug.findMany).not.toHaveBeenCalled()
  })
})

describe('buatObat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new drug', async () => {
    const newDrug = {
      name: 'New Drug',
      genericName: 'New Generic',
      drugClass: 'analgesik',
    }

    vi.mocked(db.drug.create).mockResolvedValue({
      id: 'new-id',
      ...newDrug,
      brandNames: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const result = await buatObat(newDrug)

    expect(result.name).toBe('New Drug')
    expect(cache.deletePattern).toHaveBeenCalled()
  })

  it('should stringify brand names array', async () => {
    vi.mocked(db.drug.create).mockResolvedValue({
      id: 'new-id',
      name: 'Test',
      brandNames: '["Brand1","Brand2"]',
    } as any)

    await buatObat({
      name: 'Test',
      brandNames: ['Brand1', 'Brand2'],
    })

    expect(db.drug.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          brandNames: '["Brand1","Brand2"]',
        }),
      })
    )
  })

  it('should handle null brand names', async () => {
    vi.mocked(db.drug.create).mockResolvedValue({
      id: 'new-id',
      name: 'Test',
      brandNames: null,
    } as any)

    await buatObat({
      name: 'Test',
    })

    expect(db.drug.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          brandNames: null,
        }),
      })
    )
  })
})

describe('updateObat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update an existing drug', async () => {
    vi.mocked(db.drug.update).mockResolvedValue({
      id: 'drug-123',
      name: 'Updated Name',
    } as any)

    await updateObat('drug-123', { name: 'Updated Name' })

    expect(db.drug.update).toHaveBeenCalledWith({
      where: { id: 'drug-123' },
      data: expect.objectContaining({
        name: 'Updated Name',
      }),
    })
    expect(cache.delete).toHaveBeenCalled()
    expect(cache.deletePattern).toHaveBeenCalled()
  })

  it('should stringify brand names on update', async () => {
    vi.mocked(db.drug.update).mockResolvedValue({ id: 'test' } as any)

    await updateObat('drug-123', { brandNames: ['Brand1'] })

    expect(db.drug.update).toHaveBeenCalledWith({
      where: { id: 'drug-123' },
      data: expect.objectContaining({
        brandNames: '["Brand1"]',
      }),
    })
  })
})

describe('hapusObat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete a drug', async () => {
    vi.mocked(db.drug.delete).mockResolvedValue({ id: 'drug-123' } as any)

    await hapusObat('drug-123')

    expect(db.drug.delete).toHaveBeenCalledWith({
      where: { id: 'drug-123' },
    })
    expect(cache.delete).toHaveBeenCalled()
    expect(cache.deletePattern).toHaveBeenCalled()
  })
})

describe('hitungTotalObat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return total count of drugs', async () => {
    vi.mocked(db.drug.count).mockResolvedValue(150)

    const result = await hitungTotalObat()

    expect(result).toBe(150)
  })

  it('should return 0 for empty database', async () => {
    vi.mocked(db.drug.count).mockResolvedValue(0)

    const result = await hitungTotalObat()

    expect(result).toBe(0)
  })
})

describe('cekInteraksiObat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should find interaction between two drugs', async () => {
    const mockInteraction = {
      id: 'interaction-1',
      drugId: 'drug-1',
      interactingDrugId: 'drug-2',
      interactionType: 'mayor',
      drug: { id: 'drug-1', name: 'Drug 1' },
      interactingDrug: { id: 'drug-2', name: 'Drug 2' },
    }

    vi.mocked(db.drugInteraction.findFirst).mockResolvedValue(mockInteraction as any)

    const result = await cekInteraksiObat('drug-1', 'drug-2')

    expect(result).not.toBeNull()
    expect(result?.interactionType).toBe('mayor')
  })

  it('should check both directions of interaction', async () => {
    vi.mocked(db.drugInteraction.findFirst).mockResolvedValue(null)

    await cekInteraksiObat('drug-1', 'drug-2')

    expect(db.drugInteraction.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          { drugId: 'drug-1', interactingDrugId: 'drug-2' },
          { drugId: 'drug-2', interactingDrugId: 'drug-1' },
        ],
      },
      include: expect.any(Object),
    })
  })

  it('should return null when no interaction exists', async () => {
    vi.mocked(db.drugInteraction.findFirst).mockResolvedValue(null)

    const result = await cekInteraksiObat('drug-1', 'drug-2')

    expect(result).toBeNull()
  })
})