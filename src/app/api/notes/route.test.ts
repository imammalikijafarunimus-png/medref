import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { ambilDaftarCatatan, buatCatatan } from '@/services/note-service'

vi.mock('@/services/note-service', () => ({
  ambilDaftarCatatan: vi.fn(),
  buatCatatan: vi.fn(),
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

describe('/api/notes', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET', () => {
    it('should return list of notes', async () => {
      vi.mocked(ambilDaftarCatatan).mockResolvedValue({
        data: [{ id: '1', title: 'Panduan' }],
        total: 1,
        halaman: 1,
        batas: 20,
      } as any)

      const request = new MockNextRequest('http://localhost/api/notes') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
    })

    it('should handle pagination', async () => {
      vi.mocked(ambilDaftarCatatan).mockResolvedValue({
        data: [],
        total: 0,
        halaman: 1,
        batas: 10,
      } as any)

      const request = new MockNextRequest('http://localhost/api/notes?halaman=1&batas=10') as any
      await GET(request)

      expect(ambilDaftarCatatan).toHaveBeenCalledWith(
        expect.objectContaining({ halaman: 1, batas: 10 })
      )
    })

    it('should handle errors', async () => {
      vi.mocked(ambilDaftarCatatan).mockRejectedValue(new Error('Error'))

      const request = new MockNextRequest('http://localhost/api/notes') as any
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST', () => {
    it('should create note', async () => {
      vi.mocked(buatCatatan).mockResolvedValue({ id: '1', title: 'Test' } as any)

      const request = new MockNextRequest('http://localhost/api/notes', { method: 'POST' }) as any
      request.json = vi.fn().mockResolvedValue({
        title: 'Test',
        content: 'Content',
        category: 'General',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.title).toBe('Test')
    })

    it('should validate required fields', async () => {
      const request = new MockNextRequest('http://localhost/api/notes', { method: 'POST' }) as any
      request.json = vi.fn().mockResolvedValue({})

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})