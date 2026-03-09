export const serviceTypes = [
  "INDIVIDUAL",
  "FAMILY",
  "STRESS",
  "SUBSTANCE_USE",
  "ASSESSMENT",
] as const;

export type ServiceType = (typeof serviceTypes)[number];

export const appointmentStatuses = [
  "SCHEDULED",
  "ATTENDED",
  "NO_SHOW",
  "CANCELLED",
] as const;

export type AppointmentStatus = (typeof appointmentStatuses)[number];

export const requestSources = [
  "SELF_SERVICE",
  "WAITLIST",
  "SPECIFIC_COUNSELLOR",
  "EMPLOYER_REFERRAL",
  "CRISIS",
] as const;

export type RequestSource = (typeof requestSources)[number];

export const requestStatuses = [
  "PENDING_APPROVAL",
  "ASSIGNED",
  "REJECTED",
] as const;

export type RequestStatus = (typeof requestStatuses)[number];

export const urgencyLevels = ["ROUTINE", "URGENT", "CRISIS"] as const;

export type UrgencyLevel = (typeof urgencyLevels)[number];

export type AvailabilityRule = {
  counsellorId: string;
  dayOfWeek: number;
  endTime: string;
  id: string;
  isActive: boolean;
  startTime: string;
};

export type LeavePeriod = {
  counsellorId: string;
  endsOn: string;
  id: string;
  reason: string;
  startsOn: string;
};

export type CounsellorProfile = {
  activeCaseload: number;
  bio: string;
  employerName: string;
  id: string;
  languages: string[];
  maxCaseload: number;
  specialisations: string[];
  title: string;
};

export type Appointment = {
  clientId: string;
  clientName: string;
  counsellorId: string;
  counsellorName: string;
  id: string;
  modality: "IN_PERSON" | "VIDEO";
  scheduledAt: string;
  serviceType: ServiceType;
  source: "DIRECT_BOOKING" | "REQUEST_ASSIGNMENT";
  status: AppointmentStatus;
};

export type CounsellingRequest = {
  assignedAppointmentId?: string;
  assignedCounsellorId?: string;
  assignedCounsellorName?: string;
  clientId: string;
  clientName: string;
  id: string;
  notes?: string;
  preferredCounsellorId?: string;
  preferredCounsellorName?: string;
  reason?: string;
  requestedAt: string;
  serviceType: ServiceType;
  source: RequestSource;
  status: RequestStatus;
  urgency: UrgencyLevel;
};

export type AvailabilitySlot = {
  counsellorId: string;
  counsellorName: string;
  endsAt: string;
  startsAt: string;
};
