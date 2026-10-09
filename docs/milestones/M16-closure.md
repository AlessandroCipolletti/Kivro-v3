# M16 — milestone closure (full perimeter)

Testing strategy completion, canonical fixtures, happy/failure traces, integration matrix, API contract traceability, roadmap/experiment docs, and release gates for Master Spec §34–§46 and §88–§95.

## Shipped

- **§34** — integration matrix + adversarial catalog wiring (`INTEGRATION-TEST-MATRIX.md`, `verify-integration-matrix.mjs`)
- **§35–§38** — evidence via M15 implementation (observability, failure, privacy, legal); M16 re-documents gates
- **§39–§46** — roadmap status, repo structure verifier, API contract doc, MCP future, OpenClaw study index, experiment map, MVP/product checklists
- **§88** — `HAPPY-PATH-TRACE.md` + machine trace JSON + verifier
- **§89** — `FAILURE-PATH-TRACE.md` + evidence JSON + verifier
- **§90** — Document Analyzer + synthetic read-only DB fixtures; `e2e-fixtures-m16.test.ts`; broker test `fixture-ad-m06`
- **§91** — `SECURITY-RELEASE-GATE.md` + automated test map
- **§92** — `PRODUCT-RELEASE-GATE.md` + staging checklist (full §573 automation → M18)
- **§93–§95** — milestone plan traceability, code-quality gate script, README/spec objective checks
- Gate: **`pnpm verify:m16`**; **`pnpm test:e2e:local`** composes M16 smoke

## Explicitly M18 (not M16 gaps)

- Full §573 / §570 paid two-user Docker + real OpenClaw E2E automation
- Playwright visual regression (optional polish)

## Explicitly post-MVP / manual

- External pen test execution (§34.4, §91 manual rows)
- MCP `run_capability` server (§42 — v1 buyer API + web suffice for MVP)

## Gate

```bash
pnpm verify:m16
pnpm test:e2e:local
```
