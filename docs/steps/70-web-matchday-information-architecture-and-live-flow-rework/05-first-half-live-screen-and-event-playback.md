# 05 - First-Half Live Screen And Event Playback

## Goal

Introduce a real first-half live screen between kickoff and half-time.

This is a presentation-layer live experience over structured match facts. It
must not invent events or change engine outcomes.

## Scope

- Route `Start match` into a first-half live state instead of visually jumping
  straight to half-time.
- Show:
  - compact score header;
  - current half status;
  - visual event feed for first-half events;
  - one primary action that advances to half-time when the first-half facts are
    ready or reviewed.
- Use event hierarchy from Step 02:
  - goals as stronger cards;
  - secondary events muted;
  - non-tabellino events as live-feed rows only.
- Add optional browser-only playback state only if it reveals real structured
  events and can be skipped safely.
- Add tests for first-half state, event rendering, and primary action.
- Update the roadmap Phase 70 progress note.

## What NOT to implement

- No animated 2D/3D match viewer.
- No fake live clock.
- No new engine randomness.
- No tactical changes during first half in this phase.
- No full-time consequences.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/stores/career-ui-store.ts` if phase routing state is needed
- `apps/web/src/stores/career-ui-store.test.ts`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/stores/career-ui-store.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Start a match from pre-match.

Acceptance:

- a first-half screen exists and is not just an empty waiting room;
- events feel like a football timeline, not a raw log;
- the main command is clear;
- the screen does not show half-time or full-time-only panels too early.

Stop after this step for user approval.

## Definition of Done

- The matchday flow includes an intermediate first-half screen.
- The first-half feed uses real structured events.
- Status and roadmap are updated.
