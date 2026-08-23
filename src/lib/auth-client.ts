"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, organizationClient } from "better-auth/client/plugins";

import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    organizationClient({ teams: { enabled: true } }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
