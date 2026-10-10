# M34 closure — Multi-Worker domain readiness

## Preconditions

- M33 seller operations harness complete (`pnpm verify:m33`).
- `LocalWorkerBinding` already links a capability version to a Worker device.

## Deliverables

- Shared routing (`selectEligibleAssignedWorker`) that never treats the seller as one machine.
- Dispatch refuses a Worker that is not actively assigned to the job's capability version.
- Availability evaluates the assigned pool (independent health and capacity).
- Schema `workerRoutingPolicy` default `ANY_ASSIGNED_ELIGIBLE`.
- Seller API and `/seller/workers` list.
- SELLERUX-GOLD-019 and `pnpm verify:m34`.

## Exit

```bash
pnpm verify:m34
```
