# First technical experiments (Master Spec §44)

| Experiment | Question | Evidence in repo |
|------------|----------|------------------|
| A — Clean discovery | JSON discovery without secrets | `openclaw-cli.adapter.ts` discover; M03 verify |
| B — Separate worker | No personal OpenClaw mutation | `worker-environment.ts`, M03 publish path |
| C — Sandbox escape | Block sensitive paths | `security/tests/adversarial-m04.test.ts`, policy-engine |
| D — Network egress | Deny-by-default | `packages/policy-engine`, M04 |
| E — DB permission | Undeclared table denied | capability permission manifest tests |
| F — Cost attack | Timeout / caps | job limits in manifest, billing timeouts M08 |
| G — Job protocol | Outbound dispatch | M06–M07 dispatch, `verify:m06` |

Full local reproduction of G with two users remains **`pnpm test:e2e:local`** (M18 scope); M16 gates document and fixture coverage only.
