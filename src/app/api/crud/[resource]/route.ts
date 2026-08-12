import { z } from "zod";

import { createCrudRecord, deleteCrudRecord, listCrudRecords, supportsCrudResource, updateCrudRecord } from "@/lib/crud-server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/dal";

const mutationSchema = z.object({
  id: z.string().min(1).max(191).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "The record could not be saved.";
  const conflict = /unique|duplicate/i.test(message);
  const related = /foreign key|constraint/i.test(message);
  const safeMessage = conflict
    ? "A record with these unique details already exists."
    : related
      ? "This record is still connected to other agency data and cannot be changed that way."
      : /prisma|database|query/i.test(message)
        ? "The database could not complete this operation."
        : message;
  return Response.json({ error: safeMessage }, { status: conflict ? 409 : 400 });
}

async function contextFor(request: Request, context: RouteContext<"/api/crud/[resource]">) {
  const session = await requireApiSession(request);
  if (!session) return { response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  const { resource } = await context.params;
  if (!supportsCrudResource(resource)) return { response: Response.json({ error: "Unsupported resource" }, { status: 404 }) };
  return { session, resource };
}

export async function GET(request: Request, context: RouteContext<"/api/crud/[resource]">) {
  const resolved = await contextFor(request, context);
  if ("response" in resolved) return resolved.response;
  try {
    const records = await listCrudRecords(resolved.resource, resolved.session.organizationId);
    return Response.json({ records });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, context: RouteContext<"/api/crud/[resource]">) {
  const resolved = await contextFor(request, context);
  if ("response" in resolved) return resolved.response;
  const parsed = mutationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parsed.data.data) return Response.json({ error: "Invalid request body" }, { status: 400 });
  try {
    const record = await createCrudRecord(resolved.resource, resolved.session.organizationId, resolved.session.userId, parsed.data.data);
    await db.auditLog.create({ data: { organizationId: resolved.session.organizationId, userId: resolved.session.userId, action: `${resolved.resource}.created`, resource: resolved.resource, resourceId: String(record.id) } });
    return Response.json({ record }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, context: RouteContext<"/api/crud/[resource]">) {
  const resolved = await contextFor(request, context);
  if ("response" in resolved) return resolved.response;
  const parsed = mutationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parsed.data.id || !parsed.data.data) return Response.json({ error: "Invalid request body" }, { status: 400 });
  try {
    const record = await updateCrudRecord(resolved.resource, parsed.data.id, resolved.session.organizationId, parsed.data.data);
    if (!record) return Response.json({ error: "Record not found" }, { status: 404 });
    await db.auditLog.create({ data: { organizationId: resolved.session.organizationId, userId: resolved.session.userId, action: `${resolved.resource}.updated`, resource: resolved.resource, resourceId: parsed.data.id } });
    return Response.json({ record });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext<"/api/crud/[resource]">) {
  const resolved = await contextFor(request, context);
  if ("response" in resolved) return resolved.response;
  if (!["owner", "admin"].includes(resolved.session.role)) return Response.json({ error: "Only owners and administrators can delete records." }, { status: 403 });
  const parsed = mutationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parsed.data.id) return Response.json({ error: "Invalid request body" }, { status: 400 });
  try {
    const deleted = await deleteCrudRecord(resolved.resource, parsed.data.id, resolved.session.organizationId);
    if (!deleted) return Response.json({ error: "Record not found" }, { status: 404 });
    await db.auditLog.create({ data: { organizationId: resolved.session.organizationId, userId: resolved.session.userId, action: `${resolved.resource}.deleted`, resource: resolved.resource, resourceId: parsed.data.id } });
    return Response.json({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
