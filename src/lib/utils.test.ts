// =============================================
// Unit Tests for Utility Functions
// =============================================

import { describe, it, expect } from 'vitest'
import { cn, formatTanggal, formatTanggalSingkat, potongTeks, kapitalDepan } from './utils'

// ─────────────────────────────────────────
// CLASS NAME MERGER TESTS
// ─────────────────────────────────────────

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('text-red-500', 'bg-blue-200')
    expect(result).toContain('text-red-500')
    expect(result).toContain('bg-blue-200')
  })

  it('should handle conditional classes', () => {
    const isActive = true
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('base-class')
    expect(result).toContain('active-class')
  })

  it('should handle false conditional classes', () => {
    const isActive = false
    const result = cn('base-class', isActive && 'active-class')
    expect(result).toContain('base-class')
    expect(result).not.toContain('active-class')
  })

  it('should merge tailwind classes correctly', () => {
    // tailwind-merge should dedupe conflicting classes
    const result = cn('p-4', 'p-2')
    expect(result).toBe('p-2')
  })

  it('should handle empty inputs', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('should handle undefined and null values', () => {
    const result = cn('valid-class', undefined, null, 'another-class')
    expect(result).toContain('valid-class')
    expect(result).toContain('another-class')
  })

  it('should handle object notation', () => {
    const result = cn({
      'active': true,
      'disabled': false,
    })
    expect(result).toContain('active')
    expect(result).not.toContain('disabled')
  })
})

// ─────────────────────────────────────────
// DATE FORMATTING TESTS
// ─────────────────────────────────────────

describe('formatTanggal', () => {
  it('should format date in Indonesian format', () => {
    const date = new Date('2024-01-15')
    const result = formatTanggal(date)
    expect(result).toBe('15 Januari 2024')
  })

  it('should handle different months', () => {
    const months = [
      { date: new Date('2024-01-01'), expected: 'Januari' },
      { date: new Date('2024-02-01'), expected: 'Februari' },
      { date: new Date('2024-03-01'), expected: 'Maret' },
      { date: new Date('2024-04-01'), expected: 'April' },
      { date: new Date('2024-05-01'), expected: 'Mei' },
      { date: new Date('2024-06-01'), expected: 'Juni' },
      { date: new Date('2024-07-01'), expected: 'Juli' },
      { date: new Date('2024-08-01'), expected: 'Agustus' },
      { date: new Date('2024-09-01'), expected: 'September' },
      { date: new Date('2024-10-01'), expected: 'Oktober' },
      { date: new Date('2024-11-01'), expected: 'November' },
      { date: new Date('2024-12-01'), expected: 'Desember' },
    ]

    months.forEach(({ date, expected }) => {
      const result = formatTanggal(date)
      expect(result).toContain(expected)
    })
  })

  it('should handle end of month dates', () => {
    const date = new Date('2024-12-31')
    const result = formatTanggal(date)
    expect(result).toBe('31 Desember 2024')
  })
})

describe('formatTanggalSingkat', () => {
  it('should format date in short Indonesian format', () => {
    const date = new Date('2024-01-15')
    const result = formatTanggalSingkat(date)
    expect(result).toBe('15 Jan 2024')
  })

  it('should use abbreviated month names', () => {
    const date = new Date('2024-09-15')
    const result = formatTanggalSingkat(date)
    expect(result).toContain('Sep')
  })
})

// ─────────────────────────────────────────
// TEXT UTILITIES TESTS
// ─────────────────────────────────────────

describe('potongTeks', () => {
  it('should truncate text longer than specified length', () => {
    const text = 'This is a long text that needs to be truncated'
    const result = potongTeks(text, 20)
    expect(result).toBe('This is a long text ...')
    expect(result.length).toBe(23) // 20 chars + 3 dots
  })

  it('should not truncate text shorter than specified length', () => {
    const text = 'Short text'
    const result = potongTeks(text, 20)
    expect(result).toBe('Short text')
  })

  it('should not truncate text equal to specified length', () => {
    const text = 'Exactly 20 chars!!'
    const result = potongTeks(text, 18)
    expect(result).toBe('Exactly 20 chars!!')
  })

  it('should handle empty string', () => {
    const result = potongTeks('', 10)
    expect(result).toBe('')
  })

  it('should handle zero length', () => {
    const text = 'Any text'
    const result = potongTeks(text, 0)
    expect(result).toBe('...')
  })
})

describe('kapitalDepan', () => {
  it('should capitalize first letter', () => {
    expect(kapitalDepan('hello')).toBe('Hello')
  })

  it('should handle already capitalized text', () => {
    expect(kapitalDepan('Hello')).toBe('Hello')
  })

  it('should only capitalize first letter, not rest', () => {
    expect(kapitalDepan('hELLO wORLD')).toBe('HELLO wORLD')
  })

  it('should handle empty string', () => {
    expect(kapitalDepan('')).toBe('')
  })

  it('should handle single character', () => {
    expect(kapitalDepan('a')).toBe('A')
  })

  it('should preserve numbers', () => {
    expect(kapitalDepan('123abc')).toBe('123abc')
  })
})