// =============================================
// NextAuth Configuration - MedRef
// =============================================
// Secure authentication with RBAC support

import type { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

// ─────────────────────────────────────────
// Role-Based Permissions
// ─────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: [
    'read:all', 'write:all', 'delete:all', 'manage:users',
    'manage:drugs', 'manage:herbals', 'manage:notes',
    'manage:symptoms', 'view:audit-logs', 'export:data',
  ],
  DOCTOR: [
    'read:all', 'write:drugs', 'write:herbals', 'write:notes',
    'write:symptoms', 'use:calculators', 'export:data',
  ],
  PHARMACIST: [
    'read:all', 'write:drugs', 'write:herbals', 'use:calculators', 'export:data',
  ],
  NURSE: [
    'read:all', 'use:calculators',
  ],
  STUDENT: [
    'read:drugs', 'read:herbals', 'read:notes', 'read:symptoms', 'use:calculators',
  ],
  GUEST: [
    'read:drugs', 'read:herbals', 'use:calculators',
  ],
}

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || []
  return permissions.includes(permission) || 
         permissions.includes('read:all') || 
         permissions.includes('write:all')
}

/**
 * Check if user can perform action on entity
 * Digunakan untuk pengecekan hak akses yang lebih spesifik (read/write/delete)
 */
export function canPerformAction(
  role: UserRole,
  action: 'read' | 'write' | 'delete',
  entity: 'drugs' | 'herbals' | 'notes' | 'symptoms' | 'users' | 'audit-logs'
): boolean {
  const permission = `${action}:${entity}`
  const allPermission = `${action}:all`
  
  const permissions = ROLE_PERMISSIONS[role] || []
  
  // Return true jika memiliki permission spesifik, atau memiliki akses ':all'
  return (
    permissions.includes(permission) || 
    permissions.includes(allPermission) ||
    permissions.includes('write:all') // Admin biasanya punya ini
  )
}

// ─────────────────────────────────────────
// NextAuth Configuration
// ─────────────────────────────────────────

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
    signOut: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.isActive || !user.password) return null

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValidPassword) return null

        // Update last login background task
        db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        }).catch(err => console.error("Update lastLoginAt failed:", err))

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? "", // Null-safety fallback
          role: user.role,
          image: user.image ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.email = user.email
      }

      if (trigger === 'update' && session) {
        token.name = session.name
        token.email = session.email
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.name = token.name as string
        session.user.email = token.email as string
      }
      return session
    },
    async signIn() {
      return true
    },
  },
  events: {
    async signIn({ user, account }) {
      try {
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            entity: 'User',
            entityId: user.id,
            details: JSON.stringify({
              provider: account?.provider || 'credentials',
            }),
          },
        })
      } catch (error) {
        console.error('Failed to create audit log:', error)
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

// ─────────────────────────────────────────
// Type Augmentation
// ─────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    name: string
    role: UserRole
    image?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
  }
}