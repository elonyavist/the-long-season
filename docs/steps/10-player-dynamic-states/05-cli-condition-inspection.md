# CLI Condition Inspection

## Goal

Expose a minimal CLI view that lets a developer inspect player fitness consequences.

## Why we implement it this way

Fitness only matters if it is visible enough to debug and eventually manage. Before building career mode or a UI, the CLI should show the consequence loop clearly:

- starting fitness;
- fitness after played fixtures;
- recovery after calendar days;
- final fitness for selected players or one selected club.

This is still an inspection tool, not a playable squad-management UI.

## What to implement

- Add a narrow CLI inspection path for fitness/condition.
- Prefer an explicit debug-style option, for example:
  - `--condition-demo=<profile>` for a deterministic scenario; or
  - `--show-condition=<clubId>` for selected club condition output.
- Print enough context to verify:
  - selected club;
  - whether season fitness lifecycle is enabled;
  - player fitness at season start or before relevant fixtures;
  - player fitness after matches;
  - player fitness after recovery;
  - any observed impact on final table/top summaries if lifecycle is enabled.
- Keep default `pnpm cli simulate-season --seed=demo-001` concise unless the new option is passed.
- Add focused CLI tests for:
  - output shape;
  - deterministic repeated output;
  - invalid option handling;
  - default output unchanged when no condition option is passed.

## What NOT to implement

- Do not add interactive lineup management or automatic rotation.
- Do not add match-day sessions, substitutions, injuries, form, morale, training, staff, growth, aging, contracts, economy, market, scouting, UI, persistence, or career saves.
- Do not make CLI output a rendered prose commentary layer.
- Do not change balance targets, scoring rates, fake content strength spread, or tactical profiles.
- Do not start Phase 11.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `engine -> domain, shared` only if a small public export is needed.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/engine/src/index.ts` only if a public helper/export is needed.
- `docs/PROJECT_STATUS.md`

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- Focused Vitest tests for touched CLI files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- New condition inspection command documented by the implementation.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- CLI can show deterministic fitness consequences for at least one selected club or demo scenario.
- Default season output remains concise and deterministic.
- The output tells the user exactly what to inspect.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.
- Phase 10 can be closed or explicitly reworked before Phase 11 is documented.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the CLI condition inspection path for the existing fitness lifecycle. Do not add rotation, injuries, form, morale, career mode, or UI. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect in the CLI output, and stop.
