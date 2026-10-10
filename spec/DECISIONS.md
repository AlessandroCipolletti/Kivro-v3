# Kivro Architecture & Product Decisions

This is the durable decision log for implementation. It prevents coding
agents from silently reinterpreting settled product decisions.
`MASTER-SPEC.md` remains authoritative.

## Canonical decisions

### DEC-001 --- Kivro is runtime-independent as a brand

OpenClaw is the first supported seller runtime, not the permanent
product identity.

### DEC-002 --- Seller execution is isolated from personal OpenClaw

Paid jobs execute through the Kivro Worker in a separate minimal
OpenClaw environment. Buyers never access the seller's personal OpenClaw
session/workspace.

### DEC-003 --- Fail closed

No sandbox, incompatible runtime, critical security failure, or missing
required dependency means no paid execution. Never fall back to host
execution.

### DEC-004 --- Capabilities, not remote computer access

Buyers purchase narrow, typed, versioned capabilities. They do not
purchase arbitrary shell/browser/network access to seller machines.

### DEC-005 --- Explicit dependency consent

Every discovered skill/tool/resource/inference/network dependency must
be explicitly approved by the seller before publication.

### DEC-006 --- Controlled network access

Public research is mediated and policy-controlled.
Private/LAN/localhost/metadata access is blocked. Specialized
authenticated APIs use declared typed connectors.

### DEC-007 --- Payment before execution

No secured payment or reserved prepaid credits means no paid job
dispatch/execution. Settlement happens only after valid delivery.

### DEC-008 --- Fixed price tiers

MVP seller pricing uses Kivro-controlled fixed USD tiers with immutable
per-job price snapshots.

### DEC-009 --- Availability is independent from visibility

A capability may remain public/discoverable while scheduled offline.
Humans may schedule future execution; autonomous immediate execution
excludes future-only capabilities unless the buyer explicitly permits
waiting.

### DEC-010 --- Seller retains operational control

Seller can pause all new work and pause/cancel individual running jobs.
Local emergency pause must work without cloud connectivity and survive
restart.

### DEC-011 --- One authoritative I/O contract

The versioned capability I/O contract drives web forms, API validation,
agent mapping, Worker validation, file handling, and orchestration
compatibility.

### DEC-012 --- Versioned immutable publication

Runtime-affecting changes create a new capability version. Historical
jobs remain pinned to immutable snapshots.

### DEC-013 --- Platform inference and seller inference are separate

Kivro pays for Marketplace Agent inference. Seller capability inference
is an explicit seller dependency/cost.

### DEC-014 --- Human UI and autonomous orchestration use the same authoritative availability data

Human UI explains/schedules future availability. Autonomous immediate
mode hard-filters unavailable capabilities and continues searching
alternatives.

### DEC-015 --- UI quality is a product requirement

Kivro must use a restrained, intentional, human-designed visual system
and explicitly avoid stereotypical AI-generated SaaS aesthetics.

## Decision template

``` text
### DEC-NNN — Title
Date:
Status: Proposed | Accepted | Superseded
Context:
Decision:
Consequences:
Master Spec references:
```

Never use this log to override the Master Spec without explicit
user/product-owner approval.

## DEC-LOCAL-001 --- Docker Compose local infrastructure

PostgreSQL, Redis and S3-compatible storage run locally through Docker
Compose; host installs are not required.

## DEC-LOCAL-002 --- Host-native Worker

Kivro Worker runs directly on the developer Mac during integration/E2E
development to exercise the real seller-device boundary.

## DEC-LOCAL-003 --- Real sandbox semantics locally

Development never bypasses sandboxing. Sandbox unavailable means
execution unavailable.

## DEC-LOCAL-004 --- S3-compatible local storage

Use MinIO or equivalent locally through the same storage
abstraction/business flow used for production storage.

## DEC-LOCAL-005 --- Two payment development modes

Use a deterministic fake adapter for fast tests and Stripe test mode for
Stripe acceptance; development shortcuts cannot be enabled in
production.

## DEC-LOCAL-006 --- Distinct buyer and seller identities

Even on one Mac, buyer and seller remain separate Kivro authorization
identities.

## DEC-LOCAL-007 --- Fresh-clone E2E is an engineering acceptance fixture

Maintain a reproducible buyer-to-seller local E2E path including
generated-file delivery and ledger settlement.

## DEC-AUTH-001 --- Kivro supports email/password and Google authentication

Both are MVP authentication methods and resolve to the same Kivro
user/account model.

## DEC-AUTH-002 --- Email ownership is mandatory for first-party accounts

Email/password users must verify their email before sensitive, paid,
seller, payout, or API-key actions.

## DEC-AUTH-003 --- Google login is identity-only

Google login requests only authentication identity scopes. Google Drive
or other Google product permissions are separate integrations with
separate consent.

## DEC-AUTH-004 --- Verified identities converge on one Kivro account

Kivro prevents duplicate accounts across email/password and Google when
identity can be linked safely through authoritative verified
email/provider identity. Account linking must fail closed when identity
cannot be established safely.

## Netsons production decisions

### DEC-NET-001 --- Pro Business baseline

The Netsons variant targets Pro Business because it provides the managed
Node.js, PostgreSQL, Redis, cron and developer-access capabilities
required by this profile.

### DEC-NET-002 --- No arbitrary persistent cloud daemons

Do not depend on manually started persistent daemons. Use only
hosting-managed Node applications plus cron.

### DEC-NET-003 --- PostgreSQL is the durable work queue

Jobs and asynchronous work are durable PostgreSQL state. WebSocket and
Redis are signaling/optimization layers.

### DEC-NET-004 --- No BullMQ production dependency

No persistent BullMQ consumer is required in production. Retries and
maintenance use durable PostgreSQL work plus bounded cron.

### DEC-NET-005 --- Netsons baseline transport is HTTPS polling

The Netsons control plane advertises **HTTPS polling** on the shared
Worker Protocol. The same Worker binary also supports WSS for other
control planes during transitions. PostgreSQL remains authoritative;
transport signals are wake-ups only (see `DEPLOYMENT-NETSONS.md`,
`ARCH-UNI-007`).

### DEC-NET-006 --- Minimize Node app count

Prefer one managed Node application for Web/API/WSS in the MVP unless
real Netsons testing proves another topology useful.

### DEC-NET-007 --- Durable assets use object storage

Use S3-compatible storage for durable buyer/seller assets and
direct/presigned transfers for large files.

### DEC-NET-008 --- Process restart is normal

Every cloud workflow must remain correct across managed Node process
restart.

### DEC-NET-009 --- Real Netsons staging test is mandatory

Documentation compatibility is not final acceptance; the purchased
account must pass the smoke tests and E2E.

## DEC-PORT-001 --- Worker is infrastructure-independent

The public Worker depends on the Kivro Worker Protocol and stable Kivro
discovery, never on Netsons/AWS-specific infrastructure.

## DEC-PORT-002 --- Executions retain origin ownership while draining

An execution remains owned by the control plane that leased it until
terminal state or an explicit tested transfer.

## DEC-PORT-003 --- Dual-backend coexistence is a supported continuity mode

Old backend drains owned work while new backend exclusively receives new
dispatches.

## DEC-PORT-004 --- Infrastructure location is independent from Worker upgrades

Moving Kivro Cloud normally requires neither seller reinstall, re-pair
nor binary update.

## DEC-PORT-005 --- Worker Protocol is transport-independent

Kivro Worker Protocol semantics live above connectivity. Polling and
WebSocket are adapters, not separate Worker implementations.

## DEC-PORT-006 --- Mixed transports may coexist per Worker

A single Worker may concurrently use different transport adapters for
different `controlPlaneId` values while execution ownership keeps
traffic isolated.

## DEC-PORT-007 --- Transport changes never change business semantics

Switching between polling and WebSocket cannot change authorization,
lease ownership, idempotency, payment, settlement, capability
permissions or result semantics.

## DEC-UNI-001 --- One backend core, two deployment profiles

Kivro has one shared TypeScript/Node backend implementation. Netsons and
AWS are deployment/infrastructure profiles, not separate product
backends.

## DEC-UNI-002 --- Business logic cannot live in provider adapters

Provider adapters implement infrastructure ports only.
Domain/application/API/payment/security semantics belong to shared
packages.

## DEC-UNI-003 --- Parity is enforced mechanically

Shared contracts, conformance tests, dependency-boundary checks and CI
gates are the source of parity. Human/coding-agent memory to "update
both" is insufficient.

## DEC-UNI-004 --- One public API and one logical schema

Both profiles expose the same versioned public API and use one logical
PostgreSQL schema/migration history.

## DEC-UNI-005 --- Transport differs, protocol does not

Netsons may use polling and AWS may use WebSocket, but both carry the
same Kivro Worker Protocol semantics.

## DEC-UNI-006 --- Both profiles are first-class from greenfield start

The monorepo contains and tests both deployment profiles from the
beginning even if only one profile is initially operated in production.

## DEC-UNI-007 --- Provider transition is operational

Switching ACTIVE control plane is routing/state transition between
conformant deployments of the same Kivro application, not a
rewrite/migration between independent codebases.

## DEC-HARD-001 --- Architecture rules are executable

Documentation is insufficient to preserve the
shared-core/provider-adapter boundary. CI architecture fitness tests are
mandatory merge gates.

## DEC-HARD-002 --- Behavioral parity is proven with golden scenarios

Netsons and AWS must execute the same provider-neutral golden scenarios.
Provider-specific tests are additive.

## DEC-HARD-003 --- Ambiguous failures must converge

Distributed failure handling is designed around authoritative state,
idempotency and reconciliation. Fault injection must prove final
convergence and exactly-once financial effects.

## DEC-HARD-004 --- Compatibility is explicit and multi-dimensional

Cloud, Worker, protocol, API, schema and manifest versions are tracked
independently with declared compatibility ranges.

## DEC-HARD-005 --- Database rollout uses expand/deploy/contract

Schema changes must tolerate overlapping compatible cloud
releases/control planes and resumable backfills.

## DEC-HARD-006 --- Worker updates are signed and independent from provider switches

Infrastructure routing changes do not force binary updates. Actual
Worker releases use verified signed artifacts and staged/recoverable
rollout practices.

## DEC-HARD-007 --- Backups require restore evidence

Configured backups are not sufficient evidence of disaster recovery;
isolated restore tests and invariant checks are required.

## DEC-HARD-008 --- Releases are unified

Netsons and AWS deploy the same Kivro product release with profile
adapter revisions recorded in one machine-readable release manifest.

## DEC-ASYNC-001 --- Jobs outlive browser sessions

Browser connections are not part of job correctness.

## DEC-ASYNC-002 --- Kivro owns durable buyer delivery

Seller-local success is not buyer completion; Kivro finalizes outputs
before `COMPLETED`.

## DEC-ASYNC-003 --- Binary results use private object storage

PostgreSQL owns identity/state/metadata; private object storage owns
durable binaries.

## DEC-ASYNC-004 --- Retrieval is re-authorized

Download access is short-lived and regenerated only after authorization.

## DEC-ASYNC-005 --- Retention is shared product policy

Both provider adapters implement identical logical retention/cleanup
semantics.

## DEC-ASYNC-006 --- Notifications are advisory

Email/webhook failure never changes an authoritative completed result.

## DEC-BUYERUX-001 --- Buyer predictability is a Core contract

Quote, deadline, cancellation, wait/expiry, progress, results and
privacy semantics belong to shared Kivro Core, not deployment adapters.

## DEC-BUYERUX-002 --- Estimates are evidence-based, not promises by default

Kivro prefers ranges/unknown over false precision and distinguishes
estimates from explicit guarantees.

## DEC-BUYERUX-003 --- No indefinite paid waiting

Every queued/scheduled paid job has bounded waiting/start-expiry
semantics and a deterministic release/refund path.

## DEC-BUYERUX-004 --- Historical jobs are immutable evidence

Input and capability/purchase snapshots explain exactly what was
authorized and executed; reruns create new jobs.

## DEC-BUYERUX-005 --- Seller receives minimum buyer identity

Worker jobs are pseudonymous by default; identity/profile/payment data
is withheld unless explicitly required and disclosed.

## DEC-BUYERUX-006 --- Result UX is semantic

Kivro uses versioned output contracts for named deliverables, previews
and safe bulk download instead of treating every result as opaque files.

## DEC-BUYERUX-007 --- Problem reporting is not implicit escrow

Buyer acknowledgement/problem reporting is durable support evidence;
financial remediation follows explicit audited policy.

## DEC-SELLERUX-001 --- Safe seller complexity is translated, not removed

Kivro keeps strict machine policy while presenting guided human
decisions.

## DEC-SELLERUX-002 --- Discovery is never consent

Local discovery is read-only/suggestion-only; exposure always requires
explicit seller selection.

## DEC-SELLERUX-003 --- AI assists but cannot authorize

AI may draft capability configuration but deterministic policy plus
seller consent controls permissions, secrets, pricing and publication.

## DEC-SELLERUX-004 --- Profit protection is product behavior

Seller-funded provider cost visibility/guardrails are part of safe
selling, not optional analytics.

## DEC-SELLERUX-005 --- Operational health is explainable

Unavailable/auto-paused states expose deterministic reasons and
remediation.

## DEC-SELLERUX-006 --- Published versions and historical jobs remain immutable

Rollback changes eligibility for new jobs only.

## DEC-SELLERUX-007 --- Marketplace identity and KYC identity are separate concerns

Public display identity does not automatically expose private legal
payout identity.

## DEC-SELLERUX-008 --- Seller is not structurally one machine

Core schema/contracts support explicit Worker identity/assignment from
greenfield.

## DEC-M04-001 — IMPLEMENTATION-PLAN §278–§282 are payment scope

**Context:** M04 plan lists Master Spec §278–§282 alongside sandbox sections; in `MASTER-SPEC.md` those sections describe USD price tiers and earnings display (M08 payments).

**Decision:** M04 implementation does not include payment tier logic. `COVERAGE.md` rows for §278–§282 remain `DEFERRED` to M08 with an explicit note.

## DEC-M04-002 — OpenClaw agent exec remains preflight until M06

**Context:** §70 supervision requires spawning OpenClaw child processes; job dispatch and offers land in M06/M07.

**Decision:** M04 delivers policy/sandbox/broker/proxy/supervisor interfaces, Docker spec generation, and preflight execution (`KIVRO_SANDBOX_DRY_RUN`). Full paid execution wiring is not started in M04.

## DEC-M06-001 — Local Research Broker MVP; cloud browser deferred

**Context:** Master Spec §269–§273 targets cloud/platform-controlled research egress; §264 browser rendering is post–search+fetch MVP.

**Decision:** M06 ships `@kivro/research-broker` with `web.search` / `web.fetch`, SSRF validation, budgets, audit, and typed API connectors on the Worker side. Cloud research broker deployment and `browser.readPage` remain deferred with explicit `COVERAGE.md` notes.

## DEC-M00-001 — Manual milestone validation (2026-03-26)

**Context:** Product owner requested milestone-by-milestone delivery with human validation gates.

**Decision:** The repository does not include automated E2E test runners (Playwright, `pnpm test:e2e:local`, etc.) during early milestones. Each milestone ships `docs/milestones/Mxx-manual-validation.md` for user-run checks.

**Impact:** `COVERAGE.md` may cite manual validation paths for scenario-level requirements. Unit/integration tests remain for schemas, invariants, and health endpoints where applicable.

**Spec alignment:** Deviates from Master Spec §80/§90 default CI E2E expectation until explicitly revisited.

## DEC-M07-001 — Minimal seller control UI in API (full UX later)

**Context:** §426–§436 require seller web pause controls; full marketplace seller UX is a later milestone.

**Decision:** M07 ships authenticated `/seller/jobs/control-ui` (running jobs list with Pause/Resume/Cancel) plus JSON APIs and Worker CLI. Polished seller dashboard styling and job detail pages remain for seller UX milestones.

## DEC-M07-002 — Worker device header auth for job protocol (dev/staging)

**Context:** Full device credential signing for Worker job endpoints is specified in §10 but not fully wired in early milestones.

**Decision:** M07 Worker job routes authenticate via `x-worker-device-id` bound to a PAIRED device record. Production hardening adds request signing in a later milestone without changing pause semantics.

## DEC-M08-001 — Dual funding: prepaid credits (default) + per-job card authorization

**Context:** Master Spec §24.4–§24.5 allows credits or direct per-job authorization.

**Decision:** M08 implements canonical USD tiers, prepaid credit ledger (default `paymentMode=credits`), and optional per-job Stripe PaymentIntent with `capture_method=manual` (`paymentMode=card`, §24.5). Settlement uses ledger + Connect transfer; card jobs capture the PaymentIntent at delivery instead of debiting prepaid credits.

## DEC-M08-002 — Dev payment shortcuts mirror auth gating

**Context:** Local development must exercise paid paths without full Stripe Connect for every seller.

**Decision:** `KIVRO_DEV_PAYMENT_SHORTCUTS=true` (non-production only) bypasses Connect readiness for publish and enables `POST /buyer/billing/credits/dev-grant`. Production disables both paths.

## DEC-M08-003 — §298 is pricing principle, not scheduling

**Context:** `COVERAGE.md` briefly mis-tagged §298 as scheduled-job payment; Master Spec §298 defines buyer/seller pricing clarity.

**Decision:** M08 satisfies §298 via canonical tiers, public buyer tier list, seller pricing preview, and `pricingProductPrincipleCopy` tests. Scheduled-job state machine remains M09 (Master Spec §462+).

## DEC-M09-001 — Consolidated scheduled wait states (MVP)

**Context:** Master Spec §463–§464 distinguishes `SCHEDULED`, `WAITING_FOR_AVAILABILITY`, and execution queue wait.

**Decision:** M09 uses durable `JobStatus.SCHEDULED` plus buyer-visible `schedulingPhase` (`SCHEDULED_FUTURE` vs `WAITING_FOR_AVAILABILITY`) instead of additional enum values. Promotion to `QUEUED` requires schedule acceptance and execution-window policy (§408).

## DEC-M09-002 — Immediate submit blocked before payment

**Context:** §406 requires no charge/reserve when immediate execution cannot be accepted.

**Decision:** Credits and card flows call `assertImmediateSubmissionBeforePayment` before job creation (card) or before reserve (credits). Failed queue commit after reserve rolls back to `CANCELLED`/`REFUNDED` or cancels card authorization.

## DEC-M09-003 — Schedule edits without new capability version

**Context:** §410 — schedule is operational, not contract/versioned behavior.

**Decision:** Seller `PUT /seller/capabilities/:id/schedule` updates capability columns and appends `CapabilityScheduleChange` audit rows; published version snapshots remain immutable.

## DEC-M10-001 — Next.js marketplace shell (M10 bootstrap)

**Context:** Master Spec §122–§125 requires a real buyer marketplace, not only API URLs.

**Decision:** M10 introduces `@kivro/marketplace` (search/sort DTOs), `/marketplace/capabilities` API, and `apps/web` Next.js App Router pages (Discover, Search, detail, run, My jobs, login, favorites, seller profile, job detail). Full Marketplace Agent conversational UX remains M11; M10 ships API + `/agent` shell.

## DEC-M10-002 — Capability reviews on completed jobs (§128)

**Context:** Buyers may rate capabilities after successful completion; aggregates drive marketplace sort/trust.

**Decision:** `CapabilityReview` is 1:1 with `Job`, upsert on repeat submit; `Capability.rating` / `reviewCount` recomputed on write. Self-review blocked; only `COMPLETED` jobs. Public list via `GET /capabilities/:slug/reviews`; submit via `POST /buyer/jobs/:jobId/review`.

## DEC-M10-003 — Orchestration scope boundary (§136–§142)

**Context:** M10 plan lists §136–§142; Master Spec §159 classifies multi-job autonomous orchestration as a strong MVP extension beyond classic marketplace + assisted agent discovery.

**Decision:** M10 delivers assisted discovery (Mode A / §131–§135) with deterministic constraint enforcement and typed marketplace search. Orchestration plans, DAG execution, cross-job asset mapping, budget reservation, and quote expiry (§136–§142) are **deferred to M11** with explicit `DEFERRED` coverage rows until orchestration engine lands.

## DEC-EMAIL-001 — Brevo transactional templates (M02 UI completion)

**Context:** Master Spec §575 requires verification email delivery; local dev may expose tokens only when Brevo is not configured.

**Decision:** `@kivro/email` sends Brevo template mail using `BREVO_*` env vars. Verification links target `GET /auth/verify-email?token=` on the public API (redirect to web). Dev `verificationToken` in API responses is enabled only when `KIVRO_DEV_AUTH_SHORTCUTS=true` and Brevo is not fully configured.

## DEC-M11-001 — Orchestration planner deterministic MVP (§136–§142)

**Context:** Strong MVP extension requires structured plans, DAG, and purchase authorization without LLM-controlled payments.

**Decision:** `@kivro/marketplace-agent` builds competitor-research DAG plans from live listings and hard constraints; plans persist in PostgreSQL; `authorizePlanApproval` gates approval; job launch uses existing `submitPaidJob`. M11 hardening adds cross-job draft mapping, step advancement on job completion, orchestration budget hold in credit balance, tool HTTP surface (§149), optional OpenAI intent parsing, and re-quote at approval. Canonical staging scenario §160 and Mode C delegated budget remain follow-up.

## DEC-M12-001 — Seller health dashboard MVP (§369–§393 subset)

**Context:** M12 maps 218 requirements across Worker health, metrics, security warnings, and emergency controls; much of §369–§372 was partially covered by M02 `doctor`/`scan`.

**Decision:** M12 adds `@kivro/seller-health` (deterministic warnings, job metrics, heartbeat ingestion), seller web `/seller/dashboard`, `POST /worker/heartbeat`, web emergency pause with capability manual pause + `SellerProfile.marketplaceEmergencyPause`, and Worker CLI `health` / `pause --all` / `resume --all` with persisted local pause in `@kivro/worker-store`. Acceptance gates via `pnpm verify:m12`. Rich capability-level dependency health, full health-history retention policy, and signed Worker request auth remain follow-up.

## DEC-M12-002 — M12 hardening pass (pause propagation + dashboard depth)

**Context:** Initial M12 MVP left `summarizeMarketplaceAvailability` without emergency/security gates; cloud/local pause races and §376–§392 rows were largely open.

**Decision:** Hardening wires `evaluateCapabilityAvailability` into marketplace/agent availability, adds cloud↔local pause sync (`marketplaceControl`, `GLOBAL_MARKETPLACE_PAUSE`, Worker local store sync), capability-level dashboard health + per-capability pause, resume blocked on critical security warnings, bounded health-event retention, orchestration planner excludes non-accepting capabilities. **§393 signed Worker auth** remains with DEC-M07-002 follow-up (not M13+ product scope).

## DEC-M12-003 — Platform security pause (§393)

**Context:** Master Spec §393 requires automatic PLATFORM_SECURITY pause that sellers cannot clear with a simple resume while the blocking condition persists.

**Decision:** `SellerProfile.platformSecurityPause*` is set from critical Worker telemetry via heartbeat (`activatePlatformSecurityPause`), clears automatically when telemetry recovers (`tryClearPlatformSecurityPause`). Emergency/capability resume returns `409 PLATFORM_SECURITY_PAUSE`. Worker request signing remains DEC-M07-002 follow-up.

## DEC-M13-001 — Buyer REST API v1 MVP (§330–§354 bounded)

**Context:** M13 maps 66 requirements for programmatic buyer access, API keys, idempotency, rate limits, and outbound webhooks.

**Decision:** Shared packages `@kivro/buyer-api` and `@kivro/buyer-webhooks` implement key lifecycle, Bearer auth middleware, `Idempotency-Key` on job create, per-key rate limiting, SSRF-safe webhook registration, AES-GCM secret storage, and HMAC-signed delivery with bounded retries. Session-authenticated management lives at `/buyer/api-keys` and `/buyer/webhooks`; public v1 surface at `/v1/*`. `job.completed` is emitted from Worker completion handler. Buyer-facing **UI for keys/webhooks (§349)**, v1 **asset upload intents**, and **`job.started` / `job.failed`** events are deferred to M14+ with documented closure in `docs/milestones/M13-closure.md`. Gate: `pnpm verify:m13`.

## DEC-M13-002 — M13 hardening (§319–§328 completion)

**Context:** Initial M13 MVP left §319–§328 coverage rows open, single webhook event, coarse rate limits, and minimal v1 job responses.

**Decision:** Hardening adds API key audit + custom scopes/expiry, PostgreSQL rate buckets with `X-RateLimit-*` headers, v1 asset upload intents, §323 response shape + `INSUFFICIENT_FUNDS`, OpenAPI stub, job list pagination + v1 cancel, full §328 lifecycle webhooks, webhook delivery history/rotate/retry sweep (`m13_hardening` migration). **§349 buyer settings UI** remains explicitly **M14**. Gate unchanged: `pnpm verify:m13`.

## DEC-M14-001 — UI design system & product polish (§517–§550)

**Context:** M14 maps 96 requirements for typography, status language, marketplace/job/seller UI quality, developer settings, and accessibility.

**Decision:** Document tokens in `docs/design-system.md`; implement shared web components and `status-ui.ts`; ship buyer developer settings (API keys + webhooks); apply `StatusBadge` / `EmptyState` / `PageHeader` across capability, job, and seller dashboard routes. Automated visual regression remains manual checklist until M15+ tooling. Gate: `pnpm verify:m14`.

## DEC-M15-001 — Observability, abuse, privacy & operations (§29–§38, §84–§95)

**Context:** M15 closes deterministic abuse controls, cloud metrics, failure sweeps, privacy/legal surfaces, and native plugin import policy without LLM moderation.

**Decision:** `@kivro/abuse-controls` gates job submit (denylist, hourly job frequency only — no account spend cap); `@kivro/job-failure` sweeps stale executing jobs when workers go offline (no resume); `@kivro/observability` exposes admin metrics snapshots and audit sanitization; admin routes manage denylist/reports/suspend/sweep; buyers file abuse reports; capability versions store seller-declared `externalProcessors`; discovery blocks native plugins (§33). Legal alpha pages and `docs/TESTING-STRATEGY.md` satisfy §34/§38 planning evidence. ML anomaly detection and automated red-team CI remain deferred. Gate: `pnpm verify:m15`.

## DEC-M15-002 — M15 full perimeter hardening

**Context:** Bounded M15 gate left UI/ops gaps (manual sweeps, no terms gate, thin §29/§31 evidence).

**Decision:** Add buyer/seller-facing report UI, marketplace terms acceptance on paid submit, auto-pause after report threshold, user suspend + report resolve admin APIs, worker fleet metrics, lost-worker sweep wired into `POST /platform/admin/jobs/promote-scheduled`, `buildJobAuditSummary` on job detail, `job-io` result-safety helpers, red-team checklist doc, and extended verify tests (including optional DB triage test). ML anomaly and external pen test execution remain post-MVP. Gate unchanged: `pnpm verify:m15`.

## DEC-M16-001 — Testing, fixtures & release gates (§39–§46)

**Context:** M16 maps 51 requirements spanning roadmap docs, API sketch parity, fixture catalog, experiments traceability, MVP/product checklists, and CI release gates.

**Decision:** Ship fixture catalog (Document Analyzer + synthetic DB), machine-verified §88–§89 traces, §91 automated security gate map, §34.2 integration matrix verifiers, repo-structure §40 check, code-quality §94 check, expanded `acceptance-m16` / `e2e-fixtures-m16`, and composed `pnpm test:e2e:local` → `verify:m16`. Full §573 paid two-user Docker + OpenClaw E2E automation remains **M18** per IMPLEMENTATION-PLAN. Gate: `pnpm verify:m16`.

## DEC-M17-001 — First full-spec compliance audit (§1–§550+ traceability)

**Context:** M17 maps all 1672 requirements. The product is mid-greenfield (M16 complete); most remaining work is scheduled in M18–M34.

**Decision:** Deliver automated audit (`audit-m17-compliance.mjs`), section→milestone index, schedule notes on every open COVERAGE row, M00–M16 closure check (no TODO in sections owned by completed milestones), evidence path validation for TESTED rows, and published audit reports. M17 does **not** claim full MASTER-SPEC implementation; terminal proof remains M23/M28. Gate: `pnpm verify:m17`.

## DEC-M23-001 — Unified compliance audit harness (M00–M22 closure + readiness)

**Context:** IMPLEMENTATION-PLAN M23 requires an independent audit against the full Master Spec; M28 is the terminal lossless gate. M22 completes dual control-plane switch readiness.

**Decision:** Extract shared `compliance-audit-core.mjs`; add `audit-m23-unified.mjs` with M00–M22 section closure, evidence validation, unified-backend readiness checklist, and M23 audit reports. Staging paid E2E and dual-CP transition E2E remain optional (env-gated) until M28. Gate: `pnpm verify:m23` (includes `verify:m22`).

## DEC-M24-001 — Architecture fitness & golden conformance (M24)

**Context:** IMPLEMENTATION-PLAN M24 requires dependency fitness, duplicate-semantic guard, golden registry, drift canary, and generated provider parity evidence.

**Decision:** Ship `check-duplicate-semantic-ownership.mjs`, golden registry v2 with `verify-golden-registry.mjs`, `createBrokenCompositionDriftProbe`, `generate-provider-parity-report.mjs`, and `pnpm verify:m24` (includes `verify:m23`). HARD-005/006 fault matrix completes in M26 (`pnpm verify:m26`). Gate: `pnpm verify:m24`.

## DEC-M26-001 — M26 fault injection asserts convergence not transport alone

**Decision:** M26 is **DONE** when `M26-exit-criteria.json` reports `m26HarnessComplete: true` after `verify:m26`. Fault scenarios must assert authoritative job/ledger/payment convergence (HARD-006); Redis remains non-authoritative (HARD-016). Gate: `pnpm verify:m26` (includes `verify:m25`).

## DEC-M26-002 — Stripe webhooks claim before side effects

**Decision:** `handleStripeWebhookEvent` inserts `StripeWebhookEvent` with `createMany({ skipDuplicates: true })` before any handler side effect and deletes the row if processing throws, so concurrent duplicate deliveries cannot double-apply credits or job payment transitions.

## DEC-M27-001 — M27 release activation is exact, bounded, and profile-neutral

**Decision:** M27 is **DONE** when `M27-exit-criteria.json` reports `m27HarnessComplete: true` after `verify:m27`. The unified release manifest carries `exactReleaseId`; activation requires parity assertion, both-profile conformance, M26 DR harness completion, and envelope/load evidence via `@kivro/release-ops`. Gate: `pnpm verify:m27` (includes `verify:m26`).

## DEC-M27-002 — Runtime retry/batch knobs stay within the envelope

**Decision:** `DURABLE_WORK_MAX_ATTEMPTS` and `DURABLE_WORK_DEFAULT_BATCH_LIMIT` in `@kivro/cloud-core` are the authoritative shared caps for durable work; `check-bounded-runtime-vs-envelope.mjs` fails if they exceed `M27-performance-envelope.json`.

## DEC-M27-003 — Product upload/webhook caps align with envelope

**Decision:** `DEFAULT_MAX_FILE_SIZE_BYTES_PER_JOB`, `BUYER_WEBHOOK_MAX_TOTAL_ATTEMPTS`, and polling retry policy must stay within `M27-performance-envelope.json`; `check-envelope-product-limits.mjs` enforces alignment at `verify:m27`. Release activation also requires M25+M26 harness completion and matching `apiContractVersion` across manifest, parity, and conformance evidence.

## DEC-M28-001 — M28 terminal audit vs product completion

**Decision:** M28 is **DONE** when `M28-exit-criteria.json` reports `m28HarnessComplete: true` after `verify:m28` (includes `verify:m27`). That executes the lossless audit machinery: M00–M27 closed-section traceability, expanded P0 TESTED sampling, HARD M24–M27 family checks, and mandatory golden/fault/release/conformance runs. **`productMasterSpecComplete` is true only when P0/P1/P2 TODO counts are all zero** (expected false until M29+). Gate: `pnpm verify:m28`.

## DEC-M29-001 — Cloud finalization barrier before COMPLETED

**Decision:** Worker `complete` must include deliverables; shared `runCloudFinalizationBarrier` validates contract shape and confirmed `JOB_DELIVERABLE` assets before `COMPLETED` and settlement. Invalid outputs transition to `RESULT_REJECTED`. Retention expiry and cleanup run via shared maintenance sweeps on both profiles. Gate: `pnpm verify:m29` (includes `verify:m28`).

## DEC-M30-001 — Shared buyer experience Core before UI

**Decision:** Buyer preflight, execution quote, deadline feasibility, ETA/progress honesty, legal actions, reliability aggregation, privacy disclosure, minimized worker payload, and dashboard summaries live in `@kivro/buyer-experience` and `@kivro/marketplace` read models — not provider adapters or UI-only logic. Purchase must revalidate `BuyerExecutionQuote` when `executionQuoteId` is supplied. Gate: `pnpm verify:m30` (includes `verify:m29`).

## DEC-M32-001 --- Seller onboarding and publication are Core semantics

**Decision:** Guided seller onboarding, publish readiness, draft buyer preview, effective permission summaries, semantic version diff, local credential storage, sanitized doctor output, marketplace/KYC identity separation, and first-publication guidance live in `@kivro/seller-experience` with seller API + web flows. AI/discovery drafts are advisory only. Gate: `pnpm verify:m32` (includes `verify:m31`).

## DEC-M31-001 --- Buyer history and results are Core semantics

**Decision:** Run again / duplicate, semantic result rendering, safe previews, download-all bundling, immutable input/purchase snapshots, retention UX, and acknowledgement/problem reporting are implemented in shared packages (`@kivro/buyer-experience`, `@kivro/job-delivery`, `@kivro/marketplace`) with session + v1 download parity where applicable. Gate: `pnpm verify:m31` (includes `verify:m30`).

## DEC-M30-002 — Orchestration and v1 honor hard deadlines

**Decision:** Marketplace agent plan approval calls `authorizePlanApproval` with per-step `estimatedDuration` and rejects `DEADLINE_INFEASIBLE` when `BuyerConstraints.hardDeliveryDeadlineAt` cannot fit the plan. REST v1 exposes the same preflight/quote/create semantics as session checkout. Gate: `verify-m30-evidence.mjs`.

## DEC-M29-002 — Bounded integrity sampling on maintenance ticks

**Decision:** Both deployment profiles invoke `runCloudMaintenanceSweeps`, which runs retention purge, terminal email retries, and a bounded `sampleCompletedJobIntegrity` pass (ASYNC-028 observability). Local/dev Worker synthetic completion must include `structuredOutput` deliverables so paid-path tests exercise the same barrier as production. Gate: `verify-m29-async-evidence.mjs` + `dual-profile-maintenance` exit criterion.

## DEC-M28-002 — Terminal audit includes portability families and open catalog

**Decision:** M28 family audit requires ARCH-UNI/PORT/HOST-NET **P0** rows to be TESTED (M00–M27 scope) and every open family P0/P1 row to carry an explicit schedule note. `M28-open-requirements-catalog.json` documents remaining catalog work; successful M28 run updates M23 `terminal-lossless-audit` to `EXECUTED_M28`.

## DEC-M25-002 — Production may require Worker protocol headers

**Decision:** When `KIVRO_REQUIRE_WORKER_PROTOCOL_HEADER=1`, poll/heartbeat fail closed without `x-kivro-protocol-version` or body `protocolVersion`. Default off in development; operators enable for strict release gates.

## DEC-M25-001 — M25 compatibility matrix is authoritative in `@kivro/compatibility`

**Decision:** `packages/compatibility/matrix.json` is the single authoritative HARD-007 matrix; `tests/fixtures/compatibility-matrix.json` mirrors it for golden tests. Cloud handshake, Worker policy, release manifest, and schema rollout registry derive from this package. Gate: `pnpm verify:m25` (includes `verify:m24`).

## DEC-M24-002 — M24 exit criteria vs deferred HARD-004/005

**Decision:** M24 is **DONE** when `M24-exit-criteria.json` reports `m24HarnessComplete: true` after `verify:m24`. HARD-004 full paid success/fail golden E2E and HARD-005 fault matrix are explicitly **DEFERRED** (M29+ / M26) while M24-GOLD-005 seeds payment idempotency tests and drift canaries prove divergence rejection.

## DEC-M23-002 — M23 milestone done vs Master Spec literal completion

**Context:** IMPLEMENTATION-PLAN M23 lists “all P0/P1/P2 complete” and full staging E2E; M28 is the superseding terminal lossless audit.

**Decision:** **M23 is DONE in-repo** when `pnpm verify:m23` passes and `docs/audits/M23-exit-criteria.json` has `m23HarnessComplete: true`. That includes COVERAGE traceability, evidence sampling, mandatory architecture/API/schema runs, HARD-018 security release test bundle, and `verify:m22` regression. **`productMasterSpecComplete` remains false** until M28 (open P0/P1/P2 counts documented in exit criteria). Staging paid E2E is env-gated, not CI-blocking.

## DEC-M18-001 — Local development environment & local E2E (§551–§573)

**Context:** M18 maps `DEV-LOCAL-001`–`029`: Compose infra, dev scripts, fake payment adapter, health/readiness, local paid path, and §573 checklist evidence.

**Decision:** Ship Redis+MinIO+Postgres compose, `dev:setup`/`dev:demo`/`worker:dev`, deterministic seed, fake payment adapter with production fail-closed guards, `run-local-e2e.mjs` + failure matrix acceptance tests, and `pnpm verify:m18` (includes `verify:m17`). Automated CI path uses **synthetic** worker completion when API is not running; full OpenClaw + `KIVRO_SANDBOX_DRY_RUN=false` remains manual sign-off (`M18-manual-validation.md`). Gate: `pnpm verify:m18`; `pnpm test:e2e:local` adds optional live HTTP E2E.

## DEC-VIS-001 — Visibility is separate from runtime status

**Context:** Master Spec §§312–318 require DRAFT, PRIVATE, UNLISTED, and PUBLIC as a discovery/access state, distinct from DRAFT/PUBLISHED/PAUSED/ARCHIVED runtime status. §§357–358 require up to three published input/output examples. §490 requires human search filters for available now, today, and schedulable.

**Decision:** `Capability.visibility` defaults to PUBLIC so existing published rows stay listed. New drafts are created as DRAFT visibility and become PUBLIC on publish unless the seller already chose PRIVATE or UNLISTED. Search, seller profiles, and Marketplace Agent recommendations include only PUBLIC capabilities. UNLISTED capabilities open by slug for anyone. PRIVATE capabilities require an explicit account grant. Published examples are seller-authored records, at most three published per capability. Historical jobs are not deleted when visibility changes.

## DEC-AGT-001 — Agent timing, archives, and task models

**Decision:** Marketplace Agent ranking defaults to IMMEDIATE when availability is known: only ONLINE and accepting capabilities are eligible. DEADLINE mode may include a future window only when start plus estimated duration finishes by the buyer's deadline. Ranked rows carry a structured timing snapshot; the model cannot override the filter. Archive MIME types and extensions are rejected because no safe extraction path exists. Inference model names come from provider or per-task environment variables (`KIVRO_PLATFORM_AI_MODEL_INTENT`, `RECOMMENDATION`, `ORCHESTRATION`). Sellers may store up to ten named test cases per capability; storing a case does not execute a job.

## DEC-AGT-002 — Agent boundaries, file ceilings, and card windows

**Decision:** Orchestration plans keep a step only when upstream outputs can feed it through an explicit transform (text to markdown, JSON to text, or combined text). PDF and other file conversions are not invented. Model JSON is rejected when it carries a purchase instruction or tries to raise the buyer's budget or lower the rating floor. Marketplace tools run only from a fixed allowlist. Discovery documents sent toward a model contain public listing fields and at most eight candidates. The platform agent does not inspect buyer files. Inference logs omit prompts unless `KIVRO_PLATFORM_AI_DEBUG=true`, and that mode redacts secrets. A seller file limit cannot exceed `KIVRO_PLATFORM_MAX_FILE_BYTES` (default 2 GiB). Card authorization is refused when the scheduled run is more than seven days out; the buyer must use prepaid credits. Cross-job files are passed as a single READ grant for one asset and one target job.

## DEC-SCH-001 — Immediate runs and scheduled reservations stay distinct

**Decision:** `IMMEDIATE_ONLY` fails before payment when the capability is not accepting. `EARLIEST_AVAILABLE` reserves a job for the authoritative next window. Buyer inputs cannot change schedule, pause, or concurrency. Public availability shows the next window, not the seller's weekly timetable. A future purchase is labeled "Schedule for earliest availability" and the buyer is told the job is reserved now and starts later. Scheduled delivery is measured from the scheduled run, not the reservation. The agent skips an unavailable candidate and will not spend more or drop a permission to buy something available now. A new required input, or an optional output that becomes required, is a breaking contract change.

## DEC-SCH-013 — Platform inference goes through one provider interface

**Decision:** OpenAI and Anthropic implement the same provider interface: generate, health check, and cost estimate. Cost stays unknown until a real rate exists. A request names the task, messages, optional tools, and optional response schema. It does not name the vendor. The router selects the configured provider, stops at the per-user budget, and falls back to the local parser.

## DEC-SCH-012 — Inference tasks, storage, and research placement stay measurable

**Decision:** Intent, discovery, recommendation, orchestration, and synthesis each take a model from configuration. A task pointed at a provider that is not configured is unhealthy. Admin health still omits keys. Storage telemetry records input bytes, output bytes, retention, and egress, and does not change the buyer price. A valid file does not prove the work is good. Quality stays with seller tests, reviews, ratings, and refunds. The research broker runs locally. That seller-originated path is not the final public-egress design.

## DEC-SCH-011 — Supply, contracts, and schedules stay explicit

**Decision:** A capability is primary supply when it offers data, a tool, or a record the buyer does not have. A better prompt alone is a recommendation, not a publish block. The domain stays Capability, Job, and Worker. A listing has one category and at most five tags, and the agent ranks the description. An old job shows the input and output contract stored on that job. Markdown can feed text. A file can feed another file only when MIME, extension, count, size, and semantic role fit. A buyer can reuse an asset they own. The seller schedule covers weekdays, weekends, overnight windows, and daylight saving time. A pause, a closed window, and a security hold override an open schedule. A running job continues. A queued job does not start outside the window. The buyer cannot change the schedule.

## DEC-SCH-010 — The first product and the agent stay behind shared boundaries

**Decision:** The first product allows OpenClaw sellers, read-only discovery, and an outbound worker. It does not include GPU rental, auctions, automatic negotiation, other agent frameworks, or unrestricted shell. The Marketplace Agent calls a shared inference request. OpenAI and Anthropic URLs stay inside their adapters. A request names the task, not the vendor. An optional contract field can be left empty.

## DEC-SCH-009 — MVP boundaries stay visible and secrets stay server-side

**Decision:** The README states the one-sentence MVP and the core architecture principles. The seller preview lists what a worker can do, including a selected read-only credential, and what it cannot do, including the personal workspace and documents. Publish stays closed while a required check fails. The Marketplace Agent may discover, recommend, and execute a plan only after approval. It may not negotiate, create capabilities, or buy without a ceiling. Platform AI keys are readable only by the server. Production receives them by host secret injection. `.env.example` does not assign those values. A capability gets no network, public web research, or a declared API, and never arbitrary control of the seller network. Stages after the MVP stay deferred.

## DEC-SCH-008 — Discovery, dependencies, and seller control stay explicit

**Decision:** The agent index stores public name, description, category, tags, inputs, outputs, examples, strengths, and limitations in PostgreSQL. Private instructions and secrets are not indexed, and there is no separate search cluster. A failed seller dependency changes only capabilities that declare it. A provider failure cannot create a purchase. Platform inference does not perform the paid job. A schedule edit records seller, capability, old and new schedule, timezone, and source. The seller can stop accepting work on the machine and from the web dashboard even when the cloud is unreachable. A future orchestration step waits only with an explicit deadline.

## DEC-SCH-007 — Public pages show the service, not the machine

**Decision:** The public seller page shows display name, member since, rating from completed-job reviews, completed jobs, published capabilities, and verification. It omits legal name, payout account, local address, and runtime paths. Weekly hours stay off the buyer view unless the seller publishes service hours. Listing cards show the input and output contract. A text description cannot make a capability accept a file it does not declare. The published job price stays fixed. A future reservation is ordered by creation time, disclosed before payment, and measured from the execution window.

## DEC-SCH-006 — Schedule history, hard constraints, and plan repair

**Decision:** When a seller schedule change moves a reserved job, the new eligible time is stored for execution and the previous time is kept on an audit event. The buyer sees an in-app notice for that change, for reservation, start, completion, and expiry. A minute tick does not send a notice. A later capability is described as not available now, with runtime counted after it becomes eligible. One unavailable parallel branch is replaced on its own. A step that is no longer available is not purchased from the old plan. A service that needs the internet is rejected when the buyer forbade internet, even if it can run immediately.

## DEC-SCH-005 — Humans compare later services; agents buy what can run now

**Decision:** Marketplace search keeps a scheduled capability visible in an "Available later" group. A recommendation question may include that capability and label its timing. An execution request excludes it unless the buyer explicitly allowed a wait. A proposed plan shows price, availability, and runtime before approval. Availability wait and expected runtime are separate sentences. If the eligible window moves by more than fifteen minutes after a quote, the purchase stops for a new confirmation. The seller preview shows the buyer form and a disabled run action. Running that preview on the seller's Worker is still a separate step.

## DEC-SCH-004 — Checkout uses a server schedule quote

**Decision:** Before payment the server returns earliest eligibility, a delivery range rounded to minutes, and a three-minute quote expiry. The label is "Eligible to start from", and `guaranteedStart` stays false. Buyer clocks use the buyer's timezone. Cards and the detail action distinguish run now, join queue, schedule, and unavailable. A paused, blocked, or unexpectedly offline capability is unavailable even if an old next window is stored. Autonomous execution stays immediate unless the buyer explicitly allows a wait. A queue of about five minutes can count as immediate; an hours-long wait cannot. When a window closes, running work continues, queued work waits for the next window inside the buyer's deadline, and work past that deadline expires. Scheduled and expired jobs emit their own webhook events.

## DEC-PUB-001 — Buyer capability detail is a public projection

**Decision:** The buyer capability endpoint returns schemas, price, rating, and schedule fields. It omits the worker manifest and the seller account id. Historical jobs keep their own snapshots.

## DEC-SCH-003 — Scheduled demand and inference usage stay auditable

**Decision:** A seller pause still takes effect when jobs are already scheduled, and the response names how many are waiting and that buyers may be refunded if the wait expires. Reserved buyer value is summed by availability hour and is never added to settled revenue. Marketplace Agent calls write a usage audit with provider, model, token counts, and latency. The buyer prompt is not stored. Estimated platform cost stays empty until a provider rate is configured, so the dashboard does not invent a dollar amount.

## DEC-SCH-002 — Waits are bounded and files stay out of the API body

**Decision:** A scheduled reservation that passes its wait deadline expires and the reserved credits are released. They are not settled as seller revenue. Buyer-facing start times are rounded to minutes. Autonomous execution stays immediate unless the buyer explicitly approves a wait that still finishes by the deadline. A text-only capability is excluded when the request needs a file, even if its description matches. Uploads above 1 MiB use object storage, and uploads above 8 MiB use multipart. A platform security pause cannot be cleared by the buyer or the seller.
