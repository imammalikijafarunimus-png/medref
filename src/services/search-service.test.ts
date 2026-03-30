import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  pencarianGlobal,
  cariGejalaSaja,
  ambilPencarianTerakhir,
  simpanPencarianTerakhir,
  hapusPencarianTerakhir,
} from './search-service'
import { db } from '@/lib/db'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    drug: {
      findMany: vi.fn(),
    },
    herbal: {
      findMany: vi.fn(),
    },
    clinicalNote: {
      findMany: vi.fn(),
    },
    symptom: {
      findMany: vi.fn(),
    },
  },
}))

// Mock cache
vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
  },
  CacheKeys: {
    search: {
      global: vi.fn(() => 'cache-key'),
    },
  },
  CacheTTL: {
    search: 60000,
  },
}))

// Mock fuzzy-search
vi.mock('@/lib/fuzzy-search', () => ({
  fuzzyMatch: vi.fn((str: string, query: string) => {
    if (str.toLowerCase().includes(query.toLowerCase())) return 50
    return 0
  }),
}))

// Helper untuk membuat mock object dengan semua required fields
function createMockDrug(overrides: Partial<any> = {}) {
  return {
    id: 'drug-1',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    brandNames: null,
    drugClass: 'Analgesic',
    category: null,
    description: null,
    mechanism: null,
    route: null,
    halfLife: null,
    bioavailability: null,
    proteinBinding: null,
    metabolism: null,
    excretion: null,
    pregnancyCat: null,
    lactation: null,
    blackBoxWarning: null,
    regulatoryStatus: null,
    monitoringParameters: null,
    counselingPoints: null,
    storage: null,
    notes: null,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createMockHerbal(overrides: Partial<any> = {}) {
  return {
    id: 'herbal-1',
    name: 'Jahe',
    latinName: 'Zingiber officinale',
    commonNames: null,
    localNames: null,
    plantFamily: null,
    category: null,
    plantPart: null,
    preparation: null,
    traditionalUse: null,
    description: null,
    safetyRating: null,
    pregnancySafety: null,
    lactationSafety: null,
    pediatricSafety: null,
    contraindications: null,
    sideEffects: null,
    regulatoryStatus: null,
    references: null,
    notes: null,
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createMockSymptom(overrides: Partial<any> = {}) {
  return {
    id: 'symptom-1',
    name: 'Demam',
    category: 'Umum',
    description: 'Peningkatan suhu',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

function createMockNote(overrides: Partial<any> = {}) {
  return {
    id: 'note-1',
    title: 'Panduan Klinis',
    category: 'Guideline',
    content: 'Konten',
    specialty: 'General',
    tags: null,
    source: null,
    author: null,
    version: 1,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('Search Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('pencarianGlobal', () => {
    it('should return empty results for empty query', async () => {
      const result = await pencarianGlobal('')

      expect(result.totalResults).toBe(0)
      expect(result.query).toBe('')
    })

    it('should search across all entity types', async () => {
      vi.mocked(db.drug.findMany).mockResolvedValue([createMockDrug()])
      vi.mocked(db.herbal.findMany).mockResolvedValue([createMockHerbal()])
      vi.mocked(db.symptom.findMany).mockResolvedValue([createMockSymptom()])
      vi.mocked(db.clinicalNote.findMany).mockResolvedValue([createMockNote()])

      const result = await pencarianGlobal('test')

      expect(result.drugs).toBeDefined()
      expect(result.herbals).toBeDefined()
      expect(result.symptoms).toBeDefined()
      expect(result.notes).toBeDefined()
      expect(result.query).toBe('test')
    })

    it('should respect limit per category', async () => {
      vi.mocked(db.drug.findMany).mockResolvedValue([
        createMockDrug({ id: 'drug-1' }),
        createMockDrug({ id: 'drug-2' }),
        createMockDrug({ id: 'drug-3' }),
      ])
      vi.mocked(db.herbal.findMany).mockResolvedValue([])
      vi.mocked(db.symptom.findMany).mockResolvedValue([])
      vi.mocked(db.clinicalNote.findMany).mockResolvedValue([])

      const result = await pencarianGlobal('test', { batasPerKategori: 2 })

      expect(result.drugs.length).toBeLessThanOrEqual(2)
    })

    it('should return empty arrays when no results', async () => {
      vi.mocked(db.drug.findMany).mockResolvedValue([])
      vi.mocked(db.herbal.findMany).mockResolvedValue([])
      vi.mocked(db.symptom.findMany).mockResolvedValue([])
      vi.mocked(db.clinicalNote.findMany).mockResolvedValue([])

      const result = await pencarianGlobal('nonexistent')

      expect(result.drugs).toEqual([])
      expect(result.herbals).toEqual([])
      expect(result.symptoms).toEqual([])
      expect(result.notes).toEqual([])
    })
  })

    describe('cariGejalaSaja', () => {
    it('should return empty array for empty query', async () => {
      const result = await cariGejalaSaja('')

      expect(result).toEqual([])
    })

    it('should search symptoms with drug mappings', async () => {
      vi.mocked(db.symptom.findMany).mockResolvedValue([
        {
          ...createMockSymptom(),
          drugMappings: [],
        },
      ] as any)  // <-- tambahkan 'as any'

      const result = await cariGejalaSaja('demam', 10)

      expect(result).toBeDefined()
      expect(db.symptom.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            drugMappings: expect.any(Object),
          }),
        })
      )
    })
  })

  describe('localStorage functions', () => {
    const mockLocalStorage = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          store[key] = value
        }),
        removeItem: vi.fn((key: string) => {
          delete store[key]
        }),
        clear: vi.fn(() => {
          store = {}
        }),
      }
    })()

    beforeEach(() => {
      Object.defineProperty(global, 'localStorage', {
        value: mockLocalStorage,
        configurable: true,
      })
      mockLocalStorage.clear()
    })

    describe('ambilPencarianTerakhir', () => {
      it('should return empty array on server side', () => {
        const originalWindow = global.window
        // @ts-ignore
        delete global.window

        const result = ambilPencarianTerakhir()

        expect(result).toEqual([])

        global.window = originalWindow
      })

      it('should return stored searches', () => {
        mockLocalStorage.getItem.mockReturnValue('["paracetamol", "demam"]')

        const result = ambilPencarianTerakhir()

        expect(result).toEqual(['paracetamol', 'demam'])
      })
    })

    describe('simpanPencarianTerakhir', () => {
      it('should save new query at the beginning', () => {
        mockLocalStorage.getItem.mockReturnValue('["demam"]')

        simpanPencarianTerakhir('paracetamol')

        expect(mockLocalStorage.setItem).toHaveBeenCalled()
      })

      it('should remove duplicate and limit to 10', () => {
        mockLocalStorage.getItem.mockReturnValue('["demam", "batuk"]')

        simpanPencarianTerakhir('demam')

        expect(mockLocalStorage.setItem).toHaveBeenCalled()
      })
    })

    describe('hapusPencarianTerakhir', () => {
      it('should clear search history', () => {
        hapusPencarianTerakhir()

        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('medref_pencarian_terakhir')
      })
    })
  })
})