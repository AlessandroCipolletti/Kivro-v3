import { createHash } from "node:crypto";
import type { InternetResearchPolicy, ResearchSource, WorkerManifest } from "@kivro/contracts";
import {
  DEFAULT_PLATFORM_RESEARCH_CEILINGS,
  type PlatformResearchCeilings,
} from "@kivro/platform-policy";
import { buildAuditEntry, hashSearchQuery, type ResearchAuditEntry } from "./audit.js";
import { assertSafeResearchContent } from "./download-guard.js";
import type { DnsResolver } from "./dns-resolve.js";
import { validateResearchDestination } from "./dns-resolve.js";
import type { ResearchProvenanceCollector } from "./provenance.js";
import { researchPolicyError, type ResearchPolicyError } from "./research-errors.js";
import { sanitizeResearchText, type WebPageResult } from "./sanitize-content.js";
import {
  checkFetchBudget,
  checkSearchBudget,
  createResearchBudgetState,
  type ResearchBudgetState,
} from "./budget.js";
import { isDomainAllowedForResearch } from "./domain-policy.js";
import { isAllowedResearchMethod } from "./method-policy.js";
import { safeResearchFetch, type FetchImpl } from "./safe-fetch.js";
import type { SearchResult, WebSearchProvider } from "./search-provider.js";
export interface ResearchBrokerContext {
  jobId?: string;
  manifest: WorkerManifest;
  policy?: InternetResearchPolicy;
  ceilings?: PlatformResearchCeilings;
  budget?: ResearchBudgetState;
  auditLog?: ResearchAuditEntry[];
  provenance?: ResearchProvenanceCollector;
  dnsResolver?: DnsResolver;
}

export interface WebSearchRequest {
  query: string;
  maxResults?: number;
}

export interface WebFetchRequest {
  url: string;
  mode?: "readable_text" | "head";
}

export interface ResearchBrokerDecision<T = unknown> {
  allowed: boolean;
  reason?: string;
  error?: ResearchPolicyError;
  data?: T;
  audit?: ResearchAuditEntry;
}

function resolvePolicy(ctx: ResearchBrokerContext): InternetResearchPolicy {
  return (
    ctx.policy ??
    ctx.manifest.internet ?? {
      mode: "NO_NETWORK",
      domainPolicy: "ANY_PUBLIC_DOMAIN" as const,
    }
  );
}

export class ResearchBroker {
  constructor(
    private readonly searchProvider: WebSearchProvider,
    private readonly fetchImpl: FetchImpl,
    private readonly defaultDnsResolver?: DnsResolver,
  ) {}

  async webSearch(
    ctx: ResearchBrokerContext,
    request: WebSearchRequest,
  ): Promise<ResearchBrokerDecision<SearchResult[]>> {
    const policy = resolvePolicy(ctx);
    const ceilings = ctx.ceilings ?? DEFAULT_PLATFORM_RESEARCH_CEILINGS;
    const budget = ctx.budget ?? createResearchBudgetState();
    const auditLog = ctx.auditLog ?? [];

    if (policy.mode === "NO_NETWORK") {
      return this.block(ctx, "web.search", "internet access disabled", auditLog);
    }
    if (!policy.search?.enabled) {
      return this.block(ctx, "web.search", "search disabled by policy", auditLog);
    }
    const budgetCheck = checkSearchBudget(budget, policy, ceilings);
    if (!budgetCheck.ok) {
      return this.block(ctx, "web.search", budgetCheck.reason ?? "budget", auditLog);
    }

    budget.inFlight += 1;
    try {
      const maxResults = Math.min(request.maxResults ?? 10, 20);
      const results = await this.searchProvider.search({
        query: request.query,
        maxResults,
      });
      budget.searchQueries += 1;
      const entry = buildAuditEntry({
        jobId: ctx.jobId,
        capabilityVersionId: ctx.manifest.capabilityVersionId,
        operation: "web.search",
        queryHash: hashSearchQuery(request.query),
        bytes: 0,
        status: 200,
      });
      auditLog.push(entry);
      return { allowed: true, data: results, audit: entry };
    } finally {
      budget.inFlight -= 1;
    }
  }

  async webFetch(
    ctx: ResearchBrokerContext,
    request: WebFetchRequest,
  ): Promise<
    ResearchBrokerDecision<{ bodyText?: string; source: ResearchSource; page?: WebPageResult }>
  > {
    const policy = resolvePolicy(ctx);
    const ceilings = ctx.ceilings ?? DEFAULT_PLATFORM_RESEARCH_CEILINGS;
    const budget = ctx.budget ?? createResearchBudgetState();
    const auditLog = ctx.auditLog ?? [];

    if (policy.mode === "NO_NETWORK") {
      return this.block(ctx, "web.fetch", "internet access disabled", auditLog);
    }
    if (!policy.fetch?.enabled) {
      return this.block(ctx, "web.fetch", "fetch disabled by policy", auditLog);
    }
    const method: "GET" | "HEAD" = request.mode === "head" ? "HEAD" : "GET";
    if (!isAllowedResearchMethod(policy.mode, method)) {
      return this.block(ctx, "web.fetch", "method not allowed for research mode", auditLog);
    }

    const dnsResolver = ctx.dnsResolver ?? this.defaultDnsResolver;
    const urlCheck = await validateResearchDestination(request.url, dnsResolver);
    if (!urlCheck.ok || !urlCheck.host) {
      return this.block(ctx, "web.fetch", urlCheck.reason ?? "invalid url", auditLog);
    }
    if (!isDomainAllowedForResearch(policy, urlCheck.host)) {
      return this.block(ctx, "web.fetch", "domain not in allowlist", auditLog);
    }

    const maxResponseBytes = Math.min(
      policy.fetch.maxResponseBytes ?? ceilings.maxResponseBytes,
      ceilings.maxResponseBytes,
    );
    const preBudget = checkFetchBudget(budget, policy, ceilings, maxResponseBytes);
    if (!preBudget.ok) {
      return this.block(ctx, "web.fetch", preBudget.reason ?? "budget", auditLog);
    }

    budget.inFlight += 1;
    try {
      const fetched = await safeResearchFetch(
        {
          url: request.url,
          method,
          allowedContentTypes: policy.fetch.allowedContentTypes,
          maxResponseBytes,
          ceilings,
        },
        this.fetchImpl,
        dnsResolver,
      );
      if (!fetched.ok) {
        return this.block(ctx, "web.fetch", fetched.reason ?? "fetch blocked", auditLog, {
          host: urlCheck.host,
          method,
          contentType: fetched.contentType,
          status: fetched.status,
        });
      }
      if (fetched.bodyBytes) {
        const safeContent = assertSafeResearchContent(fetched.bodyBytes, fetched.contentType);
        if (!safeContent.ok) {
          return this.block(ctx, "web.fetch", safeContent.reason ?? "content blocked", auditLog);
        }
      }

      budget.fetchedPages += 1;
      budget.downloadedBytes += fetched.bytes ?? 0;
      budget.totalNetworkBytes += fetched.bytes ?? 0;

      const finalUrl = fetched.finalUrl ?? request.url;
      const contentType = fetched.contentType ?? "text/plain";
      const sanitized = sanitizeResearchText(fetched.bodyText ?? "", contentType);
      const contentSha256 = createHash("sha256")
        .update(fetched.bodyBytes ?? new Uint8Array())
        .digest("hex");
      const source: ResearchSource = {
        url: finalUrl,
        accessedAt: new Date().toISOString(),
      };
      ctx.provenance?.add(source);
      const page: WebPageResult = {
        finalUrl,
        text: sanitized,
        contentType,
        fetchedAt: source.accessedAt,
        contentSha256,
      };
      const entry = buildAuditEntry({
        jobId: ctx.jobId,
        capabilityVersionId: ctx.manifest.capabilityVersionId,
        operation: "web.fetch",
        host: urlCheck.host,
        method,
        contentType: fetched.contentType,
        bytes: fetched.bytes,
        status: fetched.status,
      });
      auditLog.push(entry);
      return { allowed: true, data: { bodyText: sanitized, source, page }, audit: entry };
    } finally {
      budget.inFlight -= 1;
    }
  }

  private block<T>(
    ctx: ResearchBrokerContext,
    operation: ResearchAuditEntry["operation"],
    reason: string,
    auditLog: ResearchAuditEntry[],
    extra?: Partial<ResearchAuditEntry>,
  ): ResearchBrokerDecision<T> {
    const entry = buildAuditEntry({
      jobId: ctx.jobId,
      capabilityVersionId: ctx.manifest.capabilityVersionId,
      operation,
      blockedReason: reason,
      ...extra,
    });
    auditLog.push(entry);
    return {
      allowed: false,
      reason,
      error: mapBlockReasonToError(operation, reason),
      audit: entry,
    };
  }
}

function mapBlockReasonToError(
  operation: ResearchAuditEntry["operation"],
  reason: string,
): ResearchPolicyError {
  if (reason.includes("budget") || reason.includes("concurrency")) {
    return researchPolicyError("BUDGET_EXCEEDED", reason);
  }
  if (reason.includes("method")) {
    return researchPolicyError("METHOD_NOT_ALLOWED", reason);
  }
  if (reason.includes("content") || reason.includes("executable")) {
    return researchPolicyError("CONTENT_NOT_ALLOWED", reason);
  }
  if (reason.includes("blocked") || reason.includes("dns") || reason.includes("domain")) {
    return researchPolicyError("DESTINATION_BLOCKED", reason);
  }
  if (operation === "connector.invoke") {
    return researchPolicyError("CONNECTOR_NOT_DECLARED", reason);
  }
  return researchPolicyError("NETWORK_POLICY_VIOLATION", reason);
}
