# Step 08 - Half Time Decision Hierarchy And Phase Decomposition

## Status

Done.

## Goal

Make half-time answer what happened, who is struggling, and what the manager
should change, with the approved tactical board as the central decision tool.

## Findings Closed

- Half-time portion of `Q-P1-05` flattened hierarchy.
- Half-time decomposition portion of `Q-P1-10` concentrated Matchday ownership.
- `Q-P2-01` repeated half-time facts.
- `Q-P2-05` target-size and motion behavior in the decision workspace.

## User-Visible Outcome

- The interval presents score and decisive first-half facts before controls.
- Ratings, condition, role, contribution, and substitution count support a
  decision without becoming a second dashboard.
- The tactical board, bench, formation selector, movement, and substitutions
  remain complete and central.
- One Resume match action appears only when the tactical state is valid.
- Desktop and narrow layouts keep names, roles, ratings, controls, and the
  current decision readable without horizontal page overflow.

## Scope

1. Extract one `MatchdayHalfTimePhase` composition from the current screen.
2. Define the minimum first-half review facts needed to change the team.
3. Remove repeated shape, status, score, minute, and change-count presentation.
4. Keep the tactical board and bench as existing shared behavior owners.
5. Make compact interactive targets at least 24px effective size or document a
   WCAG spacing exception with equivalent operability.
6. Keep one visible validation owner and one dominant resume command.
7. Preserve context menus, long press, candidate ranking, goalkeeper rules,
   no-duplicate selection, and full formation change.

## Implementation Contract

- The phase component composes existing facts and callbacks; it does not own
  simulation, tactical rules, or persistence.
- Ratings remain structured deterministic facts, not cosmetic random numbers.
- Do not change board rendering, geometry, player-token design, or interactions.
- Supporting facts may collapse or reorder on narrow screens, but the decision
  and all required controls remain reachable.
- One player fact must not be repeated in multiple adjacent panels without a
  distinct decision purpose.

## Expected Files

- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- `apps/web/src/features/matchday/CareerMatchdayScreen.test.ts`
- `apps/web/src/features/matchday/career-matchday-presenter.ts`
- `apps/web/src/features/matchday/matchday-adapter.ts`
- `apps/web/src/features/matchday/matchday-adapter.test.ts`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.tsx`
- `apps/web/src/features/matchday/MatchdayHalfTimePhase.test.tsx`
- `apps/web/src/features/tactics-board/components/TacticalBoardPitch.test.ts`
- `apps/web/src/features/tactics-board/components/TacticalBenchBoard.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-interactions.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-state.test.ts`
- `apps/web/src/styles/layout.css`
- `apps/web/src/styles/components.css`
- `apps/web/src/visual-qa/current-product.spec.ts`
- `packages/i18n/src/labels.ts`
- `packages/i18n/src/labels.test.ts`
- `docs/ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No tactical-board source, pitch SVG, geometry, suitability, role, or formation
  change.
- No new tactical instruction, morale talk, quick shout, or tactic effect.
- No new rating formula or match-engine fact.
- No generic phase-component registry.
- No duplicated squad or tactical state outside current owners.

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

- Capture event-light and event-rich half-time states at desktop, narrow, and
  200% text.
- Verify score, decisive events, player signals, board, bench, and Resume order
  support one useful decision in the first useful viewport.
- Complete a substitution, player move, and full formation change with mouse,
  keyboard, and touch/long press.
- Verify target size/spacing, focus order, focus visibility, reduced motion,
  context-menu dismissal, and no horizontal overflow.
- Compare the board itself with the approved tactical-board baseline.

## Cleanup Boundary

Remove repeated half-time cards, labels, derived facts, CSS selectors, and the
replaced inline phase branch. Do not move tactical behavior into the new phase
component or retain a compatibility wrapper with no caller.

## Completion Criteria

- Half-time makes the manager's decision obvious and useful.
- One phase-local component owns composition only.
- All current tactical decisions work on desktop and narrow screens.
- The tactical board is visually and behaviorally unchanged.
- No repeated half-time fact or dead inline composition remains.

## Implementation Notes

- `MatchdayHalfTimePhase` now owns half-time composition only: first-half
  review, player signals, the shared tactical board/bench workspace, one
  validation strip, and the existing resume command.
- `buildMatchdayHalfTimeReviewView` derives decisive events, watch-list
  players, and contributors exclusively from structured match facts. A player
  cannot appear in both signal groups.
- Score, minute, phase, current shape, and substitution count each have one
  visible owner. The replaced inline half-time branch and its selectors were
  removed.
- The tactical board source, SVG, geometry, role suitability, tokens, movement,
  candidate ranking, and formation behavior were not changed.

## Verification Result

- Node `24.16.0`.
- i18n and web tests PASS; web suite: 52 files / 221 tests.
- Web typecheck and production build PASS; the existing large-chunk warning is
  unchanged.
- Canonical Playwright gate PASS: 12/12, including event-rich, event-light,
  narrow, reduced-motion, and 200% text half-time states under
  `/tmp/the-long-season-phase73b/step-08/`.
- Dependency-cruiser PASS: 506 modules / 1,794 dependencies.
- Full `pnpm check` PASS: 165 files / 976 tests.
- `git diff --check` and `graphify update .` PASS.

## Lessons Learned

- Responsive grid minimums expressed in `rem` can create real horizontal
  overflow at 200% text even when ordinary narrow screenshots pass.
- Half-time is clearer when review facts explain the next decision and the
  tactical workspace remains the only place where that decision is made.
