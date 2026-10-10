/** §277 — a capability receives only the network its declared purpose needs. */
export type NetworkPurpose = "NONE" | "PUBLIC_HTTPS" | "DECLARED_HOST";

export function networkPrimitivesForPurpose(purpose: NetworkPurpose): string[] {
  if (purpose === "PUBLIC_HTTPS") {
    return ["https"];
  }
  if (purpose === "DECLARED_HOST") {
    return ["declared-host"];
  }
  return [];
}
