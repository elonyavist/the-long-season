# Step 06B23F - Empirical Assist Eligibility

## Status

Done - empirical assist eligibility implemented; Checkpoint L6.3D is next.

## Why This Step Exists

06B23E rejected the planned chance-category probability table. StatsBomb's
`shot.key_pass_id` on a goal already identifies the credited assist, so every
reachable category produced `100%`. The reusable external fact is instead the
population split: `2,596 / 3,456 = 0.7511574074` non-dead-ball goals have a
distinct credited creator.

The current game overloads two questions:

1. who contributed to creating the chance;
2. whether the goal has an assist-eligible distinct creator.

It independently draws creator and shooter, then applies a guessed
chance-category probability. That produces a third artificial class - a named
distinct creator denied assist credit - and makes the external statistic
impossible to interpret.

## Frozen Product Rule

For every ordinary routed opportunity, before its outcome is resolved:

1. draw one assist-eligibility fact at exactly `7,512` basis points from the
   versioned match-tactics asset;
2. select the shooter with the same candidate pool and the same actor roll as
   the shipped path;
3. when eligible, select the creator from the canonical creator pool excluding
   that shooter and mark the creator credited if the chance becomes a goal;
4. when not eligible, retain the independent full-pool creator selection and
   never credit an assist, even if creator and shooter differ;
5. if no distinct creator exists, eligibility is structurally unrealizable and
   the one remaining outfielder creates his own chance without an assist.

The draw remains a derived seeded stream and occurs before resolution. It never
consumes the main match RNG and never reads whether the shot becomes a goal.
The defending actor, goalkeeper and shooter must remain identical to a paired
pre-step selection for the same occasion key; only a requested same-player
creator may be redrawn from the filtered pool.

Penalty events continue to bypass `buildOccasionContext` and can never carry an
assist. The unreachable `dead_ball -> 0.25` and `set_piece -> 0.25` branches are
deleted, not retained for compatibility. Beta saves are disposable.

## Versioned Content

`ChanceActorSelectionCalibrationConfig` gains one
`nonSetPieceAssistEligibilityBasisPoints` integer. It is neither zero nor
`10000`: both outcomes must remain reachable. The content value is `7512`, the
nearest basis point to the frozen external share. Match-tactics schema and
asset versions advance together; all fixtures read the same owner.

No per-route, per-shot-type or per-role assist table is introduced. 06B23E
proved those rates cannot be derived from the chosen source.

## Verification And Reachability

Focused tests must prove:

- the validator refuses absent, zero, `10000`, non-integer and out-of-range
  eligibility;
- at least one real deterministic opportunity corpus reaches eligible,
  ineligible and forced-distinct creator cases;
- a one-outfielder legal fixture reaches the explicit self-created exception;
- paired old/new actor selection holds shooter, defender and goalkeeper fixed;
- no eligible ordinary goal can omit its assist and no ineligible goal can gain
  one;
- penalty events remain unassisted without entering the ordinary occasion path;
- no old probability function, category coefficient or dead-ball branch remains.

The implementation itself does not claim balance success. It opens a fresh
seven-world one-season checkpoint which reports separately:

- non-set-piece assisted share, target `0.7512 +/- 0.02`;
- all-goal assisted share, diagnostic against external `0.6710`;
- penalty/dead-ball goal share in game versus external `0.1067`;
- top-ten assist mean and all existing actor/reconciliation guardrails.

If non-set-piece share misses, reopen only this step. If it holds while all-goal
share misses materially, assist semantics are absolved and the residual owner
is dead-ball supply; it is not repaired inside this step.

## What NOT To Implement

- no category-specific assist probability;
- no output-derived rescaling to make the game's all-goal share equal `0.6710`;
- no penalty or direct-free-kick frequency change;
- no creator propensity, shooter propensity, goal conversion or table change;
- no report simulator outside `pnpm cli simulation-report`;
- no persistence compatibility reader or dead branch.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts` and test: typed
  content owner, validation and schema version;
- `packages/content/src/schemas/match-tactics-calibration.schema.ts` and test,
  `packages/content/src/balance/match-tactics-calibration.json` and test:
  strict asset parsing and value;
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts` and
  `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`:
  shared test assets follow the one versioned contract;
- `packages/engine/src/match-engine/chance-actors.ts` and test: filtered creator
  selection while preserving the shooter roll;
- `packages/engine/src/match-engine/occasion-context.ts` and test: pre-outcome
  eligibility and removal of the old probability table;
- any existing deterministic golden whose serialized calibration identity
  changes, added here with the measured reason before rerecording;
- this step, Phase README, `docs/PROJECT_STATUS.md` and the next checkpoint
  document.

## Required Verification

```bash
nvm use 24.16.0
pnpm exec vitest run packages/domain/src/balance/match-tactics-calibration.test.ts
pnpm exec vitest run packages/content/src/schemas/match-tactics-calibration.schema.test.ts packages/content/src/balance/match-tactics-calibration.test.ts
pnpm exec vitest run packages/engine/src/match-engine/chance-actors.test.ts packages/engine/src/match-engine/occasion-context.test.ts packages/engine/src/match-engine/step-match.test.ts
pnpm check
git diff --check
graphify update .
```

## Outcome

The versioned asset now owns one `7512` basis-point non-set-piece eligibility
share. Ordinary opportunities settle it before actor selection and resolution;
eligible creator pools exclude the already-selected shooter while preserving
the shipped shooter, defender and goalkeeper rolls. Ineligible opportunities
retain the full creator pool. A one-outfielder context explicitly remains
self-created and unassisted.

The four guessed category coefficients, including the unreachable dead-ball
branch, no longer exist. Schema `4` and asset `match-tactics-calibration-v5`
move together; beta compatibility residue was not added. Focused verification
passes `110` tests. The full solitary gate passes `307` files / `2,404` tests,
`882` modules with no dependency violation, all custom checks and typecheck.
No deterministic golden required rerecording.

This step proves structure and reachability, not population balance. 06B23G
owns the fresh `7 x 1` measurement.
