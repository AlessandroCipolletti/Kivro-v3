import { describe, expect, it } from "vitest";
import {
  READ_ONLY_DISCOVERY_SOURCES,
  buyerStartsOnWebMarketplace,
  configurationAccessMode,
  discoveryAccessMode,
  explicitMinimumSubset,
  acceptCompanionPublication,
  projectDeclaredResult,
} from "./companion-worker.js";

describe("companion worker boundaries", () => {
  it("reads configuration and discovery without writing, and starts the buyer on the marketplace", () => {
    expect(discoveryAccessMode()).toBe("read_only");
    expect(READ_ONLY_DISCOVERY_SOURCES).toEqual([
      "proprietary_read_only_database",
      "selected_local_files",
      "private_configuration",
    ]);
    expect(configurationAccessMode()).toBe("read_only");
    expect(buyerStartsOnWebMarketplace("web_marketplace")).toBe(true);
    expect(buyerStartsOnWebMarketplace("seller_openclaw")).toBe(false);
  });

  it("keeps unselected resources out and returns only declared output", () => {
    const selected = explicitMinimumSubset([
      { id: "notes", selected: true },
      { id: "database", selected: false },
    ]);
    expect(selected.map((resource) => resource.id)).toEqual(["notes"]);
    expect(
      projectDeclaredResult(
        { report: "ok", secret: "no", runtimeMs: 10 },
        ["report"],
        ["runtimeMs"],
      ),
    ).toEqual({ report: "ok", runtimeMs: 10 });
  });

  it("publishes a companion only when discovery, credentials, runtime, and the result stay narrow", () => {
    const ready = acceptCompanionPublication({
      discoveryMode: "read_only",
      scanShown: true,
      resources: [{ id: "notes", selected: true }],
      workerConfigId: "worker-config",
      personalConfigId: "personal-config",
      credentialStore: "worker",
      connection: "outbound",
      receivesPaidJobs: true,
      runtime: "restricted_sandbox",
      output: { report: "ok", secret: "no" },
      declaredOutputKeys: ["report"],
      approvedMetadataKeys: [],
      auditRecorded: true,
      buyerChannel: "web_marketplace",
    });
    expect(ready.ok).toBe(true);
    expect(ready.result).toEqual({ report: "ok" });
    expect(acceptCompanionPublication({ ...readyInput(), credentialStore: "personal_openclaw" }).reasons).toContain(
      "credentials",
    );
  });
});

function readyInput() {
  return {
    discoveryMode: "read_only" as const,
    scanShown: true,
    resources: [{ id: "notes", selected: true }],
    workerConfigId: "worker-config",
    personalConfigId: "personal-config",
    credentialStore: "worker" as const,
    connection: "outbound" as const,
    receivesPaidJobs: true,
    runtime: "restricted_sandbox" as const,
    output: { report: "ok" },
    declaredOutputKeys: ["report"],
    approvedMetadataKeys: [],
    auditRecorded: true,
    buyerChannel: "web_marketplace",
  };
}
