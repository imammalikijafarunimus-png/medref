// =============================================
// RBAC Utilities for Server Components & API Routes
// =============================================

import { getServerSession } from 'next-auth/next'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions, hasPermission } from './index' // Pastikan canPerformAction sudah di-export di index.ts
import { UserRole } from '@prisma/client'
import { createAuditLog, extractClientInfo } from './audit'

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  image?: string | null
}

interface AuthResult {
  authenticated: boolean
  user: AuthUser | null
}

interface RoleCheckResult {
  authorized: boolean
  user: AuthUser | null
  reason?: string
}

// ─────────────────────────────────────────
// Permission Constants
// ─────────────────────────────────────────

export const PERMISSIONS = {
  READ_DRUGS: 'read:drugs',
  READ_HERBALS: 'read:herbals',
  READ_NOTES: 'read:notes',
  READ_SYMPTOMS: 'read:symptoms',
  READ_USERS: 'read:users',
  READ_AUDIT_LOGS: 'view:audit-logs',
  READ_ALL: 'read:all',
  
  WRITE_DRUGS: 'write:drugs',
  WRITE_HERBALS: 'write:herbals',
  WRITE_NOTES: 'write:notes',
  WRITE_SYMPTOMS: 'write:symptoms',
  WRITE_USERS: 'manage:users',
  WRITE_ALL: 'write:all',
  
  DELETE_DRUGS: 'delete:drugs',
  DELETE_HERBALS: 'delete:herbals',
  DELETE_NOTES: 'delete:notes',
  DELETE_ALL: 'delete:all',
  
  MANAGE_USERS: 'manage:users',
  EXPORT_DATA: 'export:data',
  USE_CALCULATORS: 'use:calculators',
} as const

// ─────────────────────────────────────────
// Role Hierarchy
// ─────────────────────────────────────────

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 100,
  DOCTOR: 80,
  PHARMACIST: 70,
  NURSE: 50,
  STUDENT: 30,
  GUEST: 10,
}

export function isRoleAtLeast(roleA: UserRole, roleB: UserRole): boolean {
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB]
}

// ─────────────────────────────────────────
// Authentication Checks
// ─────────────────────────────────────────

/**
 * Check if user is authenticated
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const session = await getServerSession(authOptions)
    
    // Perbaikan: Pastikan semua field wajib ada sebelum mengembalikan user
    if (!session?.user?.id || !session?.user?.email) {
      return { authenticated: false, user: null }
    }
    
    return { 
      authenticated: true, 
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? "User", // Fallback null-safety
        role: session.user.role as UserRole,
        image: session.user.image,
      } 
    }
  } catch (error) {
    console.error('Auth check failed:', error)
    return { authenticated: false, user: null }
  }
}

/**
 * Check if user has required role
 */
export async function requireRole(...roles: UserRole[]): Promise<RoleCheckResult> {
  const { authenticated, user } = await requireAuth()
  
  if (!authenticated || !user) {
    return { authorized: false, user: null, reason: 'Not authenticated' }
  }
  
  if (!roles.includes(user.role)) {
    return { authorized: false, user, reason: 'Insufficient role' }
  }
  
  return { authorized: true, user }
}

/**
 * Check if user has specific permission
 */
export async function requirePermission(permission: string): Promise<RoleCheckResult> {
  const { authenticated, user } = await requireAuth()
  
  if (!authenticated || !user) {
    return { authorized: false, user: null, reason: 'Not authenticated' }
  }
  
  if (!hasPermission(user.role, permission)) {
    return { authorized: false, user, reason: 'Insufficient permissions' }
  }
  
  return { authorized: true, user }
}

// ─────────────────────────────────────────
// API Route Middleware Helpers
// ─────────────────────────────────────────

export function withAuth(
  handler: (req: NextRequest, context: { user: AuthUser }) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const { authenticated, user } = await requireAuth()
    
    if (!authenticated || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    return handler(req, { user })
  }
}

export function withRole(
  roles: UserRole[],
  handler: (req: NextRequest, context: { user: AuthUser }) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const { authorized, user, reason } = await requireRole(...roles)
    
    if (!authorized) {
      const clientInfo = extractClientInfo(req.headers)
      
      // Catat ke audit log jika user terautentikasi tapi ditolak aksesnya
      if (user) {
        await createAuditLog({
          action: 'PERMISSION_DENIED',
          entity: 'ProtectedRoute',
          userId: user.id,
          details: {
             attemptedRoles: roles,
             userRole: user.role,
             reason,
          },
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
        })
      }
      
      return NextResponse.json(
        { success: false, error: reason === 'Not authenticated' ? 'Unauthorized' : 'Forbidden' },
        { status: reason === 'Not authenticated' ? 401 : 403 }
      )
    }
    
    // Karena authorized=true, user sudah pasti bukan null
    return handler(req, { user: user as AuthUser })
  }
}

export function withPermission(
  permission: string,
  handler: (req: NextRequest, context: { user: AuthUser }) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const { authorized, user, reason } = await requirePermission(permission)
    
    if (!authorized) {
      const clientInfo = extractClientInfo(req.headers)
      
      if (user) {
        await createAuditLog({
          action: 'PERMISSION_DENIED',
          entity: 'Permission',
          userId: user.id,
          details: {
             attemptedPermission: permission,
             userRole: user.role,
             reason,
          },
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent,
        })
      }
      
      return NextResponse.json(
        { success: false, error: reason === 'Not authenticated' ? 'Unauthorized' : 'Forbidden' },
        { status: reason === 'Not authenticated' ? 401 : 403 }
      )
    }
    
    return handler(req, { user: user as AuthUser })
  }
}

// ─────────────────────────────────────────
// Rate Limiting & Composition (Tetap Sama)
// ─────────────────────────────────────────

const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  options: {
    windowMs?: number
    maxRequests?: number
    keyGenerator?: (req: NextRequest) => string
  } = {}
) {
  const {
    windowMs = 60 * 1000,
    maxRequests = 100,
    keyGenerator = (req) => 
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
      req.headers.get('x-real-ip') || 
      'unknown',
  } = options

  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
      const key = keyGenerator(req)
      const now = Date.now()
      const record = rateLimitStore.get(key)
      
      if (!record || now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
      } else {
        record.count++
        if (record.count > maxRequests) {
          return NextResponse.json(
            { success: false, error: 'Terlalu banyak permintaan.' },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Limit': String(maxRequests),
                'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
              }
            }
          )
        }
      }
      return handler(req)
    }
  }
}

type MiddlewareFn = (handler: (req: NextRequest) => Promise<NextResponse>) => (req: NextRequest) => Promise<NextResponse>

export function compose(...middlewares: MiddlewareFn[]) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return middlewares.reduceRight((next, middleware) => middleware(next), handler)
  }
}