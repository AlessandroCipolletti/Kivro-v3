const METADATA_HOSTS = new Set(["169.254.169.254", "metadata.google.internal"]);

/** Hostnames/IPs that must never be reached via marketplace egress (SSRF). */
export function isBlockedEgressHost(host: string): boolean {
  const normalized = host.trim().toLowerCase().replace(/\.$/, "");
  if (!normalized) {
    return true;
  }
  if (normalized === "localhost" || normalized.endsWith(".localhost")) {
    return true;
  }
  if (METADATA_HOSTS.has(normalized)) {
    return true;
  }
  if (normalized === "::1" || normalized.startsWith("fe80:")) {
    return true;
  }
  if (isIpv4(normalized)) {
    return isBlockedIpv4(normalized);
  }
  return false;
}

function isIpv4(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 4) {
    return false;
  }
  return parts.every((p) => {
    const n = Number.parseInt(p, 10);
    return String(n) === p && n >= 0 && n <= 255;
  });
}

function isBlockedIpv4(ip: string): boolean {
  const [a, b] = ip.split(".").map((p) => Number.parseInt(p, 10));
  if (a === 127) {
    return true;
  }
  if (a === 10) {
    return true;
  }
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }
  if (a === 192 && b === 168) {
    return true;
  }
  if (a === 169 && b === 254) {
    return true;
  }
  if (a === 0) {
    return true;
  }
  return false;
}
