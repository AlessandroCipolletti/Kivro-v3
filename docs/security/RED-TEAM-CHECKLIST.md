# Red-team checklist (Master Spec §34.4)

Operational checklist before public beta — not automated in CI.

- [ ] Container escape scenarios for pinned sandbox image
- [ ] Network policy bypass (SSRF, metadata, LAN)
- [ ] Secret leakage via logs, webhooks, job outputs
- [ ] Prompt injection via buyer files and URLs
- [ ] Seller impersonation and forged worker manifests
- [ ] Job replay and duplicate billing attempts
- [ ] Forged completion / stale worker version acceptance
- [ ] Malicious skill update with permission expansion
- [ ] External security review scheduled

Evidence artifacts: `security/tests/adversarial-m04.test.ts`, `security/SECURITY_INVARIANTS.md`, `docs/TESTING-STRATEGY.md`.
