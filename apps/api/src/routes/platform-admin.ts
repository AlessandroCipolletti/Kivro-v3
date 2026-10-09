import {
  reconcileJobPaymentAfterTerminal,
  sweepPendingSellerTransfers,
  sweepStaleJobPaymentReservations,
} from "@kivro/billing";
import { getPrismaClient } from "@kivro/database";
import { sweepExpiredJobPauses } from "@kivro/job-control";
import { retryDueWebhookDeliveries } from "@kivro/buyer-webhooks";
import { runSchedulingSweeps } from "@kivro/job-scheduling";
import {
  assertAdminToken,
  isGlobalDispatchEnabled,
  setGlobalDispatchEnabled,
} from "@kivro/platform-policy";
import { Hono } from "hono";

export function platformAdminRoutes(): Hono {
  const app = new Hono();

  app.get("/dispatch", (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    return c.json({ dispatchEnabled: isGlobalDispatchEnabled() });
  });

  app.post("/dispatch", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const body = await c.req.json<{ enabled?: boolean }>();
    if (typeof body.enabled !== "boolean") {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    try {
      setGlobalDispatchEnabled(body.enabled);
    } catch (err) {
      const message = err instanceof Error ? err.message : "DISPATCH_TOGGLE_FAILED";
      return c.json({ error: message }, 403);
    }
    return c.json({ dispatchEnabled: isGlobalDispatchEnabled() });
  });

  app.post("/payments/sweep-stale-reservations", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const result = await sweepStaleJobPaymentReservations(getPrismaClient());
    return c.json(result);
  });

  app.post("/payments/sweep-pending-transfers", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const result = await sweepPendingSellerTransfers(getPrismaClient());
    return c.json(result);
  });

  app.post("/jobs/promote-scheduled", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const prisma = getPrismaClient();
    const result = await runSchedulingSweeps(prisma);
    const expiredJobs = await prisma.job.findMany({
      where: { status: "EXPIRED", reservedAmountCents: { gt: 0 } },
      take: 50,
    });
    let paymentsReleased = 0;
    for (const job of expiredJobs) {
      const reconciled = await reconcileJobPaymentAfterTerminal(prisma, job.id);
      if (reconciled.released) {
        paymentsReleased += 1;
      }
    }
    for (const jobId of result.queueCancelledJobIds) {
      const reconciled = await reconcileJobPaymentAfterTerminal(prisma, jobId);
      if (reconciled.released) {
        paymentsReleased += 1;
      }
    }
    return c.json({ ...result, paymentsReleased });
  });

  app.post("/jobs/sweep-pause-timeouts", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const result = await sweepExpiredJobPauses(getPrismaClient());
    return c.json(result);
  });

  app.post("/webhooks/retry-failed", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const result = await retryDueWebhookDeliveries(getPrismaClient());
    return c.json(result);
  });

  app.post("/worker-devices/:id/revoke", async (c) => {
    try {
      assertAdminToken(c.req.header("x-kivro-admin-token"));
    } catch (err) {
      const message = err instanceof Error ? err.message : "ADMIN_UNAUTHORIZED";
      return c.json({ error: message }, message === "ADMIN_UNAUTHORIZED" ? 401 : 503);
    }
    const id = c.req.param("id");
    const updated = await getPrismaClient().workerDevice.updateMany({
      where: { id },
      data: { status: "REVOKED", revokedAt: new Date() },
    });
    if (updated.count === 0) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ revoked: true, workerDeviceId: id });
  });

  return app;
}
