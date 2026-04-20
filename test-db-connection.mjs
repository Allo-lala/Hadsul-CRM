import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'

// Read .env.local manually
const envContent = readFileSync('.env.local', 'utf-8')
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1].trim() : null

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    const result = await sql`SELECT NOW() as current_time`
    console.log('✅ Database connection successful!')
    console.log('Current time:', result[0].current_time)
    
    // Check if users table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `
    
    if (tables.length > 0) {
      console.log('✅ Users table exists')
      
      // Count users
      const userCount = await sql`SELECT COUNT(*) as count FROM users`
      console.log(`📊 Total users in database: ${userCount[0].count}`)
      
      // List users (without passwords)
      const users = await sql`
        SELECT id, email, first_name, last_name, role, is_active 
        FROM users 
        LIMIT 10
      `
      
      if (users.length > 0) {
        console.log('\n👥 Users in database:')
        users.forEach(user => {
          console.log(`  - ${user.email} (${user.role}) - Active: ${user.is_active}`)
        })
      } else {
        console.log('⚠️  No users found in database')
      }
    } else {
      console.log('❌ Users table does not exist - run database migrations first')
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

testConnection()
