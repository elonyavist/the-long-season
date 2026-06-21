# 05 - Potential Age And Prospect Distribution

## Goal

Make initial generated squads include credible age and potential variety.

The player should see a squad that creates decisions: reliable regulars, aging players, rotation depth, young prospects, and occasionally a rare high-upside player. This phase should set up those raw ingredients without adding development, scouting, or youth intake systems yet.

## What to implement

- Apply generated player archetypes to initial squad generation.
- Ensure age, current ability, and potential are coherent:
  - veterans can be useful now but have limited upside;
  - regulars should carry the current team level;
  - rotation players should provide depth;
  - prospects should usually be weaker now but have more upside;
  - rare wonderkids should be uncommon and not guaranteed.
- Keep lower divisions plausible: rare talents can exist, but they should not appear in every third-division save.
- Add tests for deterministic distribution and edge cases.
- Add TSDoc/JSDoc comments on modified generation logic.

## What NOT to implement

- Do not simulate player growth over time.
- Do not add youth intake.
- Do not add scouting fog or scouting ranges.
- Do not add morale, personality effects, training, injuries, or staff influence.
- Do not expose exact potential in normal user-facing output.
- Do not add automatic transfer or squad recommendations.
- Do not change match engine algorithms.

## Expected files

- `packages/content/src/generators/player-archetypes.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/fake-players.test.ts`
- `packages/content/src/generators/league-system.test.ts` if generated league fixtures need updated expectations
- `docs/PROJECT_STATUS.md`
- `docs/steps/20-new-career-world-generation/06-cli-new-career-world-creation-preview.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/content run typecheck`
- focused archetype and fake-player tests
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --identity-review`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Initial squads have deterministic age/current ability/potential variety.
- Rare high-upside players are possible but controlled.
- Existing match balance remains within `calibration-v1`.
- Exact potential is not treated as normal user-facing information.
- `docs/PROJECT_STATUS.md` records observed output and any balance impact.
