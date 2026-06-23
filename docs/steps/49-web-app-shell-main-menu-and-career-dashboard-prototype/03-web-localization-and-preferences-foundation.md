# 03 - Web Localization And Preferences Foundation

## Goal

Add the smallest app-level preference model needed by the main menu.

The web app must support language and currency choices without implementing
economics or durable settings persistence.

## Expected files

- `apps/web/src/app/preferences.ts`
- `apps/web/src/app/translation.ts`
- `apps/web/src/app/preferences.test.ts`
- `apps/web/src/app/translation.test.ts`
- `apps/web/src/App.tsx` or `apps/web/src/app/App.tsx`
- `packages/ui/src/app/*`, only if the app-entry contract needs a narrow
  extension discovered by the web adapter.
- `packages/i18n/src/labels.ts`, only for new visible web labels.
- focused tests for touched UI/i18n/web files
- `docs/PROJECT_STATUS.md`
- The next relevant step document, only if a lesson learned changes future work.

## Implementation checklist

- Define supported currency display keys for the prototype.
- Keep currency as a preference, not an economy rule.
- Add a small translation adapter over `@game/i18n`.
- Ensure language changes affect visible app-shell labels.
- Ensure the preference model has deterministic defaults:
  - language: English unless the active step justifies another default;
  - currency: EUR unless the active step justifies another default.
- Keep preference state in memory for this phase unless a later step explicitly
  scopes durable browser settings.

## What NOT to implement

- Do not implement club finances.
- Do not implement player salaries.
- Do not implement contracts.
- Do not implement ticket prices.
- Do not implement durable settings storage unless explicitly added to the step.
- Do not hardcode visible labels in React components.
- Do not add date/number formatting libraries unless needed.

## Required checks

- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/i18n run typecheck` if i18n labels change.
- Focused i18n tests if labels change.
- `pnpm check`
- `git diff --check`

## Definition of Done

- Web has a small preference model for language and currency.
- Visible web labels use localization keys.
- No economics behavior has been introduced.
