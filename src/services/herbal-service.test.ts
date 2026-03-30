// =============================================
// Unit Tests for Herbal Service
// =============================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock modules BEFORE imports
vi.mock('@/lib/db', () => ({
  db: {
    herbal: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    herbalCompound: {
      create: vi.fn(),
    },
    herbalIndication: {
      create: vi.fn(),
    },
    herbalInteraction: {
      findMany: vi.fn(),
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
    herbals: {
      list: (params: { halaman?: number; batas?: number; cari?: string; keamanan?: string }) =>
        `herbals:list:${params.halaman || 1}:${params.batas || 20}:${params.cari || ''}:${params.keamanan || ''}`,
      detail: (id: string) => `herbals:detail:${id}`,
      search: (query: string) => `herbals:search:${query}`,
    },
  },
  CacheTTL: {
    search: 30000,
    list: 120000,
    detail: 300000,
    static: 900000,
  },
}))

vi.mock('@/lib/mappers/herbal.mapper', () => ({
  mapToHerbalListDTO: vi.fn((herbal) => ({
    id: herbal.id,
    name: herbal.name,
    latinName: herbal.latinName,
    safetyRating: herbal.safetyRating,
  })),
  mapToHerbalDetailDTO: vi.fn((herbal) => ({
    id: herbal.id,
    name: herbal.name,
    latinName: herbal.latinName,
    safetyRating: herbal.safetyRating,
    compounds: herbal.compounds || [],
    indications: herbal.indications || [],
    interactions: herbal.interactions || [],
  })),
}))

// Import AFTER mocking
import { db } from '@/lib/db'
import { cache } from '@/lib/cache'
import {
  ambilDaftarHerbal,
  ambilDetailHerbal,
  buatHerbal,
  updateHerbal,
  hapusHerbal,
  hitungTotalHerbal,
  tambahSenyawaHerbal,
  tambahIndikasiHerbal,
} from './herbal-service'

// ─────────────────────────────────────────
// Tests
// ─────────────────────────────────────────

describe('ambilDaftarHerbal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cache.get).mockReturnValue(null)
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should return list of herbals with default pagination', async () => {
    const mockHerbals = [
      { id: '1', name: 'Jahe', latinName: 'Zingiber officinale', safetyRating: 'aman', indications: [], _count: { interactions: 0 } },
      { id: '2', name: 'Kunyit', latinName: 'Curcuma longa', safetyRating: 'aman', indications: [], _count: { interactions: 0 } },
    ]

    vi.mocked(db.herbal.findMany).mockResolvedValue(mockHerbals as any)
    vi.mocked(db.herbal.count).mockResolvedValue(2)

    const result = await ambilDaftarHerbal()

    expect(result.data).toHaveLength(2)
    expect(result.total).toBe(2)
    expect(result.halaman).toBe(1)
    expect(result.batas).toBe(20)
  })

  it('should handle custom pagination', async () => {
    vi.mocked(db.herbal.findMany).mockResolvedValue([])
    vi.mocked(db.herbal.count).mockResolvedValue(0)

    await ambilDaftarHerbal({ halaman: 2, batas: 30 })

    expect(db.herbal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 30,
        take: 30,
      })
    )
  })

  it('should filter by safety rating', async () => {
    vi.mocked(db.herbal.findMany).mockResolvedValue([])
    vi.mocked(db.herbal.count).mockResolvedValue(0)

    await ambilDaftarHerbal({ keamanan: 'aman' })

    expect(db.herbal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          safetyRating: 'aman',
        }),
      })
    )
  })

  it('should search by name', async () => {
    vi.mocked(db.herbal.findMany).mockResolvedValue([])
    vi.mocked(db.herbal.count).mockResolvedValue(0)

    await ambilDaftarHerbal({ cari: 'jahe' })

    expect(db.herbal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { name: { contains: 'jahe', mode: 'insensitive' } },
            { latinName: { contains: 'jahe', mode: 'insensitive' } },
            { commonNames: { contains: 'jahe', mode: 'insensitive' } },
          ],
        },
      })
    )
  })

  it('should return cached data when available', async () => {
    const cachedData = {
      data: [{ id: '1', name: 'Cached Herbal' }],
      total: 1,
      halaman: 1,
      batas: 20,
    }

    vi.mocked(cache.get).mockReturnValue(cachedData)

    const result = await ambilDaftarHerbal()

    expect(result).toEqual(cachedData)
    expect(db.herbal.findMany).not.toHaveBeenCalled()
  })

  it('should cache results for non-search queries', async () => {
    vi.mocked(db.herbal.findMany).mockResolvedValue([] as any)
    vi.mocked(db.herbal.count).mockResolvedValue(0)

    await ambilDaftarHerbal({ halaman: 1, batas: 20 })

    expect(cache.set).toHaveBeenCalled()
  })
})

describe('ambilDetailHerbal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(cache.get).mockReturnValue(null)
  })

  it('should return herbal detail by ID', async () => {
    const mockHerbal = {
      id: 'herbal-123',
      name: 'Jahe',
      latinName: 'Zingiber officinale',
      safetyRating: 'aman',
      compounds: [],
      indications: [],
      interactions: [],
    }

    vi.mocked(db.herbal.findUnique).mockResolvedValue(mockHerbal as any)

    const result = await ambilDetailHerbal('herbal-123')

    expect(result).not.toBeNull()
    expect(result?.name).toBe('Jahe')
  })

  it('should return null for non-existent herbal', async () => {
    vi.mocked(db.herbal.findUnique).mockResolvedValue(null)

    const result = await ambilDetailHerbal('non-existent')

    expect(result).toBeNull()
  })

  it('should return cached herbal detail', async () => {
    const cachedHerbal = { id: 'herbal-123', name: 'Cached Herbal' }
    vi.mocked(cache.get).mockReturnValue(cachedHerbal)

    const result = await ambilDetailHerbal('herbal-123')

    expect(result).toEqual(cachedHerbal)
    expect(db.herbal.findUnique).not.toHaveBeenCalled()
  })

  it('should cache herbal detail after fetching', async () => {
    const mockHerbal = { id: 'herbal-123', name: 'Jahe', compounds: [], indications: [], interactions: [] }
    vi.mocked(db.herbal.findUnique).mockResolvedValue(mockHerbal as any)

    await ambilDetailHerbal('herbal-123')

    expect(cache.set).toHaveBeenCalled()
  })
})

describe('buatHerbal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a new herbal', async () => {
    const newHerbal = {
      name: 'New Herbal',
      latinName: 'Newus herbalus',
      safetyRating: 'aman',
    }

    vi.mocked(db.herbal.create).mockResolvedValue({
      id: 'new-id',
      ...newHerbal,
      commonNames: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)

    const result = await buatHerbal(newHerbal)

    expect(result.name).toBe('New Herbal')
    expect(cache.deletePattern).toHaveBeenCalledWith('^herbals:list:')
  })

  it('should stringify commonNames array', async () => {
    vi.mocked(db.herbal.create).mockResolvedValue({
      id: 'new-id',
      name: 'Test',
      commonNames: '["Name1","Name2"]',
    } as any)

    await buatHerbal({
      name: 'Test',
      commonNames: ['Name1', 'Name2'],
    })

    expect(db.herbal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          commonNames: '["Name1","Name2"]',
        }),
      })
    )
  })
})

describe('updateHerbal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should update an existing herbal', async () => {
    vi.mocked(db.herbal.update).mockResolvedValue({
      id: 'herbal-123',
      name: 'Updated Name',
    } as any)

    await updateHerbal('herbal-123', { name: 'Updated Name' })

    expect(db.herbal.update).toHaveBeenCalledWith({
      where: { id: 'herbal-123' },
      data: expect.objectContaining({
        name: 'Updated Name',
      }),
    })
    expect(cache.delete).toHaveBeenCalled()
    expect(cache.deletePattern).toHaveBeenCalledWith('^herbals:list:')
  })
})

describe('hapusHerbal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should delete a herbal', async () => {
    vi.mocked(db.herbal.delete).mockResolvedValue({ id: 'herbal-123' } as any)

    await hapusHerbal('herbal-123')

    expect(db.herbal.delete).toHaveBeenCalledWith({
      where: { id: 'herbal-123' },
    })
    expect(cache.delete).toHaveBeenCalled()
    expect(cache.deletePattern).toHaveBeenCalledWith('^herbals:list:')
  })
})

describe('hitungTotalHerbal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return total count of herbals', async () => {
    vi.mocked(db.herbal.count).mockResolvedValue(75)

    const result = await hitungTotalHerbal()

    expect(result).toBe(75)
  })

  it('should return 0 for empty database', async () => {
    vi.mocked(db.herbal.count).mockResolvedValue(0)

    const result = await hitungTotalHerbal()

    expect(result).toBe(0)
  })
})

describe('tambahSenyawaHerbal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add compound to herbal', async () => {
    vi.mocked(db.herbalCompound.create).mockResolvedValue({
      id: 'compound-1',
      herbalId: 'herbal-123',
      compoundName: 'Gingerol',
    } as any)

    const result = await tambahSenyawaHerbal('herbal-123', {
      compoundName: 'Gingerol',
      concentration: '1%',
    })

    expect(result.compoundName).toBe('Gingerol')
    expect(cache.delete).toHaveBeenCalledWith('herbals:detail:herbal-123')
  })
})

describe('tambahIndikasiHerbal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add indication to herbal', async () => {
    vi.mocked(db.herbalIndication.create).mockResolvedValue({
      id: 'indication-1',
      herbalId: 'herbal-123',
      indication: 'Nausea',
      evidenceLevel: 'A',
    } as any)

    const result = await tambahIndikasiHerbal('herbal-123', {
      indication: 'Nausea',
      evidenceLevel: 'A',
    })

    expect(result.indication).toBe('Nausea')
    expect(cache.delete).toHaveBeenCalledWith('herbals:detail:herbal-123')
  })
})