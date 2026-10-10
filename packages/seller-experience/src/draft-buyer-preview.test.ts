import { describe, expect, it } from "vitest";
import type { CapabilityContract } from "@kivro/contracts";
import { buildDraftBuyerPreviewView } from "./draft-buyer-preview.js";

const contract = {
  contractVersion: 1,
  name: "Blender Product Renderer",
  description: "Render a scene",
  currency: "USD",
  priceTierCents: 800,
  inputs: {
    fields: [
      { key: "instructions", label: "Instructions", type: "text", required: true },
    ],
  },
  output: { contractVersion: 1, type: "files" },
} as CapabilityContract;

describe("buyer preview", () => {
  it("shows the buyer price and a disabled run action", () => {
    const view = buildDraftBuyerPreviewView({
      capabilityName: "Blender Product Renderer",
      capabilitySlug: "blender",
      contract,
      priceCents: 800,
      currency: "USD",
    });
    expect(view.presentation.ctaLabel).toBe("Run for $8.00");
    expect(view.presentation.purchasable).toBe(false);
    expect(view.presentation.fields[0]?.label).toBe("Instructions");
    expect(view.presentation.outputNote).toContain("does not prove");
  });
});
