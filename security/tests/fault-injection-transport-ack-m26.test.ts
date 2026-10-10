import { describe, expect, it } from "vitest";
import { assertTransportReconnectIsSideEffectFree } from "@kivro/worker-transport";

/** M26-FAULT-011 ambiguous transport ack after reconnect / M26-GOLD-010 */
describe("M26 fault injection — transport ack ambiguity", () => {
  it("M26-FAULT-011 reconnect preserves ack idempotency keys", () => {
    expect(() =>
      assertTransportReconnectIsSideEffectFree({
        priorAckIdempotencyKey: "ack-job-1",
        nextAckIdempotencyKey: "ack-job-1",
      }),
    ).not.toThrow();
  });

  it("M26-GOLD-010 rejects reconnect that would change ack idempotency keys", () => {
    expect(() =>
      assertTransportReconnectIsSideEffectFree({
        priorAckIdempotencyKey: "ack-job-1",
        nextAckIdempotencyKey: "ack-job-2",
      }),
    ).toThrow(/Transport reconnect changed idempotency key/);
  });
});
