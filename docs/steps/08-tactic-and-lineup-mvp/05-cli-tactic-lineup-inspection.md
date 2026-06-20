# CLI Tactic Lineup Inspection

## Goal

Expose a minimal CLI inspection path for comparing default season output against a selected lineup/tactic setup.

## Why we implement it this way

After `simulateSeason` can accept setup overrides, the user/developer needs a concrete way to inspect the first managerial lever. This step should keep the interface deliberately small: enough to prove tactic and lineup choices affect deterministic output, not enough to become a full tactical UI.

The CLI should remain structured and terminal-friendly, like existing `simulate-season --fixture=<fixtureId>` output.

## What to implement

- Add a minimal CLI mode or arguments that apply a deterministic demo setup override for one club.
- Build that demo setup through `simulateSeason.setupOverrides`; do not add a parallel season simulation path in CLI.
- Keep the option explicit and discoverable in command usage.
- Print enough context to verify what changed:
  - selected club;
  - selected role/player changes or setup profile key;
  - tactic values applied;
  - season summary and/or fixture detail produced from that setup.
- Preserve existing default `simulate-season --seed=demo-001` output when no tactic/lineup option is passed.
- Add focused CLI tests for parsing, deterministic output, invalid args, and changed output with the setup option.
- Run strict balance report and document whether the default calibration gate remains safe.

## What NOT to implement

- Do not build an interactive lineup editor.
- Do not add React UI, web app, desktop app, storage, saves, career mode, live match commands, substitutions, training, tactical familiarity, fatigue, morale, injuries, cards, market, contracts, economy, staff, youth, facilities, or media.
- Do not add a large matrix of custom CLI options if a single deterministic demo profile is enough to inspect the behavior.
- Do not change default fake content, scoring calibration, or balance targets.
- Do not store rendered prose in domain events or reports.

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
- `pnpm cli simulate-season --seed=demo-001 --fixture=fixture:000001`
- CLI command showing the tactic/lineup inspection mode for the documented demo setup.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- CLI can inspect a deterministic selected lineup/tactic setup.
- Default season and fixture output remain available and deterministic.
- The user can compare default output against tactic/lineup output with documented commands.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.
- Phase 08 can be closed or explicitly reworked before Phase 09 is documented.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the minimal CLI tactic/lineup inspection path from existing setup override support. Do not add UI, persistence, live match-day, player states, or management systems. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect in the CLI output, and stop.
