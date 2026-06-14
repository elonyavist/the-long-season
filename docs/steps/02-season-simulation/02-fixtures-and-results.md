# Fixtures And Results

## Goal

Apply a completed `MatchReport` to a fixture result using copy-on-write state updates.

## Why we implement it this way

`requirements.md` makes `fixture.result` the source of truth for standings. Rich reports are useful for narration and memory, but they must never be required to compute the table. Applying results as a separate use-case keeps match simulation pure and state changes explicit.

## What to implement

- `FixtureResult` domain type with home goals, away goals, played flag, and optional report reference.
- `applyMatchReportToFixture(state, fixtureId, report)` or equivalent use-case.
- Copy-on-write update of `GameState.fixtures`.
- Validation that report fixture and fixture ID match.
- Guard against overwriting an already played fixture unless explicitly allowed by a debug option.

## What NOT to implement

- Do not persist rich reports with retention policy.
- Do not compute league table inside the apply function.
- Do not simulate the match in this function.
- Do not mutate `GameState` in place.
- Do not implement points penalties or financial effects.

## Allowed dependencies

- `packages/engine -> domain, shared`

## Expected files

- `packages/domain/src/entities/fixture.entity.ts`
- `packages/engine/src/use-cases/apply-match-report-to-fixture.ts`
- `packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`
- `packages/engine/src/index.ts`

## Required tests

- Applying a report sets the fixture result.
- Applying a report does not mutate the original `GameState`.
- Mismatched fixture ID fails with a typed error.
- Re-applying to a played fixture fails by default.
- Fixture result remains enough to compute goals without reading events.

## Definition of Done

- Fixture results are the table source of truth.
- State update is copy-on-write.
- Match simulation remains separate.
- No persistence or retention logic is implemented.

## Claude Code task prompt

Read `docs/PROJECT_STATUS.md` before starting and update it after verification. Implement only fixture result application from `docs/steps/02-season-simulation/02-fixtures-and-results.md`. Keep match simulation and league table computation separate.
