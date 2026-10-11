import { executePlatformResearchSearch } from "@kivro/research-broker";
import { Hono } from "hono";

/** Platform-controlled research egress. The seller worker calls this instead of the public internet. */
export function platformResearchRoutes(): Hono {
  const app = new Hono();

  app.get("/search", async (c) => {
    const header = c.req.header("authorization") ?? "";
    const presented = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;
    const result = await executePlatformResearchSearch({
      presentedToken: presented,
      expectedToken: process.env.KIVRO_PLATFORM_RESEARCH_BROKER_TOKEN,
      query: c.req.query("q") ?? "",
      upstreamUrl: process.env.KIVRO_PLATFORM_SEARCH_UPSTREAM,
      upstreamKey: process.env.KIVRO_PLATFORM_SEARCH_API_KEY,
      fetchImpl: fetch,
    });
    return c.json({ results: result.results, error: result.error }, result.status);
  });

  return app;
}
