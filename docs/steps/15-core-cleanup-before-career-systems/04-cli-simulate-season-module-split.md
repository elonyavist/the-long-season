# CLI Simulate Season Module Split

## Goal

Split `apps/cli/src/commands/simulate-season.ts` into smaller private CLI modules without changing command behavior.

## Why we implement it this way

The CLI command is currently the main inspection surface for the project. It has grown because it now renders season summaries, fixture detail, player stats, tactic setup demos, manual tactic switches, condition demos, lineup demos, formation-fit output, and localization.

Keeping all of that in one file reduces locality. Future market/youth CLI surfaces would make it worse.

This step should deepen the CLI implementation while preserving its public interface:

- `runSimulateSeasonCommand(args)` remains the command entry point;
- parsing stays deterministic;
- rendering stays localized;
- engine/content composition remains in CLI, not in domain/engine.

## What to implement

- Split private implementation into small modules under `apps/cli/src/commands/simulate-season/` or an equivalent local folder.
- Suggested module boundaries:
  - argument parsing and validation;
  - season composition for CLI;
  - fixture output formatting;
  - season summary/table output formatting;
  - formation-fit output formatting;
  - condition demo formatting;
  - lineup demo formatting;
  - setup/manual-tactic demo formatting.
- Keep exported/public command behavior unchanged.
- Keep localization usage intact.
- Keep tests focused on behavior, not file layout.
- Remove any duplicated helper left after the split.

## What NOT to implement

- Do not change simulation behavior.
- Do not change CLI flags.
- Do not change user-facing output except if a previous stale wording cleanup requires it.
- Do not add new feature flags.
- Do not move engine logic into CLI formatting modules.
- Do not introduce dead compatibility wrappers.
- Do not start market/youth work.

## Allowed dependencies

- No new dependencies.
- New CLI-private modules may import from existing app/package dependencies already allowed for `apps/cli`.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- New files under `apps/cli/src/commands/simulate-season/`
- `apps/cli/src/commands/simulate-season.test.ts`
- `docs/PROJECT_STATUS.md`
- The next relevant Phase 15 step document only if a lesson learned changes future work.

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm exec vitest run apps/cli/src/commands/simulate-season.test.ts`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --lineup-demo=pro01-rotated --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --formation-fit=4-2-3-1 --lang=it`
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000006 --setup-demo=pro01-balanced --manual-tactic-switch=46:pro01-attacking`
- `pnpm check`

## Definition of Done

- The public `simulate-season` command behaves the same.
- The large command file is split into coherent private modules.
- No duplicate helpers or unused compatibility exports remain.
- Tests and CLI smokes pass.
- `docs/PROJECT_STATUS.md` records the module boundaries adopted.

## Claude Code task prompt

Read the required project docs and this step document. Split the CLI `simulate-season` implementation into smaller private modules while preserving command behavior, localization, and deterministic output. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
