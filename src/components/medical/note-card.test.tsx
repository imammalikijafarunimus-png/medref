import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoteCard } from './note-card'  // Named import

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/notes',
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockNote = {
  id: 'note-1',
  title: 'Panduan Klinis Demam',
  category: 'Guideline',
  content: 'Konten lengkap...',
  specialty: 'General',
  tags: '["demam", "pedoman"]',
  version: 1,
  isPublished: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('NoteCard', () => {
  it('should render note title', () => {
    render(<NoteCard note={mockNote as any} />)
    
    expect(screen.getByText('Panduan Klinis Demam')).toBeInTheDocument()
  })

  it('should display category badge', () => {
    render(<NoteCard note={mockNote as any} />)
    
    expect(screen.getByText('Guideline')).toBeInTheDocument()
  })

  it('should be clickable link', () => {
    render(<NoteCard note={mockNote as any} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/notes/note-1')
  })

  it('should handle minimal note data', () => {
    const minimalNote = {
      id: 'note-2',
      title: 'Test Note',
      category: 'General',
      content: 'Content',
      version: 1,
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    render(<NoteCard note={minimalNote as any} />)
    
    expect(screen.getByText('Test Note')).toBeInTheDocument()
  })
})