# CLI Causal Match Review

## Goal

Expose the new durable causal match context in CLI fixture detail and confirm the Phase 07 changes remain statistically safe.

## Why we implement it this way

Phase 07 should end with something inspectable. If match reports now carry causal context, `simulate-season --fixture=<fixtureId>` should show enough of it to let a developer or user judge whether events read more coherently.

This is still not a rendered commentary layer. The CLI should print compact structured fields, similar to existing `shot=` and `chance=` keys, so later UI and localization remain separate.

## What to implement

- Update fixture-detail CLI rendering to show new durable causal fields when present.
- Keep output compact and structured, for example:
  - creator or assist where meaningful;
  - defender for blocked shots or defensive context where meaningful;
  - existing scorer, shooter, goalkeeper, `shot`, and `chance` fields unchanged.
- Update CLI tests for the new fixture detail output.
- Run the strict balance report and document whether scoring/table metrics remain safe.
- Update `docs/PROJECT_STATUS.md` with observed demo output and Phase 07 completion status.

## What NOT to implement

- Do not add prose commentary, localization, ticker corpus, UI, React, Web Worker, SQLite, Tauri, save browsing, or storage migrations.
- Do not add full player ratings, awards, player memory, tactical commands, live match sessions, cards, injuries, penalties, substitutions, fatigue, form, morale, market, economy, staff, youth, facilities, media, or career systems.
- Do not tune scoring rates, conversion probabilities, calibration targets, fake content, or team-strength generation unless the previous Phase 07 steps caused a measured regression and the fix is documented.
- Do not expand fixture detail into full season stat tables.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `engine -> domain, shared` only if a small helper/export is needed by CLI tests.

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
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- CLI fixture detail displays the new causal match context where durable reports provide it.
- Output remains deterministic, compact, and readable.
- Base season output and fixture-only output still behave as before except for the new causal fields.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.
- Phase 07 can be closed or explicitly reworked before Phase 08 is documented.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Update only CLI causal fixture review output and tests from durable report data. Do not add new match mechanics or management systems. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect in the CLI output, and stop.
