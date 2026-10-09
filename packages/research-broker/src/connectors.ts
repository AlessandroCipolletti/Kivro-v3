import type { ApiConnector } from "@kivro/contracts";
import { validateResearchUrl } from "./ssrf.js";
import { classifyHttpMethod } from "./method-policy.js";

export interface ConnectorInvokeRequest {
  connectorId: string;
  payload: Record<string, unknown>;
}

export interface ConnectorInvokeResult {
  allowed: boolean;
  reason?: string;
  internalMethod?: string;
  internalUrl?: string;
}

/** §263 — capabilities invoke typed connectors, not raw POST. */
export function planConnectorInvocation(
  connectors: ApiConnector[] | undefined,
  request: ConnectorInvokeRequest,
): ConnectorInvokeResult {
  const connector = connectors?.find((c) => c.id === request.connectorId);
  if (!connector) {
    return { allowed: false, reason: "connector not declared" };
  }
  const effect = classifyHttpMethod(connector.method);
  if (effect === "UNKNOWN") {
    return { allowed: false, reason: "unknown side effect" };
  }
  if (effect === "SIDE_EFFECTING" && connector.sideEffect !== "SIDE_EFFECTING") {
    return { allowed: false, reason: "side effect not declared on connector" };
  }
  const url = `https://${connector.host}${connector.pathTemplate}`;
  const validated = validateResearchUrl(url);
  if (!validated.ok) {
    return { allowed: false, reason: validated.reason };
  }
  return {
    allowed: true,
    internalMethod: connector.method,
    internalUrl: url,
  };
}
