import "server-only";

import { db } from "@/lib/db";

export async function promoteUserToStaff(userId: string) {
  await db.$transaction(async (tx) => {
    const registrationLead = await tx.lead.findUnique({
      where: { userId },
      select: { id: true, source: true },
    });

    await tx.user.update({
      where: { id: userId },
      data: { accountType: "staff" },
    });

    if (registrationLead?.source === "Website registration") {
      await tx.lead.delete({ where: { id: registrationLead.id } });
      return;
    }

    if (registrationLead) {
      await tx.lead.update({
        where: { id: registrationLead.id },
        data: { userId: null },
      });
    }
  });
}
