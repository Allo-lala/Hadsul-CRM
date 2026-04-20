import { neon } from '@neondatabase/serverless'
import { readFileSync } from 'fs'
import bcrypt from 'bcryptjs'

// Read .env.local manually
const envContent = readFileSync('.env.local', 'utf-8')
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/)
const DATABASE_URL = dbUrlMatch ? dbUrlMatch[1].trim() : null

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

async function createTestUser() {
  try {
    console.log('Creating test user with password...')
    
    // Check if admin@hadsul.com already has a password
    const existingUser = await sql`
      SELECT id, email, password_hash 
      FROM users 
      WHERE email = 'admin@hadsul.com'
    `
    
    if (existingUser.length > 0) {
      const user = existingUser[0]
      
      if (user.password_hash) {
        console.log('✅ User admin@hadsul.com already has a password set')
        console.log('   You can test login with this user')
      } else {
        // Set password to "password123"
        const password = 'password123'
        const passwordHash = await bcrypt.hash(password, 10)
        
        await sql`
          UPDATE users 
          SET password_hash = ${passwordHash}
          WHERE id = ${user.id}
        `
        
        console.log('✅ Password set for admin@hadsul.com')
        console.log('   Email: admin@hadsul.com')
        console.log('   Password: password123')
      }
    } else {
      console.log('❌ User admin@hadsul.com not found')
    }
    
    // Check all users and their password status
    console.log('\n📊 Password status for all users:')
    const allUsers = await sql`
      SELECT email, role, password_hash IS NOT NULL as has_password
      FROM users
      ORDER BY role
    `
    
    allUsers.forEach(user => {
      const status = user.has_password ? '✅ Has password' : '❌ No password'
      console.log(`  ${user.email} (${user.role}): ${status}`)
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

createTestUser()
