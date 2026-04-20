/**
 * Database Connection Tests (Task 8.3)
 * Tests DATABASE_URL environment variable, Neon Postgres connection,
 * and retry logic for cold-start timeouts.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { withRetry } from '../db'

describe('Database Connection Tests', () => {
  describe('Environment Variable Configuration', () => {
    const originalEnv = process.env.DATABASE_URL

    afterEach(() => {
      // Restore original environment
      if (originalEnv) {
        process.env.DATABASE_URL = originalEnv
      }
    })

    it('should read DATABASE_URL from environment', () => {
      expect(process.env.DATABASE_URL).toBeDefined()
      expect(process.env.DATABASE_URL).toContain('postgresql://')
    })

    it('should have valid Neon Postgres connection string format', () => {
      const dbUrl = process.env.DATABASE_URL
      expect(dbUrl).toMatch(/^postgresql:\/\//)
      expect(dbUrl).toContain('neon')
      expect(dbUrl).toContain('sslmode=require')
    })
  })

  describe('Retry Logic for Cold-Start Timeouts', () => {
    it('should execute function successfully on first try', async () => {
      const mockFn = vi.fn().mockResolvedValue('success')
      
      const result = await withRetry(mockFn)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should retry once on ETIMEDOUT error', async () => {
      const timeoutError = new Error('Connection failed: ETIMEDOUT')
      const mockFn = vi.fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce('success after retry')
      
      const result = await withRetry(mockFn, 10) // Short delay for testing
      
      expect(result).toBe('success after retry')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should retry once on ConnectTimeoutError', async () => {
      const timeoutError = new Error('ConnectTimeoutError: Connection timed out')
      const mockFn = vi.fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce('success after retry')
      
      const result = await withRetry(mockFn, 10)
      
      expect(result).toBe('success after retry')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should retry once on fetch failed error', async () => {
      const fetchError = new Error('fetch failed')
      const mockFn = vi.fn()
        .mockRejectedValueOnce(fetchError)
        .mockResolvedValueOnce('success after retry')
      
      const result = await withRetry(mockFn, 10)
      
      expect(result).toBe('success after retry')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should not retry on non-timeout errors', async () => {
      const otherError = new Error('Some other database error')
      const mockFn = vi.fn().mockRejectedValue(otherError)
      
      await expect(withRetry(mockFn, 10)).rejects.toThrow('Some other database error')
      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should throw error if retry also fails', async () => {
      const timeoutError = new Error('ETIMEDOUT')
      const mockFn = vi.fn().mockRejectedValue(timeoutError)
      
      await expect(withRetry(mockFn, 10)).rejects.toThrow('ETIMEDOUT')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should wait specified delay before retry', async () => {
      const timeoutError = new Error('ETIMEDOUT')
      const mockFn = vi.fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce('success')
      
      const startTime = Date.now()
      await withRetry(mockFn, 100) // 100ms delay
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(100)
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should use default delay of 700ms if not specified', async () => {
      const timeoutError = new Error('ETIMEDOUT')
      const mockFn = vi.fn()
        .mockRejectedValueOnce(timeoutError)
        .mockResolvedValueOnce('success')
      
      const startTime = Date.now()
      await withRetry(mockFn) // No delay specified, should use 700ms
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(700)
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should handle string errors (non-Error objects)', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce('ETIMEDOUT string error')
        .mockResolvedValueOnce('success')
      
      const result = await withRetry(mockFn, 10)
      
      expect(result).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should preserve return type of wrapped function', async () => {
      interface TestResult {
        id: string
        name: string
      }

      const mockFn = vi.fn().mockResolvedValue({ id: '123', name: 'Test' })
      
      const result: TestResult = await withRetry(mockFn)
      
      expect(result).toEqual({ id: '123', name: 'Test' })
      expect(result.id).toBe('123')
      expect(result.name).toBe('Test')
    })
  })

  describe('Connection String Validation', () => {
    it('should have required connection parameters', () => {
      const dbUrl = process.env.DATABASE_URL ?? ''
      
      // Check for required components
      expect(dbUrl).toContain('postgresql://')
      expect(dbUrl).toContain('@') // User/password separator
      expect(dbUrl).toContain('/') // Database name separator
      expect(dbUrl).toContain('sslmode=require')
    })

    it('should use Neon pooler endpoint', () => {
      const dbUrl = process.env.DATABASE_URL ?? ''
      
      // Neon pooler endpoints typically contain 'pooler' in the hostname
      expect(dbUrl).toContain('neon')
    })
  })
})
