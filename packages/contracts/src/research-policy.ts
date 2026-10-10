import { z } from "zod";
import { parseWithSchema } from "./validate.js";

export const InternetAccessModeSchema = z.enum([
  "NO_NETWORK",
  "PUBLIC_WEB_RESEARCH",
  "DECLARED_API_ACCESS",
]);

export const DomainPolicySchema = z.enum(["ANY_PUBLIC_DOMAIN", "ONLY_DECLARED_DOMAINS"]);

export const InternetResearchPolicySchema = z.object({
  mode: InternetAccessModeSchema,
  domainPolicy: DomainPolicySchema,
  declaredDomains: z.array(z.string().min(1)).optional(),
  search: z
    .object({
      enabled: z.boolean(),
      maxQueriesPerJob: z.number().int().positive().optional(),
    })
    .optional(),
  fetch: z
    .object({
      enabled: z.boolean(),
      maxPagesPerJob: z.number().int().positive().optional(),
      maxResponseBytes: z.number().int().positive().optional(),
      maxDownloadBytesPerJob: z.number().int().positive().optional(),
      allowedContentTypes: z.array(z.string().min(1)).optional(),
      allowDocumentDownload: z.boolean().optional(),
    })
    .optional(),
  budgets: z
    .object({
      maxTotalNetworkBytesPerJob: z.number().int().positive().optional(),
      maxResearchDurationSeconds: z.number().int().positive().optional(),
    })
    .optional(),
});

export type InternetResearchPolicy = z.infer<typeof InternetResearchPolicySchema>;

export const ResearchSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  accessedAt: z.string().datetime(),
});

export type ResearchSource = z.infer<typeof ResearchSourceSchema>;

export function parseInternetResearchPolicy(data: unknown): InternetResearchPolicy {
  return parseWithSchema(InternetResearchPolicySchema, data);
}

/** §246 — default public research policy (seller may only tighten). */
export function defaultPublicWebResearchPolicy(): InternetResearchPolicy {
  return {
    mode: "PUBLIC_WEB_RESEARCH",
    domainPolicy: "ANY_PUBLIC_DOMAIN",
    search: { enabled: true, maxQueriesPerJob: 30 },
    fetch: {
      enabled: true,
      maxPagesPerJob: 50,
      maxResponseBytes: 5_000_000,
      maxDownloadBytesPerJob: 20_000_000,
      allowedContentTypes: ["text/html", "text/plain", "application/json", "image/png", "image/jpeg"],
      allowDocumentDownload: true,
    },
    budgets: {
      maxTotalNetworkBytesPerJob: 50_000_000,
      maxResearchDurationSeconds: 600,
    },
  };
}

/** §277 — a job receives the smallest network mode that matches its declared purpose. */
export function networkPrimitiveForPurpose(
  purpose: "none" | "public_web_research" | "declared_api" | "arbitrary_seller_network",
): "NO_NETWORK" | "PUBLIC_WEB_RESEARCH" | "DECLARED_API_ACCESS" | null {
  if (purpose === "none") {
    return "NO_NETWORK";
  }
  if (purpose === "public_web_research") {
    return "PUBLIC_WEB_RESEARCH";
  }
  if (purpose === "declared_api") {
    return "DECLARED_API_ACCESS";
  }
  return null;
}
