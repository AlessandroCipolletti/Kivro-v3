# MVP performance envelope (M27 / HARD-019)

Authoritative numeric bounds live in `docs/audits/M27-performance-envelope.json`.

## Validation

```bash
pnpm verify:m27
```

This runs synthetic profile load checks (`@kivro/release-ops`) against the envelope for **both** Netsons and AWS without changing shared semantics.

## Operational alarms

See `docs/audits/M27-operational-alarms.json` for required backlog, Worker-version, parity, and reconciliation signals (HARD-028).

## Release activation

Exact-release activation requires:

- unified release manifest with `exactReleaseId` and `gitCommit`
- provider parity report with `parityAsserted: true`
- backend conformance manifest covering both profiles
- M26 DR/fault harness complete
- envelope + load suite passing

Verified by `scripts/verify-release-activation-gate.mjs` inside `pnpm verify:m27`.
