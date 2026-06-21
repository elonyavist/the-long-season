# 06 - CLI New Career World Creation Preview

## Goal

Expose a CLI path to create or preview a new career world from a world seed.

The player/developer should be able to verify that two new-game seeds create different squads, while the same seed remains reproducible. If this step writes a save, it must persist the generated world instead of regenerating it on every inspect command.

## What to implement

- Add or extend a CLI career command for new career world creation or inspection.
- The command should show:
  - world seed;
  - selected club;
  - generated squad size;
  - a compact identity/nationality summary;
  - a compact age/prospect summary;
  - whether a save was written or whether the command is inspection-only.
- If a career save is written, persist the career world seed and generated world through the existing career storage boundary.
- Localize every new user-facing CLI label.
- Add focused CLI and i18n tests for the new output.

## What NOT to implement

- Do not add UI.
- Do not add a club-selection wizard.
- Do not add youth intake.
- Do not add scouting reports.
- Do not add exact-potential player reports as normal user-facing output.
- Do not add market AI, contracts, wages, loans, or transfer windows.
- Do not add staff gameplay.
- Do not create a live playable day-by-day loop yet.

## Expected files

- `apps/cli/src/commands/career.ts` or smaller private CLI modules if the existing command is split further
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `packages/storage/src/career-storage.test.ts` only if persisted career shape changes need storage coverage
- `docs/PROJECT_STATUS.md`
- `docs/steps/20-new-career-world-generation/07-flag-asset-readiness.md` only if a lesson learned changes future work.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused CLI career tests
- focused i18n label tests
- focused storage tests if save persistence shape changes
- `pnpm check`
- new-career/world CLI command with one seed
- new-career/world CLI command with a second seed
- career inspect command if a save is written

## Definition of Done

- A CLI command can inspect or create a new career world from a seed.
- Same seed output is reproducible.
- Different seed output shows visible squad variation.
- Any saved career loads the same generated world.
- All new labels are localized.
- `docs/PROJECT_STATUS.md` records the manual commands the user should run.
