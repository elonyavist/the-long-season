# Segmented Fixture Simulation

## Goal

Allow one fixture simulation to apply an explicit manual tactic switch from a declared minute onward.

## Why we implement it this way

The current season simulation uses one team context per club for the full match. Manual tactic switching requires the match driver to use the correct context for each minute segment. This is still not a live match session: the caller provides the switch schedule up front, and the engine runs deterministically.

This step should prove the core engine can handle manual tactical segments before the CLI exposes a user-facing inspection command.

## What to implement

- Add a narrow fixture/match simulation path that accepts manual tactic changes from the previous step.
- Apply the active team context by minute while reusing existing `stepMatch` behavior.
- Preserve event ordering, report creation, player stats derivation, and deterministic RNG behavior.
- Add focused tests proving:
  - no changes means output matches the existing simulation path;
  - a manual switch at minute X changes output deterministically;
  - invalid schedules fail through typed errors;
  - the engine does not choose changes automatically.
- Export only the minimal helper needed by the CLI step.

## What NOT to implement

- Do not add live interactive match sessions, pause/resume, or command input during execution.
- Do not add automatic tactical switching based on score/minute/context.
- Do not add substitutions, team talks, fatigue, morale, injuries, cards, player ratings, possession, xG, UI, persistence, market, economy, staff, youth, facilities, or media.
- Do not change default season simulation behavior unless this step explicitly documents and tests the compatibility path.
- Do not tune scoring rates, conversion probabilities, balance targets, fake content, or team-strength formulas.

## Allowed dependencies

- `engine -> domain, shared`
- `apps/cli` must not be imported.
- `content` must not be imported.

## Expected files

- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.ts`
- `packages/engine/src/match-engine/simulate-match-with-manual-tactics.test.ts`
- `packages/engine/src/match-engine/index.ts`
- `packages/engine/src/index.ts` only if a public export is needed.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- Focused Vitest tests for touched engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- Engine can simulate one fixture with an explicit manual tactic switch schedule.
- Existing no-switch behavior remains deterministic and compatible.
- The switch is caller-declared; no automatic tactical logic exists.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.
- CLI exposure remains deferred to the next step.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only segmented fixture simulation for explicit manual tactic changes. Do not add CLI flags or live match sessions. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect, and stop.
