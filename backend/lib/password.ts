import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hashes a plain-text password using bcrypt with 12 salt rounds.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

/**
 * Compares a plain-text password against a stored bcrypt hash.
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/**
 * Validates password strength.
 * Returns an array of human-readable error messages.
 * An empty array means the password is valid.
 */
export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long.')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.')
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number.')
  }

  return errors
}
