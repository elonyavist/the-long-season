# Phase 73C - Matchday Broadcast Workspace And Tabbed Review Rework

## Status

Complete. All nine ordered steps and the phase-level gate pass.

## Goal

Rebuild the current Matchday presentation into one coherent football broadcast
workspace without changing match truth, career persistence, the global career
shell, or the approved tactical board.

The manager must understand the score, the current incident, the match record,
and the next real decision without reading a growing event log or scanning
unrelated cards. The screen must feel like a premium football product while
remaining deterministic, accessible, refresh-safe, and concise.

## User-Facing Reason

The current Matchday flow is functionally correct but visually fragmented:

- pre-match repeats fixture and venue facts below the scoreboard;
- live commentary accumulates vertically and makes the page grow during play;
- important events do not receive enough time or visual emphasis;
- the tabellino is separated from the score it explains;
- half-time review, player signals, tactical controls, and ratings compete on
  the same canvas;
- full time becomes a long report instead of a focused post-match review;
- the screen does not consistently use all space made available by the career
  shell.

This phase corrects those problems around the existing deterministic match
checkpoints. It improves the experience, not the result calculator.

## Phase Position

- Phase 73B is complete.
- The user explicitly scheduled this browser-visible Matchday interposition
  after reviewing the current product.
- Phase 74 remains reserved as `Player Generation And Model Consolidation
  Cleanup`.
- This phase is numbered 73C so it does not renumber, replace, or start Phase
  74.
- Phase 74 remains the next engine phase after this bounded UI rework passes.

## Locked Decisions

### Global layout

- The persistent career menu keeps its current desktop width, approximately
  25-30% of the application frame as already rendered.
- The changing career content owns all remaining width.
- Inside Matchday, every primary block uses 100% of that content width.
- There is no additional page-level 70/30 split inside Matchday.
- Narrow layouts may stack internal content, but may not create horizontal page
  scrolling.

### Matchday hierarchy

The stable order is:

1. compact dominant scoreboard;
2. one replace-in-place live commentary line;
3. one compact tabellino directly below the score;
4. the current phase workspace;
5. one primary action only when a real manager command is available.

Pre-match contains only confirmation and Start match. The redundant lower
`Ready to play` / `Fixture` / `Venue` card is removed.

### Live playback

- Match simulation remains deterministic and checkpointed.
- Playback timing is presentation-only over facts already computed by the
  engine.
- Ordinary moments move quickly; decisive moments hold longer.
- Goals receive the strongest bounded animation and longest hold.
- Pause and speed controls affect only presentation timing.
- Reduced motion removes non-essential animation while preserving event
  readability and checkpoint meaning.
- The commentary line is replaced in place. No event feed grows the page.

### Tabellino

- The tabellino remains adjacent to the score in every applicable phase.
- Goals are visually dominant.
- Other supported incidents are quieter but discoverable.
- Only structured facts actually emitted by current engine/application
  contracts may render.
- Today that means current shot outcomes plus real applied substitutions where
  available. Penalties, cards, and injuries must not be fabricated, previewed
  with fake data, or implemented as inert future branches.
- A new incident appears only when a real producer and lifecycle exist.

### Half time

- Half time is the only live-match manager decision in this phase.
- It uses accessible tabs:
  - `Sintesi`;
  - `Tattica`;
  - `La tua squadra`;
  - `Avversario`.
- The approved tactical board and bench remain the complete Tattica content.
- Ratings, condition, role, and contribution support decisions.
- Existing decision signals become compact row-level indicators; they do not
  remain a competing dashboard panel.
- One Start second half action remains the only progression command.

### Full time

- Full time uses accessible tabs:
  - `La tua squadra`;
  - `Avversario`;
  - `Conseguenze`.
- The final scoreboard and tabellino stay visible above the tabs.
- Both teams' ratings are derived from existing structured player rows.
- Consequences remain visible only after full time.
- One Return to Dashboard action completes the review.

## Existing Technical Baseline

- `CareerMatchdayScreen.tsx` owns current phase routing and presentation-only
  playback.
- `matchday-playback.ts` projects already-computed half-time/full-time facts
  into bounded visual frames.
- `career-matchday-presenter.ts` already separates tabellino facts from quieter
  live facts and exposes structured player rows.
- `MatchdayLivePhase.tsx` renders one stable localized commentary moment and the
  presentation-only playback controls shared by both halves.
- `MatchdayTabellino.tsx` owns the compact two-sided record of supported current
  incidents directly below the score.
- `MatchdayHalfTimePhase.tsx` composes Summary, Tactics, selected-team, and
  opponent tabs around the approved tactical board and bench.
- `MatchdayFullTimePhase.tsx` composes selected-team, opponent, and consequence
  tabs beneath the stable result hierarchy.
- The canonical browser proof is
  `apps/web/src/visual-qa/current-product.spec.ts` over real SQLite/OPFS.

## Architecture Contract

- Engine/domain continue to emit structured, language-agnostic facts only.
- `@game/ui` remains framework-free and owns shared presentation contracts.
- React may compose, prioritize, time, and localize facts; it may not infer new
  gameplay truth.
- Playback cursor, pause state, speed, active tab, animation state, and event
  hold timers are ephemeral UI state. They are never stored in CareerState,
  SQLite, Zustand career truth, or engine checkpoints.
- Existing typed command runner remains the only asynchronous mutation lock.
- Existing staged first-half and second-half commands remain idempotent and
  refresh-safe.
- A focused React component is added only when it owns a current repeated or
  independently testable composition. No generic match-viewer framework,
  event bus, or second state machine is introduced.
- Replaced JSX, selectors, labels, tests, and helper branches are deleted in
  the same owning step after replacement coverage passes.

## Tactical Board Preservation Contract

The tactical board is the approved football visual anchor. This phase must
not:

- modify or replace `apps/web/src/assets/campo-calcio.svg`;
- change normalized coordinates, viewBox projection, slot/player separation,
  role zones, role suitability, candidate ordering, or formation catalogs;
- change drag, clamp, pointer, touch, long-press, keyboard, context-menu,
  goalkeeper, bench, or no-duplicate behavior;
- redesign player tokens or pitch markings as a side effect;
- fork a Matchday-only board implementation.

The half-time Tattica tab reuses the current shared board and bench as-is. Only
its surrounding composition and responsive container may change.

## Localization And Accessibility Contract

- All visible copy uses the five-language i18n catalog.
- Tabs use correct `tablist`, `tab`, and `tabpanel` semantics with arrow-key,
  Home/End, Enter/Space, and deterministic focus behavior.
- Live commentary uses one polite live region; event animation does not create
  repeated screen-reader announcements.
- Pause and speed controls have visible focus, meaningful names, and at least
  the existing effective target-size standard.
- Color is never the only indicator of an event, rating, state, or active tab.
- At 200% text, content reflows without clipping or horizontal page scrolling.
- Reduced motion preserves event holds long enough to read while removing
  pulse, slide, and fade effects.

## Implementation Discipline

- Execute exactly one step document at a time.
- Start every implementation shell with `nvm use 24`.
- Reproduce and screenshot the current state before editing each step.
- Every step must leave one browser-visible slice the user can inspect.
- Use the real career, staged Matchday, and SQLite/OPFS path in Playwright; do
  not replace it with a mock-only gallery.
- Capture desktop `1440x900`, wide `1920x1080` when density needs proof, and
  narrow `390x844` screenshots under
  `/tmp/the-long-season-phase73c/step-XX/`.
- Manually inspect screenshots. Locator assertions alone are not visual QA.
- Update `docs/PROJECT_STATUS.md` and
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` after every completed step.
- Run `graphify update .` after source changes.

## Ordered Steps

1. [01-pre-match-workspace-and-full-width-content-contract.md](01-pre-match-workspace-and-full-width-content-contract.md) - Done
2. [02-live-playback-controls-and-event-hold-policy.md](02-live-playback-controls-and-event-hold-policy.md) - Done
3. [03-single-live-commentary-line-and-decisive-event-moment.md](03-single-live-commentary-line-and-decisive-event-moment.md) - Done
4. [04-persistent-compact-tabellino-and-event-hierarchy.md](04-persistent-compact-tabellino-and-event-hierarchy.md) - Done
5. [05-half-time-tab-shell-and-summary-hierarchy.md](05-half-time-tab-shell-and-summary-hierarchy.md) - Done
6. [06-half-time-tactics-team-and-opponent-tabs.md](06-half-time-tactics-team-and-opponent-tabs.md) - Done
7. [07-full-time-team-opponent-and-consequence-tabs.md](07-full-time-team-opponent-and-consequence-tabs.md) - Done
8. [08-responsive-accessibility-and-motion-quality-pass.md](08-responsive-accessibility-and-motion-quality-pass.md) - Done
9. [09-current-product-gate-dead-code-closeout-and-phase-report.md](09-current-product-gate-dead-code-closeout-and-phase-report.md) - Done

## Phase-Level Checks

Run with Node `24.19.0`:

```bash
nvm use 24
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm depcruise
pnpm check
pnpm web:visual:qa
git diff --check
graphify update .
```

## Phase-Level Manual Inspection

- The career sidebar remains stable while Matchday fills all remaining width.
- Pre-match contains no duplicated fixture/venue summary.
- Starting a half never makes the page grow with an event log.
- Score, current commentary, and tabellino read as one broadcast hierarchy.
- A goal is unmistakable but restrained, readable, and not arcade-like.
- Pause and speed controls are clear, keyboard-operable, and presentation-only.
- Half time answers what happened, who needs attention, and what can be changed.
- The tactical board is unchanged and fully operable.
- Full time provides both teams' ratings and durable consequences through tabs
  without becoming a long diagnostic dump.
- Desktop, wide, narrow, 200% text, reduced motion, keyboard, loading, command
  failure, and refresh states have no clipping, overlap, inaccessible action,
  horizontal page overflow, or incoherent layout shift.

## What NOT To Implement

- No match-engine, rating, balance, tactical-effect, or event-generation change.
- No penalty, card, injury, extra-time, shootout, cup, or substitution fact not
  already emitted by a real current producer.
- No fake commentary corpus, runtime LLM, build-time LLM, or inferred prose
  story.
- No animated 2D/3D viewer, audio, crowd simulation, confetti, or decorative
  match engine.
- No persistent playback state, tab state, timer, or animation cursor.
- No global shell redesign, sidebar width change, right rail, or duplicate
  Matchday navigation.
- No tactical-board source, pitch SVG, token, role, geometry, or interaction
  change.
- No new career section, market, finance, youth, staff, media, press, board, or
  archive workflow.
- No generic tabs framework or match-viewer abstraction without multiple real
  current consumers.
- No compatibility wrapper, unused event kind, hidden fallback, dead selector,
  or deferred cleanup.
- No Phase 74 implementation.

## Definition Of Done

- Matchday uses the entire shell content outlet at every phase.
- Pre-match has one confirmation surface and one Start match command.
- Each half progresses through one stable commentary line with bounded,
  controllable presentation timing and no growing event log.
- Goals and other real decisive facts receive coherent visual hierarchy and
  readable holds without changing simulation truth.
- The compact tabellino stays directly below the score.
- Half time uses accessible tabs and preserves the complete shared tactical
  decision workspace.
- Full time exposes selected-club ratings, opponent ratings, and durable
  consequences through accessible tabs and one return command.
- Narrow, 200% text, keyboard, focus, live-region, and reduced-motion behavior
  meet the documented WCAG 2.2 AA working target.
- Replaced components, branches, labels, selectors, fixtures, and tests are
  removed after replacement coverage passes.
- Canonical real-browser SQLite/OPFS QA, `pnpm check`, build, dependency rules,
  diff check, and Graphify update pass.
- The final report recommends exactly Phase 74 without starting it.
