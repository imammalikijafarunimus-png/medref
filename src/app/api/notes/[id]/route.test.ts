import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, PUT, DELETE } from './route'
import { ambilDetailCatatan, updateCatatan, hapusCatatan } from '@/services/note-service'

vi.mock('@/services/note-service', () => ({
  ambilDetailCatatan: vi.fn(),
  updateCatatan: vi.fn(),
  hapusCatatan: vi.fn(),
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

describe('/api/notes/[id]', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('GET', () => {
    it('should return note detail', async () => {
      vi.mocked(ambilDetailCatatan).mockResolvedValue({
        id: 'note-1',
        title: 'Panduan Klinis',
        content: 'Content',
      } as any)

      const request = new MockNextRequest('http://localhost/api/notes/note-1') as any
      const response = await GET(request, { params: mockParams('note-1') })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.title).toBe('Panduan Klinis')
    })

    it('should return 404 when not found', async () => {
      vi.mocked(ambilDetailCatatan).mockResolvedValue(null)

      const request = new MockNextRequest('http://localhost/api/notes/nonexistent') as any
      const response = await GET(request, { params: mockParams('nonexistent') })

      expect(response.status).toBe(404)
    })
  })

  describe('PUT', () => {
    it('should update note', async () => {
      vi.mocked(updateCatatan).mockResolvedValue({
        id: 'note-1',
        title: 'Updated',
      } as any)

      const request = new MockNextRequest('http://localhost/api/notes/note-1', { method: 'PUT' }) as any
      request.json = vi.fn().mockResolvedValue({ title: 'Updated' })

      const response = await PUT(request, { params: mockParams('note-1') })

      expect(response.status).toBe(200)
    })
  })

  describe('DELETE', () => {
    it('should delete note', async () => {
      vi.mocked(hapusCatatan).mockResolvedValue(undefined as any)

      const request = new MockNextRequest('http://localhost/api/notes/note-1', { method: 'DELETE' }) as any
      const response = await DELETE(request, { params: mockParams('note-1') })

      expect(response.status).toBe(200)
    })
  })
})