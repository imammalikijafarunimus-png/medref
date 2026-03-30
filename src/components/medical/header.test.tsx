import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './header'  // Named import

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('./search-bar', () => ({
  SearchBar: () => <div data-testid="search-bar">Search</div>,
}))

vi.mock('./theme-toggle', () => ({
  ThemeToggle: () => <button>Theme</button>,
}))

describe('Header', () => {
  it('should render logo/brand', () => {
    render(<Header />)
    
    expect(screen.getByText(/MedRef/i)).toBeInTheDocument()
  })

  it('should include search bar', () => {
    render(<Header />)
    
    expect(screen.getByTestId('search-bar')).toBeInTheDocument()
  })

  it('should show navigation links', () => {
    render(<Header />)
    
    // Check for main navigation items
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })
})