import { describe, expect, it } from "vitest";
import { buildAiAssistedDraftProposal } from "./ai-draft-boundary.js";

describe("AI draft boundary SELLERUX-004", () => {
  it("never authorizes auto publish", () => {
    const draft = buildAiAssistedDraftProposal({ skills: ["demo-skill"], tools: [], resources: [] });
    expect(draft.canAutoPublish).toBe(false);
    expect(draft.sellerMustReview).toBe(true);
    expect(draft.suggestedInputs.fields.length).toBeGreaterThan(0);
  });
});
