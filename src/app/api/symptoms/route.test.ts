import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from './route'
import { ambilDaftarGejala, buatGejala } from '@/services/symptom-service'

vi.mock('@/services/symptom-service', () => ({
  ambilDaftarGejala: vi.fn(),
  buatGejala: vi.fn(),
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

describe('/api/symptoms', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET', () => {
    it('should return list of symptoms', async () => {
      vi.mocked(ambilDaftarGejala).mockResolvedValue({
        data: [{ id: '1', name: 'Demam' }],
        total: 1,
        halaman: 1,
        batas: 20,
      } as any)

      const request = new MockNextRequest('http://localhost/api/symptoms') as any
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data).toHaveLength(1)
    })

    it('should handle category filter', async () => {
      vi.mocked(ambilDaftarGejala).mockResolvedValue({
        data: [],
        total: 0,
        halaman: 1,
        batas: 20,
      } as any)

      const request = new MockNextRequest('http://localhost/api/symptoms?kategori=Umum') as any
      await GET(request)

      expect(ambilDaftarGejala).toHaveBeenCalledWith(
        expect.objectContaining({ kategori: 'Umum' })
      )
    })

    it('should handle errors', async () => {
      vi.mocked(ambilDaftarGejala).mockRejectedValue(new Error('DB Error'))

      const request = new MockNextRequest('http://localhost/api/symptoms') as any
      const response = await GET(request)

      expect(response.status).toBe(500)
    })
  })

  describe('POST', () => {
    it('should create symptom', async () => {
      vi.mocked(buatGejala).mockResolvedValue({ id: '1', name: 'Batuk' } as any)

      const request = new MockNextRequest('http://localhost/api/symptoms', { method: 'POST' }) as any
      request.json = vi.fn().mockResolvedValue({ name: 'Batuk' })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.name).toBe('Batuk')
    })

    it('should validate required fields', async () => {
      const request = new MockNextRequest('http://localhost/api/symptoms', { method: 'POST' }) as any
      request.json = vi.fn().mockResolvedValue({})

      const response = await POST(request)

      expect(response.status).toBe(400)
    })
  })
})