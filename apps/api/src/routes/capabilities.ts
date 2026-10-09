import { buildBuyerTrustSummary } from "@kivro/capability-publish";
import { parseWorkerManifest } from "@kivro/contracts";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";

export function marketplaceCapabilityRoutes(): Hono {
  const app = new Hono();

  app.get("/capabilities", async (c) => {
    const rows = await getPrismaClient().capability.findMany({
      where: { status: "PUBLISHED", currentVersionId: { not: null } },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        priceTierCents: true,
        currency: true,
        rating: true,
        jobCount: true,
        currentVersion: {
          select: {
            id: true,
            versionLabel: true,
            inputSchema: true,
            outputSchema: true,
            permissionSummary: true,
            publishedAt: true,
          },
        },
      },
    });
    return c.json({ capabilities: rows });
  });

  app.get("/capabilities/:slug", async (c) => {
    const slug = c.req.param("slug");
    const row = await getPrismaClient().capability.findFirst({
      where: { slug, status: "PUBLISHED", currentVersionId: { not: null } },
      include: { currentVersion: true },
    });
    if (!row) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const version = row.currentVersion;
    let buyerTrust = null;
    if (version?.workerManifest) {
      try {
        const manifest = parseWorkerManifest(version.workerManifest);
        buyerTrust = buildBuyerTrustSummary(manifest);
      } catch {
        buyerTrust = null;
      }
    }
    return c.json({ capability: row, buyerTrust });
  });

  return app;
}
