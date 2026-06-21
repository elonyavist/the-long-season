# Step 03 - Career Save Runtime Policy

## Goal

Make career save runtime behavior explicit before the playable loop starts writing more state.

## Context

Career saves are currently local CLI runtime artifacts under an ignored save directory. That is acceptable, but Phase 23 will make saves more central to the product loop, so the user and future developer should understand where state is written and whether inspection is loading persisted data.

## Expected files

- `.gitignore`
- `apps/cli/src/commands/career.ts`
- `apps/cli/src/commands/career/*.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/*.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Confirm local career saves are ignored and cannot be accidentally committed.
- Expose or document the save directory in career CLI output only if useful for manual inspection.
- If new CLI labels are added, route them through i18n with English fallback and Italian coverage.
- Add focused tests for any changed career output.
- Keep the save adapter behavior deterministic and unchanged unless the step proves a narrow correction is required.

## What NOT to implement

- Do not add cloud sync, multi-profile storage, or UI storage.
- Do not change save format unless required by a narrowly documented bug.
- Do not migrate existing saves.
- Do not create a career progression command.
- Do not write generated runtime saves into tracked fixture files.

## Required checks

- `pnpm --filter @game/cli run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- focused career CLI/i18n tests
- `pnpm cli career --save=phase22-save-policy-world --seed=world-a --new-world-preview`
- `pnpm cli career --save=phase22-save-policy-world --inspect`
- `pnpm check`

## Definition of Done

- Save runtime behavior is explicit and safe for local development.
- Any new user-facing text is localized.
- No runtime save files become tracked project artifacts.
