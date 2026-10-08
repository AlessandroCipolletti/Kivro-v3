import { z } from "zod";
import { PublicPermissionManifestSchema } from "@kivro/contracts";

/** §96 — discovery snapshot from Worker scan (read-only). */
export const DiscoverySnapshotSchema = z.object({
  snapshotVersion: z.literal(1),
  skills: z.array(z.string()),
  tools: z.array(z.string()),
  warnings: z.array(z.string()).default([]),
});

export type DiscoverySnapshot = z.infer<typeof DiscoverySnapshotSchema>;

/** Explicit seller selections; nothing selected by default. */
export const ImportConsentSchema = z.object({
  consentVersion: z.literal(1),
  selectedSkills: z.array(z.string()),
  selectedTools: z.array(z.string()),
  permissionManifest: PublicPermissionManifestSchema,
});

export type ImportConsent = z.infer<typeof ImportConsentSchema>;

export function validateImportConsent(
  discovery: DiscoverySnapshot,
  consent: ImportConsent,
): { ok: true } | { ok: false; code: string } {
  for (const skill of consent.selectedSkills) {
    if (!discovery.skills.includes(skill)) {
      return { ok: false, code: "SKILL_NOT_IN_DISCOVERY" };
    }
  }
  for (const tool of consent.selectedTools) {
    if (!discovery.tools.includes(tool)) {
      return { ok: false, code: "TOOL_NOT_IN_DISCOVERY" };
    }
  }
  const usedCategories = consent.permissionManifest.categories.filter(
    (c) => c.state !== "NOT_USED",
  );
  if (consent.selectedSkills.length > 0 && usedCategories.length === 0) {
    return { ok: false, code: "PERMISSION_MANIFEST_REQUIRED" };
  }
  return { ok: true };
}
