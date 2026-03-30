import { neon } from '@neondatabase/serverless'

// Create a reusable SQL client
// Make sure DATABASE_URL is set in your environment variables
const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set')
  }
  return url
}

export const sql = neon(getDatabaseUrl())

// Helper function for transactions
export async function withTransaction<T>(
  callback: (sql: ReturnType<typeof neon>) => Promise<T>
): Promise<T> {
  const client = neon(getDatabaseUrl())
  try {
    await client`BEGIN`
    const result = await callback(client)
    await client`COMMIT`
    return result
  } catch (error) {
    await client`ROLLBACK`
    throw error
  }
}
