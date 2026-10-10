import { describe, expect, it, vi } from "vitest";
import * as jobPayment from "./job-payment.js";
import { handleStripeWebhookEvent } from "./stripe-provider.js";

/** M26-FAULT-009 duplicate Stripe webhook delivery / M26-GOLD-008 */
describe("handleStripeWebhookEvent idempotency (M26)", () => {
  it("M26-FAULT-009 skips side effects when stripeEventId claim loses (duplicate delivery)", async () => {
    const prisma = {
      stripeWebhookEvent: {
        createMany: vi.fn(async () => ({ count: 0 })),
        delete: vi.fn(),
      },
    };
    const result = await handleStripeWebhookEvent(prisma as never, {
      id: "evt_1",
      type: "checkout.session.completed",
      data: { object: {} },
    } as never);
    expect(result).toEqual({ handled: true });
    expect(prisma.stripeWebhookEvent.delete).not.toHaveBeenCalled();
  });

  it("M26-GOLD-008 claims stripeEventId before processing (createMany count 1)", async () => {
    const prisma = {
      stripeWebhookEvent: {
        createMany: vi.fn(async () => ({ count: 1 })),
        delete: vi.fn(),
      },
    };
    const result = await handleStripeWebhookEvent(prisma as never, {
      id: "evt_2",
      type: "unknown.event",
      data: { object: {} },
    } as never);
    expect(result).toEqual({ handled: true });
    expect(prisma.stripeWebhookEvent.createMany).toHaveBeenCalledWith({
      data: [{ stripeEventId: "evt_2", type: "unknown.event" }],
      skipDuplicates: true,
    });
  });

  it("releases claim when handler throws so Stripe can retry", async () => {
    vi.spyOn(jobPayment, "grantBuyerCredits").mockRejectedValue(new Error("boom"));
    const prisma = {
      stripeWebhookEvent: {
        createMany: vi.fn(async () => ({ count: 1 })),
        delete: vi.fn(async () => ({})),
      },
    };
    await expect(
      handleStripeWebhookEvent(prisma as never, {
        id: "evt_3",
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_1",
            metadata: { kivroUserId: "u1" },
            amount_total: 500,
          },
        },
      } as never),
    ).rejects.toThrow("boom");
    expect(prisma.stripeWebhookEvent.delete).toHaveBeenCalledWith({
      where: { stripeEventId: "evt_3" },
    });
    vi.restoreAllMocks();
  });
});
