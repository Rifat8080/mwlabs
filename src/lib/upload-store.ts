import "server-only";

import path from "node:path";

export const uploadRoot = path.resolve(/* turbopackIgnore: true */
  process.env.MWLABS_UPLOAD_DIR ?? path.join(process.cwd(), ".data", "uploads"),
);

export const uploadMimeTypes = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
} as const;

export type UploadExtension = keyof typeof uploadMimeTypes;

export function detectImageExtension(bytes: Uint8Array): UploadExtension | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "png";
  if (bytes.length >= 12) {
    const signature = String.fromCharCode(...bytes.slice(0, 12));
    if (signature.startsWith("RIFF") && signature.slice(8, 12) === "WEBP") return "webp";
    if (signature.slice(4, 8) === "ftyp" && ["avif", "avis"].includes(signature.slice(8, 12))) return "avif";
  }
  return null;
}

export function validUploadFilename(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp|avif)$/.test(value);
}
