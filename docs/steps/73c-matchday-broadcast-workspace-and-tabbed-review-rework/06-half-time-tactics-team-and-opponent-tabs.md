# Step 06 - Half-Time Tactics, Team, And Opponent Tabs

## Status

Ready.

## Goal

Complete the interval workspace by placing the approved tactical board and both
teams' live ratings into their correct tabs without duplicating football facts.

## User-Visible Outcome

- `Tattica` contains the complete current formation selector, tactical board,
  bench, movement, role changes, and substitutions.
- `La tua squadra` shows selected-club players with provisional rating,
  condition, role, contribution, status, and compact attention indicators.
- `Avversario` shows the same useful live football facts for the opponent,
  without exposing tactical controls or invented scouting knowledge.
- Changing the complete formation remains possible at half time.
- The board, bench names, role labels, and player tokens fit the content outlet
  without clipping or horizontal page scrolling.

## Scope

1. Move the existing shared half-time tactical workspace into the Tattica tab.
2. Preserve all current callbacks, validation, substitution count, goalkeeper
   rule, and no-duplicate behavior.
3. Build one responsive team-rating composition reused by selected club and
   opponent tabs.
4. Derive opponent rows from the existing structured phase player rows.
5. Keep player ordering deterministic and useful: active players first, then
   status and current rating/order rules documented in the presenter.
6. Make tab changes preserve the current unsaved tactical draft in memory.

## Implementation Contract

- The tactical board component, SVG, state model, roles, geometry, tokens,
  candidate ranking, and interactions remain unchanged.
- The team-rating component may be shared because two current tabs consume the
  same row contract.
- Opponent view exposes observed match facts only; it does not reveal hidden
  attributes, potential, suitability, or private tactical calculations.
- Selecting another tab cannot apply, discard, or reset tactical changes.
- Start second half uses the same current validation and command path.

## Expected Files

- `apps/web/src/features/matchday/MatchdayHalfTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.test.tsx`
- `apps/web/src/features/matchday/MatchdayTeamRatings.tsx`
- `apps/web/src/features/matchday/MatchdayTeamRatings.test.tsx`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.test.ts`
- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.test.ts`
- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-interactions.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-state.test.ts`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No tactical-board source or visual redesign.
- No new tactical instruction, tactical engine effect, or opponent knowledge.
- No drag-and-drop between rating rows and board.
- No second lineup store or duplicated half-time draft.
- No full-time tabs; Step 07 owns them.

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

- At half time, change formation, move one player, change one role, and complete
  a substitution in Tattica; switch tabs between each action and verify the
  draft is preserved.
- Verify bench and board fit at desktop, narrow, and 200% text.
- Compare the board pixel-for-pixel with the accepted tactical-board baseline.
- Verify selected-club and opponent rows show readable names, ratings,
  condition, roles, contribution, and status without horizontal scrolling.
- Verify keyboard, pointer, touch/long-press, menu dismissal, and focus return.

## Cleanup Boundary

Remove the old inline tactical-workspace placement, standalone player-signal
cards, duplicated rating markup, and obsolete selectors/tests only after all
three tabs and the tactical draft journey pass.

## Completion Criteria

- All four half-time tabs are complete and useful.
- The board and bench are unchanged in behavior and visual contract.
- Both teams' ratings use one truthful responsive component.
- Tab changes never lose or apply the tactical draft.
- One valid Start second half command continues the deterministic match.
- The user can test the complete interval before Step 07 starts.
