"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clipboard, LoaderCircle, MailPlus, Plus, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

type TeamData = {
  currentUserId: string;
  currentRole: string;
  organizationId: string;
  emailProviderConfigured: boolean;
  totals: { members: number; invitations: number; teams: number };
  members: Array<{ id: string; userId: string; role: string; createdAt: string; name: string; email: string }>;
  invitations: Array<{ id: string; email: string; role: string; expiresAt: string }>;
  teams: Array<{ id: string; name: string; memberCount: number; createdAt: string }>;
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function TeamWorkspace() {
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/team");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load the team.");
      setData(result as TeamData);
    } catch (error) {
      toast.error("Team data unavailable", { description: error instanceof Error ? error.message : "Refresh and try again." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/team").then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load the team.");
      return result as TeamData;
    }).then((result) => { if (active) setData(result); }).catch((error: unknown) => {
      if (active) toast.error("Team data unavailable", { description: error instanceof Error ? error.message : "Refresh and try again." });
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const canManage = Boolean(data && ["owner", "admin"].includes(data.currentRole));
  const ownerCount = useMemo(() => data?.members.filter((member) => member.role.split(",").includes("owner")).length ?? 0, [data]);

  async function invite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const roleValue = String(form.get("role") ?? "member");
    const role: "member" | "admin" | "owner" = roleValue === "owner" ? "owner" : roleValue === "admin" ? "admin" : "member";
    const teamId = String(form.get("teamId") ?? "");
    setPending("invite");
    try {
      const result = await authClient.organization.inviteMember({ email, role, organizationId: data.organizationId, ...(teamId ? { teamId } : {}) });
      if (result.error) throw new Error(result.error.message);
      setInviteOpen(false);
      await load();
      toast.success("Invitation created", { description: data.emailProviderConfigured ? "The invitation email has been queued." : "Email is not configured yet. Copy the invitation link from the pending list." });
    } catch (error) {
      toast.error("Could not invite this person", { description: error instanceof Error ? error.message : "Check the email and permissions." });
    } finally {
      setPending(null);
    }
  }

  async function createTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data) return;
    const name = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    setPending("team");
    try {
      const result = await authClient.organization.createTeam({ name, organizationId: data.organizationId });
      if (result.error) throw new Error(result.error.message);
      setTeamOpen(false);
      await load();
      toast.success(`${name} team created`);
    } catch (error) {
      toast.error("Could not create team", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setPending(null);
    }
  }

  async function updateRole(memberId: string, role: string) {
    if (!data) return;
    setPending(memberId);
    try {
      const result = await authClient.organization.updateMemberRole({ memberId, role, organizationId: data.organizationId });
      if (result.error) throw new Error(result.error.message);
      await load();
      toast.success("Member role updated");
    } catch (error) {
      toast.error("Role was not changed", { description: error instanceof Error ? error.message : "Check owner permissions." });
    } finally {
      setPending(null);
    }
  }

  async function removeMember(member: TeamData["members"][number]) {
    if (!data || !window.confirm(`Remove ${member.name} from this workspace? Their account and historical work will remain.`)) return;
    setPending(member.id);
    try {
      const result = await authClient.organization.removeMember({ memberIdOrEmail: member.id, organizationId: data.organizationId });
      if (result.error) throw new Error(result.error.message);
      await load();
      toast.success(`${member.name} removed from the workspace`);
    } catch (error) {
      toast.error("Member was not removed", { description: error instanceof Error ? error.message : "Check owner permissions." });
    } finally {
      setPending(null);
    }
  }

  async function cancelInvitation(invitationId: string) {
    if (!data) return;
    setPending(invitationId);
    try {
      const result = await authClient.organization.cancelInvitation({ invitationId });
      if (result.error) throw new Error(result.error.message);
      await load();
      toast.success("Invitation canceled");
    } catch (error) {
      toast.error("Invitation was not canceled", { description: error instanceof Error ? error.message : "Try again." });
    } finally {
      setPending(null);
    }
  }

  function copyInvitation(id: string) {
    void navigator.clipboard.writeText(`${window.location.origin}/invite/${encodeURIComponent(id)}`);
    toast.success("Invitation link copied");
  }

  async function removeTeam(team: TeamData["teams"][number]) {
    if (!data || !window.confirm(`Delete the ${team.name} team? Members remain in the workspace.`)) return;
    setPending(team.id);
    try {
      const result = await authClient.organization.removeTeam({ teamId: team.id, organizationId: data.organizationId });
      if (result.error) throw new Error(result.error.message);
      await load();
      toast.success(`${team.name} team removed`);
    } catch (error) {
      toast.error("Team was not removed", { description: error instanceof Error ? error.message : "The default or last team cannot be removed." });
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div className="max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-muted-foreground">Access &amp; capacity</p>
          <h1 className="admin-page-title">People &amp; teams</h1>
          <p className="admin-page-description">Invite colleagues, assign least-privilege roles, and organize delivery groups from the real workspace directory.</p>
        </div>
        {canManage && <div className="admin-actions">
          <Dialog open={teamOpen} onOpenChange={setTeamOpen}>
            <DialogTrigger render={<Button variant="outline" className="h-9 bg-white"><Plus className="size-4" /> New team</Button>} />
            <DialogContent className="p-4 sm:max-w-md sm:p-6"><DialogHeader><DialogTitle>Create a delivery team</DialogTitle><DialogDescription>Use teams to group members for delivery and invitations.</DialogDescription></DialogHeader><form onSubmit={createTeam} className="space-y-4"><div className="space-y-2"><Label htmlFor="team-name">Team name</Label><Input id="team-name" name="name" required placeholder="Creative" /></div><DialogFooter><Button type="button" variant="outline" onClick={() => setTeamOpen(false)}>Cancel</Button><Button type="submit" disabled={pending === "team"}>{pending === "team" && <LoaderCircle className="size-4 animate-spin" />}Create team</Button></DialogFooter></form></DialogContent>
          </Dialog>
          <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
            <DialogTrigger render={<Button className="h-9"><MailPlus className="size-4" /> Invite member</Button>} />
            <DialogContent className="p-4 sm:max-w-lg sm:p-6"><DialogHeader><DialogTitle>Invite a workspace member</DialogTitle><DialogDescription>The invitation expires after 48 hours. Owners can manage billing, access, and other owners.</DialogDescription></DialogHeader><form onSubmit={invite} className="space-y-4"><div className="space-y-2"><Label htmlFor="invite-email">Work email</Label><Input id="invite-email" name="email" type="email" required /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="invite-role">Role</Label><select id="invite-role" name="role" defaultValue="member" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"><option value="member">Member</option><option value="admin">Admin</option>{data?.currentRole === "owner" && <option value="owner">Owner</option>}</select></div><div className="space-y-2"><Label htmlFor="invite-team">Team</Label><select id="invite-team" name="teamId" className="flex h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"><option value="">No team</option>{data?.teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}</select></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button><Button type="submit" disabled={pending === "invite"}>{pending === "invite" && <LoaderCircle className="size-4 animate-spin" />}Send invitation</Button></DialogFooter></form></DialogContent>
          </Dialog>
        </div>}
      </div>

      <div className="admin-metrics mt-7">
        {[{ label: "Workspace members", value: data?.totals.members ?? 0, detail: `${ownerCount} owner${ownerCount === 1 ? "" : "s"} shown` }, { label: "Pending invitations", value: data?.totals.invitations ?? 0, detail: "Expire after 48 hours" }, { label: "Delivery teams", value: data?.totals.teams ?? 0, detail: "Role-scoped groups" }, { label: "Invitation email", value: data?.emailProviderConfigured ? "Ready" : "Setup needed", detail: data?.emailProviderConfigured ? "Transactional provider connected" : "Links can still be copied" }].map((metric) => <div key={metric.label} className="admin-metric-card"><p className="text-xs text-muted-foreground">{metric.label}</p><p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{metric.value}</p><p className="mt-3 text-[11px] text-muted-foreground">{metric.detail}</p></div>)}
      </div>

      {loading ? <div className="mt-6 grid h-48 place-items-center rounded-2xl border bg-white"><LoaderCircle className="size-6 animate-spin text-blue-600" /></div> : <div className="mt-6 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="admin-card overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="text-sm font-semibold">Member directory</h2><p className="mt-1 text-[11px] text-muted-foreground">Tasks can be assigned to any person listed here. Up to 250 members are shown at once.</p></div><ShieldCheck className="size-4 text-emerald-600" /></div>
          <div className="divide-y">{data?.members.map((member) => {
            const isCurrent = member.userId === data.currentUserId;
            const isLastOwner = member.role.includes("owner") && ownerCount <= 1;
            return <div key={member.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 px-4 py-4 sm:flex sm:items-center sm:px-5"><Avatar className="size-9"><AvatarFallback className="bg-blue-50 text-[10px] font-semibold text-blue-700">{initials(member.name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{member.name}</p>{isCurrent && <Badge variant="outline" className="text-[8px]">You</Badge>}</div><p className="truncate text-[11px] text-muted-foreground">{member.email}</p></div><div className="col-span-2 flex items-center gap-2 pl-12 sm:col-span-1 sm:pl-0">{canManage ? <select value={member.role} onChange={(event) => void updateRole(member.id, event.target.value)} disabled={pending === member.id || isLastOwner} className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-white px-3 text-xs capitalize sm:flex-none"><option value="member">Member</option><option value="admin">Admin</option>{data.currentRole === "owner" && <option value="owner">Owner</option>}</select> : <Badge variant="outline" className="capitalize">{member.role}</Badge>}{canManage && !isCurrent && <Button variant="ghost" size="icon-sm" disabled={pending === member.id || isLastOwner} onClick={() => void removeMember(member)} aria-label={`Remove ${member.name}`} className="text-muted-foreground hover:bg-rose-50 hover:text-rose-600">{pending === member.id ? <LoaderCircle className="size-4 animate-spin" /> : <Trash2 className="size-4" />}</Button>}</div></div>;
          })}</div>
        </section>

        <div className="space-y-5">
          <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><UsersRound className="size-4 text-blue-600" /><h2 className="text-sm font-semibold">Teams</h2></div><div className="mt-4 space-y-2">{data?.teams.map((team) => <div key={team.id} className="flex items-center rounded-xl border bg-muted/20 p-3"><div className="flex-1"><p className="text-xs font-semibold">{team.name}</p><p className="mt-1 text-[10px] text-muted-foreground">{team.memberCount} members</p></div>{canManage && data.teams.length > 1 && <Button variant="ghost" size="icon-sm" onClick={() => void removeTeam(team)} disabled={pending === team.id}><Trash2 className="size-3.5" /></Button>}</div>)}{!data?.teams.length && <p className="text-xs text-muted-foreground">No delivery teams yet.</p>}</div></section>
          <section className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="text-sm font-semibold">Pending invitations</h2><div className="mt-4 space-y-2">{data?.invitations.map((invitation) => <div key={invitation.id} className="rounded-xl border p-3"><div className="flex items-start gap-2"><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{invitation.email}</p><p className="mt-1 text-[10px] capitalize text-muted-foreground">{invitation.role} · expires {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(invitation.expiresAt))}</p></div><Button variant="ghost" size="icon-sm" onClick={() => copyInvitation(invitation.id)} aria-label="Copy invitation link"><Clipboard className="size-3.5" /></Button>{canManage && <Button variant="ghost" size="icon-sm" onClick={() => void cancelInvitation(invitation.id)} disabled={pending === invitation.id} aria-label="Cancel invitation"><Trash2 className="size-3.5" /></Button>}</div></div>)}{!data?.invitations.length && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="size-3.5 text-emerald-600" />No pending invitations</div>}</div></section>
        </div>
      </div>}
    </div>
  );
}
