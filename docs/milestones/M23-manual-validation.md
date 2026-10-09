# M23 manual validation

1. `pnpm verify:m23`
2. Review `docs/audits/M23-compliance-report.md` and `M23-P0-P1-by-section.md`
3. Optional: Netsons staging paid E2E (`KIVRO_NETSONS_STAGING_URL` + E2E buyer/seller) via `verify:m20`
4. Optional: AWS staging paid E2E via `verify:m21`
5. Optional: dual-CP discovery smoke (`KIVRO_M22_STAGING_URL`, `KIVRO_ADMIN_TOKEN`)
6. Dual-host transition soak — `docs/deploy/dual-control-plane-transition.md` (not CI-automated)

Terminal lossless audit: **M28**.
