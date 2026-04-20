/**
 * Middleware Role-Based Access Control Tests (Task 8.1 & 8.2)
 * Tests session verification on protected routes and role-based permissions.
 * 
 * Requirements: 5.1, 5.2
 */

import { describe, it, expect } from 'vitest'
import { isRolePermitted } from '../auth'
import type { UserRole } from '@/shared/types'

describe('Middleware Role-Based Access Control', () => {
  describe('Super Admin Access', () => {
    it('should allow super_admin to access all routes', () => {
      const paths = [
        '/dashboard',
        '/dashboard/users',
        '/dashboard/care-homes',
        '/dashboard/reports',
        '/dashboard/calendar',
        '/dashboard/staff',
        '/api/users/invite',
        '/api/care-homes',
      ]

      paths.forEach((path) => {
        expect(isRolePermitted('super_admin', path)).toBe(true)
      })
    })
  })

  describe('Care Home Admin Access', () => {
    it('should allow care_home_admin to access dashboard/users', () => {
      expect(isRolePermitted('care_home_admin', '/dashboard/users')).toBe(true)
    })

    it('should allow care_home_admin to access dashboard/reports', () => {
      expect(isRolePermitted('care_home_admin', '/dashboard/reports')).toBe(true)
    })

    it('should allow care_home_admin to access general dashboard', () => {
      expect(isRolePermitted('care_home_admin', '/dashboard')).toBe(true)
      expect(isRolePermitted('care_home_admin', '/dashboard/calendar')).toBe(true)
      expect(isRolePermitted('care_home_admin', '/dashboard/staff')).toBe(true)
    })

    it('should deny care_home_admin access to dashboard/care-homes', () => {
      expect(isRolePermitted('care_home_admin', '/dashboard/care-homes')).toBe(false)
    })

    it('should allow care_home_admin to access api/users/invite', () => {
      expect(isRolePermitted('care_home_admin', '/api/users/invite')).toBe(true)
    })
  })

  describe('Manager Access', () => {
    it('should allow manager to access dashboard/users', () => {
      expect(isRolePermitted('manager', '/dashboard/users')).toBe(true)
    })

    it('should allow manager to access dashboard/reports', () => {
      expect(isRolePermitted('manager', '/dashboard/reports')).toBe(true)
    })

    it('should allow manager to access general dashboard', () => {
      expect(isRolePermitted('manager', '/dashboard')).toBe(true)
      expect(isRolePermitted('manager', '/dashboard/calendar')).toBe(true)
    })

    it('should deny manager access to dashboard/care-homes', () => {
      expect(isRolePermitted('manager', '/dashboard/care-homes')).toBe(false)
    })

    it('should allow manager to access api/users/invite', () => {
      expect(isRolePermitted('manager', '/api/users/invite')).toBe(true)
    })
  })

  describe('Staff Role Access', () => {
    const staffRoles: UserRole[] = [
      'senior_carer',
      'carer',
      'nurse',
      'domestic',
      'kitchen',
      'maintenance',
      'admin_staff',
    ]

    it('should allow staff to access general dashboard', () => {
      staffRoles.forEach((role) => {
        expect(isRolePermitted(role, '/dashboard')).toBe(true)
        expect(isRolePermitted(role, '/dashboard/calendar')).toBe(true)
        expect(isRolePermitted(role, '/dashboard/clock')).toBe(true)
        expect(isRolePermitted(role, '/dashboard/profile')).toBe(true)
      })
    })

    it('should deny staff access to dashboard/users', () => {
      staffRoles.forEach((role) => {
        expect(isRolePermitted(role, '/dashboard/users')).toBe(false)
      })
    })

    it('should deny staff access to dashboard/care-homes', () => {
      staffRoles.forEach((role) => {
        expect(isRolePermitted(role, '/dashboard/care-homes')).toBe(false)
      })
    })

    it('should deny staff access to dashboard/reports', () => {
      staffRoles.forEach((role) => {
        expect(isRolePermitted(role, '/dashboard/reports')).toBe(false)
      })
    })

    it('should deny staff access to api/users/invite', () => {
      staffRoles.forEach((role) => {
        expect(isRolePermitted(role, '/api/users/invite')).toBe(false)
      })
    })
  })

  describe('Route Specificity', () => {
    it('should use most specific route rule', () => {
      // /dashboard/users is more specific than /dashboard
      expect(isRolePermitted('carer', '/dashboard')).toBe(true)
      expect(isRolePermitted('carer', '/dashboard/users')).toBe(false)
    })

    it('should handle query parameters correctly', () => {
      expect(isRolePermitted('manager', '/dashboard/users?page=1')).toBe(true)
      expect(isRolePermitted('carer', '/dashboard/users?page=1')).toBe(false)
    })

    it('should handle nested paths correctly', () => {
      expect(isRolePermitted('manager', '/dashboard/reports/finance')).toBe(true)
      expect(isRolePermitted('carer', '/dashboard/reports/finance')).toBe(false)
    })
  })

  describe('Public Routes', () => {
    it('should allow all roles to access unprotected routes by default', () => {
      const roles: UserRole[] = ['super_admin', 'care_home_admin', 'manager', 'carer']
      
      roles.forEach((role) => {
        // Routes without explicit rules should be allowed
        expect(isRolePermitted(role, '/some-public-route')).toBe(true)
      })
    })
  })
})
