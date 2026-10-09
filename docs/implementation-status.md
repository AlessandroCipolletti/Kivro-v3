# Implementation status

Last aligned: **M17** (compliance audit gate). Authoritative traceability: `spec/COVERAGE.md` + `docs/audits/M17-compliance-report.json`.

| Milestone | Status | Gate |
|-----------|--------|------|
| M00 bootstrap | Done | typecheck/lint/test/build |
| M01 domain & auth contracts | Done | verify flows + COVERAGE |
| M02 worker & OpenClaw foundation | Done | verify:m03 (includes pairing) |
| M03 import & publish | Done | `pnpm verify:m03` |
| M04 sandbox & security | Done (bounded) | `pnpm verify:m04` |
| M05 I/O & assets | Done | `pnpm verify:m05` |
| M06 research & brokers | Done (bounded) | `pnpm verify:m06` |
| M07 dispatch & job control | Done (bounded) | `pnpm verify:m07` |
| M08 payments | Done | `pnpm verify:m08` |
| M09 scheduling | Done (bounded) | `pnpm verify:m09` |
| M10 buyer marketplace UX | Done (bounded) | `pnpm verify:m10` |
| M11 marketplace agent | Done (bounded) | `pnpm verify:m11` |
| M12 seller dashboard & health | Done | `pnpm verify:m12` |
| M13 buyer API keys & webhooks | Done | `pnpm verify:m13` |
| M14 design system | Done (bounded) | `pnpm verify:m14` |
| M15 observability & abuse | Done (bounded) | `pnpm verify:m15` |
| M16 testing & release gates | Done | `pnpm verify:m16` |
| M17 compliance audit | Done | `pnpm verify:m17` |
| M18+ local E2E, deploy, UX extensions | **Scheduled** | see `docs/audits/M17-P0-P1-by-section.md` |

## Spec compliance snapshot (M17)

- **1872** requirements parsed from `COVERAGE.md`
- **~1265** `TESTED` with resolvable evidence (gate-checked)
- **0** unexplained open rows; **0** `TODO` inside M00–M16-owned sections
- Remaining P0/P1 work routed to **M18–M34** or **post-MVP** in COVERAGE notes

## Known bounded / deferred areas (unchanged)

- Full §573 paid two-user OpenClaw E2E → **M18**
- Unified Netsons/AWS backend + conformance → **M19–M23**
- Cloud browser research (§264) → post-MVP
- External pen test execution → manual checklist (M15/M16)

## Security assumptions

- Deny-by-default sandbox and brokered egress (not prompt-only).
- Development must not fall back to host execution for buyer jobs.
- Worker local state under `KIVRO_RUNTIME_ROOT`.
