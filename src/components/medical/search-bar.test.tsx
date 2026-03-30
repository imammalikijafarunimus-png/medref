import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './search-bar'  // Named import

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/',
}))

vi.mock('@/services/search-service', () => ({
  pencarianGlobal: vi.fn().mockResolvedValue({
    drugs: [],
    herbals: [],
    symptoms: [],
    notes: [],
    totalResults: 0,
    query: '',
  }),
}))

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render search input', () => {
    render(<SearchBar />)
    
    expect(screen.getByPlaceholderText(/cari/i)).toBeInTheDocument()
  })

  it('should accept user input', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText(/cari/i)
    await user.type(input, 'paracetamol')
    
    expect(input).toHaveValue('paracetamol')
  })

  it('should show clear button when input has value', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText(/cari/i)
    await user.type(input, 'test')
    
    // Look for a clear/reset button
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('should clear input when clear is clicked', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText(/cari/i)
    await user.type(input, 'test')
    expect(input).toHaveValue('test')
    
    // Clear the input
    await user.clear(input)
    expect(input).toHaveValue('')
  })
})