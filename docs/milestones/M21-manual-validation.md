# M21 manual validation

1. `pnpm verify:m21` on clean checkout after `pnpm install`.
2. Local AWS profile smoke: `KIVRO_CLOUD_PROFILE=aws pnpm --filter @kivro/api run build && node apps/cloud-aws/start.mjs` — `/health/ready` shows `cloudProfile: aws`, `workerTransport: wss`.
3. `POST /platform/cron/aws-tick` with `x-kivro-cron-secret` returns durable work + maintenance summary.
4. With MinIO locally: keep `S3_ENDPOINT` set even when `KIVRO_CLOUD_PROFILE=aws` for dev storage.
5. When AWS staging exists: `KIVRO_AWS_STAGING_URL=... node scripts/aws-staging-smoke.mjs`.
6. `/health/ready` on AWS profile includes `durableWorkProfile`, optional `checks.sqsFanOut`, and native S3 readiness when `S3_BUCKET` is set without MinIO endpoint.
7. Staging paid E2E: `KIVRO_AWS_STAGING_URL`, `DATABASE_URL`, `KIVRO_E2E_BUYER_EMAIL`, `KIVRO_E2E_SELLER_EMAIL` → `node scripts/aws-staging-e2e.mjs`.
