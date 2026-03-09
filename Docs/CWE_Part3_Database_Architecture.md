# Counselling and Wellness Ecosystem
## Part III - Database Architecture

**Organisation:** Directorate of Counselling and Wellness Services  
**Document Type:** Database Architecture Specification  
**Version:** v1.1 - March 2026  
**Classification:** CONFIDENTIAL - Government Internal Use Only

---

## 22. Database Executive Summary

The CWE data layer uses **PostgreSQL 15** as the primary OLTP database. The production deployment must run in **Kenya-based data centre infrastructure** to satisfy the PRD's data-residency requirement. **Redis** is used for session state, OTP challenges, rate-limiting counters, and job-queue coordination. A **Kenya-resident S3-compatible object store** holds voice notes, content media, and generated analytics exports.

At v1.0 scale, PostgreSQL also hosts the analytics materialised-view layer. This keeps the initial platform architecture operationally simple while preserving a clean migration path to a dedicated analytics store if utilisation materially outgrows the OLTP cluster.

Two modelling decisions resolve the main specification conflicts:

1. **Appointments** store only confirmed sessions. Pending Admin review is modelled in a dedicated `counselling_requests` table.
2. **Crisis workflows** are tracked in a mutable `crisis_sessions` table, while the immutable incident record required by the PRD is stored in `crisis_events`.

---

## 23. Key Entities & Relationships

### 23.1 Entity Relationship Summary

The domain is anchored on `users`, with one-to-one extension tables for `clients`, `counsellors`, and `employers`. Service delivery splits into two related but distinct paths:

- **Direct appointment path:** a Client books a confirmed slot directly into `appointments`.
- **Admin-managed request path:** `counselling_requests` captures pending demand from self-service requests, employer referrals, and crisis auto-referrals; Admin assignment creates downstream `appointments`.

Clinical artefacts are partitioned by purpose: `session_notes` for counsellor notes, `mood_entries` for daily journaling, `crisis_sessions` for active workflow state, and `crisis_events` for immutable crisis records.

| From Entity | Relationship | Cardinality |
|---|---|---|
| `users` | users -> clients | One-to-one |
| `users` | users -> counsellors | One-to-one |
| `users` | users -> employers | One-to-one |
| `clients` | clients -> counselling_requests | One-to-many |
| `clients` | clients -> appointments | One-to-many |
| `counsellors` | counsellors -> appointments | One-to-many |
| `counselling_requests` | requests -> appointments | One-to-one optional |
| `employers` | employers -> referrals | One-to-many |
| `referrals` | referrals -> counselling_requests | One-to-one |
| `appointments` | appointments -> session_notes | One-to-many |
| `clients` | clients -> mood_entries | One-to-many |
| `journal_prompts` | journal_prompts -> mood_entries | One-to-many |
| `content_items` | content_items -> content_assignments | One-to-many |
| `clients` | clients -> crisis_sessions | One-to-many |
| `crisis_sessions` | crisis_sessions -> crisis_events | One-to-one |
| `users` | users -> notifications | One-to-many |
| `users` | users -> analytics_export_jobs | One-to-many |

---

## 24. Schema Design (Physical)

All mutable tables include `created_at` and `updated_at` timestamps managed through triggers. Hard deletes are avoided for operational records unless explicitly stated; content items may be hard-deleted only under the content-governance rules defined in the API spec.

### TABLE: `users`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | `gen_random_uuid()` |
| `hrmis_id` | VARCHAR(100) | UNIQUE NOT NULL | Primary identity anchor for all user types |
| `identity_provider` | VARCHAR(50) | NOT NULL DEFAULT `'HRMIS'` | v1.0 supports HRMIS only |
| `identity_subject` | VARCHAR(255) | UNIQUE NOT NULL | Stable subject/NameID from HRMIS |
| `first_name` | VARCHAR(100) | NOT NULL | |
| `last_name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(255) | UNIQUE NOT NULL | Indexed for notification delivery |
| `phone` | VARCHAR(20) | UNIQUE | E.164 format |
| `role` | ENUM | NOT NULL | `CLIENT`, `COUNSELLOR`, `EMPLOYER`, `ADMIN` |
| `department` | VARCHAR(255) | NOT NULL | Ministry, department, agency, or county |
| `mfa_enabled` | BOOLEAN | NOT NULL DEFAULT true | |
| `mfa_delivery_channel` | ENUM | NOT NULL DEFAULT `EMAIL` | `EMAIL`, `SMS` |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true | Soft-disable without deleting account |
| `last_login_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `clients`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `user_id` | UUID | PK, FK -> users.id | One-to-one extension |
| `preferred_language` | VARCHAR(10) | NOT NULL DEFAULT `'en'` | `en` or `sw` |
| `consent_mood_sharing` | BOOLEAN | NOT NULL DEFAULT false | Client-wide mood-sharing flag |
| `consent_mood_sharing_at` | TIMESTAMPTZ | | |
| `consent_flags` | JSONB | NOT NULL DEFAULT `'{}'::jsonb` | Future-proof container for additional consents |
| `service_history_summary` | JSONB | NOT NULL DEFAULT `'[]'::jsonb` | Lightweight history metadata, not clinical notes |
| `emergency_contact_name` | VARCHAR(255) | | |
| `emergency_contact_phone` | VARCHAR(20) | | |
| `onboarding_completed_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `counsellors`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `user_id` | UUID | PK, FK -> users.id | One-to-one extension |
| `licence_number` | VARCHAR(100) | UNIQUE NOT NULL | Professional licence |
| `specialisations` | TEXT[] | NOT NULL DEFAULT '{}' | Example: `{TRAUMA, SUBSTANCE_USE, GRIEF}` |
| `bio` | TEXT | | Displayed in booking UI |
| `max_caseload` | INT | NOT NULL DEFAULT 25 | Used for Admin capacity alerts |
| `is_on_call` | BOOLEAN | NOT NULL DEFAULT false | Crisis support roster flag |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `employers`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `user_id` | UUID | PK, FK -> users.id | One-to-one extension |
| `organisation` | VARCHAR(255) | NOT NULL | Ministry, agency, or county body |
| `department_scope` | VARCHAR(255) | NOT NULL | Scope used for department analytics filtering |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `counsellor_availability_rules`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `counsellor_id` | UUID | FK -> counsellors.user_id NOT NULL | |
| `day_of_week` | SMALLINT | NOT NULL CHECK (`day_of_week` BETWEEN 0 AND 6) | 0=Sunday, 6=Saturday |
| `start_time` | TIME | NOT NULL | |
| `end_time` | TIME | NOT NULL | Must be greater than `start_time` |
| `timezone` | VARCHAR(50) | NOT NULL DEFAULT `'Africa/Nairobi'` | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `counsellor_leave_periods`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `counsellor_id` | UUID | FK -> counsellors.user_id NOT NULL | |
| `starts_at` | TIMESTAMPTZ | NOT NULL | |
| `ends_at` | TIMESTAMPTZ | NOT NULL | Must be greater than `starts_at` |
| `reason` | TEXT | | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `counselling_requests`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `client_id` | UUID | FK -> clients.user_id NOT NULL | Indexed |
| `source` | ENUM | NOT NULL | `SELF_SERVICE`, `EMPLOYER_REFERRAL`, `CRISIS_AUTO_REFERRAL` |
| `service_type` | ENUM | NOT NULL | `INDIVIDUAL`, `FAMILY`, `STRESS`, `SUBSTANCE_USE`, `ASSESSMENT` |
| `urgency` | ENUM | NOT NULL DEFAULT `ROUTINE` | `ROUTINE`, `URGENT`, `EMERGENCY` |
| `preferred_counsellor_id` | UUID | FK -> counsellors.user_id | Nullable Client preference |
| `preferred_window` | JSONB | NOT NULL DEFAULT `'{}'::jsonb` | Optional requested time window metadata |
| `status` | ENUM | NOT NULL DEFAULT `PENDING_APPROVAL` | `PENDING_APPROVAL`, `ASSIGNED`, `REJECTED`, `CLOSED` |
| `assigned_counsellor_id` | UUID | FK -> counsellors.user_id | Set when Admin assigns |
| `rejection_reason` | TEXT | | |
| `admin_notes` | TEXT | | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `appointments`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `request_id` | UUID | FK -> counselling_requests.id | Nullable for direct self-booked appointments |
| `client_id` | UUID | FK -> clients.user_id NOT NULL | Indexed |
| `counsellor_id` | UUID | FK -> counsellors.user_id NOT NULL | Indexed |
| `service_type` | ENUM | NOT NULL | Same enum as `counselling_requests.service_type` |
| `status` | ENUM | NOT NULL DEFAULT `SCHEDULED` | `SCHEDULED`, `ATTENDED`, `NO_SHOW`, `CANCELLED` |
| `scheduled_at` | TIMESTAMPTZ | NOT NULL | Indexed for calendar queries |
| `duration_minutes` | INT | NOT NULL DEFAULT 60 | |
| `session_modality` | ENUM | NOT NULL DEFAULT `IN_PERSON` | `IN_PERSON`, `PHONE` |
| `cancellation_reason` | TEXT | | |
| `cancelled_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE UNIQUE INDEX appointments_counsellor_slot_idx
  ON appointments (counsellor_id, scheduled_at)
  WHERE status = 'SCHEDULED';
```

### TABLE: `session_notes`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `appointment_id` | UUID | FK -> appointments.id NOT NULL | Indexed |
| `counsellor_id` | UUID | FK -> counsellors.user_id NOT NULL | Enforced by RLS |
| `content_encrypted` | BYTEA | NOT NULL | AES-256-GCM application-layer ciphertext |
| `content_iv` | BYTEA | NOT NULL | Initialisation vector |
| `status` | ENUM | NOT NULL DEFAULT `DRAFT` | `DRAFT`, `LOCKED` |
| `locked_at` | TIMESTAMPTZ | | Set when status becomes `LOCKED` |
| `version` | INT | NOT NULL DEFAULT 1 | Optimistic locking counter |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `journal_prompts`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `theme` | ENUM | NOT NULL | `WORK_STRESS`, `GRIEF`, `GRATITUDE`, `RELATIONSHIPS` |
| `language` | VARCHAR(10) | NOT NULL DEFAULT `'en'` | `en` or `sw` |
| `prompt_text` | TEXT | NOT NULL | |
| `status` | ENUM | NOT NULL DEFAULT `PUBLISHED` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `created_by` | UUID | FK -> users.id NOT NULL | Admin author |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `mood_entries`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `client_id` | UUID | FK -> clients.user_id NOT NULL | Indexed |
| `entry_date` | DATE | NOT NULL | UTC date; unique with `client_id` |
| `mood_score` | SMALLINT | NOT NULL CHECK (`mood_score` BETWEEN 1 AND 5) | Required for trends and rules-based recommendations |
| `prompt_id` | UUID | FK -> journal_prompts.id | Nullable |
| `journal_text_encrypted` | BYTEA | | Application-layer encrypted journal text |
| `journal_text_iv` | BYTEA | | |
| `voice_note_object_key_encrypted` | BYTEA | | Encrypted object-store key, never a public URL |
| `voice_note_object_key_iv` | BYTEA | | |
| `is_shared_with_counsellor` | BOOLEAN | NOT NULL DEFAULT false | Mirrors effective sharing state per entry |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE UNIQUE INDEX mood_entries_client_date_idx
  ON mood_entries (client_id, entry_date);
```

### TABLE: `content_items`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `category` | ENUM | NOT NULL | `CBT`, `MINDFULNESS`, `BREATHING`, `JOURNALING`, `PSYCHOEDUCATION`, `SLEEP`, `STRESS`, `GRATITUDE` |
| `title` | VARCHAR(255) | NOT NULL | |
| `body` | TEXT | | Markdown-formatted content body |
| `media_object_key` | VARCHAR(500) | | Object-store key for optional media |
| `status` | ENUM | NOT NULL DEFAULT `DRAFT` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `version` | INT | NOT NULL DEFAULT 1 | Incremented on every edit |
| `created_by` | UUID | FK -> users.id NOT NULL | Admin author |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `content_assignments`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `counsellor_id` | UUID | FK -> counsellors.user_id NOT NULL | |
| `client_id` | UUID | FK -> clients.user_id NOT NULL | |
| `content_item_id` | UUID | FK -> content_items.id NOT NULL | |
| `status` | ENUM | NOT NULL DEFAULT `ASSIGNED` | `ASSIGNED`, `COMPLETED` |
| `assigned_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `completed_at` | TIMESTAMPTZ | | |
| `rating` | SMALLINT | CHECK (`rating` BETWEEN 1 AND 5) | Client usefulness rating |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE UNIQUE INDEX content_assignments_unique_idx
  ON content_assignments (counsellor_id, client_id, content_item_id);
```

### TABLE: `crisis_sessions`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `client_id` | UUID | FK -> clients.user_id NOT NULL | Indexed |
| `request_id` | UUID | FK -> counselling_requests.id | Nullable until auto-referral exists |
| `counsellor_id` | UUID | FK -> counsellors.user_id | Assigned counsellor if one joins the workflow |
| `current_step` | SMALLINT | NOT NULL DEFAULT 1 | Step 1-9 |
| `status` | ENUM | NOT NULL DEFAULT `ACTIVE` | `ACTIVE`, `ABANDONED`, `COMPLETED`, `ESCALATED` |
| `assessment_data` | JSONB | NOT NULL DEFAULT `'{}'::jsonb` | Structured step data while workflow is active |
| `working_safety_plan` | JSONB | NOT NULL DEFAULT `'[]'::jsonb` | Mutable until documentation |
| `last_interaction_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Used to detect abandonment |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `crisis_events`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `crisis_session_id` | UUID | UNIQUE FK -> crisis_sessions.id NOT NULL | One immutable record per completed crisis workflow |
| `client_id` | UUID | FK -> clients.user_id NOT NULL | Indexed |
| `counsellor_id` | UUID | FK -> counsellors.user_id | Nullable if workflow completed without live counsellor contact |
| `triggered_at` | TIMESTAMPTZ | NOT NULL | Inherited from workflow creation |
| `record_encrypted` | BYTEA | NOT NULL | Encrypted immutable incident record payload |
| `record_iv` | BYTEA | NOT NULL | |
| `follow_up_schedule` | JSONB | NOT NULL DEFAULT `'[]'::jsonb` | Array of follow-up notification jobs |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Immutable; no `updated_at` |

### TABLE: `referrals`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `employer_id` | UUID | FK -> employers.user_id NOT NULL | |
| `client_id` | UUID | FK -> clients.user_id | Nullable until employee account is resolved |
| `employee_hrmis_id` | VARCHAR(100) | NOT NULL | Used to link the employee account |
| `service_type` | ENUM | NOT NULL | Same enum as requests and appointments |
| `urgency` | ENUM | NOT NULL DEFAULT `ROUTINE` | |
| `notes` | TEXT | | Employer context notes; never visible to the Client |
| `linked_request_id` | UUID | UNIQUE FK -> counselling_requests.id | Created immediately on referral submission |
| `status` | ENUM | NOT NULL DEFAULT `PENDING` | `PENDING`, `ASSIGNED`, `REJECTED`, `CLOSED` |
| `processed_by` | UUID | FK -> users.id | Admin actor for rejection or closure |
| `processed_at` | TIMESTAMPTZ | | |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `notifications`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `user_id` | UUID | FK -> users.id NOT NULL | Indexed |
| `channel` | ENUM | NOT NULL | `EMAIL`, `SMS`, `IN_APP` |
| `type` | VARCHAR(100) | NOT NULL | Example: `BOOKING_CONFIRMED`, `CRISIS_FOLLOW_UP` |
| `payload` | JSONB | NOT NULL DEFAULT `'{}'::jsonb` | Render payload for delivery templates |
| `status` | ENUM | NOT NULL DEFAULT `PENDING` | `PENDING`, `SENT`, `FAILED`, `READ` |
| `sent_at` | TIMESTAMPTZ | | Populated for outbound channels |
| `read_at` | TIMESTAMPTZ | | Used for in-app notifications only |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `analytics_export_jobs`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `requested_by` | UUID | FK -> users.id NOT NULL | Admin requester |
| `format` | ENUM | NOT NULL | `PDF`, `CSV` |
| `scope` | VARCHAR(100) | NOT NULL | Example: `SUMMARY`, `UTILISATION`, `DEPARTMENT` |
| `filters` | JSONB | NOT NULL DEFAULT `'{}'::jsonb` | Date range and filter metadata |
| `status` | ENUM | NOT NULL DEFAULT `PENDING` | `PENDING`, `READY`, `FAILED`, `EXPIRED` |
| `object_key` | VARCHAR(500) | | Download location in object storage |
| `expires_at` | TIMESTAMPTZ | | Optional expiry for generated files |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

### TABLE: `audit_log`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | BIGSERIAL | PK | Integer key for append performance |
| `user_id` | UUID | NOT NULL | Actor performing the action |
| `target_table` | VARCHAR(100) | NOT NULL | Example: `session_notes`, `crisis_events` |
| `target_id` | UUID | NOT NULL | Record affected |
| `action` | VARCHAR(50) | NOT NULL | `INSERT`, `UPDATE`, `LOCK`, `READ_SENSITIVE`, `BREAK_GLASS_READ` |
| `ip_address` | INET | | |
| `user_agent` | TEXT | | |
| `metadata` | JSONB | NOT NULL DEFAULT `'{}'::jsonb` | Additional audit context |
| `occurred_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() | Append-only |

---

## 25. Indexing Strategy

| Index Target | Index Type | Rationale |
|---|---|---|
| `users(hrmis_id)` | B-Tree UNIQUE | HRMIS identity mapping |
| `users(identity_subject)` | B-Tree UNIQUE | Stable IdP subject lookup |
| `appointments(counsellor_id, scheduled_at)` | B-Tree | Counsellor calendar and slot conflict checks |
| `appointments(client_id, scheduled_at)` | B-Tree | Client appointment history |
| `counselling_requests(status, created_at)` | B-Tree | Admin queue filtering |
| `counselling_requests(source, urgency)` | B-Tree | Queue segmentation by source and priority |
| `referrals(employer_id, status)` | B-Tree | Employer referral history and Admin filtering |
| `mood_entries(client_id, entry_date)` | B-Tree composite | Trend retrieval and per-day uniqueness |
| `journal_prompts(theme, language, status)` | B-Tree composite | Prompt catalogue filters |
| `content_items(category, status)` | B-Tree composite | Content browsing |
| `content_items USING GIN (to_tsvector('simple', title || ' ' || coalesce(body, '')))` | GIN | Keyword search in the content library |
| `content_assignments(client_id, status)` | B-Tree | "My Programmes" and completion tracking |
| `crisis_sessions(client_id, status)` | B-Tree | Active crisis detection |
| `crisis_events(client_id, created_at)` | B-Tree | Case-file retrieval and audit views |
| `notifications(user_id, created_at)` | B-Tree | User notification inbox |
| `analytics_export_jobs(requested_by, status)` | B-Tree | Export polling and cleanup |

---

## 26. Row-Level Security (RLS)

PostgreSQL RLS is used as a defence-in-depth layer for sensitive tables. Application logic remains the primary policy engine, but the database prevents cross-tenant leakage if an application bug escapes.

```sql
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselling_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
```

| Table | RLS Policy Logic |
|---|---|
| `session_notes` | Counsellor may read only notes they authored. Admin note-content reads require an explicit break-glass session flag and are always audited. |
| `mood_entries` | Client may read own entries. Counsellor may read only if the Client has granted consent and the counsellor is currently assigned to that Client. Admin is denied. |
| `counselling_requests` | Client may read own requests. Admin may read all requests. Employers access request status only through the linked referral they submitted. |
| `crisis_sessions` | Client may read own active session. Assigned Counsellor and Admin may read assigned or escalated sessions. |
| `crisis_events` | Assigned Counsellor and Admin may read immutable incident records; Client access is not exposed after documentation unless later approved by policy. |
| `referrals` | Employer may read only referrals they submitted. Admin may read all. Clients cannot read employer notes about them. |

---

## 27. Consistency, Transactions & Data Integrity

- **ACID transactions** are mandatory for all multi-table write operations:
  - Direct booking (`appointments` + `notifications`)
  - Request assignment (`counselling_requests` + `appointments` + `notifications`)
  - Employer referral submission (`referrals` + `counselling_requests` + `notifications`)
  - Crisis documentation (`crisis_sessions` + `crisis_events` + `counselling_requests` + `notifications`)
  - Content completion (`content_assignments` + analytics refresh signal)
- **Isolation level:** `READ COMMITTED` for standard traffic. `SERIALIZABLE` is required for slot-booking transactions to prevent double-booking.
- **Foreign keys** remain the source of truth for relational integrity. Application checks are secondary protections, not substitutes.
- **Optimistic locking** via the `version` column is used for draft session-note updates.
- **Immutable records:** `crisis_events` cannot be updated after insert. Corrections, if ever required by policy, must be handled as appended audit annotations rather than in-place edits.

---

## 28. Scaling Strategy

| Stage | Strategy |
|---|---|
| **v1.0 (0-500 concurrent users)** | Single managed PostgreSQL primary with one read replica for analytics-heavy reads. Redis single primary with persistence enabled. |
| **v2.0 (500-5,000 concurrent users)** | Larger primary instance, separate analytics replica, PgBouncer or equivalent connection pooling, and a dedicated worker tier for notifications/exports. |
| **v3.0 (5,000+ concurrent users)** | Evaluate separating analytics into a dedicated warehouse and moving high-volume append tables such as notifications and audit logs to time-partitioned storage. |
| **Hot-spot mitigation** | Appointment slot booking uses short serializable transactions. Mood entries are per-user append patterns with low contention. Crisis traffic is bursty but low volume. |
| **Partitioning** | `audit_log`, `notifications`, and eventually `mood_entries` should be range-partitioned by month once retention volume justifies it. |

---

## 29. Data Lifecycle Management

| Entity | Retention Policy |
|---|---|
| **Mood Entries** | Retained while the user account is active. Deleted on data-erasure request subject to statutory and Directorate policy review. |
| **Session Notes** | Retained for 7 years after the last interaction. Stored encrypted at rest and at the application layer. |
| **Crisis Sessions** | Operational workflow data retained for 90 days after completion, then archived or compacted once the immutable crisis event has been preserved. |
| **Crisis Events** | Retained for 7 years. Immutable after creation. |
| **Referrals** | Retained for 7 years for workforce-governance traceability. |
| **Notifications** | Delivery logs retained for 90 days in hot storage, then archived or purged according to channel and policy. |
| **Audit Logs** | Retained for 3 years in hot storage and 7 years in archive. Never edited. |
| **Analytics Export Jobs** | Generated files expire after a configurable retention window; metadata is retained for auditability. |

---

## 30. Security & Compliance

| Concern | Implementation |
|---|---|
| **Encryption at Rest** | Full-disk encryption on database and object storage plus application-layer AES-256-GCM encryption for session notes, journal text, voice-note object keys, and crisis incident records |
| **Encryption in Transit** | TLS 1.3 for all application-to-database and application-to-object-store traffic |
| **PII Handling** | Names, HRMIS IDs, email, and phone are classified as PII and masked in logs wherever possible |
| **Access Control** | Separate DB roles for application traffic, analytics reads, and schema migrations; no shared superuser access in production |
| **Kenya DPA Compliance** | All primary and backup data stores must be physically hosted in Kenya-based data-centre infrastructure. Cross-border storage is non-compliant for v1.0. |
| **Key Management** | Encryption keys must be managed by a Kenya-hosted KMS or HSM-backed equivalent approved by the Directorate |
| **Audit Trail** | Sensitive data reads and all note locks, crisis-record creation, and Admin break-glass note reads are recorded in `audit_log` |

```sql
CREATE OR REPLACE FUNCTION audit_session_notes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, target_table, target_id, action, occurred_at)
  VALUES (
    current_setting('app.current_user_id')::uuid,
    'session_notes',
    NEW.id,
    TG_OP,
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 31. Reliability & Operations

| Concern | Strategy |
|---|---|
| **Backups** | Daily snapshots plus continuous WAL archiving to a Kenya-based backup target |
| **RPO** | 1 hour maximum data loss |
| **RTO** | 4 hours maximum service restoration time |
| **Monitoring** | Database CPU, memory, connection pool health, slow queries, replication lag, worker-queue latency, and object-store delivery failures |
| **Disaster Recovery** | Restore drills run quarterly against a secondary Kenya-based environment |
| **Redis Persistence** | RDB snapshots plus append-only file mode for session and OTP durability |

---

## 32. Trade-offs & Assumptions

| Decision | Trade-off | Justification |
|---|---|---|
| **Separate `counselling_requests` from `appointments`** | Adds one more domain object and workflow table | Required to reconcile direct booking with Admin-reviewed requests in the PRD |
| **Separate `crisis_sessions` from `crisis_events`** | Adds workflow/record split complexity | Required to satisfy both step-by-step crisis progression and immutable incident-record storage |
| **Next.js 16 monolith with shared DB** | Simpler early delivery but shared failure domain | Appropriate for v1.0 scale and team size |
| **Application-layer encryption for clinical payloads** | Adds key-management and decryption overhead | Necessary for sensitive health data and auditability |
| **Kenya-only hosting requirement** | Narrows infrastructure vendor choices and may increase cost | Non-negotiable because the PRD is the governing source of truth |

---

## Appendix: Full Schema Summary (DDL Reference)

```sql
CREATE TYPE user_role AS ENUM ('CLIENT', 'COUNSELLOR', 'EMPLOYER', 'ADMIN');
CREATE TYPE mfa_channel AS ENUM ('EMAIL', 'SMS');
CREATE TYPE service_type AS ENUM ('INDIVIDUAL', 'FAMILY', 'STRESS', 'SUBSTANCE_USE', 'ASSESSMENT');
CREATE TYPE request_source AS ENUM ('SELF_SERVICE', 'EMPLOYER_REFERRAL', 'CRISIS_AUTO_REFERRAL');
CREATE TYPE request_status AS ENUM ('PENDING_APPROVAL', 'ASSIGNED', 'REJECTED', 'CLOSED');
CREATE TYPE urgency_level AS ENUM ('ROUTINE', 'URGENT', 'EMERGENCY');
CREATE TYPE appointment_status AS ENUM ('SCHEDULED', 'ATTENDED', 'NO_SHOW', 'CANCELLED');
CREATE TYPE session_modality AS ENUM ('IN_PERSON', 'PHONE');
CREATE TYPE note_status AS ENUM ('DRAFT', 'LOCKED');
CREATE TYPE journal_prompt_theme AS ENUM ('WORK_STRESS', 'GRIEF', 'GRATITUDE', 'RELATIONSHIPS');
CREATE TYPE publication_status AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE content_category AS ENUM ('CBT', 'MINDFULNESS', 'BREATHING', 'JOURNALING', 'PSYCHOEDUCATION', 'SLEEP', 'STRESS', 'GRATITUDE');
CREATE TYPE content_assignment_status AS ENUM ('ASSIGNED', 'COMPLETED');
CREATE TYPE crisis_session_status AS ENUM ('ACTIVE', 'ABANDONED', 'COMPLETED', 'ESCALATED');
CREATE TYPE referral_status AS ENUM ('PENDING', 'ASSIGNED', 'REJECTED', 'CLOSED');
CREATE TYPE notification_channel AS ENUM ('EMAIL', 'SMS', 'IN_APP');
CREATE TYPE notification_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');
CREATE TYPE export_format AS ENUM ('PDF', 'CSV');
CREATE TYPE export_status AS ENUM ('PENDING', 'READY', 'FAILED', 'EXPIRED');

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

*Document Version: v1.1 - March 2026 - Directorate of Counselling and Wellness Services - CONFIDENTIAL*
