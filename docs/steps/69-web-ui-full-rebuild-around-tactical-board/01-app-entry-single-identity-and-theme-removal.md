# 01 - App Entry Single Identity And Theme Removal

## Goal

Rebuild the app entry as the first approved visual slice and remove the rejected
theme-palette choice from the user-facing product.

The user should be able to open the web app and see a premium, football-manager
main menu with:

- The Long Season title;
- New Career;
- Continue Career;
- Settings for language and currency;
- no theme selector;
- visual language aligned with the approved spec.

## Why this is first

The app entry is the first screen of the MVP. It proves the new visual language
without touching career flow or tactical-board logic.

## Scope

- Keep the app entry outside the career shell.
- Remove theme-palette presentation from preferences and app-entry view models.
- Reduce theme handling to one approved identity.
- Use Tailwind utilities only where they make the layout clearer.
- Keep language and currency settings visible and localized.

## What NOT to implement

- No career persistence.
- No new career setup wizard.
- No club-selection screen.
- No dashboard rebuild.
- No tactical-board changes.
- No additional palettes.

## Expected files

- `apps/web/src/app/App.tsx`
- `apps/web/src/app/preferences.ts`
- `apps/web/src/app/theme-palettes.ts` if it becomes unused, delete it in this
  step or mark deletion for Step 13 only if imports still exist.
- `apps/web/src/app/theme-palettes.test.ts` if the module is deleted.
- `apps/web/src/features/app-entry/AppEntryScreen.tsx`
- `apps/web/src/features/app-entry/app-entry-view-model.ts`
- `apps/web/src/features/app-entry/AppEntryScreen.test.tsx`
- `apps/web/src/features/app-entry/app-entry-view-model.test.ts`
- `apps/web/src/styles/tokens.css`
- `apps/web/src/styles/base.css`
- `packages/i18n/src/labels.ts` only for new/changed visible labels.
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/app-entry/AppEntryScreen.test.tsx
pnpm exec vitest run apps/web/src/features/app-entry/app-entry-view-model.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Start the web app and inspect the first screen.

Acceptance:

- the screen feels like the new product direction, not the previous palette demo;
- there is no theme picker;
- New Career and Continue Career are clearly separated;
- language/currency settings remain understandable;
- focus states are visible;
- no text overlaps on desktop or narrow width.

Stop after this step for user approval before continuing.

## Definition of Done

- App entry has the new single-identity visual direction.
- Theme-palette user preference is no longer visible.
- No tactical-board source file changed.
- Tests and typecheck pass.
- Status and roadmap are updated.
