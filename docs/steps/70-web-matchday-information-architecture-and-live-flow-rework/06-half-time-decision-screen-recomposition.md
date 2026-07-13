# 06 - Half-Time Decision Screen Recomposition

## Goal

Make half-time a useful decision screen instead of another scattered report.

The tactical board remains the only major interactive object here.

## Scope

- Place the half-time tabellino and first-half score context above decisions.
- Keep the shared tactical board and bench as the main workspace.
- Show concise decision signals:
  - live/provisional ratings;
  - condition;
  - selected-club underperformers;
  - selected-club key contributors;
  - substitutions used/available.
- Keep one primary action: start second half.
- Remove generic panels that repeat score, round, minute, or venue.
- Keep tactical changes explicit and manager-controlled.
- Add tests for half-time layout facts and primary action.
- Update the roadmap Phase 70 progress note.

## What NOT to implement

- No team talks.
- No opponent board.
- No automatic manager advice.
- No hidden substitutions.
- No new tactical-board behavior unless a bug blocks the approved board.
- No full-time consequence output.

## Expected files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/styles/components.css`
- `packages/i18n/src/labels.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## Required checks

```bash
nvm use 24
pnpm exec vitest run apps/web/src/features/matchday/CareerMatchdayScreen.test.ts
pnpm exec vitest run apps/web/src/features/tactics-board/tactical-board-state.test.ts
pnpm --filter @game/web run typecheck
pnpm --filter @game/i18n run typecheck
git diff --check
```

## Visual check for the user

Advance to half-time.

Acceptance:

- the user can immediately understand the first-half story;
- tactical board, bench, and player signals are visually connected;
- the screen invites a decision, not passive reading;
- there is only one primary action to start the second half.

Stop after this step for user approval.

## Definition of Done

- Half-time has a clear decision hierarchy.
- Tactical-board decision UI remains intact.
- Status and roadmap are updated.
