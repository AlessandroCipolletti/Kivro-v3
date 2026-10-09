# M17 — milestone closure (full specification compliance audit)

First independent accounting of all **1872** mapped requirements against `spec/MASTER-SPEC.md` and satellite spec files.

## Shipped

- `scripts/lib/parse-coverage.mjs` — normalize `COVERAGE.md` rows (main + appendix tables)
- `spec/compliance/section-milestone-index.json` — § → milestone routing from `IMPLEMENTATION-PLAN.md`
- `scripts/apply-m17-schedule-notes.mjs` — every open row gets an explicit `scheduled:Mxx` or `post-MVP` note
- `scripts/audit-m17-compliance.mjs` — validates evidence paths, M00–M16 closure (no TODO in closed sections), zero unexplained open rows
- Reports: `docs/audits/M17-compliance-report.{json,md}`, `docs/audits/M17-P0-P1-by-section.md`
- Gate: **`pnpm verify:m17`** (includes `verify:m16` regression)

## Interpretation (DEC-M17-001)

M17 **does not** implement the remaining ~400+ scheduled requirements. It proves:

1. M00–M16 scope has no stray `TODO` in owned sections (PARTIAL bounded items documented in milestone closures).
2. Every other `TODO`/`PARTIAL`/`BLOCKED` row is **explained** and routed to M18–M34 or post-MVP.
3. `TESTED` rows reference resolvable implementation/test evidence.

**M23 / M28** remain the terminal audits with staging E2E and dual-provider conformance.

## Gate

```bash
pnpm verify:m17
```
