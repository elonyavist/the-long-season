# Step 06B23J - Versioned Penalty Award Frequency

## Status

Done - `3500` basis points accepted by the fresh L6.3F checkpoint.

## Authorized Owner

06B23I measured penalty attempts at `0.2231559290` per match against external
`0.2636783125 +/- 0.03`, while conversion held at `0.7448`. Change only the
award gate after a dangerous foul. Conversion, foul production, cards,
zone-danger derivation and direct free kicks remain untouched.

## Frozen Candidate

Move `PENALTY_AWARD_PROBABILITY_AFTER_DANGEROUS_FOUL` from the engine literal
`0.30` into a typed `MatchEngineConfig.discipline` section as integer basis
points. The accepted candidate is `3500` (`0.35`): a modest one-sixth increase,
rounded to a stable content value rather than the exact output-fitted ratio.

`discipline.version = match-discipline-calibration-v1` travels with the config
and appears in report calibration versions. Validation requires a non-empty
version and an interior basis-point share. There is one owner; tests and callers
do not copy the value. No optional field or compatibility default survives.

## Reachability And Preservation

- real deterministic match seeds reach both awarded and non-awarded dangerous
  fouls under `3500`;
- a paired test with identical RNG inputs proves the candidate can add awards
  but cannot alter which penalties score once awarded;
- saved, missed and scored branches remain reachable;
- the full context validator rejects absent/invalid discipline calibration;
- the old engine literal is deleted.

## Checkpoint

Open a fresh `7 x 1 x 7` profile after the code gate. Penalty attempts per match
must enter `0.2636783125 +/- 0.03`; conversion must remain in `0.75 +/- 0.04`.
All event reconciliation and assist-semantic guardrails remain binding. Failure
reopens only this step; direct free kicks stay outside this checkpoint.

## What NOT To Implement

- no conversion, free-kick, foul, card, assist, goal-rate or table change;
- no exact coefficient solved from the observed game ratio;
- no optional config field, default or compatibility reader;
- no second report entrypoint.

## Expected Files

- `packages/engine/src/match-engine/match-engine-config.ts`: typed discipline
  section and validation;
- `packages/engine/src/match-engine/match-engine-config.test.ts` **(new)**:
  fail-closed validation and paired real-seed award reachability;
- `packages/engine/src/match-engine/match-discipline.ts` and tests: consume the
  versioned share, preserve conversion and prove reachability;
- `packages/content/src/generators/gameplay-config.ts` and test: sole shipped
  `3500` / version owner;
- existing test and simulation fixtures constructing `MatchEngineConfig`,
  added here before edit after typecheck enumerates the exact list;
- `packages/engine/src/test-fixtures/match-engine-config.ts` **(new)** plus the
  thirteen enumerated readers: `career/progress-fixture.test.ts`,
  `match-engine/aggregate-occasion-resolver.test.ts`, `match-context.test.ts`,
  `match-control.test.ts`, `match-explanation-trace.test.ts`,
  `match-team-exit.test.ts`, `occasion-context.test.ts`,
  `progressive-match-session.test.ts`, `simulate-match-with-manual-tactics.test.ts`,
  `simulate-match.test.ts`, `step-match.test.ts`,
  `team-selection/ai-in-game-decisions.test.ts` and
  `use-cases/simulate-season.test.ts`. They import one fixture rather than
  copying a thirteenth valid discipline object;
- `packages/simulation-tools/src/test-fixtures/match-engine-config.ts` **(new)**
  plus `calibration-report.test.ts`, `long-run/career-long-runner.test.ts`,
  `long-run/long-runner.test.ts` and
  `tactical-shape/tactical-shape-audit.test.ts`: the downstream package cannot
  import engine-private test fixtures, so it owns one local complete config
  builder rather than four copies;
- report calibration-version projection and tests;
- this step, Phase README, status and the fresh checkpoint step.

## Required Verification

```bash
nvm use 24.16.0
pnpm exec vitest run packages/engine/src/match-engine/match-discipline.test.ts packages/content/src/generators/gameplay-config.test.ts
pnpm check
git diff --check
graphify update .
```

## Outcome

The old engine literal is gone. `MatchEngineConfig.discipline` now carries the
required `match-discipline-calibration-v1` stamp and the sole shipped `3500`
basis-point value comes from content. The paired real-seed search reaches
unchanged decisions, newly awarded penalties and retained non-awards without
changing the conversion path.

The complete gate passed: `308` test files, `2,417` tests, `885` modules with
zero dependency violations, all custom checks and typecheck green. L6.3F then
measured `0.2623716153` attempts per match and `0.7259786477` conversion, so the
candidate is accepted. Direct free kicks remain the separate structural owner.
