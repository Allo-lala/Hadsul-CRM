import { Resend } from 'resend'

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY environment variable is not set')
  return new Resend(apiKey)
}

const FROM_ADDRESS = 'Hadsul CRM <noreply@hadsul.com>'

/**
 * Sends a welcome email to a newly invited user with their account setup link.
 */
export async function sendWelcomeEmail(
  to: string,
  name: string,
  setupLink: string
): Promise<void> {
  const resend = getResendClient()

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Welcome to Hadsul CRM — Set up your account',
    html: `
      <p>Hi ${name},</p>
      <p>Your account has been created on the Hadsul Care Home CRM.</p>
      <p>Please click the link below to set your password and activate your account. This link expires in 24 hours.</p>
      <p><a href="${setupLink}">Set up my account</a></p>
      <p>If you did not expect this email, please ignore it.</p>
    `,
  })
}

/**
 * Sends a password reset email with a time-limited reset link.
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetLink: string
): Promise<void> {
  const resend = getResendClient()

  await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Hadsul CRM — Reset your password',
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your password.</p>
      <p>Click the link below to choose a new password. This link expires in 1 hour.</p>
      <p><a href="${resetLink}">Reset my password</a></p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
    `,
  })
}
