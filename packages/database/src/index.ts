import { PrismaClient } from "@prisma/client";

export type { Prisma } from "@prisma/client";
export * from "@prisma/client";

let client: PrismaClient | undefined;

/** HOST-NET-007 — conservative connection pool on managed PostgreSQL. */
export function resolveDatabaseUrlWithPoolLimit(rawUrl?: string): string | undefined {
  const url = rawUrl ?? process.env.DATABASE_URL;
  if (!url) {
    return undefined;
  }
  const profile = process.env.KIVRO_CLOUD_PROFILE?.trim().toLowerCase();
  const limitRaw =
    process.env.KIVRO_DATABASE_POOL_MAX ??
    (profile === "netsons" ? "5" : profile === "aws" ? "10" : undefined);
  if (!limitRaw) {
    return url;
  }
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("connection_limit")) {
      parsed.searchParams.set("connection_limit", limitRaw);
    }
    if (!parsed.searchParams.has("pool_timeout")) {
      parsed.searchParams.set("pool_timeout", process.env.KIVRO_DATABASE_POOL_TIMEOUT ?? "10");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export function getPrismaClient(): PrismaClient {
  const datasourceUrl = resolveDatabaseUrlWithPoolLimit();
  client ??= new PrismaClient(
    datasourceUrl
      ? {
          datasources: {
            db: { url: datasourceUrl },
          },
        }
      : undefined,
  );
  return client;
}
