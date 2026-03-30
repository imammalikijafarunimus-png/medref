import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DrugCard } from './drug-card'  // Named import

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/drugs',
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockDrug = {
  id: 'drug-1',
  name: 'Paracetamol',
  genericName: 'Acetaminophen',
  drugClass: 'Analgesic',
  category: 'Pain Relief',
  viewCount: 100,
}

describe('DrugCard', () => {
  it('should render drug name', () => {
    render(<DrugCard drug={mockDrug as any} />)
    
    expect(screen.getByText('Paracetamol')).toBeInTheDocument()
  })

  it('should display generic name when available', () => {
    render(<DrugCard drug={mockDrug as any} />)
    
    expect(screen.getByText(/Acetaminophen/)).toBeInTheDocument()
  })

  it('should show drug class badge', () => {
    render(<DrugCard drug={mockDrug as any} />)
    
    expect(screen.getByText('Analgesic')).toBeInTheDocument()
  })

  it('should be clickable link', () => {
    render(<DrugCard drug={mockDrug as any} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/drugs/drug-1')
  })

  it('should handle missing optional fields', () => {
    const minimalDrug = {
      id: 'drug-2',
      name: 'Test Drug',
      viewCount: 0,
    }
    
    render(<DrugCard drug={minimalDrug as any} />)
    
    expect(screen.getByText('Test Drug')).toBeInTheDocument()
  })
})