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

## DEC-M18-001 — Local development environment & local E2E (§551–§573)

**Context:** M18 maps `DEV-LOCAL-001`–`029`: Compose infra, dev scripts, fake payment adapter, health/readiness, local paid path, and §573 checklist evidence.

**Decision:** Ship Redis+MinIO+Postgres compose, `dev:setup`/`dev:demo`/`worker:dev`, deterministic seed, fake payment adapter with production fail-closed guards, `run-local-e2e.mjs` + failure matrix acceptance tests, and `pnpm verify:m18` (includes `verify:m17`). Automated CI path uses **synthetic** worker completion when API is not running; full OpenClaw + `KIVRO_SANDBOX_DRY_RUN=false` remains manual sign-off (`M18-manual-validation.md`). Gate: `pnpm verify:m18`; `pnpm test:e2e:local` adds optional live HTTP E2E.
