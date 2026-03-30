import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from './route'
import { ambilDetailHerbal, updateHerbal, hapusHerbal } from '@/services/herbal-service'

vi.mock('@/services/herbal-service', () => ({
  ambilDetailHerbal: vi.fn(),
  updateHerbal: vi.fn(),
  hapusHerbal: vi.fn(),
}))

class MockNextRequest {
  url: string
  method: string
  
  constructor(url: string, options?: { method?: string }) {
    this.url = url
    this.method = options?.method || 'GET'
  }
  
  json() {
    return Promise.resolve({})
  }
}

// Helper untuk membuat params Promise (Next.js 15+)
const mockParams = (id: string) => Promise.resolve({ id })

describe('/api/herbals/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET', () => {
    it('should return herbal detail', async () => {
      vi.mocked(ambilDetailHerbal).mockResolvedValue({
        id: 'herbal-1',
        name: 'Jahe',
        latinName: 'Zingiber officinale',
      } as any)

      const request = new MockNextRequest('http://localhost/api/herbals/herbal-1') as any
      const response = await GET(request, { params: mockParams('herbal-1') })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe('Jahe')
    })

    it('should return 404 when not found', async () => {
      vi.mocked(ambilDetailHerbal).mockResolvedValue(null)

      const request = new MockNextRequest('http://localhost/api/herbals/nonexistent') as any
      const response = await GET(request, { params: mockParams('nonexistent') })

      expect(response.status).toBe(404)
    })

    it('should handle errors', async () => {
      vi.mocked(ambilDetailHerbal).mockRejectedValue(new Error('DB Error'))

      const request = new MockNextRequest('http://localhost/api/herbals/herbal-1') as any
      const response = await GET(request, { params: mockParams('herbal-1') })

      expect(response.status).toBe(500)
    })
  })

  describe('PUT', () => {
    it('should update herbal', async () => {
      vi.mocked(updateHerbal).mockResolvedValue({
        id: 'herbal-1',
        name: 'Jahe Updated',
      } as any)

      const request = new MockNextRequest('http://localhost/api/herbals/herbal-1', { method: 'PUT' }) as any
      request.json = vi.fn().mockResolvedValue({ name: 'Jahe Updated' })

      const response = await PUT(request, { params: mockParams('herbal-1') })

      expect(response.status).toBe(200)
    })

    it('should return 404 when updating non-existent herbal', async () => {
      vi.mocked(updateHerbal).mockResolvedValue(null as any)

      const request = new MockNextRequest('http://localhost/api/herbals/nonexistent', { method: 'PUT' }) as any
      request.json = vi.fn().mockResolvedValue({ name: 'Test' })

      const response = await PUT(request, { params: mockParams('nonexistent') })

      expect(response.status).toBe(404)
    })
  })

  describe('DELETE', () => {
    it('should delete herbal', async () => {
      vi.mocked(hapusHerbal).mockResolvedValue({ id: 'herbal-1' } as any)

      const request = new MockNextRequest('http://localhost/api/herbals/herbal-1', { method: 'DELETE' }) as any
      const response = await DELETE(request, { params: mockParams('herbal-1') })

      expect(response.status).toBe(200)
    })

    it('should return 404 when deleting non-existent herbal', async () => {
      vi.mocked(hapusHerbal).mockResolvedValue(null as any)

      const request = new MockNextRequest('http://localhost/api/herbals/nonexistent', { method: 'DELETE' }) as any
      const response = await DELETE(request, { params: mockParams('nonexistent') })

      expect(response.status).toBe(404)
    })
  })
})