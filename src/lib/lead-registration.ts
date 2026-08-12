import "server-only";

import { db } from "@/lib/db";

export type LeadRegistrationProfile = {
  userId: string;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  serviceInterest?: string | null;
  budgetRange?: string | null;
  projectBrief?: string | null;
  ipAddress?: string | null;
};

function clean(value?: string | null) {
  const normalized = value?.trim();
  return normalized || null;
}

function registrationSummary(profile: LeadRegistrationProfile) {
  const details = [
    profile.serviceInterest && `Service: ${profile.serviceInterest}`,
    profile.budgetRange && `Budget: ${profile.budgetRange}`,
    profile.projectBrief && `Project brief:\n${profile.projectBrief}`,
  ].filter(Boolean);

  return details.join("\n\n") || "Prospect created a secure project-registration account.";
}

export async function registerLeadProfile(profile: LeadRegistrationProfile) {
  const organization = await db.organization.findUnique({
    where: { slug: "mw-labs" },
    select: { id: true },
  });
  if (!organization) return null;

  const email = profile.email.trim().toLowerCase();
  const company = clean(profile.company) ?? "Individual enquiry";
  const phone = clean(profile.phone);
  const existingByUser = await db.lead.findUnique({
    where: { userId: profile.userId },
    select: { id: true },
  });
  const existingByEmail = existingByUser
    ? null
    : await db.lead.findFirst({
        where: {
          organizationId: organization.id,
          email,
          userId: null,
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, notes: true, score: true },
      });

  const isFirstRegistration = !existingByUser;
  const summary = registrationSummary(profile);
  const nextActivityAt = new Date(Date.now() + 24 * 60 * 60 * 1_000);

  const lead = existingByUser
    ? await db.lead.update({
        where: { id: existingByUser.id },
        data: {
          name: profile.name.trim(),
          company,
          email,
          phone,
        },
        select: { id: true, stage: true },
      })
    : existingByEmail
      ? await db.lead.update({
          where: { id: existingByEmail.id },
          data: {
            userId: profile.userId,
            name: profile.name.trim(),
            company,
            email,
            phone,
            score: Math.max(existingByEmail.score, 65),
            nextActivityAt,
            notes: existingByEmail.notes
              ? `${existingByEmail.notes}\n\nRegistration profile\n${summary}`
              : summary,
          },
          select: { id: true, stage: true },
        })
      : await db.lead.create({
          data: {
            organizationId: organization.id,
            userId: profile.userId,
            name: profile.name.trim(),
            company,
            email,
            phone,
            source: "Website registration",
            stage: "New",
            score: 65,
            probability: 15,
            nextActivityAt,
            notes: summary,
          },
          select: { id: true, stage: true },
        });

  if (isFirstRegistration) {
    await db.$transaction([
      db.activity.create({
        data: {
          organizationId: organization.id,
          leadId: lead.id,
          type: "lead.registered",
          title: existingByEmail
            ? "Website enquiry completed registration"
            : "New prospect registered",
          body: summary,
        },
      }),
      db.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: profile.userId,
          action: "lead.registered",
          resource: "lead",
          resourceId: lead.id,
          ipAddress: profile.ipAddress ?? null,
          metadata: JSON.stringify({
            source: existingByEmail ? "enquiry-conversion" : "registration",
            serviceInterest: clean(profile.serviceInterest),
            budgetRange: clean(profile.budgetRange),
          }),
        },
      }),
    ]);
  }

  return lead;
}
