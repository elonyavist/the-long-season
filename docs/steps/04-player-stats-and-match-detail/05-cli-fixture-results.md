# CLI Fixture Results

## Goal

Add a minimal CLI inspection path for fixture results and basic match detail after player scorers are available.

## Why we implement it this way

Tables and top scorers show season-level outcomes, but debugging and player attachment also need match-level inspection. This step should expose enough fixture detail to verify where goals happened and who scored, without building UI, storage browsing, or a full match-day ticker.

The output can be simple and CLI-first. It is a diagnostic and gameplay proof, not the final presentation layer.

## What to implement

- Add a minimal way to inspect fixture results from a deterministic simulated season.
- Reuse the existing `simulate-season` command flow, which now calls engine `simulateSeason`; do not restore the old manual CLI simulation loop.
- Prefer extending `simulate-season` with a narrow option only if the CLI shape stays simple, for example:
  - print all fixture results after the final table;
  - or print details for one fixture ID;
  - or print one round's fixtures.
- Include structured details that already exist:
  - fixture ID;
  - round number or date;
  - home/away club short names;
  - final score;
  - goal scorers by minute when available from reports.
- Preserve deterministic ordering by explicit fixture ID order or round fixture order.
- Add CLI tests for deterministic output and invalid arguments.

## What NOT to implement

- Do not build React UI, ticker UI, Web Worker, Tauri, storage browsing, or save loading.
- Do not add live match sessions, substitutions, team talks, cards, injuries, assists, ratings, or full duel chains.
- Do not add real data.
- Do not make the output depend on object key order.
- Do not duplicate season simulation logic in the CLI if an engine result already exposes the needed data.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `packages/engine -> domain, shared` only if season result data must be exposed for fixture detail.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/engine/src/use-cases/simulate-season.ts` only if match reports or fixture detail must be exposed.
- `packages/engine/src/use-cases/simulate-season.test.ts` only if the use-case result changes.
- `packages/engine/src/index.ts` only if a new public helper must be exported.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/engine run typecheck` if engine files are touched.
- Focused Vitest tests for touched CLI/engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- Any new documented CLI fixture-detail command or option.

## Definition of Done

- The CLI can show deterministic fixture-level results or one deterministic fixture detail view.
- Fixture detail includes final score and goal scorer information when available.
- Invalid CLI arguments fail cleanly.
- Existing season table and top-scorer output remain deterministic.
- No UI, storage browser, live match-day system, assists, cards, injuries, substitutions, ratings, growth, or market logic is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only minimal CLI fixture result/detail inspection from existing simulated season data. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
