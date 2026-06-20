# Lineup Demo Profiles

## Goal

Add a tiny deterministic set of PRO01 lineup demo profiles that the user can choose explicitly.

## Why we implement it this way

Manual rotation needs named lineup options before season or fixture overrides can exist. The first version should not be a full lineup editor. It should be a small CLI-demo profile registry that makes the selection explicit and repeatable.

The output must make it obvious that the user selected a lineup profile. The system should not infer that a player needs rest or choose replacements automatically.

## What to implement

- Add a deterministic lineup demo profile registry for PRO01.
- Support at least:
  - `pro01-first-team`
  - `pro01-rotated`
- Optionally add one more profile only if it stays narrow and useful, for example:
  - `pro01-reserve`
- Each profile must define:
  - selected club;
  - ordered lineup slots;
  - role keys for each selected player;
  - which players differ from the first-team profile.
- Reuse generated fake content players and existing role weights.
- Extend fake content with deterministic reserve players if needed, while keeping the default 11-player lineup unchanged.
- Keep default season output unchanged.
- Add focused CLI tests for:
  - supported profile parsing;
  - invalid profile handling;
  - deterministic repeated output;
  - default output unchanged.
- Document all new or modified exported functions/types with TSDoc/JSDoc where useful.

## What NOT to implement

- Do not apply lineup profiles to fixtures or seasons yet; this step only defines and prints/selects profiles enough for later steps.
- Do not add arbitrary CLI player IDs or free-form lineup editing.
- Do not automatically choose rested players based on fitness.
- Do not add substitutions, bench management, injuries, suspensions, morale, form, training, tactical familiarity, UI, persistence, or career mode.
- Do not change match engine algorithms, scoring rates, calibration targets, or fake content strength spread.
- Do not leave unused profile builders or duplicate profile logic behind.

## Allowed dependencies

- `apps/cli -> engine, content, storage, simulation-tools, shared`
- `engine -> domain, shared` only if a small public export is needed.

## Expected files

- `apps/cli/src/commands/simulate-season.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `packages/content/src/generators/fake-clubs.ts`
- `packages/content/src/generators/fake-players.ts`
- `packages/content/src/generators/league-system.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/steps/11-manual-lineup-rotation-v1/03-fixture-lineup-override-contract.md` only if a lesson learned changes the contract step.

## Required tests/checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/content run typecheck`
- Focused Vitest tests for touched CLI files.
- Focused Vitest tests for touched content files.
- `pnpm check`
- `pnpm cli simulate-season --seed=demo-001`
- New lineup profile inspection command documented by the implementation.
- `pnpm cli balance-report --seed-prefix=test-balance --seasons=20 --target-profile=calibration-v1 --strict`

## Definition of Done

- CLI owns a small deterministic PRO01 lineup profile registry.
- The user can inspect available/manual lineup profile choices without changing default season output.
- No fixture or season lineup override has been implemented yet.
- Code is clear, typed, documented where useful, and has no unused helpers.
- Strict `calibration-v1` balance report passes or any regression is documented as a blocker.

## Claude Code task prompt

Read `requirements.md`, `docs/PROJECT_RULES.md`, `docs/PROJECT_STATUS.md`, `docs/steps/README.md`, and this step document. Add only deterministic lineup demo profiles for later manual selection. Do not apply them to fixtures or seasons yet. Keep code clean, typed, and documented with TSDoc/JSDoc where useful. Run the required checks, update `docs/PROJECT_STATUS.md`, tell me exactly what I should inspect in the CLI output, and stop.
