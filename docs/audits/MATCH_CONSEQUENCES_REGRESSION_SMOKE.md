# Match Consequences Regression Smoke

Date: 2026-06-29
Phase: `64-match-consequences-and-player-state-reactivity`
Step: `07a-content-rare-prodigy-test-runtime-stabilization`

## Summary

Phase 64 focused tests, career smoke, ten-season report, strict balance gate,
and broad `pnpm check` now pass.

Step 07 originally exposed an unrelated full-suite timeout in the content
rare-prodigy test. Step 07a stabilized that test without changing gameplay
tuning, player-generation probabilities, match consequences, or long-run
thresholds.

## Commands Run

| Command | Result | Notes |
|---|---|---|
| `pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts` | PASS | 5 tests passed. |
| `pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts` | PASS | 8 tests passed. |
| `pnpm exec vitest run apps/cli/src/commands/career.test.ts` | PASS | 30 tests passed. |
| `pnpm cli career --save=phase64-check --seed=world-a --new-world-preview` | PASS | Save created. |
| `pnpm cli career --save=phase64-check --set-lineup-demo=pro01-first-team` | PASS | Saved selected lineup. |
| `pnpm cli career --save=phase64-check --set-tactic-demo=pro01-balanced` | PASS | Saved selected tactic. |
| `pnpm cli career --save=phase64-check --advance-next-fixture --fixture-explanation` | PASS | Fixture advanced and post-match player state printed. |
| `pnpm cli career --save=phase64-check --summary` | PASS | Next selected fixture retargeted to `fixture:000011`. |
| `pnpm cli career --save=phase64-check --squad` | PASS | Squad showed starter fitness/form/morale changes. |
| `pnpm cli ten-season-report --seed=phase64-world --seasons=10` | PASS | Anomaly scoring PASS; youth academy stability PASS. |
| `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict` | PASS | Strict balance status PASS. |
| `pnpm check` | BLOCKED before Step 07a | Failed on `packages/content/src/generators/fake-players.test.ts` timeout. |
| `pnpm exec vitest run packages/content/src/generators/fake-players.test.ts` | PASS after Step 07a | 14 tests passed; runtime around 1.17s. |
| `pnpm exec vitest run packages/engine/src/career/career-match-state-consequences.test.ts` | PASS after Step 07a | 5 tests passed. |
| `pnpm exec vitest run packages/engine/src/career/progress-fixture.test.ts` | PASS after Step 07a | 8 tests passed. |
| `pnpm exec vitest run apps/cli/src/commands/career.test.ts` | PASS after Step 07a | 30 tests passed. |
| `pnpm check` | PASS after Step 07a | 126 test files and 791 tests passed. |

## Career Advancement Output Notes

The Phase 64 smoke advanced `fixture:000003`, with result:

- `U.S. Pisa 3-0 S.S. Perugia`

The new player-state output was present:

- `Changed players: 11; form -21; morale -32`
- Starting players moved from neutral `form=50` and `morale=50` to lower values.
- The goalkeeper received `loss`, `heavy loss`, and `goalkeeper saves` reasons.
- The squad inspection afterwards showed starters at `Fit=92`, `Form=48..49`,
  and `Morale=47..48`, while rested players remained at `100/50/50`.

This confirms the saved career state now reacts to the played match.

## Long-Run And Balance Notes

Ten-season report:

- Overall anomaly scoring: PASS.
- Youth academy stability: PASS.
- Role coverage warnings: 91, still within the documented pass threshold.
- Top assist max: 12, PASS.
- Champion streak: 2, PASS.

Strict balance report:

- Status: PASS.
- Goals per match: 3.102 inside `2.000..3.200`.
- Table points spread: 43.800 inside `36.000..60.000`.
- Upset proxy rate: 0.370 inside `0.150..0.450`.

## Warning Classification

The repeated warning:

```text
Unsupported engine: wanted node 24.19.0, current node v24.14.0
```

appears only inside repo scripts that invoke the globally resolved `pnpm` from
the Codex runtime. Direct verification commands used `nvm use 24.19.0` plus
`corepack pnpm`, and all focused gates passed. This is an environment-wrapper
warning, not a gameplay regression.

## Step 07a Root Cause And Stabilization

The original broad-suite blocker was:

```text
packages/content/src/generators/fake-players.test.ts
rare prodigies are possible across generated career worlds but not guaranteed
```

The test generated 80 complete career-world player pools to prove the product
contract that rare prodigies can exist but are not guaranteed. That brute-force
shape was semantically valid but too expensive under the full `pnpm check`
Vitest suite, causing a 5000ms timeout.

Step 07a replaced the 80-world scan with two deterministic seed fixtures from
the same existing seed family:

- `wonderkid-sample-0`: contains a `rare_prodigy`;
- `wonderkid-sample-1`: contains no `rare_prodigy`.

This keeps both gameplay assertions intact:

- rare prodigies are possible;
- rare prodigies are not guaranteed in every generated world.

No production content generation, rarity budget, probability, match engine, or
match-consequence code was changed.

## Current Blocker

None.

## Decision

Phase 64 is no longer blocked by the broad-suite timeout. Continue to the
Phase 64 final report and next-phase decision step.
