# CLI Match Detail V2

## Goal

Expose the richer structured match detail from Phase 05 through the CLI, without building UI or a live match-day system.

## Why we implement it this way

The current `simulate-season --round=<number>` output shows final score and scorers. After structured shot context, assists, goalkeeper saves, and player match stats exist, the CLI should provide a stronger inspection path for one round or one fixture. This gives the project a concrete way to verify that the new event data is useful before any UI work begins.

The CLI remains a deterministic diagnostic and gameplay proof. It should render existing engine/domain data; it should not own match logic.

## What to implement

- Extend the existing `simulate-season` detail flow or add one narrow option if needed, such as:
  - `--fixture=<fixtureId>` to print one match in detail;
  - or a richer `--round=<number>` detail block if that stays readable.
- Include only data already produced by earlier Phase 05 steps:
  - final score;
  - scorers and optional assists;
  - shot context labels as stable enum keys;
  - goalkeeper saves where available;
  - compact player match stats for involved players.
- Preserve deterministic ordering by explicit event order, fixture order, and stable player IDs.
- Add CLI tests for deterministic output and invalid arguments.

## What NOT to implement

- Do not add React UI, ticker UI, Web Worker, Tauri, SQLite, save browsing, or persistence.
- Do not add live match sessions, pause controls, team talks, substitutions, cards, injuries, ratings, or tactical changes.
- Do not simulate a match or season twice just to print detail.
- Do not put prose generation, localization, or commentary corpus into engine/domain.
- Do not add real football data or real identities.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `packages/engine -> domain, shared` only if the season result needs to expose already-derived detail.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts` only if existing result data is insufficient.
- `packages/engine/src/use-cases/simulate-season.test.ts` only if the use-case result changes.
- `packages/engine/src/index.ts` only if a new public helper must be exported.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/engine run typecheck` if engine files are touched.
- Focused Vitest tests for touched CLI/engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli simulate-season --seed=demo-001 --round=1`
- Any new documented CLI fixture-detail command or option.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- The CLI exposes richer deterministic match detail from existing simulated season data.
- Output includes the Phase 05 details that exist at this point and remains readable in a terminal.
- Invalid arguments fail cleanly.
- Existing `simulate-season` table, top-scorer, and round result behavior remain deterministic.
- No UI, storage browser, live match-day system, management system, or duplicate simulation path is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only the CLI rendering needed to inspect richer match detail from existing season data. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
