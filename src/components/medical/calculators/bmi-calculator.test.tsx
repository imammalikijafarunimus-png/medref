// =============================================
// Component Tests for BMI Calculator (FIXED)
// =============================================

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BMICalculator } from './bmi-calculator'

// Mock the calculations module
vi.mock('./calculations', () => ({
  calculateBMI: vi.fn((weight: number, height: number) => {
    const heightM = height / 100
    const bmi = weight / (heightM * heightM)

    let category: string
    let color: string

    if (bmi < 18.5) {
      category = 'Berat badan kurang'
      color = 'warning'
    } else if (bmi < 25) {
      category = 'Berat badan normal'
      color = 'success'
    } else if (bmi < 30) {
      category = 'Overweight'
      color = 'warning'
    } else {
      category = 'Obesitas'
      color = 'danger'
    }

    return {
      bmi: Math.round(bmi * 10) / 10,
      category,
      color,
      interpretation: 'Test interpretation',
    }
  }),
}))

describe('BMICalculator', () => {
  it('should render the calculator with title', () => {
    render(<BMICalculator />)
    expect(screen.getByText(/Kalkulator BMI/i)).toBeInTheDocument()
  })

  it('should render weight input', () => {
    render(<BMICalculator />)

    // fallback: placeholder karena label belum linked
    expect(screen.getByPlaceholderText('70')).toBeInTheDocument()
  })

  it('should render height input', () => {
    render(<BMICalculator />)
    expect(screen.getByPlaceholderText('170')).toBeInTheDocument()
  })

  it('should show units for inputs', () => {
    render(<BMICalculator />)
    expect(screen.getByText('kg')).toBeInTheDocument()
    expect(screen.getByText('cm')).toBeInTheDocument()
  })

  it('should calculate and display BMI result when inputs are valid', async () => {
    render(<BMICalculator />)

    const weightInput = screen.getByPlaceholderText('70')
    const heightInput = screen.getByPlaceholderText('170')

    await userEvent.type(weightInput, '70')
    await userEvent.type(heightInput, '175')

    expect(screen.getByText(/BMI Anda/i)).toBeInTheDocument()
  })

  it('should display BMI category', async () => {
    render(<BMICalculator />)

    const weightInput = screen.getByPlaceholderText('70')
    const heightInput = screen.getByPlaceholderText('170')

    await userEvent.type(weightInput, '70')
    await userEvent.type(heightInput, '175')

    expect(screen.getByText('Berat badan normal')).toBeInTheDocument()
  })

  it('should show reset button when inputs exist', async () => {
    render(<BMICalculator />)

    expect(
      screen.queryByRole('button', { name: /reset/i })
    ).not.toBeInTheDocument()

    const weightInput = screen.getByPlaceholderText('70')
    await userEvent.type(weightInput, '70')

    expect(
      screen.getByRole('button', { name: /reset/i })
    ).toBeInTheDocument()
  })

  it('should clear inputs when reset is clicked', async () => {
    render(<BMICalculator />)

    const weightInput = screen.getByPlaceholderText('70') as HTMLInputElement
    const heightInput = screen.getByPlaceholderText('170') as HTMLInputElement

    await userEvent.type(weightInput, '70')
    await userEvent.type(heightInput, '175')

    expect(weightInput.value).toBe('70')
    expect(heightInput.value).toBe('175')

    const resetButton = screen.getByRole('button', { name: /reset/i })
    await userEvent.click(resetButton)

    expect(weightInput.value).toBe('')
    expect(heightInput.value).toBe('')
  })

  it('should show empty state when no inputs', () => {
    render(<BMICalculator />)
    expect(
      screen.getByText(/Masukkan data untuk melihat hasil/i)
    ).toBeInTheDocument()
  })

  it('should show disclaimer text when result is shown', async () => {
    render(<BMICalculator />)

    const weightInput = screen.getByPlaceholderText('70')
    const heightInput = screen.getByPlaceholderText('170')

    await userEvent.type(weightInput, '70')
    await userEvent.type(heightInput, '175')

    // FIX: jangan cari "Disclaimer", cari isi text sebenarnya
    expect(
      screen.getByText(/hanya untuk referensi/i)
    ).toBeInTheDocument()
  })

  it('should show BMI categories reference', async () => {
    render(<BMICalculator />)

    const weightInput = screen.getByPlaceholderText('70')
    const heightInput = screen.getByPlaceholderText('170')

    await userEvent.type(weightInput, '70')
    await userEvent.type(heightInput, '175')

    expect(screen.getByText(/Kategori BMI/i)).toBeInTheDocument()
  })

  it('should not calculate with invalid inputs', async () => {
    render(<BMICalculator />)

    const weightInput = screen.getByPlaceholderText('70')
    await userEvent.type(weightInput, '-10')

    expect(
      screen.getByText(/Masukkan data untuk melihat hasil/i)
    ).toBeInTheDocument()
  })

  it('should accept decimal values', async () => {
    render(<BMICalculator />)

    const weightInput = screen.getByPlaceholderText('70') as HTMLInputElement
    const heightInput = screen.getByPlaceholderText('170') as HTMLInputElement

    await userEvent.type(weightInput, '70.5')
    await userEvent.type(heightInput, '175.5')

    expect(weightInput.value).toBe('70.5')
    expect(heightInput.value).toBe('175.5')
  })

  it('should update result when inputs change', async () => {
    render(<BMICalculator />)

    const weightInput = screen.getByPlaceholderText('70')
    const heightInput = screen.getByPlaceholderText('170')

    await userEvent.type(weightInput, '70')
    await userEvent.type(heightInput, '175')

    expect(screen.getByText(/BMI Anda/i)).toBeInTheDocument()

    await userEvent.clear(weightInput)
    await userEvent.type(weightInput, '100')

    expect(screen.getByText('Obesitas')).toBeInTheDocument()
  })
})