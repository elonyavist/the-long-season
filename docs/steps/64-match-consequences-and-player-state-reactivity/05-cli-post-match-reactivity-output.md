# 05 - CLI Post-Match Reactivity Output

## Goal

Expose the new post-match form/morale consequences in CLI career advancement
output for inspection.

The CLI should render concise localized inspection output. It must not own the
rules and must not persist prose.

## Expected files

- `apps/cli/src/commands/career/matchday-output.ts`
- `apps/cli/src/commands/career.test.ts`
- `packages/i18n/src/messages/en.ts`
- `packages/i18n/src/messages/it.ts`
- `packages/i18n/src/messages/de.ts`
- `packages/i18n/src/messages/es.ts`
- `packages/i18n/src/messages/fr.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`

## What to implement

1. Add a compact output section after existing condition changes, with a heading
   such as post-match player state or match consequences through localization
   keys.
2. Render only structured facts from the engine result:
   - player name;
   - form before/after/delta when changed;
   - morale before/after/delta when changed;
   - stable reason labels through localization keys.
3. Keep output short:
   - show changed players;
   - group or limit unchanged/no-change rows;
   - avoid tactical advice.
4. Add i18n keys in all supported languages, with English fallback preserved.
5. Update CLI tests and i18n label tests.

## What NOT to implement

- Do not compute consequence rules in CLI.
- Do not add new CLI commands unless a blocker is documented.
- Do not add UI.
- Do not expose hidden potential or hidden personality.
- Do not store rendered text in saves.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/cli/src/commands/career.test.ts
pnpm exec vitest run packages/i18n/src/labels.test.ts
pnpm --filter @game/cli run typecheck
pnpm --filter @game/i18n run typecheck
pnpm cli career --save=phase64-check --seed=world-a --new-world-preview
pnpm cli career --save=phase64-check --set-lineup-demo=pro01-first-team
pnpm cli career --save=phase64-check --set-tactic-demo=pro01-balanced
pnpm cli career --save=phase64-check --advance-next-fixture --fixture-explanation
git diff --check
```

## Completion notes

Update `docs/PROJECT_STATUS.md` with:

- CLI output shape;
- localization result;
- smoke command result;
- next action;
- blocker, if any.

