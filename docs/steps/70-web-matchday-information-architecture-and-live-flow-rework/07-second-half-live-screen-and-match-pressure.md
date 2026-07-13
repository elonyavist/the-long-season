# 07 - Second-Half Live Screen And Match Pressure

## Goal

Introduce the second-half live screen and make the match pressure legible.

The second half should feel like the continuation of the match, not a hidden
jump from half-time to the final report.

## Scope

- Route `Start second half` into a second-half live state.
- Show:
  - compact score header;
  - second-half status;
  - current result state for the selected club;
  - second-half events plus prior goal context where useful;
  - one primary action to reach full time.
- Reuse the live event component from the first-half step.
- Show goals strongly and secondary events quietly.
- Avoid repeating half-time tactical controls once the second half has started.
- Add tests for second-half state, event grouping, and primary action.
- Update the roadmap Phase 70 progress note.

## What NOT to implement

- No new engine facts unless current staged progression cannot expose second-
  half structured events.
- No in-play tactical changes.
- No team talks.
- No full-time ratings before full time.
- No fake live clock.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/stores/career-ui-store.ts` if routing state changes
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

Start the second half from half-time.

Acceptance:

- the second half is a visible phase;
- the match result pressure is understandable at a glance;
- the event feed still feels football-like;
- the primary action to reach full time is obvious.

Stop after this step for user approval.

## Definition of Done

- The full five-state matchday flow exists.
- First-half and second-half live screens share a coherent UI language.
- Status and roadmap are updated.
