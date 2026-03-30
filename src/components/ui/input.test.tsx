import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './input'

describe('Input', () => {
  it('should render input element', () => {
    render(<Input placeholder="Enter text" />)
    
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('should handle value changes', async () => {
    const handleChange = vi.fn()
    
    render(<Input onChange={handleChange} />)
    
    const user = userEvent.setup()
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('should apply custom className', () => {
    render(<Input className="custom-class" />)
    
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('custom-class')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Input disabled />)
    
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('should support different types', () => {
    render(<Input type="number" />)
    
    const input = screen.getByRole('spinbutton')
    expect(input).toHaveAttribute('type', 'number')
  })

  it('should support file input', () => {
    render(<Input type="file" />)
    
    const input = document.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
  })
})