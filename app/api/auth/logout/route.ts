import { NextResponse } from 'next/server'

const SESSION_COOKIE = 'session'

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 })

  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })

  return response
}
