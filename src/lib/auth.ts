import "server-only";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import { z } from "zod";

import { db } from "@/lib/db";
import { seedWorkspace } from "@/lib/seed-workspace";

const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
);

export const auth = betterAuth({
  appName: "M&W Command",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: prismaAdapter(db, { provider: "mysql" }),
  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: true,
        input: false,
        returned: false,
        defaultValue: "prospect",
      },
      company: {
        type: "string",
        required: false,
        returned: false,
        validator: { input: z.string().trim().max(160) },
      },
      phone: {
        type: "string",
        required: false,
        returned: false,
        validator: { input: z.string().trim().max(40) },
      },
      serviceInterest: {
        type: "string",
        required: false,
        returned: false,
        validator: { input: z.string().trim().max(120) },
      },
      budgetRange: {
        type: "string",
        required: false,
        returned: false,
        validator: { input: z.string().trim().max(80) },
      },
      projectBrief: {
        type: "string",
        required: false,
        returned: false,
        validator: { input: z.string().trim().max(4_000) },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    // Public accounts are prospects only. Agency access still requires an
    // explicit organization membership and is enforced independently.
    disableSignUp: false,
    autoSignIn: true,
    minPasswordLength: 10,
    maxPasswordLength: 128,
  },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      }
    : undefined,
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 8 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    cookiePrefix: "mwlabscmd",
    database: { generateId: () => crypto.randomUUID() },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: process.env.ALLOW_INITIAL_SIGNUP === "true",
      teams: {
        enabled: true,
        defaultTeam: { enabled: true },
        maximumTeams: 20,
      },
      invitationExpiresIn: 60 * 60 * 48,
      requireEmailVerificationOnInvitation: true,
      organizationHooks: {
        afterCreateOrganization: async ({ organization: created }) => {
          if (process.env.SEED_DEMO_DATA === "true") {
            await seedWorkspace(created.id);
          }
        },
      },
    }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
