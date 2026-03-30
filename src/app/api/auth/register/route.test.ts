import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
}))

class MockNextRequest {
  json: () => Promise<any>
  
  constructor(body: any) {
    this.json = () => Promise.resolve(body)
  }
}

describe('/api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('POST', () => {
    it('should register new user', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null)
      vi.mocked(db.user.create).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'GUEST',
      } as any)

      const request = new MockNextRequest({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }) as any

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.email).toBe('test@example.com')
    })

    it('should return 400 for existing email', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue({
        id: 'user-1',
        email: 'existing@example.com',
      } as any)

      const request = new MockNextRequest({
        email: 'existing@example.com',
        password: 'password123',
      }) as any

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should validate email format', async () => {
      const request = new MockNextRequest({
        email: 'invalid-email',
        password: 'password123',
      }) as any

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should validate password length', async () => {
      const request = new MockNextRequest({
        email: 'test@example.com',
        password: '123',
      }) as any

      const response = await POST(request)

      expect(response.status).toBe(400)
    })

    it('should hash password before saving', async () => {
      vi.mocked(db.user.findUnique).mockResolvedValue(null)
      vi.mocked(db.user.create).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
      } as any)

      const request = new MockNextRequest({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test',
      }) as any

      await POST(request)

      expect(hashPassword).toHaveBeenCalledWith('password123')
    })
  })
})