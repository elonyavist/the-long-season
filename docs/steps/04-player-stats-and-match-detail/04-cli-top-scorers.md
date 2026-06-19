# CLI Top Scorers

## Goal

Replace the `Top scorer: unavailable in aggregate engine v1` placeholder with deterministic top-scorer output from season player statistics.

## Why we implement it this way

The first gameplay CLI milestone already prints final table, best defense, and worst attack. After goal attribution and season player-stat aggregation exist, the top-scorer line should become real output. This is the first user-visible proof that the simulation now produces player stories, not only club-level results.

The CLI should remain a thin shell over engine/content primitives. It should not invent stats that the season use-case does not produce.

## What to implement

- Read season player goal totals from the existing season simulation result or a documented engine helper.
- Use `simulateSeason(...).playerGoalStats` as the source of truth; do not re-read match reports or recompute scorer totals inside the CLI.
- Format at least the top scorer line with:
  - player display name;
  - club short name;
  - goals.
- Optionally print a short top-scorer table only if it remains compact and deterministic.
- Use explicit player ID/stat order from the engine result; do not rely on object key order.
- Update CLI tests for deterministic output.
- Keep existing final table, best defense, and worst attack output stable except for replacing the placeholder.

## What NOT to implement

- Do not add a separate UI.
- Do not add fixture detail output in this step.
- Do not add assists, ratings, cards, injuries, substitutions, or growth.
- Do not add storage or save files.
- Do not make CLI import domain directly if the current command can continue composing through content and engine exports.
- Do not add real identities or real datasets.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `packages/engine -> domain, shared` only if a tiny selector/export is needed for top-scorer ordering.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/engine/src/index.ts` only if a new public engine stat helper must be exported.
- `packages/engine/src/use-cases/simulate-season.ts` only if top-scorer data is not already exposed.
- Relevant focused test files for touched engine files.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/engine run typecheck` if engine files are touched.
- Focused Vitest tests for touched CLI/engine files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- `pnpm cli simulate-season --seed=demo-001` prints a real top scorer instead of the placeholder.
- CLI output is deterministic for the same seed.
- Existing table, best defense, and worst attack output remain coherent.
- Balance report still passes `calibration-v1`.
- No fixture detail, UI, storage, assists, ratings, cards, injuries, growth, or market logic is added.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Implement only CLI top-scorer output from existing season player stats. Run the required checks, update `docs/PROJECT_STATUS.md`, and stop.
