import type { InternetResearchPolicy, ResearchSource, WorkerManifest } from "@kivro/contracts";
import {
  DEFAULT_PLATFORM_RESEARCH_CEILINGS,
  type PlatformResearchCeilings,
} from "@kivro/platform-policy";
import { buildAuditEntry, hashSearchQuery, type ResearchAuditEntry } from "./audit.js";
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
import { validateResearchUrl } from "./ssrf.js";

export interface ResearchBrokerContext {
  jobId?: string;
  manifest: WorkerManifest;
  policy?: InternetResearchPolicy;
  ceilings?: PlatformResearchCeilings;
  budget?: ResearchBudgetState;
  auditLog?: ResearchAuditEntry[];
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
  ): Promise<ResearchBrokerDecision<{ bodyText?: string; source: ResearchSource }>> {
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

    const urlCheck = validateResearchUrl(request.url);
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
      );
      if (!fetched.ok) {
        return this.block(ctx, "web.fetch", fetched.reason ?? "fetch blocked", auditLog, {
          host: urlCheck.host,
          method,
          contentType: fetched.contentType,
          status: fetched.status,
        });
      }
      budget.fetchedPages += 1;
      budget.downloadedBytes += fetched.bytes ?? 0;
      budget.totalNetworkBytes += fetched.bytes ?? 0;

      const source: ResearchSource = {
        url: fetched.finalUrl ?? request.url,
        accessedAt: new Date().toISOString(),
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
      return { allowed: true, data: { bodyText: fetched.bodyText, source }, audit: entry };
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
    return { allowed: false, reason, audit: entry };
  }
}
