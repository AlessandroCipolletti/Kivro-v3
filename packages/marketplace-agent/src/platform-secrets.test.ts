import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  exampleAssignsSecretValue,
  HOST_SECRET_CONTROLS,
  platformAiKeyVisibleTo,
  productionPlatformSecretSource,
  sourceEmbedsPlatformSecret,
} from "./platform-secrets.js";

describe("platform AI secrets", () => {
  it("shows a key only to the server and keeps example values empty", () => {
    expect(platformAiKeyVisibleTo("server")).toBe(true);
    expect(platformAiKeyVisibleTo("browser")).toBe(false);
    expect(platformAiKeyVisibleTo("worker")).toBe(false);
    expect(platformAiKeyVisibleTo("log")).toBe(false);
    expect(productionPlatformSecretSource()).toBe("managed_env_injection");
    const example = readFileSync(resolve(process.cwd(), ".env.example"), "utf8");
    const leaked = example.split("\n").filter((line) => exampleAssignsSecretValue(line));
    expect(leaked).toEqual([]);
    expect(sourceEmbedsPlatformSecret("KIVRO_PLATFORM_OPENAI_API_KEY=")).toBe(false);
    expect(sourceEmbedsPlatformSecret('KIVRO_PLATFORM_OPENAI_API_KEY="sk-live"')).toBe(true);
    expect(HOST_SECRET_CONTROLS).toContain("encryption_at_rest");
    const dockerfile = readFileSync(resolve(process.cwd(), "docs/deploy/aws/Dockerfile"), "utf8");
    expect(sourceEmbedsPlatformSecret(dockerfile)).toBe(false);
  });
});
