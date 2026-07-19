# Step 07 - Full-Time Team, Opponent, And Consequence Tabs

## Status

Ready.

## Goal

Replace the long full-time report with a compact post-match review that keeps
the final result and tabellino visible while detailed information changes by
tab.

## User-Visible Outcome

- Final score, result state, latest final-whistle line, and complete tabellino
  remain above the review.
- Full time exposes three tabs: `La tua squadra`, `Avversario`, and
  `Conseguenze`.
- Both team tabs use the same readable ratings language.
- Conseguenze shows meaningful durable condition, form, and morale changes
  without repeating routine facts for every player.
- One Return to Dashboard action completes the review.

## Scope

1. Recompose `MatchdayFullTimePhase` around an accessible three-tab review.
2. Reuse the Step 06 team-rating component for both clubs with final ratings.
3. Extend the pure presenter only as needed to expose opponent rows already
   available in the phase facts.
4. Move current durable consequence cards into the Conseguenze tab.
5. Preserve omission of routine team-wide repetition and unavailable facts.
6. Keep one idempotent Return to Dashboard action and current acknowledgement
   behavior.

## Implementation Contract

- Opponent ratings are derived from existing structured rows; no engine or
  persistence change is permitted.
- The default tab should answer the manager's most immediate question about
  their own team.
- Tab state is ephemeral and not written to the career session.
- Consequences remain post-match only and reflect durable current facts.
- Returning to Dashboard does not resimulate, recommit, or force a save.

## Expected Files

- `apps/web/src/app/App.tsx`
- `apps/web/src/app/app.test.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayFullTimePhase.test.tsx`
- `apps/web/src/features/matchday/MatchdayTeamRatings.tsx`
- `apps/web/src/features/matchday/MatchdayTeamRatings.test.tsx`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.test.ts`
- `apps/web/src/runtime/web-career-runtime.test.ts`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No post-match press, media, fans, board, finance, attendance, or narrative
  reaction.
- No new rating or consequence formula.
- No all-player diagnostic data grid or horizontal scrollbar.
- No duplicate Dashboard/Continue/Main menu action.
- No persistence of active tab or review cursor.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
pnpm check
git diff --check
graphify update .
```

## Manual Inspection

- Capture win, draw, loss, event-rich, event-light, selected-team, opponent,
  consequences, desktop, narrow, and 200% text states.
- Verify final score and tabellino remain stable while tabs change.
- Verify ratings are comparable between clubs without exposing private data.
- Verify consequences are concise and omit normal repeated noise.
- Refresh on every tab and after Return to Dashboard; verify one committed
  result and coherent Dashboard/Posta state.

## Cleanup Boundary

Delete the old sequential full-time story/ratings/consequences composition,
selected-club-only presenter branch, duplicated rating markup, selectors,
labels, and tests after the tabbed replacement and idempotent journey pass.

## Completion Criteria

- Full time reads as a compact football review, not a diagnostic report.
- Both teams' final ratings and durable consequences are available through
  accessible tabs.
- Score and tabellino remain the stable context.
- One Return to Dashboard action completes the journey exactly once.
- The user can inspect all full-time tabs before Step 08.

