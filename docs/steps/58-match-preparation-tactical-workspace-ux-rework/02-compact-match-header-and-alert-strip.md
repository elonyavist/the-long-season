# 02 - Compact Match Header And Alert Strip

## Goal

Replace the oversized match-context and blocker panels with a compact,
decision-oriented first viewport.

## Expected Files

- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.tsx`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `apps/web/src/features/match-preparation/CareerMatchPreparationScreen.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What To Implement

- Add a compact match header showing:
  - selected club;
  - opponent/fixture;
  - date and round;
  - home/away;
  - preparation status;
  - selected XI count;
  - selected bench count;
  - tactic state.
- Replace the large blocker panel with a compact alert strip.
- Keep blocker semantics from the existing read model; only change
  presentation.
- Keep the Dashboard/back action visible and accessible.
- Avoid hardcoded visible labels; add i18n keys where needed.

## What NOT To Implement

- Do not change readiness logic.
- Do not change save behavior.
- Do not remove blocker information; compress it.
- Do not add Inbox/Posta behavior.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/i18n run typecheck
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run test
pnpm check
git diff --check
```

## Definition Of Done

- The first viewport has materially less empty space.
- The user can immediately see what blocks preparation.
- Existing tests are updated to reflect the new structure.
