import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/dal";

export async function GET(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [members, invitations, teams] = await Promise.all([
    db.member.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        userId: true,
        role: true,
        createdAt: true,
        user: { select: { name: true, email: true, image: true } },
      },
    }),
    db.invitation.findMany({
      where: { organizationId: session.organizationId, status: "pending" },
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, role: true, status: true, expiresAt: true, createdAt: true },
    }),
    db.team.findMany({
      where: { organizationId: session.organizationId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        createdAt: true,
        members: { select: { userId: true } },
      },
    }),
  ]);

  return Response.json({
    currentUserId: session.userId,
    currentRole: session.role,
    organizationId: session.organizationId,
    emailProviderConfigured: Boolean(process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL_FROM),
    members: members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt.toISOString(),
      name: member.user.name,
      email: member.user.email,
      image: member.user.image,
    })),
    invitations: invitations.map((invitation) => ({
      ...invitation,
      expiresAt: invitation.expiresAt.toISOString(),
      createdAt: invitation.createdAt.toISOString(),
    })),
    teams: teams.map((team) => ({
      id: team.id,
      name: team.name,
      memberCount: team.members.length,
      createdAt: team.createdAt.toISOString(),
    })),
  });
}
