import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
config({ path: resolve(__dirname, '.env.local') })

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    env: {
      JWT_SECRET: process.env.JWT_SECRET || 'test-jwt-secret-for-testing-only',
      DATABASE_URL: process.env.DATABASE_URL || '',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
      '@/frontend': resolve(__dirname, './frontend'),
      '@/backend': resolve(__dirname, './backend'),
      '@/shared': resolve(__dirname, './shared'),
    },
  },
})
