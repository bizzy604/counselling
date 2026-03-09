import { PrismaClient } from "@prisma/client";

import { hashPassword } from "../src/server/auth/passwords";

const prisma = new PrismaClient();

type AvailabilitySeedTuple = [string, number, string, string];

const ids = {
  adminGrace: "44f44444-4444-4444-8444-444444444444",
  appointmentSamuelFollowup: "90444444-4444-4444-8444-444444444444",
  appointmentWanjikuNext: "90333333-3333-4333-8333-333333333333",
  clientFaith: "88f88888-8888-4888-8888-888888888888",
  clientSamuel: "77f77777-7777-4777-8777-777777777777",
  clientWanjiku: "11f11111-1111-4111-8111-111111111111",
  counsellorMary: "55f55555-5555-4555-8555-555555555555",
  counsellorOtieno: "22f22222-2222-4222-8222-222222222222",
  counsellorPeter: "66f66666-6666-4666-8666-666666666666",
  employerAlex: "33f33333-3333-4333-8333-333333333333",
  notificationEmployerReferral: "90666666-6666-4666-8666-666666666666",
  notificationWanjikuBooking: "90777777-7777-4777-8777-777777777777",
  referralFaith: "90555555-5555-4555-8555-555555555555",
  requestFaithUrgent: "90222222-2222-4222-8222-222222222222",
  requestWanjikuWaitlist: "90111111-1111-4111-8111-111111111111",
  wairimuLeave: "90888888-8888-4888-8888-888888888888",
} as const;

function daysFromNow(days: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function timeValue(time: string) {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

async function main() {
  const users = [
    {
      department: "Ministry of Public Service",
      email: "wanjiku.mwangi@ps.go.ke",
      firstName: "Wanjiku",
      id: ids.clientWanjiku,
      lastName: "Mwangi",
      password: "Client@123",
      phone: "+254712345678",
      role: "CLIENT" as const,
    },
    {
      department: "Directorate of Counselling and Wellness Services",
      email: "otieno.achieng@cwe.go.ke",
      firstName: "Dr. Otieno",
      id: ids.counsellorOtieno,
      lastName: "Achieng",
      password: "Counsellor@123",
      phone: "+254722334455",
      role: "COUNSELLOR" as const,
    },
    {
      department: "Ministry of Health",
      email: "alex.kamau@health.go.ke",
      firstName: "Alex",
      id: ids.employerAlex,
      lastName: "Kamau",
      password: "Employer@123",
      phone: "+254733112233",
      role: "EMPLOYER" as const,
    },
    {
      department: "Directorate of Counselling and Wellness Services",
      email: "grace.njeri@cwe.go.ke",
      firstName: "Grace",
      id: ids.adminGrace,
      lastName: "Njeri",
      password: "Admin@123",
      phone: "+254700123456",
      role: "ADMIN" as const,
    },
    {
      department: "Ministry of Health",
      email: "samuel.oduor@health.go.ke",
      firstName: "Samuel",
      id: ids.clientSamuel,
      lastName: "Oduor",
      password: "Client@123",
      phone: "+254701010101",
      role: "CLIENT" as const,
    },
    {
      department: "Ministry of Health",
      email: "faith.njoki@health.go.ke",
      firstName: "Faith",
      id: ids.clientFaith,
      lastName: "Njoki",
      password: "Client@123",
      phone: "+254702020202",
      role: "CLIENT" as const,
    },
    {
      department: "Directorate of Counselling and Wellness Services",
      email: "mary.wairimu@cwe.go.ke",
      firstName: "Mary",
      id: ids.counsellorMary,
      lastName: "Wairimu",
      password: "Counsellor@123",
      phone: "+254703030303",
      role: "COUNSELLOR" as const,
    },
    {
      department: "Directorate of Counselling and Wellness Services",
      email: "peter.mutua@cwe.go.ke",
      firstName: "Peter",
      id: ids.counsellorPeter,
      lastName: "Mutua",
      password: "Counsellor@123",
      phone: "+254704040404",
      role: "COUNSELLOR" as const,
    },
  ];

  for (const user of users) {
    const passwordHash = await hashPassword(user.password);
    await prisma.user.upsert({
      create: {
        department: user.department,
        email: user.email,
        firstName: user.firstName,
        id: user.id,
        lastLoginAt: new Date(),
        lastName: user.lastName,
        passwordHash,
        phone: user.phone,
        role: user.role,
      },
      update: {
        department: user.department,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        passwordHash,
        phone: user.phone,
        role: user.role,
      },
      where: { id: user.id },
    });
  }

  for (const clientId of [ids.clientWanjiku, ids.clientSamuel, ids.clientFaith]) {
    await prisma.client.upsert({
      create: { userId: clientId },
      update: {},
      where: { userId: clientId },
    });
  }

  await prisma.counsellor.upsert({
    create: {
      bio: "Trauma-informed counsellor focused on work stress, adjustment, and assessment.",
      licenceNumber: "CWE-LIC-001",
      maxCaseload: 25,
      specialisations: ["Stress", "Assessment", "Individual"],
      userId: ids.counsellorOtieno,
    },
    update: {
      bio: "Trauma-informed counsellor focused on work stress, adjustment, and assessment.",
      maxCaseload: 25,
      specialisations: ["Stress", "Assessment", "Individual"],
    },
    where: { userId: ids.counsellorOtieno },
  });

  await prisma.counsellor.upsert({
    create: {
      bio: "Family and substance-use specialist supporting blended and high-pressure households.",
      licenceNumber: "CWE-LIC-002",
      maxCaseload: 20,
      specialisations: ["Family", "Substance Use", "Stress"],
      userId: ids.counsellorMary,
    },
    update: {
      bio: "Family and substance-use specialist supporting blended and high-pressure households.",
      maxCaseload: 20,
      specialisations: ["Family", "Substance Use", "Stress"],
    },
    where: { userId: ids.counsellorMary },
  });

  await prisma.counsellor.upsert({
    create: {
      bio: "Short-term intervention practitioner with availability for urgent triage and follow-up.",
      licenceNumber: "CWE-LIC-003",
      maxCaseload: 18,
      specialisations: ["Assessment", "Individual", "Urgent"],
      userId: ids.counsellorPeter,
    },
    update: {
      bio: "Short-term intervention practitioner with availability for urgent triage and follow-up.",
      maxCaseload: 18,
      specialisations: ["Assessment", "Individual", "Urgent"],
    },
    where: { userId: ids.counsellorPeter },
  });

  await prisma.employer.upsert({
    create: {
      departmentScope: "Ministry of Health",
      organisation: "Ministry of Health",
      userId: ids.employerAlex,
    },
    update: {
      departmentScope: "Ministry of Health",
      organisation: "Ministry of Health",
    },
    where: { userId: ids.employerAlex },
  });

  await prisma.counsellorAvailabilityRule.deleteMany();
  await prisma.counsellorAvailabilityRule.createMany({
    data: ([
      [ids.counsellorOtieno, 1, "09:00", "16:00"],
      [ids.counsellorOtieno, 2, "09:00", "16:00"],
      [ids.counsellorOtieno, 3, "09:00", "16:00"],
      [ids.counsellorOtieno, 4, "09:00", "16:00"],
      [ids.counsellorOtieno, 5, "09:00", "14:00"],
      [ids.counsellorMary, 1, "10:00", "17:00"],
      [ids.counsellorMary, 2, "10:00", "17:00"],
      [ids.counsellorMary, 3, "10:00", "17:00"],
      [ids.counsellorMary, 4, "10:00", "17:00"],
      [ids.counsellorPeter, 1, "08:00", "15:00"],
      [ids.counsellorPeter, 3, "08:00", "15:00"],
      [ids.counsellorPeter, 5, "08:00", "15:00"],
    ] satisfies AvailabilitySeedTuple[]).map(([counsellorId, dayOfWeek, start, end]) => ({
      counsellorId,
      dayOfWeek,
      endTime: timeValue(end),
      isActive: true,
      startTime: timeValue(start),
    })),
  });

  await prisma.counsellorLeavePeriod.upsert({
    create: {
      counsellorId: ids.counsellorMary,
      endsOn: daysFromNow(7, 0),
      id: ids.wairimuLeave,
      reason: "Clinical supervision",
      startsOn: daysFromNow(6, 0),
    },
    update: {
      endsOn: daysFromNow(7, 0),
      reason: "Clinical supervision",
      startsOn: daysFromNow(6, 0),
    },
    where: { id: ids.wairimuLeave },
  });

  await prisma.counsellingRequest.upsert({
    create: {
      clientId: ids.clientWanjiku,
      id: ids.requestWanjikuWaitlist,
      notes: "Prefers late afternoon if no immediate slot is available.",
      serviceType: "STRESS",
      source: "WAITLIST",
      status: "PENDING_APPROVAL",
      urgency: "ROUTINE",
    },
    update: {
      notes: "Prefers late afternoon if no immediate slot is available.",
      serviceType: "STRESS",
      source: "WAITLIST",
      status: "PENDING_APPROVAL",
      urgency: "ROUTINE",
    },
    where: { id: ids.requestWanjikuWaitlist },
  });

  await prisma.counsellingRequest.upsert({
    create: {
      clientId: ids.clientFaith,
      id: ids.requestFaithUrgent,
      notes: "Supervisor has requested quick follow-up after a workplace incident.",
      serviceType: "ASSESSMENT",
      source: "EMPLOYER_REFERRAL",
      status: "PENDING_APPROVAL",
      urgency: "URGENT",
    },
    update: {
      notes: "Supervisor has requested quick follow-up after a workplace incident.",
      serviceType: "ASSESSMENT",
      source: "EMPLOYER_REFERRAL",
      status: "PENDING_APPROVAL",
      urgency: "URGENT",
    },
    where: { id: ids.requestFaithUrgent },
  });

  await prisma.referral.upsert({
    create: {
      clientId: ids.clientFaith,
      counsellingRequestId: ids.requestFaithUrgent,
      employerId: ids.employerAlex,
      id: ids.referralFaith,
      notes: "Supervisor follow-up requested after a workplace incident.",
      serviceType: "ASSESSMENT",
      status: "SUBMITTED",
      urgency: "URGENT",
    },
    update: {
      notes: "Supervisor follow-up requested after a workplace incident.",
      serviceType: "ASSESSMENT",
      status: "SUBMITTED",
      urgency: "URGENT",
    },
    where: { id: ids.referralFaith },
  });

  await prisma.appointment.upsert({
    create: {
      clientId: ids.clientWanjiku,
      counsellorId: ids.counsellorOtieno,
      id: ids.appointmentWanjikuNext,
      modality: "VIDEO",
      scheduledAt: daysFromNow(2, 10),
      serviceType: "STRESS",
      status: "SCHEDULED",
    },
    update: {
      counsellorId: ids.counsellorOtieno,
      modality: "VIDEO",
      scheduledAt: daysFromNow(2, 10),
      serviceType: "STRESS",
      status: "SCHEDULED",
    },
    where: { id: ids.appointmentWanjikuNext },
  });

  await prisma.appointment.upsert({
    create: {
      clientId: ids.clientSamuel,
      counsellorId: ids.counsellorOtieno,
      id: ids.appointmentSamuelFollowup,
      modality: "IN_PERSON",
      scheduledAt: daysFromNow(3, 14),
      serviceType: "INDIVIDUAL",
      status: "SCHEDULED",
    },
    update: {
      counsellorId: ids.counsellorOtieno,
      modality: "IN_PERSON",
      scheduledAt: daysFromNow(3, 14),
      serviceType: "INDIVIDUAL",
      status: "SCHEDULED",
    },
    where: { id: ids.appointmentSamuelFollowup },
  });

  await prisma.notification.upsert({
    create: {
      channel: "IN_APP",
      id: ids.notificationWanjikuBooking,
      payload: {
        appointmentId: ids.appointmentWanjikuNext,
        message: "Your stress-management session has been confirmed.",
      },
      sentAt: new Date(),
      status: "SENT",
      type: "BOOKING_CONFIRMED",
      userId: ids.clientWanjiku,
    },
    update: {
      payload: {
        appointmentId: ids.appointmentWanjikuNext,
        message: "Your stress-management session has been confirmed.",
      },
      sentAt: new Date(),
      status: "SENT",
      type: "BOOKING_CONFIRMED",
      userId: ids.clientWanjiku,
    },
    where: { id: ids.notificationWanjikuBooking },
  });

  await prisma.notification.upsert({
    create: {
      channel: "IN_APP",
      id: ids.notificationEmployerReferral,
      payload: {
        message: "Referral submitted to the admin queue.",
        referralId: ids.referralFaith,
      },
      sentAt: new Date(),
      status: "SENT",
      type: "REFERRAL_SUBMITTED",
      userId: ids.employerAlex,
    },
    update: {
      payload: {
        message: "Referral submitted to the admin queue.",
        referralId: ids.referralFaith,
      },
      sentAt: new Date(),
      status: "SENT",
      type: "REFERRAL_SUBMITTED",
      userId: ids.employerAlex,
    },
    where: { id: ids.notificationEmployerReferral },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
