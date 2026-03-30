# Implementation Plan

- [x] 1. Add database schema changes
  - Add `password_hash TEXT` column to the `users` table
  - Create `password_reset_tokens` table with `user_id`, `token_hash`, `expires_at`, `created_at`
  - Add index `idx_prt_user_id` on `password_reset_tokens(user_id)`
  - Create migration file at `scripts/003-custom-auth.sql`
  - _Requirements: 2.1, 7.2_

- [x] 2. Implement core auth library modules
- [x] 2.1 Implement `lib/password.ts`
  - Write `hashPassword(plain: string): Promise<string>` using bcrypt with salt rounds 12
  - Write `verifyPassword(plain: string, hash: string): Promise<boolean>` using bcrypt.compare
  - Write `validatePasswordStrength(password: string): string[]` returning an array of error messages for passwords shorter than 8 chars, missing uppercase, or missing digit
  - _Requirements: 3.2, 3.4, 4.4_

- [x] 2.2 Write property tests for `lib/password.ts`
  - **Property 7: Password hash round-trip** — for any valid password, hash then compare returns true; compare with different string returns false
  - **Property 8: Password validation rejects weak passwords** — for any password missing length/uppercase/digit, validator returns non-empty errors
  - **Validates: Requirements 3.2, 3.4**

- [x] 2.3 Implement `lib/tokens.ts`
  - Write `generateToken(): string` using `crypto.randomBytes(32).toString('hex')`
  - Write `hashToken(raw: string): string` using SHA-256
  - Write `createPasswordResetToken(userId: string, expiryHours: number): Promise<string>` — generates token, stores hash + expiry in DB, returns raw token
  - Write `validateToken(raw: string): Promise<{ userId: string } | null>` — hashes presented token, looks up by hash, checks expiry, returns userId or null
  - Write `consumeToken(raw: string): Promise<boolean>` — validates then deletes the token record
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 2.4 Write property tests for `lib/tokens.ts`
  - **Property 11: Token uniqueness** — two independently generated tokens are never equal
  - **Property 6: Token expiry window** — created token's expires_at is within expected window
  - **Property 12: Token validation round-trip** — valid unexpired token returns userId; wrong token or expired token returns null
  - **Validates: Requirements 7.1, 7.2, 7.3_

- [x] 2.5 Implement `lib/auth.ts` (replace Clerk-based version)
  - Remove all Clerk imports
  - Write `signSession(payload: SessionPayload): Promise<string>` using jose to sign a JWT with HS256
  - Write `verifySession(token: string): Promise<SessionPayload | null>` — verifies JWT, returns payload or null on any error/tamper
  - Write `getCurrentUser(request?: Request): Promise<DbUser | null>` — reads `session` cookie, verifies JWT, queries DB for user
  - Keep existing role helper functions (`hasRole`, `isSuperAdmin`, `isCareHomeAdmin`, `isStaff`)
  - Write `getRedirectForRole(role: UserRole): string` returning the appropriate dashboard path per role
  - _Requirements: 1.1, 1.5, 5.1, 5.2, 6.3, 6.4, 6.5_

- [x] 2.6 Write property tests for `lib/auth.ts`
  - **Property 4: JWT round-trip and tamper detection** — sign then verify returns equivalent payload; tampered JWT returns null
  - **Property 1: Login session round-trip** — valid credentials produce session payload matching user record fields
  - **Validates: Requirements 1.1, 1.5, 5.2**

- [x] 2.7 Implement `lib/email.ts`
  - Write `sendWelcomeEmail(to: string, name: string, setupLink: string): Promise<void>` using Resend
  - Write `sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<void>` using Resend
  - Use `RESEND_API_KEY` from environment variables
  - _Requirements: 2.2, 4.2_

- [x] 3. Implement API routes
- [x] 3.1 Implement `POST /api/auth/login`
  - Accept `{ email, password }` in request body
  - Validate that neither field is empty/whitespace; return 422 with field errors if invalid
  - Look up user by email; if not found return 401 with generic message
  - Check `is_active`; if false return 401 with account-disabled message
  - Call `verifyPassword`; if false return 401 with same generic message as not-found case
  - Sign JWT session, set `session` HTTP-only cookie (Secure, SameSite=Lax, 7-day expiry)
  - Return `{ redirectTo: getRedirectForRole(user.role) }`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6_

- [ ]* 3.2 Write property and unit tests for login API
  - **Property 2: Login error message uniformity** — unknown email and wrong password return identical error strings
  - **Property 3: Login input validation rejects blank fields** — empty/whitespace email or password returns 422
  - Unit test: inactive account returns 401 with disabled message
  - **Validates: Requirements 1.2, 1.3, 1.4, 1.6**

- [x] 3.3 Implement `POST /api/auth/logout`
  - Clear the `session` cookie by setting it with `maxAge=0`
  - Return 200
  - _Requirements: 5.1_

- [x] 3.4 Implement `POST /api/auth/forgot-password`
  - Accept `{ email }` in request body
  - Always return 200 with `{ message: "If that email is registered, you will receive a reset link." }`
  - If email exists in DB: call `createPasswordResetToken` with 1-hour expiry, call `sendPasswordResetEmail`
  - _Requirements: 4.1, 4.2_

- [ ]* 3.5 Write property test for forgot-password API
  - **Property 9: Forgot-password response uniformity** — registered and unregistered emails return identical response shape and status
  - **Validates: Requirements 4.1**

- [x] 3.6 Implement `GET /api/auth/verify-token`
  - Accept `token` as query param
  - Call `validateToken`; return `{ valid: true, email }` or `{ valid: false }`
  - _Requirements: 3.1, 4.3_

- [x] 3.7 Implement `POST /api/auth/reset-password`
  - Accept `{ token, password }` in request body
  - Validate password strength; return 422 with errors if invalid
  - Call `validateToken`; if null return 400 with expiry message
  - Hash new password, update `users` set `password_hash`, `is_verified = true`
  - Call `consumeToken` to delete the token record
  - Return 200
  - _Requirements: 3.2, 3.3, 4.4, 4.5, 7.4_

- [ ]* 3.8 Write property and unit tests for reset-password API
  - **Property 13: Token deletion after use** — after successful reset, same token returns null on next validate
  - Unit test: expired token returns 400
  - Unit test: weak password returns 422
  - **Validates: Requirements 3.2, 3.3, 7.4**

- [x] 4. Rewrite middleware
  - Remove all Clerk imports from `middleware.ts`
  - Read `session` cookie from request
  - Call `verifySession`; if null redirect to `/login`
  - Define route permission map: which roles can access which path prefixes
  - If role not permitted for route, redirect to `/403`
  - Pass user payload to downstream via `x-user-id`, `x-user-role`, `x-care-home-id` request headers
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 4.1 Write property tests for middleware access control
  - **Property 10: Role-based access control decisions** — for any role/route combination, access control function returns allow/deny correctly
  - **Validates: Requirements 6.2**

- [x] 5. Build login page UI
  - Replace `app/(auth)/sign-in/[[...sign-in]]/page.tsx` with a new `app/(auth)/login/page.tsx`
  - Full-page split layout: left panel with brand/illustration, right panel with form card
  - Form fields: email, password (with show/hide toggle), submit button, "Forgot password?" link
  - Use `react-hook-form` + `zod` for client-side validation with inline error messages
  - Show loading spinner on submit button and disable it while request is in flight
  - On success, redirect to the `redirectTo` path returned by the login API
  - On error, display the error message below the form
  - Fully responsive: single-column layout on mobile
  - _Requirements: 1.1, 1.4, 8.1, 8.2, 8.3_

- [x] 6. Build forgot-password and reset-password pages
- [x] 6.1 Build `app/(auth)/forgot-password/page.tsx`
  - Email input field with zod validation
  - On submit, call `POST /api/auth/forgot-password`
  - Show confirmation message after submission regardless of result
  - Link back to login page
  - _Requirements: 4.1_

- [x] 6.2 Build `app/(auth)/reset-password/page.tsx`
  - On mount, call `GET /api/auth/verify-token?token=...` from query param
  - If invalid/expired, show expiry message with link to forgot-password
  - If valid, show password + confirm-password form with strength validation
  - On submit, call `POST /api/auth/reset-password`
  - On success, redirect to `/login` with a success toast
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.3, 4.4, 4.5_

- [x] 7. Remove Clerk and wire everything together
  - Remove `ClerkProvider` from `app/layout.tsx`
  - Remove `@clerk/nextjs` from `package.json` dependencies
  - Update `app/dashboard/layout.tsx` to use `getCurrentUser()` from the new `lib/auth.ts`
  - Update any existing API routes that call Clerk helpers to use the new session-based `getCurrentUser`
  - Add `jose` and `resend` to `package.json` if not already present
  - Install `vitest` and `fast-check` as dev dependencies for testing
  - _Requirements: 1.5, 6.1_

- [ ] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
