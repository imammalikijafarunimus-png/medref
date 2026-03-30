# MedRef Developer Documentation

## Panduan Developer - MedRef Medical Reference Application

---

## 1. Architecture Overview

### 1.1 Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL |
| ORM | Prisma 7 |
| Authentication | NextAuth.js 4 |
| Testing | Vitest + Playwright |
| CI/CD | GitHub Actions |
| Deployment | Vercel |

### 1.2 Project Structure

```
medref-app/
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Migration files
│   └── seed/               # Seed data
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/           # API routes
│   │   ├── drugs/         # Drug pages
│   │   ├── herbals/       # Herbal pages
│   │   ├── notes/         # Clinical notes pages
│   │   ├── symptoms/      # Symptoms pages
│   │   ├── kalkulator/    # Calculator pages
│   │   ├── lab-values/    # Lab values page
│   │   ├── interaksi/     # Interaction checker
│   │   ├── favorites/     # Favorites page
│   │   ├── login/         # Login page
│   │   └── search/        # Search results page
│   ├── components/
│   │   ├── ui/            # Base UI components (shadcn)
│   │   ├── medical/       # Domain-specific components
│   │   └── favorites/     # Favorite-related components
│   ├── lib/
│   │   ├── auth/          # Authentication utilities
│   │   ├── mappers/       # Data mappers
│   │   ├── actions/       # Server actions
│   │   ├── db.ts          # Database client
│   │   ├── cache.ts       # Caching utilities
│   │   ├── utils.ts       # Utility functions
│   │   ├── validation.ts  # Zod schemas
│   │   ├── fuzzy-search.ts# Fuzzy search algorithm
│   │   └── data.ts        # Data access functions
│   ├── services/          # Business logic services
│   ├── types/             # TypeScript types
│   └── test/              # Test utilities
├── e2e/                   # Playwright E2E tests
├── docs/                  # Documentation
├── public/                # Static assets
│   ├── icons/            # App icons
│   ├── manifest.json     # PWA manifest
│   └── sw.js             # Service worker
├── .github/workflows/     # CI/CD pipelines
├── vitest.config.ts       # Vitest configuration
├── playwright.config.ts   # Playwright configuration
└── next.config.ts         # Next.js configuration
```

---

## 2. Getting Started

### 2.1 Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### 2.2 Installation

```bash
# Clone repository
git clone https://github.com/medref/medref.git
cd medref

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Edit .env.local with your values
# DATABASE_URL="postgresql://user:pass@localhost:5432/medref"
# NEXTAUTH_SECRET="your-secret-key"
# NEXTAUTH_URL="http://localhost:3000"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run db:seed

# Start development server
npm run dev
```

### 2.3 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth JWT | Yes |
| `NEXTAUTH_URL` | Base URL for NextAuth | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Optional |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | Optional |

---

## 3. Database Schema

### 3.1 Core Models

```prisma
// User model
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  password      String
  role          UserRole  @default(GUEST)
  isActive      Boolean   @default(true)
  emailVerified DateTime?
  lastLoginAt   DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  favorites     Favorite[]
  auditLogs     AuditLog[]
}

// Drug model
model Drug {
  id               String   @id @default(cuid())
  name             String
  genericName      String?
  brandNames       String?
  drugClass        String?
  mechanism        String?
  route            String?
  halfLife         String?
  pregnancyCat     String?
  viewCount        Int      @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  doses            DrugDose[]
  indications      DrugIndication[]
  contraindications DrugContraindication[]
  interactions     DrugInteraction[]
}

// DrugInteraction model
model DrugInteraction {
  id               String   @id @default(cuid())
  drugId           String
  interactingDrugId String
  interactionType  String?
  effect           String?
  mechanism        String?
  management       String?
  
  drug             Drug     @relation("DrugInteractions", fields: [drugId])
  interactingDrug  Drug     @relation("InteractingDrugs", fields: [interactingDrugId])
}
```

### 3.2 Migrations

```bash
# Create migration
npx prisma migrate dev --name description_of_change

# Reset database
npx prisma migrate reset

# Push schema (dev)
npx prisma db push
```

---

## 4. API Development

### 4.1 Route Handler Pattern

```typescript
// src/app/api/drugs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ambilDaftarObat } from '@/services/drug-service'
import { validasiInput, skemaBuatObat } from '@/lib/validation'

// GET handler
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    const { data, total } = await ambilDaftarObat({ halaman: page, batas: limit })
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data' },
      { status: 500 }
    )
  }
}

// POST handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validasi = validasiInput(skemaBuatObat, body)
    if (!validasi.success) {
      return NextResponse.json(
        { success: false, errors: validasi.errors },
        { status: 400 }
      )
    }
    
    const obat = await buatObat(validasi.data)
    
    return NextResponse.json({
      success: true,
      data: obat,
      message: 'Obat berhasil dibuat'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Gagal membuat obat' },
      { status: 500 }
    )
  }
}
```

### 4.2 Protected Routes

```typescript
// Using auth middleware
import { withAuth, withRole } from '@/lib/auth/rbac'

export const POST = withAuth(async (request, { user }) => {
  // Only authenticated users
})

export const DELETE = withRole(['ADMIN', 'DOCTOR'], async (request, { user }) => {
  // Only ADMIN and DOCTOR roles
})
```

---

## 5. Service Layer

### 5.1 Service Pattern

```typescript
// src/services/drug-service.ts
import { db } from '@/lib/db'
import { cache, CacheKeys, CacheTTL } from '@/lib/cache'

export async function ambilDaftarObat(options: {
  halaman?: number
  batas?: number
  kelas?: string
  cari?: string
} = {}) {
  const { halaman = 1, batas = 20, kelas, cari } = options
  const skip = (halaman - 1) * batas
  
  // Check cache
  const cacheKey = CacheKeys.drugs.list(halaman, batas, kelas)
  const cached = cache.get(cacheKey)
  if (cached && !cari) return cached
  
  // Build query
  const where: Record<string, unknown> = {}
  if (kelas) where.drugClass = kelas
  if (cari) {
    where.OR = [
      { name: { contains: cari, mode: 'insensitive' } },
      { genericName: { contains: cari, mode: 'insensitive' } }
    ]
  }
  
  // Execute query
  const [data, total] = await Promise.all([
    db.drug.findMany({ where, skip, take: batas, orderBy: { name: 'asc' } }),
    db.drug.count({ where })
  ])
  
  const result = { data, total }
  
  // Cache result
  if (!cari) cache.set(cacheKey, result, CacheTTL.list)
  
  return result
}
```

---

## 6. Component Development

### 6.1 Component Structure

```typescript
// src/components/medical/drug-card.tsx
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Drug } from '@prisma/client'

interface DrugCardProps {
  drug: Drug
  onFavorite?: (id: string) => void
}

export function DrugCard({ drug, onFavorite }: DrugCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  
  return (
    <Card className="p-4">
      <h3>{drug.name}</h3>
      <p>{drug.genericName}</p>
      <Button onClick={() => onFavorite?.(drug.id)}>
        {isFavorite ? '★' : '☆'}
      </Button>
    </Card>
  )
}
```

### 6.2 Server Components

```typescript
// src/app/drugs/[id]/page.tsx
import { notFound } from 'next/navigation'
import { ambilDetailObat } from '@/services/drug-service'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DrugDetailPage({ params }: PageProps) {
  const { id } = await params
  const drug = await ambilDetailObat(id)
  
  if (!drug) notFound()
  
  return (
    <main>
      <h1>{drug.name}</h1>
      {/* ... */}
    </main>
  )
}
```

---

## 7. State Management

### 7.1 React Context

```typescript
// src/components/medical/search-provider.tsx
'use client'

import { createContext, useContext, useState } from 'react'

interface SearchContextType {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
  isSearching: boolean
}

const SearchContext = createContext<SearchContextType | null>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  return (
    <SearchContext.Provider value={{ query, setQuery, results, isSearching }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) throw new Error('useSearch must be used within SearchProvider')
  return context
}
```

---

## 8. Testing

### 8.1 Unit Tests

```typescript
// src/lib/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatTanggal, potongTeks } from './utils'

describe('formatTanggal', () => {
  it('should format date in Indonesian', () => {
    const date = new Date('2024-01-15')
    expect(formatTanggal(date)).toBe('15 Januari 2024')
  })
})
```

### 8.2 Integration Tests

```typescript
// src/app/api/drugs/route.test.ts
import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'

vi.mock('@/services/drug-service', () => ({
  ambilDaftarObat: vi.fn()
}))

describe('GET /api/drugs', () => {
  it('should return paginated list', async () => {
    const request = new NextRequest('http://localhost:3000/api/drugs')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

### 8.3 E2E Tests

```typescript
// e2e/drugs.spec.ts
import { test, expect } from '@playwright/test'

test('should display drugs list', async ({ page }) => {
  await page.goto('/drugs')
  
  const drugCards = page.locator('[data-testid="drug-card"]')
  await expect(drugCards.first()).toBeVisible()
})
```

### 8.4 Run Tests

```bash
# Unit tests
npm run test
npm run test:run
npm run test:coverage

# E2E tests
npm run test:e2e
npm run test:e2e:ui

# All tests
npm run test:all
```

---

## 9. Caching Strategy

### 9.1 Memory Cache

```typescript
// src/lib/cache.ts
class MemoryCache {
  private cache = new Map<string, CacheItem<unknown>>()
  
  set<T>(key: string, data: T, ttlMs: number): void {
    this.cache.set(key, { data, expiresAt: Date.now() + ttlMs })
  }
  
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item || Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }
    return item.data as T
  }
  
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) this.cache.delete(key)
    }
  }
}
```

### 9.2 Cache Keys

```typescript
export const CacheKeys = {
  drugs: {
    list: (page: number, limit: number, drugClass?: string) => 
      `drugs:list:${page}:${limit}:${drugClass || 'all'}`,
    detail: (id: string) => `drugs:detail:${id}`,
  },
  // ...
}

export const CacheTTL = {
  search: 30 * 1000,      // 30 seconds
  list: 2 * 60 * 1000,    // 2 minutes
  detail: 5 * 60 * 1000,  // 5 minutes
  static: 15 * 60 * 1000, // 15 minutes
}
```

---

## 10. Security

### 10.1 Authentication Flow

```
User Login Request
        ↓
Credentials Provider
        ↓
Verify Password (bcrypt)
        ↓
Generate JWT Token
        ↓
Return Session
```

### 10.2 Role-Based Access Control

```typescript
// Check permission
if (!hasPermission(user.role, 'write:drugs')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

### 10.3 Input Validation

```typescript
// Zod schema
export const skemaBuatObat = z.object({
  name: z.string().min(1).max(200),
  genericName: z.string().max(200).optional(),
  drugClass: z.enum(['analgesik', 'antibiotik', ...]).optional(),
  // ...
})

// Usage
const validasi = validasiInput(skemaBuatObat, body)
if (!validasi.success) {
  return NextResponse.json({ errors: validasi.errors }, { status: 400 })
}
```

---

## 11. Performance Optimization

### 11.1 Code Splitting

```typescript
// Dynamic import for heavy components
const CalculatorPage = dynamic(
  () => import('@/components/medical/calculators/calculator-page'),
  { loading: () => <CalculatorSkeleton /> }
)
```

### 11.2 Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/icons/icon-512x512.jpeg"
  alt="MedRef Logo"
  width={64}
  height={64}
  priority
/>
```

### 11.3 Database Optimization

```typescript
// Use select for specific fields
const drugs = await db.drug.findMany({
  select: { id: true, name: true, genericName: true }
})

// Use include for relations
const drug = await db.drug.findUnique({
  where: { id },
  include: { doses: true, indications: true }
})
```

---

## 12. Deployment

### 12.1 Build Process

```bash
# Build application
npm run build

# Start production server
npm run start
```

### 12.2 Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  }
}
```

### 12.3 Environment Setup

```bash
# Production environment variables
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://medref.app"
NODE_ENV="production"
```

---

## 13. Contributing

### 13.1 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 13.2 Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Testing
- `refactor:` Code refactoring
- `chore:` Maintenance

### 13.3 Code Standards

- Use TypeScript strict mode
- Follow ESLint rules
- Write tests for new features
- Update documentation

---

## 14. Debugging

### 14.1 Development Tools

```bash
# Debug mode
NODE_OPTIONS='--inspect' npm run dev

# Prisma studio
npx prisma studio

# View logs
tail -f .next/trace
```

### 14.2 Common Issues

**Database Connection Error:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Reset database
npx prisma migrate reset
```

**Build Error:**
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

---

## 15. Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)