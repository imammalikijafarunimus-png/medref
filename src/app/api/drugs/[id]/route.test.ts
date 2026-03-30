import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from './route'
import { ambilDetailObat, updateObat, hapusObat } from '@/services/drug-service'

vi.mock('@/services/drug-service', () => ({
  ambilDetailObat: vi.fn(),
  updateObat: vi.fn(),
  hapusObat: vi.fn(),
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

const mockParams = (id: string) => Promise.resolve({ id })

describe('/api/drugs/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET', () => {
    it('should return drug detail', async () => {
      vi.mocked(ambilDetailObat).mockResolvedValue({
        id: 'drug-1',
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
      } as any)

      const request = new MockNextRequest('http://localhost/api/drugs/drug-1') as any
      const response = await GET(request, { params: mockParams('drug-1') })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe('Paracetamol')
    })

    it('should return 404 when not found', async () => {
      vi.mocked(ambilDetailObat).mockResolvedValue(null)

      const request = new MockNextRequest('http://localhost/api/drugs/nonexistent') as any
      const response = await GET(request, { params: mockParams('nonexistent') })

      expect(response.status).toBe(404)
    })

    it('should handle errors', async () => {
      vi.mocked(ambilDetailObat).mockRejectedValue(new Error('DB Error'))

      const request = new MockNextRequest('http://localhost/api/drugs/drug-1') as any
      const response = await GET(request, { params: mockParams('drug-1') })

      expect(response.status).toBe(500)
    })
  })

  describe('PUT', () => {
    it('should update drug', async () => {
      vi.mocked(updateObat).mockResolvedValue({
        id: 'drug-1',
        name: 'Paracetamol Updated',
      } as any)

      const request = new MockNextRequest('http://localhost/api/drugs/drug-1', { method: 'PUT' }) as any
      request.json = vi.fn().mockResolvedValue({ name: 'Paracetamol Updated' })

      const response = await PUT(request, { params: mockParams('drug-1') })

      expect(response.status).toBe(200)
    })
  })

  describe('DELETE', () => {
    it('should delete drug', async () => {
      vi.mocked(hapusObat).mockResolvedValue({ id: 'drug-1' } as any)

      const request = new MockNextRequest('http://localhost/api/drugs/drug-1', { method: 'DELETE' }) as any
      const response = await DELETE(request, { params: mockParams('drug-1') })

      expect(response.status).toBe(200)
    })
  })
})