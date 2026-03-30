import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { ambilDaftarHerbal, buatHerbal } from '@/services/herbal-service'

vi.mock('@/services/herbal-service', () => ({
  ambilDaftarHerbal: vi.fn(),
  buatHerbal: vi.fn(),
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

describe('/api/herbals', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('should return list of herbals', async () => {
      const mockResult = {
        data: [{ id: '1', name: 'Jahe' }],
        total: 1,
        halaman: 1,
        batas: 20,
      }
      vi.mocked(ambilDaftarHerbal).mockResolvedValue(mockResult as any)

      const request = new MockNextRequest('http://localhost/api/herbals') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
    })

    it('should handle pagination parameters', async () => {
      vi.mocked(ambilDaftarHerbal).mockResolvedValue({
        data: [],
        total: 0,
        halaman: 2,
        batas: 10,
      } as any)

      const request = new MockNextRequest('http://localhost/api/herbals?halaman=2&batas=10') as any
      await GET(request)

      expect(ambilDaftarHerbal).toHaveBeenCalledWith(
        expect.objectContaining({ halaman: 2, batas: 10 })
      )
    })

    it('should handle search query', async () => {
      vi.mocked(ambilDaftarHerbal).mockResolvedValue({
        data: [],
        total: 0,
        halaman: 1,
        batas: 20,
      } as any)

      const request = new MockNextRequest('http://localhost/api/herbals?cari=jahe') as any
      await GET(request)

      expect(ambilDaftarHerbal).toHaveBeenCalledWith(
        expect.objectContaining({ cari: 'jahe' })
      )
    })

    it('should handle errors gracefully', async () => {
      vi.mocked(ambilDaftarHerbal).mockRejectedValue(new Error('Database error'))

      const request = new MockNextRequest('http://localhost/api/herbals') as any
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST', () => {
    it('should create a new herbal', async () => {
      const newHerbal = { id: '1', name: 'Kunyit' }
      vi.mocked(buatHerbal).mockResolvedValue(newHerbal as any)

      const request = new MockNextRequest('http://localhost/api/herbals', { method: 'POST' }) as any
      request.json = vi.fn().mockResolvedValue({ name: 'Kunyit' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('Kunyit')
    })

    it('should return 400 for missing required fields', async () => {
      const request = new MockNextRequest('http://localhost/api/herbals', { method: 'POST' }) as any
      request.json = vi.fn().mockResolvedValue({})

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should handle database errors', async () => {
      vi.mocked(buatHerbal).mockRejectedValue(new Error('Write error'))

      const request = new MockNextRequest('http://localhost/api/herbals', { method: 'POST' }) as any
      request.json = vi.fn().mockResolvedValue({ name: 'Jahe' })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })
  })
})