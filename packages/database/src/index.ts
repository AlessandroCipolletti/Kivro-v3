import { PrismaClient } from "@prisma/client";

export type { Prisma } from "@prisma/client";
export * from "@prisma/client";

let client: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  client ??= new PrismaClient();
  return client;
}
