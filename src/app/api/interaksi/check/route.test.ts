import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    drugInteraction: {
      findMany: vi.fn(),
    },
    herbalInteraction: {
      findMany: vi.fn(),
    },
  },
}))

class MockNextRequest {
  url: string
  
  constructor(url: string) {
    this.url = url
  }
}

describe('/api/interaksi/check', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET', () => {
    it('should check drug interactions', async () => {
      vi.mocked(db.drugInteraction.findMany).mockResolvedValue([
        {
          id: 'int-1',
          drugId: 'drug-1',
          interactingDrugId: 'drug-2',
          effect: 'Increased bleeding risk',
        },
      ] as any)
      vi.mocked(db.herbalInteraction.findMany).mockResolvedValue([])

      const request = new MockNextRequest('http://localhost/api/interaksi/check?drugs=drug-1,drug-2') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.interactions).toBeDefined()
    })

    it('should return 400 for missing drugs parameter', async () => {
      const request = new MockNextRequest('http://localhost/api/interaksi/check') as any
      const response = await GET(request)

      expect(response.status).toBe(400)
    })

    it('should return empty array when no interactions', async () => {
      vi.mocked(db.drugInteraction.findMany).mockResolvedValue([])
      vi.mocked(db.herbalInteraction.findMany).mockResolvedValue([])

      const request = new MockNextRequest('http://localhost/api/interaksi/check?drugs=drug-1') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.interactions).toEqual([])
    })

    it('should check herbal interactions', async () => {
      vi.mocked(db.drugInteraction.findMany).mockResolvedValue([])
      vi.mocked(db.herbalInteraction.findMany).mockResolvedValue([
        {
          id: 'hint-1',
          herbalId: 'herbal-1',
          interactingDrugId: 'drug-1',
          effect: 'May decrease drug effectiveness',
        },
      ] as any)

      const request = new MockNextRequest('http://localhost/api/interaksi/check?drugs=drug-1&herbals=herbal-1') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.herbalInteractions).toBeDefined()
    })

    it('should handle errors', async () => {
      vi.mocked(db.drugInteraction.findMany).mockRejectedValue(new Error('DB Error'))

      const request = new MockNextRequest('http://localhost/api/interaksi/check?drugs=drug-1') as any
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })
})