import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SHARED_API_CONTRACT_VERSION } from "@kivro/cloud-core";
import { WORKER_PROTOCOL_COMPATIBILITY_WINDOW } from "@kivro/contracts";

describe("M19 conformance release manifest", () => {
  it("M24-GOLD-007 records parity metadata for both profiles", () => {
    const manifest = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "tests/fixtures/backend-conformance-manifest.json"),
        "utf8",
      ),
    ) as {
      apiContractVersion: string;
      workerProtocolCompatibility: typeof WORKER_PROTOCOL_COMPATIBILITY_WINDOW;
      profiles: { netsons: { workerTransport: string }; aws: { workerTransport: string } };
    };
    expect(manifest.apiContractVersion).toBe(SHARED_API_CONTRACT_VERSION);
    expect(manifest.profiles.netsons.workerTransport).toBe("polling");
    expect(manifest.profiles.aws.workerTransport).toBe("wss");
    expect(manifest.workerProtocolCompatibility).toEqual(WORKER_PROTOCOL_COMPATIBILITY_WINDOW);
  });
});
