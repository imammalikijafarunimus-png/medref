// =============================================
// Password Utilities
// =============================================
// Secure password hashing and validation

import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hash a plain text password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Password strength checker
 * Returns a score from 0-4 and feedback
 */
export function checkPasswordStrength(password: string): {
  score: number
  feedback: string[]
  isStrong: boolean
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (password.length < 8) feedback.push('Minimal 8 karakter')

  // Character variety
  if (/[A-Z]/.test(password)) score++
  else feedback.push('Tambahkan huruf besar')

  if (/[a-z]/.test(password)) score++
  else feedback.push('Tambahkan huruf kecil')

  if (/[0-9]/.test(password)) score++
  else feedback.push('Tambahkan angka')

  if (/[^A-Za-z0-9]/.test(password)) score++
  else feedback.push('Tambahkan karakter khusus')

  // Common patterns to avoid
  const commonPatterns = [
    'password',
    '123456',
    'qwerty',
    'abc123',
    'letmein',
    'admin',
    'welcome',
  ]

  const lowercasePassword = password.toLowerCase()
  for (const pattern of commonPatterns) {
    if (lowercasePassword.includes(pattern)) {
      score = Math.max(0, score - 2)
      feedback.push('Hindari kata-kata umum')
      break
    }
  }

  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1)
    feedback.push('Hindari karakter berulang')
  }

  return {
    score: Math.min(4, score),
    feedback,
    isStrong: score >= 4,
  }
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 16): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  const allChars = uppercase + lowercase + numbers + symbols

  let password = ''

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}