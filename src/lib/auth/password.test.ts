// =============================================
// Unit Tests for Password Utilities
// =============================================

import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword, checkPasswordStrength, generateSecurePassword } from './password'

// ─────────────────────────────────────────
// PASSWORD HASHING TESTS
// ─────────────────────────────────────────

describe('hashPassword', () => {
  it('should hash a password', async () => {
    const password = 'mySecurePassword123'
    const hash = await hashPassword(password)

    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should generate different hashes for same password', async () => {
    const password = 'mySecurePassword123'
    const hash1 = await hashPassword(password)
    const hash2 = await hashPassword(password)

    // Different salts should produce different hashes
    expect(hash1).not.toBe(hash2)
  })

  it('should produce bcrypt hash format', async () => {
    const hash = await hashPassword('test')
    // bcrypt hashes start with $2a$, $2b$, or $2y$
    expect(hash).toMatch(/^\$2[aby]\$/)
  })
})

describe('verifyPassword', () => {
  it('should verify correct password', async () => {
    const password = 'mySecurePassword123'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject incorrect password', async () => {
    const password = 'mySecurePassword123'
    const hash = await hashPassword(password)

    const isValid = await verifyPassword('wrongPassword', hash)
    expect(isValid).toBe(false)
  })

  it('should reject empty password', async () => {
    const hash = await hashPassword('password123')

    const isValid = await verifyPassword('', hash)
    expect(isValid).toBe(false)
  })

  it('should handle similar but different passwords', async () => {
    const password = 'password123'
    const hash = await hashPassword(password)

    expect(await verifyPassword('password124', hash)).toBe(false)
    expect(await verifyPassword('Password123', hash)).toBe(false)
    expect(await verifyPassword('password12', hash)).toBe(false)
  })
})

// ─────────────────────────────────────────
// PASSWORD STRENGTH TESTS
// ─────────────────────────────────────────

describe('checkPasswordStrength', () => {
  describe('weak passwords', () => {
    it('should detect short password', () => {
      const result = checkPasswordStrength('abc')
      expect(result.feedback).toContain('Minimal 8 karakter')
      expect(result.isStrong).toBe(false)
    })

    it('should detect missing uppercase', () => {
      const result = checkPasswordStrength('lowercase123')
      expect(result.feedback).toContain('Tambahkan huruf besar')
    })

    it('should detect missing lowercase', () => {
      const result = checkPasswordStrength('UPPERCASE123')
      expect(result.feedback).toContain('Tambahkan huruf kecil')
    })

    it('should detect missing numbers', () => {
      const result = checkPasswordStrength('NoNumbers')
      expect(result.feedback).toContain('Tambahkan angka')
    })

    it('should detect missing special characters', () => {
      const result = checkPasswordStrength('Password123')
      expect(result.feedback).toContain('Tambahkan karakter khusus')
    })
  })

  describe('common patterns', () => {
    it('should detect password in password', () => {
      const result = checkPasswordStrength('mypassword123')
      expect(result.feedback).toContain('Hindari kata-kata umum')
    })

    it('should detect 123456 pattern', () => {
      const result = checkPasswordStrength('MyPassword123456')
      expect(result.feedback).toContain('Hindari kata-kata umum')
    })

    it('should detect qwerty pattern', () => {
      const result = checkPasswordStrength('qwertyPassword1')
      expect(result.feedback).toContain('Hindari kata-kata umum')
    })

    it('should detect admin pattern', () => {
      const result = checkPasswordStrength('admin123Password')
      expect(result.feedback).toContain('Hindari kata-kata umum')
    })
  })

  describe('repeated characters', () => {
    it('should detect repeated characters', () => {
      const result = checkPasswordStrength('Passwoooord123!')
      expect(result.feedback).toContain('Hindari karakter berulang')
    })
  })

  describe('strong passwords', () => {
    it('should approve strong password', () => {
      const result = checkPasswordStrength('MyStr0ng!Pass')
      expect(result.isStrong).toBe(true)
      expect(result.score).toBeGreaterThanOrEqual(4)
    })

    it('should approve password with all requirements', () => {
      const result = checkPasswordStrength('Abcd123!@#$')
      expect(result.score).toBeGreaterThanOrEqual(4)
    })

    it('should have score between 0-4', () => {
      const weak = checkPasswordStrength('a')
      const strong = checkPasswordStrength('MyV3ryStr0ng!Pass')

      expect(weak.score).toBeGreaterThanOrEqual(0)
      expect(weak.score).toBeLessThanOrEqual(4)
      expect(strong.score).toBeGreaterThanOrEqual(0)
      expect(strong.score).toBeLessThanOrEqual(4)
    })
  })

  describe('edge cases', () => {
    it('should handle empty string', () => {
      const result = checkPasswordStrength('')
      expect(result.score).toBe(0)
      expect(result.isStrong).toBe(false)
      expect(result.feedback.length).toBeGreaterThan(0)
    })

    it('should handle very long password', () => {
      const longPassword = 'A'.repeat(100) + 'a1!'
      const result = checkPasswordStrength(longPassword)
      expect(result).toBeDefined()
    })
  })
})

// ─────────────────────────────────────────
// SECURE PASSWORD GENERATOR TESTS
// ─────────────────────────────────────────

describe('generateSecurePassword', () => {
  it('should generate password of specified length', () => {
    const password = generateSecurePassword(16)
    expect(password.length).toBe(16)
  })

  it('should generate different passwords each time', () => {
    const password1 = generateSecurePassword()
    const password2 = generateSecurePassword()
    expect(password1).not.toBe(password2)
  })

  it('should default to 16 characters', () => {
    const password = generateSecurePassword()
    expect(password.length).toBe(16)
  })

  it('should include uppercase letter', () => {
    const password = generateSecurePassword(20)
    expect(/[A-Z]/.test(password)).toBe(true)
  })

  it('should include lowercase letter', () => {
    const password = generateSecurePassword(20)
    expect(/[a-z]/.test(password)).toBe(true)
  })

  it('should include number', () => {
    const password = generateSecurePassword(20)
    expect(/[0-9]/.test(password)).toBe(true)
  })

  it('should include special character', () => {
    const password = generateSecurePassword(20)
    expect(/[^A-Za-z0-9]/.test(password)).toBe(true)
  })

  it('should generate strong password', () => {
    const password = generateSecurePassword(20)
    const strength = checkPasswordStrength(password)
    expect(strength.isStrong).toBe(true)
  })

  it('should handle minimum length', () => {
    // Even with length 4, should have at least one of each type
    const password = generateSecurePassword(4)
    expect(password.length).toBe(4)
    expect(/[A-Z]/.test(password)).toBe(true)
    expect(/[a-z]/.test(password)).toBe(true)
    expect(/[0-9]/.test(password)).toBe(true)
    expect(/[^A-Za-z0-9]/.test(password)).toBe(true)
  })

  it('should handle longer lengths', () => {
    const password = generateSecurePassword(32)
    expect(password.length).toBe(32)
  })
})