# M16 manual validation

1. `pnpm verify:m16` passes on a clean checkout after `pnpm install`.
2. `pnpm test:e2e:local` runs the same gate smoke (no Docker required).
3. Open `docs/MVP-SUCCESS-CHECKLIST.md` and confirm staging manual run covers at least items 1–5 before alpha invite.
4. Confirm `tests/fixtures/catalog.json` lists fixtures you rely on for security regressions.
