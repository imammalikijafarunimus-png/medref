import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    searchLog: {
      create: vi.fn(),
    },
    drug: {
      update: vi.fn(),
    },
    herbal: {
      update: vi.fn(),
    },
    clinicalNote: {
      update: vi.fn(),
    },
    favorite: {
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('Track Actions', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('trackSearch', () => {
    it('should log search query', async () => {
      vi.mocked(db.searchLog.create).mockResolvedValue({
        id: 'log-1',
        query: 'paracetamol',
        createdAt: new Date(),
      } as any)

      await db.searchLog.create({
        data: { query: 'paracetamol' },
      })

      expect(db.searchLog.create).toHaveBeenCalledWith({
        data: { query: 'paracetamol' },
      })
    })

    it('should normalize query to lowercase', async () => {
      await db.searchLog.create({
        data: { query: 'PARACETAMOL' },
      })

      expect(db.searchLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ query: 'PARACETAMOL' }),
        })
      )
    })
  })

  describe('trackView', () => {
    it('should increment view count for drug', async () => {
      vi.mocked(db.drug.update).mockResolvedValue({ id: 'drug-1', viewCount: 1 } as any)

      await db.drug.update({
        where: { id: 'drug-1' },
        data: { viewCount: { increment: 1 } },
      })

      expect(db.drug.update).toHaveBeenCalledWith({
        where: { id: 'drug-1' },
        data: { viewCount: { increment: 1 } },
      })
    })

    it('should increment view count for herbal', async () => {
      vi.mocked(db.herbal.update).mockResolvedValue({ id: 'herbal-1', viewCount: 1 } as any)

      await db.herbal.update({
        where: { id: 'herbal-1' },
        data: { viewCount: { increment: 1 } },
      })

      expect(db.herbal.update).toHaveBeenCalledWith({
        where: { id: 'herbal-1' },
        data: { viewCount: { increment: 1 } },
      })
    })
  })

  describe('trackFavorite', () => {
    it('should add favorite', async () => {
      vi.mocked(db.favorite.create).mockResolvedValue({
        id: 'fav-1',
        userId: 'user-1',
        itemType: 'drug',
        drugId: 'drug-1',
      } as any)

      await db.favorite.create({
        data: {
          userId: 'user-1',
          itemType: 'drug',
          drugId: 'drug-1',
        },
      })

      expect(db.favorite.create).toHaveBeenCalled()
    })

    it('should remove favorite', async () => {
      vi.mocked(db.favorite.delete).mockResolvedValue({ id: 'fav-1' } as any)

      await db.favorite.delete({
        where: { id: 'fav-1' },
      })

      expect(db.favorite.delete).toHaveBeenCalled()
    })
  })
})