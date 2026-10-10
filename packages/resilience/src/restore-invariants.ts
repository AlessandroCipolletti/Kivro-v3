/** HARD-015 — post-restore integrity checks (isolated restore test harness). */

export type RestoreSnapshot = {
  jobsTotal: number;
  terminalJobs: number;
  ledgerEntries: number;
  duplicateLedgerKeys: number;
  openReservationsOnTerminal: number;
};

export function assertPostRestoreInvariants(snapshot: RestoreSnapshot): {
  ok: true;
} | {
  ok: false;
  violations: string[];
} {
  const violations: string[] = [];
  if (snapshot.duplicateLedgerKeys > 0) {
    violations.push("duplicate ledger idempotency keys");
  }
  if (snapshot.openReservationsOnTerminal > 0) {
    violations.push("terminal jobs with open payment reservations");
  }
  if (snapshot.jobsTotal < 0 || snapshot.ledgerEntries < 0) {
    violations.push("negative counts in restore snapshot");
  }
  return violations.length ? { ok: false, violations } : { ok: true };
}
