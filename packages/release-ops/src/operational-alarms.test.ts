import { describe, expect, it } from "vitest";
import { assertRequiredOperationalAlarms, parseOperationalAlarmsManifest } from "./operational-alarms.js";

describe("operational alarms (M27 / HARD-028)", () => {
  it("M27-GOLD-005 requires backlog, worker version, reconciliation alarms", () => {
    const manifest = parseOperationalAlarmsManifest({
      milestone: "M27",
      alarms: [
        { id: "release-parity-regression", signal: "a", severity: "critical", description: "d" },
        { id: "durable-work-backlog-age", signal: "b", severity: "warning", description: "d" },
        { id: "worker-version-skew", signal: "c", severity: "warning", description: "d" },
        { id: "payment-reconciliation-anomaly", signal: "e", severity: "critical", description: "d" },
      ],
    });
    expect(assertRequiredOperationalAlarms(manifest).ok).toBe(true);
  });
});
