# Requirements Document

## Introduction

This document defines the requirements for replacing the existing Clerk-based authentication system in the Hadsul Care Home CRM with a fully custom authentication architecture. The system supports three distinct user tiers — Super Admin, Care Home Admin, and Staff — each with different access levels and capabilities. Users are never self-registered; they are always created by an administrator. Password setup and recovery are handled via time-limited email links sent through Resend. The login experience must be visually polished and professional.

## Glossary

- **System**: The Hadsul Care Home CRM application
- **Super Admin**: A platform-level administrator with access to all care homes and system-wide settings
- **Care Home Admin**: An administrator scoped to a single care home, able to manage staff within that home
- **Staff**: A non-admin user (e.g. carer, nurse, manager) scoped to a single care home
- **Session**: A server-side authenticated session created upon successful login, stored as a secure HTTP-only cookie
- **Password Reset Token**: A cryptographically random, single-use, time-limited token sent via email to allow a user to set or reset their password
- **Resend**: The third-party email delivery service used to send transactional emails
- **JWT**: JSON Web Token used to encode session identity
- **Role**: A named permission level assigned to a user (super_admin, care_home_admin, manager, senior_carer, carer, nurse, domestic, kitchen, maintenance, admin_staff)
- **Invited User**: A user whose account has been created by an admin but who has not yet set a password
- **Active User**: A user whose account is active and who has completed password setup
- **Password Hash**: A bcrypt-hashed representation of a user's password stored in the database

---

## Requirements

### Requirement 1

**User Story:** As any user (Super Admin, Care Home Admin, or Staff), I want to log in with my email and password, so that I can access the features relevant to my role.

#### Acceptance Criteria

1. WHEN a user submits a valid email and password combination, THE System SHALL authenticate the user, create a session, and redirect the user to their role-appropriate dashboard.
2. WHEN a user submits an email that does not exist in the system, THE System SHALL return a generic error message without revealing whether the email exists.
3. WHEN a user submits a correct email but incorrect password, THE System SHALL return a generic error message without revealing which field is incorrect.
4. WHEN a user submits an empty email or empty password field, THE System SHALL prevent form submission and display inline field validation errors.
5. WHILE a session is active, THE System SHALL maintain the authenticated state across page navigations without requiring re-login.
6. WHEN a login attempt is made for an account with `is_active = false`, THE System SHALL reject the login and display an account-disabled message.

---

### Requirement 2

**User Story:** As a Super Admin or Care Home Admin, I want to create user accounts for staff members, so that staff can access the system without self-registering.

#### Acceptance Criteria

1. WHEN an admin submits a new user form with valid email, name, role, and care home assignment, THE System SHALL create a user record in the database with `is_verified = false` and no password hash.
2. WHEN a new user record is created, THE System SHALL generate a Password Reset Token, store it with an expiry of 24 hours, and send a welcome email via Resend containing a password setup link.
3. WHEN a Super Admin creates a user, THE System SHALL allow assignment of any role and any care home.
4. WHEN a Care Home Admin creates a user, THE System SHALL restrict the new user's care home assignment to the Care Home Admin's own care home.
5. IF an admin attempts to create a user with an email that already exists in the system, THEN THE System SHALL reject the request and display a duplicate email error.

---

### Requirement 3

**User Story:** As a newly invited user, I want to set my password using the link sent to my email, so that I can activate my account and log in.

#### Acceptance Criteria

1. WHEN a user visits a valid, unexpired password setup link, THE System SHALL display a password creation form.
2. WHEN a user submits a new password that meets the minimum requirements (at least 8 characters, at least one uppercase letter, at least one number), THE System SHALL hash the password using bcrypt, store it, mark `is_verified = true`, invalidate the token, and redirect the user to the login page.
3. WHEN a user visits a password setup link that has expired or has already been used, THE System SHALL display an expiry message and offer a link to request a new setup email.
4. IF a submitted password does not meet the minimum requirements, THEN THE System SHALL display specific inline validation errors without submitting the form.

---

### Requirement 4

**User Story:** As a user who has forgotten their password, I want to request a password reset link via email, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN a user submits their email on the forgot-password page, THE System SHALL always display a confirmation message regardless of whether the email exists, to prevent user enumeration.
2. WHEN a user submits a valid registered email on the forgot-password page, THE System SHALL generate a Password Reset Token, store it with a 1-hour expiry, and send a reset email via Resend.
3. WHEN a user visits a valid, unexpired password reset link, THE System SHALL display a password reset form.
4. WHEN a user submits a new password via the reset form that meets the minimum requirements, THE System SHALL update the password hash, invalidate the token, and redirect the user to the login page.
5. WHEN a user visits a password reset link that has expired or has already been used, THE System SHALL display an expiry message and offer a link to request a new reset email.

---

### Requirement 5

**User Story:** As an authenticated user, I want to log out of the system, so that my session is terminated and my account is protected.

#### Acceptance Criteria

1. WHEN a user clicks the logout action, THE System SHALL invalidate the server-side session, clear the session cookie, and redirect the user to the login page.
2. WHEN a session cookie is tampered with or invalid, THE System SHALL treat the request as unauthenticated and redirect to the login page.

---

### Requirement 6

**User Story:** As the system, I want to enforce role-based access control on all protected routes, so that users can only access features appropriate to their role.

#### Acceptance Criteria

1. WHEN an unauthenticated request is made to any protected route, THE System SHALL redirect the request to the login page.
2. WHEN an authenticated user attempts to access a route outside their role's permitted scope, THE System SHALL return a 403 response or redirect to an appropriate error page.
3. WHILE a Super Admin session is active, THE System SHALL permit access to all routes including system-wide administration pages.
4. WHILE a Care Home Admin session is active, THE System SHALL restrict data access to records belonging to that admin's care home only.
5. WHILE a Staff session is active, THE System SHALL restrict access to staff-level routes and data scoped to their assigned care home.

---

### Requirement 7

**User Story:** As a developer, I want the password reset token system to use a secure, auditable token format, so that tokens cannot be guessed or reused.

#### Acceptance Criteria

1. WHEN a Password Reset Token is generated, THE System SHALL use a cryptographically random value of at least 32 bytes encoded as a hex string.
2. WHEN a Password Reset Token is stored, THE System SHALL store a hashed version of the token in the database alongside the expiry timestamp and the associated user ID.
3. WHEN a token is presented for validation, THE System SHALL compare the presented token against the stored hash and reject the token if the expiry timestamp has passed.
4. WHEN a token is successfully used, THE System SHALL delete the token record from the database immediately.

---

### Requirement 8

**User Story:** As a user, I want the login page to be visually polished and professional, so that the system feels trustworthy and modern.

#### Acceptance Criteria

1. WHEN the login page is rendered, THE System SHALL display the Hadsul brand logo, a centered card layout, email and password input fields, a submit button, and a "Forgot password?" link.
2. WHEN the login page is rendered on a mobile viewport (width below 768px), THE System SHALL display a fully responsive layout with no horizontal overflow.
3. WHEN a form submission is in progress, THE System SHALL display a loading indicator on the submit button and disable the button to prevent duplicate submissions.
