// =============================================
// Audit Logging Service
// =============================================
// Centralized audit logging for security events

import { db } from '@/lib/db'
import { AuditAction } from '@prisma/client'

interface AuditLogData {
  action: AuditAction
  entity: string
  entityId?: string
  userId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

interface AuditQueryOptions {
  userId?: string
  action?: AuditAction
  entity?: string
  entityId?: string
  startDate?: Date
  endDate?: Date
  page?: number
  pageSize?: number
}

interface AuditLogResult {
  id: string
  userId: string | null
  action: AuditAction
  entity: string
  entityId: string | null
  details: string | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
  user: {
    id: string
    email: string
    name: string | null
    role: string
  } | null
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        userId: data.userId,
        details: data.details ? JSON.stringify(data.details) : null,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error('Audit log creation failed:', error)
  }
}

/**
 * Log a login attempt (success or failure)
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string,
  userAgent?: string,
  failureReason?: string
): Promise<void> {
  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true },
    })

    await createAuditLog({
      action: success ? 'LOGIN' : 'LOGIN_FAILED',
      entity: 'User',
      entityId: user?.id,
      userId: user?.id,
      details: {
        email,
        success,
        failureReason: success ? undefined : failureReason,
      },
      ipAddress,
      userAgent,
    })
  } catch (error) {
    console.error('Login audit log failed:', error)
  }
}

/**
 * Log a create action
 */
export async function logCreate(
  userId: string,
  entity: string,
  entityId: string,
  data: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'CREATE',
    entity,
    entityId,
    userId,
    details: { createdData: data },
    ipAddress,
    userAgent,
  })
}

/**
 * Log an update action
 */
export async function logUpdate(
  userId: string,
  entity: string,
  entityId: string,
  previousData: Record<string, unknown>,
  newData: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'UPDATE',
    entity,
    entityId,
    userId,
    details: {
      previousData,
      newData,
      changes: getChanges(previousData, newData),
    },
    ipAddress,
    userAgent,
  })
}

/**
 * Log a delete action
 */
export async function logDelete(
  userId: string,
  entity: string,
  entityId: string,
  deletedData: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'DELETE',
    entity,
    entityId,
    userId,
    details: { deletedData },
    ipAddress,
    userAgent,
  })
}

/**
 * Log a permission denied event
 */
export async function logPermissionDenied(
  userId: string | undefined,
  action: string,
  entity: string,
  entityId: string | undefined,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'PERMISSION_DENIED',
    entity,
    entityId,
    userId,
    details: {
      attemptedAction: action,
      reason: 'Insufficient permissions',
    },
    ipAddress,
    userAgent,
  })
}

/**
 * Log an export action
 */
export async function logExport(
  userId: string,
  entity: string,
  format: string,
  count: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await createAuditLog({
    action: 'EXPORT',
    entity,
    userId,
    details: {
      format,
      recordCount: count,
    },
    ipAddress,
    userAgent,
  })
}

/**
 * Query audit logs with filters
 */
export async function queryAuditLogs(
  options: AuditQueryOptions = {}
): Promise<{ logs: AuditLogResult[]; total: number }> {
  const {
    userId,
    action,
    entity,
    entityId,
    startDate,
    endDate,
    page = 1,
    pageSize = 50,
  } = options

  const where = {
    ...(userId && { userId }),
    ...(action && { action }),
    ...(entity && { entity }),
    ...(entityId && { entityId }),
    ...(startDate && { createdAt: { gte: startDate } }),
    ...(endDate && { createdAt: { lte: endDate } }),
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count({ where }),
  ])

  return { logs, total }
}

/**
 * Get audit summary for dashboard
 */
export async function getAuditSummary(days: number = 7): Promise<{
  totalActions: number
  loginAttempts: number
  failedLogins: number
  creates: number
  updates: number
  deletes: number
  permissionDenied: number
  actionsByEntity: Record<string, number>
  actionsByUser: Array<{ userId: string; userName: string; count: number }>
}> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const logs = await db.auditLog.findMany({
    where: { createdAt: { gte: startDate } },
    include: {
      user: { select: { name: true } },
    },
  })

  const summary = {
    totalActions: logs.length,
    loginAttempts: logs.filter((l) => l.action === 'LOGIN').length,
    failedLogins: logs.filter((l) => l.action === 'LOGIN_FAILED').length,
    creates: logs.filter((l) => l.action === 'CREATE').length,
    updates: logs.filter((l) => l.action === 'UPDATE').length,
    deletes: logs.filter((l) => l.action === 'DELETE').length,
    permissionDenied: logs.filter((l) => l.action === 'PERMISSION_DENIED').length,
    actionsByEntity: {} as Record<string, number>,
    actionsByUser: [] as Array<{ userId: string; userName: string; count: number }>,
  }

  // Count by entity
  for (const log of logs) {
    summary.actionsByEntity[log.entity] = (summary.actionsByEntity[log.entity] || 0) + 1
  }

  // Count by user
  const userCounts = new Map<string, { userName: string; count: number }>()
  for (const log of logs) {
    if (log.userId) {
      const existing = userCounts.get(log.userId)
      if (existing) {
        existing.count++
      } else {
        userCounts.set(log.userId, {
          userName: log.user?.name || 'Unknown',
          count: 1,
        })
      }
    }
  }

  summary.actionsByUser = Array.from(userCounts.entries())
    .map(([userId, data]) => ({
      userId,
      userName: data.userName,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return summary
}

/**
 * Helper to compute changes between two objects
 */
function getChanges(
  previous: Record<string, unknown>,
  current: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {}

  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)])

  for (const key of allKeys) {
    if (previous[key] !== current[key]) {
      changes[key] = {
        from: previous[key],
        to: current[key],
      }
    }
  }

  return changes
}

/**
 * Extract client info from request headers
 */
export function extractClientInfo(headers: Headers): {
  ipAddress: string | undefined
  userAgent: string | undefined
} {
  return {
    ipAddress: headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               headers.get('x-real-ip') ||
               undefined,
    userAgent: headers.get('user-agent') || undefined,
  }
}