# Step 08 - Non-Vacuous Transfer-Race Diagnostics

## Status

Not started.

## Goal

Make race behaviour measurable through a dedicated diagnostic Module: every
gate reports how many observations it saw, and structural failures remain
distinct from calibration warnings.

## Expected Files

- `packages/simulation-tools/src/transfer-race-audit.ts`
- `packages/simulation-tools/src/transfer-race-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `docs/steps/82b-competitive-transfer-race-and-player-choice/08-non-vacuous-transfer-race-diagnostics.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Every race gate carries an explicit `observationCount`. Zero observations is
  `not_evaluated` or failure, never `PASS`.
- Add regression fixtures proving a zero-observation race gate cannot pass.
- Report, with positive denominators:
  - races opened by one, two, and three active participants, races with two or
    more participants, rejected fourth joins, and places reused after a
    pre-deadline closure;
  - matches, raises submitted, rejected below increment or stale observation,
    accepted raises, and withdrawals;
  - seller-acceptable sets, highest-fee qualification sets, lower acceptable
    `outbid` closures, and exact highest-fee ties;
  - late joiners inheriting a shortened club-stage deadline and exactly one
    player-stage clock opening after qualification;
  - deadline-day player stages observed before resolution, with zero
    create-and-expire-in-one-transition cases;
  - player-stage comparisons with two or more suitors;
  - `lost_to_rival` closures and their Posta delivery;
  - free-agent races and winners, including positive observations of
    one-suitor free agents waiting through the full shared three-day stage;
  - zero competitive loan races in this release, while serial Phase 82A loan
    negotiations remain observable through their existing owner;
  - zero stale-ownership completion failures caused by race losers.
- Treat double completion, race-reference corruption, deadline mutation, or a
  race loser reaching atomic completion as structural hard failures.
- Treat more than three active clubs, a loan negotiation admitted to a race,
  early manager-accept completion, or a one-suitor free agent bypassing its
  player-stage clock as structural hard failures.
- Treat frequencies such as race rate and manager raise rate as calibration
  evidence against thresholds frozen before execution, not structural truth.
- Keep this module independent from
  `player-generation-economy-audit.ts`: player supply and transfer competition
  have separate observations and separate owners.
- Make the denominator discontinuity explicit in report data. Once races
  exist, the legacy Phase 79D seller/counter-spread population excludes
  `outbid` and `lost_to_rival`, while the dedicated race audit counts them.
  Report the total canonical permanent-negotiation count, the legacy-eligible
  observation count, and the race-only terminal exclusion count separately.
  Pre-82B and post-82B legacy spread rates are therefore non-comparable unless
  recomputed over the same eligibility definition; do not present the smaller
  denominator as an improvement or regression.

## What NOT To Implement

- No behaviour, persistence, policy, or threshold change.
- No warning suppression or seed exception.
- No cohort.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/transfer-race-audit.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
git diff --check
```

## Definition Of Done

- No race gate can pass on an empty population.
- Every forced structural fixture reports a positive observation count;
  naturally sampled slices report a positive count or `not_evaluated`, never a
  vacuous pass.
- Structural failures and calibration warnings have distinct machine-readable
  outcomes.
- Transfer-race diagnostics do not deepen the unrelated player-generation
  audit.
- The report exposes positive, reconcilable canonical, legacy-eligible, and
  race-only-excluded counts, and labels the pre/post-82B legacy spread
  discontinuity.
- Participant counts never exceed three, and the loan-race absence check has a
  positive underlying loan-negotiation observation rather than passing because
  no loans occurred.
