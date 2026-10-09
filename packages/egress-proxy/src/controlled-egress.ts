import type { WorkerManifest } from "@kivro/contracts";
import { evaluateEgressRequest, normalizeNetworkHost } from "@kivro/policy-engine";
import type { ControlledEgressDecision, ControlledEgressRequest } from "./types.js";

const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"]);

/** §16.2 / §72 — brokered egress evaluation (no raw sandbox Internet). */
export class ControlledEgressProxy {
  evaluate(request: ControlledEgressRequest): ControlledEgressDecision {
    const method = (request.method ?? "GET").toUpperCase();
    if (!ALLOWED_METHODS.has(method)) {
      return deny("method not allowed", request);
    }
    let parsed: URL;
    try {
      parsed = new URL(request.url);
    } catch {
      return deny("invalid url", request);
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return deny("protocol not allowed", request);
    }
    const host = normalizeNetworkHost(parsed.hostname);
    const port = parsed.port
      ? Number.parseInt(parsed.port, 10)
      : parsed.protocol === "https:"
        ? 443
        : 80;
    const decision = evaluateEgressRequest(request.manifest, host, port);
    if (!decision.allowed) {
      return {
        allowed: false,
        reason: decision.reason,
        host,
        port,
        audit: auditFields(request, host, port, method),
      };
    }
    if (request.redirectUrl) {
      const redirect = new URL(request.redirectUrl);
      const redirectHost = normalizeNetworkHost(redirect.hostname);
      const redirectPort = redirect.port
        ? Number.parseInt(redirect.port, 10)
        : redirect.protocol === "https:"
          ? 443
          : 80;
      const redirectDecision = evaluateEgressRequest(request.manifest, redirectHost, redirectPort);
      if (!redirectDecision.allowed || redirectHost !== host) {
        return deny("redirect target not allowed", request, host, port);
      }
    }
    return {
      allowed: true,
      host,
      port,
      audit: auditFields(request, host, port, method),
    };
  }
}

function deny(
  reason: string,
  request: ControlledEgressRequest,
  host?: string,
  port?: number,
): ControlledEgressDecision {
  return {
    allowed: false,
    reason,
    host,
    port,
    audit: auditFields(request, host ?? "unknown", port ?? 0, request.method ?? "GET"),
  };
}

function auditFields(
  request: ControlledEgressRequest,
  host: string,
  port: number,
  method: string,
): Record<string, string> {
  return {
    layer: "controlled-egress-proxy",
    method,
    host,
    port: String(port),
    capabilityVersionId: request.manifest.capabilityVersionId,
  };
}

export function evaluateControlledEgress(
  manifest: WorkerManifest,
  url: string,
  method?: string,
): ControlledEgressDecision {
  return new ControlledEgressProxy().evaluate({ manifest, url, method });
}
