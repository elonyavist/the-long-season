# Phase 34 - Match Event Concentration Rework

## Goal

Fix the remaining long-run gate blocker from Phase 33: rare but excessive concentration of goal creation on a single creator.

The target is narrow:

- understand why `phase33-generation-world-00173` fails `top_creator_goal_share_max`;
- rework creator/assist attribution only if the audit proves the current model is too concentrated;
- preserve deterministic match outcomes, match balance, and the credible player-generation model from Phase 33;
- pass the `250` worlds x `30` seasons long-run gate without widening thresholds.

## Context

Phase 33 fixed the player-generation and academy-structure problem:

- youth academies stay exactly at `11`;
- youth overpopulation and underpopulation are gone;
- generated senior/youth role-coherence warnings are zero on sampled worlds;
- match balance still passes `calibration-v1`.

The remaining failure is not a squad or generation collapse. The required `250` x `30` gate fails on exactly one world:

- seed: `phase33-generation-world-00173`;
- failing check: `top_creator_goal_share_max`;
- youth max: `11`;
- clubs above youth target: `0`;
- clubs below youth minimum: `0`;
- clubs without natural goalkeeper: `0`.

This phase must treat the issue as match-event distribution, not as a reason to loosen long-run gates.

## Product intent

The game should allow exceptional creators and high-assist seasons, but it should not routinely funnel too much of a team's goal creation through one player because of an attribution artifact.

The fix should feel football-like:

- a main playmaker can exist;
- wide players, strikers, midfielders, set-piece takers, and secondary creators should all contribute depending on chance type;
- assists and creators should not always be the same conceptual actor;
- the model should avoid artificial season-level caps such as "player cannot exceed X assists";
- distribution should emerge from chance actor selection and event context.

## Step order

1. `01-failing-world-creator-concentration-audit.md`
2. `02-creator-assist-attribution-diagnostics.md`
3. `03-creator-selection-distribution-rework.md`
4. `04-long-run-smoke-gate.md`
5. `05-phase-34-gate-and-report.md`

## Phase constraints

- Do not change player generation, youth academy generation, role caps, or development unless the audit proves a direct connection.
- Do not change match scoring probabilities or season balance tuning to hide creator concentration.
- Do not widen `top_creator_goal_share_max`, `top_three_creator_goal_share_max`, or `top_assist_max` thresholds.
- Do not add UI.
- Do not add new tactical systems, training, scouting, staff, market behavior, or youth systems.
- Do not add hard season-level caps to assists or creators.
- Preserve deterministic output by seed.
- Keep user-facing labels localized.
- Keep engine language-agnostic and storage-free.
- Do not leave obsolete attribution helpers or duplicate creator-selection paths behind.

## Phase-level checks

At the end of the phase, run:

- focused tests for touched engine/simulation-tools/CLI/i18n files;
- `pnpm check`;
- `pnpm cli ten-season-report --seed=phase33-generation-world-00173 --seasons=30`;
- `pnpm cli ten-season-report --seed-prefix=phase34-concentration --worlds=50 --seasons=10 --report-output=docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md`;
- `pnpm cli ten-season-report --seed-prefix=phase34-concentration --worlds=250 --seasons=30 --report-output=docs/audits/MATCH_EVENT_CONCENTRATION_LONG_RUN_REPORT.md`;
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`;
- `git diff --check`.

## Definition of Done

- The failing Phase 33 seed is reproducible and explained.
- The report distinguishes creator, assist, scorer, and top-three creator concentration.
- Any attribution rework is deterministic and tested.
- Match score outcomes and balance remain within `calibration-v1`.
- `50` x `10` passes before attempting `250` x `30`.
- `250` x `30` has no `top_creator_goal_share_max` failures.
- Any remaining warning is documented with exact seeds and a single next action.
- `docs/PROJECT_STATUS.md` identifies exactly one next active step.
