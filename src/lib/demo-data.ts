import type { Role, RoleSlug, SessionUser } from "@/server/auth/types";

export const demoEntityIds = {
  adminGrace: "44f44444-4444-4444-8444-444444444444",
  clientFaith: "88f88888-8888-4888-8888-888888888888",
  clientSamuel: "77f77777-7777-4777-8777-777777777777",
  clientWanjiku: "11f11111-1111-4111-8111-111111111111",
  counsellorMary: "55f55555-5555-4555-8555-555555555555",
  counsellorOtieno: "22f22222-2222-4222-8222-222222222222",
  counsellorPeter: "66f66666-6666-4666-8666-666666666666",
  employerAlex: "33f33333-3333-4333-8333-333333333333",
} as const;

export const roleToSlug: Record<Role, RoleSlug> = {
  CLIENT: "client",
  COUNSELLOR: "counsellor",
  EMPLOYER: "employer",
  ADMIN: "admin",
};

export const slugToRole: Record<RoleSlug, Role> = {
  client: "CLIENT",
  counsellor: "COUNSELLOR",
  employer: "EMPLOYER",
  admin: "ADMIN",
};

export const demoUsers: Record<Role, SessionUser> = {
  CLIENT: {
    id: demoEntityIds.clientWanjiku,
    firstName: "Wanjiku",
    lastName: "Mwangi",
    role: "CLIENT",
    department: "Ministry of Public Service",
    email: "wanjiku.mwangi@ps.go.ke",
    phone: "+254712345678",
    employerName: "Ministry of Public Service",
  },
  COUNSELLOR: {
    id: demoEntityIds.counsellorOtieno,
    firstName: "Dr. Otieno",
    lastName: "Achieng",
    role: "COUNSELLOR",
    department: "Directorate of Counselling and Wellness Services",
    email: "otieno.achieng@cwe.go.ke",
    phone: "+254722334455",
    employerName: "Directorate of Counselling and Wellness Services",
  },
  EMPLOYER: {
    id: demoEntityIds.employerAlex,
    firstName: "Alex",
    lastName: "Kamau",
    role: "EMPLOYER",
    department: "Ministry of Health",
    email: "alex.kamau@health.go.ke",
    phone: "+254733112233",
    employerName: "Ministry of Health",
  },
  ADMIN: {
    id: demoEntityIds.adminGrace,
    firstName: "Grace",
    lastName: "Njeri",
    role: "ADMIN",
    department: "Directorate of Counselling and Wellness Services",
    email: "grace.njeri@cwe.go.ke",
    phone: "+254700123456",
    employerName: "Directorate of Counselling and Wellness Services",
  },
};

const previewPasswords = {
  ADMIN: "Admin@123",
  CLIENT: "Client@123",
  COUNSELLOR: "Counsellor@123",
  EMPLOYER: "Employer@123",
} as const;

export const previewAccounts = [
  {
    ...demoUsers.CLIENT,
    password: previewPasswords.CLIENT,
  },
  {
    ...demoUsers.COUNSELLOR,
    password: previewPasswords.COUNSELLOR,
  },
  {
    ...demoUsers.EMPLOYER,
    password: previewPasswords.EMPLOYER,
  },
  {
    ...demoUsers.ADMIN,
    password: previewPasswords.ADMIN,
  },
];

export const authPreviewAccounts = previewAccounts.map((user) => ({
  department: user.department,
  email: user.email,
  name: `${user.firstName} ${user.lastName}`,
  password: user.password,
  role: user.role,
}));

export const clientDashboard = {
  upcomingAppointment: {
    title: "Stress Management Session",
    counsellor: "Dr. Otieno",
    scheduledAt: "Wednesday, 11 March 2026 at 10:00 AM",
  },
  progress: {
    moodStreak: 6,
    programmesCompleted: 3,
    programmesAssigned: 5,
  },
  recommendations: [
    "10-minute guided breathing",
    "Work stress journal prompt",
    "Sleep hygiene evening reset",
  ],
};

export const counsellorDashboard = {
  caseload: "18 / 25",
  todayAppointments: 4,
  pendingNotes: 2,
  nextAppointment: "10:00 AM - Stress Management - Wanjiku M.",
  clients: [
    { name: "Wanjiku M.", status: "Crisis", next: "10:00 AM" },
    { name: "Peter K.", status: "Active", next: "1:30 PM" },
    { name: "Faith N.", status: "Pending", next: "Friday" },
  ],
};

export const employerDashboard = {
  referralsSubmitted: 14,
  attendedSessions: "9 / 14",
  utilisationTrend: "+12%",
  departmentHighlights: [
    "Stress services remain the most requested category.",
    "Session attendance improved after reminder delivery was added.",
    "No individual-level clinical data is exposed in this view.",
  ],
};

export const adminDashboard = {
  kpis: [
    { label: "Daily Active Users", value: "247", delta: "+14%" },
    { label: "Booking Completion", value: "83%", delta: "+6%" },
    { label: "Crisis Events", value: "12", delta: "-2" },
    { label: "Platform Uptime", value: "99.5%", delta: "On target" },
  ],
  queue: [
    {
      client: "Wanjiku M.",
      source: "Employer referral",
      serviceType: "Stress",
      urgency: "Urgent",
    },
    {
      client: "Samuel O.",
      source: "Self-service waitlist",
      serviceType: "Individual",
      urgency: "Routine",
    },
  ],
};

export const publishedContent = [
  {
    id: "breathing-reset",
    title: "Breathing Reset",
    category: "BREATHING",
    summary: "A short guided exercise for grounding during difficult moments.",
  },
  {
    id: "sleep-hygiene",
    title: "Sleep Hygiene Evening Reset",
    category: "SLEEP",
    summary: "A practical routine for better rest on busy workweeks.",
  },
  {
    id: "work-stress-journal",
    title: "Work Stress Prompt",
    category: "JOURNALING",
    summary: "A structured prompt for naming pressure and reframing next steps.",
  },
];
