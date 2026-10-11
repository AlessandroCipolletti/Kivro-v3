import { describe, expect, it } from "vitest";
import { parseCapabilityContract } from "@kivro/contracts";
import { runLocalWorkerPreview } from "./local-worker-preview.js";

const contract = parseCapabilityContract({
  name: "Blender Product Renderer",
  description: "Render",
  currency: "USD",
  priceTierCents: 800,
  inputs: {
    contractVersion: 2,
    fields: [
      {
        key: "instructions",
        label: "Instructions",
        type: "LONG_TEXT",
        required: true,
        constraints: { text: { minLength: 10 } },
      },
    ],
  },
  output: {
    contractVersion: 2,
    fields: [{ key: "renders", type: "FILES", required: true }],
  },
});

describe("local worker preview", () => {
  it("runs the buyer form on the local worker and does not make it purchasable", async () => {
    const missing = await runLocalWorkerPreview({
      capabilityName: contract.name,
      capabilitySlug: "blender",
      contract,
      priceCents: 800,
      currency: "USD",
      inputs: { instructions: "long enough text" },
      assets: {},
      declaredOutputKeys: ["renders"],
      approvedMetadataKeys: [],
    });
    expect(missing).toEqual({ ran: false, reason: "worker_required", purchasable: false });

    const ran = await runLocalWorkerPreview({
      capabilityName: contract.name,
      capabilitySlug: "blender",
      contract,
      priceCents: 800,
      currency: "USD",
      inputs: { instructions: "long enough text" },
      assets: {},
      declaredOutputKeys: ["renders"],
      approvedMetadataKeys: ["runtimeMs"],
      worker: async () => ({ renders: ["a.png"], secret: "no", runtimeMs: 20 }),
    });
    expect(ran).toEqual({
      ran: true,
      purchasable: false,
      result: { renders: ["a.png"], runtimeMs: 20 },
    });
  });
});
