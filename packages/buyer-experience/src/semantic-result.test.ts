import { describe, expect, it } from "vitest";
import { buildSemanticResultView } from "./semantic-result.js";

describe("buildSemanticResultView (BUYERUX-018/020)", () => {
  it("renders v2 contract fields with safe text", () => {
    const view = buildSemanticResultView({
      outputContract: {
        contractVersion: 2,
        fields: [
          { key: "summary", label: "Summary", type: "MARKDOWN", required: true },
          { key: "report", label: "Report", type: "FILE", required: false },
        ],
      },
      structuredOutput: { summary: "# Hello\n<script>x</script>" },
      assets: [{ id: "a1", filename: "report.pdf" }],
    });
    expect(view.fields[0]?.label).toBe("Summary");
    expect(view.fields[0]?.displayText).not.toContain("<script");
    expect(view.fields[1]?.previewMode).toBe("download_only");
  });

  it("groups file outputs by manifest outputKey", () => {
    const view = buildSemanticResultView({
      outputContract: {
        contractVersion: 2,
        fields: [
          { key: "report", label: "Report", type: "FILE", required: true },
          { key: "appendix", label: "Appendix", type: "FILES", required: false },
        ],
      },
      structuredOutput: {},
      assets: [
        { id: "1", filename: "main.pdf", outputKey: "report" },
        { id: "2", filename: "a.csv", outputKey: "appendix" },
      ],
    });
    expect(view.fields[0]?.assetRefs?.[0]?.filename).toBe("main.pdf");
    expect(view.fields[1]?.assetRefs?.length).toBe(1);
  });

  it("rejects unsafe URL schemes", () => {
    const view = buildSemanticResultView({
      outputContract: { contractVersion: 2, fields: [{ key: "link", type: "URL", required: true }] },
      structuredOutput: { link: "javascript:alert(1)" },
      assets: [],
    });
    expect(view.fields[0]?.url).toBeUndefined();
  });
});
