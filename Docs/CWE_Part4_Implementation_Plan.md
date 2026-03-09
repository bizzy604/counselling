# Counselling and Wellness Ecosystem
## Part IV - Implementation Plan

**Organisation:** Directorate of Counselling and Wellness Services  
**Document Type:** Implementation Plan  
**Version:** v1.0 - March 2026  
**Status:** Proposed for review before implementation  
**Classification:** CONFIDENTIAL - Government Internal Use Only

---

## 33. Implementation Executive Summary

This plan translates the PRD, API architecture, and database architecture into an executable delivery sequence. It assumes the PRD is the governing source of truth and that no application code will be started until this plan is reviewed and accepted.

The implementation approach is intentionally conservative:

1. Build a single **Next.js 16** codebase for all user roles.
2. Keep a single primary PostgreSQL data model for v1.0.
3. Introduce background workers only where the PRD requires asynchronous behaviour.
4. Land security, auditability, and role isolation from the first milestone rather than as hardening afterthoughts.

---

## 34. Delivery Principles

- **PRD-first delivery:** when product, API, or database design conflicts arise, the PRD wins.
- **Secure by default:** RBAC, MFA, encryption, audit logging, and data residency are baseline controls, not later enhancements.
- **Thin vertical slices:** each delivery phase should produce a usable end-to-end flow, not only isolated layers.
- **One source of business logic:** booking, request assignment, consent checks, and crisis progression should live in shared server-side services used by both UI actions and API routes.
- **Operational simplicity:** v1.0 stays monolithic at the application and database layers unless scale proves otherwise.

---

## 35. Target Technical Architecture

| Layer | Decision |
|---|---|
| **Application Runtime** | Single Next.js 16 application using App Router |
| **API Surface** | REST endpoints under `/app/v1/*` implemented with Route Handlers |
| **UI Delivery** | Role-based web application plus responsive PWA shell from the same codebase |
| **Server Domain Layer** | Shared server-side modules for auth, booking, requests, notes, mood, crisis, analytics, and notifications |
| **Primary Database** | PostgreSQL 15 with RLS, SQL constraints, and application-layer encryption for clinical payloads |
| **Ephemeral/Queue Layer** | Redis for session state, OTPs, rate limiting, and worker coordination |
| **Object Storage** | Kenya-hosted S3-compatible storage for voice notes, content media, and export files |
| **Identity** | HRMIS-backed login plus OTP MFA to registered email or phone |
| **Background Processing** | Notification worker, analytics refresh worker, and export-generation worker |
| **Compliance Controls** | Audit logging, consent enforcement, encrypted clinical payloads, Kenya-only hosting |

### 35.1 Proposed Repository Layout

```text
/app
  /(public)
  /(auth)
  /(client)
  /(counsellor)
  /(employer)
  /(admin)
  /v1/*
/src
  /design-system
    /tokens.css
    /theme.ts
    /motion.ts
  /server
    /auth
    /users
    /appointments
    /requests
    /counsellors
    /mood
    /content
    /crisis
    /notes
    /referrals
    /analytics
    /notifications
  /components
    /ui
    /layout
    /booking
    /mood
    /crisis
    /counsellor
    /admin
  /lib
  /config
/workers
  /notifications
  /analytics
  /exports
/db
  /migrations
  /policies
  /seeds
/tests
  /unit
  /integration
  /e2e
```

### 35.2 Architectural Boundaries

- **UI boundary:** route groups isolate role-specific navigation and page shells.
- **API boundary:** all external mutations pass through versioned route handlers.
- **Domain boundary:** route handlers call shared services instead of embedding business logic inline.
- **Persistence boundary:** database access is routed through typed repository/query modules plus SQL migrations for RLS, triggers, and constraints.
- **Worker boundary:** email, SMS, follow-up jobs, analytics refreshes, and export generation never block user-facing requests.

### 35.3 Design System Adoption

`CWE_Design_System.md` is the binding UI source of truth for implementation. The application must adopt it directly rather than reinterpreting it during build.

- **Visual language:** implement the "Grounded Warmth" palette and semantic tokens exactly as defined in the design system.
- **Theme model:** Client and Employer portals default to the warm light theme; Counsellor and Admin portals default to the dark theme.
- **Typography:** use Fraunces for display/headings, DM Sans for UI/body, and JetBrains Mono only for data-heavy Admin/Counsellor surfaces.
- **Font delivery:** preserve the specified font families and semantic usage, but load them through the Next.js runtime during implementation rather than ad hoc CSS imports.
- **Icons:** use Lucide with the documented meaning map; never rely on icons alone for critical meaning.
- **Component primitives:** build the shared UI primitives from the documented button, input, card, badge, table, toast, and navigation patterns before feature pages.
- **Accessibility and motion:** treat the documented focus states, touch targets, live regions, reduced-motion behaviour, and WCAG contrast rules as acceptance criteria, not guidance.
- **Tailwind tokenisation:** mirror the design-system token set in Tailwind and CSS custom properties before feature implementation begins.

---

## 36. Workstreams

| Workstream | Scope |
|---|---|
| **WS1 - Platform Foundation** | Repo bootstrap, environments, secrets, CI, deployment scaffolding, design-system token implementation, localisation scaffolding |
| **WS2 - Identity & RBAC** | HRMIS adapter, MFA, session management, role guards, audit scaffolding |
| **WS3 - Scheduling & Requests** | Counsellor availability, direct booking, no-slot requests, Admin assignment queue |
| **WS4 - Mood & Journaling** | Daily check-ins, journal prompts, journal autosave, voice-note upload, consent workflow |
| **WS5 - Content & Programmes** | Content library, publishing workflow, counsellor assignments, client completion/rating, recommendations |
| **WS6 - Crisis & Case Management** | SOS flow, crisis workflow state, immutable crisis records, session notes, follow-up scheduling |
| **WS7 - Employer & Analytics** | Employer referrals, department reports, Admin analytics, export jobs |
| **WS8 - Notifications & Background Jobs** | Email/SMS/in-app delivery, retry logic, delivery logging, reminder scheduling |
| **WS9 - Security, QA, and Hardening** | RLS rollout, penetration-prep controls, accessibility, low-bandwidth validation, backups, observability |

---

## 37. Phase Plan

### Phase 0 - Architecture Lock

**Objective:** Freeze the implementation contract before code starts.

**Deliverables**
- Approved PRD-aligned API and database architecture documents
- Approved implementation plan
- Confirmed decisions on hosting, HRMIS integration shape, and Admin break-glass note access

**Exit Criteria**
- No open architecture contradictions remain in Parts II-IV
- Directorate signs off on the operating assumptions listed in Section 40

### Phase 1 - Foundation & Environments

**Objective:** Stand up the delivery skeleton for Next.js 16 and core operations.

**Deliverables**
- Next.js 16 application shell with App Router route groups
- Design-system token layer, font loading, Tailwind theme extension, and role-based light/dark theme plumbing
- Shared layout, navigation shell, authentication guard boundary, and localisation scaffolding
- Environment configuration, secrets strategy, deployment pipeline, logging baseline, health endpoints
- PostgreSQL migration framework and Redis connectivity

**Exit Criteria**
- Application deploys to dev and staging
- Database migrations run repeatably
- Protected routes can be gated even before HRMIS is fully wired
- Base UI primitives render from the approved design system rather than ad hoc styling

### Phase 2 - Identity, Sessions, and RBAC

**Objective:** Complete the authentication and access-control backbone.

**Deliverables**
- HRMIS sign-in initiation and callback handling
- MFA OTP delivery and verification
- Session issuance, refresh, logout, and inactivity expiry
- Role-aware route protection and API authorisation checks
- Audit trail for login and sensitive access events

**Exit Criteria**
- All four roles can sign in through the approved identity path
- Unauthorised access attempts resolve correctly to `401` or `403`
- Audit logs capture auth events with actor, IP, and timestamp

### Phase 3 - Counsellor Availability and Direct Booking

**Objective:** Deliver the direct self-booking flow from the PRD.

**Deliverables**
- Counsellor profile and availability management
- Slot-generation logic for next-30-day availability
- Direct appointment booking and cancellation
- Counsellor calendar and attendance updates
- Booking confirmations and 24-hour reminders

**Exit Criteria**
- A Client can book an open slot end to end
- Double-booking is prevented at the transaction layer
- Counsellor dashboard reflects new bookings immediately

### Phase 4 - Counselling Requests, Referrals, and Admin Assignment

**Objective:** Deliver the Admin-reviewed pathway for pending counselling demand.

**Deliverables**
- Client no-slot/manual-assignment request flow
- Employer referral submission flow
- Unified Admin queue for pending counselling requests
- Admin assign/reject actions that create downstream appointments
- Linked status updates between referrals, requests, and appointments

**Exit Criteria**
- Employer referrals create pending work for Admin
- Admin can assign a counsellor and a session slot from the queue
- Request-source labels and urgency are visible and filterable

### Phase 5 - Mood, Journaling, and Content Programmes

**Objective:** Deliver the self-service wellness core.

**Deliverables**
- Daily mood check-in flow and trend views
- Journal prompts and journal autosave
- Voice-note upload and secure playback
- Client consent control for counsellor mood access
- Content library browse/search, content management, assignment, completion, rating, recommendations

**Exit Criteria**
- Clients can complete daily mood entries with optional journaling
- Assigned counsellors can view mood history only when consent is active
- Admin can publish and archive content safely

### Phase 6 - Crisis Workflow and Session Notes

**Objective:** Deliver the most sensitive operational flows.

**Deliverables**
- Persistent SOS entry point
- Nine-step crisis workflow with abandonment logging
- Auto-generated immutable crisis incident record
- Auto-referral creation from crisis flow
- Session-note draft/edit/lock flow with audited Admin break-glass read

**Exit Criteria**
- SOS activation creates workflow state within 10 seconds
- Crisis documentation produces an immutable incident record
- Locked session notes cannot be edited

### Phase 7 - Analytics, Reporting, and Employer Portal

**Objective:** Complete management visibility and reporting.

**Deliverables**
- Admin analytics dashboard metrics defined in the PRD
- Employer department aggregate reports
- PDF and CSV export jobs
- Analytics refresh worker and cache strategy

**Exit Criteria**
- Admin and Employer reports expose only approved aggregates
- Export jobs complete asynchronously and can be downloaded securely

### Phase 8 - Hardening, UAT, and Go-Live Preparation

**Objective:** Validate the full system under security, accessibility, and operational constraints.

**Deliverables**
- Accessibility audit against WCAG 2.1 AA
- Low-bandwidth performance validation
- Backup and restore drills
- Security review, penetration-test readiness fixes, and runbooks
- UAT issue resolution and launch checklist

**Exit Criteria**
- Critical and high-severity defects are resolved
- RPO/RTO procedures are tested
- Directorate signs off on go-live readiness

---

## 38. Detailed Build Backlog by Domain

### 38.1 Identity & Access

- Implement HRMIS adapter boundary with clear protocol abstraction so OAuth2 and SAML can be supported without changing application pages.
- Build OTP challenge issue/verify flows with Redis-backed expiry tracking.
- Add role-based route groups and server-side permission checks.
- Add a session-aware `proxy.ts` guard to protect app routes before rendering.
- Add audit events for login success, login failure, logout, MFA verification, and break-glass note access.

### 38.2 Scheduling & Request Management

- Build counsellor weekly availability and leave-period management UI and API.
- Implement slot-generation service that merges recurring rules, leave periods, and existing bookings.
- Implement direct appointment booking with serializable transaction protection.
- Implement request queue models for self-service and crisis-driven requests.
- Build Admin queue filters for request source, urgency, counsellor capacity, and availability.
- Build booking and admin queue screens from the documented shell, button, card, table, and badge patterns.

### 38.3 Mood, Journaling, and Wellness Content

- Build one-entry-per-day mood service with 30/60/90-day trend views.
- Implement encrypted journal text handling and secure voice-note object handling.
- Build journaling prompt catalogue with English and Swahili support.
- Implement Admin content authoring, versioning, publish/archive/delete governance, and counsellor assignment flows.
- Implement client completion and rating endpoints and recommendation rules.
- Build mood selector, journaling surfaces, and content cards directly from the design-system component patterns and screen specs.

### 38.4 Crisis & Case Management

- Build client-facing SOS shell that is globally available in all client routes.
- Model the nine-step crisis workflow as sequential server-side state transitions.
- Generate the immutable crisis incident snapshot only at documentation time.
- Create auto-referral records when the crisis workflow reaches the referral step.
- Build counsellor session-note autosave and lock workflow with break-glass read audit hooks.
- Implement the SOS button, breathing exercise, and crisis overlay using the documented motion, layering, and colour rules.

### 38.5 Analytics, Notifications, and Reporting

- Build notification templates for booking, cancellation, referral, crisis, and follow-up events.
- Add retry-capable worker jobs and delivery logging.
- Create analytics materialised views for DAU, utilisation, content engagement, and aggregate mood trends.
- Build export-job generation and secure download handling.
- Implement Employer department reporting with strict aggregate-only filtering.

### 38.6 Security, Compliance, and Operations

- Implement RLS policies together with integration tests that prove data isolation.
- Add application-layer encryption utilities for clinical payloads.
- Build structured audit logging for all sensitive reads and writes.
- Add secrets management, backup automation, restore validation, and environment promotion rules.
- Validate accessibility, keyboard navigation, and text-first fallback for low-bandwidth media contexts.
- Add UI review checkpoints for token usage, theme correctness, component consistency, and responsive behaviour against the design-system spec.

---

## 39. Testing & Release Strategy

### 39.1 Test Layers

- **Unit tests:** domain services, validators, consent rules, scheduling logic, recommendation rules
- **Integration tests:** API handlers, DB transactions, RLS enforcement, worker flows
- **End-to-end tests:** sign-in, booking, referral, crisis flow, note locking, analytics export
- **Non-functional tests:** performance checks for booking and dashboard reads, accessibility checks, low-bandwidth smoke tests, and design-system conformance review

### 39.2 Release Environments

| Environment | Purpose |
|---|---|
| **Local** | Developer workflow and isolated feature testing |
| **Dev** | Shared integration environment for daily changes |
| **Staging** | Production-like validation for HRMIS integration, notifications, exports, and UAT |
| **Production** | Kenya-hosted live environment with strict change control |

### 39.3 Release Gates

- Migrations must run cleanly in staging before production promotion.
- All critical flows must pass automated regression checks before release.
- Security-sensitive changes require explicit review.
- Crisis, note-access, and data-export changes require manual test sign-off in staging.

---

## 40. Review Gates Before Implementation Starts

These items should be confirmed before code work begins, because they change architecture and delivery risk materially.

| Gate | Required Decision |
|---|---|
| **G1 - HRMIS Contract** | Confirm whether HRMIS integration will be OAuth2, SAML, or a Directorate-owned adapter in front of HRMIS |
| **G2 - Hosting Vendor** | Confirm the Kenya-based hosting provider for PostgreSQL, Redis, object storage, and compute |
| **G3 - Admin Clinical Access** | Confirm that Admin note-content access is allowed only as audited break-glass single-record retrieval |
| **G4 - Referral Visibility** | Confirm whether referred employees can see the referring employer identity in the UI |
| **G5 - Notification Channels** | Confirm whether email, SMS, or both are mandatory at launch for OTP and booking alerts |
| **G6 - Content Seed** | Confirm the launch content set and whether English and Swahili variants will both be available at day one |

---

## 41. Definition of Done for MVP

The v1.0 MVP is done only when all of the following are true:

- All four roles can authenticate and see only their permitted workflows.
- Clients can book direct appointments, submit requests, complete mood entries, access content, and trigger SOS.
- Counsellors can manage availability, appointments, notes, and assigned client journeys.
- Employers can submit referrals and view only aggregate department reports.
- Admins can manage queue assignment, content governance, analytics, and exports.
- Sensitive data is encrypted, audited, and isolated by policy and tests.
- All implemented screens use the approved design-system tokens, typography, theming, accessibility rules, and component patterns.
- Staging has passed UAT, accessibility checks, backup/restore tests, and launch runbook rehearsal.

---

*Document Version: v1.0 - March 2026 - Directorate of Counselling and Wellness Services - CONFIDENTIAL*
