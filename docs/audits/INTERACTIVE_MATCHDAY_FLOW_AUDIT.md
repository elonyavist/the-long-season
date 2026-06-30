# Interactive Matchday Flow Audit

Date: 2026-06-29
Phase: `66-interactive-matchday-flow-and-half-time-decisions`
Step: `01-current-matchday-flow-and-ui-audit`

## Decision

The Phase 65 matchday slice is technically useful but not yet good enough as the
product matchday experience. It proves the web can reach a prepared fixture,
play it through the real engine, show structured facts, apply consequences, and
return to a changed dashboard. It should not be preserved as the final match
centre because it behaves like a post-match debug report.

Phase 66 should keep the structured-fact foundation and replace the one-shot
matchday flow with a staged football-manager loop:

1. pre-match;
2. first half;
3. half-time decision;
4. second half;
5. full time.

Extra time and penalties should stay contract-ready only. They must not become
active UI or fake gameplay until cup rules exist.

## Current Useful Behavior

- `apps/web/src/features/matchday/matchday-demo.ts` already bridges browser
  preparation state into the real engine instead of parsing CLI output.
- `progressNextCareerFixture` already validates the next selected-club fixture,
  simulates a real report, applies the fixture result, applies selected-club
  condition spend, and applies post-match form/morale consequences.
- The Phase 65 web store can route to matchday, execute the fixture once, and
  update dashboard/Inbox/Posta state after completion.
- `@game/ui` has a matchday read model that keeps React away from engine
  internals and visible text away from engine/domain code.
- Existing match reports expose structured events, player IDs, score, selected
  club result, condition changes, and player-state consequences.

These pieces should remain. The rework should not throw away the engine-backed
flow or reintroduce UI-only fake match data.

## Current Behavior To Replace

- The web adapter calls `progressNextCareerFixture`, so the only browser action
  is "play the whole fixture now".
- `CareerMatchdayScreen` shows the final score, event list, consequences, and
  player stats in one report page. It does not create first-half tension,
  half-time agency, or a live match-centre feeling.
- Events are displayed as a textual ordered list, which reads like a log.
- Player stats are raw match facts only. They do not yet answer the managerial
  question: "who is playing well, who is tired, and who should I change?"
- Condition consequences are shown beside live-looking match facts, even though
  consequences should be a full-time outcome.
- The route from Continue/Inbox/Posta to the match feels bureaucratic. The user
  should reach the match centre directly when matchday is the active stop.

## Engine Seam

`progressNextCareerFixture` is too high-level for Phase 66 staged matchday. It
is still the right full-fixture use case for CLI and future auto-advance flows,
but it intentionally applies final fixture and player-state consequences in one
operation.

The correct seam is below that use case:

- `packages/engine/src/match-engine/match-simulation-state.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/match-simulation-runner.ts`
- `packages/engine/src/match-engine/create-match-report.ts`

The existing `simulateMatchWithManualTactics` proves that the engine can change
context during a minute loop, but it is still a batch simulation: all changes
are declared before execution and the caller receives one completed match. Phase
66 needs a staged contract that can stop at half-time, expose the partial state,
accept explicit selected-club decisions, and then continue to full time without
applying consequences before the match is complete.

## Required Contract Shape

The staged engine contract should expose structured facts only:

- current phase;
- current minute;
- score;
- accumulated events;
- accumulated match stats;
- side/team context;
- lineups and bench facts needed by the selected-club UI;
- a full-time report only when full time is reached.

It should not expose React concepts, localized labels, rendered prose, or
manager recommendations. It should not apply condition/form/morale consequences
at half-time.

## Minimum Click-Flow Changes

- Dashboard/Continue should make "go to match" the obvious primary route when
  matchday is the active attention stop.
- Inbox/Posta can still contain the matchday message, but it should not be the
  only practical route to the match.
- The match centre should start at pre-match context, then progress to first
  half, half-time, second half, and full-time result.
- Consequences should appear after full time, not while the user is deciding at
  the interval.

## UX Conclusion

The current screen is serviceable evidence, not the target experience. The next
steps should optimize for user fun:

- compact dominant scoreboard;
- visible phase state;
- event timeline cards, not a log table;
- half-time table focused on rating, condition, role, key events, and status;
- clear substitution decision path;
- final consequences separated from live match reading.

## Risks For Later Steps

- Staged progression must stay deterministic and must not persist mutable RNG
  state.
- Player ratings must be derived from structured match facts, not random UI
  decoration.
- Half-time substitutions must be explicit manager decisions for the selected
  club.
- The web demo adapter can stay in-memory for this phase, but it must be shaped
  so Phase 67 persistence can replace it without rewriting the match centre.
- The old web roadmap still contains a historical `Phase 66 - Market UI MVP`
  row. The playability roadmap supersedes it; do not start market work now.

## Recommendation

Proceed to Step 02 and add a deterministic staged match-progression contract at
the match-engine layer. Keep `progressNextCareerFixture` unchanged for existing
full-fixture callers.
