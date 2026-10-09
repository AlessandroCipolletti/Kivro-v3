import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shouldFailClosedOnSandboxInit } from "@kivro/job-failure";
import { resolveFakePaymentOutcome } from "@kivro/billing";
import { validateWorkerResultManifest } from "@kivro/job-io";

const root = process.cwd();

/** DEV-LOCAL-024 — automated subset wired to existing domain tests. */
describe("M18 acceptance — local E2E failure matrix", () => {
  const matrix = JSON.parse(
    fs.readFileSync(path.join(root, "tests/fixtures/local-e2e-failure-matrix.json"), "utf8"),
  ) as { scenarios: Array<{ id: string }> };

  it("lists six §570 failure scenarios", () => {
    expect(matrix.scenarios.length).toBe(6);
  });

  it("worker-offline recovery is modeled in dispatch service", () => {
    const src = fs.readFileSync(
      path.join(root, "packages/job-dispatch/src/dispatch-service.ts"),
      "utf8",
    );
    expect(src).toMatch(/rejectJobOffer/);
    expect(src).toMatch(/WORKER_OFFLINE/);
  });

  it("sandbox-unavailable fails closed", () => {
    expect(shouldFailClosedOnSandboxInit(false)).toBe(true);
  });

  it("payment-failure modes exist on fake adapter", () => {
    const prevNode = process.env.NODE_ENV;
    const prevFake = process.env.KIVRO_FAKE_PAYMENT_ADAPTER;
    const prevDev = process.env.KIVRO_DEV_PAYMENT_SHORTCUTS;
    const prevMode = process.env.KIVRO_FAKE_PAYMENT_MODE;
    process.env.NODE_ENV = "development";
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = "true";
    process.env.KIVRO_FAKE_PAYMENT_ADAPTER = "true";
    process.env.KIVRO_FAKE_PAYMENT_MODE = "insufficient_funds";
    expect(resolveFakePaymentOutcome()).toBe("insufficient_funds");
    process.env.NODE_ENV = prevNode;
    process.env.KIVRO_FAKE_PAYMENT_ADAPTER = prevFake;
    process.env.KIVRO_DEV_PAYMENT_SHORTCUTS = prevDev;
    process.env.KIVRO_FAKE_PAYMENT_MODE = prevMode;
  });

  it("buyer cancellation terminal statuses include CANCELLED", () => {
    const src = fs.readFileSync(path.join(root, "apps/api/src/routes/buyer-jobs-list.ts"), "utf8");
    expect(src).toMatch(/CANCELLED/);
  });

  it("invalid worker output is rejected at validation boundary", () => {
    const result = validateWorkerResultManifest(
      {
        contractVersion: 2,
        fields: [{ key: "scene", type: "FILE", required: true }],
      },
      {
        schemaVersion: 1,
        fields: { scene: { type: "FILE", path: "../etc/passwd" } },
      },
      "/tmp/job/output",
    );
    expect(result.ok).toBe(false);
  });

  it("lost-worker timeout is configured for local dev", () => {
    const example = fs.readFileSync(path.join(root, ".env.example"), "utf8");
    expect(example).toMatch(/KIVRO_WORKER_LOST_GRACE_MS=/);
  });
});
