# Season Lineup Overrides

## Goal

Apply explicit user-selected lineup overrides during season simulation.

## Why we implement it this way

Once a lineup override contract exists, the season use-case can apply it to selected fixtures. This is where manual rotation becomes meaningful: selected starters spend fitness, non-selected players can recover, and the fixture result may change because the lineup changed.

The important rule remains: the user chooses the lineup. The season simulation only applies the provided choices.

## What to implement

- Extend `simulateSeason` to accept explicit lineup overrides for selected fixtures.
- Apply the override only when:
  - the fixture ID matches;
  - the selected club participates in that fixture;
  - the override validates through the existing lineup/team-context path.
- Recompute team strength from the overridden lineup and current player states when fitness lifecycle is enabled.
- Preserve default behavior when no lineup overrides are supplied.
- Return enough result data for the later CLI step to inspect:
  - fixture result;
  - selected starters;
  - rested players if available from input/profile data;
  - final player states when lifecycle is enabled.
- Add focused tests proving:
  - default no-override output is unchanged;
  - one explicit fixture override changes only the intended fixture/team context;
  - fitness spend applies to overridden starters;
  - rested players are not charged match fitness for that fixture;
  - same seed plus same overrides is deterministic.
- Document exported functions/types with TSDoc/JSDoc where useful.

## What NOT to implement

- Do not add CLI output in this step.
- Do not add automatic rotation, fatigue-aware selection, or AI recommendations.
- Do not add arbitrary player picking, substitutions, bench usage, injuries, suspensions, form, morale, training, tactical familiarity, UI, persistence, or career mode.
- Do not change calendar generation, table rules, scoring conversion probabilities, calibration target ranges, or fake content strength spread.
- Do not mutate content player states in place.
- Do not leave old override helpers duplicated if the new fixture override path replaces them.

## Allowed dependencies

- `engine -> domain, shared`

## Expected files

- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/11-manual-lineup-rotation-v1/05-cli-lineup-condition-inspection.md` only if a lesson learned changes the CLI inspection scope.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `simulateSeason` can apply explicit fixture lineup overrides.
- No-override behavior remains deterministic and backward-compatible.
- Fitness lifecycle charges overridden starters and does not charge rested players for that fixture.
- The implementation represents user-selected lineups only; no automatic selection exists.
- Code is clear, typed, documented where useful, and has no unused helpers.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Wire explicit fixture lineup overrides into `simulateSeason` only. Do not add CLI output or automatic rotation. Keep code clean, typed, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me whether season output or balance metrics changed, and stop.
