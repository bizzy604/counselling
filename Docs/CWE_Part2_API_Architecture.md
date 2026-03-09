# Counselling and Wellness Ecosystem
## Part II - API Architecture

**Organisation:** Directorate of Counselling and Wellness Services  
**Document Type:** API Architecture Specification  
**Version:** v1.1 - March 2026  
**Classification:** CONFIDENTIAL - Government Internal Use Only

---

## 13. API Executive Summary

The Counselling and Wellness Ecosystem (CWE) exposes a RESTful HTTP/JSON API over HTTPS, versioned at the URI level (`/v1`). The API is implemented inside a single **Next.js 16** application: the App Router serves the Client, Counsellor, Employer, and Admin portals, while Route Handlers expose the REST endpoints consumed by the web UI, the mobile PWA shell, and internal background workers.

The API follows the PRD's two distinct service-access patterns:

1. **Direct booking** - a Client selects an available counsellor slot and creates a confirmed appointment immediately.
2. **Request-driven assignment** - employer referrals, no-slot waitlist requests, specific-counsellor requests, and crisis auto-referrals create a pending counselling request for Admin review and assignment.

Sensitive clinical data is isolated behind single-resource endpoints, encrypted payloads, strict RBAC, and audited access.

---

## 14. API Consumers & Style

### 14.1 Consumers

| Consumer | Description |
|---|---|
| **Next.js 16 Web Application** | Single codebase for all four role-specific portals. Server Components are used for read-heavy dashboards; Client Components are reserved for interactive flows such as booking, mood entry, and crisis progression. |
| **Mobile PWA Shell** | The same Next.js 16 application delivered as a responsive PWA for Android/iOS browsers, optimised for low-bandwidth access. |
| **Notification Worker (Internal)** | Background job runner for email, SMS, and in-app notifications triggered by booking, cancellation, crisis, and follow-up events. |
| **Analytics Worker (Internal)** | Refreshes materialised views, computes export jobs, and updates cached aggregate metrics. |
| **HRMIS (External)** | Identity provider for employee verification and sign-in. Integration supports OAuth2 or SAML, subject to the Directorate's final HRMIS contract. |

### 14.2 API Style - REST over HTTPS

REST is retained over GraphQL or gRPC because:

1. The Directorate's engineering team can operate standard REST stacks without introducing specialised runtime complexity.
2. The main consumer is a browser-delivered application, not a native mobile client.
3. The domain is resource-centric and maps cleanly to stable HTTP endpoints.
4. REST tooling for documentation, contract testing, and government handover remains stronger and easier to audit.

Asynchronous side effects such as notification delivery and analytics export are handled through background jobs rather than synchronous request chains.

### 14.3 Application Stack - Next.js 16

- The UI is built with the Next.js 16 App Router.
- REST endpoints under `/v1/*` are implemented with Next.js Route Handlers.
- `proxy.ts` is used at the network boundary for protected-route enforcement and session-aware routing.
- Turbopack is the default build pipeline.
- Cache Components are enabled selectively for read-heavy dashboards and content pages; mutable workflows remain fully dynamic.

---

## 15. Core Resources

| Resource Domain | Responsibility |
|---|---|
| `/v1/auth` | HRMIS-backed authentication, MFA, token refresh, logout, password-reset broker flow |
| `/v1/users` | Current-user profile reads, admin role management, account activation state |
| `/v1/appointments` | Confirmed appointment lifecycle: create, view, cancel, attendance update |
| `/v1/requests` | Pending counselling requests requiring Admin review and assignment |
| `/v1/counsellors` | Counsellor profile data, specialisations, availability rules, leave periods, open slots |
| `/v1/journal-prompts` | Guided journaling prompt catalogue |
| `/v1/mood` | Mood entry CRUD, journal updates, consent state, voice note upload |
| `/v1/content` | Wellness content CRUD, publishing, assignment, completion, rating, recommendations |
| `/v1/crisis` | Crisis workflow progression plus immutable incident-record generation |
| `/v1/notes` | Session note creation, read, update, and lock operations |
| `/v1/referrals` | Employer referral submission and referral status tracking |
| `/v1/analytics` | Aggregate analytics for Admin and department-level reports for Employers |
| `/v1/notifications` | In-app notification retrieval and delivery-log visibility |

---

## 16. Endpoint Specifications

### 16.1 Authentication

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/auth/hrmis/login` | Initiate HRMIS sign-in | Returns a redirect URL or performs a redirect to HRMIS. Non-HRMIS users are blocked. |
| `GET` | `/v1/auth/hrmis/callback` | Complete HRMIS sign-in | Exchanges HRMIS assertion/code, resolves the CWE user account, and starts the MFA challenge. |
| `POST` | `/v1/auth/mfa/verify` | Submit OTP to complete login | OTP is delivered to the registered email or phone on every interactive login. Returns access token + refresh token on success. |
| `POST` | `/v1/auth/refresh` | Exchange refresh token for a new access token | Refresh tokens are single-use and rotated on success. |
| `POST` | `/v1/auth/logout` | Invalidate the current session | Clears the active session and refresh token lineage. Returns `204`. |
| `POST` | `/v1/auth/password/reset-request` | Request a one-time password-reset link | Sends a single-use reset link to the verified email or phone. Always returns `204` to prevent user enumeration. |
| `POST` | `/v1/auth/password/reset` | Submit reset token and new password | Reset token TTL is 15 minutes and single-use. The call is delegated through the HRMIS identity adapter. |

### 16.2 Appointments

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/appointments` | List appointments for the current user | Client sees own appointments; Counsellor sees assigned appointments; Admin sees all; Employer has no access. |
| `POST` | `/v1/appointments` | Create a direct appointment booking | Client only. Requires `service_type`, `counsellor_id`, and `scheduled_at`. Creates status `SCHEDULED` immediately if the slot is open. |
| `GET` | `/v1/appointments/:id` | Retrieve a single appointment | Visible only to the Client owner, assigned Counsellor, or Admin. |
| `PATCH` | `/v1/appointments/:id/cancel` | Cancel an appointment | Client may cancel only with at least 24 hours notice; Admin may cancel for operational reasons. Cancelled slots become available again. |
| `PATCH` | `/v1/appointments/:id/attendance` | Update attendance status | Counsellor only. Accepted values: `ATTENDED`, `NO_SHOW`, `CANCELLED`. |

### 16.3 Counsellors & Availability

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/counsellors` | List counsellors | Supports filtering by specialisation, language, and current availability. Client responses expose booking-safe profile fields only. |
| `GET` | `/v1/counsellors/:id` | Retrieve a counsellor profile | Used by Client booking flow and Admin assignment flow. |
| `GET` | `/v1/counsellors/:id/availability` | Get open counsellor slots | Returns the next 30 days of open slots after applying recurring hours, leave periods, and existing appointments. |
| `PUT` | `/v1/counsellors/me/availability` | Upsert recurring weekly availability | Counsellor only. Replaces the active working-hours schedule. Changes take effect immediately. |
| `POST` | `/v1/counsellors/me/leave` | Create a leave period | Counsellor only. Body includes `starts_at`, `ends_at`, and optional `reason`. |
| `DELETE` | `/v1/counsellors/me/leave/:leave_id` | Remove a leave period | Counsellor or Admin. Used to restore future availability. |

### 16.4 Counselling Requests

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `POST` | `/v1/requests` | Create a counselling request | Client only. Used for no-slot waitlist, manual assignment, or specific-counsellor requests. Body includes `service_type` and optional preference fields. |
| `GET` | `/v1/requests` | List counselling requests | Admin sees the queue; Client sees own requests. Supports filters for `status`, `source`, and `urgency`. |
| `GET` | `/v1/requests/:id` | Retrieve a counselling request | Visible to owning Client or Admin. Employer visibility is via linked referral records only. |
| `PATCH` | `/v1/requests/:id/assign` | Approve and assign a request | Admin only. Body requires `counsellor_id` and `scheduled_at`. Sets request status to `ASSIGNED` and creates a linked `SCHEDULED` appointment. |
| `PATCH` | `/v1/requests/:id/reject` | Reject a counselling request | Admin only. Body includes `reason`. Notifies the Client and, if applicable, the referring Employer. |

### 16.5 Mood & Journal

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/journal-prompts` | List guided journaling prompts | Query filters: `theme`, `language`, `status`. Client-facing list includes published prompts only. |
| `POST` | `/v1/mood` | Create or upsert the daily mood entry | One entry per Client per UTC day. Request may include `mood_score`, `journal_text`, and `prompt_id`. |
| `GET` | `/v1/mood` | List Client mood entries | Query param: `?days=30|60|90`. Returns summary rows for trend charts. |
| `GET` | `/v1/mood/:id` | Retrieve a single mood entry | Client only, or assigned Counsellor when the Client has granted in-app sharing consent. Admin is denied. |
| `PATCH` | `/v1/mood/:id` | Update journal fields for an entry | Allowed within 24 hours of creation. Supports autosave and optional prompt association. |
| `POST` | `/v1/mood/:id/voice` | Upload a voice note | Client only. Voice note duration is capped at 2 minutes and stored as compressed audio. Playback is available only to the Client. |
| `PUT` | `/v1/mood/consent` | Update counsellor-sharing consent | Client only. Controls whether the assigned Counsellor can view mood history. |

### 16.6 Content Library

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/content` | List content items | Supports `category`, `status`, and pagination filters. Clients can only see published items. |
| `POST` | `/v1/content` | Create a content item | Admin only. Creates a draft item. |
| `PUT` | `/v1/content/:id` | Update a content item | Admin only. Supports versioned edits and status transitions across `DRAFT`, `PUBLISHED`, and `ARCHIVED`. |
| `DELETE` | `/v1/content/:id` | Delete a content item | Admin only. Hard delete is allowed only for draft or archived items with no active assignments; otherwise return `409` and require archiving first. |
| `POST` | `/v1/content/:id/assign` | Assign content to a Client | Counsellor only. Creates a content-assignment record. |
| `PATCH` | `/v1/content/assignments/:id` | Mark content complete and rate usefulness | Client only on own assignments. Body supports `completed` and `rating` (1-5). |
| `GET` | `/v1/content/recommendations` | Get personalised recommendations | Client only. Returns the top 3-5 items using rules based on mood history and completion history. |

### 16.7 Crisis

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `POST` | `/v1/crisis` | Initiate a crisis workflow | Client only. Creates an active `crisis_session`, records SOS activation within 10 seconds, and alerts Admin immediately. |
| `PATCH` | `/v1/crisis/:id/step` | Advance the crisis workflow | Body: `{step: 1..9, data: {...}}`. Steps are sequential and cannot be skipped. Abandonment is logged. |
| `PUT` | `/v1/crisis/:id/safety-plan` | Save the working safety plan | Allowed while workflow status is `ACTIVE`. |
| `POST` | `/v1/crisis/:id/document` | Generate the immutable crisis incident record | Executes Step 8 documentation. Persists an immutable `crisis_event` snapshot and returns `crisis_event_id`. |
| `POST` | `/v1/crisis/:id/follow-up` | Schedule follow-up notifications | Usually called automatically at Step 9 for T+24h, T+72h, and T+7d. |
| `GET` | `/v1/crisis/:id` | Retrieve an active crisis workflow | Client sees own active workflow; assigned Counsellor and Admin see assigned or escalated workflows. |
| `GET` | `/v1/crisis/events/:event_id` | Retrieve the immutable crisis incident record | Assigned Counsellor and Admin only. |

### 16.8 Session Notes

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `POST` | `/v1/notes` | Create a session note | Counsellor only. Linked to `appointment_id`. Stored encrypted at rest and at the application layer. |
| `GET` | `/v1/notes/:id` | Retrieve a session note | Visible to the note-authoring Counsellor. Admin access is allowed only as an audited break-glass read on the single note resource. |
| `PATCH` | `/v1/notes/:id` | Update a draft session note | Counsellor only while note status is `DRAFT`. Supports autosave every 60 seconds. |
| `POST` | `/v1/notes/:id/lock` | Lock a session note | Counsellor only. Sets status `LOCKED` and makes the note immutable. |

### 16.9 Referrals

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `POST` | `/v1/referrals` | Submit an employer referral | Employer only. Creates a referral record plus a linked counselling request with source `EMPLOYER_REFERRAL`. The referred employee is notified. |
| `GET` | `/v1/referrals` | List referrals | Employer sees own submissions; Admin sees all submissions. |
| `GET` | `/v1/referrals/:id` | Retrieve referral detail | Visible to the submitting Employer or Admin. Employer notes are never visible to the Client. |
| `PATCH` | `/v1/referrals/:id/reject` | Reject a referral | Admin only. Rejects both the referral and its linked counselling request. Body includes `reason`. |

### 16.10 Analytics

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/analytics/summary` | Platform KPI summary | Admin only. Returns DAU, session completion rate, active users, crisis-event count, and top-level utilisation. |
| `GET` | `/v1/analytics/mood-trends` | Aggregate mood trends | Admin only. Returns daily average scores, never individual entries. |
| `GET` | `/v1/analytics/content-usage` | Content engagement metrics | Admin only. Returns top-used modules and completion rates. |
| `GET` | `/v1/analytics/utilisation` | Counsellor utilisation metrics | Admin only. Returns per-counsellor bookings, attendance, no-show rate, and active caseload. |
| `GET` | `/v1/analytics/department` | Department wellness report | Employer or Admin. Returns aggregate session counts, service-type breakdown, and utilisation trend for the allowed department scope only. |
| `POST` | `/v1/analytics/exports` | Request a PDF or CSV analytics export | Admin only. Creates an asynchronous export job. |
| `GET` | `/v1/analytics/exports/:job_id` | Poll or download an export job | Returns `{status, url}` when the export is ready. |

### 16.11 Notifications

| Method | Path | Purpose | Notes |
|---|---|---|---|
| `GET` | `/v1/notifications` | List notifications for the current user | Includes in-app notifications and delivery-log status for email/SMS events visible to that user. |
| `PATCH` | `/v1/notifications/:id/read` | Mark an in-app notification as read | Does not alter outbound email or SMS delivery records. |

---

## 17. Request & Response Schema Standards

### 17.1 Standard Success Response

```json
{
  "status": "success",
  "data": {},
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150
  }
}
```

`meta` is omitted for non-list endpoints.

### 17.2 Standard Error Response

```json
{
  "status": "error",
  "code": "APPOINTMENT_NOT_FOUND",
  "message": "Appointment with id 'abc123' was not found.",
  "details": [
    {
      "field": "scheduled_at",
      "issue": "Must be a future datetime"
    }
  ]
}
```

`details` is omitted when not applicable.

### 17.3 HTTP Status Code Standards

| Code | When Used |
|---|---|
| `200 OK` | Successful `GET`, `PATCH`, or `PUT` response with a body |
| `201 Created` | Successful `POST` that created a resource |
| `204 No Content` | Successful mutation with no response body |
| `400 Bad Request` | Validation failure; includes `details` |
| `401 Unauthorised` | Missing, expired, or invalid authentication token |
| `403 Forbidden` | Authenticated but insufficient role or consent |
| `404 Not Found` | Resource does not exist or is not visible to requester |
| `409 Conflict` | State conflict such as double-booking or invalid content deletion |
| `422 Unprocessable Entity` | Semantically invalid request such as a past appointment slot |
| `429 Too Many Requests` | Rate limit exceeded; `Retry-After` header included |
| `500 Internal Server Error` | Unexpected server failure; response includes a `trace_id` |

---

## 18. Authentication & Authorisation

### 18.1 Authentication Flow

- **Primary identity provider:** HRMIS. Users authenticate through HRMIS and are mapped to CWE accounts by `hrmis_id`.
- **MFA:** OTP to the registered email or phone is required on every interactive login.
- **Session model:** access token TTL is 30 minutes, backed by a Redis session record that is invalidated after 30 minutes of inactivity. Refresh token TTL is 7 days, single-use, and rotated on refresh.
- **Password reset:** one-time reset link delivered to verified email or phone, 15-minute TTL, single-use, brokered through the identity adapter that fronts HRMIS.

### 18.2 Role-Based Access Matrix

| Role | Read Access | Conditional Access | Denied Access |
|---|---|---|---|
| **Client** | Own profile, appointments, requests, mood entries, content assignments, notifications | Assigned counsellor profiles and own active crisis workflow | Session notes, other client data, aggregate analytics, employer referral notes |
| **Counsellor** | Own profile, availability, assigned appointments, own notes, assigned crisis workflows and records | Assigned client mood data when the Client has granted in-app consent | Other counsellors' clients, employer referral notes, Admin analytics |
| **Employer** | Own referrals, own department aggregate reports | Referral outcome status for employees they referred | Individual clinical data, mood history, crisis records, session notes |
| **Admin** | Full non-clinical platform data, request queue, referrals, appointments, analytics, note metadata, crisis incident records | Session note content only through audited break-glass single-record access | Routine access to client mood history or journal content |

---

## 19. Versioning & Deprecation

- All endpoints are URI-versioned under `/v1/`.
- Breaking changes require a new major API version with at least 6 months of parallel support.
- Non-breaking additions such as optional fields or new endpoints may ship inside the same major version.
- Deprecated endpoints must return `Deprecation: true` and `Sunset: {date}` headers at least 90 days before removal.

---

## 20. Performance & Rate Limiting

| Concern | Strategy |
|---|---|
| **Standard Rate Limit** | 100 requests per minute per authenticated user |
| **Analytics Export** | 5 export jobs per hour per Admin |
| **Voice Note Upload** | 10 uploads per day per Client |
| **Crisis SOS** | No throttling on `POST /v1/crisis` |
| **Caching** | `GET /v1/content` may be cached for 10 minutes; aggregate analytics endpoints may be cached for 5 minutes |
| **Compression** | Gzip or Brotli compression is enabled for API responses when supported by the client |
| **Pagination** | Default page size 20, maximum 100; cursor pagination is used for large user timelines such as notifications |

---

## 21. Security Considerations

- **Input validation:** all request bodies are validated against strict schemas before reaching domain logic.
- **HRMIS trust boundary:** only HRMIS-verified identities can complete sign-in and receive CWE sessions.
- **Sensitive data exposure:** session note content, journal text, and crisis incident payloads are never returned in list endpoints.
- **Replay protection:** refresh tokens are single-use; reuse of a spent token invalidates the full token family.
- **Break-glass note access:** Admin reads of note content require an explicit audited reason and are limited to single-note retrieval.
- **Audit logging:** all access to session notes, crisis records, referrals, and user PII is logged with `user_id`, IP address, endpoint, and timestamp.
- **Consent enforcement:** counsellor access to mood history requires both an assignment relationship and active client consent.
- **CORS:** only registered CWE front-end domains are allowed; wildcard origins are forbidden.

---

*Document Version: v1.1 - March 2026 - Directorate of Counselling and Wellness Services - CONFIDENTIAL*
