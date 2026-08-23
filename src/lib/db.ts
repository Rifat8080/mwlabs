import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const databaseUrl =
  process.env.DATABASE_URL ??
  "mysql://mwlabs_app:mwlabs_dev_password@127.0.0.1:3306/mwlabs_command";

function databasePoolUrl(value: string) {
  try {
    const url = new URL(value);
    const configured = Number(process.env.DATABASE_POOL_SIZE || 10);
    const poolSize = Number.isFinite(configured) ? Math.min(50, Math.max(2, Math.floor(configured))) : 10;
    if (!url.searchParams.has("connectionLimit")) url.searchParams.set("connectionLimit", String(poolSize));
    if (!url.searchParams.has("minimumIdle")) url.searchParams.set("minimumIdle", "1");
    if (!url.searchParams.has("acquireTimeout")) url.searchParams.set("acquireTimeout", "10000");
    if (!url.searchParams.has("idleTimeout")) url.searchParams.set("idleTimeout", "300");
    return url.toString();
  } catch {
    return value;
  }
}

const adapter = new PrismaMariaDb(databasePoolUrl(databaseUrl));

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
