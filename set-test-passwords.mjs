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

async function setTestPasswords() {
  try {
    console.log('Setting test passwords for all users...\n')
    
    // Set password "Test123!" for all users
    const testPassword = 'Test123!'
    const passwordHash = await bcrypt.hash(testPassword, 10)
    
    const users = await sql`
      SELECT id, email, role 
      FROM users
      ORDER BY role
    `
    
    for (const user of users) {
      await sql`
        UPDATE users 
        SET password_hash = ${passwordHash}
        WHERE id = ${user.id}
      `
      console.log(`✅ Password set for ${user.email} (${user.role})`)
    }
    
    console.log('\n🎉 All users now have password: Test123!')
    console.log('\nTest Credentials:')
    console.log('─'.repeat(60))
    users.forEach(user => {
      console.log(`Email: ${user.email}`)
      console.log(`Password: Test123!`)
      console.log(`Role: ${user.role}`)
      console.log('─'.repeat(60))
    })
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

setTestPasswords()
