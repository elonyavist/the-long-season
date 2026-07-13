# 04 - Pre-Match Confirmation-Only Screen

## Goal

Make pre-match a simple kickoff confirmation screen.

The user has already prepared the team before reaching matchday, so this screen
must not become a second preparation workspace.

## Scope

- Render pre-match as:
  - compact score header;
  - selected-club fixture context;
  - readiness confirmation;
  - one primary action: start match.
- Remove empty key-events, highlights, player-stats, and report panels from
  pre-match.
- Keep secondary navigation minimal and clearly lower priority.
- Ensure the screen has no tactical-board editor.
- Add tests that pre-match exposes only the intended primary command.
- Update the roadmap Phase 70 progress note.

## What NOT to implement

- No tactical editing in pre-match.
- No duplicated preparation save flow.
- No empty event sections.
- No full-time consequence areas.
- No persistence.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Navigate from match preparation into matchday pre-match.

Acceptance:

- pre-match feels calm and decisive;
- the only meaningful command is start match;
- there are no empty event/stat panels;
- the user does not see controls that belong to preparation.

Stop after this step for user approval.

## Definition of Done

- Pre-match has one job and one primary action.
- The next screen can become the first-half live screen.
- Status and roadmap are updated.
