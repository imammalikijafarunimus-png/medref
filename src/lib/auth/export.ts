// =============================================
// Auth Module Exports
// =============================================
// Centralized exports for authentication utilities

// Main auth configuration
export { authOptions, hasPermission, canPerformAction, ROLE_PERMISSIONS } from './index'

// RBAC utilities
export {
  requireAuth,
  requireRole,
  requirePermission,
  withAuth,
  withRole,
  withPermission,
  withRateLimit,
  compose,
  PERMISSIONS,
  ROLE_HIERARCHY,
  isRoleAtLeast,
} from './rbac'

// Audit logging
export {
  createAuditLog,
  logLoginAttempt,
  logCreate,
  logUpdate,
  logDelete,
  logPermissionDenied,
  logExport,
  queryAuditLogs,
  getAuditSummary,
  extractClientInfo,
} from './audit'

// Password utilities
export {
  hashPassword,
  verifyPassword,
  checkPasswordStrength,
  generateSecurePassword,
} from './password'

// Re-export types
export type { UserRole, AuditAction } from '@prisma/client'