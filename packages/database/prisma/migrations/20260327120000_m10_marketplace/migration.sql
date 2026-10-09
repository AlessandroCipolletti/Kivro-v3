ALTER TABLE "Capability" ADD COLUMN IF NOT EXISTS "marketplaceCategory" TEXT NOT NULL DEFAULT 'general';

CREATE TABLE IF NOT EXISTS "Favorite" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "capabilityId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Favorite_userId_capabilityId_key" ON "Favorite"("userId", "capabilityId");
CREATE INDEX IF NOT EXISTS "Favorite_userId_idx" ON "Favorite"("userId");

ALTER TABLE "Favorite"
  ADD CONSTRAINT "Favorite_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Favorite"
  ADD CONSTRAINT "Favorite_capabilityId_fkey"
  FOREIGN KEY ("capabilityId") REFERENCES "Capability"("id") ON DELETE CASCADE ON UPDATE CASCADE;
