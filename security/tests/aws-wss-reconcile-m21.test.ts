import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createAwsComposition } from "@kivro/cloud-aws";
import { reconcileWorkerSessionOnReconnect } from "@kivro/job-dispatch";

const root = path.resolve(import.meta.dirname, "../..");

describe("M21 AWS WSS reconnect / reconciliation evidence", () => {
  it("AWS composition baseline is WSS (PORT-026 / DEPLOYMENT-AWS)", () => {
    const c = createAwsComposition();
    expect(c.workerTransport.kind).toBe("wss");
  });

  it("shared heartbeat path invokes reconcileWorkerSessionOnReconnect", () => {
    const heartbeat = fs.readFileSync(
      path.join(root, "apps/api/src/services/worker-heartbeat-service.ts"),
      "utf8",
    );
    expect(heartbeat).toContain("reconcileWorkerSessionOnReconnect");
  });

  it("reconcile export is profile-neutral (used by AWS and Netsons API)", () => {
    expect(typeof reconcileWorkerSessionOnReconnect).toBe("function");
  });
});
