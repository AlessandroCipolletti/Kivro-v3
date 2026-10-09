# M17 manual validation

1. `pnpm verify:m17` on a clean checkout.
2. Open `docs/audits/M17-compliance-report.md` — confirm `m00m16TodoCount` is 0.
3. Skim `docs/audits/M17-P0-P1-by-section.md` — confirm open P0/P1 items point at expected milestones (e.g. §551 → M18).
4. Spot-check 5 random `TESTED` rows in `spec/COVERAGE.md` against code/tests (M17 gate already checks path resolution).
