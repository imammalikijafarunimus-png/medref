import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  ambilDaftarCatatan,
  ambilDetailCatatan,
  ambilKategoriCatatan,
  buatCatatan,
  updateCatatan,
  hapusCatatan,
  hitungTotalCatatan,
} from './note-service'
import { db } from '@/lib/db'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    clinicalNote: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Mock cache
vi.mock('@/lib/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    deletePattern: vi.fn(),
  },
  CacheKeys: {
    notes: {
      detail: vi.fn((id) => `notes:detail:${id}`),
      categories: vi.fn(() => 'notes:categories'),
    },
  },
  CacheTTL: {
    detail: 300000,
    static: 3600000,
  },
}))

// Helper untuk mock note dengan semua required fields
function createMockNote(overrides: Record<string, any> = {}) {
  return {
    id: 'note-1',
    title: 'Panduan Klinis Demam',
    category: 'Guideline',
    content: 'Konten panduan klinis untuk penanganan demam',
    specialty: 'General',
    tags: '["demam", "pedoman"]',
    source: 'WHO Guidelines',
    author: 'Dr. Smith',
    version: 1,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('Note Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ambilDaftarCatatan', () => {
    it('should return paginated notes', async () => {
      vi.mocked(db.clinicalNote.findMany).mockResolvedValue([createMockNote()])
      vi.mocked(db.clinicalNote.count).mockResolvedValue(1)

      const result = await ambilDaftarCatatan({ halaman: 1, batas: 20 })

      expect(result.data).toHaveLength(1)
      expect(result.total).toBe(1)
    })

    it('should filter by category', async () => {
      vi.mocked(db.clinicalNote.findMany).mockResolvedValue([createMockNote()])
      vi.mocked(db.clinicalNote.count).mockResolvedValue(1)

      await ambilDaftarCatatan({ kategori: 'Guideline' })

      expect(db.clinicalNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'Guideline',
          }),
        })
      )
    })

    it('should search by query', async () => {
      vi.mocked(db.clinicalNote.findMany).mockResolvedValue([createMockNote()])
      vi.mocked(db.clinicalNote.count).mockResolvedValue(1)

      await ambilDaftarCatatan({ cari: 'demam' })

      expect(db.clinicalNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'demam', mode: 'insensitive' } },
              { content: { contains: 'demam', mode: 'insensitive' } },
              { tags: { contains: 'demam', mode: 'insensitive' } },
            ],
          }),
        })
      )
    })

    it('should return empty array when no notes', async () => {
      vi.mocked(db.clinicalNote.findMany).mockResolvedValue([])
      vi.mocked(db.clinicalNote.count).mockResolvedValue(0)

      const result = await ambilDaftarCatatan()

      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })
  })

  describe('ambilDetailCatatan', () => {
    it('should return note detail', async () => {
      vi.mocked(db.clinicalNote.findUnique).mockResolvedValue(createMockNote())

      const result = await ambilDetailCatatan('note-1')

      expect(result).toBeDefined()
      expect(result?.id).toBe('note-1')
    })

    it('should return null when not found', async () => {
      vi.mocked(db.clinicalNote.findUnique).mockResolvedValue(null)

      const result = await ambilDetailCatatan('non-existent')

      expect(result).toBeNull()
    })
  })

  describe('ambilKategoriCatatan', () => {
    it('should return unique categories', async () => {
      vi.mocked(db.clinicalNote.findMany).mockResolvedValue([
        { category: 'Guideline' },
        { category: 'Procedure' },
      ] as any)

      const result = await ambilKategoriCatatan()

      expect(result).toContain('Guideline')
      expect(result).toContain('Procedure')
    })

    it('should return empty array when no categories', async () => {
      vi.mocked(db.clinicalNote.findMany).mockResolvedValue([])

      const result = await ambilKategoriCatatan()

      expect(result).toEqual([])
    })
  })

  describe('buatCatatan', () => {
    it('should create a new note', async () => {
      vi.mocked(db.clinicalNote.create).mockResolvedValue(createMockNote())

      const result = await buatCatatan({
        title: 'New Note',
        content: 'Content',
        category: 'General',
        tags: ['test'],
      })

      expect(result).toBeDefined()
    })
  })

  describe('updateCatatan', () => {
    it('should update note and increment version', async () => {
      vi.mocked(db.clinicalNote.update).mockResolvedValue(
        createMockNote({
          content: 'Updated content',
          version: 2,
        })
      )

      const result = await updateCatatan('note-1', { content: 'Updated content' })

      expect(result.content).toBe('Updated content')
      expect(result.version).toBe(2)
    })
  })

  describe('hapusCatatan', () => {
    it('should delete note', async () => {
      vi.mocked(db.clinicalNote.delete).mockResolvedValue(createMockNote())

      await hapusCatatan('note-1')

      expect(db.clinicalNote.delete).toHaveBeenCalledWith({
        where: { id: 'note-1' },
      })
    })
  })

  describe('hitungTotalCatatan', () => {
    it('should return total count of published notes', async () => {
      vi.mocked(db.clinicalNote.count).mockResolvedValue(5)

      const result = await hitungTotalCatatan()

      expect(result).toBe(5)
      expect(db.clinicalNote.count).toHaveBeenCalledWith({
        where: { isPublished: true },
      })
    })
  })
})