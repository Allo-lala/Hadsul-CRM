/**
 * Database seed script
 * Usage: node scripts/seed.mjs
 */

import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
try {
  const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf8')
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
} catch {
  console.error('Could not read .env.local')
  process.exit(1)
}

const { neon } = require('@neondatabase/serverless')
const bcrypt = require('bcryptjs')

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set in .env.local')
  process.exit(1)
}

const sql = neon(DATABASE_URL)

/**
 * Split a SQL file into individual statements, handling $$ dollar-quoted blocks.
 */
function splitStatements(content) {
  const statements = []
  let current = ''
  let inDollarQuote = false
  let dollarTag = ''
  let i = 0

  while (i < content.length) {
    // Check for dollar-quote start/end
    if (!inDollarQuote) {
      const dollarMatch = content.slice(i).match(/^(\$[^$]*\$)/)
      if (dollarMatch) {
        dollarTag = dollarMatch[1]
        inDollarQuote = true
        current += dollarTag
        i += dollarTag.length
        continue
      }
    } else {
      if (content.slice(i).startsWith(dollarTag)) {
        current += dollarTag
        i += dollarTag.length
        inDollarQuote = false
        dollarTag = ''
        continue
      }
    }

    const char = content[i]

    if (char === ';' && !inDollarQuote) {
      const stmt = current.trim()
      if (stmt) statements.push(stmt)
      current = ''
    } else {
      current += char
    }
    i++
  }

  const remaining = current.trim()
  if (remaining) statements.push(remaining)

  return statements.filter(s => s.length > 0)
}

async function runFile(label, filePath) {
  console.log(`\n▶ Running ${label}...`)
  const content = readFileSync(filePath, 'utf8')
  const statements = splitStatements(content)
  let ok = 0
  let skipped = 0

  for (const stmt of statements) {
    try {
      await sql(stmt)
      ok++
    } catch (err) {
      // Ignore "already exists" type errors
      if (
        err.message.includes('already exists') ||
        err.message.includes('duplicate') ||
        err.code === '42710' || // duplicate_object
        err.code === '42P07'    // duplicate_table
      ) {
        skipped++
      } else {
        console.warn(`  ⚠ Skipped statement: ${err.message.split('\n')[0]}`)
        skipped++
      }
    }
  }

  console.log(`  ✓ ${ok} statements executed, ${skipped} skipped`)
}

async function seedSuperAdmin() {
  console.log('\n▶ Creating super admin user...')

  const email = 'admin@hadsul.com'
  const password = 'Admin1234!'
  const passwordHash = await bcrypt.hash(password, 12)

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`

  if (existing.length > 0) {
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, is_verified = true, is_active = true
      WHERE email = ${email}
    `
    console.log('  ✓ Super admin already exists — password hash updated')
  } else {
    await sql`
      INSERT INTO users (email, first_name, last_name, role, is_active, is_verified, password_hash)
      VALUES ('admin@hadsul.com', 'Super', 'Admin', 'super_admin', true, true, ${passwordHash})
    `
    console.log('  ✓ Super admin created')
  }

  console.log('\n  Login credentials:')
  console.log('  Email:    admin@hadsul.com')
  console.log('  Password: Admin1234!')
}

async function main() {
  console.log('🌱 Hadsul CRM — Database Seed')
  console.log('================================')

  await runFile('001 — Create tables', join(__dirname, '001-create-tables.sql'))
  await runFile('002 — Seed data',     join(__dirname, '002-seed-data.sql'))
  await runFile('003 — Custom auth',   join(__dirname, '003-custom-auth.sql'))
  await seedSuperAdmin()

  console.log('\n✅ Done. You can now run the app and log in.\n')
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message)
  process.exit(1)
})
