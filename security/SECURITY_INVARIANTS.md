# Security invariants

1. Never execute buyer jobs in personal OpenClaw.
2. Deny tools/resources/network by default (`@kivro/policy-engine`, `@kivro/sandbox` — M04).
3. Sandbox failure fails closed (preflight rejects invalid manifests/config).
4. Buyer input is untrusted.
5. All job state transitions persisted (M01+).
6. All money operations idempotent (M08+).
