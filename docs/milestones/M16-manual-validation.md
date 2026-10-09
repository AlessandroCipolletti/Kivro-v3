# M16 manual validation

1. `pnpm verify:m16` passes on a clean checkout after `pnpm install`.
2. `pnpm test:e2e:local` succeeds (same composed gate).
3. Review `docs/testing/HAPPY-PATH-TRACE.md` and confirm staging can execute each phase.
4. Review `docs/testing/SECURITY-RELEASE-GATE.md` manual rows before inviting untrusted sellers.
5. Record private-alpha answers in `docs/PRODUCT-VALIDATION.md` using `docs/MVP-SUCCESS-CHECKLIST.md`.
