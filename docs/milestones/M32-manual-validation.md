# M32 manual validation

1. Sign in as seller → `/seller/onboarding` — generate pairing code; pair Worker CLI.
2. Run `kivro-worker doctor` — output must not contain secrets.
3. `/seller/capabilities/new` — select discovery skills, validate consent, effective permissions, security disclosure, structured readiness panel.
4. `/seller/capabilities/:id/schedule` — set timezone/mode; confirm dashboard reflects availability.
5. `/seller/settings/identity` — set public display name + private legal name; verify `/sellers/:id` shows display name only.
6. Publish first capability — `/seller/capabilities/:id/first-publication-guide` returns post-publish steps.
