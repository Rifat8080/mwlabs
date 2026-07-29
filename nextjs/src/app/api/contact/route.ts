import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ name: z.string().trim().min(2).max(120), email: z.string().trim().email().max(254), brief: z.string().trim().min(10).max(3000) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please complete all fields with valid details." }, { status: 400 });
  if (process.env.NODE_ENV !== "production") console.info("[contact-stub]", { email: parsed.data.email, receivedAt: new Date().toISOString() });
  return NextResponse.json({ ok: true });
}
