import { describe, expect, it } from "vitest";
import { buyerJobStatusUi, marketplaceAvailabilityUi, sellerHealthUi } from "./status-ui.js";

describe("status-ui §533", () => {
  it("maps marketplace availability", () => {
    expect(marketplaceAvailabilityUi({ status: "ONLINE", accepting: true }).label).toBe(
      "Available now",
    );
    expect(marketplaceAvailabilityUi({ status: "ONLINE", accepting: false }).variant).toBe(
      "warning",
    );
  });

  it("maps buyer job visible labels", () => {
    expect(buyerJobStatusUi("Completed")).toBe("success");
    expect(buyerJobStatusUi("Failed")).toBe("danger");
    expect(buyerJobStatusUi("Running on Worker")).toBe("info");
  });

  it("maps seller health labels", () => {
    expect(sellerHealthUi("Critical security warning")).toBe("danger");
    expect(sellerHealthUi("Healthy")).toBe("success");
  });
});
