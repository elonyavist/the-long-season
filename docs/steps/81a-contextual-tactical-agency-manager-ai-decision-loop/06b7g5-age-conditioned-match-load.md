# Step 06B7G5 - Age-Conditioned Match Load

## Status

Done. The integrated L5 canary measured the result and recorded `REFINE` on
leader quality/renewal, not on minute rotation.

## Goal

Turn the already-measured minute load into credible rotation pressure for older
players without applying age directly to goals, assists or match strength.

## Evidence And Owner

The development correction reached parity in `7/7` worlds and opening-senior
survival fell to `0.5481`, but opening players still owned `0.7929` of season-
ten leaderboard places. The exact season-ten rows explain why: `2,004` active
opening seniors aged `33+` produced `4,025,380` minutes and `197` leaderboard
places; `1,964` of them were selected. The existing eight-point full-match cost
is age-blind, while the old seven-day recovery bound deliberately lets an
exceptional veteran return to at least `95`. That contract permits the observed
near-automatic weekly start.

## Frozen Correction

- keep minutes as the only workload quantity;
- keep age out of goals, assists, actor selection and base ability;
- add a continuous match-load multiplier beginning after exact age `30`: `30%`
  per year, capped at `2.5x`; a 90-minute appearance costs `8` at age `30`,
  `15.2` at age `33`, and at most `20`;
- raise the high-resilience recovery half-life multiplier from `0.2x` to `1.4x`.
  Exceptional resilience still beats fragile resilience (`1.4x < 1.8x`) but no
  longer erases the older player's dated load;
- use the same versioned content policy in progressive CLI, progressive web and
  automatic background seasons;
- retain the prime-player weekly recovery guarantee; supersede the old
  any-age `>=95` guarantee, which the ten-season evidence falsified.
- retain the old three-day deficit and adjacent-age figures as diagnostics,
  not gates: they measured recovery alone, while the new exact cost formula has
  its own analytic tests and deliberately adds a second continuous age effect.

## Expected Files

- `packages/domain/src/balance/player-state-curves.ts` and test;
- `packages/content/src/balance/player-state-curves.json`, selector and test;
- `packages/engine/src/player-state/fitness.ts` and test;
- `packages/engine/src/test-fixtures/player-state-curves-config.ts` **(new)**;
  one complete engine test policy replaces four local copies;
- `packages/engine/src/career/career-condition-consequences.ts` and test;
- `packages/engine/src/career/progress-fixture.ts` and test;
- `packages/engine/src/use-cases/simulate-season.ts` and test;
- `apps/cli/src/commands/career/progression.ts` and tests;
- `apps/web/src/features/matchday/matchday-adapter.ts` and tests;
- `apps/cli/src/commands/simulation-report/career-sections.ts` and test;
- report registry fresh-cache ownership, this document, phase README and
  `docs/PROJECT_STATUS.md`.

## Definition Of Done

Real generated players reach the age-load curve, exact minutes reconcile, CLI,
web and background callers consume the same owner, and the integrated L5 canary
remeasures age/minutes/leaderboard behaviour without a direct age outcome
penalty.

## Recorded L5 Handoff

No club fielded one identical XI in all 34 matches and only `0.021090` of
retained `33+` leaders played all 34. Substitution, availability and injury
gates held. The remaining `33+` leaderboard excess and `0.207143` generated-
leader share therefore do not authorize more generic fatigue or injuries; L5
assigns them to a new paired quality/retention attribution before any further
behaviour change.
