# MVP success definition (Master Spec §45)

Use for private alpha sign-off (manual + staging E2E).

1. Real OpenClaw user installs Worker alongside personal OpenClaw.
2. Worker discovers setup read-only.
3. Seller selects skill/resource with consent.
4. Separate marketplace worker environment generated.
5. Capability published from web UI.
6. Second user buys credits (Stripe test).
7. Buyer submits structured job.
8. Job reaches seller via outbound Worker connection.
9. Job runs in separate OpenClaw environment.
10. Mandatory sandbox enforced.
11. No access outside permission manifest.
12. No arbitrary Internet proxy abuse.
13. Useful result returned.
14. Buyer charged once.
15. Seller accounting credit recorded.
16. Audit trail understandable (`buildJobAuditSummary`, timelines).
17. Execution state cleaned up.
18. Personal OpenClaw untouched.

Automated partial coverage: milestone verify scripts M03–M15 + `security/tests/*`. Full 18-point run: `docs/milestones/M18-manual-validation.md` (planned).
