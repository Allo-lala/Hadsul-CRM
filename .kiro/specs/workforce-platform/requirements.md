# Requirements Document

## Introduction

This document defines the requirements for the Hadsul Care Home Workforce Platform — a multi-tenant CRM for UK care homes. The platform supports three user tiers: Super Admin (platform-wide oversight), Care Home Admin (scoped to their care home), and Staff (individual workers). Super Admins manage care homes and assign their admins. Care Home Admins manage their staff, view live clock-in activity, and monitor workforce metrics. Staff clock in and out and view their own schedules. All data is scoped by care home to ensure tenant isolation.

## Glossary

- **System**: The Hadsul Care Home Workforce Platform
- **Super Admin**: A platform-level administrator with access to all care homes and system-wide data
- **Care Home Admin**: An administrator scoped to a single care home; manages staff and views home-level data
- **Staff Member**: A non-admin worker assigned to a care home (HCA, MHA, Support Worker, Nurse, Cleaner, Team Leader, Kitchen Assistant, or custom role)
- **Care Home**: A registered care facility managed within the platform
- **Clock Record**: A timestamped record of a staff member clocking in or out of a care home
- **Shift**: A scheduled work period assigned to a staff member at a care home
- **Live Dashboard**: A real-time view of current clock-in status, hours worked, and attendance for a care home
- **Role**: A job title/profession assigned to a staff member (system roles: super_admin, care_home_admin, manager; staff roles: HCA, MHA, support_worker, nurse, cleaner, team_leader, kitchen_assistant, or custom)
- **Tenant Isolation**: The guarantee that a Care Home Admin or Staff Member can only access data belonging to their assigned care home
- **KPI**: Key Performance Indicator — a summary metric shown on dashboards
- **Occupancy**: The ratio of current residents to total bed capacity at a care home

---

## Requirements

### Requirement 1

**User Story:** As a Super Admin, I want to create and manage care homes, so that I can onboard new facilities onto the platform.

#### Acceptance Criteria

1. WHEN a Super Admin submits a new care home form with name, address, city, postcode, phone, email, CQC registration number, and bed capacity, THE System SHALL create a care home record in the database and display it in the care homes list.
2. WHEN a Super Admin edits an existing care home's details, THE System SHALL update the record and reflect the changes immediately in the UI.
3. WHEN a Super Admin sets a care home status to suspended or inactive, THE System SHALL prevent staff of that care home from logging in and display the status change in the care homes list.
4. IF a Super Admin submits a care home form with a duplicate CQC registration number, THEN THE System SHALL reject the submission and display a duplicate registration error.
5. WHEN the care homes list is rendered, THE System SHALL display total care homes count, total occupancy across all homes, total staff count, and count of homes rated Good or Outstanding by CQC.

---

### Requirement 2

**User Story:** As a Super Admin, I want to assign a Care Home Admin to each care home, so that each facility has a dedicated administrator.

#### Acceptance Criteria

1. WHEN a Super Admin creates a user with role care_home_admin and assigns a care home, THE System SHALL link that user to the specified care home and send them a welcome email with a password setup link.
2. WHEN a Super Admin views a care home's detail page, THE System SHALL display the assigned Care Home Admin's name and contact details.
3. IF a Super Admin attempts to assign a care_home_admin role to a user without specifying a care home, THEN THE System SHALL reject the request and display a validation error.

---

### Requirement 3

**User Story:** As a Care Home Admin, I want to add and manage staff members for my care home, so that I can maintain an accurate workforce record.

#### Acceptance Criteria

1. WHEN a Care Home Admin submits a new staff member form with first name, last name, email, role, and optional fields (phone, job title, department, hourly rate, contract hours, contract type), THE System SHALL create a user record scoped to the Care Home Admin's care home, set is_verified to false, and send a welcome email with a password setup link.
2. WHEN a Care Home Admin views the staff list, THE System SHALL display only staff members assigned to that Care Home Admin's care home.
3. WHEN a Care Home Admin edits a staff member's details, THE System SHALL update the record and reflect changes immediately.
4. WHEN a Care Home Admin deactivates a staff member, THE System SHALL set is_active to false and prevent that staff member from logging in.
5. IF a Care Home Admin attempts to add a staff member with an email that already exists in the system, THEN THE System SHALL reject the request and display a duplicate email error.
6. WHEN a Care Home Admin assigns a role to a staff member, THE System SHALL allow selection from the standard roles (HCA, MHA, Support Worker, Nurse, Cleaner, Team Leader, Kitchen Assistant) and allow entry of a custom role name.

---

### Requirement 4

**User Story:** As a Staff Member, I want to clock in and out of my shift, so that my working hours are accurately recorded.

#### Acceptance Criteria

1. WHEN a Staff Member clicks the clock-in button, THE System SHALL record a clock_in_time timestamp, associate the record with the staff member's care home, and display a live running timer showing elapsed time.
2. WHEN a Staff Member clicks the clock-out button while clocked in, THE System SHALL record a clock_out_time timestamp, calculate total_hours_worked, and stop the timer.
3. WHILE a Staff Member is clocked in, THE System SHALL display the elapsed time as a live incrementing counter updated every second.
4. IF a Staff Member attempts to clock in when they already have an open clock record with no clock_out_time, THEN THE System SHALL prevent the duplicate clock-in and display an already-clocked-in message.
5. WHEN a Staff Member clocks in more than 15 minutes after their scheduled shift start time, THE System SHALL mark the clock record as late and notify the Care Home Admin.

---

### Requirement 5

**User Story:** As a Care Home Admin, I want a live dashboard showing real-time staff attendance, so that I can monitor who is on site at any moment.

#### Acceptance Criteria

1. WHEN a Care Home Admin views the dashboard, THE System SHALL display the count of staff currently clocked in, count of staff expected but not yet clocked in, count of late arrivals, and total hours worked today across all staff.
2. WHEN a Care Home Admin views the live attendance panel, THE System SHALL display each clocked-in staff member's name, role, clock-in time, and a live elapsed time counter.
3. WHEN a staff member clocks in or out, THE System SHALL update the Care Home Admin's dashboard within 30 seconds without requiring a full page reload.
4. WHEN a staff member clocks in late, THE System SHALL display a late badge next to that staff member's entry on the admin dashboard and add a notification to the admin's notification feed.
5. WHEN a Care Home Admin views the hours summary, THE System SHALL display total hours worked per staff member for the current day and current week.

---

### Requirement 6

**User Story:** As a Super Admin, I want a platform-wide dashboard showing aggregated metrics across all care homes, so that I can monitor overall system performance.

#### Acceptance Criteria

1. WHEN a Super Admin views the dashboard, THE System SHALL display total staff count across all care homes, total care homes count, total staff currently clocked in across all homes, and total hours worked today platform-wide.
2. WHEN a Super Admin views the care homes summary panel, THE System SHALL display each care home's name, current clocked-in staff count, and occupancy percentage.
3. WHEN a Super Admin views the activity feed, THE System SHALL display the 20 most recent clock-in and clock-out events across all care homes, each showing staff name, care home name, event type, and timestamp.

---

### Requirement 7

**User Story:** As a Care Home Admin, I want to view detailed staff profiles, so that I can access employment and contact information quickly.

#### Acceptance Criteria

1. WHEN a Care Home Admin opens a staff member's profile, THE System SHALL display the staff member's full name, role, department, phone, email, contract type, contract hours, hourly rate, start date, and current status.
2. WHEN a Care Home Admin views a staff member's profile, THE System SHALL display the staff member's clock-in history for the past 30 days including date, clock-in time, clock-out time, and total hours worked per day.
3. WHEN a Care Home Admin views a staff member's profile, THE System SHALL display the staff member's total hours worked in the current week and current month.

---

### Requirement 8

**User Story:** As any authenticated user, I want the dashboard navigation and layout to reflect my role and care home context, so that I only see features relevant to my access level.

#### Acceptance Criteria

1. WHEN a Super Admin is logged in, THE System SHALL display navigation items for Care Homes, All Staff, Platform Reports, and User Management.
2. WHEN a Care Home Admin is logged in, THE System SHALL display navigation items scoped to their care home: Staff, Clock In/Out, Rota, Reports, and Settings.
3. WHEN a Staff Member is logged in, THE System SHALL display only Clock In/Out, My Schedule, and My Profile navigation items.
4. WHEN any authenticated user views the sidebar, THE System SHALL display the user's full name, role label, and care home name (or "Platform Admin" for Super Admins).
5. WHEN any authenticated user clicks the logout button in the sidebar or header, THE System SHALL call the logout API, clear the session cookie, and redirect to the login page.

---

### Requirement 9

**User Story:** As a developer, I want all dashboard data to be fetched from the database via typed API routes, so that the UI reflects real data and not hardcoded mock values.

#### Acceptance Criteria

1. WHEN any dashboard page loads, THE System SHALL fetch its data from a dedicated API route that queries the Neon PostgreSQL database.
2. WHEN an API route receives a request, THE System SHALL verify the session JWT, extract the user's role and care_home_id, and scope all database queries to the authenticated user's permitted data.
3. WHEN a database query fails, THE System SHALL return a structured error response with an appropriate HTTP status code and log the error server-side.
4. WHEN a Care Home Admin's API request is processed, THE System SHALL filter all query results by the care_home_id stored in the session payload, preventing cross-tenant data access.
