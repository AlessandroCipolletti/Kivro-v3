import { describe, expect, it } from "vitest";
import { buildSanitizedInputSnapshotView } from "./input-snapshot.js";

describe("buildSanitizedInputSnapshotView (BUYERUX-023)", () => {
  it("summarizes file fields without exposing storage keys", () => {
    const view = buildSanitizedInputSnapshotView({
      inputContractSnapshot: {
        contractVersion: 2,
        fields: [{ key: "doc", label: "Document", type: "FILE", required: true }],
      },
      structuredInput: { doc: "ignored" },
      assetManifest: { doc: [{ assetId: "secret-id", filename: "x.pdf" }] },
    });
    expect(view.fields[0]?.displayValue).toContain("1 uploaded file");
    expect(JSON.stringify(view)).not.toContain("secret-id");
  });
});
