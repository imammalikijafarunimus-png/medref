// =============================================
// Test Setup Configuration
// =============================================
// Global setup for Vitest testing

import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// ─────────────────────────────────────────
// Mock Next.js Navigation
// ─────────────────────────────────────────

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useSelectedLayoutSegment: () => null,
  useSelectedLayoutSegments: () => [],
}))

// ─────────────────────────────────────────
// Mock Next.js Image Component
// ─────────────────────────────────────────

vi.mock('next/image', () => ({
  default: ({ src, alt, width, height, ...props }: {
    src: string
    alt: string
    width?: number
    height?: number
  }) => <img src={src} alt={alt} width={width} height={height} {...props} />,
}))

// ─────────────────────────────────────────
// Mock Next.js Link Component
// ─────────────────────────────────────────

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: {
    href: string
    children: React.ReactNode
  }) => <a href={href} {...props}>{children}</a>,
}))

// ─────────────────────────────────────────
// Mock NextAuth
// ─────────────────────────────────────────

vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        role: 'ADMIN',
      },
    },
    status: 'authenticated',
    update: vi.fn(),
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}))

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}))

// ─────────────────────────────────────────
// Mock Browser APIs
// ─────────────────────────────────────────

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock scrollTo
global.scrollTo = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// ─────────────────────────────────────────
// Mock fetch
// ─────────────────────────────────────────

global.fetch = vi.fn()

// ─────────────────────────────────────────
// Cleanup
// ─────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.getItem.mockReset()
  localStorageMock.setItem.mockReset()
  localStorageMock.removeItem.mockReset()
  localStorageMock.clear.mockReset()
})

// Suppress console errors during tests (optional)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
        args[0].includes('act(...)'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})