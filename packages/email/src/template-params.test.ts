import { describe, expect, it } from "vitest";
import { namesFromEmail } from "./template-params.js";

describe("namesFromEmail", () => {
  it("splits dotted local parts", () => {
    expect(namesFromEmail("jane.doe@example.com")).toEqual({
      firstName: "Jane",
      lastName: "Doe",
    });
  });

  it("uses local part as first name only", () => {
    expect(namesFromEmail("seller@example.com")).toEqual({
      firstName: "Seller",
      lastName: "",
    });
  });
});
