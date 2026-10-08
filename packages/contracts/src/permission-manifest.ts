import { z } from "zod";
import { parseWithSchema } from "./validate.js";

/** Master Spec §300 — public permission taxonomy states. */
export const PermissionCategoryStateSchema = z.enum([
  "NOT_USED",
  "USED",
  "READ_ONLY",
  "LIMITED",
  "SELECTED_ONLY",
  "DECLARED_DOMAINS_ONLY",
  "PUBLIC_RESEARCH_ONLY",
]);

export const PermissionCategoryKeySchema = z.enum([
  "AI_INFERENCE",
  "PUBLIC_INTERNET",
  "BROWSER",
  "PROPRIETARY_DATABASE",
  "PRIVATE_API",
  "LOCAL_FILES",
  "LOCAL_DIRECTORIES",
  "LOCAL_SOFTWARE",
  "SHELL",
  "EXTERNAL_SIDE_EFFECTS",
  "BUYER_FILE_ACCESS",
]);

export const PublicPermissionManifestSchema = z.object({
  manifestVersion: z.literal(1),
  categories: z.array(
    z.object({
      key: PermissionCategoryKeySchema,
      state: PermissionCategoryStateSchema,
      buyerLabel: z.string().min(1),
      buyerDetail: z.string().optional(),
    }),
  ),
});

export type PublicPermissionManifest = z.infer<typeof PublicPermissionManifestSchema>;

export function parsePublicPermissionManifest(data: unknown): PublicPermissionManifest {
  return parseWithSchema(PublicPermissionManifestSchema, data);
}
