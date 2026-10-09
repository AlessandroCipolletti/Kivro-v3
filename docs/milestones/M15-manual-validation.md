# M15 manual validation

1. **Abuse denylist** — Submit job with input containing `/etc/passwd`; expect `INPUT_DENIED_BY_POLICY`.
2. **Frequency limit** — Lower `KIVRO_BUYER_MAX_JOBS_PER_HOUR=1`, submit two jobs; second returns `JOB_FREQUENCY_LIMIT`.
3. **Report** — `POST /buyer/abuse/report` as verified buyer with `{ targetType, targetId, reason }`.
4. **Admin metrics** — `GET /platform/admin/metrics/cloud` with `x-kivro-admin-token`.
5. **Native plugins** — Discovery snapshot with `nativePlugins: ["x"]` fails publish consent validation.
6. **Privacy** — Capability detail shows execution model + external processors list.
7. **Legal** — Visit `/legal/terms`, `/legal/privacy`, `/legal/aup`.
8. **Lost worker sweep** — Admin `POST /platform/admin/jobs/sweep-lost-workers` after stale worker (dev).
9. **Terms** — Run flow shows terms gate; `POST /auth/accept-marketplace-terms` then submit succeeds.
10. **Audit summary** — Job detail shows audit summary block when timeline exists.
11. **Worker metrics** — `GET /platform/admin/metrics/workers` with admin token.
12. **Report UI** — Submit report from capability detail (signed in, verified).
