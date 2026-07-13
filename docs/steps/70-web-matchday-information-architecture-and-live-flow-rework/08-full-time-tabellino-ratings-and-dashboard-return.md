# 08 - Full-Time Tabellino, Ratings, And Dashboard Return

## Goal

Rebuild full time as a proper post-match review.

At full time, the user wants the story of the match first: tabellino, then
pagelle, then consequences.

## Scope

- Render full time with:
  - compact final score header;
  - full match tabellino at the top;
  - goals larger or more strongly colored than secondary events;
  - penalties, cards, injuries, and substitutions smaller or quieter when real
    facts exist;
  - player ratings immediately below the tabellino;
  - consequences after ratings, not mixed into live match state;
  - one primary action: return to dashboard.
- Remove generic `Continue` wording from full-time matchday if the action is
  specifically dashboard return.
- Add tests proving the ordering: tabellino before ratings before consequences.
- Add tests proving full time does not show live-only controls.
- Update the roadmap Phase 70 progress note.

## What NOT to implement

- No press conference.
- No team talk reaction.
- No fake card/injury/substitution rows.
- No season-table update redesign.
- No browser save persistence.
- No raw event-log dump as the dominant full-time UI.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/stores/career-ui-store.ts` if final routing changes
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

Play through to full time.

Acceptance:

- full time reads like a post-match review, not a live state;
- the tabellino is the first body section;
- goals stand out more than secondary events;
- pagelle are immediately visible below the tabellino;
- the primary action clearly returns to the dashboard.

Stop after this step for user approval.

## Definition of Done

- Full-time matchday hierarchy matches the user-approved order.
- Dashboard return is explicit.
- Status and roadmap are updated.
