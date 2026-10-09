# M18 — manual validation

1. **Setup** — Fresh `.env` from example; `pnpm dev:demo`; confirm Docker services healthy.
2. **Doctor** — `node scripts/local-dev-doctor.mjs` → no FAIL rows.
3. **API** — `pnpm dev`; `curl -s localhost:3001/health/ready | jq`.
4. **Worker** — `pnpm worker:dev`; confirm poll/heartbeat logs.
5. **E2E** — With API up: `KIVRO_E2E_REQUIRE_API=true pnpm test:e2e:local` or run `run-local-e2e.mjs` alone.
6. **OpenClaw (optional §573)** — Set `KIVRO_SANDBOX_DRY_RUN=false`, `KIVRO_EXECUTION_MODE=openclaw`; run one paid job end-to-end; confirm seller OpenClaw install unchanged outside Kivro runtime root.
7. **Checklist** — Complete `docs/testing/LOCAL-DEV-E2E-CHECKLIST.md` and note date below.

Validated on: ___________
