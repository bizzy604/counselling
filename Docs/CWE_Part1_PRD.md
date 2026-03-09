# Counselling and Wellness Ecosystem
## Part I — Product Requirements Document (PRD)

**Organisation:** Directorate of Counselling and Wellness Services  
**Document Type:** Product Requirements Document  
**Version:** v1.0 — March 2026  
**Classification:** CONFIDENTIAL — Government Internal Use Only  
**Target Market:** Kenya (Primary) · Diaspora (Future)

---

## 1. Executive Summary

The Counselling and Wellness Ecosystem (CWE) is a government-grade digital platform commissioned by the Directorate of Counselling and Wellness Services to deliver holistic, confidential, and stigma-free mental health and wellness services to Kenya's public servants. The platform addresses critical gaps in the current wellness service delivery model — including low uptake driven by stigma, geographic barriers, limited counsellor capacity, and the absence of integrated physical, emotional, and financial wellness support.

The CWE will serve four distinct roles — Clients (public servants), Counsellors, Employers/HR Officers, and Administrators — through a secure, role-based web application accessible across desktop, mobile (Android/iOS), and low-bandwidth environments. Core capabilities include session booking integrated with HRMIS, multi-modal mood tracking and journaling, a full library of guided mental health exercises, a structured crisis intervention protocol, counsellor case management, employer referral workflows, and an aggregate analytics dashboard for the Directorate.

> **Mission Statement:** To build a holistic digital ecosystem that enhances the well-being of public servants through integrated, accessible, confidential, and innovative wellness services.

---

## 2. Problem Statement

### 2.1 Core Problem

Public servants in Kenya face significant barriers to accessing mental health and wellness support despite existing Directorate programmes. These barriers result in chronically low service uptake, escalating untreated psychosocial conditions, and measurable productivity loss across the public sector workforce.

### 2.2 Root Cause Analysis

| Root Cause | Impact on Service Uptake |
|---|---|
| **Stigma** | Public servants fear professional and social consequences of being seen to seek mental health support, particularly in rank-conscious organisational cultures. |
| **Confidentiality Concerns** | In-person counselling creates a visible paper trail and physical exposure in shared government office environments. |
| **Geographic Barriers** | Officers in counties and remote duty stations cannot travel to centralised Directorate offices for in-person services. |
| **Counsellor Capacity Gap** | The ratio of available counsellors to the total public servant workforce makes in-person-only service delivery structurally impossible at scale. |
| **Lack of Integration** | Current programmes address mental health in isolation, without connecting to physical wellness, financial stress, lifestyle disease prevention, or workplace trauma. |
| **No Digital Channel** | There is no self-service digital pathway for a public servant to access exercises, content, or book a session outside office hours or without in-person disclosure. |

---

## 3. Goals & Non-Goals

### 3.1 Product Goals

- Provide a secure, anonymous digital channel for public servants to self-initiate counselling and wellness support without physical exposure.
- Enable end-to-end session booking integrated with counsellor availability, tied to the HRMIS employee record system.
- Deliver a comprehensive self-service wellness toolkit including mood tracking, journaling, CBT exercises, mindfulness, breathing techniques, psychoeducation, and sleep hygiene.
- Implement a structured, protocol-driven crisis intervention workflow (assessment → safety → stabilisation → referral → documentation → follow-up).
- Provide counsellors with a full case management workspace: client list, session notes (access-controlled), mood history, assigned exercises, and appointment management.
- Enable employer/HR officers to formally refer employees for assessment and counselling, and receive aggregate (anonymised) wellness reports.
- Give Directorate administrators full platform governance: request approval, counsellor assignment, content library management, and utilisation analytics.
- Support English and Swahili at launch; architect for diaspora scale in future.
- Ensure WCAG 2.1 AA accessibility and low-bandwidth optimisation for county-based officers.

### 3.2 Non-Goals (Explicitly Excluded from v1.0)

- **No billing or payment processing** — the platform is government-funded; no financial transactions occur.
- **No prescribing, diagnosing, or medical record integration** — not a clinical electronic health record system.
- **No direct peer-to-peer community or anonymous forums** — excluded from v1.0 due to trust & safety infrastructure requirements.
- **No third-party therapist marketplace** — all counsellors are Directorate employees or approved contractors.
- **No mobile native app (iOS/Android) in v1.0** — responsive PWA covers mobile use cases.
- **No AI/LLM-generated therapy content** — personalisation is rules-based and supervised by counsellors.
- **No SMS/USSD fallback in v1.0** — flagged for Phase 2 to serve feature phone users.

---

## 4. User Personas

### 4.1 Persona A — The Public Servant (Client)

| Attribute | Detail |
|---|---|
| **Name** | Wanjiku Mwangi (representative persona) |
| **Age Range** | 26–55 years |
| **Role** | Government officer — Ministry, Department, Agency, or County Government |
| **Location** | Nairobi (urban) to Turkana County (remote) — highly varied geographic context |
| **Primary Challenges** | Work-related stress, burnout, grief, substance use, financial anxiety, workplace trauma |
| **Device Usage** | Shared office desktop (primary); personal Android smartphone (secondary) |
| **Digital Literacy** | Moderate — comfortable with HRMIS, email, WhatsApp, but not heavy app users |
| **Key Fear** | Being identified as having a mental health problem by colleagues or supervisors |
| **Critical Need** | Confidential, stigma-free access to self-help content and professional counselling without physical exposure |

### 4.2 Persona B — The Counsellor

| Attribute | Detail |
|---|---|
| **Name** | Dr. Otieno (representative persona) |
| **Role** | Directorate-employed or contracted licensed counsellor/psychologist |
| **Primary Tasks** | Conduct sessions, update case notes, review client mood history, assign wellness exercises |
| **Device Usage** | Desktop (primary workspace) |
| **Key Need** | Structured, private case management workspace with clear client assignment and protected note-taking |
| **Pain Point** | Manual appointment tracking and paper-based session records under current system |

### 4.3 Persona C — The Employer / HR Officer

| Attribute | Detail |
|---|---|
| **Name** | HR Director, Ministry of Health |
| **Role** | Refers employees for counselling; receives workforce wellness analytics |
| **Primary Tasks** | Submit formal employee referrals; review department-level utilisation reports |
| **Key Need** | Simple referral form + visibility into whether referred employees followed through (without seeing individual case details) |
| **Constraint** | Must not be able to see individual session notes or clinical data |

### 4.4 Persona D — The System Administrator

| Attribute | Detail |
|---|---|
| **Role** | Directorate staff with platform governance authority |
| **Primary Tasks** | Approve counselling requests, assign clients to counsellors, manage content library, view all analytics |
| **Key Need** | Unified control panel with workflow visibility across the entire platform |
| **Access Level** | Full access to all non-clinical platform data; read-only access to case note metadata (not content) |

---

## 5. Functional Requirements

### 5.1 Authentication & Identity

**FR-AUTH-01** The system shall integrate with HRMIS for employee identity verification at registration.  
✓ *User can log in with HRMIS credentials; non-HRMIS users are blocked.*

**FR-AUTH-02** The system shall enforce role-based access control (RBAC) for Client, Counsellor, Employer, and Admin roles.  
✓ *Each role sees only their permitted screens; unauthorised access returns HTTP 403.*

**FR-AUTH-03** The system shall support multi-factor authentication (MFA) via OTP to registered email or phone.  
✓ *Login with correct credentials + OTP is required; session expires after 30 minutes of inactivity.*

**FR-AUTH-04** The system shall allow a user to reset their password via verified email or phone.  
✓ *Password reset link expires in 15 minutes and can only be used once.*

### 5.2 Session Booking (Client)

**FR-BOOK-01** The system shall allow a Client to select a service type (Individual / Family / Stress / Substance Use / Assessment) before booking.  
✓ *Service type selection is mandatory; booking form does not render without selection.*

**FR-BOOK-02** The system shall display counsellor availability in real-time and allow date/time slot selection.  
✓ *Slots reflect counsellor working hours; already-booked slots are greyed out.*

**FR-BOOK-03** The system shall send automatic booking confirmation to Client via email and/or SMS within 60 seconds of booking confirmation.  
✓ *Confirmation message contains: date, time, service type, and counsellor name; delivery logged.*

**FR-BOOK-04** The system shall reflect the confirmed appointment on the assigned Counsellor's dashboard immediately upon booking.  
✓ *Counsellor dashboard updates in real-time or within 5 seconds without page refresh.*

**FR-BOOK-05** The system shall allow a Client to cancel a booking at least 24 hours before the scheduled session.  
✓ *Cancellation triggers notification to Counsellor; slot becomes available again.*

**FR-BOOK-06** The system shall allow an Employer to refer an employee for counselling, triggering an Admin workflow for approval and assignment.  
✓ *Referral creates a pending Client request visible in the Admin queue; Client receives notification.*

### 5.3 Mood Tracking & Journaling (Client)

**FR-MOOD-01** The system shall present a daily mood check-in via an emoji-scale with 5 discrete states (Very Low / Low / Neutral / Good / Excellent).  
✓ *Check-in modal appears once per day; state persists in database with UTC timestamp.*

**FR-MOOD-02** The system shall allow a Client to add a free-text journal entry to any daily check-in.  
✓ *Journal entry accepts up to 5,000 characters; auto-saved every 30 seconds during editing.*

**FR-MOOD-03** The system shall provide guided journaling prompts (minimum 30 prompts) selectable by the Client.  
✓ *Prompts are categorised by theme (Work Stress / Grief / Gratitude / Relationships); prompt selection is optional.*

**FR-MOOD-04** The system shall display a mood trend chart showing the last 30, 60, or 90 days of daily check-ins.  
✓ *Chart renders within 2 seconds; data points are plotted with date labels.*

**FR-MOOD-05** The system shall allow a Client to record a voice note (max 2 minutes) as part of a journal entry.  
✓ *Voice note is stored as compressed audio file; playback available to Client only.*

**FR-MOOD-06** The system shall allow the assigned Counsellor (and no other user) to view a Client's mood history with the Client's consent.  
✓ *Mood data is only shared with assigned Counsellor after Client provides in-app consent.*

### 5.4 Guided Wellness Content Library

**FR-WELL-01** The system shall provide a structured content library with modules for: CBT exercises, Mindfulness & Meditation, Breathing Techniques, Journaling Prompts, Psychoeducation (articles/videos), Sleep Hygiene Programmes, Stress Management Tools, and Gratitude Practices.  
✓ *All 8 content categories are accessible; each contains a minimum of 5 items at launch.*

**FR-WELL-02** The system shall allow the Admin to create, edit, publish, archive, and delete content items in the library.  
✓ *Content changes are versioned; only Admin can publish; drafts are not visible to Clients.*

**FR-WELL-03** The system shall allow a Counsellor to assign specific content items or modules to an individual Client.  
✓ *Assigned content appears in Client's 'My Programmes' section with a highlighted indicator.*

**FR-WELL-04** The system shall allow a Client to mark content as completed and rate its usefulness (1–5 stars).  
✓ *Completion and rating are recorded per Client-content pair; ratings feed the analytics dashboard.*

**FR-WELL-05** The system shall deliver personalised content recommendations based on Client's mood history and completed content.  
✓ *Recommendation engine surfaces a minimum of 3 relevant items per session based on rules logic.*

### 5.5 Crisis Intervention

**FR-CRISIS-01** The system shall display a persistent, always-visible SOS button on all Client-facing screens.  
✓ *SOS button is rendered in the top navigation bar with a distinct red colour; cannot be hidden.*

**FR-CRISIS-02** The system shall trigger a crisis intake flow upon SOS activation covering 9 sequential steps: Assessment → Safety → Stabilisation → Problem Exploration → Support Activation → Safety Plan → Auto-Referral → Documentation → Follow-Up.  
✓ *All 9 steps are navigable; a Client can exit safely at any step; abandonment is logged for counsellor follow-up.*

**FR-CRISIS-03** The system shall display Kenya emergency contact numbers (Befrienders Kenya, nearest hospital) at Step 5 regardless of counsellor availability.  
✓ *Emergency numbers are hardcoded and versioned by Admin; they cannot be removed.*

**FR-CRISIS-04** The system shall generate an auto-documented crisis incident record attached to the Client's case file, viewable by the assigned Counsellor and Admin.  
✓ *Crisis record is created within 10 seconds of SOS activation; it is immutable after creation.*

### 5.6 Counsellor Dashboard

**FR-COUNS-01** The system shall display a Counsellor's full client list with status indicators (Active / Pending / Crisis).  
✓ *Client list is sorted by next appointment date; crisis-status clients are pinned to the top.*

**FR-COUNS-02** The system shall allow a Counsellor to view, create, edit, and lock session notes for each client.  
✓ *Session notes are auto-saved every 60 seconds; locked notes cannot be edited; access is restricted to the note-authoring Counsellor and System Admin.*

**FR-COUNS-03** The system shall display a Counsellor's upcoming appointments in a daily/weekly/monthly calendar view.  
✓ *Calendar view defaults to weekly; appointments show client name, service type, and session modality.*

**FR-COUNS-04** The system shall allow a Counsellor to update session attendance status (Attended / No-Show / Cancelled).  
✓ *Attendance update triggers utilisation report generation for Admin analytics.*

**FR-COUNS-05** The system shall allow a Counsellor to record a Counsellor Availability Schedule (recurring weekly hours and leave periods).  
✓ *Availability schedule gates the session booking calendar; changes take effect immediately.*

### 5.7 Employer / HR Portal

**FR-EMP-01** The system shall allow an Employer to submit a formal referral for a named employee, selecting service type and urgency level.  
✓ *Referral creates a pending request visible to Admin; employee receives notification.*

**FR-EMP-02** The system shall provide an Employer with anonymised, aggregated wellness utilisation reports for their department.  
✓ *Reports show session counts, service type breakdown, and utilisation trend — no individual-level data.*

### 5.8 Admin Dashboard

**FR-ADMIN-01** The system shall display all pending Client counselling requests in a queue for Admin approval.  
✓ *Queue shows request date, service type, referral source (self/employer), and priority flag.*

**FR-ADMIN-02** The system shall allow Admin to assign an approved Client to a specific Counsellor.  
✓ *Assignment sends notification to both Counsellor and Client; updates Counsellor's client list.*

**FR-ADMIN-03** The system shall provide Admin with a real-time analytics dashboard showing: Daily Active Users, Session Completion Rate, Top-Used Content Modules, Mood Trends (aggregate), Service Utilisation by Type, Counsellor Utilisation Rate.  
✓ *All metrics update within 5 minutes of underlying events; dashboard supports date-range filtering.*

**FR-ADMIN-04** The system shall allow Admin to export all analytics reports as PDF or CSV.  
✓ *Export completes in under 30 seconds for date ranges up to 12 months.*

---

## 6. User Flows

### 6.1 Session Booking Flow (Client)

| Step | Action / System Response |
|---|---|
| **Step 1** | Client logs in via HRMIS credentials + MFA OTP. |
| **Step 2** | Client navigates to 'Book a Session' from home dashboard. |
| **Step 3** | Client selects Service Type (Individual / Family / Stress / Substance Use / Assessment). |
| **Step 4** | System displays available counsellor slots for the next 30 days. |
| **Step 5** | Client selects preferred date and time slot. |
| **Step 6** | Booking confirmation screen shows details; Client confirms. |
| **Step 7 [Success]** | System sends confirmation email/SMS to Client. Appointment appears on Counsellor dashboard. |
| **Step 7 [No Slots]** | System notifies Client of unavailability and offers waitlist or specific counsellor request. |
| **Step 8** | 24-hour automated reminder sent to Client and Counsellor. |
| **Step 9 [Post-Session]** | Counsellor marks attendance; system prompts Counsellor to add session notes within 24 hours. |

### 6.2 Crisis Intervention Flow (SOS Triggered)

| Step | Description |
|---|---|
| **Trigger** | Client taps SOS button from any screen. |
| **Step 1 — Assessment** | System presents 3 standardised crisis assessment questions (PHQ-2 inspired). Responses scored. |
| **Step 2 — Safety** | System confirms Client physical safety. If unsafe, emergency services prompt is displayed. |
| **Step 3 — Stabilisation** | System presents a grounding exercise (5-4-3-2-1 technique) and guided breathing animation. |
| **Step 4 — Problem Exploration** | Client completes a short structured form describing their current situation. |
| **Step 5 — Support Activation** | System checks for online Counsellor. If available → direct chat/call. If unavailable → emergency contacts displayed. |
| **Step 6 — Safety Plan** | Client and/or Counsellor co-build a safety plan (reasons to live, support contacts, warning signs, coping strategies). |
| **Step 7 — Referral** | System auto-creates urgent counselling request; Admin notified immediately. |
| **Step 8 — Documentation** | System auto-generates immutable crisis incident record attached to Client file. |
| **Step 9 — Follow-Up** | System schedules automated follow-up notification to Client at T+24h, T+72h, T+7d. |

### 6.3 Admin Assignment Flow

1. New booking request arrives in Admin queue (status: `PENDING_APPROVAL`).
2. Admin reviews request: service type, referral source, urgency flag.
3. Admin selects an available Counsellor from a filtered list (by specialisation, current caseload, availability).
4. Admin confirms assignment → status changes to `ASSIGNED`.
5. Counsellor and Client both receive assignment notification.
6. Session appears in Counsellor calendar and Client's 'My Appointments'.

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Metric | Target |
|---|---|
| **Page Load Time** | Core pages must load in under 2 seconds on a 5 Mbps connection. |
| **API Response Time** | 95th percentile under 500 ms for reads; under 1 second for writes. |
| **Concurrent Users** | 500 concurrent users in v1.0; 5,000 by v2.0. |
| **Report Generation** | Analytics reports for 12-month ranges must render in under 30 seconds. |

### 7.2 Security

- All data in transit must be encrypted using TLS 1.3 or higher.
- All data at rest must be encrypted using AES-256.
- Session notes, mood entries, and crisis records are classified as **Sensitive Health Data** and require field-level encryption.
- RBAC must prevent any role from accessing data outside its defined scope; violations must trigger audit log entries.
- Session tokens must expire after 30 minutes of inactivity.
- All authentication attempts and sensitive data access events must be logged with user ID, IP address, and timestamp.
- The platform must be penetration-tested before go-live and annually thereafter.

### 7.3 Availability & Reliability

- Target uptime: **99.5%** (approximately 22 hours maximum unplanned downtime per year).
- Planned maintenance windows communicated 48 hours in advance; scheduled outside 08:00–17:00 EAT Monday–Friday.
- Automated database backups with a Recovery Point Objective (RPO) of 1 hour.
- Recovery Time Objective (RTO): System restored within 4 hours of confirmed outage.

### 7.4 Compliance

- The platform must comply with the **Kenya Data Protection Act 2019** and the National Privacy Principles issued thereunder.
- PII and health data must be stored within Kenya-based data centre infrastructure (data residency requirement).
- The platform must support the right to data erasure (Article 26, Kenya DPA) — user data deletion must be executable by Admin within 30 days of request.
- All data processing activities must be documented in a Data Processing Register.

### 7.5 Accessibility

- The platform must meet **WCAG 2.1 Level AA** accessibility standards.
- All interactive elements must be keyboard-navigable.
- Colour contrast ratios must meet minimum 4.5:1 for normal text; 3:1 for large text.
- Core screens must function on low-bandwidth connections (2G equivalent — 64 kbps) with graceful degradation (text-first fallback for media).

---

## 8. Data Model Overview

| Entity | Purpose | Key Fields |
|---|---|---|
| `users` | All platform users across roles | id, email, phone, role, hrmis_id, department, created_at |
| `clients` | Extended profile for Client role | user_id (FK), service_history, consent_flags |
| `counsellors` | Extended profile for Counsellor role | user_id (FK), specialisations, availability_schedule |
| `employers` | Extended profile for Employer/HR role | user_id (FK), department, organisation |
| `appointments` | Booking records | id, client_id, counsellor_id, service_type, status, scheduled_at |
| `session_notes` | Counsellor clinical notes | id, appointment_id, counsellor_id, content_encrypted, locked |
| `mood_entries` | Daily Client mood check-ins | id, client_id, mood_score, journal_text, voice_note_url, created_at |
| `content_items` | Wellness library content | id, category, title, body, media_url, status, version |
| `content_assignments` | Counsellor-to-client content links | id, counsellor_id, client_id, content_item_id, assigned_at |
| `crisis_events` | Crisis incident records | id, client_id, triggered_at, assessment_responses, safety_plan, status |
| `referrals` | Employer referral records | id, employer_id, client_id, service_type, urgency, status |
| `notifications` | System notification log | id, user_id, channel (email/sms), type, status, sent_at |

---

## 9. Integrations & Dependencies

| System / Service | Purpose & Notes |
|---|---|
| **HRMIS** | Employee identity verification at registration and login. SSO via OAuth2 / SAML. Assumption: HRMIS exposes a REST API or SAML endpoint. |
| **Email Service (SMTP/API)** | Booking confirmations, MFA OTPs, crisis follow-ups, admin notifications. Recommended: SendGrid or AWS SES. |
| **SMS Gateway** | OTP delivery, booking confirmations, crisis follow-up alerts. Recommended: Africa's Talking (Kenya DID numbers, local routing). |
| **Video/Audio Call** | Future Phase 2 — not required in v1.0. Recommended: Jitsi Meet self-hosted or Zoom SDK. |
| **Storage (Files/Media)** | Voice notes, psychoeducation videos, content images. Recommended: AWS S3 with server-side encryption. |
| **Analytics Engine** | Aggregate dashboard computation. Recommended: PostgreSQL materialised views + Metabase or custom dashboard. |

---

## 10. Constraints & Assumptions

### 10.1 Constraints

- No billing module — platform is fully government-funded.
- Data must reside in Kenya — cloud deployment must use a Nairobi or Kenya-region data centre.
- HRMIS integration is required for Client identity — non-government users cannot register in v1.0.
- No mobile native app in v1.0 — responsive web application + PWA only.
- Session notes are not exportable by Clients — clinical data access is restricted.

### 10.2 Assumptions

- **[A1]** HRMIS exposes an OAuth2 or SAML 2.0 endpoint for SSO. *Risk: If not available, a separate employee verification flow must be designed.*
- **[A2]** All counsellors are Directorate employees or vetted contractors — no open marketplace registration.
- **[A3]** Internet connectivity is available to target users via office networks or personal mobile data. Low-bandwidth optimisation is required but full offline mode is out of scope.
- **[A4]** The Directorate will provide a content library seed dataset (minimum 40 items across 8 categories) before launch.
- **[A5]** Peer support / anonymous community features are deferred to Phase 2 due to trust and safety infrastructure requirements.
- **[A6]** The booking flow confirms no payment step — the HRMIS self-service portal is the employee entry point.

---

## 11. Risks & Open Questions

### 11.1 Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **R1 — HRMIS API Unavailable** | HIGH | Design a parallel registration path using National ID + work email verification as fallback. |
| **R2 — Low Adoption Due to Residual Stigma** | HIGH | Platform must enable full anonymous engagement; reinforce via change management campaign. |
| **R3 — Crisis Escalation Without Online Counsellor** | HIGH | Hardcode emergency contacts; implement an on-call counsellor duty roster with mobile push alerts. |
| **R4 — Data Breach of Health Records** | HIGH | Field-level encryption, quarterly pen tests, Kenya DPA compliance, audit logging. |
| **R5 — Counsellor Capacity Insufficient for Demand** | MEDIUM | Analytics dashboard to track counsellor utilisation; trigger Admin alert at 80% caseload capacity. |
| **R6 — Low-Bandwidth Users Cannot Access Media Content** | MEDIUM | Text-first fallback for all content; lazy-load media; compress audio/video to minimum quality thresholds. |

### 11.2 Open Questions for Directorate Decision

- **OQ1:** Will HRMIS expose an API? If yes, what protocol (REST/SAML)? Timeline for integration readiness?
- **OQ2:** Should mood data and crisis records be shareable with counsellors by default, or require explicit per-session Client consent?
- **OQ3:** Is the employer referral flow one-way (employer → Admin), or should the referred employee be able to see who referred them?
- **OQ4:** What is the agreed protocol for a crisis event where the Client is in immediate physical danger (police/ambulance integration)?
- **OQ5:** Will peer support (anonymous community forums) be required in Phase 2? If so, what moderation resources are available?

---

## 12. Success Metrics

| ID | Metric | Definition | Target |
|---|---|---|---|
| SM-01 | Platform Adoption Rate | % of eligible public servants registered within 6 months | > 20% of workforce |
| SM-02 | Session Booking Completion | % of initiated bookings that result in attended sessions | > 70% |
| SM-03 | Daily Active Users (DAU) | Unique daily logins across all roles | 500+ at 3 months post-launch |
| SM-04 | Mood Tracking Engagement | % of active Clients completing daily check-ins | > 60% weekly average |
| SM-05 | Content Completion Rate | % of assigned wellness content items completed by Clients | > 50% |
| SM-06 | Crisis Protocol Completion | % of SOS events that reach Step 7 (Auto-Referral) | > 85% |
| SM-07 | Counsellor Caseload Utilisation | Average active clients per counsellor | 15–25 per counsellor |
| SM-08 | Employer Referral Conversion | % of employer referrals that result in attended sessions | > 60% |
| SM-09 | System Availability | Platform uptime | > 99.5% |
| SM-10 | Data Breach Incidents | Number of confirmed data security incidents per year | 0 |

---

*Document Version: v1.0 · March 2026 · Directorate of Counselling and Wellness Services · CONFIDENTIAL*
