# GameState Fixture Slice Decision

## Goal

Decide and implement the smallest safe fixture-state cleanup needed before career systems.

## Why we implement it this way

The current project can simulate seasons without persistent career state, but market, youth, contracts, morale, finances, and saves will eventually need one canonical state shape.

Phase 14 found that fixtures and fixture IDs still live as a slice around `GameState` in engine use-cases. This was acceptable for earlier steps because `game-state.ts` was outside those step scopes. Before career systems start, the project should either consolidate fixtures into `GameState` or explicitly document why that migration must wait.

The preference is to consolidate now if the change is small and well-tested. If the blast radius is too high, the step may document a short-term boundary and create a clear blocker for the future persistence/career phase.

## What to implement

- Review current `GameState`, fixture contracts, and `ApplyMatchReportToFixtureState`.
- Choose one path:
  - **Preferred:** add fixtures and fixture ID order to `GameState`, update use-cases/tests to use the canonical shape, and remove redundant slice-only types if they become obsolete.
  - **Fallback:** keep the slice, but document the exact reason, the current callers, and the future migration step in `docs/PROJECT_STATUS.md` and the final cleanup report.
- If consolidating:
  - keep domain dependency-free;
  - preserve copy-on-write behavior;
  - preserve deterministic fixture order;
  - update storage tests if full `GameState` snapshots now include fixtures;
  - remove obsolete local compatibility types/helpers.
- If not consolidating:
  - do not pretend the issue is fixed;
  - mark it as a documented pre-career blocker or future migration.

## What NOT to implement

- Do not add career saves.
- Do not implement persistence UI or save browsing.
- Do not implement market, youth, scouting, economy, contracts, or staff.
- Do not change calendar generation behavior.
- Do not change match results or balance tuning.
- Do not keep both old and new state paths unless both have active callers and the status documents why.

## Allowed dependencies

- No new dependencies.
- `domain` remains dependency-free.
- `engine` may use only `domain` and `shared`.
- `storage` may use only `domain` and `shared`.

## Expected files

- `packages/domain/src/state/game-state.ts`
- `packages/domain/src/state/game-state.test.ts`, if it exists or is needed.
- `packages/domain/src/index.ts`, only if exports change.
- `packages/engine/src/use-cases/apply-match-report-to-fixture.ts`
- `packages/engine/src/use-cases/apply-match-report-to-fixture.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/storage/src/**`, only if full snapshot shape tests need updating.
- `docs/PROJECT_STATUS.md`
- The final Phase 15 report step document only if the migration decision changes its scope.

## Required tests/checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/storage run typecheck`
- `pnpm exec vitest run packages/domain/src packages/engine/src/use-cases packages/storage/src`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
- `pnpm check`

## Definition of Done

- The project has either a canonical fixture state in `GameState` or a documented blocker explaining why consolidation waits.
- No redundant obsolete fixture-state helper remains inside the touched scope.
- Copy-on-write fixture result behavior remains tested.
- Season simulation remains deterministic for the existing CLI smokes.
- `docs/PROJECT_STATUS.md` records the decision and the remaining risk, if any.

## Claude Code task prompt

Read the required project docs and this step document. Decide whether fixture state can safely move into `GameState` now. Prefer implementing the minimal canonical-state cleanup if scoped; otherwise document the blocker clearly. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
