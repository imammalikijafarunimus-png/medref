import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState } from './empty-states'

const MockIcon = ({ className }: { className?: string }) => (
  <span className={className} data-testid="mock-icon">📦</span>
)

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('EmptyState', () => {
  it('should render empty state', () => {
    render(<EmptyState icon={MockIcon} title="No Data" />)
    
    // Check for default empty state content
    const container = screen.getByText(/tidak ada/i) || screen.getByRole('img')
    expect(container).toBeDefined()
  })

  it('should render with custom title', () => {
        render(<EmptyState icon={MockIcon} title="Tidak Ada Obat" />)
    
    expect(screen.getByText('Tidak Ada Obat')).toBeInTheDocument()
  })

  it('should render with description', () => {
    render(<EmptyState icon={MockIcon} title="No Description" description="Belum ada obat yang tersedia" />)
    
    expect(screen.getByText('Belum ada obat yang tersedia')).toBeInTheDocument()
  })

  it('should show action button when provided', async () => {
    const onAction = vi.fn()
    render(
      <EmptyState 
        icon={MockIcon}
        title="No Title"
        action={{ label: "Tambah Data", onClick: onAction }}
      />
    )
    
    const button = screen.getByText('Tambah Data')
    expect(button).toBeInTheDocument()
    
    const user = userEvent.setup()
    await user.click(button)
    expect(onAction).toHaveBeenCalled()
  })

  it('should render with icon component', () => {

    
    render(<EmptyState icon={MockIcon} title="No Icon Test" />)
    
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })
})