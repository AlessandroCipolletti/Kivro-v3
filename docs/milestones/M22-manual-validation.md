# M22 manual validation

1. `pnpm verify:m22`
2. Set `KIVRO_DUAL_CONTROL_PLANE=1`, `KIVRO_NETSONS_CP_STATE=DRAINING`, `KIVRO_AWS_CP_STATE=ACTIVE`
3. `GET /worker/discovery` — both control planes with expected lifecycle
4. Dispatch job → `executionControlPlaneId` = `aws-default` in DB
5. Simulate in-flight Netsons job (CP `netsons-default`) — offers only on Netsons poll transport / CP header
6. `GET /platform/admin/control-planes` (admin token) — shows registry + `activeForNewExecutions`
7. Flip rollback env (Netsons ACTIVE, AWS DRAINING) — new dispatch binds to Netsons without Worker re-pair
8. Set Netsons `RETIRED` — discovery omits Netsons; Worker daemon shows AWS-only bindings after restart
9. Ops checklist: `docs/deploy/dual-control-plane-transition.md`
