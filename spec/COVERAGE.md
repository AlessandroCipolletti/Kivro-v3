# Kivro Implementation Coverage

> Living evidence matrix. Codex must update this file while
> implementing. Do not trust this file during final audit: verify every
> claim against code/tests.

## Status vocabulary

`TODO` · `IN_PROGRESS` · `IMPLEMENTED` · `TESTED` · `BLOCKED` ·
`DEFERRED`

`DEFERRED` is valid only when the Master Spec explicitly places the
feature post-MVP or the user explicitly approves the deferral.

  --------------------------------------------------------------------------------
  Requirement   Priority   Source   Status   Implementation   Test       Notes
                                             evidence         evidence   
  ------------- ---------- -------- -------- ---------------- ---------- ---------
  `PRD-0001`    P1         §1       `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0002`    P2         §1       `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0003`    P2         §1       `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0004`    P2         §1       `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0005`    P2         §1       `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0006`    P2         §1       `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0007`    P2         §1       `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `WRK-0001`    P1         §2       `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `WRK-0002`    P1         §2       `TESTED`   packages/platform-policy/src/supply-thesis.ts  supply-thesis.test.ts  a private read-only database is a reason to pay

  `WRK-0003`    P1         §2       `TESTED`   packages/platform-policy/src/supply-thesis.ts  supply-thesis.test.ts  missing buyer data is a reason to pay

  `WRK-0004`    P1         §2       `TESTED`   packages/platform-policy/src/supply-thesis.ts  supply-thesis.test.ts  a missing tool or local software is a reason to pay

  `WRK-0005`    P1         §2       `TESTED`   packages/seller-experience/src/publish-readiness.ts  publish-readiness.test.ts  a better prompt alone is weak supply

  `WRK-0006`    P1         §2       `TESTED`   packages/platform-policy/src/supply-thesis.ts  supply-thesis.test.ts  prompt-only supply is not the primary target

  `WRK-0007`    P1         §2       `TESTED`   packages/platform-policy/src/supply-thesis.ts  supply-thesis.test.ts  OpenClaw is the first runtime, not a new agent framework

  `WRK-0008`    P1         §2       `TESTED`   packages/platform-policy/src/supply-thesis.ts  supply-thesis.test.ts  the database is not modeled as OpenClaw entities

  `WRK-0009`    P1         §2       `TESTED`   packages/platform-policy/src/supply-thesis.ts  supply-thesis.test.ts  the domain is Worker, Capability, and Job

  `PRD-0008`    P1         §3       `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0009`    P2         §3       `TESTED`   packages/platform-policy/src/mvp-boundaries.ts  mvp-boundaries.test.ts  first sellers are OpenClaw sellers

  `PRD-0010`    P2         §3       `TESTED`   packages/platform-policy/src/mvp-boundaries.ts  mvp-boundaries.test.ts  discovery of an existing OpenClaw configuration is read-only

  `PRD-0011`    P2         §3       `TESTED`   packages/platform-policy/src/mvp-boundaries.ts  mvp-boundaries.test.ts  the worker connection is outbound only

  `PRD-0012`    P2         §3       `TESTED`   packages/platform-policy/src/mvp-boundaries.ts  mvp-boundaries.test.ts  GPU rental, auctions, and other frameworks stay out of the first product

  `PRD-0013`    P1         §4      `TESTED`   packages/domain, prisma User/SellerProfile vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0014`    P2         §4      `TESTED`   packages/domain, prisma User/SellerProfile vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0015`    P2         §4      `TESTED`   packages/domain, prisma User/SellerProfile vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0016`    P1         §5      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `PRD-0017`    P2         §5      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `PRD-0018`    P2         §5      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `PRD-0019`    P2         §5      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `PRD-0020`    P2         §5      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `PRD-0021`    P2         §5      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0010`    P1         §6      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0011`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0012`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0013`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0014`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0015`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0016`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0017`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0018`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0019`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0020`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0021`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0022`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0023`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0024`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0025`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0026`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0027`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0028`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0029`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0030`    P1         §7      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `PRD-0022`    P1         §8      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0023`    P2         §8      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0024`    P2         §8      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0025`    P2         §8      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0026`    P2         §8      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0027`    P2         §8      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0028`    P2         §8      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0029`    P2         §8      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0030`    P2         §8      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `JOB-0001`    P1         §9      `TESTED`   packages/domain/job-status.ts vitest; docs/milestones/M01-manual-validation.md M01

  `JOB-0002`    P1         §9      `TESTED`   packages/domain/job-status.ts vitest; docs/milestones/M01-manual-validation.md M01

  `JOB-0003`    P1         §9      `TESTED`   packages/domain/job-status.ts vitest; docs/milestones/M01-manual-validation.md M01

  `JOB-0004`    P1         §9      `TESTED`   packages/domain/job-status.ts vitest; docs/milestones/M01-manual-validation.md M01

  `WRK-0031`    P1         §10      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0032`    P1         §10      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0033`    P1         §10      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0034`    P1         §10      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0035`    P1         §10      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0005`    P1         §11      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0006`    P1         §11      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0007`    P1         §11      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0001`    P1         §12      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0002`    P1         §12      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0003`    P1         §12      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0004`    P1         §12      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0005`    P1         §12      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0006`    P1         §12      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0001`    P1         §13      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0002`    P0         §13      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0003`    P0         §13      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0004`    P0         §13      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0005`    P0         §13      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0006`    P0         §13      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0007`    P0         §13      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0008`    P0         §13      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0009`    P1         §14      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0010`    P0         §14      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0011`    P0         §14      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0012`    P0         §14      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0013`    P0         §14      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0014`    P0         §14      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0015`    P0         §14      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0036`    P1         §15      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0037`    P1         §15      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0038`    P1         §15      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0039`    P1         §15      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0040`    P1         §15      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0041`    P1         §15      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0042`    P1         §15      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0016`    P1         §16      `TESTED`   packages/policy-engine, packages/sandbox   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `SEC-0017`    P0         §16      `TESTED`   packages/sandbox, packages/openclaw-adapter   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `SEC-0018`    P0         §16      `TESTED`   packages/sandbox/src/baseline.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `SEC-0019`    P0         §16      `TESTED`   packages/policy-engine, packages/sandbox   vitest   docs/milestones/M04-manual-validation.md M04

  `SEC-0020`    P0         §16      `TESTED`   packages/policy-engine/src/network.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `SEC-0021`    P0         §16      `TESTED`   packages/policy-engine, packages/openclaw-adapter   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `SEC-0022`    P1         §17      `TESTED`   packages/policy-engine/src/browser.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `SEC-0023`    P0         §17      `TESTED`   packages/policy-engine, packages/sandbox   vitest   docs/milestones/M04-manual-validation.md M04

  `SEC-0024`    P0         §17      `DEFERRED`   ---              ---        post-MVP cloud browser architecture (Master Spec §17)

  `SEC-0025`    P0         §17      `DEFERRED`   ---              ---        post-MVP cloud browser controls (Master Spec §17)

  `PRD-0031`    P1         §18      `TESTED`   security/THREAT_MODEL.md, security/tests   vitest   docs/milestones/M04-manual-validation.md M04

  `PRD-0032`    P2         §18      `TESTED`   security/THREAT_MODEL.md, security/tests   vitest   docs/milestones/M04-manual-validation.md M04

  `PRD-0033`    P2         §18      `TESTED`   security/THREAT_MODEL.md, security/tests   vitest   docs/milestones/M04-manual-validation.md M04

  `PRD-0034`    P2         §18      `TESTED`   security/THREAT_MODEL.md, security/tests   vitest   docs/milestones/M04-manual-validation.md M04

  `PRD-0035`    P2         §18      `TESTED`   security/THREAT_MODEL.md, security/tests   vitest   docs/milestones/M04-manual-validation.md M04

  `PRD-0036`    P2         §18      `TESTED`   security/THREAT_MODEL.md, security/tests   vitest   docs/milestones/M04-manual-validation.md M04

  `PRD-0037`    P2         §18      `TESTED`   security/THREAT_MODEL.md, security/tests   vitest   docs/milestones/M04-manual-validation.md M04

  `PRD-0038`    P2         §18      `TESTED`   security/THREAT_MODEL.md, security/tests   vitest   docs/milestones/M04-manual-validation.md M04

  `JOB-0008`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0009`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0010`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0011`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0012`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0013`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0014`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0015`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0016`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0017`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0018`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0019`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0020`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0021`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0022`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0023`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0024`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0025`    P1         §19      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `SEC-0026`    P1         §20      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0027`    P0         §20      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0028`    P0         §20      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0029`    P0         §20      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0030`    P0         §20      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0031`    P0         §20      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0043`    P1         §21      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0044`    P1         §21      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0045`    P1         §21      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0046`    P1         §22      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0047`    P1         §22      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `CAP-0001`    P1         §23      `TESTED`   packages/database/prisma/schema.prisma vitest; docs/milestones/M01-manual-validation.md M01

  `PAY-0001`    P1         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0002`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0003`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0004`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0005`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0006`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0007`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0008`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0009`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0010`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0011`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0012`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0013`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0014`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0015`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0016`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0017`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0018`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0019`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0020`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0021`    P0         §24      `TESTED`   packages/billing/src/job-card-payment.ts, apps/api/routes/buyer-jobs-submit.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08 per-job PaymentIntent §24.5

  `PAY-0022`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0023`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0024`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0025`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0026`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0027`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0028`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0029`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0030`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0031`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0032`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0033`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0034`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0035`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0036`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0037`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0038`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0039`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0040`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0041`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0042`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0043`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0044`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0045`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0046`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0047`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0048`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0049`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0050`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0051`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0052`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0053`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0054`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0055`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0056`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0057`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0058`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0059`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0060`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0061`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0062`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0063`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0064`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0065`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0066`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0067`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0068`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0069`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0070`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0071`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0072`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0073`    P0         §24      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0039`    P1         §25      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0040`    P2         §25      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0041`    P2         §25      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0042`    P2         §25      `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `AVL-0001`    P1         §26      `TESTED`   packages/job-scheduling/src/availability-status.ts, packages/job-scheduling/src/availability-service.ts, packages/job-scheduling/src/submission-gate.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0002`    P1         §26      `TESTED`   packages/job-scheduling/src/availability-status.ts, packages/job-scheduling/src/availability-service.ts, packages/job-scheduling/src/submission-gate.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `WRK-0048`    P1         §27      `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `WRK-0049`    P1         §27      `TESTED`   packages/seller-experience/src/seller-security-disclosure.ts  seller-security-disclosure.test.ts  a selected read-only credential is shown as allowed

  `WRK-0050`    P1         §27      `TESTED`   packages/seller-experience/src/seller-security-disclosure.ts  seller-security-disclosure.test.ts  the preview lists the personal workspace and documents as denied

  `WRK-0051`    P1         §27      `TESTED`   packages/seller-experience/src/publish-readiness.ts  publish-readiness.test.ts  publish stays blocked while a required check fails

  `PRD-0043`    P1         §28      `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `OBS-0001`    P1         §29      `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `OBS-0002`    P2         §29      `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `OBS-0003`    P2         §29      `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `SEC-0032`    P1         §30      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `SEC-0033`    P0         §30      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `SEC-0034`    P0         §30      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `IO-0007`    P1         §31      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `IO-0008`    P1         §31      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `IO-0009`    P1         §31      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0002`    P1         §32      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0003`    P1         §32      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0004`    P1         §32      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `SEC-0035`    P1         §33      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `WRK-0052`    P1         §34      `TESTED`   docs/TESTING-STRATEGY.md, docs/testing/INTEGRATION-TEST-MATRIX.md   scripts/verify-integration-matrix.mjs; security/tests/adversarial-m04.test.ts   docs/milestones/M16-closure.md M16 §34

  `OBS-0004`    P1         §35      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `JOB-0026`    P1         §36      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `JOB-0027`    P1         §36      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `JOB-0028`    P1         §36      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `JOB-0029`    P1         §36      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `JOB-0030`    P1         §36      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `JOB-0031`    P1         §36      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `PRD-0044`    P1         §37      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `PRD-0045`    P2         §37      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `PRD-0046`    P2         §37      `TESTED`   packages/abuse-controls, packages/job-failure, packages/observability, apps/api/src/routes/platform-admin.ts, apps/api/src/routes/abuse-reports.ts   packages/abuse-controls/src/denylist.test.ts; packages/job-failure/src/invariants.test.ts; security/tests/acceptance-m15.test.ts; scripts/verify-m15-flow.mjs   docs/milestones/M15-manual-validation.md M15

  `PRD-0047`    P1         §38      `TESTED`   docs/TESTING-STRATEGY.md, docs/legal/ALPHA-NOTICE.md, apps/web/src/app/legal   security/tests/acceptance-m15.test.ts   docs/milestones/M15-closure.md M15

  `PRD-0048`    P1         §39      `TESTED`   docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md, tests/fixtures/catalog.json   security/tests/acceptance-m16.test.ts; scripts/verify-m16-flow.mjs   docs/milestones/M16-manual-validation.md M16

  `WRK-0053`    P1         §40      `TESTED`   README.md, repo layout §52 vitest; docs/milestones/M00-manual-validation.md M00

  `PRD-0049`    P1         §41      `TESTED`   docs/API-CONTRACT-MVP.md, apps/api/src/routes   scripts/verify-api-contract-mvp.mjs; security/tests/acceptance-m16.test.ts   docs/milestones/M16-manual-validation.md M16 §41

  `PRD-0050`    P2         §41      `TESTED`   docs/API-CONTRACT-MVP.md, apps/api/src/routes   scripts/verify-api-contract-mvp.mjs; security/tests/acceptance-m16.test.ts   docs/milestones/M16-manual-validation.md M16 §41

  `CAP-0005`    P1         §42      `TESTED`   docs/MCP-API-FUTURE.md, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §42 deferred

  `CAP-0006`    P1         §42      `TESTED`   docs/MCP-API-FUTURE.md, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §42 deferred

  `CAP-0007`    P1         §42      `TESTED`   docs/MCP-API-FUTURE.md, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §42 deferred

  `SEC-0036`    P1         §43      `TESTED`   docs/OPENCLAW-STUDY-NOTES.md, packages/openclaw-adapter   security/tests/acceptance-m16.test.ts   docs/milestones/M16-manual-validation.md M16 §43

  `SEC-0037`    P0         §43      `TESTED`   docs/OPENCLAW-STUDY-NOTES.md, packages/openclaw-adapter   security/tests/acceptance-m16.test.ts   docs/milestones/M16-manual-validation.md M16 §43

  `SEC-0038`    P1         §44      `TESTED`   docs/TECH-EXPERIMENTS.md, security/tests   security/tests/adversarial-m04.test.ts; scripts/verify-m04-flow.mjs   docs/milestones/M16-manual-validation.md M16 §44

  `SEC-0039`    P0         §44      `TESTED`   docs/TECH-EXPERIMENTS.md, security/tests   security/tests/adversarial-m04.test.ts; scripts/verify-m04-flow.mjs   docs/milestones/M16-manual-validation.md M16 §44

  `SEC-0040`    P0         §44      `TESTED`   docs/TECH-EXPERIMENTS.md, security/tests   security/tests/adversarial-m04.test.ts; scripts/verify-m04-flow.mjs   docs/milestones/M16-manual-validation.md M16 §44

  `SEC-0041`    P0         §44      `TESTED`   docs/TECH-EXPERIMENTS.md, security/tests   security/tests/adversarial-m04.test.ts; scripts/verify-m04-flow.mjs   docs/milestones/M16-manual-validation.md M16 §44

  `PRD-0051`    P1         §45      `TESTED`   docs/MVP-SUCCESS-CHECKLIST.md, docs/milestones/M16-manual-validation.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §45

  `PRD-0052`    P2         §45      `TESTED`   docs/MVP-SUCCESS-CHECKLIST.md, docs/milestones/M16-manual-validation.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §45

  `PRD-0053`    P2         §45      `TESTED`   docs/MVP-SUCCESS-CHECKLIST.md, docs/milestones/M16-manual-validation.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §45

  `PRD-0054`    P1         §46      `TESTED`   docs/PRODUCT-VALIDATION.md   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §46

  `PRD-0055`    P2         §46      `TESTED`   docs/PRODUCT-VALIDATION.md   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §46

  `PRD-0056`    P2         §46      `TESTED`   docs/PRODUCT-VALIDATION.md   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §46

  `PRD-0057`    P1         §47      `DEFERRED`   ---              ---        post-MVP stages after the core is proven (Master Spec §47)

  `PRD-0058`    P2         §47      `DEFERRED`   ---              ---        post-MVP stages after the core is proven (Master Spec §47)

  `PRD-0059`    P2         §47      `DEFERRED`   ---              ---        post-MVP stages after the core is proven (Master Spec §47)

  `PRD-0060`    P2         §47      `DEFERRED`   ---              ---        post-MVP stages after the core is proven (Master Spec §47)

  `SEC-0042`    P1         §48      `TESTED`   packages/platform-policy/src/architecture-principles.ts  architecture-principles.test.ts  the fifteen architecture principles stay in the README

  `SEC-0043`    P0         §48      `TESTED`   packages/platform-policy/src/architecture-principles.ts  architecture-principles.test.ts  README repeats each core principle

  `WRK-0054`    P1         §49      `TESTED`   docs/ARCHITECTURE.md vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0055`    P1         §49      `TESTED`   docs/ARCHITECTURE.md vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0056`    P1         §49      `TESTED`   docs/ARCHITECTURE.md vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0057`    P1         §49      `TESTED`   docs/ARCHITECTURE.md vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0058`    P1         §49      `TESTED`   docs/ARCHITECTURE.md vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0059`    P1         §50      `TESTED`   packages/platform-policy/src/architecture-principles.ts  architecture-principles.test.ts  the MVP is one sentence in the README

  `WRK-0060`    P1         §50      `TESTED`   packages/platform-policy/src/architecture-principles.ts  architecture-principles.test.ts  the sentence is install, select, publish, and isolated execution

  `SEC-0044`    P1         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0045`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0046`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0047`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0048`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0049`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0050`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0051`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0052`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0053`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `SEC-0054`    P0         §51      `TESTED`   AGENTS.md, spec/DECISIONS.md vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0061`    P1         §52      `TESTED`   pnpm-workspace.yaml, apps/*, packages/* vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0062`    P1         §52      `TESTED`   pnpm-workspace.yaml, apps/*, packages/* vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0063`    P1         §52      `TESTED`   pnpm-workspace.yaml, apps/*, packages/* vitest; docs/milestones/M00-manual-validation.md M00

  `IO-0010`    P1         §53      `TESTED`   packages/contracts vitest; docs/milestones/M00-manual-validation.md M00

  `IO-0011`    P1         §53      `TESTED`   packages/contracts vitest; docs/milestones/M00-manual-validation.md M00

  `IO-0012`    P1         §53      `TESTED`   packages/contracts vitest; docs/milestones/M00-manual-validation.md M00

  `CAP-0008`    P1         §54      `TESTED`   packages/contracts/worker-manifest.ts vitest; docs/milestones/M00-manual-validation.md M00

  `CAP-0009`    P1         §54      `TESTED`   packages/contracts/worker-manifest.ts vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0064`    P1         §55      `TESTED`   docs/WORKER_MANIFEST.md (SQLite M01) vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0065`    P1         §55      `TESTED`   docs/WORKER_MANIFEST.md (SQLite M01) vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0066`    P1         §55      `TESTED`   docs/WORKER_MANIFEST.md (SQLite M01) vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0067`    P1         §55      `TESTED`   docs/WORKER_MANIFEST.md (SQLite M01) vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0068`    P1         §56      `TESTED`   apps/worker/src/cli.ts vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0069`    P1         §56      `TESTED`   apps/worker/src/cli.ts vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0070`    P1         §56      `TESTED`   apps/worker/src/cli.ts vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0071`    P1         §57      `TESTED`   apps/worker doctor vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0072`    P1         §57      `TESTED`   apps/worker doctor vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0073`    P1         §57      `TESTED`   apps/worker doctor vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0074`    P1         §58      `TESTED`   packages/openclaw-adapter/types.ts vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0075`    P1         §58      `TESTED`   packages/openclaw-adapter/types.ts vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0076`    P1         §58      `TESTED`   packages/openclaw-adapter/types.ts vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0077`    P1         §59      `TESTED`   packages/openclaw-adapter stub vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0078`    P1         §59      `TESTED`   packages/openclaw-adapter stub vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0079`    P1         §59      `TESTED`   packages/openclaw-adapter stub vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0080`    P1         §59      `TESTED`   packages/openclaw-adapter stub vitest; docs/milestones/M00-manual-validation.md M00

  `WRK-0081`    P1         §59      `TESTED`   packages/openclaw-adapter stub vitest; docs/milestones/M00-manual-validation.md M00

  `JOB-0032`    P1         §60      `TESTED`   packages/openclaw-adapter/job-paths.ts vitest; docs/milestones/M00-manual-validation.md M00

  `JOB-0033`    P1         §60      `TESTED`   packages/openclaw-adapter/job-paths.ts vitest; docs/milestones/M00-manual-validation.md M00

  `JOB-0034`    P1         §60      `TESTED`   packages/openclaw-adapter/job-paths.ts vitest; docs/milestones/M00-manual-validation.md M00

  `JOB-0035`    P1         §60      `TESTED`   packages/openclaw-adapter/job-paths.ts vitest; docs/milestones/M00-manual-validation.md M00

  `JOB-0036`    P1         §60      `TESTED`   packages/openclaw-adapter/job-paths.ts vitest; docs/milestones/M00-manual-validation.md M00

  `JOB-0037`    P1         §60      `TESTED`   packages/openclaw-adapter/job-paths.ts vitest; docs/milestones/M00-manual-validation.md M00

  `IO-0013`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0014`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0015`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0016`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0017`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0018`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0019`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0020`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0021`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0022`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0023`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0024`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0025`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0026`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0027`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0028`    P1         §61      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0029`    P1         §62      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0030`    P1         §62      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0031`    P1         §62      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0032`    P1         §62      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0033`    P1         §63      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `IO-0034`    P1         §63      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0038`    P1         §64      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0039`    P1         §64      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0040`    P1         §64      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0041`    P1         §64      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `PRD-0061`    P1         §65      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `PRD-0062`    P2         §65      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0082`    P1         §66      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0083`    P1         §66      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0084`    P1         §66      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0085`    P1         §66      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0086`    P1         §66      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0087`    P1         §66      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0088`    P1         §66      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0089`    P1         §66      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0090`    P1         §66      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0091`    P1         §67      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0092`    P1         §67      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `CAP-0010`    P1         §68      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `CAP-0011`    P1         §68      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `CAP-0012`    P1         §68      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `CAP-0013`    P1         §68      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0042`    P1         §69      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0043`    P1         §69      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `JOB-0044`    P1         §70      `TESTED`   packages/sandbox/src/timeouts.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `JOB-0045`    P1         §70      `TESTED`   packages/sandbox/src/timeouts.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `JOB-0046`    P1         §70      `TESTED`   packages/openclaw-adapter, packages/job-dispatch   vitest   synthetic execution + pause/resume M07

  `JOB-0047`    P1         §70      `TESTED`   packages/openclaw-adapter, packages/sandbox/supervisor.ts   vitest   pause supervision M07

  `SEC-0055`    P1         §71      `TESTED`   packages/resource-broker   vitest   docs/milestones/M04-manual-validation.md M04

  `SEC-0056`    P0         §71      `TESTED`   packages/resource-broker   vitest   docs/milestones/M04-manual-validation.md M04

  `SEC-0057`    P1         §72      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `SEC-0058`    P0         §72      `TESTED`   packages/policy-engine/src/resources.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `SEC-0059`    P0         §72      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `SEC-0060`    P0         §72      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `SEC-0061`    P0         §72      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `API-0001`    P1         §73      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `API-0002`    P1         §73      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `API-0003`    P1         §73      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `API-0004`    P1         §73      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `CAP-0014`    P1         §74      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `CAP-0015`    P1         §74      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `SEC-0062`    P1         §75      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `PRD-0063`    P1         §76      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `PRD-0064`    P2         §76      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `PRD-0065`    P2         §76      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `CAP-0016`    P1         §77      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `CAP-0017`    P1         §77      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0048`    P1         §78      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `JOB-0049`    P1         §78      `TESTED`   packages/policy-engine, packages/sandbox, packages/egress-proxy, packages/resource-broker, packages/provider-broker, packages/platform-policy   vitest; scripts/verify-m04-flow.mjs   docs/milestones/M04-manual-validation.md M04

  `SEC-0063`    P1         §79      `TESTED`   docs/INCIDENT_RESPONSE.md   manual   docs/milestones/M04-manual-validation.md M04

  `SEC-0064`    P0         §79      `TESTED`   docs/INCIDENT_RESPONSE.md   manual   docs/milestones/M04-manual-validation.md M04

  `TST-0001`    P1         §80      `TESTED`   .github/workflows/ci.yml   pnpm test; pnpm verify:m04   docs/milestones/M04-manual-validation.md M04

  `TST-0002`    P2         §80      `TESTED`   .github/workflows/ci.yml   pnpm test; pnpm verify:m04   docs/milestones/M04-manual-validation.md M04

  `TST-0003`    P2         §80      `TESTED`   .github/workflows/ci.yml   pnpm test; pnpm verify:m04   docs/milestones/M04-manual-validation.md M04

  `TST-0004`    P2         §80      `TESTED`   .github/workflows/ci.yml   pnpm test; pnpm verify:m04   docs/milestones/M04-manual-validation.md M04

  `TST-0005`    P2         §80      `TESTED`   .github/workflows/ci.yml   pnpm test; pnpm verify:m04   docs/milestones/M04-manual-validation.md M04

  `PRD-0066`    P1         §81      `TESTED`   .env.example, apps/worker doctor   vitest   docs/milestones/M04-manual-validation.md M04

  `PRD-0067`    P2         §81      `TESTED`   .env.example, apps/worker doctor   vitest   docs/milestones/M04-manual-validation.md M04

  `OPS-0001`    P1         §82      `TESTED`   packages/database/prisma/migrations   manual   docs/milestones/M04-manual-validation.md M04

  `OPS-0002`    P2         §82      `TESTED`   packages/database/prisma/migrations   manual   docs/milestones/M04-manual-validation.md M04

  `WRK-0093`    P1         §83      `TESTED`   packages/observability, apps/api/server.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `WRK-0094`    P1         §83      `TESTED`   packages/observability, apps/api/server.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `WRK-0095`    P1         §83      `TESTED`   packages/observability, apps/api/server.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `WRK-0096`    P1         §83      `TESTED`   packages/observability, apps/api/server.ts   vitest   docs/milestones/M04-manual-validation.md M04

  `OBS-0005`    P1         §84      `TESTED`   apps/api health routes, packages/observability   security/tests/acceptance-m15.test.ts   docs/milestones/M15-manual-validation.md M15 health §84

  `OBS-0006`    P2         §84      `TESTED`   apps/api health routes, packages/observability   security/tests/acceptance-m15.test.ts   docs/milestones/M15-manual-validation.md M15 health §84

  `PRD-0068`    P1         §85      `TESTED`   packages/marketplace, apps/web/src/app/search   security/tests/acceptance-m10.test.ts   docs/milestones/M15-manual-validation.md M15 search parity

  `PRD-0069`    P2         §85      `TESTED`   packages/marketplace, apps/web/src/app/search   security/tests/acceptance-m10.test.ts   docs/milestones/M15-manual-validation.md M15 search parity

  `PRD-0070`    P1         §86      `TESTED`   packages/marketplace, apps/api capability reviews   security/tests/acceptance-m10.test.ts   docs/milestones/M15-manual-validation.md M15 reviews

  `PRD-0071`    P2         §86      `TESTED`   packages/marketplace, apps/api capability reviews   security/tests/acceptance-m10.test.ts   docs/milestones/M15-manual-validation.md M15 reviews

  `PRD-0072`    P2         §86      `TESTED`   packages/marketplace, apps/api capability reviews   security/tests/acceptance-m10.test.ts   docs/milestones/M15-manual-validation.md M15 reviews

  `PAY-0074`    P1         §87      `TESTED`   apps/api seller dashboard, packages/billing   scripts/verify-m08-flow.mjs   docs/milestones/M15-manual-validation.md M15 seller economics

  `IO-0035`    P1         §88      `TESTED`   docs/testing/HAPPY-PATH-TRACE.md, tests/fixtures/happy-path-trace.json   scripts/verify-happy-path-trace.mjs; security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §88

  `IO-0036`    P1         §88      `TESTED`   docs/testing/HAPPY-PATH-TRACE.md, tests/fixtures/happy-path-trace.json   scripts/verify-happy-path-trace.mjs; security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §88

  `WRK-0097`    P1         §89      `TESTED`   docs/testing/FAILURE-PATH-TRACE.md, tests/fixtures/failure-path-trace.json   scripts/verify-failure-path-trace.mjs; packages/job-failure   docs/milestones/M16-closure.md M16 §89

  `WRK-0098`    P1         §89      `TESTED`   docs/testing/FAILURE-PATH-TRACE.md, tests/fixtures/failure-path-trace.json   scripts/verify-failure-path-trace.mjs; packages/job-failure   docs/milestones/M16-closure.md M16 §89

  `IO-0037`    P1         §90      `TESTED`   security/adversarial-fixtures, tests/fixtures/catalog.json   security/tests/e2e-fixtures-m16.test.ts; security/tests/fixture-ad-m06.test.ts   docs/milestones/M16-closure.md M16 §90

  `TST-0006`    P1         §91      `TESTED`   docs/testing/SECURITY-RELEASE-GATE.md, tests/fixtures/security-release-gate.json   scripts/verify-release-gate-evidence.mjs; security/tests/adversarial-m04.test.ts   docs/milestones/M16-closure.md M16 §91

  `TST-0007`    P2         §91      `TESTED`   docs/testing/SECURITY-RELEASE-GATE.md, tests/fixtures/security-release-gate.json   scripts/verify-release-gate-evidence.mjs; security/tests/adversarial-m04.test.ts   docs/milestones/M16-closure.md M16 §91

  `TST-0008`    P1         §92      `TESTED`   docs/testing/PRODUCT-RELEASE-GATE.md, docs/MVP-SUCCESS-CHECKLIST.md   scripts/verify-m16-flow.mjs; pnpm test:e2e:local   docs/milestones/M16-closure.md M16 §92 staging E2E M18

  `TST-0009`    P2         §92      `TESTED`   docs/testing/PRODUCT-RELEASE-GATE.md, docs/MVP-SUCCESS-CHECKLIST.md   scripts/verify-m16-flow.mjs; pnpm test:e2e:local   docs/milestones/M16-closure.md M16 §92 staging E2E M18

  `TST-0010`    P2         §92      `TESTED`   docs/testing/PRODUCT-RELEASE-GATE.md, docs/MVP-SUCCESS-CHECKLIST.md   scripts/verify-m16-flow.mjs; pnpm test:e2e:local   docs/milestones/M16-closure.md M16 §92 staging E2E M18

  `TST-0011`    P2         §92      `TESTED`   docs/testing/PRODUCT-RELEASE-GATE.md, docs/MVP-SUCCESS-CHECKLIST.md   scripts/verify-m16-flow.mjs; pnpm test:e2e:local   docs/milestones/M16-closure.md M16 §92 staging E2E M18

  `TST-0012`    P2         §92      `TESTED`   docs/testing/PRODUCT-RELEASE-GATE.md, docs/MVP-SUCCESS-CHECKLIST.md   scripts/verify-m16-flow.mjs; pnpm test:e2e:local   docs/milestones/M16-closure.md M16 §92 staging E2E M18

  `IO-0038`    P1         §93      `TESTED`   spec/IMPLEMENTATION-PLAN.md, docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §93

  `IO-0039`    P1         §93      `TESTED`   spec/IMPLEMENTATION-PLAN.md, docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §93

  `IO-0040`    P1         §93      `TESTED`   spec/IMPLEMENTATION-PLAN.md, docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §93

  `IO-0041`    P1         §93      `TESTED`   spec/IMPLEMENTATION-PLAN.md, docs/architecture/IMPLEMENTATION-ROADMAP-STATUS.md   scripts/verify-m16-flow.mjs   docs/milestones/M16-closure.md M16 §93

  `TST-0013`    P1         §94      `TESTED`   .github/workflows/ci.yml, scripts/verify-code-quality-gate.mjs   pnpm typecheck; pnpm lint; pnpm test   docs/milestones/M16-closure.md M16 §94

  `TST-0014`    P2         §94      `TESTED`   .github/workflows/ci.yml, scripts/verify-code-quality-gate.mjs   pnpm typecheck; pnpm lint; pnpm test   docs/milestones/M16-closure.md M16 §94

  `TST-0015`    P2         §94      `TESTED`   .github/workflows/ci.yml, scripts/verify-code-quality-gate.mjs   pnpm typecheck; pnpm lint; pnpm test   docs/milestones/M16-closure.md M16 §94

  `PRD-0073`    P1         §95      `TESTED`   README.md, AGENTS.md, docs/MVP-SUCCESS-CHECKLIST.md   security/tests/acceptance-m16.test.ts   docs/milestones/M16-closure.md M16 §95

  `PRD-0074`    P1         §96      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `PRD-0075`    P2         §96      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `PRD-0076`    P2         §96      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `PRD-0077`    P2         §96      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `PRD-0078`    P2         §96      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `PRD-0079`    P2         §96      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0001`    P1         §97      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0002`    P1         §97      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0003`    P1         §97      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0004`    P1         §97      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0005`    P1         §98      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0006`    P1         §98      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0007`    P1         §98      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0008`    P1         §98      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0009`    P1         §99      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0010`    P1         §99      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0011`    P1         §99      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0012`    P1         §99      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0013`    P1         §99      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0014`    P1         §99      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0015`    P1         §100      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0016`    P1         §100      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0017`    P1         §100      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0018`    P1         §100      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0019`    P1         §100      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0020`    P1         §101      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0021`    P1         §101      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0022`    P1         §101      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0018`    P1         §102      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0019`    P1         §102      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0020`    P1         §102      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0021`    P1         §103      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0023`    P1         §104      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0024`    P1         §104      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0025`    P1         §104      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0026`    P1         §104      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0027`    P1         §104      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0022`    P1         §105      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0023`    P1         §105      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0024`    P1         §105      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0025`    P1         §105      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0001`    P1         §106      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0002`    P2         §106      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0003`    P2         §106      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0004`    P2         §106      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0005`    P2         §106      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0006`    P2         §106      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0007`    P2         §106      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0008`    P1         §107      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0009`    P2         §107      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0010`    P2         §107      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0011`    P2         §107      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0012`    P2         §107      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0013`    P2         §107      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0014`    P2         §107      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `UI-0015`    P2         §107      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0026`    P1         §108      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0027`    P1         §108      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0028`    P1         §108      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0029`    P1         §108      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0030`    P1         §108      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0031`    P1         §108      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0032`    P1         §108      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0028`    P1         §109      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0029`    P1         §109      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0030`    P1         §109      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0031`    P1         §109      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0032`    P1         §109      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0033`    P1         §110      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0034`    P1         §110      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0035`    P1         §110      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0036`    P1         §110      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0037`    P1         §111      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0038`    P1         §111      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0039`    P1         §111      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0040`    P1         §111      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0041`    P1         §111      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0042`    P1         §111      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0043`    P1         §112      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0044`    P1         §113      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0045`    P1         §113      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0046`    P1         §113      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0047`    P1         §114      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0048`    P1         §114      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `SEC-0065`    P1         §115      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `JOB-0050`    P1         §116      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `JOB-0051`    P1         §116      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `JOB-0052`    P1         §116      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `JOB-0053`    P1         §116      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `JOB-0054`    P1         §116      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `JOB-0055`    P1         §116      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0033`    P1         §117      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `AGT-0034`    P1         §117      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0049`    P1         §118      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0050`    P1         §118      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0051`    P1         §118      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `PRD-0080`    P1         §119      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `PRD-0081`    P2         §119      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `PRD-0082`    P2         §119      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `PRD-0083`    P1         §120      `TESTED`   packages/domain/unified-account.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0084`    P2         §120      `TESTED`   packages/domain/unified-account.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0085`    P2         §120      `TESTED`   packages/domain/unified-account.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0086`    P2         §120      `TESTED`   packages/domain/unified-account.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0087`    P2         §120      `TESTED`   packages/domain/unified-account.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0088`    P1         §121     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0089`    P2         §121     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0090`    P1         §122     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0091`    P2         §122     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0092`    P1         §123     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0093`    P2         §123     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0094`    P2         §123     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0095`    P1         §124     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0096`    P2         §124     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0097`    P1         §125     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0098`    P2         §125     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `CAP-0052`    P1         §126     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `JOB-0056`    P1         §127     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `JOB-0057`    P1         §127     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `JOB-0058`    P1         §127     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `JOB-0059`    P1         §127     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0099`    P1         §128     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0100`    P2         §128     `TESTED`   packages/marketplace, apps/api/src/routes/marketplace.ts, apps/api/src/routes/marketplace-sellers.ts, apps/api/src/routes/marketplace-agent.ts, apps/api/src/routes/buyer-jobs-list.ts, apps/api/src/routes/buyer-job-assets.ts, apps/api/src/routes/capability-reviews.ts, apps/web   packages/marketplace/src/*.test.ts; security/tests/acceptance-m10.test.ts; scripts/verify-m10-flow.mjs   docs/milestones/M10-manual-validation.md M10

  `PRD-0101`    P1         §129     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0102`    P2         §129     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0103`    P1         §130     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0104`    P2         §130     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0105`    P1         §131     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0106`    P2         §131     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0107`    P2         §131     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0108`    P2         §131     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0109`    P2         §131     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0110`    P1         §132     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0111`    P2         §132     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0112`    P1         §133     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0113`    P2         §133     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0114`    P2         §133     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0115`    P2         §133     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0116`    P1         §134     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `AGT-0035`    P1         §135     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `AGT-0036`    P1         §135     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `AGT-0037`    P1         §135     `TESTED`   packages/marketplace/src/agent-discovery.ts, packages/marketplace/src/agent-ranking.ts, packages/marketplace/src/buyer-constraints.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace/src/agent-discovery.test.ts; security/tests/acceptance-m10.test.ts   docs/milestones/M10-manual-validation.md M10 assisted discovery Mode A

  `PRD-0117`    P1         §136     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `PRD-0118`    P2         §136     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `AGT-0038`    P1         §137     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `AGT-0039`    P1         §137     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `PRD-0119`    P1         §138     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `PRD-0120`    P2         §138     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `PRD-0121`    P2         §138     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `IO-0042`     P1         §139     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `IO-0043`     P1         §139     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `IO-0044`     P1         §139     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `JOB-0060`    P1         §140     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `JOB-0061`    P1         §140     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `JOB-0062`    P1         §140     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `JOB-0063`    P1         §140     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `JOB-0064`    P1         §141     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `JOB-0065`    P1         §141     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `PAY-0075`    P1         §142     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `PAY-0076`    P0         §142     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `PAY-0077`    P0         §142     `TESTED`   packages/marketplace-agent, packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   packages/marketplace-agent/src/orchestration-planner.test.ts; security/tests/acceptance-m11.test.ts; scripts/verify-m11-flow.mjs   docs/milestones/M11-manual-validation.md M11 orchestration Mode B foundation

  `AGT-0040`    P1         §143     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `AGT-0041`    P1         §143     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `AGT-0042`    P1         §143     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `AGT-0043`    P1         §143     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `AGT-0044`    P1         §143     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `PRD-0122`    P1         §144     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `PRD-0123`    P2         §144     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `PRD-0124`    P2         §144     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `PRD-0125`    P2         §144     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `AGT-0045`    P1         §145     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `AGT-0046`    P1         §145     `TESTED`   packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/orchestration-runner.test.ts   docs/milestones/M11-manual-validation.md M11 synthesis on plan complete

  `PRD-0126`    P1         §146     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `PRD-0127`    P2         §146     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `PRD-0128`    P2         §146     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `PRD-0129`    P2         §146     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `PRD-0130`    P1         §147     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `PRD-0131`    P2         §147     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `PRD-0132`    P2         §147     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `CAP-0053`    P1         §148     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `CAP-0054`    P1         §148     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `PRD-0133`    P1         §149     `TESTED`   packages/marketplace-agent/src/platform-inference.ts, apps/api/src/routes/marketplace-agent.ts, apps/web/src/app/agent   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 platform inference port

  `PRD-0134`    P1         §150     `TESTED`   packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 conversation persistence

  `PRD-0135`    P2         §150     `TESTED`   packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 conversation persistence

  `PRD-0136`    P2         §150     `TESTED`   packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 conversation persistence

  `PRD-0137`    P1         §151     `TESTED`   packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 conversation persistence

  `PRD-0138`    P2         §151     `TESTED`   packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 conversation persistence

  `PRD-0139`    P2         §151     `TESTED`   packages/database/prisma/schema.prisma, apps/api/src/routes/marketplace-agent.ts   security/tests/acceptance-m11.test.ts   docs/milestones/M11-manual-validation.md M11 conversation persistence

  `PRD-0140`    P1         §152     `TESTED`   apps/web/src/lib/primary-nav.ts  primary-nav.test.ts  discover, AI request, jobs, favorites, selling

  `PRD-0141`    P2         §152     `TESTED`   apps/web/src/lib/primary-nav.ts  primary-nav.test.ts  recommended navigation labels

  `PRD-0142`    P1         §153     `TESTED`   packages/seller-experience/src/marketplace-identity.ts  marketplace-identity.test.ts  public page omits the seller machine

  `PRD-0143`    P2         §153     `TESTED`   packages/marketplace/src/verified-reputation.ts  verified-reputation.test.ts  reputation uses completed jobs only

  `PRD-0144`    P1         §154     `TESTED`   packages/marketplace/src/categories.ts  categories.test.ts  one category, a few tags, and ranking uses the description

  `PRD-0145`    P2         §154     `TESTED`   packages/marketplace/src/agent-ranking.ts  contract-rank.test.ts  description match is not limited to category

  `PRD-0146`    P1         §155     `TESTED`   packages/marketplace/src/discovery-index.ts  discovery-index.test.ts  public discovery fields stay in PostgreSQL

  `PRD-0147`    P2         §155     `TESTED`   packages/marketplace/src/discovery-index.ts  discovery-index.test.ts  discovery does not add a search cluster

  `PRD-0148`    P2         §155     `TESTED`   packages/marketplace/src/discovery-index.ts  discovery-index.test.ts  private instructions and secrets are not indexed

  `CAP-0055`    P1         §156     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  public discovery document

  `IO-0045`     P1         §157     `TESTED`   packages/marketplace-agent/src/agent-safety.test.ts  agent-safety.test.ts  budget, rating, and catalog-only ranking

  `IO-0046`     P1         §158     `TESTED`   packages/marketplace-agent/src/plan-compatibility.ts  plan-compatibility.test.ts  orchestration IO compatibility

  `IO-0047`     P1         §158     `TESTED`   packages/marketplace-agent/src/plan-compatibility.ts  plan-compatibility.test.ts  outputs must feed downstream inputs

  `IO-0048`     P1         §158     `TESTED`   packages/marketplace-agent/src/orchestration-planner.ts  plan-compatibility.test.ts  incompatible steps are dropped

  `IO-0049`     P1         §158     `TESTED`   packages/marketplace-agent/src/plan-compatibility.ts  plan-compatibility.test.ts  no silent file conversion

  `PRD-0149`    P1         §159     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0150`    P2         §159     `TESTED`   packages/marketplace/src/agent-scope.ts  agent-scope.test.ts  the agent stays inside an OpenClaw marketplace

  `PRD-0151`    P2         §159     `TESTED`   packages/marketplace/src/agent-scope.ts  agent-scope.test.ts  shortlist and recommendation are in scope

  `PRD-0152`    P1         §160     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0153`    P2         §160     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0154`    P2         §160     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0155`    P1         §161     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0156`    P2         §161     `TESTED`   packages/marketplace-agent/src/purchase-authorization.ts  purchase-authorization.test.ts  plan spend cannot exceed authorization

  `PRD-0157`    P1         §162     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0158`    P2         §162     `TESTED`   packages/platform-policy/src/supply-thesis.ts  supply-thesis.test.ts  human marketplace and agent primitives both belong in the first product

  `PRD-0159`    P1         §163      `TESTED`   packages/domain/inference-domain.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0160`    P2         §163      `TESTED`   packages/domain/inference-domain.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0161`    P2         §163      `TESTED`   packages/domain/inference-domain.ts vitest; docs/milestones/M01-manual-validation.md M01

  `PRD-0162`    P2         §163      `TESTED`   packages/domain/inference-domain.ts vitest; docs/milestones/M01-manual-validation.md M01

  `AGT-0047`    P1         §164     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `AGT-0048`    P1         §164     `TESTED`   packages/marketplace-agent/src/platform-inference.ts  inference-request.test.ts  the agent router does not call a vendor URL

  `AGT-0049`    P1         §164     `TESTED`   packages/marketplace-agent/src/platform-inference-openai.ts  inference-request.test.ts  vendor URLs stay inside the provider adapters

  `AGT-0050`    P1         §165     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `AGT-0051`    P1         §165     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  provider keys stay server-side

  `AGT-0052`    P1         §165     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  both providers are not required

  `AGT-0053`    P1         §165     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  OpenAI alone selects OpenAI

  `AGT-0054`    P1         §165     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  Anthropic alone selects Anthropic

  `AGT-0055`    P1         §165     `TESTED`   packages/marketplace-agent/src/platform-secrets.ts  platform-secrets.test.ts  platform AI keys are not returned to a browser or worker audience

  `SEC-0066`    P1         §166     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `SEC-0067`    P0         §166     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `SEC-0068`    P0         §166     `TESTED`   packages/marketplace-agent/src/platform-secrets.ts  platform-secrets.test.ts  platform AI keys are visible only on the server

  `SEC-0069`    P0         §166     `TESTED`   packages/marketplace-agent/src/platform-secrets.ts  platform-secrets.test.ts  .env.example does not assign secret values

  `AGT-0056`    P1         §167     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `AGT-0057`    P1         §167     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  per-task model env overrides

  `AGT-0058`    P1         §167     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  recommendation uses its own model setting

  `AGT-0059`    P1         §167     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  INTENT/RECOMMENDATION/ORCHESTRATION routing

  `AGT-0060`    P1         §168     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `AGT-0061`    P1         §168     `TESTED`   packages/marketplace-agent/src/platform-inference-openai.ts  platform-inference-policy.test.ts  no source-code model default

  `AGT-0062`    P1         §168     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  the recommendation model comes from configuration

  `AGT-0063`    P1         §169     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `AGT-0064`    P1         §169     `TESTED`   packages/marketplace-agent/src/inference-request.ts  inference-request.test.ts  a request does not name the vendor

  `AGT-0065`    P1         §170     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `AGT-0066`    P1         §170     `TESTED`   packages/marketplace-agent/src/inference-request.ts  inference-request.test.ts  a request keeps task, messages, and metadata only

  `AGT-0067`    P1         §171     `TESTED`   packages/marketplace-agent/src/tool-executor.ts  agent-safety.test.ts  allowlisted marketplace tools

  `AGT-0068`    P1         §171     `TESTED`   packages/marketplace-agent/src/tool-executor.ts  agent-safety.test.ts  search, quote, availability, plan tools

  `AGT-0069`    P1         §171     `TESTED`   packages/marketplace-agent/src/tool-executor.ts  agent-safety.test.ts  unknown tool names are rejected

  `IO-0050`     P1         §172     `TESTED`   packages/marketplace-agent/src/structured-intent.ts  agent-safety.test.ts  intent JSON schema

  `IO-0051`     P1         §172     `TESTED`   packages/marketplace-agent/src/structured-intent.ts  agent-safety.test.ts  provider JSON validated before use

  `IO-0052`     P1         §172     `TESTED`   packages/marketplace-agent/src/structured-intent.ts  agent-safety.test.ts  malformed or purchase JSON is rejected

  `AGT-0070`    P1         §173     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0071`    P1         §173     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0072`    P1         §173     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0073`    P1         §173     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `PRD-0163`    P1         §174     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `PRD-0164`    P2         §174     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `PRD-0165`    P2         §174     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0074`    P1         §175     `TESTED`   packages/marketplace-agent/src/inference-usage.ts  inference-usage.test.ts  usage is recorded without the prompt; price stays unset until a provider rate exists

  `AGT-0075`    P1         §176     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0076`    P1         §176     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `PRD-0166`    P1         §177     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  bounded candidate set

  `PRD-0167`    P2         §177     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  catalog is not sent whole

  `PRD-0168`    P2         §177     `TESTED`   packages/marketplace-agent/src/agent-tools.ts  agent-safety.test.ts  search and filter happen in code

  `PRD-0169`    P2         §177     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  at most eight candidates

  `PRD-0170`    P2         §177     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  public metadata only

  `PRD-0171`    P2         §177     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  prompt size stays bounded

  `PRD-0172`    P1         §178     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  only task metadata is publishable

  `PRD-0173`    P2         §178     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  private prompts and credentials omitted

  `PRD-0174`    P2         §178     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  seller secrets are not discovery fields

  `PRD-0175`    P1         §179     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  platform agent does not inspect buyer files

  `PRD-0176`    P2         §179     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  files go to the paid capability

  `PRD-0177`    P2         §179     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  file inspection is off for MVP

  `PRD-0178`    P2         §179     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  no buyer file in platform inference

  `AGT-0077`    P1         §180     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0078`    P1         §180     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0079`    P1         §181     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `AGT-0080`    P1         §181     `TESTED`   apps/api/src/routes/platform-admin.ts  platform-inference-policy.test.ts  admin health omits provider keys

  `AGT-0081`    P1         §181     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  health omits secrets

  `AGT-0082`    P1         §181     `TESTED`   apps/api/src/routes/platform-admin.ts  agent-safety.test.ts  routing changes are audited without secrets

  `AGT-0083`    P1         §182     `TESTED`   packages/marketplace-agent/src/inference-safety.ts  agent-safety.test.ts  safe inference metadata

  `AGT-0084`    P1         §182     `TESTED`   packages/marketplace-agent/src/inference-safety.ts  agent-safety.test.ts  prompts are not logged by default

  `AGT-0085`    P1         §182     `TESTED`   packages/marketplace-agent/src/inference-safety.ts  agent-safety.test.ts  debug mode redacts secrets

  `IO-0053`     P1         §183     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `IO-0054`     P1         §183     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `IO-0055`     P1         §183     `TESTED`   packages/marketplace-agent/src/platform-inference-openai.ts  inference-request.test.ts  the OpenAI URL lives in one adapter constant

  `IO-0056`     P1         §183     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `UI-0016`     P1         §184     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `UI-0017`     P2         §184     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `UI-0018`     P2         §184     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0086`    P1         §185     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0087`    P1         §186     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0088`    P1         §186     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0089`    P1         §186     `TESTED`   ---              ---        packages/marketplace-agent/src/platform-inference.ts, packages/marketplace-agent/src/platform-inference-policy.ts, packages/marketplace-agent/src/orchestration-runner.ts, apps/api/src/services/orchestration-execution.ts   packages/marketplace-agent/src/platform-inference-policy.test.ts, packages/marketplace-agent/src/platform-inference-router.test.ts, packages/marketplace-agent/src/orchestration-runner.test.ts   inference router and orchestration pause

  `AGT-0090`    P1         §187     `TESTED`   packages/marketplace-agent/src/inference-safety.ts  agent-safety.test.ts  task feature requirements

  `AGT-0091`    P1         §187     `TESTED`   packages/marketplace-agent/src/inference-safety.ts  agent-safety.test.ts  model must declare required features

  `AGT-0092`    P1         §187     `TESTED`   packages/marketplace-agent/src/inference-safety.ts  agent-safety.test.ts  intent requires structured output

  `AGT-0093`    P1         §187     `TESTED`   packages/marketplace-agent/src/inference-safety.ts  agent-safety.test.ts  orchestration requires tool calling

  `PRD-0179`    P1         §188     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  system contract

  `PRD-0180`    P2         §188     `TESTED`   packages/marketplace-agent/src/discovery-document.ts  agent-safety.test.ts  do not invent marketplace facts

  `PRD-0181`    P2         §188     `TESTED`   packages/marketplace-agent/src/structured-intent.ts  agent-safety.test.ts  financial constraints stay hard

  `PRD-0182`    P2         §188     `TESTED`   packages/marketplace-agent/src/prompt-safety.ts  agent-safety.test.ts  seller text is untrusted

  `TST-0016`    P1         §189     `TESTED`   packages/marketplace-agent/src/agent-safety.test.ts  agent-safety.test.ts  intent and tool tests

  `TST-0017`    P2         §189     `TESTED`   packages/marketplace-agent/src/agent-safety.test.ts  agent-safety.test.ts  budget cannot be raised by the model

  `TST-0018`    P2         §189     `TESTED`   packages/marketplace-agent/src/agent-safety.test.ts  agent-safety.test.ts  unknown capability is not ranked

  `AGT-0094`    P1         §190     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `AGT-0095`    P1         §190     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  works with only OpenAI configured

  `AGT-0096`    P1         §190     `TESTED`   packages/marketplace-agent/src/platform-inference-policy.ts  platform-inference-policy.test.ts  works with only Anthropic configured

  `AGT-0097`    P1         §190     `TESTED`   packages/marketplace-agent/src/inference-ownership.ts  inference-ownership.test.ts  a provider failure cannot create a purchase

  `PRD-0183`    P1         §191     `TESTED`   packages/marketplace-agent/src/inference-ownership.ts  inference-ownership.test.ts  platform, seller, and buyer inference stay separate

  `PRD-0184`    P2         §191     `TESTED`   packages/marketplace-agent/src/inference-ownership.ts  inference-ownership.test.ts  platform inference does not perform the paid job

  `IO-0057`    P1         §192      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `IO-0058`    P1         §192      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `IO-0059`    P1         §192      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `IO-0060`    P1         §192      `TESTED`   packages/contracts/capability-io.ts vitest; docs/milestones/M01-manual-validation.md M01

  `IO-0061`     P1         §193     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0062`     P1         §193     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0063`    P1         §194      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `IO-0064`    P1         §194      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `IO-0065`     P1         §195     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0066`     P1         §195     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0067`     P1         §195     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `UI-0019`     P1         §196     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0068`     P1         §197     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0069`     P1         §197     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0070`     P1         §197     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `UI-0020`     P1         §198     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `UI-0021`     P2         §198     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0071`     P1         §199     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `PRD-0185`    P1         §200     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0072`     P1         §201     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0073`     P1         §201     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0074`     P1         §202     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0075`     P1         §202     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0076`     P1         §202     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0077`     P1         §203     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0078`     P1         §203     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `UI-0022`     P1         §204     `TESTED`   packages/job-io, apps/api/src/routes/seller-capabilities.ts   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0079`     P1         §205     `TESTED`   packages/capability-publish/suggest-input-contract.ts   vitest   docs/milestones/M05-manual-validation.md M05

  `IO-0080`     P1         §205     `TESTED`   packages/capability-publish/suggest-input-contract.ts   vitest   docs/milestones/M05-manual-validation.md M05

  `IO-0081`     P1         §205     `TESTED`   packages/capability-publish/suggest-input-contract.ts   vitest   docs/milestones/M05-manual-validation.md M05

  `PRD-0186`    P1         §206     `TESTED`   packages/job-io/buyer-form-schema.ts, GET /capabilities/:slug   vitest   docs/milestones/M05-manual-validation.md M05

  `CAP-0056`    P1         §207     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `PRD-0187`    P1         §208     `TESTED`   packages/job-io/agent-input-mapper.ts, POST /capabilities/:slug/prepare-agent-input   vitest   docs/milestones/M05-manual-validation.md M05

  `PRD-0188`    P2         §208     `TESTED`   packages/job-io/agent-input-mapper.ts   vitest   docs/milestones/M05-manual-validation.md M05

  `PRD-0189`    P2         §208     `TESTED`   packages/job-io/agent-input-mapper.ts   vitest   docs/milestones/M05-manual-validation.md M05

  `IO-0082`     P1         §209     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0083`     P1         §209     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `CAP-0057`    P1         §210     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `CAP-0058`    P1         §210     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `CAP-0059`    P1         §210     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0084`     P1         §211     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0085`     P1         §211     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0086`     P1         §211     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0087`     P1         §211     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0088`     P1         §212     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0089`     P1         §212     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0090`     P1         §212     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0091`     P1         §213     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0092`     P1         §213     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0093`     P1         §213     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0094`     P1         §213     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0095`     P1         §214     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0096`     P1         §214     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0097`     P1         §214     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0098`    P1         §215      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `IO-0099`    P1         §215      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `IO-0100`    P1         §215      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `IO-0101`    P1         §215      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `IO-0102`     P1         §216     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0103`     P1         §216     `TESTED`   packages/contracts/capability-io.ts, packages/job-io   vitest; scripts/verify-m05-flow.mjs   docs/milestones/M05-manual-validation.md M05

  `IO-0104`     P1         §217     `TESTED`   packages/job-io/src/archive-inputs.ts  archive-inputs.test.ts  archives stay disabled unless a safe extractor is enabled

  `IO-0105`     P1         §217     `TESTED`   packages/job-io/src/archive-inputs.ts  archive-inputs.test.ts  archives rejected

  `IO-0106`     P1         §217     `TESTED`   packages/job-io/src/validate-buyer-input.ts  archive-inputs.test.ts  no archive extraction path

  `IO-0107`     P1         §218     `TESTED`   packages/job-io/src/upload-transport.ts  upload-transport.test.ts  large files use object storage

  `IO-0108`     P1         §218     `TESTED`   packages/job-io/src/upload-transport.ts  upload-transport.test.ts  uploads are not assumed tiny

  `IO-0109`     P1         §218     `TESTED`   packages/job-io/src/upload-transport.ts  upload-transport.test.ts  multipart above part size

  `IO-0110`     P1         §218     `TESTED`   packages/job-io/src/upload-transport.ts  upload-transport.test.ts  worker does not load the whole file

  `CAP-0060`    P1         §219     `TESTED`   packages/job-io/src/field-constraints.ts  field-constraints.test.ts  effective file limit

  `CAP-0061`    P1         §219     `TESTED`   packages/job-io/src/field-constraints.ts  field-constraints.test.ts  seller cannot exceed platform ceiling

  `CAP-0062`    P1         §219     `TESTED`   packages/job-io/src/field-constraints.ts  field-constraints.test.ts  ceiling comes from configuration

  `IO-0111`     P1         §220     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `IO-0112`     P1         §220     `TESTED`   packages/job-io/src/storage-telemetry.ts  storage-telemetry.test.ts  byte telemetry does not change buyer price

  `IO-0113`     P1         §221     `TESTED`   packages/buyer-experience/src/purchase-snapshot-view.ts  purchase-snapshot-view.test.ts  an old job keeps the contract it was bought with

  `IO-0114`     P1         §222     `TESTED`   packages/job-io/src/contract-break.ts  contract-break.test.ts  breaking contract changes

  `IO-0115`     P1         §222     `TESTED`   packages/job-io/src/contract-break.ts  contract-break.test.ts  new required field is breaking

  `IO-0116`     P1         §222     `TESTED`   packages/job-io/src/contract-break.ts  contract-break.test.ts  optional output becoming required is breaking

  `IO-0117`     P1         §223     `TESTED`   packages/marketplace-agent/src/plan-compatibility.ts  plan-compatibility.test.ts  markdown can feed text, and a file handoff checks MIME and size

  `PRD-0190`    P1         §224     `TESTED`   packages/marketplace/src/contract-match.ts  contract-match.test.ts  small semantic taxonomy does not replace file checks

  `PRD-0191`    P2         §224     `TESTED`   packages/job-io/src/upload-transport.ts  upload-transport.test.ts  tags do not replace MIME checks

  `IO-0118`     P1         §225     `TESTED`   packages/buyer-experience/src/buyer-asset-choice.ts  buyer-asset-choice.test.ts  a buyer can reuse an owned asset and cannot use someone else's

  `IO-0119`     P1         §225     `TESTED`   packages/buyer-experience/src/buyer-asset-validation.ts  buyer-asset-validation.test.ts  buyer must own the asset

  `IO-0120`     P1         §225     `TESTED`   packages/buyer-experience/src/buyer-asset-validation.ts  buyer-asset-validation.test.ts  another user's asset id is rejected

  `IO-0121`     P1         §226     `TESTED`   packages/marketplace-agent/src/asset-grant.ts  agent-safety.test.ts  cross-job read grant

  `IO-0122`     P1         §226     `TESTED`   packages/marketplace-agent/src/asset-grant.ts  agent-safety.test.ts  grant references the asset, no copy

  `IO-0123`     P1         §226     `TESTED`   packages/marketplace-agent/src/asset-grant.ts  agent-safety.test.ts  grant is one asset and one target job

  `IO-0124`     P1         §226     `TESTED`   packages/marketplace-agent/src/asset-grant.ts  agent-safety.test.ts  other assets stay unauthorized

  `PRD-0192`    P1         §227     `TESTED`   packages/buyer-experience/src/privacy-disclosure.ts  privacy-disclosure.test.ts  sensitive input warning

  `PRD-0193`    P2         §227     `TESTED`   packages/buyer-experience/src/privacy-disclosure.ts  privacy-disclosure.test.ts  files processed on seller computer

  `PRD-0194`    P2         §227     `TESTED`   packages/buyer-experience/src/privacy-disclosure.ts  privacy-disclosure.test.ts  warning before confidential data

  `PRD-0195`    P2         §227     `TESTED`   packages/buyer-experience/src/privacy-disclosure.ts  privacy-disclosure.test.ts  not confidential computing

  `IO-0125`     P1         §228     `TESTED`   packages/buyer-experience/src/retention-ux.ts  retention-ux.test.ts  the job page states retention and the worker deletes local input

  `IO-0126`     P1         §228     `TESTED`   packages/buyer-experience/src/retention-ux.ts  retention-ux.test.ts  job page retention policy

  `IO-0127`     P1         §228     `TESTED`   packages/openclaw-adapter/src/job-paths.ts  job-paths.test.ts  local buyer input is deleted after the job

  `PRD-0196`    P1         §229     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PRD-0197`    P2         §229     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `IO-0128`     P1         §230     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `IO-0129`     P1         §230     `TESTED`   packages/marketplace/src/seller-test-case.ts  seller-test-case.test.ts  seller test cases, max 10

  `TST-0019`    P1         §231     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `PAY-0078`    P1         §232     `TESTED`   packages/billing/src/fixed-price.ts  fixed-price.test.ts  job price ignores image count and file size

  `PAY-0079`    P0         §232     `TESTED`   packages/billing/src/fixed-price.ts  fixed-price.test.ts  MVP price stays fixed per job

  `PAY-0080`    P0         §232     `TESTED`   packages/billing/src/fixed-price.ts  fixed-price.test.ts  contract dimensions do not change the charged price

  `PRD-0198`    P1         §233     `TESTED`   packages/marketplace/src/contract-match.ts  contract-match.test.ts  a Blender description does not accept a blend file

  `PRD-0199`    P2         §233     `TESTED`   packages/marketplace/src/agent-ranking.ts  contract-rank.test.ts  contract filter before ranking

  `PRD-0200`    P2         §233     `TESTED`   packages/marketplace/src/agent-ranking.ts  contract-rank.test.ts  text-only capability excluded for a file request

  `PRD-0201`    P2         §233     `TESTED`   packages/marketplace/src/agent-ranking.ts  contract-rank.test.ts  file compatibility is a hard filter

  `IO-0130`     P1         §234     `TESTED`   packages/marketplace/src/contract-card.ts  contract-card.test.ts  cards show input and output kinds

  `IO-0131`     P1         §235     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `IO-0132`     P1         §235     `TESTED`   packages/job-io/src/validate-buyer-input.ts  validate-buyer-input.test.ts  an optional field can be omitted

  `PRD-0202`    P1         §236     `TESTED`   packages/marketplace/src/public-capability.ts  public-capability.test.ts  a buyer sees the service contract, not the seller OpenClaw setup

  `PRD-0203`    P2         §236     `TESTED`   packages/marketplace/src/public-capability.ts  public-capability.test.ts  buyer view omits OpenClaw internals

  `PRD-0204`    P1         §237     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0205`    P2         §237     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0206`    P2         §237     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0207`    P2         §237     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0208`    P2         §237     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0209`    P1         §238     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0210`    P2         §238     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0211`    P2         §238     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0212`    P2         §238     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0070`    P1         §239     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0071`    P0         §239     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0072`    P0         §239     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0213`    P1         §240     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0214`    P1         §241     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0215`    P2         §241     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0216`    P2         §241     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `UI-0023`     P1         §242     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0073`    P1         §243     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0074`    P0         §243     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0075`    P0         §243     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0217`    P1         §244     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0218`    P2         §244     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0219`    P2         §244     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0220`    P1         §245     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0221`    P2         §245     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0222`    P2         §245     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0223`    P2         §245     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0224`    P1         §246     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `CAP-0063`    P1         §247     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `CAP-0064`    P1         §247     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0076`    P1         §248     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0077`    P0         §248     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0225`    P1         §249     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0226`    P2         §249     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0227`    P2         §249     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `IO-0133`     P1         §250     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `IO-0134`     P1         §250     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `IO-0135`     P1         §250     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0228`    P1         §251     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0229`    P2         §251     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0230`    P2         §251     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0078`    P1         §252     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0079`    P0         §252     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0080`    P0         §252     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0081`    P0         §252     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0231`    P1         §253     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0232`    P2         §253     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0233`    P1         §254     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0234`    P2         §254     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0235`    P1         §255     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0236`    P1         §256     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0237`    P1         §257     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0238`    P2         §257     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0239`    P1         §258     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0240`    P1         §259     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0241`    P2         §259     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0242`    P1         §260     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0243`    P2         §260     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0244`    P2         §260     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0245`    P1         §261     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0246`    P2         §261     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0247`    P2         §261     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0248`    P1         §262     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0249`    P2         §262     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0250`    P2         §262     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `API-0005`    P1         §263     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `API-0006`    P1         §263     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `API-0007`    P1         §263     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0251`    P1         §264     `DEFERRED`   packages/research-broker   ---        cloud/isolated browser research post-MVP (§264); search+fetch MVP M06

  `PRD-0252`    P2         §264     `DEFERRED`   packages/research-broker   ---        cloud/isolated browser research post-MVP (§264); search+fetch MVP M06

  `PRD-0253`    P1         §265     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0254`    P2         §265     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0255`    P2         §265     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0256`    P2         §265     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0257`    P2         §265     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0082`    P1         §266     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0083`    P0         §266     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0084`    P0         §266     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0258`    P1         §267     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0259`    P2         §267     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0085`    P1         §268     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0086`    P0         §268     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0087`    P0         §268     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0260`    P1         §269     `PARTIAL`   packages/research-broker   vitest   local hardened broker MVP; cloud egress deployment post-M06 M06

  `PRD-0261`    P2         §269     `PARTIAL`   packages/research-broker   vitest   local hardened broker MVP; cloud egress deployment post-M06 M06

  `PRD-0262`    P2         §269     `PARTIAL`   packages/research-broker   vitest   local hardened broker MVP; cloud egress deployment post-M06 M06

  `PRD-0263`    P2         §269     `PARTIAL`   packages/research-broker   vitest   local hardened broker MVP; cloud egress deployment post-M06 M06

  `PRD-0264`    P1         §270     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0265`    P2         §270     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0266`    P1         §271     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0267`    P2         §271     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `CAP-0065`    P1         §272     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `CAP-0066`    P1         §272     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0088`    P1         §273     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0089`    P0         §273     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0268`    P1         §274     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0269`    P2         §274     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0270`    P1         §275     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0271`    P2         §275     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0272`    P2         §275     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0273`    P1         §276     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0274`    P2         §276     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0275`    P2         §276     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `PRD-0276`    P2         §276     `TESTED`   packages/research-broker, packages/contracts/research-policy.ts, packages/platform-policy/research-ceilings.ts   vitest; scripts/verify-m06-flow.mjs   docs/milestones/M06-manual-validation.md M06

  `SEC-0090`    P1         §277     `TESTED`   packages/contracts/src/research-policy.ts  research-policy.test.ts  network access is the smallest declared primitive

  `SEC-0091`    P0         §277     `TESTED`   packages/platform-policy/src/network-purpose.ts  network-purpose.test.ts  minimum network for the declared purpose

  `PRD-0277`    P1         §278     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0278`    P2         §278     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0279`    P2         §278     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0280`    P1         §279     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0281`    P2         §279     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0282`    P2         §279     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0283`    P2         §279     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0284`    P1         §280     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0285`    P2         §280     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0286`    P2         §280     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0287`    P1         §281     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0288`    P2         §281     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0289`    P2         §281     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0081`    P1         §282     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0082`    P0         §282     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0083`    P0         §282     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts, apps/api/routes/platform-admin.ts   vitest; security/tests/m08-payment-db.test.ts; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0290`    P1         §283     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0291`    P2         §283     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0292`    P1         §284     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0293`    P1         §285     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0294`    P2         §285     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0295`    P1         §286     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0296`    P1         §287     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0297`    P2         §287     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0298`    P2         §287     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0299`    P2         §287     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0084`    P1         §288     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0085`    P0         §288     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0086`    P0         §288     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0087`    P0         §288     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0088`    P0         §288     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0089`    P1         §289     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0090`    P0         §289     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0091`    P0         §289     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0092`    P1         §290     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0093`    P0         §290     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0094`    P0         §290     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0095`    P0         §290     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0300`    P1         §291     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0301`    P2         §291     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0302`    P1         §292     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0303`    P2         §292     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0096`    P1         §293     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0097`    P0         §293     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0304`    P1         §294     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0305`    P2         §294     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0306`    P1         §295     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0307`    P2         §295     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0098`    P1         §296     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0099`    P0         §296     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0100`    P0         §296     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PAY-0101`    P0         §296     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0308`    P1         §297     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0309`    P2         §297     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0310`    P2         §297     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0311`    P2         §297     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0312`    P2         §297     `TESTED`   packages/billing, apps/api/routes/buyer-billing.ts, apps/api/routes/buyer-jobs-submit.ts, apps/api/routes/seller-billing.ts, apps/api/routes/stripe-webhooks.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08

  `PRD-0313`    P1         §298     `TESTED`   packages/billing/src/pricing-principle.test.ts, packages/billing/src/buyer-billing-read.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08 §298 pricing principle

  `PRD-0314`    P2         §298     `TESTED`   packages/billing/src/pricing-principle.test.ts, packages/billing/src/buyer-billing-read.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08 §298 pricing principle

  `PRD-0315`    P2         §298     `TESTED`   packages/billing/src/pricing-principle.test.ts, packages/billing/src/buyer-billing-read.ts   vitest; scripts/verify-m08-flow.mjs   docs/milestones/M08-manual-validation.md M08 §298 pricing principle

  `SEC-0092`    P1         §299      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0093`    P0         §299      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0094`    P0         §299      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0095`    P0         §299      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0096`    P0         §299      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0097`    P0         §299      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0098`    P1         §300      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0067`    P1         §301      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0068`    P1         §301      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0069`    P1         §301      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0070`    P1         §301      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0099`    P1         §302      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0100`    P0         §302      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0101`    P0         §302      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0102`    P1         §303      `TESTED`   docs/WORKER_MANIFEST.md vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0103`    P0         §303      `TESTED`   docs/WORKER_MANIFEST.md vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0104`    P0         §303      `TESTED`   docs/WORKER_MANIFEST.md vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0105`    P1         §304      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `SEC-0106`    P0         §304      `TESTED`   packages/contracts/permission-manifest.ts vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0071`    P1         §305      `TESTED`   prisma CapabilityVersion vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0072`    P1         §305      `TESTED`   prisma CapabilityVersion vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0073`    P1         §306      `TESTED`   prisma CapabilityVersion JSON snapshots vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0074`    P1         §306      `TESTED`   prisma CapabilityVersion JSON snapshots vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0075`    P1         §306      `TESTED`   prisma CapabilityVersion JSON snapshots vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0076`    P1         §307      `TESTED`   prisma CapabilityVersion immutability vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0077`    P1         §307      `TESTED`   prisma CapabilityVersion immutability vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0078`    P1         §307      `TESTED`   prisma CapabilityVersion immutability vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0079`    P1         §308      `TESTED`   packages/contracts/job-snapshot.ts, prisma Job vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0080`    P1         §308      `TESTED`   packages/contracts/job-snapshot.ts, prisma Job vitest; docs/milestones/M01-manual-validation.md M01

  `CAP-0081`    P1         §309      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0082`    P1         §309      `TESTED`   packages/capability-publish, @kivro/storage vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0083`    P1         §310      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `SEC-0107`    P1         §311      `TESTED`   packages/capability-publish, scripts/verify-m03-flow.mjs vitest   vitest   docs/milestones/M03-manual-validation.md M03

  `CAP-0084`    P1         §312     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0085`    P1         §312     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `TST-0020`    P1         §313     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0316`    P1         §314     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0317`    P2         §314     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0318`    P1         §315     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0319`    P2         §315     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0086`    P1         §316     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `JOB-0066`    P1         §317     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `JOB-0067`    P1         §317     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0320`    P1         §318     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0321`    P2         §318     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0322`    P2         §318     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `API-0008`    P1         §319     `TESTED`   apps/api/src/routes/buyer-api-keys.ts, packages/buyer-api/src/api-key-service.ts, packages/buyer-api/src/api-key-crypto.ts, packages/buyer-api/src/api-key-audit.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 buyer API keys

  `API-0009`    P1         §319     `TESTED`   apps/api/src/routes/buyer-api-keys.ts, packages/buyer-api/src/api-key-service.ts, packages/buyer-api/src/api-key-crypto.ts, packages/buyer-api/src/api-key-audit.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 buyer API keys

  `API-0010`    P1         §319     `TESTED`   packages/buyer-api/src/api-key-crypto.ts, packages/buyer-api/src/rate-limit.ts, packages/buyer-api/src/api-key-audit.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API key security §321

  `API-0011`    P1         §319     `TESTED`   packages/buyer-api/src/api-key-crypto.ts, packages/buyer-api/src/rate-limit.ts, packages/buyer-api/src/api-key-audit.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API key security §321

  `API-0012`    P1         §320     `TESTED`   packages/buyer-api/src/scopes.ts, apps/api/src/routes/buyer-api-keys.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API scopes §320

  `API-0013`    P1         §320     `TESTED`   packages/buyer-api/src/scopes.ts, apps/api/src/routes/buyer-api-keys.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API scopes §320

  `API-0014`    P1         §320     `TESTED`   packages/buyer-api/src/scopes.ts, apps/api/src/routes/buyer-api-keys.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API scopes §320

  `API-0015`    P1         §321     `TESTED`   packages/buyer-api/src/api-key-crypto.ts, packages/buyer-api/src/rate-limit.ts, packages/buyer-api/src/api-key-audit.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API key security §321

  `API-0016`    P1         §321     `TESTED`   packages/buyer-api/src/api-key-crypto.ts, packages/buyer-api/src/rate-limit.ts, packages/buyer-api/src/api-key-audit.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API key security §321

  `IO-0136`     P1         §322     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/capability-publish/src/buyer-stored-asset.ts   docs/milestones/M13-manual-validation.md M13 v1 asset upload intents §322

  `IO-0137`     P1         §322     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/capability-publish/src/buyer-stored-asset.ts   docs/milestones/M13-manual-validation.md M13 v1 asset upload intents §322

  `CAP-0087`    P1         §323     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/services/v1-buyer-response.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit §323–§324

  `PAY-0102`    P1         §324     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/services/v1-buyer-response.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit §323–§324

  `PAY-0103`    P0         §324     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/services/v1-buyer-response.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit §323–§324

  `PAY-0104`    P0         §324     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/services/v1-buyer-response.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit §323–§324

  `PAY-0105`    P0         §324     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/services/v1-buyer-response.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit §323–§324

  `API-0017`    P1         §325     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/services/v1-buyer-response.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit §323–§324

  `API-0018`    P1         §325     `TESTED`   packages/buyer-api/src/idempotency.ts, apps/api/src/routes/v1-buyer-api.ts   packages/buyer-api/src/idempotency.test.ts   docs/milestones/M13-manual-validation.md M13 Idempotency-Key §325

  `API-0019`    P1         §325     `TESTED`   packages/buyer-api/src/rate-limit.ts, apps/api/src/middleware/buyer-api-auth.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API rate limits §326

  `API-0020`    P1         §326     `TESTED`   packages/buyer-api/src/rate-limit.ts, apps/api/src/middleware/buyer-api-auth.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API rate limits §326

  `API-0021`    P1         §326     `TESTED`   packages/buyer-api/src/rate-limit.ts, apps/api/src/middleware/buyer-api-auth.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API rate limits §326

  `PRD-0323`    P1         §327     `TESTED`   apps/api/src/routes/buyer-webhooks-manage.ts, packages/buyer-webhooks/src/endpoint-service.ts   docs/milestones/M13-manual-validation.md M13 webhook registration §329

  `JOB-0068`    P1         §328     `TESTED`   apps/api/src/services/buyer-webhook-emitter.ts, apps/api/src/routes/worker-jobs.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 webhook events §328

  `JOB-0069`    P1         §328     `TESTED`   apps/api/src/services/buyer-webhook-emitter.ts, apps/api/src/routes/worker-jobs.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 webhook events §328

  `API-0022`    P1         §329     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `JOB-0070`    P1         §330     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `JOB-0071`    P1         §330     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `PRD-0324`    P1         §331     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `PRD-0325`    P2         §331     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `PRD-0326`    P1         §332     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `PRD-0327`    P2         §332     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `PRD-0328`    P2         §332     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `AVL-0003`    P1         §333     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `API-0023`    P1         §334     `TESTED`   apps/api/src/routes/buyer-api-keys.ts, packages/buyer-api/src/api-key-service.ts, packages/buyer-api/src/api-key-crypto.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 buyer API keys

  `API-0024`    P1         §334     `TESTED`   apps/api/src/routes/buyer-api-keys.ts, packages/buyer-api/src/api-key-service.ts, packages/buyer-api/src/api-key-crypto.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 buyer API keys

  `API-0025`    P1         §334     `TESTED`   apps/api/src/routes/buyer-api-keys.ts, packages/buyer-api/src/api-key-service.ts, packages/buyer-api/src/api-key-crypto.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 buyer API keys

  `API-0026`    P1         §335     `TESTED`   apps/api/src/routes/buyer-api-keys.ts, packages/buyer-api/src/api-key-service.ts, packages/buyer-api/src/api-key-crypto.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 buyer API keys

  `API-0027`    P1         §335     `TESTED`   apps/api/src/routes/buyer-api-keys.ts, packages/buyer-api/src/api-key-service.ts, packages/buyer-api/src/api-key-crypto.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 buyer API keys

  `JOB-0072`    P1         §336     `TESTED`   packages/buyer-api/src/idempotency.ts, apps/api/src/routes/v1-buyer-api.ts   packages/buyer-api/src/idempotency.test.ts   docs/milestones/M13-manual-validation.md M13 Idempotency-Key

  `JOB-0073`    P1         §336     `TESTED`   packages/buyer-api/src/idempotency.ts, apps/api/src/routes/v1-buyer-api.ts   packages/buyer-api/src/idempotency.test.ts   docs/milestones/M13-manual-validation.md M13 Idempotency-Key

  `AVL-0004`    P1         §337     `TESTED`   packages/buyer-api/src/rate-limit.ts, apps/api/src/middleware/buyer-api-auth.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API rate limits

  `AVL-0005`    P1         §337     `TESTED`   packages/buyer-api/src/rate-limit.ts, apps/api/src/middleware/buyer-api-auth.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API rate limits

  `JOB-0074`    P1         §338     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `JOB-0075`    P1         §338     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `JOB-0076`    P1         §338     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `JOB-0077`    P1         §339     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `JOB-0078`    P1         §339     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `JOB-0079`    P1         §339     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `AVL-0006`    P1         §340     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0007`    P1         §340     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0008`    P1         §340     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0009`    P1         §340     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `JOB-0080`    P1         §341     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `JOB-0081`    P1         §341     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `JOB-0082`    P1         §342     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `PRD-0329`    P1         §343     `TESTED`   packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks

  `PRD-0330`    P2         §343     `TESTED`   packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks

  `JOB-0083`    P1         §344     `TESTED`   packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks

  `JOB-0084`    P1         §344     `TESTED`   packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks

  `PAY-0106`    P1         §345     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `PAY-0107`    P0         §345     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `PAY-0108`    P0         §345     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `WRK-0099`    P1         §346     `TESTED`   packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks

  `WRK-0100`    P1         §346     `TESTED`   packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks

  `AVL-0010`    P1         §347     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0011`    P1         §347     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0012`    P1         §347     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0013`    P1         §347     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0014`    P1         §347     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0015`    P1         §348     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0016`    P1         §348     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `UI-0024`     P1         §349     `TESTED`   apps/web/src/app/settings/api-keys/page.tsx, apps/web/src/app/settings/webhooks/page.tsx, apps/web/src/lib/kivro-api.ts   docs/milestones/M14-manual-validation.md M14 developer settings §349

  `UI-0025`     P2         §349     `TESTED`   apps/web/src/app/settings/api-keys/page.tsx, apps/web/src/app/settings/webhooks/page.tsx, apps/web/src/lib/kivro-api.ts   docs/milestones/M14-manual-validation.md M14 developer settings §349

  `AVL-0017`    P1         §350     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0018`    P1         §350     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `CAP-0088`    P1         §351     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `CAP-0089`    P1         §351     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, apps/api/src/middleware/buyer-api-auth.ts, packages/buyer-api   packages/buyer-api/src/idempotency.test.ts; security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 REST v1 Bearer API

  `JOB-0085`    P1         §352     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `JOB-0086`    P1         §352     `TESTED`   apps/api/src/services/create-buyer-job.ts, apps/api/src/routes/v1-buyer-api.ts   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 API job submit

  `JOB-0087`    P1         §353     `TESTED`   packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks

  `JOB-0088`    P1         §353     `TESTED`   packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks

  `JOB-0089`    P1         §353     `TESTED`   packages/buyer-webhooks, apps/api/src/routes/buyer-webhooks-manage.ts, apps/api/src/services/buyer-webhook-emitter.ts   packages/buyer-webhooks/src/signing.test.ts; packages/buyer-webhooks/src/url-validation.test.ts   docs/milestones/M13-manual-validation.md M13 signed webhooks

  `AVL-0019`    P1         §354     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `AVL-0020`    P1         §354     `TESTED`   apps/api/src/routes/v1-buyer-api.ts, packages/job-scheduling   security/tests/acceptance-m13.test.ts   docs/milestones/M13-manual-validation.md M13 v1 availability snapshot

  `CAP-0090`    P1         §355     `TODO`   ---              ---        scheduled:M28 per IMPLEMENTATION-PLAN; M23 audit accounted

  `CAP-0091`    P1         §355     `TESTED`   packages/job-scheduling/src/accepting-jobs.ts  accepting-jobs.test.ts  offline capability is not accepting

  `CAP-0092`    P1         §355     `TESTED`   packages/job-scheduling/src/accepting-jobs.ts  accepting-jobs.test.ts  paused capability is not accepting

  `CAP-0093`    P1         §355     `TESTED`   packages/job-scheduling/src/accepting-jobs.ts  accepting-jobs.test.ts  a full slot is not overbooked

  `CAP-0094`    P1         §355     `TESTED`   packages/job-scheduling/src/dependency-isolation.ts  dependency-isolation.test.ts  a failed dependency changes only the capability that declared it

  `PRD-0331`    P1         §356     `TESTED`   packages/marketplace/src/service-contract.ts  service-contract.test.ts  one capability carries identity, version, permissions, price, and availability

  `PRD-0332`    P2         §356     `TESTED`   packages/marketplace/src/service-contract.ts  service-contract.test.ts  arbitrary seller-network control is not a service primitive

  `CAP-0095`    P1         §357     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0096`    P1         §357     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0097`    P1         §357     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0098`    P1         §358     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0099`    P1         §358     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0100`    P1         §358     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0101`    P1         §359     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0333`    P1         §360     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0334`    P2         §360     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0335`    P2         §360     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `IO-0138`     P1         §361     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `IO-0139`     P1         §361     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0102`    P1         §362     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0103`    P1         §362     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0104`    P1         §362     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0336`    P1         §363     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0337`    P2         §363     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0338`    P2         §363     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0339`    P2         §363     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `IO-0140`     P1         §364     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `IO-0141`     P1         §364     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `IO-0142`     P1         §364     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0105`    P1         §365     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0106`    P1         §365     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0107`    P1         §365     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0108`    P1         §365     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0340`    P1         §366     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0341`    P2         §366     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `IO-0143`     P1         §367     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `IO-0144`     P1         §367     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0109`    P1         §368     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `OBS-0007`    P1         §369      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `OBS-0008`    P2         §369      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `OBS-0009`    P2         §369      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `OBS-0010`    P2         §369      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0101`    P1         §370      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0102`    P1         §370      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `CAP-0110`    P1         §371      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `CAP-0111`    P1         §371      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `CAP-0112`    P1         §371      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `CAP-0113`    P1         §371      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `WRK-0103`    P1         §372      `TESTED`   apps/worker, packages/openclaw-adapter   vitest   docs/milestones/M02-manual-validation.md M02

  `SEC-0108`    P1         §373     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `SEC-0109`    P0         §373     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `SEC-0110`    P0         §373     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `WRK-0104`    P1         §374     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `WRK-0105`    P1         §374     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `JOB-0090`    P1         §375     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `JOB-0091`    P1         §375     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `JOB-0092`    P1         §375     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `JOB-0093`    P1         §375     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `OBS-0011`    P1         §376     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `SEC-0111`    P1         §377     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `SEC-0112`    P0         §377     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `SEC-0113`    P1         §378     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `SEC-0114`    P0         §378     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `SEC-0115`    P0         §378     `TESTED`   packages/seller-health, apps/api/src/routes/seller-dashboard.ts, apps/api/src/routes/worker-health.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/security-warnings.test.ts; security/tests/acceptance-m12.test.ts; scripts/verify-m12-flow.mjs   docs/milestones/M12-manual-validation.md M12 seller health dashboard foundation

  `WRK-0106`    P1         §379     `TESTED`   apps/worker/src/cli.ts, apps/api/src/routes/worker-health.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md kivro-worker health

  `WRK-0107`    P1         §379     `TESTED`   apps/worker/src/cli.ts, apps/api/src/routes/worker-health.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md kivro-worker health

  `WRK-0108`    P1         §380     `TESTED`   apps/worker/src/cli.ts, apps/api/src/routes/worker-health.ts   packages/seller-health/src/marketplace-control.test.ts   docs/milestones/M12-manual-validation.md kivro-worker health/doctor

  `WRK-0109`    P1         §381     `TESTED`   apps/api/src/services/worker-heartbeat-service.ts, apps/api/src/routes/seller-dashboard.ts   packages/seller-health/src/health-history.ts   docs/milestones/M12-manual-validation.md M12 health timeline retention

  `WRK-0110`    P1         §381     `TESTED`   apps/api/src/services/worker-heartbeat-service.ts, apps/api/src/routes/seller-dashboard.ts   packages/seller-health/src/health-history.ts   docs/milestones/M12-manual-validation.md M12 health timeline retention

  `WRK-0111`    P1         §381     `TESTED`   apps/api/src/services/worker-heartbeat-service.ts, apps/api/src/routes/seller-dashboard.ts   packages/seller-health/src/health-history.ts   docs/milestones/M12-manual-validation.md M12 health timeline retention

  `JOB-0094`    P1         §382     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0095`    P1         §382     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0096`    P1         §383     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0097`    P1         §383     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0098`    P1         §384     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0099`    P1         §384     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0100`    P1         §384     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0101`    P1         §385     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0102`    P1         §385     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0103`    P1         §385     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause web+CLI

  `JOB-0104`    P1         §386     `TESTED`   apps/api/src/routes/worker-jobs.ts, apps/api/src/services/worker-heartbeat-service.ts, packages/seller-health/src/marketplace-control.ts   packages/seller-health/src/marketplace-control.test.ts   docs/milestones/M12-manual-validation.md M12 cloud/local pause sync

  `JOB-0105`    P1         §387     `TESTED`   apps/api/src/routes/worker-jobs.ts, apps/api/src/services/worker-heartbeat-service.ts, packages/seller-health/src/marketplace-control.ts   packages/seller-health/src/marketplace-control.test.ts   docs/milestones/M12-manual-validation.md M12 cloud/local pause sync

  `JOB-0106`    P1         §388     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts, packages/job-scheduling/src/marketplace-availability.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause propagation

  `JOB-0107`    P1         §388     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts, packages/job-scheduling/src/marketplace-availability.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause propagation

  `JOB-0108`    P1         §388     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts, packages/job-scheduling/src/marketplace-availability.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause propagation

  `JOB-0109`    P1         §388     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts, packages/job-scheduling/src/marketplace-availability.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause propagation

  `JOB-0110`    P1         §389     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts, packages/job-scheduling/src/marketplace-availability.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause propagation

  `JOB-0111`    P1         §389     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts, packages/job-scheduling/src/marketplace-availability.ts, apps/worker/src/cli.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 emergency pause propagation

  `JOB-0112`    P1         §390     `TESTED`   apps/api/src/services/seller-resume-readiness.ts, apps/api/src/routes/seller-dashboard.ts   security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 resume security gate

  `JOB-0113`    P1         §391     `TESTED`   packages/seller-health, apps/api/src/services/seller-health-dashboard.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/capability-health.test.ts; security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 seller health dashboard

  `JOB-0114`    P1         §391     `TESTED`   packages/seller-health, apps/api/src/services/seller-health-dashboard.ts, apps/web/src/app/seller/dashboard   packages/seller-health/src/capability-health.test.ts; security/tests/acceptance-m12.test.ts   docs/milestones/M12-manual-validation.md M12 seller health dashboard

  `PRD-0342`    P1         §392     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts   docs/milestones/M12-manual-validation.md M12 pause audit payload

  `PRD-0343`    P2         §392     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts   docs/milestones/M12-manual-validation.md M12 pause audit payload

  `PRD-0344`    P2         §392     `TESTED`   apps/api/src/services/seller-emergency-pause.ts, apps/api/src/services/sync-worker-local-pause.ts   docs/milestones/M12-manual-validation.md M12 pause audit payload

  `SEC-0116`    P1         §393     `TESTED`   apps/api/src/services/platform-security-pause-service.ts, packages/seller-health/src/platform-security.ts, apps/api/src/services/worker-heartbeat-service.ts   packages/seller-health/src/platform-security.test.ts; security/tests/acceptance-m12.test.ts   docs/milestones/M12-closure.md M12 §393 platform security pause

  `SEC-0117`    P0         §393     `TESTED`   apps/api/src/services/platform-security-pause-service.ts, packages/seller-health/src/platform-security.ts, apps/api/src/services/worker-heartbeat-service.ts   packages/seller-health/src/platform-security.test.ts; security/tests/acceptance-m12.test.ts   docs/milestones/M12-closure.md M12 §393 platform security pause

  `SEC-0118`    P0         §393     `TESTED`   apps/api/src/services/platform-security-pause-service.ts, packages/seller-health/src/platform-security.ts, apps/api/src/services/worker-heartbeat-service.ts   packages/seller-health/src/platform-security.test.ts; security/tests/acceptance-m12.test.ts   docs/milestones/M12-closure.md M12 §393 platform security pause

  `JOB-0115`    P1         §394     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0116`    P1         §394     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0117`    P1         §394     `TESTED`   packages/marketplace/src/buyer-timing-copy.ts  buyer-timing-copy.test.ts  security pause cannot be cleared by buyer or seller

  `PRD-0345`    P1         §395     `TESTED`   packages/seller-health/src/operational-control.ts  operational-control.test.ts  seller can see health, queue, failures, and stop accepting

  `PRD-0346`    P2         §395     `TESTED`   packages/seller-health/src/operational-control.ts  operational-control.test.ts  operational answers stay available to the seller

  `PRD-0347`    P2         §395     `TESTED`   packages/seller-health/src/operational-control.ts  operational-control.test.ts  health, version, isolation, queue, and warnings are answerable

  `PRD-0348`    P2         §395     `TESTED`   packages/seller-health/src/operational-control.ts  operational-control.test.ts  the seller can stop accepting locally and from the web dashboard

  `PRD-0349`    P1         §396     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0350`    P2         §396     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0021`    P1         §397     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0022`    P1         §398     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0023`    P1         §398     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0024`    P1         §399     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0025`    P1         §399     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0026`    P1         §399     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `UI-0026`     P1         §400     `TESTED`   apps/web/src/app/capabilities/[slug]/page.tsx, apps/web/src/app/capabilities/[slug]/run/page.tsx, apps/api/src/routes/capability-availability.ts   pnpm verify:m10   M10 buyer scheduling UX on run/detail

  `UI-0027`     P2         §400     `TESTED`   apps/web/src/app/capabilities/[slug]/page.tsx, apps/web/src/app/capabilities/[slug]/run/page.tsx, apps/api/src/routes/capability-availability.ts   pnpm verify:m10   M10 buyer scheduling UX on run/detail

  `AVL-0027`    P1         §401     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0028`    P1         §401     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0029`    P1         §402     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0030`    P1         §402     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0031`    P1         §402     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0032`    P1         §403     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0033`    P1         §404     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0034`    P1         §404     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0035`    P1         §405     `TESTED`   apps/web/src/app/capabilities/[slug]/page.tsx, apps/web/src/app/capabilities/[slug]/run/page.tsx, apps/api/src/routes/capability-availability.ts   pnpm verify:m10   M10 buyer scheduling UX on run/detail

  `AVL-0036`    P1         §405     `TESTED`   apps/web/src/app/capabilities/[slug]/page.tsx, apps/web/src/app/capabilities/[slug]/run/page.tsx, apps/api/src/routes/capability-availability.ts   pnpm verify:m10   M10 buyer scheduling UX on run/detail

  `AVL-0037`    P1         §406     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0038`    P1         §406     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0118`    P1         §407     `TESTED`   apps/web/src/app/capabilities/[slug]/page.tsx, apps/web/src/app/capabilities/[slug]/run/page.tsx, apps/api/src/routes/capability-availability.ts   pnpm verify:m10   M10 buyer scheduling UX on run/detail

  `JOB-0119`    P1         §407     `TESTED`   apps/web/src/app/capabilities/[slug]/page.tsx, apps/web/src/app/capabilities/[slug]/run/page.tsx, apps/api/src/routes/capability-availability.ts   pnpm verify:m10   M10 buyer scheduling UX on run/detail

  `JOB-0120`    P1         §408     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0121`    P1         §408     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0122`    P1         §408     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0123`    P1         §408     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0124`    P1         §408     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0125`    P1         §408     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0126`    P1         §409     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0127`    P1         §409     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0128`    P1         §409     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0039`    P1         §410     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0040`    P1         §410     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0041`    P1         §410     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0129`    P1         §411     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0130`    P1         §411     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0131`    P1         §412     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0132`    P1         §412     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0042`    P1         §413     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0043`    P1         §413     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0044`    P1         §413     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0351`    P1         §414     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0352`    P2         §414     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0045`    P1         §415     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0046`    P1         §415     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0047`    P1         §415     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0353`    P1         §416     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0354`    P2         §416     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0355`    P2         §416     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0048`    P1         §417     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0049`    P1         §418     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0050`    P1         §418     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0356`    P1         §419     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0357`    P2         §419     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0358`    P2         §419     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0051`    P1         §420     `TESTED`   packages/marketplace/src/schedule-purchase-policy.ts  schedule-purchase-policy.test.ts  public schedule omits weekly windows

  `AVL-0052`    P1         §420     `TESTED`   packages/marketplace/src/schedule-purchase-policy.ts  schedule-purchase-policy.test.ts  buyers see next window only

  `PRD-0359`    P1         §421     `TESTED`   packages/marketplace/src/schedule-purchase-policy.ts  schedule-purchase-policy.test.ts  weekly hours stay private unless the seller publishes them

  `JOB-0133`    P1         §422     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0134`    P1         §422     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `AVL-0053`    P1         §423     `TESTED`   packages/job-scheduling/src/schedule-audit.ts  schedule-audit.test.ts  a schedule edit records seller, capability, timezone, and source

  `AVL-0054`    P1         §424     `TESTED`   packages/marketplace/src/schedule-acceptance.test.ts  schedule-acceptance.test.ts  weekly, weekend, pause, queue, audit, and agent timing follow the seller schedule

  `AVL-0055`    P1         §424     `TESTED`   packages/job-scheduling/src/weekly-schedule.ts  weekly-schedule.test.ts  seller can choose always available

  `AVL-0056`    P1         §424     `TESTED`   packages/job-scheduling/src/accepting-jobs.ts  accepting-jobs.test.ts  immediate purchase is blocked outside the schedule

  `AVL-0057`    P1         §424     `TESTED`   apps/api/src/services/create-buyer-job.ts  accepting-jobs.test.ts  the same gate blocks the API

  `AVL-0058`    P1         §424     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  job input cannot change the seller schedule

  `PRD-0360`    P1         §425     `TESTED`   packages/job-scheduling/src/availability-layers.ts  availability-layers.test.ts  availability layers

  `PRD-0361`    P2         §425     `TESTED`   packages/job-scheduling/src/availability-layers.ts  availability-layers.test.ts  visibility through capacity

  `PRD-0362`    P2         §425     `TESTED`   packages/job-scheduling/src/accepting-jobs.ts  accepting-jobs.test.ts  all layers must pass

  `PRD-0363`    P2         §425     `TESTED`   packages/job-scheduling/src/availability-layers.ts  availability-layers.test.ts  paused operator layer blocks acceptance

  `PRD-0364`    P2         §425     `TESTED`   packages/job-scheduling/src/accepting-jobs.ts  accepting-jobs.test.ts  seller machine stays under seller control

  `JOB-0135`    P1         §426     `TESTED`   apps/api/routes/seller-control-ui.ts, apps/api/routes/seller-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0136`    P1         §426     `TESTED`   apps/api/routes/seller-control-ui.ts, apps/api/routes/seller-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0137`    P1         §426     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0138`    P1         §427     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0139`    P1         §428     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0140`    P1         §428     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0141`    P1         §428     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0142`    P1         §428     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0143`    P1         §429     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0144`    P1         §429     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0145`    P1         §429     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0146`    P1         §430     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0147`    P1         §430     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0148`    P1         §430     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0149`    P1         §431     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0150`    P1         §431     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0151`    P1         §431     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0152`    P1         §431     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0153`    P1         §431     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0154`    P1         §431     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0155`    P1         §432     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0156`    P1         §432     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0157`    P1         §432     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0158`    P1         §432     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0159`    P1         §433     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0160`    P1         §433     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0161`    P1         §433     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0162`    P1         §433     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0163`    P1         §433     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0164`    P1         §434     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0165`    P1         §434     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0166`    P1         §434     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0167`    P1         §435     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0168`    P1         §435     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0169`    P1         §435     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0170`    P1         §435     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0171`    P1         §436     `TESTED`   apps/api/routes/seller-control-ui.ts, apps/api/routes/seller-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0172`    P1         §436     `TESTED`   apps/api/routes/seller-control-ui.ts, apps/api/routes/seller-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0173`    P1         §436     `TESTED`   apps/api/routes/seller-control-ui.ts, apps/api/routes/seller-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `PRD-0365`    P1         §437     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `PRD-0366`    P2         §437     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `PRD-0367`    P2         §437     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0174`    P1         §438     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0175`    P1         §438     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0176`    P1         §438     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0177`    P1         §439     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0178`    P1         §439     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0179`    P1         §440     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0180`    P1         §440     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0181`    P1         §441     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0182`    P1         §441     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0183`    P1         §441     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0184`    P1         §442     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0185`    P1         §442     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0186`    P1         §442     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0187`    P1         §443     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0188`    P1         §443     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0189`    P1         §443     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0190`    P1         §444     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0191`    P1         §444     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0192`    P1         §444     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0193`    P1         §444     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0194`    P1         §445     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0195`    P1         §445     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0196`    P1         §445     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0197`    P1         §446     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0198`    P1         §446     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0199`    P1         §447     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0200`    P1         §447     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0201`    P1         §447     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0202`    P1         §448     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0203`    P1         §449     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0204`    P1         §449     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0205`    P1         §449     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0206`    P1         §450     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0207`    P1         §450     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0208`    P1         §450     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0209`    P1         §450     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `JOB-0210`    P1         §450     `TESTED`   packages/job-control, packages/job-dispatch, packages/domain/job-status.ts, apps/api/routes/seller-jobs.ts, apps/api/routes/worker-jobs.ts   vitest; scripts/verify-m07-flow.mjs   docs/milestones/M07-manual-validation.md M07

  `AVL-0059`    P1         §451     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `AVL-0060`    P1         §451     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `AVL-0061`    P1         §451     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `AVL-0062`    P1         §452     `TESTED`   apps/web/src/app/capabilities/[slug]/page.tsx  schedule-purchase-policy.test.ts  Run now versus schedule

  `AVL-0063`    P1         §452     `TESTED`   packages/marketplace/src/schedule-purchase-policy.ts  schedule-purchase-policy.test.ts  future action is not labeled Run

  `JOB-0211`    P1         §453     `TESTED`   apps/web/src/app/capabilities/[slug]/run/page.tsx  schedule-purchase-policy.test.ts  reservation copy

  `JOB-0212`    P1         §453     `TESTED`   packages/marketplace/src/schedule-purchase-policy.ts  schedule-purchase-policy.test.ts  reserve now, execute at availability

  `JOB-0213`    P1         §454     `TESTED`   packages/marketplace/src/schedule-quote.ts  schedule-quote.test.ts  availability wait is shown separately from runtime

  `JOB-0214`    P1         §454     `TESTED`   apps/web/src/lib/status-ui.ts  status-ui.test.ts  approximate start delay

  `JOB-0215`    P1         §455     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0216`    P1         §455     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0217`    P1         §456     `TESTED`   packages/job-scheduling/src/scheduled-timing-record.ts  scheduled-timing-record.test.ts  the first window is kept when eligibility moves

  `JOB-0218`    P1         §457     `TESTED`   packages/marketplace/src/schedule-quote.ts  schedule-quote.test.ts  checkout quotes earliest eligibility, not a guaranteed start

  `JOB-0219`    P1         §457     `TESTED`   packages/marketplace/src/buyer-timing-copy.ts  buyer-timing-copy.test.ts  delivery after start is an estimate

  `JOB-0220`    P1         §458     `TESTED`   packages/marketplace/src/schedule-quote.ts  schedule-quote.test.ts  wording is eligible to start, not will start at

  `JOB-0221`    P1         §459     `TESTED`   packages/marketplace/src/schedule-quote.ts  schedule-quote.test.ts  delivery is a minute range, not a single second

  `JOB-0222`    P1         §459     `TESTED`   packages/marketplace/src/buyer-timing-copy.ts  buyer-timing-copy.test.ts  no second-level precision

  `PAY-0109`    P1         §460     `TESTED`   packages/marketplace/src/schedule-quote.ts  schedule-quote.test.ts  payment is secured now and execution waits for availability

  `PAY-0110`    P0         §460     `TESTED`   apps/web/src/app/capabilities/[slug]/run/page.tsx  buyer-timing-copy.test.ts  reserved credits are not settled revenue

  `UI-0028`     P1         §461     `TESTED`   packages/billing/src/card-auth-window.ts  card-auth-window.test.ts  card auth window

  `UI-0029`     P2         §461     `TESTED`   packages/billing/src/card-auth-window.ts  card-auth-window.test.ts  authorization is not open-ended

  `UI-0030`     P2         §461     `TESTED`   packages/billing/src/job-card-payment.ts  card-auth-window.test.ts  card only inside seven days

  `UI-0031`     P2         §461     `TESTED`   packages/billing/src/card-auth-window.ts  card-auth-window.test.ts  seven-day card authorization window

  `PRD-0368`    P1         §462     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0369`    P2         §462     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0064`    P1         §463     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0065`    P1         §463     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0223`    P1         §464     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0224`    P1         §464     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0225`    P1         §465     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0226`    P1         §466     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0227`    P1         §466     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0370`    P1         §467     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0371`    P2         §467     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0372`    P1         §468     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0373`    P2         §468     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0066`    P1         §469     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0374`    P1         §470     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `PRD-0375`    P2         §470     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0228`    P1         §471     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0229`    P1         §471     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0230`    P1         §471     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0067`    P1         §472     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0068`    P1         §472     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `AVL-0069`    P1         §472     `TESTED`   packages/job-scheduling, apps/api/routes/capability-availability.ts, apps/api/routes/seller-schedule.ts, apps/api/routes/buyer-jobs-submit.ts, packages/job-dispatch/src/dispatch-service.ts   vitest; scripts/verify-m09-flow.mjs   docs/milestones/M09-manual-validation.md M09

  `JOB-0231`    P1         §473     `TESTED`   packages/job-scheduling/src/window-overflow.ts  window-overflow.test.ts  running jobs continue; queued jobs roll or release

  `CAP-0114`    P1         §474     `TESTED`   packages/marketplace/src/schedule-quote.ts  schedule-quote.test.ts  the server returns the schedule quote used at checkout

  `AVL-0070`    P1         §475     `TESTED`   packages/buyer-experience/src/quote-freshness.ts  quote-freshness.test.ts  a moved window must be confirmed before charging

  `AVL-0071`    P1         §475     `TESTED`   packages/buyer-experience/src/quote-freshness.ts  quote-freshness.test.ts  expired quotes are not charged

  `PRD-0376`    P1         §476     `TESTED`   packages/marketplace/src/schedule-quote.ts  schedule-quote.test.ts  buyer times render in the buyer timezone

  `AVL-0072`    P1         §477     `TESTED`   packages/marketplace/src/schedule-quote.ts  schedule-quote.test.ts  cards distinguish available now, tonight, offline, and paused

  `AVL-0073`    P1         §478     `TESTED`   packages/marketplace/src/schedule-purchase-policy.ts  schedule-purchase-policy.test.ts  run, queue, schedule, and unavailable stay distinct

  `PRD-0377`    P1         §479     `TESTED`   packages/marketplace/src/scheduled-disclosure.ts  contract-rank.test.ts  a later service discloses eligibility and runtime

  `PRD-0378`    P2         §479     `TESTED`   packages/marketplace/src/scheduled-disclosure.ts  scheduled-disclosure.test.ts  the disclosure says the service is not available now

  `AGT-0098`    P1         §480     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  a future step waits only with an explicit deadline

  `AGT-0099`    P1         §480     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  a future step is an explicit wait

  `AGT-0100`    P1         §480     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  a wait without a deadline is blocked

  `AGT-0101`    P1         §480     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  a single capability may be scheduled; a plan waits only after approval

  `JOB-0232`    P1         §481     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0233`    P1         §481     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0234`    P1         §481     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0235`    P1         §482     `TESTED`   packages/buyer-webhooks/src/job-events.ts  job-events.test.ts  scheduled and expired jobs have their own webhook events

  `JOB-0236`    P1         §483     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0237`    P1         §483     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `JOB-0238`    P1         §483     `TESTED`   packages/job-scheduling/src/scheduled-timing-record.ts  scheduled-timing-record.test.ts  in-app notices skip minute ticks

  `JOB-0239`    P1         §483     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `PRD-0379`    P1         §484     `TESTED`   packages/seller-experience/src/scheduled-demand.ts  scheduled-demand.test.ts  seller sees reserved value apart from settled revenue

  `PRD-0380`    P2         §484     `TESTED`   apps/web/src/app/seller/economics/page.tsx  buyer-timing-copy.test.ts  reserved value is labeled separately from settled

  `PRD-0381`    P2         §484     `TESTED`   packages/marketplace/src/buyer-timing-copy.ts  buyer-timing-copy.test.ts  reserved value is not settled revenue

  `JOB-0240`    P1         §485     `TESTED`   packages/seller-experience/src/scheduled-demand.ts  scheduled-demand.test.ts  pause warns about waiting scheduled jobs and still proceeds

  `JOB-0241`    P1         §486     `TESTED`   packages/job-scheduling/src/scheduled-fairness.ts  scheduled-fairness.test.ts  a reservation is disclosed, bounded, cancellable, and ordered by creation time

  `JOB-0242`    P1         §486     `TESTED`   packages/billing/src/job-payment-hooks.ts  unstarted-release.test.ts  release if the job never starts

  `JOB-0243`    P1         §486     `TESTED`   packages/billing/src/job-payment-hooks.ts  unstarted-release.test.ts  wait deadline releases the reservation

  `PRD-0382`    P1         §487     `TESTED`   packages/marketplace/src/schedule-purchase-policy.ts  schedule-purchase-policy.test.ts  later supply stays visible with a separate start time

  `PRD-0383`    P2         §487     `TESTED`   packages/marketplace/src/schedule-purchase-policy.ts  schedule-purchase-policy.test.ts  a schedule does not hide the capability

  `AVL-0074`    P1         §488     `TESTED`   packages/marketplace/src/human-availability.ts  human-availability.test.ts  humans and agents use the same availability with different decisions

  `AVL-0075`    P1         §488     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  skip work outside the timing policy

  `AVL-0076`    P1         §488     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  immediate and recommendation modes differ

  `PRD-0384`    P1         §489     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `PRD-0385`    P2         §489     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `PRD-0386`    P2         §489     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `PRD-0387`    P2         §489     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `PRD-0388`    P1         §490     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0389`    P2         §490     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0390`    P2         §490     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `PRD-0391`    P2         §490     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0115`    P1         §491     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0116`    P1         §491     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0117`    P1         §491     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `CAP-0118`    P1         §491     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `AVL-0077`    P1         §492     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `AVL-0078`    P1         §492     `TESTED`   ---              ---        packages/marketplace/src/visibility.ts, packages/marketplace/src/capability-listing.ts, apps/api/src/services/capability-visibility.ts, apps/api/src/routes/seller-visibility.ts, apps/web/src/app/search/page.tsx   packages/marketplace/src/visibility.test.ts, packages/marketplace/src/capability-listing.test.ts   visibility, examples, availability filters

  `JOB-0244`    P1         §493     `TESTED`   packages/marketplace/src/buyer-timing-copy.ts  buyer-timing-copy.test.ts  checkout explains a reservation instead of an error

  `JOB-0245`    P1         §493     `TESTED`   apps/web/src/app/capabilities/[slug]/run/page.tsx  schedule-purchase-policy.test.ts  checkout switches to a reservation

  `JOB-0246`    P1         §493     `TESTED`   apps/web/src/app/capabilities/[slug]/run/page.tsx  schedule-purchase-policy.test.ts  scheduling is presented as a reservation, not an error

  `PRD-0392`    P1         §494     `TESTED`   packages/marketplace/src/agent-discovery.ts  agent-discovery.test.ts  execution defaults to services that can run now

  `PRD-0393`    P2         §494     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  autonomous mode excludes future services

  `AVL-0079`    P1         §495     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-discovery.test.ts  immediate ranking drops future-only services

  `AVL-0080`    P1         §495     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-timing.test.ts  future-only excluded from immediate mode

  `AVL-0081`    P1         §495     `TESTED`   packages/marketplace/src/agent-availability.ts  agent-availability.test.ts  a later higher rating does not beat a service that can run now

  `AVL-0082`    P1         §496     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-timing.test.ts  immediate use is online now or a short queue

  `AVL-0083`    P1         §496     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  busy wait must fit the policy

  `JOB-0247`    P1         §497     `TESTED`   packages/marketplace/src/agent-availability.ts  agent-availability.test.ts  a five-minute queue fits; an eight-hour wait does not

  `JOB-0248`    P1         §497     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  busy wait threshold is configurable

  `UI-0032`     P1         §498     `TESTED`   packages/marketplace-agent/src/agent-continuation.ts  agent-continuation.test.ts  keep searching after an unavailable match

  `UI-0033`     P2         §498     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `UI-0034`     P2         §498     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `UI-0035`     P2         §498     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `UI-0036`     P1         §499     `TESTED`   packages/marketplace-agent/src/agent-continuation.ts  agent-continuation.test.ts  every step must fit timing

  `UI-0037`     P2         §499     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `UI-0038`     P2         §499     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `UI-0039`     P2         §499     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `AVL-0084`    P1         §500     `TESTED`   packages/marketplace-agent/src/plan-repair.ts  plan-repair.test.ts  one parallel branch is repaired without dropping the others

  `AVL-0085`    P1         §500     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  each step is judged on its own

  `AVL-0086`    P1         §500     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  repair one step or pause

  `PRD-0394`    P1         §501     `TESTED`   packages/marketplace-agent/src/plan-repair.ts  plan-repair.test.ts  a stale step is not purchased

  `PRD-0395`    P2         §501     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  do not schedule when budget or permissions fail

  `AVL-0087`    P1         §502     `TESTED`   packages/job-scheduling/src/submission-gate.ts  submission-gate.test.ts  purchase rechecks availability before funds move

  `AVL-0088`    P1         §502     `TESTED`   packages/job-scheduling/src/submission-gate.ts  submission-gate.test.ts  a model suggestion is not enough to take payment

  `AVL-0089`    P1         §502     `TESTED`   packages/billing/src/job-payment.ts  submission-gate.test.ts  immediate purchase is refused when the capability is scheduled offline

  `AVL-0090`    P1         §503     `TESTED`   packages/marketplace/src/agent-availability.ts  agent-availability.test.ts  agent results carry structured timing

  `AVL-0091`    P1         §503     `TESTED`   packages/marketplace/src/agent-ranking.ts  agent-timing.test.ts  structured timing snapshot on ranked rows

  `AVL-0092`    P1         §503     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  description text is not availability

  `AVL-0093`    P1         §504     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-timing.test.ts  availability is filtered in code

  `AVL-0094`    P1         §504     `TESTED`   packages/marketplace/src/agent-ranking.ts  agent-timing.test.ts  hard timing filter outside the model

  `AVL-0095`    P1         §504     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-timing.test.ts  prefer-available is enforced outside the model

  `AVL-0096`    P1         §504     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-timing.test.ts  the model cannot override the timing filter

  `PRD-0396`    P1         §505     `TESTED`   packages/marketplace/src/buyer-constraints.ts  buyer-constraints.test.ts  waiting is enabled only by an explicit buyer request

  `PRD-0397`    P2         §505     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  waiting requires explicit approval

  `PRD-0398`    P2         §505     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  a better future rating does not imply waiting

  `JOB-0249`    P1         §506     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-timing.test.ts  immediate, deadline, and explicit earliest-available modes

  `JOB-0250`    P1         §506     `TESTED`   packages/marketplace/src/agent-ranking.ts  agent-timing.test.ts  immediate mode uses online accepting only

  `JOB-0251`    P1         §506     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  future service only if completion fits

  `TST-0021`    P1         §507     `TESTED`   packages/marketplace/src/agent-availability.ts  agent-availability.test.ts  autonomous choice prefers a runnable service

  `AVL-0097`    P1         §508     `TESTED`   packages/marketplace/src/agent-availability.ts  agent-availability.test.ts  no immediate option is explained and not silently scheduled

  `AVL-0098`    P1         §508     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-timing.test.ts  immediate mode does not schedule future jobs

  `CAP-0119`    P1         §509     `TESTED`   packages/marketplace/src/scheduled-disclosure.ts  scheduled-disclosure.test.ts  availability cannot override a hard constraint

  `CAP-0120`    P1         §509     `TESTED`   packages/marketplace/src/scheduled-disclosure.ts  scheduled-disclosure.test.ts  an available service is rejected when it needs forbidden internet

  `AVL-0099`    P1         §510     `TESTED`   packages/marketplace-agent/src/agent-continuation.ts  agent-continuation.test.ts  immediacy cannot break budget or permissions

  `AVL-0100`    P1         §510     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `AVL-0101`    P1         §510     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `AVL-0102`    P1         §510     `TESTED`   packages/job-scheduling/src/execution-preference.ts  execution-preference.test.ts  schedule purchase and agent timing policy

  `PRD-0399`    P1         §511     `TESTED`   packages/marketplace/src/human-availability.ts  human-availability.test.ts  search separates available now from available later

  `PRD-0400`    P2         §511     `TESTED`   packages/marketplace/src/agent-discovery.ts  agent-discovery.test.ts  autonomous execution does not compare later services as purchases

  `AGT-0102`    P1         §512     `TESTED`   packages/marketplace/src/human-availability.ts  agent-discovery.test.ts  advice may include later services; execution does not

  `AGT-0103`    P1         §512     `TESTED`   packages/marketplace/src/agent-ranking.ts  agent-timing.test.ts  future-only services excluded by default

  `PRD-0401`    P1         §513     `TESTED`   packages/marketplace-agent/src/plan-timing-view.ts  plan-timing-view.test.ts  plan timing is visible before approval

  `PRD-0402`    P2         §513     `TESTED`   apps/web/src/app/capabilities/[slug]/run/page.tsx  status-ui.test.ts  timing is shown before submit

  `PRD-0403`    P1         §514     `TESTED`   packages/marketplace-agent/src/agent-progress.ts  agent-progress.test.ts  progress names the step, not the reasoning

  `PRD-0404`    P2         §514     `TESTED`   packages/marketplace-agent/src/structured-intent.ts  agent-safety.test.ts  chain-of-thought is not accepted as an instruction

  `JOB-0252`    P1         §515     `TESTED`   packages/marketplace-agent/src/plan-completion.ts  plan-completion.test.ts  completion includes wait and overlapping steps

  `JOB-0253`    P1         §515     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  estimate includes wait plus duration

  `JOB-0254`    P1         §515     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  immediate plans stay a short estimate

  `AVL-0103`    P1         §516     `TESTED`   packages/marketplace-agent/src/agent-continuation.ts  agent-continuation.test.ts  permission is not sacrificed for availability

  `AVL-0104`    P1         §516     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-timing.test.ts  unavailable capability rejected in IMMEDIATE

  `AVL-0105`    P1         §516     `TESTED`   packages/marketplace/src/agent-timing.ts  agent-timing.test.ts  deadline mode only if completion fits

  `AVL-0106`    P1         §516     `TESTED`   packages/marketplace-agent/src/agent-continuation.ts  agent-continuation.test.ts  hard permission constraint stays

  `AVL-0107`    P1         §516     `TESTED`   packages/marketplace-agent/src/agent-continuation.ts  agent-continuation.test.ts  budget is not exceeded for a faster alternative

  `AVL-0108`    P1         §516     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  recommendation may show a future option

  `AVL-0109`    P1         §516     `TESTED`   packages/marketplace-agent/src/availability-decisions.ts  availability-decisions.test.ts  execution defaults to immediate-only

  `PRD-0405`    P1         §517     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `PRD-0406`    P2         §517     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `PRD-0407`    P2         §517     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0040`     P1         §518     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0041`     P2         §518     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0042`     P2         §518     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0043`     P2         §518     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0044`     P1         §519     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0045`     P2         §519     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0046`     P2         §519     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0047`     P2         §519     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0048`     P2         §519     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0049`     P1         §520     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0050`     P2         §520     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0051`     P2         §520     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0052`     P2         §520     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0053`     P2         §520     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0054`     P1         §521     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0055`     P2         §521     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0056`     P2         §521     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0057`     P2         §521     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0058`     P1         §522     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0059`     P2         §522     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0060`     P2         §522     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0061`     P2         §522     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0062`     P2         §522     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0063`     P1         §523     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0064`     P2         §523     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0065`     P2         §523     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0066`     P2         §523     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0067`     P2         §523     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0068`     P1         §524     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0069`     P2         §524     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0070`     P1         §525     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0071`     P2         §525     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0072`     P2         §525     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `JOB-0255`    P1         §526     `TESTED`   apps/web/src/app/jobs/page.tsx, apps/web/src/app/jobs/[id]/page.tsx   docs/milestones/M14-manual-validation.md M14 job UI §526–§537

  `JOB-0256`    P1         §526     `TESTED`   apps/web/src/app/jobs/page.tsx, apps/web/src/app/jobs/[id]/page.tsx   docs/milestones/M14-manual-validation.md M14 job UI §526–§537

  `JOB-0257`    P1         §526     `TESTED`   apps/web/src/app/jobs/page.tsx, apps/web/src/app/jobs/[id]/page.tsx   docs/milestones/M14-manual-validation.md M14 job UI §526–§537

  `JOB-0258`    P1         §526     `TESTED`   apps/web/src/app/jobs/page.tsx, apps/web/src/app/jobs/[id]/page.tsx   docs/milestones/M14-manual-validation.md M14 job UI §526–§537

  `UI-0073`     P1         §527     `TESTED`   apps/web/src/components/CapabilityCard.tsx, apps/web/src/app/capabilities/[slug]/page.tsx   docs/milestones/M14-manual-validation.md M14 capability cards §527–§528

  `UI-0074`     P2         §527     `TESTED`   apps/web/src/components/CapabilityCard.tsx, apps/web/src/app/capabilities/[slug]/page.tsx   docs/milestones/M14-manual-validation.md M14 capability cards §527–§528

  `PRD-0408`    P1         §528     `TESTED`   apps/web/src/components/CapabilityCard.tsx, apps/web/src/app/capabilities/[slug]/page.tsx   docs/milestones/M14-manual-validation.md M14 capability cards §527–§528

  `PRD-0409`    P2         §528     `TESTED`   apps/web/src/components/CapabilityCard.tsx, apps/web/src/app/capabilities/[slug]/page.tsx   docs/milestones/M14-manual-validation.md M14 capability cards §527–§528

  `PRD-0410`    P2         §528     `TESTED`   apps/web/src/components/CapabilityCard.tsx, apps/web/src/app/capabilities/[slug]/page.tsx   docs/milestones/M14-manual-validation.md M14 capability cards §527–§528

  `PRD-0411`    P1         §529     `TESTED`   apps/web/src/app/agent/page.tsx, apps/web/src/app/search/page.tsx   docs/milestones/M14-manual-validation.md M14 marketplace/agent §529–§530

  `PRD-0412`    P2         §529     `TESTED`   apps/web/src/app/agent/page.tsx, apps/web/src/app/search/page.tsx   docs/milestones/M14-manual-validation.md M14 marketplace/agent §529–§530

  `PRD-0413`    P2         §529     `TESTED`   apps/web/src/app/agent/page.tsx, apps/web/src/app/search/page.tsx   docs/milestones/M14-manual-validation.md M14 marketplace/agent §529–§530

  `PRD-0414`    P2         §529     `TESTED`   apps/web/src/app/agent/page.tsx, apps/web/src/app/search/page.tsx   docs/milestones/M14-manual-validation.md M14 marketplace/agent §529–§530

  `AGT-0104`    P1         §530     `TESTED`   apps/web/src/app/agent/page.tsx, apps/web/src/app/search/page.tsx   docs/milestones/M14-manual-validation.md M14 marketplace/agent §529–§530

  `AGT-0105`    P1         §530     `TESTED`   apps/web/src/app/agent/page.tsx, apps/web/src/app/search/page.tsx   docs/milestones/M14-manual-validation.md M14 marketplace/agent §529–§530

  `AGT-0106`    P1         §530     `TESTED`   apps/web/src/app/agent/page.tsx, apps/web/src/app/search/page.tsx   docs/milestones/M14-manual-validation.md M14 marketplace/agent §529–§530

  `JOB-0259`    P1         §531     `TESTED`   apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 seller dashboard §531–§532

  `JOB-0260`    P1         §531     `TESTED`   apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 seller dashboard §531–§532

  `JOB-0261`    P1         §531     `TESTED`   apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 seller dashboard §531–§532

  `SEC-0119`    P1         §532     `TESTED`   apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 seller dashboard §531–§532

  `SEC-0120`    P0         §532     `TESTED`   apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 seller dashboard §531–§532

  `SEC-0121`    P0         §532     `TESTED`   apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 seller dashboard §531–§532

  `UI-0075`     P1         §533     `TESTED`   apps/web/src/lib/status-ui.ts, apps/web/src/components/ui/StatusBadge.tsx   apps/web/src/lib/status-ui.test.ts   docs/milestones/M14-manual-validation.md M14 status language §533

  `UI-0076`     P2         §533     `TESTED`   apps/web/src/lib/status-ui.ts, apps/web/src/components/ui/StatusBadge.tsx   apps/web/src/lib/status-ui.test.ts   docs/milestones/M14-manual-validation.md M14 status language §533

  `CAP-0121`    P1         §534     `TESTED`   apps/web/src/components/ui/EmptyState.tsx, apps/web/src/app/jobs/page.tsx, apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 empty states §534

  `CAP-0122`    P1         §534     `TESTED`   apps/web/src/components/ui/EmptyState.tsx, apps/web/src/app/jobs/page.tsx, apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 empty states §534

  `CAP-0123`    P1         §534     `TESTED`   apps/web/src/components/ui/EmptyState.tsx, apps/web/src/app/jobs/page.tsx, apps/web/src/app/seller/dashboard/page.tsx   docs/milestones/M14-manual-validation.md M14 empty states §534

  `PRD-0415`    P1         §535     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `PRD-0416`    P2         §535     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `PRD-0417`    P2         §535     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `PRD-0418`    P2         §535     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `JOB-0262`    P1         §536     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `JOB-0263`    P1         §536     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `JOB-0264`    P1         §536     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `JOB-0265`    P1         §537     `TESTED`   apps/web/src/app/jobs/page.tsx, apps/web/src/app/jobs/[id]/page.tsx   docs/milestones/M14-manual-validation.md M14 job UI §526–§537

  `JOB-0266`    P1         §537     `TESTED`   apps/web/src/app/jobs/page.tsx, apps/web/src/app/jobs/[id]/page.tsx   docs/milestones/M14-manual-validation.md M14 job UI §526–§537

  `PRD-0419`    P1         §538     `TESTED`   apps/web/src/app/globals.css, apps/web/src/app/layout.tsx   docs/milestones/M14-manual-validation.md M14 responsive §538

  `PRD-0420`    P2         §538     `TESTED`   apps/web/src/app/globals.css, apps/web/src/app/layout.tsx   docs/milestones/M14-manual-validation.md M14 responsive §538

  `PRD-0421`    P2         §538     `TESTED`   apps/web/src/app/globals.css, apps/web/src/app/layout.tsx   docs/milestones/M14-manual-validation.md M14 responsive §538

  `PRD-0422`    P2         §538     `TESTED`   apps/web/src/app/globals.css, apps/web/src/app/layout.tsx   docs/milestones/M14-manual-validation.md M14 responsive §538

  `UI-0077`     P1         §539     `TESTED`   apps/web/src/app/globals.css, apps/web/src/components/ui   security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 a11y §539

  `PAY-0111`    P1         §540     `TESTED`   apps/web/src/components/CapabilityCard.tsx, apps/web/src/app/capabilities/[slug]/page.tsx   docs/milestones/M14-manual-validation.md M14 capability cards §527–§528

  `PAY-0112`    P0         §540     `TESTED`   apps/web/src/components/CapabilityCard.tsx, apps/web/src/app/capabilities/[slug]/page.tsx   docs/milestones/M14-manual-validation.md M14 capability cards §527–§528

  `UI-0078`     P1         §541     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0079`     P2         §541     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `API-0028`    P1         §542     `TESTED`   apps/web/src/components/icons.tsx   docs/milestones/M14-manual-validation.md M14 icons §542

  `API-0029`    P1         §542     `TESTED`   apps/web/src/components/icons.tsx   docs/milestones/M14-manual-validation.md M14 icons §542

  `UI-0080`     P1         §543     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0081`     P2         §543     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `PRD-0423`    P1         §544     `TESTED`   apps/web/src/components/CapabilityCard.tsx, apps/web/src/app/capabilities/[slug]/page.tsx   docs/milestones/M14-manual-validation.md M14 capability cards §527–§528

  `UI-0082`     P1         §545     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0083`     P2         §545     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0084`     P1         §546     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0085`     P2         §546     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0086`     P2         §546     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0087`     P1         §547     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0088`     P2         §547     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0089`     P1         §548     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0090`     P2         §548     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `PRD-0424`    P1         §549     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0091`     P1         §550     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0092`     P2         §550     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541

  `UI-0093`     P2         §550     `TESTED`   docs/design-system.md, apps/web/src/app/globals.css, apps/web/src/components/ui   apps/web/src/lib/status-ui.test.ts; security/tests/acceptance-m14.test.ts   docs/milestones/M14-manual-validation.md M14 design system §541
  --------------------------------------------------------------------------------

## Local development environment

  Requirement     Priority   Status   Implementation   Tests   Notes
  --------------- ---------- -------- ---------------- ------- -------
  DEV-LOCAL-001   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-002   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-003   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-004   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-005   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-006   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-007   P0         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-008   P0         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-009   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-010   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-011   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-012   P0         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-013   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-014   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-015   P1         TESTED   packages/billing/src/fake-payment-adapter.ts, .env.example   packages/billing/src/fake-payment-adapter.test.ts; apps/api/src/startup-guards.ts   docs/DEV-LOCAL.md M18 §564
  DEV-LOCAL-016   P0         TESTED   packages/billing/src/fake-payment-adapter.ts, .env.example   packages/billing/src/fake-payment-adapter.test.ts; apps/api/src/startup-guards.ts   docs/DEV-LOCAL.md M18 §564
  DEV-LOCAL-017   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-018   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-019   P0         TESTED   packages/billing/src/fake-payment-adapter.ts, .env.example   packages/billing/src/fake-payment-adapter.test.ts; apps/api/src/startup-guards.ts   docs/DEV-LOCAL.md M18 §564
  DEV-LOCAL-020   P1         TESTED   apps/api/src/server.ts, scripts/local-dev-doctor.mjs   scripts/verify-m18-flow.mjs   docs/testing/LOCAL-DEV-E2E-CHECKLIST.md M18 §567
  DEV-LOCAL-021   P2         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-022   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-023   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-024   P1         TESTED   tests/fixtures/local-e2e-failure-matrix.json, security/tests   security/tests/acceptance-m18-local-failures.test.ts   docs/DEV-LOCAL.md M18 §570
  DEV-LOCAL-025   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-026   P1         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-027   P0         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-028   P0         TESTED   docker-compose.yml, scripts/dev-setup.mjs, scripts/run-local-e2e.mjs   scripts/verify-m18-flow.mjs; security/tests/acceptance-m18.test.ts   docs/milestones/M18-closure.md M18
  DEV-LOCAL-029   P1         TESTED   docs/testing/LOCAL-DEV-E2E-CHECKLIST.md, docs/DEV-LOCAL.md   scripts/run-local-e2e.mjs; pnpm test:e2e:local   docs/milestones/M18-manual-validation.md M18 §573

## Authentication

  Requirement   Priority   Status   Implementation   Tests   Notes
  ------------- ---------- -------- ---------------- ------- -------
  AUTH-001      P1         TESTED   packages/auth, apps/api   vitest   §574 M02
  AUTH-002      P1         TESTED   packages/auth, apps/api   vitest   §574 M02
  AUTH-003      P0         TESTED   packages/auth, apps/api   vitest   §575 M02
  AUTH-004      P0         TESTED   packages/auth, apps/api   vitest   §575 M02
  AUTH-005      P0         TESTED   packages/auth, apps/api   vitest   §575 M02
  AUTH-006      P1         TESTED   packages/auth, apps/api   vitest   §575 M02
  AUTH-007      P0         TESTED   packages/auth, apps/api   vitest   §575 M02
  AUTH-008      P1         TESTED   packages/auth, apps/api   vitest   §576 M02
  AUTH-009      P0         TESTED   packages/auth, apps/api   vitest   §576 M02
  AUTH-010      P0         TESTED   packages/auth, apps/api   vitest   §576 M02
  AUTH-011      P0         TESTED   packages/auth, apps/api   vitest   §577 M02
  AUTH-012      P0         TESTED   packages/auth, apps/api   vitest   §577 M02
  AUTH-013      P1         TESTED   packages/auth, apps/api   vitest   §577 M02
  AUTH-014      P2         TESTED   packages/auth, apps/api   vitest   §577 M02
  AUTH-015      P1         TESTED   packages/auth, apps/api   vitest   §578 M02
  AUTH-016      P1         TESTED   packages/auth, apps/api   vitest   §578 M02
  AUTH-017      P0         TESTED   packages/auth, apps/api   vitest   §579 M02
  AUTH-018      P0         TESTED   packages/auth, apps/api   vitest   §579 M02
  AUTH-019      P1         TESTED   packages/auth, apps/api   vitest   §579 M02
  AUTH-020      P1         TESTED   packages/auth, apps/api   vitest   §579 M02
  AUTH-021      P0         TESTED   packages/auth, apps/api   vitest   §579 M02
  AUTH-022      P1         TESTED   packages/auth, apps/api   vitest   §580 M02
  AUTH-023      P1         TESTED   packages/auth, apps/api   vitest   §580 M02
  AUTH-024      P1         TESTED   packages/auth, apps/api   vitest   §580 M02

## Netsons production profile

  Requirement    Priority   Status   Implementation   Tests   Notes
  -------------- ---------- -------- ---------------- ------- -------
  HOST-NET-001   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-002   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-003   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-004   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-005   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-006   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-007   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-008   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-009   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-010   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-011   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-012   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-013   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-014   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-015   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-016   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-017   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-018   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-019   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-020   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-021   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-022   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-023   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-024   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-025   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-026   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-027   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-028   P1         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-029   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-030   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20
  HOST-NET-031   P0         TESTED   packages/cloud-netsons, apps/api, packages/job-dispatch, packages/database, docs/deploy/netsons   security/tests/host-net-production-m20.test.ts; security/tests/acceptance-m20.test.ts; packages/cloud-netsons/src/durable-work-db-port.test.ts; scripts/check-no-bullmq-production.mjs; scripts/netsons-staging-smoke.mjs   docs/milestones/M20-closure.md M20

## Backend portability and multi-control-plane continuity

  Requirement   Priority   Status   Implementation   Tests
  ------------- ---------- -------- ---------------- -------
  PORT-001   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-002   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-003   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-004   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-005   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-006   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-007   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-008   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-009   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-010   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-011      P1         TODO     ---              ---
  PORT-012   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-013   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-014      P1         TODO     ---              ---
  PORT-015   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-016   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22
  PORT-017      P1         TODO     ---              ---
  PORT-018   P0         TESTED   packages/cloud-core, packages/job-dispatch, apps/api   security/tests/conformance-dual-control-plane-m22.test.ts; packages/cloud-core/src/control-plane-policy.test.ts; packages/job-dispatch/src/control-plane-guard.test.ts   docs/milestones/M22-closure.md M22

## Transport-independent Worker connectivity

  Requirement   Priority   Status   Implementation   Tests
  ------------- ---------- -------- ---------------- -------
  PORT-019   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-020   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-021   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-022   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-023   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-024   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-025   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-026   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-027   P1         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-028   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-029   P0         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared
  PORT-030   P1         TESTED   packages/worker-transport, apps/api/src/worker-wss-server.ts   packages/worker-transport/src/wss-native-dispatch.ts; security/tests/conformance-dual-transport-m19.test.ts; packages/worker-transport/src/retry-backoff.test.ts   docs/milestones/M19-closure.md M19 PORT shared

## Unified monorepo / dual deployment profile coverage

  -----------------------------------------------------------------------
  Requirement    Priority    Status      Implementation   Test evidence
                                         evidence         
  -------------- ----------- ----------- ---------------- ---------------
  ARCH-UNI-001   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-002   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-003   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-004   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-005   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-006   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-007   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-008   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-009   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-010   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-011   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-012   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-013   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-014   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-015   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-016   P1         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-017   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-018   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-019   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-020   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-021   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-022   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-023   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters

  ARCH-UNI-024   P0         TESTED   packages/cloud-core, apps/api, apps/cloud-netsons, apps/cloud-aws   security/tests/conformance-both-roots-m19.test.ts; security/tests/architecture-uni-023-m19.test.ts; scripts/check-composition-thinness.mjs; scripts/verify-both-composition-roots.mjs   docs/milestones/M19-closure.md M19 shared+adapters
  -----------------------------------------------------------------------

## Engineering hardening coverage

  ------------------------------------------------------------------------
  Requirement   Priority     Status       Implementation   Test evidence
                                          evidence         
  ------------- ------------ ------------ ---------------- ---------------
  HARD-001   P0         TESTED   scripts/lib/compliance-audit-core.mjs, scripts/audit-m23-unified.mjs, scripts/lib/m23-mandatory-runs.mjs   security/tests/conformance-unified-audit-m23.test.ts; security/tests/acceptance-m23.test.ts; scripts/verify-m23-flow.mjs   docs/milestones/M23-closure.md M23

  HARD-002   P0         TESTED   scripts/lib/compliance-audit-core.mjs, scripts/audit-m23-unified.mjs, scripts/lib/m23-mandatory-runs.mjs   security/tests/conformance-unified-audit-m23.test.ts; security/tests/acceptance-m23.test.ts; scripts/verify-m23-flow.mjs   docs/milestones/M23-closure.md M23

  HARD-003   P0         TESTED   scripts/lib/compliance-audit-core.mjs, scripts/audit-m23-unified.mjs, scripts/lib/m23-mandatory-runs.mjs   security/tests/conformance-unified-audit-m23.test.ts; security/tests/acceptance-m23.test.ts; scripts/verify-m23-flow.mjs   docs/milestones/M23-closure.md M23

  HARD-004   P0         TESTED   scripts/check-duplicate-semantic-ownership.mjs, scripts/check-api-provider-import-boundary.mjs, scripts/generate-provider-parity-report.mjs, scripts/verify-compatibility-matrix.mjs   security/tests/conformance-golden-m24.test.ts; security/tests/architecture-fitness-m24.test.ts; security/tests/conformance-divergence-rejection-m24.test.ts; security/tests/acceptance-m24-exit.test.ts; scripts/verify-m24-flow.mjs   docs/audits/M24-exit-criteria.json; docs/milestones/M24-closure.md M24

  HARD-005   P0         TESTED   packages/resilience, packages/billing/src/stripe-provider.ts, docs/deploy/backup-restore-runbook.md   packages/resilience/src/convergence.test.ts; packages/billing/src/job-completion-idempotency.test.ts; packages/billing/src/ledger-idempotency.test.ts; packages/billing/src/stripe-webhook-idempotency.test.ts; security/tests/fault-injection-convergence-m26.test.ts; security/tests/fault-injection-control-plane-m26.test.ts; security/tests/fault-injection-transport-ack-m26.test.ts; scripts/verify-m26-flow.mjs   docs/audits/M26-exit-criteria.json; docs/audits/M26-rpo-rto.json; docs/milestones/M26-closure.md M26

  HARD-006   P0         TESTED   packages/resilience, packages/billing/src/stripe-provider.ts, docs/deploy/backup-restore-runbook.md   packages/resilience/src/convergence.test.ts; packages/billing/src/job-completion-idempotency.test.ts; packages/billing/src/ledger-idempotency.test.ts; packages/billing/src/stripe-webhook-idempotency.test.ts; security/tests/fault-injection-convergence-m26.test.ts; security/tests/fault-injection-control-plane-m26.test.ts; security/tests/fault-injection-transport-ack-m26.test.ts; scripts/verify-m26-flow.mjs   docs/audits/M26-exit-criteria.json; docs/audits/M26-rpo-rto.json; docs/milestones/M26-closure.md M26

  HARD-007   P0         TESTED   scripts/check-duplicate-semantic-ownership.mjs, scripts/check-api-provider-import-boundary.mjs, scripts/generate-provider-parity-report.mjs, scripts/verify-compatibility-matrix.mjs   security/tests/conformance-golden-m24.test.ts; security/tests/architecture-fitness-m24.test.ts; security/tests/conformance-divergence-rejection-m24.test.ts; security/tests/acceptance-m24-exit.test.ts; scripts/verify-m24-flow.mjs   docs/audits/M24-exit-criteria.json; docs/milestones/M24-closure.md M24

  HARD-008   P0         TESTED   packages/compatibility, packages/worker-store, apps/api/src/services/worker-compatibility-gate.ts, scripts/generate-unified-release-manifest.mjs, scripts/verify-schema-rollout-discipline.mjs, scripts/verify-worker-release-cli.mjs   packages/compatibility/src/*.test.ts; packages/worker-store/src/staged-update.test.ts; security/tests/conformance-golden-m25.test.ts; security/tests/compatibility-fail-closed-m25.test.ts; apps/api/src/services/worker-compatibility-gate.test.ts; scripts/verify-m25-flow.mjs   docs/audits/M25-exit-criteria.json; docs/audits/M25-fitness-report.json; docs/milestones/M25-closure.md M25

  HARD-009   P0         TESTED   scripts/lib/compliance-audit-core.mjs, scripts/audit-m23-unified.mjs, scripts/lib/m23-mandatory-runs.mjs   security/tests/conformance-unified-audit-m23.test.ts; security/tests/acceptance-m23.test.ts; scripts/verify-m23-flow.mjs   docs/milestones/M23-closure.md M23

  HARD-010   P0         TESTED   packages/compatibility, packages/worker-store, apps/api/src/services/worker-compatibility-gate.ts, scripts/generate-unified-release-manifest.mjs, scripts/verify-schema-rollout-discipline.mjs, scripts/verify-worker-release-cli.mjs   packages/compatibility/src/*.test.ts; packages/worker-store/src/staged-update.test.ts; security/tests/conformance-golden-m25.test.ts; security/tests/compatibility-fail-closed-m25.test.ts; apps/api/src/services/worker-compatibility-gate.test.ts; scripts/verify-m25-flow.mjs   docs/audits/M25-exit-criteria.json; docs/audits/M25-fitness-report.json; docs/milestones/M25-closure.md M25

  HARD-011   P0         TESTED   packages/compatibility, packages/worker-store, apps/api/src/services/worker-compatibility-gate.ts, scripts/generate-unified-release-manifest.mjs, scripts/verify-schema-rollout-discipline.mjs, scripts/verify-worker-release-cli.mjs   packages/compatibility/src/*.test.ts; packages/worker-store/src/staged-update.test.ts; security/tests/conformance-golden-m25.test.ts; security/tests/compatibility-fail-closed-m25.test.ts; apps/api/src/services/worker-compatibility-gate.test.ts; scripts/verify-m25-flow.mjs   docs/audits/M25-exit-criteria.json; docs/audits/M25-fitness-report.json; docs/milestones/M25-closure.md M25

  HARD-012   P1         TESTED   packages/compatibility, packages/worker-store, apps/api/src/services/worker-compatibility-gate.ts, scripts/generate-unified-release-manifest.mjs, scripts/verify-schema-rollout-discipline.mjs, scripts/verify-worker-release-cli.mjs   packages/compatibility/src/*.test.ts; packages/worker-store/src/staged-update.test.ts; security/tests/conformance-golden-m25.test.ts; security/tests/compatibility-fail-closed-m25.test.ts; apps/api/src/services/worker-compatibility-gate.test.ts; scripts/verify-m25-flow.mjs   docs/audits/M25-exit-criteria.json; docs/audits/M25-fitness-report.json; docs/milestones/M25-closure.md M25

  HARD-013   P0         TESTED   scripts/lib/compliance-audit-core.mjs, scripts/audit-m23-unified.mjs, scripts/lib/m23-mandatory-runs.mjs   security/tests/conformance-unified-audit-m23.test.ts; security/tests/acceptance-m23.test.ts; scripts/verify-m23-flow.mjs   docs/milestones/M23-closure.md M23

  HARD-014   P0         TESTED   packages/resilience, packages/billing/src/stripe-provider.ts, docs/deploy/backup-restore-runbook.md   packages/resilience/src/convergence.test.ts; packages/billing/src/job-completion-idempotency.test.ts; packages/billing/src/ledger-idempotency.test.ts; packages/billing/src/stripe-webhook-idempotency.test.ts; security/tests/fault-injection-convergence-m26.test.ts; security/tests/fault-injection-control-plane-m26.test.ts; security/tests/fault-injection-transport-ack-m26.test.ts; scripts/verify-m26-flow.mjs   docs/audits/M26-exit-criteria.json; docs/audits/M26-rpo-rto.json; docs/milestones/M26-closure.md M26

  HARD-015   P0         TESTED   packages/resilience, packages/billing/src/stripe-provider.ts, docs/deploy/backup-restore-runbook.md   packages/resilience/src/convergence.test.ts; packages/billing/src/job-completion-idempotency.test.ts; packages/billing/src/ledger-idempotency.test.ts; packages/billing/src/stripe-webhook-idempotency.test.ts; security/tests/fault-injection-convergence-m26.test.ts; security/tests/fault-injection-control-plane-m26.test.ts; security/tests/fault-injection-transport-ack-m26.test.ts; scripts/verify-m26-flow.mjs   docs/audits/M26-exit-criteria.json; docs/audits/M26-rpo-rto.json; docs/milestones/M26-closure.md M26

  HARD-016   P0         TESTED   packages/resilience, packages/billing/src/stripe-provider.ts, docs/deploy/backup-restore-runbook.md   packages/resilience/src/convergence.test.ts; packages/billing/src/job-completion-idempotency.test.ts; packages/billing/src/ledger-idempotency.test.ts; packages/billing/src/stripe-webhook-idempotency.test.ts; security/tests/fault-injection-convergence-m26.test.ts; security/tests/fault-injection-control-plane-m26.test.ts; security/tests/fault-injection-transport-ack-m26.test.ts; scripts/verify-m26-flow.mjs   docs/audits/M26-exit-criteria.json; docs/audits/M26-rpo-rto.json; docs/milestones/M26-closure.md M26

  HARD-017   P0         TESTED   scripts/lib/compliance-audit-core.mjs, scripts/audit-m23-unified.mjs, scripts/lib/m23-mandatory-runs.mjs   security/tests/conformance-unified-audit-m23.test.ts; security/tests/acceptance-m23.test.ts; scripts/verify-m23-flow.mjs   docs/milestones/M23-closure.md M23

  HARD-018   P0         TESTED   scripts/lib/compliance-audit-core.mjs, scripts/audit-m23-unified.mjs, scripts/lib/m23-mandatory-runs.mjs   security/tests/conformance-unified-audit-m23.test.ts; security/tests/acceptance-m23.test.ts; scripts/verify-m23-flow.mjs   docs/milestones/M23-closure.md M23

  HARD-019   P1         TESTED   packages/release-ops, packages/cloud-core/src/postgres-durable-work.ts, docs/audits/M27-performance-envelope.json   packages/release-ops/src/*.test.ts; security/tests/release-activation-m27.test.ts; security/tests/release-activation-rejection-m27.test.ts; security/tests/performance-envelope-m27.test.ts; scripts/check-bounded-runtime-vs-envelope.mjs; scripts/verify-m27-flow.mjs   docs/audits/M27-exit-criteria.json; docs/audits/M27-fitness-report.json; docs/milestones/M27-closure.md M27

  HARD-020   P1         TESTED   packages/release-ops, packages/cloud-core/src/postgres-durable-work.ts, docs/audits/M27-performance-envelope.json   packages/release-ops/src/*.test.ts; security/tests/release-activation-m27.test.ts; security/tests/release-activation-rejection-m27.test.ts; security/tests/performance-envelope-m27.test.ts; scripts/check-bounded-runtime-vs-envelope.mjs; scripts/verify-m27-flow.mjs   docs/audits/M27-exit-criteria.json; docs/audits/M27-fitness-report.json; docs/milestones/M27-closure.md M27

  HARD-021   P0         TESTED   scripts/generate-unified-release-manifest.mjs, packages/compatibility/src/release-manifest.ts, scripts/verify-unified-release-evidence.mjs   security/tests/conformance-golden-m25.test.ts; security/tests/release-activation-m27.test.ts; scripts/verify-m27-flow.mjs   docs/audits/unified-release-manifest.json; docs/milestones/M27-closure.md M27/M28

  HARD-022   P0         TESTED   scripts/generate-provider-parity-report.mjs, scripts/verify-release-activation-gate.mjs   security/tests/conformance-golden-m24.test.ts; security/tests/release-activation-m27.test.ts; scripts/verify-m28-flow.mjs   docs/audits/M24-provider-parity-report.json M24/M28

  HARD-023   P0         TESTED   scripts/run-backend-conformance.mjs, scripts/lib/m23-mandatory-runs.mjs, scripts/lib/m28-mandatory-runs.mjs   security/tests/conformance-both-roots-m19.test.ts; security/tests/conformance-unified-audit-m28.test.ts; scripts/verify-m28-flow.mjs   docs/audits/M28-compliance-report.json M28

  HARD-024   P0         TESTED   scripts/audit-m28-exit-criteria.mjs, spec/IMPLEMENTATION-PLAN.md milestone contract   security/tests/conformance-unified-audit-m28.test.ts; scripts/verify-m28-flow.mjs   docs/milestones/M28-closure.md M28

  HARD-025   P0         TESTED   scripts/verify-golden-registry.mjs, security/tests/conformance-divergence-rejection-m24.test.ts   security/tests/conformance-golden-m24.test.ts; scripts/verify-m24-flow.mjs   docs/milestones/M24-closure.md M24/M28

  HARD-026   P0         TESTED   packages/cloud-core control-plane policy, packages/worker-transport multi-transport   security/tests/conformance-dual-control-plane-restart-m25.test.ts; security/tests/fault-injection-control-plane-m26.test.ts   docs/milestones/M25-closure.md M25/M28

  HARD-027   P0         TESTED   packages/release-ops, packages/cloud-core/src/postgres-durable-work.ts, docs/audits/M27-performance-envelope.json   packages/release-ops/src/*.test.ts; security/tests/release-activation-m27.test.ts; security/tests/release-activation-rejection-m27.test.ts; security/tests/performance-envelope-m27.test.ts; scripts/check-bounded-runtime-vs-envelope.mjs; scripts/verify-m27-flow.mjs   docs/audits/M27-exit-criteria.json; docs/audits/M27-fitness-report.json; docs/milestones/M27-closure.md M27

  HARD-028   P1         TESTED   packages/release-ops, packages/cloud-core/src/postgres-durable-work.ts, docs/audits/M27-performance-envelope.json   packages/release-ops/src/*.test.ts; security/tests/release-activation-m27.test.ts; security/tests/release-activation-rejection-m27.test.ts; security/tests/performance-envelope-m27.test.ts; scripts/check-bounded-runtime-vs-envelope.mjs; scripts/verify-m27-flow.mjs   docs/audits/M27-exit-criteria.json; docs/audits/M27-fitness-report.json; docs/milestones/M27-closure.md M27
  ------------------------------------------------------------------------

## Durable asynchronous job/result coverage

  -----------------------------------------------------------------------------
  Requirement   Priority   Status   Shared     Netsons    AWS        Test
                                    evidence   evidence   evidence   evidence
  ------------- ---------- -------- ---------- ---------- ---------- ----------
  ASYNC-001   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-002   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-003   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-004   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-005   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-006   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-007   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-008   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-009   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-010   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-011   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-012   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-013   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-014   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-015   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-016   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-017   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-018   P1         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-019   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-020   P1         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-021   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-022   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-023   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-024   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-025   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-026   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-027   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-028   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-029   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29

  ASYNC-030   P0         TESTED   packages/job-delivery/src/cloud-finalization.ts, packages/billing/src/job-completion.ts, apps/api/src/services/buyer-job-download.ts   packages/job-delivery/src/cloud-finalization.test.ts; security/tests/conformance-async-gold-m29.test.ts; security/tests/buyer-result-auth-m29.test.ts; scripts/verify-m29-flow.mjs   docs/milestones/M29-closure.md M29
  -----------------------------------------------------------------------------

## Buyer experience coverage

  ------------------------------------------------------------------------------
  Requirement   Priority   Status    Shared     Netsons    AWS        UX/E2E
                                     evidence   evidence   evidence   evidence
  ------------- ---------- --------- ---------- ---------- ---------- ----------
  BUYERUX-001   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-002   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-003   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-004   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-005   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-006   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-007   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-008   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-009   P1         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-010   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-011   P1         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-012   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-013   P1         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-014   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-015   P1         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-016   P1         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-017   P0         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-018   P0         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-019   P1         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-020   P0         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-021   P1         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-022   P0         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-023   P0         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-024   P0         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-025   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-026   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-027   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-028   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-029   P1         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-030   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-031   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-032   P1         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-033   P1         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-034   P0         TESTED   packages/buyer-experience/src/job-reuse.ts, packages/buyer-experience/src/buyer-asset-validation.ts, packages/buyer-experience/src/semantic-result.ts, packages/buyer-experience/src/input-snapshot.ts, packages/buyer-experience/src/purchase-snapshot-view.ts, packages/buyer-experience/src/retention-ux.ts, packages/buyer-experience/src/result-retention-reminders.ts, packages/buyer-experience/src/job-problem-report.ts, packages/job-delivery/src/result-bundle.ts, apps/api/src/routes/buyer-job-history.ts   packages/buyer-experience/src/buyer-asset-validation.test.ts; packages/buyer-experience/src/semantic-result.test.ts; packages/job-delivery/src/result-bundle.test.ts; security/tests/conformance-buyerux-gold-m31.test.ts; scripts/verify-m31-flow.mjs   docs/milestones/M31-closure.md M31

  BUYERUX-035   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-036   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-037   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-038   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-039   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-040   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-041   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-042   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-043   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-044   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30

  BUYERUX-045   P0         TESTED   packages/buyer-experience/src/execution-preflight.ts, packages/buyer-experience/src/execution-quote.ts, packages/marketplace/src/buyer-job-detail.ts, apps/api/src/routes/buyer-experience.ts   packages/buyer-experience/src/deadline-feasibility.test.ts; security/tests/conformance-buyerux-gold-m30.test.ts; scripts/verify-m30-flow.mjs   docs/milestones/M30-closure.md M30
  ------------------------------------------------------------------------------

## Seller experience coverage

  --------------------------------------------------------------------------------
  Requirement    Priority   Status     Shared     Netsons    AWS        UX/E2E
                                       evidence   evidence   evidence   evidence
  -------------- ---------- ---------- ---------- ---------- ---------- ----------
  SELLERUX-001   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-002   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-003   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-004   P1         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-005   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-006   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-007   P1         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-008   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-009   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-010   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-011   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-012   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-013   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-014   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-015   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-016   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-017   P1         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-018   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-019   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-020   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-021   P1         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-022   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-023   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-024   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-025   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-026   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-027   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-028   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-029   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-030   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-031   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-032   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-033   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-034   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-035   P0         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-036   P0         TESTED   packages/job-scheduling/src/worker-routing.ts, packages/job-scheduling/src/worker-assignment.ts, packages/job-scheduling/src/availability-service.ts, packages/job-dispatch/src/dispatch-service.ts, apps/api/src/routes/seller-workers.ts, apps/web/src/app/seller/workers/page.tsx   packages/job-scheduling/src/worker-routing.test.ts; security/tests/conformance-sellerux-gold-m34.test.ts; security/tests/seller-workers-auth-m34.test.ts; scripts/verify-m34-flow.mjs   docs/milestones/M34-closure.md M34

  SELLERUX-037   P0         TESTED   packages/job-scheduling/src/worker-routing.ts, packages/job-scheduling/src/worker-assignment.ts, packages/job-scheduling/src/availability-service.ts, packages/job-dispatch/src/dispatch-service.ts, apps/api/src/routes/seller-workers.ts, apps/web/src/app/seller/workers/page.tsx   packages/job-scheduling/src/worker-routing.test.ts; security/tests/conformance-sellerux-gold-m34.test.ts; security/tests/seller-workers-auth-m34.test.ts; scripts/verify-m34-flow.mjs   docs/milestones/M34-closure.md M34

  SELLERUX-038   P1         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-039   P1         TESTED   packages/seller-experience/src/onboarding-status.ts, packages/seller-experience/src/publish-readiness.ts, packages/seller-experience/src/effective-permissions.ts, packages/seller-experience/src/draft-buyer-preview.ts, packages/seller-experience/src/semantic-version-diff.ts, packages/seller-experience/src/discovery-consent-policy.ts, packages/seller-experience/src/seller-security-disclosure.ts, packages/seller-experience/src/marketplace-identity.ts, packages/seller-experience/src/doctor-sanitize.ts, packages/worker-store/src/local-credentials.ts, apps/api/src/routes/seller-onboarding.ts, apps/web/src/components/PublishReadinessPanel.tsx   packages/seller-experience/src/publish-readiness.test.ts; packages/seller-experience/src/discovery-consent-policy.test.ts; packages/seller-experience/src/semantic-version-diff.test.ts; packages/seller-experience/src/effective-permissions.test.ts; security/tests/conformance-sellerux-gold-m32.test.ts; security/tests/seller-public-identity-m32.test.ts; scripts/verify-m32-flow.mjs   docs/milestones/M32-closure.md M32

  SELLERUX-040   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33

  SELLERUX-041   P0         TESTED   packages/seller-experience/src/seller-operations-summary.ts, packages/seller-experience/src/seller-job-execution-view.ts, packages/seller-experience/src/provider-cost-view.ts, packages/seller-experience/src/earnings-dashboard.ts, packages/seller-experience/src/profit-analytics.ts, packages/seller-experience/src/capability-analytics.ts, packages/seller-experience/src/rollback-readiness.ts, packages/seller-experience/src/auto-pause-explanation.ts, packages/seller-experience/src/seller-notification-preferences.ts, packages/seller-experience/src/maintenance-mode.ts, packages/seller-experience/src/explain-unavailability.ts, packages/seller-experience/src/reputation-explainability.ts, packages/seller-experience/src/first-sale-explanation.ts, packages/job-scheduling/src/accepting-jobs.ts, apps/api/src/routes/seller-operations.ts, apps/web/src/app/seller/operations/page.tsx   packages/seller-experience/src/explain-unavailability.test.ts; packages/seller-experience/src/provider-cost-view.test.ts; packages/seller-experience/src/rollback-readiness.test.ts; packages/seller-experience/src/seller-job-execution-view.test.ts; security/tests/conformance-sellerux-gold-m33.test.ts; security/tests/seller-operations-auth-m33.test.ts; scripts/verify-m33-flow.mjs   docs/milestones/M33-closure.md M33
  --------------------------------------------------------------------------------
