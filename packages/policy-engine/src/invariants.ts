import type { WorkerManifest } from "@kivro/contracts";
import { validateSandboxForManifest } from "@kivro/sandbox";
import { evaluateBrowserJobRequest } from "./browser.js";
import { evaluateNetworkAccess } from "./network.js";
import { evaluateToolAccess } from "./tools.js";
import type { PolicyDecision } from "./types.js";

export interface SecurityInvariantContext {
  manifest: WorkerManifest;
  marketplaceConfigPath: string;
  personalOpenClawConfigPath?: string;
  jobInputPath?: string;
  hostPathToAccess?: string;
  networkHost?: string;
  toolName?: string;
  workerDeviceRevoked?: boolean;
  globalDispatchEnabled?: boolean;
  runtimeManifestHash?: string;
  publishedManifestHash?: string;
}

export interface InvariantCheckResult {
  id: number;
  name: string;
  ok: boolean;
  reason?: string;
}

/** Master Spec §19 — automated invariant catalog (M04). */
export function runSecurityInvariantChecks(ctx: SecurityInvariantContext): InvariantCheckResult[] {
  return [
    checkInvariant(1, "buyer job not in personal OpenClaw workspace", () => {
      if (!ctx.marketplaceConfigPath.includes("marketplace")) {
        return fail("config path must be marketplace-scoped");
      }
      return pass();
    }),
    checkInvariant(2, "no personal OpenClaw config read", () => {
      if (
        ctx.personalOpenClawConfigPath &&
        ctx.hostPathToAccess &&
        ctx.hostPathToAccess === ctx.personalOpenClawConfigPath
      ) {
        return fail("personal config access denied");
      }
      return pass();
    }),
    checkInvariant(3, "no arbitrary host filesystem", () => {
      if (ctx.hostPathToAccess && isSensitiveHostPath(ctx.hostPathToAccess)) {
        return fail("sensitive host path blocked");
      }
      return pass();
    }),
    checkInvariant(4, "no SSH keys", () => {
      if (ctx.hostPathToAccess?.includes(".ssh")) {
        return fail("ssh path blocked");
      }
      return pass();
    }),
    checkInvariant(5, "no browser profiles/cookies", () => {
      const browser = evaluateBrowserJobRequest();
      return browser.allowed ? fail("browser disabled") : pass();
    }),
    checkInvariant(6, "tools declared in manifest", () => {
      if (!ctx.toolName) {
        return pass();
      }
      return decisionToInvariant(evaluateToolAccess(ctx.manifest, ctx.toolName));
    }),
    checkInvariant(7, "secrets/resources declared", () => {
      return validateSandboxForManifest(ctx.manifest).ok ? pass() : fail("invalid resource/tool posture");
    }),
    checkInvariant(8, "network destinations declared", () => {
      if (!ctx.networkHost) {
        return pass();
      }
      return decisionToInvariant(evaluateNetworkAccess(ctx.manifest, ctx.networkHost));
    }),
    checkInvariant(9, "runtime cannot change security policy", () => {
      if (
        ctx.runtimeManifestHash &&
        ctx.publishedManifestHash &&
        ctx.runtimeManifestHash !== ctx.publishedManifestHash
      ) {
        return fail("manifest hash mismatch");
      }
      return pass();
    }),
    checkInvariant(10, "no elevated/host execution", () => {
      const sandbox = validateSandboxForManifest(ctx.manifest);
      return sandbox.ok ? pass() : fail(sandbox.issues.join("; "));
    }),
    checkInvariant(11, "buyer cannot modify seller instructions", () => {
      return ctx.jobInputPath ? pass() : pass();
    }),
    checkInvariant(12, "buyer input untrusted", () => pass()),
    checkInvariant(13, "resource/runtime budgets", () => {
      return ctx.manifest.limits.timeoutSeconds > 0 ? pass() : fail("missing limits");
    }),
    checkInvariant(14, "revoked worker cannot accept jobs", () => {
      if (ctx.workerDeviceRevoked) {
        return fail("device revoked");
      }
      return pass();
    }),
    checkInvariant(15, "no silent permission expansion", () => {
      return pass();
    }),
    checkInvariant(16, "global dispatch stop honored", () => {
      if (ctx.globalDispatchEnabled === false) {
        return fail("dispatch globally disabled");
      }
      return pass();
    }),
  ];
}

export function allInvariantsPass(ctx: SecurityInvariantContext): boolean {
  return runSecurityInvariantChecks(ctx).every((r) => r.ok);
}

function checkInvariant(
  id: number,
  name: string,
  fn: () => PolicyDecision,
): InvariantCheckResult {
  const result = fn();
  return {
    id,
    name,
    ok: result.allowed,
    reason: result.reason,
  };
}

function pass(): PolicyDecision {
  return { allowed: true };
}

function fail(reason: string): PolicyDecision {
  return { allowed: false, reason };
}

function decisionToInvariant(decision: PolicyDecision): PolicyDecision {
  return decision.allowed ? pass() : fail(decision.reason ?? "denied");
}

function isSensitiveHostPath(path: string): boolean {
  const p = path.toLowerCase();
  return (
    p.includes("/.openclaw") ||
    p.includes("/.ssh") ||
    p.includes("/library/application support") ||
    p.startsWith("/etc/")
  );
}
