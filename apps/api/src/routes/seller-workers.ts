import { ensureSellerProfile } from "@kivro/capability-publish";
import { getPrismaClient } from "@kivro/database";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

export function sellerWorkerRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.get("/workers", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const devices = await getPrismaClient().workerDevice.findMany({
      where: { sellerProfileId: profile.id },
      orderBy: { createdAt: "asc" },
      include: {
        bindings: {
          where: { status: "ACTIVE" },
          select: { capabilityVersionId: true, status: true },
        },
      },
    });
    return c.json({
      routingPolicy: "ANY_ASSIGNED_ELIGIBLE",
      workers: devices.map((device) => ({
        id: device.id,
        name: device.name,
        status: device.status,
        workerVersion: device.workerVersion,
        lastSeenAt: device.lastSeenAt?.toISOString() ?? null,
        activeAssignmentCount: device.bindings.length,
      })),
    });
  });

  app.get("/capabilities/:id/worker-assignments", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
      select: { currentVersionId: true, workerRoutingPolicy: true },
    });
    if (!capability?.currentVersionId) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const bindings = await getPrismaClient().localWorkerBinding.findMany({
      where: {
        capabilityVersionId: capability.currentVersionId,
        status: "ACTIVE",
        workerDevice: { sellerProfileId: profile.id },
      },
      select: {
        workerDeviceId: true,
        status: true,
        workerDevice: { select: { name: true, status: true } },
      },
    });
    return c.json({
      routingPolicy: capability.workerRoutingPolicy,
      assignments: bindings.map((binding) => ({
        workerDeviceId: binding.workerDeviceId,
        workerName: binding.workerDevice.name,
        workerStatus: binding.workerDevice.status,
        bindingStatus: binding.status,
      })),
    });
  });

  app.post("/capabilities/:id/worker-assignments", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const body = await c.req.json<{ workerDeviceId?: string }>();
    if (!body.workerDeviceId) {
      return c.json({ error: "INVALID_INPUT" }, 400);
    }
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
      select: { id: true, currentVersionId: true },
    });
    if (!capability?.currentVersionId) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const device = await getPrismaClient().workerDevice.findFirst({
      where: { id: body.workerDeviceId, sellerProfileId: profile.id, status: { not: "REVOKED" } },
    });
    if (!device) {
      return c.json({ error: "WORKER_NOT_OWNED" }, 403);
    }
    const binding = await getPrismaClient().localWorkerBinding.upsert({
      where: {
        capabilityVersionId_workerDeviceId: {
          capabilityVersionId: capability.currentVersionId,
          workerDeviceId: device.id,
        },
      },
      create: {
        capabilityVersionId: capability.currentVersionId,
        workerDeviceId: device.id,
        localWorkerId: device.id,
        status: "ACTIVE",
      },
      update: { status: "ACTIVE" },
    });
    return c.json({
      capabilityVersionId: binding.capabilityVersionId,
      workerDeviceId: binding.workerDeviceId,
      status: binding.status,
    });
  });

  app.delete("/capabilities/:id/worker-assignments/:workerDeviceId", async (c) => {
    const user = c.get("user");
    const profile = await ensureSellerProfile(getPrismaClient(), user.id, user.email);
    const capability = await getPrismaClient().capability.findFirst({
      where: { id: c.req.param("id"), sellerProfileId: profile.id },
      select: { currentVersionId: true },
    });
    if (!capability?.currentVersionId) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const updated = await getPrismaClient().localWorkerBinding.updateMany({
      where: {
        capabilityVersionId: capability.currentVersionId,
        workerDeviceId: c.req.param("workerDeviceId"),
        workerDevice: { sellerProfileId: profile.id },
      },
      data: { status: "INACTIVE" },
    });
    if (updated.count === 0) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ status: "INACTIVE" });
  });

  return app;
}
