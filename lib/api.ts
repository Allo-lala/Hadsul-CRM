import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Standard error response helpers (Requirements 9.2, 9.3)
// ---------------------------------------------------------------------------

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message }, { status: 401 })
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message }, { status: 403 })
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ error: message }, { status: 404 })
}

export function conflict(message: string) {
  return NextResponse.json({ error: message }, { status: 409 })
}

export function validationError(errors: Record<string, string>) {
  return NextResponse.json({ errors }, { status: 422 })
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json({ error: message }, { status: 500 })
}

// ---------------------------------------------------------------------------
// Typed client-side fetch helper (Requirements 9.2)
// ---------------------------------------------------------------------------

export interface ApiError {
  error?: string
  errors?: Record<string, string>
}

export interface ApiResult<T> {
  data: T | null
  error: string | null
  status: number
}

/**
 * Typed fetch wrapper for client components.
 * Returns { data, error, status } — never throws.
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    })

    if (res.status === 204) {
      return { data: null, error: null, status: 204 }
    }

    const json = await res.json()

    if (!res.ok) {
      const apiErr = json as ApiError
      const message =
        apiErr.error ??
        (apiErr.errors ? Object.values(apiErr.errors).join(', ') : 'Request failed')
      return { data: null, error: message, status: res.status }
    }

    return { data: json as T, error: null, status: res.status }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { data: null, error: message, status: 0 }
  }
}
