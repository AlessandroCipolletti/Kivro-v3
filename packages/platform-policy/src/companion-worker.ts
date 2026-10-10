/** Sources the companion may read. Nothing here is a write credential. */
export const READ_ONLY_DISCOVERY_SOURCES = [
  "proprietary_read_only_database",
  "selected_local_files",
  "private_configuration",
] as const;

export function discoveryAccessMode(): "read_only" {
  return "read_only";
}

export function configurationAccessMode(): "read_only" {
  return "read_only";
}

export function buyerStartsOnWebMarketplace(channel: string): boolean {
  return channel === "web_marketplace";
}

/** Resources stay unselected until the seller turns them on. */
export function explicitMinimumSubset<T extends { selected: boolean }>(resources: T[]): T[] {
  return resources.filter((resource) => resource.selected);
}

/** A finished job returns declared output keys and approved metadata, nothing else. */
export function projectDeclaredResult(
  output: Record<string, unknown>,
  declaredOutputKeys: string[],
  approvedMetadataKeys: string[],
): Record<string, unknown> {
  const allowed = new Set([...declaredOutputKeys, ...approvedMetadataKeys]);
  const projected: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(output)) {
    if (allowed.has(key)) {
      projected[key] = value;
    }
  }
  return projected;
}
