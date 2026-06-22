# Step 10 - Long-Run Gates And Phase Report

## Goal

Close Phase 33 with evidence that the player generation and development model is credible enough to return to long-run career validation.

## Context

This phase is not complete when unit tests pass. It is complete when reports show that generated players stay credible over time and academy/squad structure no longer produces the known Phase 32 warnings and failures.

## Expected files

- `docs/audits/PLAYER_ROLE_AND_ABILITY_GENERATION_REPORT.md`
- `docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Run the phase-level checks.
- Record:
  - senior current-ability distribution;
  - youth current-ability distribution;
  - potential-band distribution;
  - role-coherence cap violations;
  - academy post-refill size/composition;
  - aged-out youth resolution;
  - development cap violations;
  - top scorer/top assist/top creator concentration;
  - role coverage warnings vs Phase 32;
  - match balance regression.
- Compare Phase 33 results to Phase 32 final report:
  - youth underpopulation warning should be eliminated after refill;
  - youth overpopulation must remain controlled;
  - `top_creator_goal_share_max` failures must be investigated and either resolved or documented as a separate match-event distribution issue.
- Decide the next single active step:
  - return to a Phase 32/31 long-run gate re-run;
  - create a narrow match-event concentration rework;
  - continue toward career-world long-run simulation;
  - defer UI until long-run structure is credible.

## What NOT to implement

- Do not start the next phase.
- Do not hide failed seeds.
- Do not widen thresholds without evidence and a documented decision.
- Do not change match scoring in the final report step.
- Do not add UI.

## Required checks

- `pnpm check`
- `pnpm cli simulate-season --seed=world-a --player-generation-report`
- `pnpm cli simulate-season --seed=world-b --player-generation-report`
- `pnpm cli career --save=phase33-world-a --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase33-world-a --development-report`
- `pnpm cli ten-season-report --seed-prefix=phase33-generation --worlds=50 --seasons=10 --report-output=docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md`
- `pnpm cli ten-season-report --seed-prefix=phase33-generation --worlds=250 --seasons=30 --report-output=docs/audits/PLAYER_ROLE_AND_ABILITY_LONG_RUN_REPORT.md`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`
- `git diff --check`

## Definition of Done

- Phase 33 report exists.
- Long-run reports show no generation-coherence failures.
- Academy post-refill structure is stable.
- Any remaining `top_creator_goal_share_max` failure is classified with failing seeds and a next narrow step.
- `docs/PROJECT_STATUS.md` identifies exactly one next active step.
