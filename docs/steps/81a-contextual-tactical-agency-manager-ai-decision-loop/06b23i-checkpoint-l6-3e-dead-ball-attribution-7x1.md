# Step 06B23I - Checkpoint L6.3E Dead-Ball Attribution 7 x 1

## Status

Done - `OWNER_IDENTIFIED`: penalty award frequency and direct-free-kick path.

## Question

Within the already-proven `dead_ball_supply` residual, do penalty awards,
penalty conversion and the missing direct-free-kick path each require work?

## Frozen Population

- canonical `pnpm cli simulation-report` only;
- profile `phase81a-dead-ball-attribution-l6-3e-7x1`;
- fresh prefix `phase81a-dead-ball-attribution-l6-3e-v1`;
- exactly `7` worlds, `1` season and `7` workers;
- First Division comparison, all divisions simulated normally;
- standard JSON, complete career sections, no cache reuse or HTML.

## Canonical Game Facts

Extend the existing assist-supply post-match observer; do not add a second
fixture walk. For every First-Division report record:

- played fixture count;
- `penalty_awarded` count;
- `penalty_outcome` counts for scored, saved and missed;
- penalty goals from the existing mutually exclusive goal classification.

Reconciliation requires awards = outcomes and scored outcomes = penalty goals.
All three outcomes must be reachable. Derive attempts/match, goals/match and
conversion from those counts.

The direct-free-kick path is a structural code fact, not a zero inferred from a
missing event: the current engine and durable event union expose no direct-free-
kick award or outcome. The audit records `not_implemented`; the simulation does
not manufacture a numeric zero row.

## Frozen External Bands

| Metric | External | Tolerance |
|---|---:|---:|
| penalty attempts / match | `0.2636783125` | `+/- 0.03` |
| penalty conversion | `0.7500` | `+/- 0.04` |
| penalty goals / match | `0.1977587343` | diagnostic cross-check |
| direct-free-kick goals / match | `0.0744891233` | structural positive reference |

The first two decide penalty owners independently. Goals/match must reconcile
to their product within floating-point tolerance; it is never tuned separately.

## Decision

- **OWNER_IDENTIFIED** with a list containing:
  - `penalty_award_frequency` only when attempts/match misses its band;
  - `penalty_conversion` only when conversion misses its band;
  - `direct_free_kick_path` because the external positive path is absent;
- **STOP / RETHINK** for missing outcome branches, nonzero reconciliation,
  profile drift or any mismatch between goal facts and penalty events.

At least one owner is guaranteed by the structural free-kick fact, so `GO`
without an owner is not a possible result. Owners remain separate; a later
implementation may correct more than one only if each appears here.

## What NOT To Implement

- no penalty award, conversion, free-kick, foul or event-schema change;
- no combined coefficient;
- no reuse of the previous 7x1 as if it contained penalty attempts;
- no report entrypoint besides `simulation-report`.

## Expected Files

- `apps/cli/src/commands/simulation-report/assist-supply-attribution.ts` and
  test: add event-derived penalty attempt/outcome facts and the owner reader;
- `historical-simulation-targets.ts` and test: external penalty bands;
- `career-sections.ts`: route the existing observer to L6.3E;
- `report-registry.ts`, `report-planner.test.ts`, i18n labels: locked profile;
- this step, Phase README, status, generated audit and index;
- one implementation step only after `OWNER_IDENTIFIED`.

## Required Verification And Command

```bash
nvm use 24.16.0
pnpm exec vitest run apps/cli/src/commands/simulation-report/assist-supply-attribution.test.ts apps/cli/src/commands/simulation-report/report-planner.test.ts
pnpm check
pnpm cli simulation-report \
  --profile=phase81a-dead-ball-attribution-l6-3e-7x1 \
  --format=json \
  --report-output=simulation-out/phase81a-dead-ball-attribution-l6-3e-7x1.json
git diff --check
graphify update .
```

## Outcome

The fresh `2,142`-fixture population reconciles `478` awards to `356` scored,
`76` saved and `46` missed outcomes. Penalty attempts are `0.2232` per match,
below external `0.2637 +/- 0.03`; conversion is `0.7448`, inside `0.75 +/-
0.04`. Only `penalty_award_frequency` opens. Conversion is explicitly closed.

The external direct-free-kick path is positive at `0.0745` goals per match and
the game path is structurally `not_implemented`, so `direct_free_kick_path`
also opens. 06B23J changes only the penalty frequency; free-kick geometry is
measured separately afterward.
