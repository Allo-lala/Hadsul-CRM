# Implementation Plan

- [x] 1. Create shared types and API utilities
  - Create `lib/types.ts` with `CareHome`, `StaffMember`, `ClockRecord`, `DashboardStats` interfaces
  - Create `lib/api.ts` with a typed `apiRequest` helper and standard error response helpers (`unauthorized`, `forbidden`, `notFound`, `validationError`, `serverError`)
  - All API routes must import from these helpers to ensure consistent error shapes
  - _Requirements: 9.2, 9.3_

- [x] 2. Implement Care Homes API and wire the Care Homes page
- [x] 2.1 Implement `GET /api/care-homes` and `POST /api/care-homes`
  - GET: verify session, assert super_admin role, query all care homes with joined staff_count and clocked_in_count
  - POST: validate required fields (name, address, city, postcode, cqc_registration_number, capacity), check for duplicate CQC number, insert record
  - _Requirements: 1.1, 1.4, 1.5, 9.2_

- [x] 2.2 Implement `GET /api/care-homes/[id]` and `PATCH /api/care-homes/[id]`
  - GET: return single care home with assigned admin details
  - PATCH: validate fields, update record, return updated care home
  - _Requirements: 1.2, 2.2_

- [ ]* 2.3 Write property test for care home creation and uniqueness
  - **Property 9: Duplicate CQC registration rejection** — for any two care homes, their CQC numbers must be distinct
  - **Property 8: Super admin sees all care homes** — GET /api/care-homes returns every care home in the DB
  - **Validates: Requirements 1.4, 1.5**

- [x] 2.4 Replace mock data in `app/dashboard/care-homes/page.tsx` with real API calls
  - Fetch from `GET /api/care-homes` on page load using `useEffect`
  - Wire the Add Care Home form to `POST /api/care-homes` with loading state and error display
  - Wire the edit/suspend actions to `PATCH /api/care-homes/[id]`
  - Compute and display the 4 KPI stat cards from real API response data
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 3. Implement Staff API and wire the Staff pages
- [x] 3.1 Implement `GET /api/staff` and `POST /api/staff`
  - GET: verify session, scope by care_home_id for care_home_admin, return all for super_admin; join with current clock status and hours today/week
  - POST: validate required fields, check duplicate email, create user with is_verified=false and password_hash=null, generate 24h token, send welcome email
  - _Requirements: 3.1, 3.2, 3.5, 9.2, 9.4_

- [x] 3.2 Implement `GET /api/staff/[id]` and `PATCH /api/staff/[id]`
  - GET: return staff profile with clock history for past 30 days, hours this week, hours this month
  - PATCH: validate fields, update record; if is_active set to false prevent login
  - _Requirements: 3.3, 3.4, 7.1, 7.2, 7.3_

- [ ]* 3.3 Write property tests for staff API
  - **Property 1: Tenant isolation on staff queries** — care home admin only receives staff with matching care_home_id
  - **Property 10: Staff creation sets unverified state** — created staff always has is_verified=false and password_hash=null
  - **Validates: Requirements 3.1, 3.2, 9.4**

- [x] 3.4 Replace mock data in `app/dashboard/staff/page.tsx` with real API calls
  - Fetch from `GET /api/staff` on page load
  - Wire Add Staff form to `POST /api/staff` — include all fields from Requirement 3.1 plus standard role options (HCA, MHA, Support Worker, Nurse, Cleaner, Team Leader, Kitchen Assistant) and a custom role input
  - Wire deactivate action to `PATCH /api/staff/[id]` with `{ is_active: false }`
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [x] 3.5 Build `app/dashboard/staff/[id]/page.tsx` — staff profile detail page
  - Display all fields from Requirement 7.1
  - Display clock history table for past 30 days (date, clock-in, clock-out, hours)
  - Display hours this week and this month summary cards
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 4. Implement Clock In/Out API and wire the Clock page
- [x] 4.1 Implement `GET /api/clock/status`, `POST /api/clock/in`, `POST /api/clock/out`
  - GET status: return current open clock record for the authenticated user (or null)
  - POST clock/in: check for existing open record (reject with 409 if found), insert new clock record with clock_in_time = NOW(), detect late arrival vs scheduled shift
  - POST clock/out: find open record, set clock_out_time = NOW(), calculate total_hours_worked = EXTRACT(EPOCH FROM (clock_out_time - clock_in_time)) / 3600
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 4.2 Implement late detection in clock-in route
  - Query the shifts table for a shift on today's date assigned to this user
  - If clock_in_time > shift.start_time + 15 minutes, mark the clock record with a `is_late` flag and insert a notification for the care home admin
  - _Requirements: 4.5, 5.4_

- [ ]* 4.3 Write property tests for clock in/out logic
  - **Property 3: Duplicate clock-in prevention** — user with open record cannot clock in again
  - **Property 4: Clock-out closes the open record** — after clock-out, zero open records remain for that user
  - **Property 5: Late detection threshold** — clock_in > shift_start + 15min marks record as late
  - **Property 6: Hours calculation correctness** — total_hours_worked = (clock_out - clock_in) in decimal hours ±0.01
  - **Validates: Requirements 4.2, 4.4, 4.5**

- [x] 4.4 Replace mock data in `app/dashboard/clock/page.tsx` with real API calls
  - On mount, call `GET /api/clock/status` to determine if user is clocked in
  - If clocked in, start a local 1-second interval timer from the stored clock_in_time
  - Wire Clock In button to `POST /api/clock/in`, Clock Out button to `POST /api/clock/out`
  - Display real clock history from `GET /api/staff/[id]` (current user's records)
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 5. Implement live admin attendance panel
- [x] 5.1 Implement `GET /api/clock/live`
  - Verify session, assert admin role, scope by care_home_id
  - Return all open clock records for the care home joined with user name and role
  - Include computed elapsed_minutes for each record
  - _Requirements: 5.1, 5.2, 9.4_

- [ ]* 5.2 Write property test for live attendance
  - **Property 2: Tenant isolation on clock records** — all records returned by /api/clock/live have care_home_id matching the requesting admin
  - **Property 7: Care home stats aggregation** — clocked_in_count equals count of open clock records for that care home
  - **Validates: Requirements 5.1, 5.2, 9.4**

- [x] 5.3 Build live attendance panel component `components/dashboard/live-attendance.tsx`
  - Display each clocked-in staff member: name, role, clock-in time, live elapsed timer (updated every second client-side)
  - Show late badge for records marked is_late
  - Poll `GET /api/clock/live` every 30 seconds to refresh the list
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 6. Implement Dashboard Stats API and wire the main dashboard
- [x] 6.1 Implement `GET /api/dashboard/stats`
  - For super_admin: return total_staff, total_care_homes, clocked_in_now (all homes), hours_today (all homes)
  - For care_home_admin: return total_staff (their home), clocked_in_now, late_today, expected_not_in, hours_today
  - _Requirements: 5.1, 6.1, 9.2, 9.4_

- [x] 6.2 Implement `GET /api/dashboard/activity`
  - Return 20 most recent clock-in and clock-out events
  - Super admin: across all care homes (include care home name in each record)
  - Care home admin: scoped to their care home
  - _Requirements: 6.3, 9.4_

- [ ]* 6.3 Write property test for dashboard stats
  - **Property 7: Care home stats aggregation** — clocked_in_count in stats equals count of open clock records
  - **Property 8: Super admin sees all care homes** — super admin stats reflect all homes
  - **Validates: Requirements 5.1, 6.1**

- [x] 6.4 Replace mock data in `app/dashboard/page.tsx` with real API calls
  - Fetch from `GET /api/dashboard/stats` and render into `KPICards` component with real values
  - Fetch from `GET /api/dashboard/activity` and render into `ActivityFeed` component
  - For care home admin: embed the `LiveAttendance` component
  - For super admin: show per-care-home summary panel from `GET /api/care-homes`
  - _Requirements: 5.1, 5.2, 6.1, 6.2, 6.3_

- [x] 7. Wire sidebar and header to authenticated user
- [x] 7.1 Update `app/dashboard/layout.tsx` to fetch current user server-side
  - Call `getCurrentUser()` in the layout server component
  - Pass user data (name, role, care_home_id, care home name) as props to `Sidebar` and `Header`
  - _Requirements: 8.4_

- [x] 7.2 Update `components/dashboard/sidebar.tsx` to accept and display real user data
  - Replace hardcoded "John Doe / Care Home Admin" with props from the authenticated user
  - Show care home name for care_home_admin/staff, "Platform Admin" for super_admin
  - Render role-scoped nav items: super_admin sees Care Homes + All Staff + Platform Reports; care_home_admin sees Staff + Clock + Rota + Reports; staff sees only Clock + My Schedule + My Profile
  - Wire the logout button to call `POST /api/auth/logout` then redirect to `/login`
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 7.3 Update `components/dashboard/header.tsx` to accept and display real user data
  - Replace hardcoded name/role with props
  - Wire the logout dropdown item to call `POST /api/auth/logout` then redirect to `/login`
  - _Requirements: 8.4, 8.5_

- [x] 8. Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Final wiring and polish
- [x] 9.1 Add care home name lookup to dashboard layout
  - When user has a care_home_id, query the care_homes table for the name and pass it to the sidebar
  - _Requirements: 8.4_

- [x] 9.2 Add `is_late` column to clock_records table via migration
  - Create `scripts/004-clock-late-flag.sql` with `ALTER TABLE clock_records ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT false`
  - Update `scripts/seed.mjs` to run the new migration
  - _Requirements: 4.5_

- [x] 9.3 Ensure all dashboard pages redirect unauthenticated users
  - Confirm middleware covers all `/dashboard/*` routes
  - Test that a request without a session cookie is redirected to `/login`
  - _Requirements: 6.1, 9.2_

- [x] 10. Final Checkpoint — ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
