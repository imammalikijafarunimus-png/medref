// =============================================
// Test Utilities and Mock Factories
// =============================================

import { vi } from 'vitest'
import type { UserRole } from '@prisma/client'

// ─────────────────────────────────────────
// Mock Prisma Client
// ─────────────────────────────────────────

export const mockPrisma = {
  drug: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  herbal: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  clinicalNote: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  symptom: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  favorite: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  searchLog: {
    create: vi.fn(),
    findMany: vi.fn(),
    groupBy: vi.fn(),
  },
  drugInteraction: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  herbalInteraction: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  $transaction: vi.fn((promises) => Promise.all(promises)),
  $disconnect: vi.fn(),
}

// Mock the db module
vi.mock('@/lib/db', () => ({
  db: mockPrisma,
}))

// ─────────────────────────────────────────
// Test Data Factories
// ─────────────────────────────────────────

export function createMockDrug(overrides = {}) {
  return {
    id: 'test-drug-id',
    name: 'Test Drug',
    genericName: 'Test Generic',
    brandNames: 'TestBrand',
    drugClass: 'analgesik',
    category: 'analgesik',
    description: 'Test description',
    mechanism: 'Test mechanism',
    route: 'oral',
    halfLife: '4 hours',
    pregnancyCat: 'B',
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockHerbal(overrides = {}) {
  return {
    id: 'test-herbal-id',
    name: 'Test Herbal',
    latinName: 'Testus herbalus',
    commonNames: 'Test Herb',
    localNames: 'Herbal Test',
    plantFamily: 'Testaceae',
    category: 'digestive',
    plantPart: 'Leaves',
    preparation: 'Tea',
    traditionalUse: 'Digestive aid',
    description: 'Test description',
    safetyRating: 'aman',
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockNote(overrides = {}) {
  return {
    id: 'test-note-id',
    title: 'Test Clinical Note',
    content: 'This is a test clinical note content.',
    category: 'General',
    specialty: 'Internal Medicine',
    tags: 'test,clinical,note',
    source: 'Test Source',
    author: 'Test Author',
    version: 1,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

export function createMockUser(overrides: {
  id?: string
  email?: string
  name?: string
  role?: UserRole
  isActive?: boolean
} = {}) {
  return {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'GUEST' as UserRole,
    isActive: true,
    image: null,
    emailVerified: new Date(),
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    password: '$2a$12$hashedpassword',
    ...overrides,
  }
}

export function createMockSession(userOverrides = {}) {
  return {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      role: 'ADMIN' as UserRole,
      ...userOverrides,
    },
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

// ─────────────────────────────────────────
// API Test Helpers
// ─────────────────────────────────────────

export function createMockRequest(body?: unknown, options: {
  method?: string
  headers?: Record<string, string>
  url?: string
} = {}) {
  const headers = new Headers(options.headers)
  
  return new Request(options.url || 'http://localhost:3000/api/test', {
    method: options.method || 'GET',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }) as unknown as import('next/server').NextRequest
}

export function createMockNextRequest(body?: unknown, options: {
  method?: string
  headers?: Record<string, string>
  url?: string
} = {}) {
  const url = new URL(options.url || 'http://localhost:3000/api/test')
  
  return {
    json: () => Promise.resolve(body || {}),
    text: () => Promise.resolve(body ? JSON.stringify(body) : ''),
    nextUrl: url,
    url: url.toString(),
    method: options.method || 'GET',
    headers: new Headers(options.headers),
    cookies: {
      get: vi.fn(),
      getAll: vi.fn(() => []),
      set: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as import('next/server').NextRequest
}

// ─────────────────────────────────────────
// Assertion Helpers
// ─────────────────────────────────────────

export function expectToBeValidJSON(str: string) {
  expect(() => JSON.parse(str)).not.toThrow()
}

export function expectErrorResponse(response: Response, status: number) {
  expect(response.status).toBe(status)
  return response.json()
}

export function expectSuccessResponse(response: Response, status = 200) {
  expect(response.status).toBe(status)
  return response.json()
}

// ─────────────────────────────────────────
// Wait Helpers
// ─────────────────────────────────────────

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function waitFor(condition: () => boolean, timeout = 5000) {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now()
    
    const check = () => {
      if (condition()) {
        resolve()
        return
      }
      
      if (Date.now() - startTime >= timeout) {
        reject(new Error('Condition not met within timeout'))
        return
      }
      
      setTimeout(check, 50)
    }
    
    check()
  })
}