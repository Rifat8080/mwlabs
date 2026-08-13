import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/dal";
import { detectImageExtension, uploadMimeTypes, uploadRoot } from "@/lib/upload-store";

export const runtime = "nodejs";

const maximumUploadBytes = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await requireApiSession(request);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose an image to upload." }, { status: 400 });
    if (!file.size) return Response.json({ error: "The selected image is empty." }, { status: 400 });
    if (file.size > maximumUploadBytes) return Response.json({ error: "Images must be 8 MB or smaller." }, { status: 413 });

    const bytes = new Uint8Array(await file.arrayBuffer());
    const extension = detectImageExtension(bytes);
    if (!extension) {
      return Response.json({ error: "Use a valid JPG, PNG, WebP, or AVIF image." }, { status: 415 });
    }

    const filename = `${randomUUID()}.${extension}`;
    await mkdir(uploadRoot, { recursive: true });
    await writeFile(path.join(/* turbopackIgnore: true */ uploadRoot, filename), bytes, { flag: "wx" });

    await db.auditLog.create({
      data: {
        organizationId: session.organizationId,
        userId: session.userId,
        action: "media.uploaded",
        resource: "media",
        resourceId: filename,
        metadata: JSON.stringify({ originalName: file.name.slice(0, 240), bytes: file.size, type: uploadMimeTypes[extension] }),
      },
    });

    return Response.json({ url: `/media/${filename}`, filename }, { status: 201 });
  } catch {
    return Response.json({ error: "The image could not be stored. Check the upload directory and try again." }, { status: 500 });
  }
}
