import { parseCapabilityContract } from "@kivro/contracts";
import { getPrismaClient, type Prisma } from "@kivro/database";
import { prepareAgentJobSubmission } from "@kivro/job-io";
import { summarizeMarketplaceAvailability } from "@kivro/job-scheduling";
import { publicMarketplaceWhere } from "../services/capability-visibility.js";
import {
  authorizePlanApproval,
  planStepEstimatedMinutes,
  buildOrchestrationPlanDraft,
  buildStepAgentDraft,
  getPlatformInference,
  requotePlanSteps,
  stepCompletedOutputs,
  toStepRecord,
  type OrchestrationListingRow,
} from "@kivro/marketplace-agent";
import { runAssistedDiscovery, type CapabilityListingRow } from "@kivro/marketplace";
import { Hono } from "hono";
import { requireAuth, requireVerifiedEmail } from "../middleware/auth.js";
import {
  reserveOrchestrationBudget,
  startReadyOrchestrationSteps,
} from "../services/orchestration-execution.js";
import type { AppEnv } from "../types.js";

/** §129–§151 — assisted discovery + orchestration plan (Mode B foundation). */
export function marketplaceAgentRoutes(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();
  app.use("*", requireAuth, requireVerifiedEmail);

  app.post("/marketplace/agent/conversations", async (c) => {
    const user = c.get("user");
    const body = (await c.req.json<{ title?: string }>().catch(() => ({}) as { title?: string })) as {
      title?: string;
    };
    const conversation = await getPrismaClient().marketplaceConversation.create({
      data: {
        userId: user.id,
        title: body.title?.trim() || null,
      },
    });
    return c.json({ conversationId: conversation.id });
  });

  app.get("/marketplace/agent/conversations/:id", async (c) => {
    const user = c.get("user");
    const conversation = await getPrismaClient().marketplaceConversation.findFirst({
      where: { id: c.req.param("id"), userId: user.id },
      include: {
        messages: { orderBy: { createdAt: "asc" }, take: 100 },
        plans: { include: { steps: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
    if (!conversation) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ conversation });
  });

  app.post("/marketplace/agent/discover", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{
      goal?: string;
      constraints?: Record<string, unknown>;
      limit?: number;
      conversationId?: string;
    }>();
    if (!body.goal?.trim()) {
      return c.json({ error: "GOAL_REQUIRED" }, 400);
    }
    const inference = getPlatformInference();
    const parsed = await inference.parseGoal(body.goal, body.constraints as never, { userId: user.id });
    const listings = await loadListings();
    const result = runAssistedDiscovery(listings, {
      goal: body.goal,
      constraints: {
        ...parsed.constraints,
        ...(body.constraints as Record<string, unknown> | undefined),
      },
      limit: body.limit,
    });
    if (body.conversationId) {
      await appendConversationTurn(user.id, body.conversationId, body.goal, {
        type: "discovery",
        result,
      });
    }
    return c.json({
      ...result,
      intentLabel: parsed.intentLabel,
      approvalMode: "RECOMMEND_ONLY",
      note: "Select a capability to run; each job requires explicit purchase.",
    });
  });

  app.post("/marketplace/agent/plan", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{
      goal?: string;
      constraints?: Record<string, unknown>;
      conversationId?: string;
    }>();
    if (!body.goal?.trim()) {
      return c.json({ error: "GOAL_REQUIRED" }, 400);
    }
    const listings = await loadOrchestrationListings();
    let draft = buildOrchestrationPlanDraft(listings, body.goal, body.constraints as never);
    if ("error" in draft) {
      return c.json({ error: draft.error }, 400);
    }
    const requoted = requotePlanSteps(draft.steps, listings);
    draft = { ...draft, steps: requoted.steps, estimatedCostCents: requoted.estimatedCostCents };
    const authz = authorizePlanApproval({
      plan: draft,
      constraints: draft.constraints,
      stepEstimatedDurationMinutes: planStepEstimatedMinutes(draft.steps, listings),
    });
    if (!authz.ok) {
      return c.json({ error: authz.code }, 400);
    }
    const plan = await getPrismaClient().orchestrationPlan.create({
      data: {
        userId: user.id,
        conversationId: body.conversationId ?? null,
        goal: draft.goal,
        constraintsJson: draft.constraints,
        maxBudgetCents: draft.maxBudgetCents,
        estimatedCostCents: draft.estimatedCostCents,
        status: "AWAITING_APPROVAL",
        steps: {
          create: draft.steps.map((step, index) => ({
            sortOrder: index,
            label: step.label,
            capabilityId: step.capabilityId,
            capabilityVersionId: step.capabilityVersionId,
            dependsOnStepIds: step.dependsOnStepIds,
            inputMappingJson: {
              ...(step.inputMappingJson ?? {}),
              _clientStepKey: step.clientStepKey,
            },
            estimatedPriceCents: step.estimatedPriceCents,
            status: "PLANNED",
          })),
        },
      },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });
    if (body.conversationId) {
      await appendConversationTurn(user.id, body.conversationId, body.goal, {
        type: "plan",
        planId: plan.id,
        estimatedCostCents: plan.estimatedCostCents,
      });
    }
    return c.json({
      plan,
      notes: draft.notes,
      approvalMode: "APPROVE_PLAN",
    });
  });

  app.get("/marketplace/agent/plans/:id", async (c) => {
    const user = c.get("user");
    const plan = await getPrismaClient().orchestrationPlan.findFirst({
      where: { id: c.req.param("id"), userId: user.id },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });
    if (!plan) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    return c.json({ plan });
  });

  app.post("/marketplace/agent/plans/:id/approve", async (c) => {
    const user = c.get("user");
    const db = getPrismaClient();
    const plan = await db.orchestrationPlan.findFirst({
      where: { id: c.req.param("id"), userId: user.id },
      include: { steps: { orderBy: { sortOrder: "asc" } } },
    });
    if (!plan) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    if (plan.status !== "AWAITING_APPROVAL" && plan.status !== "DRAFT") {
      return c.json({ error: "INVALID_STATE" }, 400);
    }
    const listings = await loadOrchestrationListings();
    const plannedSteps = plan.steps.map((s) => ({
      clientStepKey: (s.inputMappingJson as { _clientStepKey?: string })?._clientStepKey ?? s.id,
      label: s.label,
      capabilityId: s.capabilityId,
      capabilitySlug: "",
      capabilityVersionId: s.capabilityVersionId,
      estimatedPriceCents: s.estimatedPriceCents,
      dependsOnStepIds: (s.dependsOnStepIds as string[]) ?? [],
      inputMappingJson: s.inputMappingJson as Record<string, unknown> | undefined,
    }));
    const requoted = requotePlanSteps(plannedSteps, listings);
    const draft = {
      goal: plan.goal,
      constraints: plan.constraintsJson as never,
      maxBudgetCents: plan.maxBudgetCents,
      estimatedCostCents: requoted.estimatedCostCents,
      steps: requoted.steps,
      notes: requoted.priceChanged ? ["Prices refreshed from marketplace at approval."] : [],
    };
    const authz = authorizePlanApproval({
      plan: draft,
      constraints: draft.constraints,
      stepEstimatedDurationMinutes: planStepEstimatedMinutes(requoted.steps, listings),
    });
    if (!authz.ok) {
      return c.json({ error: authz.code }, 400);
    }
    for (const step of requoted.steps) {
      const row = plan.steps.find((s) => s.capabilityId === step.capabilityId);
      if (row) {
        await db.orchestrationStep.update({
          where: { id: row.id },
          data: {
            estimatedPriceCents: step.estimatedPriceCents,
            quotedPriceCents: step.estimatedPriceCents,
            capabilityVersionId:
              listings.find((l) => l.id === step.capabilityId)?.currentVersionId ??
              row.capabilityVersionId,
          },
        });
      }
    }
    await db.orchestrationPlan.update({
      where: { id: plan.id },
      data: {
        status: "RUNNING",
        approvedAt: new Date(),
        approvedEstimatedCostCents: requoted.estimatedCostCents,
        estimatedCostCents: requoted.estimatedCostCents,
      },
    });
    await reserveOrchestrationBudget(db, plan.id, requoted.estimatedCostCents);
    const started = await startReadyOrchestrationSteps(db, user.id, plan.id);
    return c.json({
      ok: true,
      startedJobIds: started,
      estimatedCostCents: requoted.estimatedCostCents,
      priceChanged: requoted.priceChanged,
    });
  });

  app.post("/marketplace/agent/plans/:id/advance", async (c) => {
    const user = c.get("user");
    const plan = await getPrismaClient().orchestrationPlan.findFirst({
      where: { id: c.req.param("id"), userId: user.id, status: "RUNNING" },
    });
    if (!plan) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const started = await startReadyOrchestrationSteps(getPrismaClient(), user.id, plan.id);
    return c.json({ ok: true, startedJobIds: started });
  });

  app.post("/marketplace/agent/plans/:id/draft-input", async (c) => {
    const user = c.get("user");
    const body = await c.req.json<{ stepId?: string }>();
    const step = await getPrismaClient().orchestrationStep.findFirst({
      where: {
        id: body.stepId,
        plan: { id: c.req.param("id"), userId: user.id },
      },
      include: { plan: { include: { steps: true } } },
    });
    if (!step) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const capability = await getPrismaClient().capability.findUnique({
      where: { id: step.capabilityId },
      include: { currentVersion: true },
    });
    if (!capability?.currentVersion) {
      return c.json({ error: "NOT_FOUND" }, 404);
    }
    const contract = parseCapabilityContract({
      name: capability.name,
      description: capability.description,
      currency: capability.currentVersion.currency,
      priceTierCents: capability.currentVersion.priceSnapshotCents,
      inputs: capability.currentVersion.inputSchema,
      output: capability.currentVersion.outputSchema,
    });
    const records = step.plan.steps.map(toStepRecord);
    const completed = stepCompletedOutputs(records);
    const agentDraft = buildStepAgentDraft(step.plan.goal, toStepRecord(step), completed);
    const prepared = prepareAgentJobSubmission(contract, agentDraft);
    return c.json({
      stepId: step.id,
      capabilityId: step.capabilityId,
      capabilitySlug: capability.slug,
      ...prepared,
    });
  });

  return app;
}

async function appendConversationTurn(
  userId: string,
  conversationId: string,
  userText: string,
  assistantPayload: Record<string, unknown>,
): Promise<void> {
  const db = getPrismaClient();
  const conv = await db.marketplaceConversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!conv) {
    return;
  }
  await db.$transaction([
    db.marketplaceMessage.create({
      data: {
        conversationId,
        role: "USER",
        content: { text: userText },
      },
    }),
    db.marketplaceMessage.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: assistantPayload as Prisma.InputJsonValue,
      },
    }),
    db.marketplaceConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
}

async function loadListings(): Promise<CapabilityListingRow[]> {
  const rows = await getPrismaClient().capability.findMany({
    where: publicMarketplaceWhere,
    include: {
      sellerProfile: { select: { id: true, displayName: true } },
      currentVersion: { select: { priceSnapshotCents: true } },
    },
  });
  const availability = await summarizeMarketplaceAvailability(
    getPrismaClient(),
    rows.map((r) => r.id),
  );
  const availById = new Map(availability.map((a) => [a.capabilityId, a]));
  return rows.map((row) => {
    const avail = availById.get(row.id);
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      category: row.marketplaceCategory,
      priceTierCents: row.priceTierCents ?? row.currentVersion?.priceSnapshotCents ?? null,
      currency: row.currency,
      rating: row.rating,
      jobCount: row.jobCount,
      estimatedDuration: row.estimatedDuration,
      sellerDisplayName: row.sellerProfile.displayName,
      sellerProfileId: row.sellerProfile.id,
      availabilityStatus: avail?.status,
      accepting: avail?.accepting,
      nextAvailableAt: avail?.nextAvailableAt ?? null,
    };
  });
}

async function loadOrchestrationListings(): Promise<OrchestrationListingRow[]> {
  const rows = await getPrismaClient().capability.findMany({
    where: publicMarketplaceWhere,
    include: {
      sellerProfile: { select: { id: true, displayName: true } },
      currentVersion: { select: { id: true, priceSnapshotCents: true } },
    },
  });
  const base = await loadListings();
  const versionByCap = new Map(rows.map((r) => [r.id, r.currentVersion?.id ?? r.currentVersionId!]));
  return base
    .map((row) => {
      const vid = versionByCap.get(row.id);
      if (!vid) {
        return null;
      }
      return { ...row, currentVersionId: vid };
    })
    .filter((r): r is OrchestrationListingRow => r != null)
    .filter((row) => row.accepting !== false);
}
