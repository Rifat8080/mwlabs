import { readFile } from "node:fs/promises";
import path from "node:path";

import { db } from "@/lib/db";
import { uploadMimeTypes, uploadRoot, validUploadFilename } from "@/lib/upload-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: RouteContext<"/media/[filename]">) {
  const { filename } = await context.params;
  if (!validUploadFilename(filename)) return new Response("Not found", { status: 404 });

  try {
    const asset = await db.mediaAsset.findUnique({ where: { filename }, select: { mimeType: true, bytes: true, data: true } });
    if (asset) return new Response(asset.data, {
      headers: {
        "Content-Type": asset.mimeType,
        "Content-Length": String(asset.bytes),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });

    const extension = filename.slice(filename.lastIndexOf(".") + 1) as keyof typeof uploadMimeTypes;
    const file = await readFile(path.join(/* turbopackIgnore: true */ uploadRoot, filename));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": uploadMimeTypes[extension],
        "Content-Length": String(file.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
