# Step 10 - Checkpoint D: Seven-By-Fifteen Longitudinal Pyramid

## Status

Blocked behind Checkpoint C GO.

## Goal

Run the decisive fifteen-season cohort, identify the actual remaining owner of
any generational failure, and refuse coefficient tuning without attribution.

## What To Implement

- Run frozen `7 x 15`, exactly seven workers, alone, with stable shards/cache
  signature and canonical JSON artifact.
- Measure every season and aggregate:
  - ability pyramid by division/origin/age/role;
  - generated share of population, appearances, minutes, goals, assists,
    starters and leaders;
  - forecast class at intake versus realized maximum/final band;
  - early/normal/late timing and longevity outcomes;
  - permanent damage and retirement;
  - high-tail allocation `3:2:1`;
  - opening cohort survival;
  - AI intent funnel and transfer movement;
  - champion points/goals and competitive/upset monitors;
  - top-performer ages and over-33 historical gates;
  - formation/squad identity persistence;
  - all structural/finance/report reconciliations.
- Use exclusive primary failure owner per player/need plus cross-cutting facts;
  do not hide censoring or multiple applicable mechanisms.
- Attribute candidate failures using paired/ablated evidence where needed.
  A multi-change delta without pairing is unresolved.
- Produce owner table mapping every red gate to exactly one of:
  population, forecast, realization, aging/damage, retirement, AI need, target
  scoring, market constraints, or instrument.
- Emit the exact D/E longitudinal metric IDs from
  [`IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md`](IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md),
  per world and aggregate. Censored players and multiple cross-cutting facts
  never disappear behind the exclusive primary owner.
- Decision:
  - GO if all gates pass;
  - REFINE with owner set opening Step 11;
  - STOP_RETHINK if the architecture cannot support product outcomes;
  - STOP_INSTRUMENT on any reconciliation/purity/cache issue.

## What NOT To Implement

- No correction or post-output threshold in this step.
- No owner chosen from narrative impression alone.
- No broad 50x20 yet.
- No HTML required, though a diagnostic view may be rendered from JSON.

## Expected Files

- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and test
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test
- `apps/cli/src/commands/simulation-report/generational-succession.ts` and test
- `apps/cli/src/commands/simulation-report/owner-attribution.ts` and test
- `apps/cli/src/commands/simulation-report/renewal-architecture-attribution.ts`
  and test
- `apps/cli/src/commands/simulation-report/stationary-age-succession-attribution.ts`
  and test
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test
- `apps/cli/src/commands/simulation-report/historical-simulation-targets.ts`
  and test
- `apps/cli/src/commands/simulation-report/league-diversity-gate.ts` and test
- `apps/cli/src/commands/simulation-report/long-run-profile-checkpoints.ts` and
  test
- `packages/simulation-tools/src/modular-report/report-contract.ts` and test
- `packages/simulation-tools/src/modular-report/season-prefix-hash.test.ts`
- one new longitudinal evaluator only if the listed Modules cannot own the new
  semantics; its exact path is added here before creation and its superseded
  owner is removed in the same step
- `IMPLEMENTATION_AND_CHECKPOINT_REGISTER.md` only for a pre-output correction
  demanded by production truth
- `docs/audits/PHASE_81B_CHECKPOINT_D_7X15.md`
- `docs/audits/README.md`
- this step, Step 11 ownership update and `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report \
  --profile=phase81b-longitudinal-d-7x15 \
  --workers=7 --format=json \
  --report-output=simulation-out/phase81b-d-7x15.json
pnpm check
git diff --check
```

Run alone; record duration, shards, workers, exit, artifact/report hashes.
The locked profile owns its checkpoint directory; `simulation-report` has no
`--checkpoint-dir` option.

## Definition Of Done

- Fifteen-season population is complete, reconciled and non-vacuous.
- Every red gate has a named owner or is explicitly unresolved.
- No correction has been made.
- GO skips Step 11 to closeout repeat/final breadth as documented; REFINE opens
  only the owner list in Step 11.
