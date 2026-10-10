import { sanitizeDownloadFilename } from "@kivro/job-io";

export type BundleEntryPlan = {
  assetId: string;
  zipPath: string;
  filename: string;
  bucket?: string;
  objectKey?: string;
};

const MAX_BUNDLE_FILES = 50;
const MAX_ZIP_PATH_LEN = 180;

/** BUYERUX-021/022 — bounded download-all plan with path traversal resistance. */
export function planSafeDownloadBundleEntries(
  assets: Array<{ id: string; filename: string; bucket?: string; objectKey?: string }>,
): { ok: true; entries: BundleEntryPlan[] } | { ok: false; error: string } {
  if (assets.length === 0) {
    return { ok: false, error: "NO_ASSETS" };
  }
  if (assets.length > MAX_BUNDLE_FILES) {
    return { ok: false, error: "TOO_MANY_FILES" };
  }
  const used = new Set<string>();
  const entries: BundleEntryPlan[] = [];
  for (let i = 0; i < assets.length; i += 1) {
    const asset = assets[i]!;
    let base = sanitizeDownloadFilename(asset.filename);
    if (!base || base === "download.bin") {
      base = `deliverable-${i + 1}.bin`;
    }
    if (base.includes("/") || base.includes("\\") || base.startsWith(".")) {
      base = base.replace(/[/\\]/g, "_").replace(/^\.+/, "_");
    }
    let zipPath = base;
    let suffix = 1;
    while (used.has(zipPath)) {
      zipPath = `${base.replace(/(\.[^.]+)?$/, "")}-${suffix}${base.match(/(\.[^.]+)$/)?.[1] ?? ""}`;
      suffix += 1;
    }
    if (zipPath.length > MAX_ZIP_PATH_LEN) {
      zipPath = zipPath.slice(0, MAX_ZIP_PATH_LEN);
    }
    used.add(zipPath);
    entries.push({
      assetId: asset.id,
      zipPath,
      filename: base,
      bucket: asset.bucket,
      objectKey: asset.objectKey,
    });
  }
  return { ok: true, entries };
}
