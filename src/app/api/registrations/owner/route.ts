import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/dal";

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!new Set(["owner", "admin"]).has(session.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const registrationLead = await db.lead.findUnique({
    where: { userId: session.userId },
    select: { id: true, source: true },
  });

  await db.user.update({
    where: { id: session.userId },
    data: { accountType: "staff" },
  });

  if (registrationLead?.source === "Website registration") {
    await db.lead.delete({ where: { id: registrationLead.id } });
  } else if (registrationLead) {
    await db.lead.update({
      where: { id: registrationLead.id },
      data: { userId: null },
    });
  }

  return Response.json({ upgraded: true });
}
