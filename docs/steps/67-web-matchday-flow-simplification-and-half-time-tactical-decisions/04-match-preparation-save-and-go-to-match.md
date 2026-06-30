# 04 - Match Preparation Save And Go To Match

## Goal

Remove the dashboard bounce after preparation by making the completed
preparation CTA save and route directly to pre-match.

## Scope

Update the match-preparation screen and store flow so:

- the primary preparation action lives in the top action area;
- the label is "Save and go to match" when XI, bench, and tactic are complete;
- the action is disabled or clearly blocked until preparation is complete;
- the old bottom `Save preparation` action is removed;
- a successful save opens pre-match directly;
- the existing `Auto`, `Fill gaps`, `Clear`, tactical board, bench board, and
  tactic selection remain available;
- no hidden automatic decisions happen after the user presses save.

## Expected files

- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx`
- `apps/web/src/features/match-preparation/match-preparation-demo.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.test.ts`
- `apps/web/src/stores/career-ui-store.ts`
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/app/App.tsx`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- `docs/PROJECT_STATUS.md`

## What NOT to implement

- Do not persist preparation to browser storage.
- Do not remove manual preparation controls.
- Do not auto-start the match.
- Do not skip the explicit pre-match state.

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.tsx
pnpm exec vitest run apps/web/src/features/match-preparation/match-preparation-demo.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm exec vitest run packages/i18n/src/labels.test.ts
pnpm --filter @game/web run typecheck
git diff --check
```

## Done when

- Complete preparation routes directly to pre-match.
- Incomplete preparation cannot be saved-and-routed.
- The cold flow no longer requires `Save -> Dashboard -> Go to match`.
- The explicit pre-match `Start match` ritual remains.
