/**
 * Authentication Flow Tests (Task 8.1)
 * Tests authentication with valid/invalid credentials, session management,
 * role-based redirects, and session verification.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 5.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { signSession, verifySession, getRedirectForRole, hasRole, isSuperAdmin, isCareHomeAdmin, isStaff } from '../auth'
import type { SessionPayload, DbUser, UserRole } from '@/shared/types'

describe('Authentication Flow Tests', () => {
  describe('JWT Session Management', () => {
    it('should sign a session payload into a JWT token', async () => {
      const payload: SessionPayload = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'super_admin',
        careHomeId: null,
      }

      const token = await signSession(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should verify a valid JWT token and return payload', async () => {
      const payload: SessionPayload = {
        userId: 'user-456',
        email: 'admin@example.com',
        role: 'care_home_admin',
        careHomeId: 'care-home-1',
      }

      const token = await signSession(payload)
      const verified = await verifySession(token)

      expect(verified).toBeDefined()
      expect(verified?.userId).toBe(payload.userId)
      expect(verified?.email).toBe(payload.email)
      expect(verified?.role).toBe(payload.role)
      expect(verified?.careHomeId).toBe(payload.careHomeId)
    })

    it('should return null for invalid JWT token', async () => {
      const invalidToken = 'invalid.jwt.token'
      const verified = await verifySession(invalidToken)

      expect(verified).toBeNull()
    })

    it('should return null for tampered JWT token', async () => {
      const payload: SessionPayload = {
        userId: 'user-789',
        email: 'staff@example.com',
        role: 'carer',
        careHomeId: 'care-home-2',
      }

      const token = await signSession(payload)
      const tamperedToken = token.slice(0, -5) + 'xxxxx'
      const verified = await verifySession(tamperedToken)

      expect(verified).toBeNull()
    })

    it('should include expiration time in JWT token', async () => {
      const payload: SessionPayload = {
        userId: 'user-exp',
        email: 'exp@example.com',
        role: 'manager',
        careHomeId: null,
      }

      const token = await signSession(payload)
      const verified = await verifySession(token)

      expect(verified?.exp).toBeDefined()
      expect(verified?.iat).toBeDefined()
      
      // Token should expire in approximately 7 days (604800 seconds)
      const expiresIn = (verified?.exp ?? 0) - (verified?.iat ?? 0)
      expect(expiresIn).toBeGreaterThan(604000) // Allow some margin
      expect(expiresIn).toBeLessThan(605000)
    })
  })

  describe('Role-Based Dashboard Redirects', () => {
    it('should redirect super_admin to /dashboard', () => {
      const redirect = getRedirectForRole('super_admin')
      expect(redirect).toBe('/dashboard')
    })

    it('should redirect care_home_admin to /dashboard', () => {
      const redirect = getRedirectForRole('care_home_admin')
      expect(redirect).toBe('/dashboard')
    })

    it('should redirect manager to /dashboard', () => {
      const redirect = getRedirectForRole('manager')
      expect(redirect).toBe('/dashboard')
    })

    it('should redirect staff roles to /dashboard', () => {
      const staffRoles: UserRole[] = [
        'senior_carer',
        'carer',
        'nurse',
        'domestic',
        'kitchen',
        'maintenance',
        'admin_staff',
      ]

      staffRoles.forEach((role) => {
        const redirect = getRedirectForRole(role)
        expect(redirect).toBe('/dashboard')
      })
    })
  })

  describe('Role Permission Checks', () => {
    const mockSuperAdmin: DbUser = {
      id: 'user-1',
      care_home_id: null,
      email: 'super@example.com',
      first_name: 'Super',
      last_name: 'Admin',
      phone: null,
      role: 'super_admin',
      job_title: 'System Administrator',
      department: null,
      is_active: true,
      is_verified: true,
      password_hash: 'hash',
    }

    const mockCareHomeAdmin: DbUser = {
      ...mockSuperAdmin,
      id: 'user-2',
      email: 'carehome@example.com',
      role: 'care_home_admin',
      care_home_id: 'care-home-1',
    }

    const mockStaff: DbUser = {
      ...mockSuperAdmin,
      id: 'user-3',
      email: 'staff@example.com',
      role: 'carer',
      care_home_id: 'care-home-1',
    }

    it('should identify super_admin correctly', () => {
      expect(isSuperAdmin(mockSuperAdmin)).toBe(true)
      expect(isSuperAdmin(mockCareHomeAdmin)).toBe(false)
      expect(isSuperAdmin(mockStaff)).toBe(false)
      expect(isSuperAdmin(null)).toBe(false)
    })

    it('should identify care_home_admin correctly', () => {
      expect(isCareHomeAdmin(mockSuperAdmin)).toBe(true) // super_admin has all permissions
      expect(isCareHomeAdmin(mockCareHomeAdmin)).toBe(true)
      expect(isCareHomeAdmin(mockStaff)).toBe(false)
      expect(isCareHomeAdmin(null)).toBe(false)
    })

    it('should identify staff roles correctly', () => {
      expect(isStaff(mockStaff)).toBe(true)
      expect(isStaff(mockSuperAdmin)).toBe(false)
      expect(isStaff(mockCareHomeAdmin)).toBe(false)
      expect(isStaff(null)).toBe(false)
    })

    it('should check hasRole with multiple allowed roles', () => {
      expect(hasRole(mockSuperAdmin, ['super_admin', 'care_home_admin'])).toBe(true)
      expect(hasRole(mockCareHomeAdmin, ['super_admin', 'care_home_admin'])).toBe(true)
      expect(hasRole(mockStaff, ['super_admin', 'care_home_admin'])).toBe(false)
      expect(hasRole(null, ['super_admin'])).toBe(false)
    })
  })

  describe('Session Cookie Validation', () => {
    it('should create session with correct structure', async () => {
      const payload: SessionPayload = {
        userId: 'user-session',
        email: 'session@example.com',
        role: 'manager',
        careHomeId: 'care-home-3',
      }

      const token = await signSession(payload)
      const verified = await verifySession(token)

      expect(verified).toMatchObject({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        careHomeId: payload.careHomeId,
      })
    })

    it('should handle null careHomeId correctly', async () => {
      const payload: SessionPayload = {
        userId: 'user-no-home',
        email: 'nohome@example.com',
        role: 'super_admin',
        careHomeId: null,
      }

      const token = await signSession(payload)
      const verified = await verifySession(token)

      expect(verified?.careHomeId).toBeNull()
    })
  })
})
