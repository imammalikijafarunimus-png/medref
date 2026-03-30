import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HerbalCard } from './herbal-card'  // Named import

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/herbals',
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHerbal = {
  id: 'herbal-1',
  name: 'Jahe',
  latinName: 'Zingiber officinale',
  category: 'Digestive',
  viewCount: 50,
}

describe('HerbalCard', () => {
  it('should render herbal name', () => {
    render(<HerbalCard herbal={mockHerbal as any} />)
    
    expect(screen.getByText('Jahe')).toBeInTheDocument()
  })

  it('should display latin name when available', () => {
    render(<HerbalCard herbal={mockHerbal as any} />)
    
    expect(screen.getByText(/Zingiber officinale/)).toBeInTheDocument()
  })

  it('should show category badge', () => {
    render(<HerbalCard herbal={mockHerbal as any} />)
    
    expect(screen.getByText('Digestive')).toBeInTheDocument()
  })

  it('should be clickable link', () => {
    render(<HerbalCard herbal={mockHerbal as any} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/herbals/herbal-1')
  })

  it('should handle minimal herbal data', () => {
    const minimalHerbal = {
      id: 'herbal-2',
      name: 'Kunyit',
      viewCount: 0,
    }
    
    render(<HerbalCard herbal={minimalHerbal as any} />)
    
    expect(screen.getByText('Kunyit')).toBeInTheDocument()
  })
})