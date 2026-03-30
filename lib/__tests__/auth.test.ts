import { describe, it, expect, beforeAll, vi } from 'vitest'
import * as fc from 'fast-check'

// Stub the DB module so lib/auth.ts can be imported without DATABASE_URL
vi.mock('../db', () => ({
  sql: vi.fn(),
}))

// Set required env vars before importing auth
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256'
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test'

import { signSession, verifySession, type SessionPayload, type UserRole } from '../auth'

beforeAll(() => {
  // env vars already set above at module scope
})

const ALL_ROLES: UserRole[] = [
  'super_admin',
  'care_home_admin',
  'manager',
  'senior_carer',
  'carer',
  'nurse',
  'domestic',
  'kitchen',
  'maintenance',
  'admin_staff',
]

// Arbitrary that generates a valid SessionPayload
const sessionPayloadArb = fc.record({
  userId: fc.uuid(),
  email: fc.emailAddress(),
  role: fc.constantFrom(...ALL_ROLES),
  careHomeId: fc.option(fc.uuid(), { nil: null }),
})

// ---------------------------------------------------------------------------
// Feature: custom-authentication, Property 4: JWT round-trip and tamper detection
// ---------------------------------------------------------------------------
describe('Property 4: JWT round-trip and tamper detection', () => {
  it('sign then verify returns equivalent payload', async () => {
    // Validates: Requirements 1.5, 5.2
    await fc.assert(
      fc.asyncProperty(sessionPayloadArb, async (payload) => {
        const token = await signSession(payload)
        const verified = await verifySession(token)

        expect(verified).not.toBeNull()
        expect(verified!.userId).toBe(payload.userId)
        expect(verified!.email).toBe(payload.email)
        expect(verified!.role).toBe(payload.role)
        expect(verified!.careHomeId).toBe(payload.careHomeId)
      }),
      { numRuns: 100 }
    )
  })

  it('tampered JWT returns null', async () => {
    // Validates: Requirements 5.2
    await fc.assert(
      fc.asyncProperty(
        sessionPayloadArb,
        // Arbitrary tamper: flip one character somewhere in the token
        fc.integer({ min: 0, max: 9 }),
        async (payload, offset) => {
          const token = await signSession(payload)
          // Tamper with the signature portion (last segment after final '.')
          const parts = token.split('.')
          const sig = parts[2]
          const idx = offset % sig.length
          const tampered =
            sig.slice(0, idx) +
            (sig[idx] === 'a' ? 'b' : 'a') +
            sig.slice(idx + 1)
          const tamperedToken = [parts[0], parts[1], tampered].join('.')

          const result = await verifySession(tamperedToken)
          expect(result).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ---------------------------------------------------------------------------
// Feature: custom-authentication, Property 1: Login session round-trip
// ---------------------------------------------------------------------------
describe('Property 1: Login session round-trip', () => {
  it('session payload built from user record fields round-trips correctly', async () => {
    // Validates: Requirements 1.1, 1.5
    // The login flow constructs a SessionPayload from the DB user record and signs it.
    // This property verifies that for any user record shape, the payload fields
    // (userId, email, role, careHomeId) survive the sign→verify round-trip intact.
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          email: fc.emailAddress(),
          role: fc.constantFrom(...ALL_ROLES),
          care_home_id: fc.option(fc.uuid(), { nil: null }),
        }),
        async (userRecord) => {
          // Simulate what the login API does: build payload from user record
          const payload: SessionPayload = {
            userId: userRecord.id,
            email: userRecord.email,
            role: userRecord.role,
            careHomeId: userRecord.care_home_id,
          }

          const token = await signSession(payload)
          const verified = await verifySession(token)

          expect(verified).not.toBeNull()
          expect(verified!.userId).toBe(userRecord.id)
          expect(verified!.email).toBe(userRecord.email)
          expect(verified!.role).toBe(userRecord.role)
          expect(verified!.careHomeId).toBe(userRecord.care_home_id)
        }
      ),
      { numRuns: 100 }
    )
  })
})
