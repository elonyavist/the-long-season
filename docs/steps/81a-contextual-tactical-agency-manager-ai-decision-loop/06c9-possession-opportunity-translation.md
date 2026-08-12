# Step 06C9 - Possession-To-Opportunity Translation

## Status

Active. Quality, route volume and their endpoint interaction are insufficient;
all candidates were removed.

## Goal

Test the next structural dilution point, not another route coefficient. The
route plan changes `controlMultiplier`, which changes possession, but
`chanceCreationMultiplier(...)` currently compresses that possession claim to
`1 + (share - 0.5) * 0.56` before adding direct-play counter relief. The `0.56`
is hardcoded and unversioned; the analytic threat that passed Phase 1 uses the
uncompressed possession claim.

Move the exact `0.56` to one versioned
`possessionChanceInfluenceBasisPoints = 5600` field, deriving the symmetric
minimum and maximum from that single slope. Prove exact replay equality before
testing any candidate.

## Durable Measurement Profile

Add `phase81a-b2-current-materiality` to the canonical `simulation-report`.
Unlike the accepted 06C5 profile, it evaluates the current calibration without
claiming exact equality to historical 06C4. It reuses the same complete-row
producer, populations, seeds and seven workers. It remains useful after this
step and replaces temporary candidate-only profiles, which are removed at their
step closeout.

## Frozen Candidate Order Before Output

Evaluate `9000`, `12000`, then `15000` basis points, stopping at the first
passing candidate. They translate possession around neutral as slopes
`0.9 / 1.2 / 1.5`; even the last remains below the analytic local slope of `2`
and preserves direct-play relief for low-possession football. No result may
authorize a fourth value.

## Frozen Acceptance

- `5600` migration reproduces all accepted 06C5 selected and blind values at
  exact equality;
- Phase 1 passes twice and all `21/21` population rows hold;
- complete-row optimistic ceiling is `>= +0.045` and exposure `<= -0.045` in
  both sets;
- context-free stays within `|delta| <= 0.015`, interval compatible with zero;
- original composition, formation and tactic dominance stay `<= 0.55`;
- low-block conceded-xG reduction stays `>= 0.08` and exchange is no worse
  than `1.93969 / 2.17507`;
- only `possessionChanceInfluenceBasisPoints` changes after migration.

After a complete-row pass, independent B2 decides `GO` or assigns only
`selection_power`. If all candidates fail, restore `5600`; the route-to-chance
path is exhausted and the next step must inspect match-outcome resolution or
the frozen `0.045` product premise rather than increasing coefficients.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts` and test;
- `packages/content/src/balance/match-tactics-calibration.json`, schema and
  content/schema tests;
- engine and simulation-tools calibration fixtures;
- `packages/engine/src/match-engine/match-control.ts` and test; remove all three
  duplicated hardcoded slope/min/max values;
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`,
  `report-registry.ts` and `report-planner.test.ts`; add one durable current
  materiality profile without duplicating the producer;
- `packages/i18n/src/labels.ts` for the visible profile;
- `docs/audits/PHASE_81A_POSSESSION_OPPORTUNITY_TRANSLATION.md` **(new)**;
- `docs/audits/README.md`;
- `docs/PROJECT_STATUS.md`;
- this step document;
- `06c8-route-quality-volume-interaction.md`;
- `README.md`;
- `07-player-task-execution.md` only after B2 `GO`.

Any discovered file is added here with its ownership before editing it.

## Required Checks

Every profile runs alone with exactly seven workers and real exit capture.

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b2-materiality --workers=7 \
  --format=json --report-output=simulation-out/phase81a-b2-control-baseline.json
pnpm cli simulation-report --profile=phase81a-b2-current-materiality --workers=7 \
  --format=json --report-output=simulation-out/phase81a-b2-control-candidate.json
pnpm cli simulation-report --profile=phase81a-b2 --workers=7 --format=json \
  --report-output=simulation-out/phase81a-checkpoint-b2-independent-replay.json
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

The hardcoded compression is gone, `5600` proves exact equivalence, the first
passing candidate is adopted or all are removed, the durable current profile is
runnable on final content, and no target or non-contextual bonus is introduced.
