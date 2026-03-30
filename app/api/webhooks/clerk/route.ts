import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  // Get the webhook secret from environment
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env')
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook events
  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data
    const email = email_addresses[0]?.email_address

    if (email) {
      // Check if a user with this email exists (was pre-created via invite)
      const existingUser = await sql`
        SELECT * FROM users WHERE email = ${email} AND clerk_id IS NULL
      `

      if (existingUser.length > 0) {
        // Link the Clerk user to the existing database user
        await sql`
          UPDATE users 
          SET clerk_id = ${id}, is_verified = true, last_login_at = NOW()
          WHERE email = ${email}
        `
        console.log(`Linked Clerk user ${id} to existing user ${email}`)
      } else if (public_metadata && (public_metadata as Record<string, unknown>).dbUserId) {
        // User was created via invitation with metadata
        await sql`
          UPDATE users 
          SET clerk_id = ${id}, is_verified = true, last_login_at = NOW()
          WHERE id = ${(public_metadata as Record<string, unknown>).dbUserId}::uuid
        `
        console.log(`Linked Clerk user ${id} via invitation metadata`)
      } else {
        // This is a new user not from our invite system
        // For security, we don't auto-create users - they must be invited
        console.log(`User ${email} signed up but was not invited - they need admin approval`)
      }
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses[0]?.email_address

    // Update user info if they exist
    await sql`
      UPDATE users 
      SET 
        email = COALESCE(${email}, email),
        first_name = COALESCE(${first_name}, first_name),
        last_name = COALESCE(${last_name}, last_name),
        updated_at = NOW()
      WHERE clerk_id = ${id}
    `
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    // Soft delete - set is_active to false instead of deleting
    await sql`
      UPDATE users 
      SET is_active = false, updated_at = NOW()
      WHERE clerk_id = ${id}
    `
  }

  if (eventType === 'session.created') {
    const { user_id } = evt.data

    // Update last login time
    await sql`
      UPDATE users 
      SET last_login_at = NOW()
      WHERE clerk_id = ${user_id}
    `
  }

  return new Response('', { status: 200 })
}
