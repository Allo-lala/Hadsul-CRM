import { neon } from '@neondatabase/serverless'

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL environment variable is not set')
  return url
}

// Fresh client per request — avoids stale connections on Neon serverless
// fetchConnectionCache: false prevents connection reuse that causes ETIMEDOUT
export function getDb() {
  return neon(getDatabaseUrl(), { fetchConnectionCache: false })
}

export const sql = neon(getDatabaseUrl(), { fetchConnectionCache: false })
