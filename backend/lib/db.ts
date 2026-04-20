import { neon } from '@neondatabase/serverless'

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')
  return url
}

// Fresh client per request — avoids stale/timed-out connections on Neon serverless
export function getDb() {
  return neon(getDatabaseUrl())
}

// Lazy initialization to avoid requiring DATABASE_URL at build time
let _sql: ReturnType<typeof neon> | null = null

function initSql() {
  if (!_sql) {
    _sql = neon(getDatabaseUrl())
  }
  return _sql
}

// Export sql as a callable function with template literal support
export const sql = ((strings: TemplateStringsArray, ...values: any[]) => {
  return initSql()(strings, ...values)
}) as ReturnType<typeof neon>

// Also expose getSql for explicit usage
export function getSql() {
  return initSql()
}

/**
 * Wraps a DB operation with one automatic retry on Neon cold-start timeout.
 */
export async function withRetry<T>(fn: () => Promise<T>, delayMs = 700): Promise<T> {
  try {
    return await fn()
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    const isTimeout =
      msg.includes('ETIMEDOUT') ||
      msg.includes('ConnectTimeoutError') ||
      msg.includes('fetch failed')
    if (!isTimeout) throw err
    await new Promise(r => setTimeout(r, delayMs))
    return await fn()
  }
}
