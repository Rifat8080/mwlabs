import { z } from "zod";

import { promoteUserToStaff } from "@/lib/account-upgrade";
import { getAuthSessionFromHeaders, hasTrustedMutationOrigin } from "@/lib/dal";
import { db } from "@/lib/db";

const ownerRegistrationSchema = z.object({
  organizationId: z.string().min(1).max(191).optional(),
});

export async function POST(request: Request) {
  if (!hasTrustedMutationOrigin(request)) {
    return Response.json({ error: "Unauthorized request origin." }, { status: 403 });
  }

  const authSession = await getAuthSessionFromHeaders(request.headers);
  if (!authSession?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = ownerRegistrationSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: "Invalid owner registration." }, { status: 400 });

  const requestedOrganizationId = parsed.data.organizationId ?? authSession.session.activeOrganizationId;
  const membership = await db.member.findFirst({
    where: requestedOrganizationId
      ? {
          userId: authSession.user.id,
          organizationId: requestedOrganizationId,
        }
      : { userId: authSession.user.id },
    orderBy: { createdAt: "asc" },
    select: { role: true },
  });

  if (!membership) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!["owner", "admin"].includes(membership.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  await promoteUserToStaff(authSession.user.id);

  return Response.json({ upgraded: true });
}
