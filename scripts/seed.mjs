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
 * Split a SQL file into individual statements, handling $ dollar-quoted blocks.
 */
function splitStatements(content) {
  const statements = []
  let current = ''
  let inDollarQuote = false
  let dollarTag = ''
  let i = 0

  while (i < content.length) {
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
      if (
        err.message.includes('already exists') ||
        err.message.includes('duplicate') ||
        err.code === '42710' ||
        err.code === '42P07'
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

  console.log('\n  Super Admin credentials:')
  console.log('  Email:    admin@hadsul.com')
  console.log('  Password: Admin1234!')
}

async function seedHavonCareHome() {
  console.log('\n▶ Seeding Havon Care Home...')

  // Insert care home
  const existingHome = await sql`SELECT id FROM care_homes WHERE cqc_registration_number = 'CQC-HAV-2024' LIMIT 1`
  let careHomeId

  if (existingHome.length > 0) {
    careHomeId = existingHome[0].id
    console.log('  ✓ Havon Care Home already exists')
  } else {
    const homeRows = await sql`
      INSERT INTO care_homes (name, address, city, postcode, phone, email, cqc_registration_number, capacity, status, cqc_rating)
      VALUES (
        'Havon Care Home',
        '14 Elmwood Avenue',
        'Manchester',
        'M14 5RQ',
        '0161 234 5678',
        'info@havoncare.co.uk',
        'CQC-HAV-2024',
        45,
        'active',
        'Good'
      )
      RETURNING id
    `
    careHomeId = homeRows[0].id
    console.log('  ✓ Havon Care Home created')
  }

  // Create care home admin
  const adminEmail = 'admin@havoncare.co.uk'
  const adminPassword = 'Havon1234!'
  const adminHash = await bcrypt.hash(adminPassword, 12)

  const existingAdmin = await sql`SELECT id FROM users WHERE email = ${adminEmail} LIMIT 1`
  if (existingAdmin.length > 0) {
    await sql`
      UPDATE users SET password_hash = ${adminHash}, is_verified = true, is_active = true, care_home_id = ${careHomeId}
      WHERE email = ${adminEmail}
    `
    console.log('  ✓ Havon admin already exists — updated')
  } else {
    await sql`
      INSERT INTO users (email, first_name, last_name, role, care_home_id, is_active, is_verified, password_hash)
      VALUES ('admin@havoncare.co.uk', 'Sarah', 'Mitchell', 'care_home_admin', ${careHomeId}, true, true, ${adminHash})
    `
    console.log('  ✓ Havon care home admin created (Sarah Mitchell)')
  }

  // Create sample staff members
  const staffMembers = [
    { email: 'james.carter@havoncare.co.uk', first_name: 'James', last_name: 'Carter', role: 'nurse', job_title: 'Senior Nurse', department: 'Nursing', contract_type: 'full_time', contract_hours: 37.5, hourly_rate: 18.50 },
    { email: 'priya.sharma@havoncare.co.uk', first_name: 'Priya', last_name: 'Sharma', role: 'carer', job_title: 'Healthcare Assistant', department: 'Care', contract_type: 'full_time', contract_hours: 37.5, hourly_rate: 12.00 },
    { email: 'tom.walsh@havoncare.co.uk', first_name: 'Tom', last_name: 'Walsh', role: 'carer', job_title: 'Healthcare Assistant', department: 'Care', contract_type: 'part_time', contract_hours: 20, hourly_rate: 12.00 },
    { email: 'linda.osei@havoncare.co.uk', first_name: 'Linda', last_name: 'Osei', role: 'senior_carer', job_title: 'Senior Carer', department: 'Care', contract_type: 'full_time', contract_hours: 37.5, hourly_rate: 14.50 },
    { email: 'mark.jones@havoncare.co.uk', first_name: 'Mark', last_name: 'Jones', role: 'kitchen', job_title: 'Kitchen Assistant', department: 'Catering', contract_type: 'part_time', contract_hours: 25, hourly_rate: 11.50 },
  ]

  const staffPassword = 'Staff1234!'
  const staffHash = await bcrypt.hash(staffPassword, 12)

  for (const member of staffMembers) {
    const existing = await sql`SELECT id FROM users WHERE email = ${member.email} LIMIT 1`
    if (existing.length > 0) {
      console.log(`  ✓ ${member.first_name} ${member.last_name} already exists`)
      continue
    }
    await sql`
      INSERT INTO users (
        email, first_name, last_name, role, care_home_id,
        job_title, department, contract_type, contract_hours, hourly_rate,
        is_active, is_verified, password_hash
      ) VALUES (
        ${member.email}, ${member.first_name}, ${member.last_name}, ${member.role}, ${careHomeId},
        ${member.job_title}, ${member.department}, ${member.contract_type},
        ${member.contract_hours}, ${member.hourly_rate},
        true, true, ${staffHash}
      )
    `
    console.log(`  ✓ ${member.first_name} ${member.last_name} created`)
  }

  console.log('\n  Havon Care Home credentials:')
  console.log('  Admin email:    admin@havoncare.co.uk')
  console.log('  Admin password: Havon1234!')
  console.log('  Staff password: Staff1234! (all staff members)')
}

async function main() {
  console.log(' Hadsul CRM — Database Seed')
  console.log('================================')

  await runFile('001 — Create tables',   join(__dirname, '001-create-tables.sql'))
  await runFile('002 — Seed data',       join(__dirname, '002-seed-data.sql'))
  await runFile('003 — Custom auth',     join(__dirname, '003-custom-auth.sql'))
  await runFile('004 — Clock late flag', join(__dirname, '004-clock-late-flag.sql'))
  await runFile('005 — Care home logo',  join(__dirname, '005-care-home-logo.sql'))
  await seedSuperAdmin()
  await seedHavonCareHome()

  console.log('\n✅ Done. You can now run the app and log in.\n')
}

main().catch((err) => {
  console.error('\n❌ Seed failed:', err.message)
  process.exit(1)
})
