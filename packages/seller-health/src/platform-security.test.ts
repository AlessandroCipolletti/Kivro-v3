import { describe, expect, it } from "vitest";
import { pickPlatformSecurityPauseTrigger, platformSecurityPauseCanClear } from "./platform-security.js";
import type { SecurityWarning } from "./security-warnings.js";

const critical = (code: string): SecurityWarning => ({
  severity: "CRITICAL",
  code,
  title: code,
  description: "test",
  blocking: true,
  requiredAction: "fix",
  detectedAt: new Date().toISOString(),
});

describe("platform security pause §393", () => {
  it("triggers on sandbox not ready", () => {
    const result = pickPlatformSecurityPauseTrigger([critical("SANDBOX_NOT_READY")]);
    expect(result.trigger).toBe(true);
  });

  it("cannot clear while trigger remains", () => {
    expect(platformSecurityPauseCanClear([critical("DOCKER_UNAVAILABLE")])).toBe(false);
  });
});
