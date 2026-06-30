# Interactive Matchday Flow Report

Date: 2026-06-30
Phase: `66-interactive-matchday-flow-and-half-time-decisions`
Status: Complete

## Outcome

Phase 66 replaced the Phase 65 result-only matchday with an interactive
match-centre slice. The web user can now enter matchday, play to half-time,
inspect score, events, ratings, and condition, apply explicit selected-club
substitutions, play the second half, inspect full-time consequences, and return
to the dashboard.

The implementation deliberately stops short of persistence, animated 2D/3D
match viewing, team talks, active extra time, and penalties. Extra time and
penalty phases are represented only as future structural states; they are not
activated until cup rules exist.

## Engine Changes

- `packages/engine/src/match-engine/staged-match-progression.ts` owns the
  deterministic regulation-time match flow from pre-match to half-time and full
  time.
- `packages/engine/src/match-engine/player-match-rating.ts` derives live and
  final player ratings from structured facts: goals, assists, shots, shots on
  target, saves, blocks, misses, errors, condition, role context, and result
  context. Ratings are not random cosmetic numbers.
- `packages/engine/src/match-engine/half-time-substitutions.ts` validates and
  applies manager-declared selected-club substitutions to the staged
  second-half context.

## UI And Web Changes

- `packages/ui/src/career/career-matchday-phase-view.ts` builds the phase-aware
  read model for scoreboard, period rail, event cards, ratings, half-time
  actions, and full-time-only consequences.
- `apps/web/src/features/matchday/matchday-demo.ts` is now the in-memory web
  adapter for staged matchday state until browser persistence exists.
- `apps/web/src/stores/career-ui-store.ts` stores staged matchday state and
  exposes explicit actions to open matchday, apply half-time substitutions, and
  play the second half.
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx` renders the
  redesigned match centre. It no longer presents the match as a raw log table.
- Dashboard Continue and the dashboard "Go to match" action now route directly
  to the match centre when matchday is the next attention point.

## Junior Developer Entry Points

- Engine progression: `packages/engine/src/match-engine/staged-match-progression.ts`
- Rating calculation: `packages/engine/src/match-engine/player-match-rating.ts`
- Half-time changes: `packages/engine/src/match-engine/half-time-substitutions.ts`
- UI read model: `packages/ui/src/career/career-matchday-phase-view.ts`
- Web adapter: `apps/web/src/features/matchday/matchday-demo.ts`
- Web store: `apps/web/src/stores/career-ui-store.ts`
- Web screen: `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
- Browser QA: `apps/web/src/visual-qa/interactive-matchday-flow.spec.ts`

## Visual QA

`docs/audits/INTERACTIVE_MATCHDAY_FLOW_VISUAL_QA.md` records the Playwright
desktop and narrow screenshots under `/tmp/the-long-season-phase66`.

The QA rejected and fixed several technically passing but weak UX details:

- narrow player rows now become labeled card rows instead of clipped table
  columns;
- half-time substitution option labels are compact enough for narrow screens;
- the duplicate generic half-time no-op action was removed;
- dashboard return selectors were made precise for automation and usability.

## Residual Risks

- The global shell status can still say preparation is ready while the user is
  inside an active half-time or full-time matchday state.
- Narrow matchday remains long, although it no longer horizontally overflows.
- The first-half progression is a deliberate direct jump to half-time in v1,
  not a minute-by-minute live viewer.

These are not blockers for Phase 66. They are persistence/navigation polish
items for the next web-product phase.

## Next Phase Decision

Recommended next phase: `Phase 67 - Web Career Persistence And Save Adapter`.

Reason: the matchday slice now has enough structure and user value to preserve.
Persisting it earlier would have locked in a result-screen experience that felt
too much like a debug report. Persistence should now cover selected club,
preparation, staged/full-time matchday state, match results, player state,
Inbox/Posta, preferences, current date, and current screen where supported by
current state.

Phase 67 must not add new gameplay. Its job is to make the existing playable
career loop durable and recoverable.
