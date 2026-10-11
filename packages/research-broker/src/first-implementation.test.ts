import { describe, expect, it } from "vitest";
import {
  researchImplementationMode,
  researchToolAllowed,
  sellerBrowserResearchChannelAllowed,
} from "./first-implementation.js";

describe("first research implementation", () => {
  it("uses search and fetch and refuses a seller browser", () => {
    expect(researchImplementationMode()).toBe("search_and_fetch");
    expect(researchToolAllowed("web.search")).toBe(true);
    expect(researchToolAllowed("web.fetch")).toBe(true);
    expect(researchToolAllowed("browser.readPage")).toBe(false);
    expect(researchToolAllowed("browser.searchAndRead")).toBe(false);
    expect(sellerBrowserResearchChannelAllowed("personal_chrome")).toBe(false);
    expect(sellerBrowserResearchChannelAllowed("seller_cookies")).toBe(false);
    expect(sellerBrowserResearchChannelAllowed("seller_authenticated_session")).toBe(false);
    expect(sellerBrowserResearchChannelAllowed("seller_ip_proxy")).toBe(false);
  });
});
