# CLI Lineup Condition Inspection

## Goal

Expose a CLI inspection path for manually applying a lineup profile to one fixture and reviewing result/fitness consequences.

## Why we implement it this way

After the engine can apply explicit lineup overrides, the CLI should let a developer and user inspect the first manual rotation scenario. The CLI is still an inspection tool, not a squad management UI.

The output must make manager intent explicit: the user picked a lineup profile for a fixture. The system did not choose it automatically.

## What to implement

- Add a narrow CLI option for manual lineup profile inspection, for example:
  - `--fixture-lineup=<fixtureId>:<lineupProfile>`; or
  - `--lineup-demo=<profile>` combined with `--fixture=<fixtureId>`.
- Prefer the option shape that stays consistent with existing `--fixture`, `--setup-demo`, and `--manual-tactic-switch` behavior.
- Require a fixture context for lineup inspection.
- Print enough context to verify:
  - selected club;
  - selected lineup profile;
  - fixture where it applies;
  - whether the selected club plays that fixture;
  - starters used by the selected profile;
  - players rested versus first-team profile;
  - fixture result;
  - condition impact for selected/rested players.
- Keep default season output unchanged.
- Add focused CLI tests for:
  - output shape;
  - deterministic repeated output;
  - invalid profile handling;
  - non-applicable fixture handling;
  - default output unchanged when no lineup option is passed.
- Document all new or modified exported functions/types with TSDoc/JSDoc where useful.

## What NOT to implement

- Do not add interactive lineup management or free-form player selection.
- Do not add automatic rotation, fatigue-based recommendations, or "pick best rested XI".
- Do not add substitutions, injuries, suspensions, form, morale, training, tactical familiarity, staff, youth, UI, persistence, or career saves.
- Do not change balance targets, scoring rates, fake content strength spread, tactical profiles, or fitness rules.
- Do not start Phase 12.
- Do not leave dead code, unused helpers, or duplicated profile logic behind.

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
- Existing condition inspection command:
  - `pnpm cli simulate-season --seed=demo-001 --condition-demo=pro01-season`
- New lineup inspection command documented by the implementation.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- CLI can inspect one explicit user-selected lineup override for one fixture.
- Output clearly distinguishes selected starters and rested players.
- Default season output remains concise and deterministic.
- The output tells the user exactly what to inspect.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.
- Phase 11 can be closed or explicitly reworked before Phase 12 is documented.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only the CLI lineup condition inspection path for explicit user-selected lineup overrides. Do not add automatic rotation, free-form lineup editing, substitutions, injuries, form, morale, career mode, or UI. Keep code clean, typed, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect in the CLI output, and stop.
