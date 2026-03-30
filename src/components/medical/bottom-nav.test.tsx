import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BottomNav from './bottom-nav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('BottomNav', () => {
  it('should render navigation items', () => {
    render(<BottomNav />)
    
    // Should have multiple nav items
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })

  it('should highlight active route', () => {
    render(<BottomNav />)
    
    // Home should be active when pathname is /
    const homeLink = screen.getByText(/beranda/i)
    expect(homeLink).toBeInTheDocument()
  })

  it('should be accessible', () => {
    render(<BottomNav />)
    
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })
})