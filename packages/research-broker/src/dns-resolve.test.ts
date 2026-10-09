import { describe, expect, it } from "vitest";
import { validateResearchDestination } from "./dns-resolve.js";

describe("validateResearchDestination", () => {
  it("blocks when dns resolves to private address", async () => {
    const result = await validateResearchDestination("https://public.example/page", () =>
      Promise.resolve(["10.0.0.8"]),
    );
    expect(result.ok).toBe(false);
  });

  it("allows when dns resolves to public address", async () => {
    const result = await validateResearchDestination("https://public.example/page", () =>
      Promise.resolve(["93.184.216.34"]),
    );
    expect(result.ok).toBe(true);
  });
});
