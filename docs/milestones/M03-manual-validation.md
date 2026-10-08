# M03 — manual validation checklist (in progress)

## Prerequisites

Complete [M02 manual validation](./M02-manual-validation.md) (auth, pairing, `pnpm db:migrate` including M02 auth tables).

```bash
pnpm db:setup
pnpm build
node apps/api/dist/main.js
```

## 1. Import consent (§96)

```bash
curl -s -X POST localhost:3001/seller/import/validate-consent \
  -H 'content-type: application/json' \
  -b /tmp/kivro.cookies \
  -d '{
    "discovery": {"snapshotVersion":1,"skills":["company-research"],"tools":[],"warnings":[]},
    "consent": {
      "consentVersion":1,
      "selectedSkills":["company-research"],
      "selectedTools":[],
      "permissionManifest": {
        "manifestVersion":1,
        "categories":[{"key":"PUBLIC_INTERNET","state":"USED","buyerLabel":"Web"}]
      }
    }
  }' | jq
```

## 2. Draft + publish capability

Use a sample contract matching `packages/contracts/src/capability-io.test.ts`, paired `workerDeviceId`, and `localWorkerId` from your Worker.

```bash
curl -s -b /tmp/kivro.cookies -X POST localhost:3001/seller/capabilities \
  -H 'content-type: application/json' \
  -d @docs/fixtures/sample-capability-draft.json | jq

curl -s -b /tmp/kivro.cookies -X POST "localhost:3001/seller/capabilities/<id>/publish" \
  -H 'content-type: application/json' \
  -d @docs/fixtures/sample-capability-publish.json | jq
```

## 3. Automated checks

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```
