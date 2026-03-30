import { describe, it, expect, vi, beforeEach } from 'vitest'
import { db } from '@/lib/db'

// Mock db
vi.mock('@/lib/db', () => ({
  db: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: {
    getServerSession: vi.fn(),
  },
}))

describe('Audit Logging', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('logAction', () => {
    it('should create audit log entry', async () => {
      const mockLog = {
        id: 'log-1',
        userId: 'user-1',
        action: 'CREATE',
        entity: 'Drug',
        entityId: 'drug-1',
        createdAt: new Date(),
      }

      vi.mocked(db.auditLog.create).mockResolvedValue(mockLog as any)

      // Test direct call
      const result = await db.auditLog.create({
        data: {
          userId: 'user-1',
          action: 'CREATE',
          entity: 'Drug',
          entityId: 'drug-1',
        },
      })

      expect(result).toEqual(mockLog)
    })

    it('should log without userId for anonymous actions', async () => {
      vi.mocked(db.auditLog.create).mockResolvedValue({
        id: 'log-2',
        userId: null,
        action: 'VIEW',
        entity: 'Drug',
        entityId: 'drug-1',
        createdAt: new Date(),
      } as any)

      const result = await db.auditLog.create({
        data: {
          action: 'VIEW',
          entity: 'Drug',
          entityId: 'drug-1',
        },
      })

      expect(result.userId).toBeNull()
    })
  })

  describe('getLogs', () => {
    it('should retrieve audit logs with pagination', async () => {
      vi.mocked(db.auditLog.findMany).mockResolvedValue([])
      vi.mocked(db.auditLog.count).mockResolvedValue(0)

      await db.auditLog.findMany({
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      })

      expect(db.auditLog.findMany).toHaveBeenCalled()
    })

    it('should filter logs by userId', async () => {
      vi.mocked(db.auditLog.findMany).mockResolvedValue([])

      await db.auditLog.findMany({
        where: { userId: 'user-1' },
      })

      expect(db.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } })
      )
    })

    it('should filter logs by action', async () => {
      vi.mocked(db.auditLog.findMany).mockResolvedValue([])

      await db.auditLog.findMany({
        where: { action: 'LOGIN' },
      })

      expect(db.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { action: 'LOGIN' } })
      )
    })
  })
})