export function normalizeNetworkHost(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    if (end > 0) {
      return trimmed.slice(1, end);
    }
  }
  const colon = trimmed.lastIndexOf(":");
  if (colon > 0 && trimmed.includes(".") && trimmed.indexOf(":") === colon) {
    return trimmed.slice(0, colon);
  }
  return trimmed;
}
