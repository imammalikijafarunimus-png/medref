import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from './route'
import { ambilDetailGejala, updateGejala, hapusGejala } from '@/services/symptom-service'

vi.mock('@/services/symptom-service', () => ({
  ambilDetailGejala: vi.fn(),
  updateGejala: vi.fn(),
  hapusGejala: vi.fn(),
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

describe('/api/symptoms/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET', () => {
    it('should return symptom detail with drug mappings', async () => {
      vi.mocked(ambilDetailGejala).mockResolvedValue({
        id: 'symptom-1',
        name: 'Demam',
        drugMappings: [],
      } as any)

      const request = new MockNextRequest('http://localhost/api/symptoms/symptom-1') as any
      const response = await GET(request, { params: mockParams('symptom-1') })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.name).toBe('Demam')
    })

    it('should return 404 when not found', async () => {
      vi.mocked(ambilDetailGejala).mockResolvedValue(null)

      const request = new MockNextRequest('http://localhost/api/symptoms/nonexistent') as any
      const response = await GET(request, { params: mockParams('nonexistent') })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT', () => {
    it('should update symptom', async () => {
      vi.mocked(updateGejala).mockResolvedValue({
        id: 'symptom-1',
        name: 'Demam Updated',
      } as any)

      const request = new MockNextRequest('http://localhost/api/symptoms/symptom-1', { method: 'PUT' }) as any
      request.json = vi.fn().mockResolvedValue({ name: 'Demam Updated' })

      const response = await PUT(request, { params: mockParams('symptom-1') })

      expect(response.status).toBe(200)
    })
  })

  describe('DELETE', () => {
    it('should delete symptom', async () => {
      vi.mocked(hapusGejala).mockResolvedValue({ id: 'symptom-1' } as any)

      const request = new MockNextRequest('http://localhost/api/symptoms/symptom-1', { method: 'DELETE' }) as any
      const response = await DELETE(request, { params: mockParams('symptom-1') })

      expect(response.status).toBe(200)
    })
  })
})