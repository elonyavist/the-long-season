# 03 - Compact Score Header And Phase Indicator

## Goal

Replace the oversized matchday top frame and button-like phase tabs with a
compact score header and visual-only phase indicator.

The user must immediately understand the score, minute, phase, and next action
without losing half the screen to repeated context.

## Scope

- Create or refactor a matchday score header component.
- Show:
  - home club;
  - away club;
  - score;
  - minute or phase;
  - round/venue as small metadata.
- Remove separate debug/context strips when their facts are already shown in
  the header.
- Replace large phase buttons with a compact non-clickable progress indicator.
- Keep exactly one primary action slot near the score context.
- Add tests for phase indicator semantics and non-clickable behavior.
- Update the roadmap Phase 70 progress note.

## What NOT to implement

- No first-half live feed yet.
- No half-time board rework yet.
- No full-time tabellino rework yet.
- No clickable phase navigation.
- No tactical-board changes.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/components/*` if component extraction is
  justified
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

Open pre-match, half-time, and full-time matchday states.

Acceptance:

- phase indicators are visibly not buttons;
- the score header is compact and dominant without wasting vertical space;
- the primary action is obvious;
- round, minute, venue, and phase are not repeated in separate bulky panels.

Stop after this step for user approval.

## Definition of Done

- The old large phase-tab feeling is gone.
- The header can support all five phases.
- Status and roadmap are updated.
