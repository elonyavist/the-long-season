# Ordered Fixture Lineup Overrides

## Goal

Remove the `Object.values()` usage from the engine season simulation path by preserving fixture-lineup override order explicitly.

## Why we implement it this way

Project rules ban `Object.values()`, `Object.keys()`, and `Object.entries()` for order-sensitive simulation. Phase 14 found `Object.values(fixtureLineupOverrides)` inside `simulateSeason`.

Even if current output is stable today, this is the wrong shape for future career systems. Fixture lineup overrides are manager intent. The engine should receive that intent in an explicit ordered structure, not rely on object enumeration.

## What to implement

- Review the current `simulateSeason` fixture lineup override API.
- Replace order-sensitive record iteration with explicit order:
  - prefer an ordered array of fixture-lineup override entries if compatible with current callers;
  - or add an explicit `fixtureLineupOverrideIds` order list paired with the existing lookup.
- Update all affected tests and CLI demo builders.
- Preserve current default output when no lineup override is passed.
- Preserve current `--fixture=<fixtureId> --lineup-demo=pro01-rotated` behavior.
- Add or update tests that prove:
  - override order is caller-provided and deterministic;
  - the same input seed and override order produce identical output;
  - no engine code in the touched path uses `Object.values()`, `Object.keys()`, or `Object.entries()` for simulation order.

## What NOT to implement

- Do not add automatic lineup selection.
- Do not add market, youth, scouting, contracts, injuries, substitutions, training, form, morale, or UI.
- Do not change match scoring, balance tuning, or team-strength algorithms.
- Do not change CLI output wording except where required by changed data shape.
- Do not keep the old unordered API as unused compatibility code.

## Allowed dependencies

- No new dependencies.
- `engine` may use only `domain` and `shared`.
- `apps/cli` may adapt to the changed shape.

## Expected files

- `packages/engine/src/use-cases/simulate-season.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `docs/PROJECT_STATUS.md`
- The next relevant Phase 15 step document only if a lesson learned changes future work.

## Required tests/checks

- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run packages/engine/src/use-cases/simulate-season.test.ts apps/cli/src/commands/simulate-season.test.ts`
- `rg -n "Object\\.values\\(|Object\\.keys\\(|Object\\.entries\\(" packages/engine/src/use-cases/simulate-season.ts`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated`
- `pnpm check`

## Definition of Done

- The Phase 14 high finding is fixed.
- Fixture lineup override order is explicit and tested.
- No unused old override helper/API remains inside the touched scope.
- Existing CLI smoke output remains deterministic.
- `docs/PROJECT_STATUS.md` records the adopted ordered override shape.

## Claude Code task prompt

Read the required project docs and this step document. Remove the engine `Object.values()` fixture-lineup override usage by making override order explicit, update focused tests and CLI callers, run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
