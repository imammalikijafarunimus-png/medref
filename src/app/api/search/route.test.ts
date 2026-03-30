import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { pencarianGlobal } from '@/services/search-service'

vi.mock('@/services/search-service', () => ({
  pencarianGlobal: vi.fn(),
}))

class MockNextRequest {
  url: string
  
  constructor(url: string) {
    this.url = url
  }
}

describe('/api/search', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET', () => {
    it('should return search results', async () => {
      vi.mocked(pencarianGlobal).mockResolvedValue({
        drugs: [{ id: '1', name: 'Paracetamol' }],
        herbals: [],
        symptoms: [],
        notes: [],
        totalResults: 1,
        query: 'para',
      })

      const request = new MockNextRequest('http://localhost/api/search?q=para') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalResults).toBe(1)
    })

    it('should return 400 for missing query', async () => {
      const request = new MockNextRequest('http://localhost/api/search') as any
      const response = await GET(request)

      expect(response.status).toBe(400)
    })

    it('should handle empty results', async () => {
      vi.mocked(pencarianGlobal).mockResolvedValue({
        drugs: [],
        herbals: [],
        symptoms: [],
        notes: [],
        totalResults: 0,
        query: 'xyz',
      })

      const request = new MockNextRequest('http://localhost/api/search?q=xyz') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalResults).toBe(0)
    })

    it('should handle errors', async () => {
      vi.mocked(pencarianGlobal).mockRejectedValue(new Error('Search error'))

      const request = new MockNextRequest('http://localhost/api/search?q=test') as any
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })
})