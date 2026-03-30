import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    favorite: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

describe('/api/favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: User terautentikasi
    vi.mocked(getServerSession).mockResolvedValue({ user: { id: 'user-1' } })
  })

  describe('GET', () => {
    it('should return user favorites', async () => {
      vi.mocked(db.favorite.findMany).mockResolvedValue([
        { 
          id: 'fav-1', 
          itemType: 'drug', 
          drug: { id: 'd1', name: 'Paracetamol' },
          createdAt: new Date() 
        }
      ] as any)

      const request = new NextRequest('http://localhost/api/favorites')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toHaveLength(1)
      expect(data[0].name).toBe('Paracetamol')
    })

    it('should return 401 when not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/favorites')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should filter by itemType', async () => {
      vi.mocked(db.favorite.findMany).mockResolvedValue([])

      const request = new NextRequest('http://localhost/api/favorites?itemType=drug')
      await GET(request)

      expect(db.favorite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ 
            itemType: 'drug',
            userId: 'user-1' 
          }),
        })
      )
    })
  })

  describe('POST', () => {
    it('should add favorite', async () => {
      vi.mocked(db.favorite.create).mockResolvedValue({ id: 'fav-1' } as any)

      const request = new NextRequest('http://localhost/api/favorites', {
        method: 'POST',
        body: JSON.stringify({ itemType: 'drug', itemId: 'drug-1' })
      })

      const response = await POST(request)
      expect(response.status).toBe(201)
      
      expect(db.favorite.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-1',
          itemType: 'drug',
          drugId: 'drug-1'
        })
      })
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/favorites', {
        method: 'POST',
        body: JSON.stringify({})
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})