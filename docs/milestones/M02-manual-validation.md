# M02 — manual validation checklist

## Prerequisites

```bash
pnpm db:setup
pnpm build
node apps/api/dist/main.js   # terminal 1
```

Ensure `.env` has `KIVRO_DEV_AUTH_SHORTCUTS=true` for dev verification token in register response.

## 1. Email auth

```bash
# Register
curl -s -X POST localhost:3001/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"seller@example.com","password":"longpassword123"}' | jq

# Verify (use verificationToken from response when dev shortcuts enabled)
curl -s -X POST localhost:3001/auth/verify-email \
  -H 'content-type: application/json' \
  -d '{"token":"<verificationToken>"}' | jq

# Login (save Set-Cookie)
curl -s -c /tmp/kivro.cookies -X POST localhost:3001/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"seller@example.com","password":"longpassword123"}' | jq

curl -s -b /tmp/kivro.cookies localhost:3001/auth/me | jq
```

## 2. Worker pairing

```bash
# Create pairing code (verified session cookie required)
curl -s -b /tmp/kivro.cookies -X POST localhost:3001/worker-devices/pairing-codes | jq

# Pair worker CLI
node apps/worker/dist/cli.js pair --code <CODE>
```

## 3. OpenClaw (if installed)

```bash
node apps/worker/dist/cli.js doctor
node apps/worker/dist/cli.js scan
```

## 4. Google OAuth (optional)

Configure `GOOGLE_OAUTH_CLIENT_ID` / `SECRET` and matching `GOOGLE_OAUTH_REDIRECT_URI` in `.env`, then open `http://localhost:3001/api/users/auth/google`.

## 5. Automated checks

```bash
pnpm typecheck && pnpm lint && pnpm test && pnpm build
```
