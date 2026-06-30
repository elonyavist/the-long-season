# Web Matchday Playable Slice Report

Date: 2026-06-29
Phase: `65-web-matchday-playable-slice`
Step: `07-section-quality-review-and-phase-report`

## What Became Playable

The web app now supports the first complete matchday payoff loop:

1. start a demo career;
2. inspect the dashboard attention state;
3. prepare lineup, bench, and tactic;
4. save preparation;
5. Continue until matchday attention;
6. open matchday from Inbox/Posta;
7. play the selected club's next fixture through the real engine progression
   path;
8. inspect score, key events, player stats, and player-state consequences;
9. return to an updated dashboard.

This is still a narrow one-fixture demo loop, but it is no longer a CLI-only
experience and no CLI prose is parsed by the browser.

## How The App Reaches Matchday

- `apps/web/src/stores/career-ui-store.ts` owns the browser UI state and routes
  the user from dashboard/preparation to matchday.
- `apps/web/src/features/dashboard/continue-demo-career.ts` uses the structured
  career Continue result.
- Inbox/Posta exposes the `open_matchday` attention action once preparation is
  complete and Continue reaches the selected club's fixture.
- `apps/web/src/app/App.tsx` maps the `matchday` screen state to
  `CareerMatchdayScreen`.

## Real Engine Facts Used

- `apps/web/src/features/matchday/matchday-demo.ts` is the in-memory web demo
  adapter.
- The adapter validates saved preparation, constructs coherent demo career
  state, calls the real career fixture progression path, and stores the played
  result for the current web session.
- `packages/ui/src/career/career-matchday-view.ts` converts engine/domain facts
  into a framework-free read model.

Visible result facts:

- fixture context;
- preparation state and blockers;
- final score and selected-club outcome;
- ordered key event rows;
- basic player stats;
- selected-club condition changes;
- form and morale changes;
- next-stop action.

## Dashboard And Inbox/Posta After Play

After the match is played:

- Inbox/Posta clears the stale action-required matchday message;
- Continue returns `no_attention` for the current one-fixture demo state;
- the dashboard shows a recent match row;
- selected-club condition facts reflect post-match fitness spend;
- saved preparation remains available;
- the selected-club next fixture becomes unavailable until Phase 66+ replaces
  the one-fixture demo state with real persisted calendar progression.

## Key Entry Points For Junior Developers

- `packages/ui/src/career/career-matchday-view.ts`
  Read this first to understand the matchday states and presentation facts.
- `apps/web/src/features/matchday/matchday-demo.ts`
  Read this to understand how web demo state calls the engine path.
- `apps/web/src/features/matchday/CareerMatchdayScreen.tsx`
  Read this to understand React presentation and localized labels.
- `apps/web/src/stores/career-ui-store.ts`
  Read this to understand screen transitions and the `playMatchdayFixture`
  action.
- `apps/web/src/features/dashboard/build-demo-career-dashboard.ts`
  Read this to understand why the dashboard changes after a played match.
- `apps/web/src/visual-qa/matchday-playable-slice.spec.ts`
  Read this to understand the accepted browser journey.

## Roadmap Updates

- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md` now records Phase 65
  completion. Its original Phase 66 persistence recommendation is superseded by
  the interactive matchday rework.
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` now marks the matchday flow as
  complete under the superseded web-section numbering and points to the
  operational interactive matchday rework before persistence.

## Quality Review

Dependency review:

- `packages/ui` remains framework-free and language-agnostic.
- `apps/web` owns browser state, React rendering, demo adapters, and visual QA.
- Engine rules stay outside React and Zustand.
- No CLI output is parsed.

Code quality review:

- The matchday surface is split into a read model, demo adapter, screen, store
  actions, and QA script.
- The known test-file mismatch remains documented: current Vitest config
  discovers `*.test.ts`, so the React screen test is implemented as `.test.ts`
  instead of the step-doc `.test.tsx` name.
- `matchday-demo.ts` is intentionally replaceable in Phase 66; it should not
  grow into a real persistence layer.

Architecture review:

- The current slice is open to a real save adapter because the engine-facing
  call is isolated in the matchday demo adapter.
- The next architectural risk is duplicate career state between dashboard,
  preparation, matchday, and future persistence. Phase 66 should solve that
  before Inbox/Posta grows.

UI/UX review:

- The result screen is readable and responsive after Step 06 fixes.
- The experience has a clear payoff, but it is still report-like and dense.
- The next UI improvement should happen after persistence, when repeated
  matchdays can expose which consequence summaries are most useful.

Fun review:

- The manager now gets feedback after preparation: score, events, condition,
  form, morale, and dashboard change.
- The loop creates the first real sense of "I prepared, played, and my squad
  changed".
- The current limitation is that the career does not yet persist or advance
  through a longer calendar in the browser, so the fun value is a proof point
  rather than a full session loop.

## Residual Risks

- Web matchday state is in-memory only.
- Browser refresh loses the playable slice.
- There is no real continue-through-calendar persistence yet.
- The dashboard after match has no next selected-club fixture in the demo state.
- Matchday presentation is a factual report, not a live viewer.
- Long consequence lists are useful for QA but may need stronger hierarchy when
  repeated matchdays exist.

## Next Phase Recommendation

Original recommendation: proceed to `Phase 66 - Web Career Persistence And Save
Adapter`.

Supersession note, 2026-06-29: this recommendation is now replaced by
`Phase 66 - Interactive Matchday Flow And Half-Time Decisions`.

Reason: visual/product review showed that the Phase 65 matchday is technically
playable but still feels too much like a log/report. Persistence should wait
until the match centre has a staged first-half/half-time/second-half flow,
player ratings, half-time substitutions, and a UI that feels like a football
manager matchday.
