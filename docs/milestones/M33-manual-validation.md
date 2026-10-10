# M33 manual validation — seller operations

1. Sign in as seller with a published capability and running or queued jobs.
2. Open **Seller → Operations** — confirm running/queued counts match dashboard.
3. Enable **maintenance mode** with message and return time; verify marketplace availability shows maintenance (not silent offline).
4. Set **max concurrent jobs** to 1; start two jobs — second buyer should see capacity/unavailability explanation.
5. Open **Economics** — pending/paid totals must match Stripe/settlement records, not Worker logs.
6. Open a **running job detail** — execution view shows structured inputs only (no buyer email).
7. Toggle **seller notification** preferences and reload — values persist.
