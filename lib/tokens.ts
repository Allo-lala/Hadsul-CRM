import crypto from 'crypto'
import { sql } from './db'

/**
 * Generates a cryptographically random token as a 64-char hex string (32 bytes).
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hashes a raw token string using SHA-256, returning a hex digest.
 */
export function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

/**
 * Creates a password reset token for the given user, stores the hash + expiry
 * in the database, and returns the raw (unhashed) token.
 */
export async function createPasswordResetToken(
  userId: string,
  expiryHours: number
): Promise<string> {
  const raw = generateToken()
  const tokenHash = hashToken(raw)
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000)

  await sql`
    INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
    VALUES (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `

  return raw
}

/**
 * Validates a raw token by hashing it, looking it up in the DB, and checking expiry.
 * Returns the associated userId on success, or null if invalid/expired.
 */
export async function validateToken(raw: string): Promise<{ userId: string } | null> {
  const tokenHash = hashToken(raw)

  const rows = await sql`
    SELECT user_id, expires_at
    FROM password_reset_tokens
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `

  if (rows.length === 0) return null

  const row = rows[0] as { user_id: string; expires_at: string }
  const expiresAt = new Date(row.expires_at)

  if (expiresAt <= new Date()) return null

  return { userId: row.user_id }
}

/**
 * Validates a raw token and, if valid, deletes it from the database (single-use).
 * Returns true if the token was valid and consumed, false otherwise.
 */
export async function consumeToken(raw: string): Promise<boolean> {
  const result = await validateToken(raw)
  if (!result) return false

  const tokenHash = hashToken(raw)
  await sql`
    DELETE FROM password_reset_tokens WHERE token_hash = ${tokenHash}
  `

  return true
}
