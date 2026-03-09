-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'COUNSELLOR', 'EMPLOYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'READ');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('INDIVIDUAL', 'FAMILY', 'STRESS', 'SUBSTANCE_USE', 'ASSESSMENT');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'ATTENDED', 'NO_SHOW', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RequestSource" AS ENUM ('SELF_SERVICE', 'WAITLIST', 'SPECIFIC_COUNSELLOR', 'EMPLOYER_REFERRAL', 'CRISIS');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING_APPROVAL', 'ASSIGNED', 'REJECTED');

-- CreateEnum
CREATE TYPE "UrgencyLevel" AS ENUM ('ROUTINE', 'URGENT', 'CRISIS');

-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('SUBMITTED', 'ASSIGNED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'DROPPED');

-- CreateEnum
CREATE TYPE "CrisisSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('PENDING', 'SCHEDULED', 'COMPLETED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "role" "UserRole" NOT NULL,
    "department" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "user_id" UUID NOT NULL,
    "preferred_language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "consent_mood_sharing" BOOLEAN NOT NULL DEFAULT false,
    "consent_mood_sharing_at" TIMESTAMPTZ(6),
    "consent_flags" JSONB NOT NULL DEFAULT '{}',
    "service_history_summary" JSONB NOT NULL DEFAULT '[]',
    "emergency_contact_name" VARCHAR(255),
    "emergency_contact_phone" VARCHAR(20),
    "onboarding_completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "counsellors" (
    "user_id" UUID NOT NULL,
    "licence_number" VARCHAR(100) NOT NULL,
    "specialisations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "max_caseload" INTEGER NOT NULL DEFAULT 25,
    "is_on_call" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "counsellors_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "employers" (
    "user_id" UUID NOT NULL,
    "organisation" VARCHAR(255) NOT NULL,
    "department_scope" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "employers_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "sent_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "target_table" VARCHAR(100) NOT NULL,
    "target_id" UUID NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "ip_address" INET,
    "user_agent" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counsellor_availability_rules" (
    "id" UUID NOT NULL,
    "counsellor_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TIME(6) NOT NULL,
    "end_time" TIME(6) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "counsellor_availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counsellor_leave_periods" (
    "id" UUID NOT NULL,
    "counsellor_id" UUID NOT NULL,
    "starts_on" DATE NOT NULL,
    "ends_on" DATE NOT NULL,
    "reason" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "counsellor_leave_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counselling_requests" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "source" "RequestSource" NOT NULL,
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'ROUTINE',
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "preferred_counsellor_id" UUID,
    "notes" TEXT,
    "admin_reason" TEXT,
    "assigned_counsellor_id" UUID,
    "assigned_at" TIMESTAMPTZ(6),
    "rejected_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "counselling_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "counsellor_id" UUID NOT NULL,
    "counselling_request_id" UUID,
    "service_type" "ServiceType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "modality" VARCHAR(20) NOT NULL DEFAULT 'VIDEO',
    "scheduled_at" TIMESTAMPTZ(6) NOT NULL,
    "cancelled_at" TIMESTAMPTZ(6),
    "cancelled_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "refresh_token_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" UUID NOT NULL,
    "employer_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "counselling_request_id" UUID,
    "service_type" "ServiceType" NOT NULL,
    "urgency" "UrgencyLevel" NOT NULL DEFAULT 'ROUTINE',
    "status" "ReferralStatus" NOT NULL DEFAULT 'SUBMITTED',
    "notes" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_entries" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "value" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "prompt" VARCHAR(500),
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_notes" (
    "id" UUID NOT NULL,
    "counsellor_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "appointment_id" UUID,
    "content" TEXT NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "locked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "session_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "body" TEXT,
    "category" VARCHAR(200) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "emoji" VARCHAR(10),
    "duration" VARCHAR(50),
    "author_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_assignments" (
    "id" UUID NOT NULL,
    "content_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "assigned_by" UUID NOT NULL,
    "completed_at" TIMESTAMPTZ(6),
    "rating" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programmes" (
    "id" UUID NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "module_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "programmes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programme_enrollments" (
    "id" UUID NOT NULL,
    "programme_id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "completed_modules" INTEGER NOT NULL DEFAULT 0,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "programme_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crisis_events" (
    "id" UUID NOT NULL,
    "client_id" UUID NOT NULL,
    "severity" "CrisisSeverity" NOT NULL DEFAULT 'MEDIUM',
    "follow_up_status" "FollowUpStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "crisis_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_settings" (
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "counsellors_licence_number_key" ON "counsellors"("licence_number");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_log_user_id_occurred_at_idx" ON "audit_log"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "counsellor_availability_rules_counsellor_id_day_of_week_idx" ON "counsellor_availability_rules"("counsellor_id", "day_of_week");

-- CreateIndex
CREATE UNIQUE INDEX "counsellor_availability_rules_counsellor_id_day_of_week_sta_key" ON "counsellor_availability_rules"("counsellor_id", "day_of_week", "start_time", "end_time");

-- CreateIndex
CREATE INDEX "counsellor_leave_periods_counsellor_id_starts_on_ends_on_idx" ON "counsellor_leave_periods"("counsellor_id", "starts_on", "ends_on");

-- CreateIndex
CREATE INDEX "counselling_requests_client_id_status_idx" ON "counselling_requests"("client_id", "status");

-- CreateIndex
CREATE INDEX "counselling_requests_assigned_counsellor_id_status_idx" ON "counselling_requests"("assigned_counsellor_id", "status");

-- CreateIndex
CREATE INDEX "counselling_requests_status_created_at_idx" ON "counselling_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "appointments_client_id_scheduled_at_idx" ON "appointments"("client_id", "scheduled_at");

-- CreateIndex
CREATE INDEX "appointments_status_scheduled_at_idx" ON "appointments"("status", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_counsellor_id_scheduled_at_key" ON "appointments"("counsellor_id", "scheduled_at");

-- CreateIndex
CREATE UNIQUE INDEX "auth_sessions_refresh_token_id_key" ON "auth_sessions"("refresh_token_id");

-- CreateIndex
CREATE INDEX "auth_sessions_user_id_expires_at_idx" ON "auth_sessions"("user_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_counselling_request_id_key" ON "referrals"("counselling_request_id");

-- CreateIndex
CREATE INDEX "referrals_employer_id_created_at_idx" ON "referrals"("employer_id", "created_at");

-- CreateIndex
CREATE INDEX "referrals_status_created_at_idx" ON "referrals"("status", "created_at");

-- CreateIndex
CREATE INDEX "mood_entries_client_id_created_at_idx" ON "mood_entries"("client_id", "created_at");

-- CreateIndex
CREATE INDEX "journal_entries_client_id_created_at_idx" ON "journal_entries"("client_id", "created_at");

-- CreateIndex
CREATE INDEX "session_notes_counsellor_id_created_at_idx" ON "session_notes"("counsellor_id", "created_at");

-- CreateIndex
CREATE INDEX "session_notes_client_id_created_at_idx" ON "session_notes"("client_id", "created_at");

-- CreateIndex
CREATE INDEX "content_status_category_idx" ON "content"("status", "category");

-- CreateIndex
CREATE INDEX "content_assignments_client_id_idx" ON "content_assignments"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_assignments_content_id_client_id_key" ON "content_assignments"("content_id", "client_id");

-- CreateIndex
CREATE INDEX "programme_enrollments_client_id_idx" ON "programme_enrollments"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "programme_enrollments_programme_id_client_id_key" ON "programme_enrollments"("programme_id", "client_id");

-- CreateIndex
CREATE INDEX "crisis_events_client_id_created_at_idx" ON "crisis_events"("client_id", "created_at");

-- CreateIndex
CREATE INDEX "crisis_events_follow_up_status_idx" ON "crisis_events"("follow_up_status");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counsellors" ADD CONSTRAINT "counsellors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employers" ADD CONSTRAINT "employers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counsellor_availability_rules" ADD CONSTRAINT "counsellor_availability_rules_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "counsellors"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counsellor_leave_periods" ADD CONSTRAINT "counsellor_leave_periods_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "counsellors"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselling_requests" ADD CONSTRAINT "counselling_requests_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselling_requests" ADD CONSTRAINT "counselling_requests_preferred_counsellor_id_fkey" FOREIGN KEY ("preferred_counsellor_id") REFERENCES "counsellors"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counselling_requests" ADD CONSTRAINT "counselling_requests_assigned_counsellor_id_fkey" FOREIGN KEY ("assigned_counsellor_id") REFERENCES "counsellors"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "counsellors"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_counselling_request_id_fkey" FOREIGN KEY ("counselling_request_id") REFERENCES "counselling_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_counselling_request_id_fkey" FOREIGN KEY ("counselling_request_id") REFERENCES "counselling_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_entries" ADD CONSTRAINT "mood_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_counsellor_id_fkey" FOREIGN KEY ("counsellor_id") REFERENCES "counsellors"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_assignments" ADD CONSTRAINT "content_assignments_content_id_fkey" FOREIGN KEY ("content_id") REFERENCES "content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_assignments" ADD CONSTRAINT "content_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_enrollments" ADD CONSTRAINT "programme_enrollments_programme_id_fkey" FOREIGN KEY ("programme_id") REFERENCES "programmes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "programme_enrollments" ADD CONSTRAINT "programme_enrollments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crisis_events" ADD CONSTRAINT "crisis_events_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
