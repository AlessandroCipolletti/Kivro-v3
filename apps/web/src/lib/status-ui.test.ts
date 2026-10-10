import { describe, expect, it } from "vitest";
import { approximateStartLabel, buyerJobStatusUi, formatBuyerLocalTime, marketplaceAvailabilityUi, sellerHealthUi } from "./status-ui.js";

describe("status-ui §533", () => {
  it("maps marketplace availability", () => {
    expect(marketplaceAvailabilityUi({ status: "ONLINE", accepting: true }).label).toBe(
      "Available now",
    );
    expect(marketplaceAvailabilityUi({ status: "ONLINE", accepting: false }).variant).toBe(
      "warning",
    );
    expect(
      approximateStartLabel(new Date("2026-10-10T12:00:00.000Z"), new Date("2026-10-10T18:14:00.000Z")),
    ).toBe("Starts in approximately 6h 14m");
    const local = formatBuyerLocalTime("2026-10-13T00:00:00.000Z", "America/New_York");
    expect(local).toContain("8:00");
    expect(local).not.toMatch(/:\d{2}:\d{2}/);
    expect(marketplaceAvailabilityUi({ status: "SCHEDULED_OFFLINE", accepting: false }).label).not.toMatch(
      /will start at/i,
    );
    expect(marketplaceAvailabilityUi({ status: "SECURITY_BLOCKED" }).label).toBe("Unavailable");
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
