# Inbox/Posta Decision Center Report

Date: 2026-07-14  
Phase: `73-inbox-posta-decision-center-and-career-attention-workflow`  
Status: complete

## Outcome

Posta is now the current-season decision center for facts the game can actually
support. `Continue` evaluates deterministic game dates and stops on the first
date containing blocking or important attention. Every message on that date is
delivered together; informational messages remain available without causing a
stop.

The supported production vocabulary is intentionally small:

- `matchday`: one fixture-scoped blocking item whose destination changes from
  preparation to match entry as real lineup, bench, and tactic facts change;
- `match_result`: one informational summary after a committed fixture;
- `season_rollover`: one important archive-backed review for the new season.

## Ownership

- Domain owns language-agnostic IDs, categories, levels, sources, blockers,
  action IDs, related facts, and independent read/acknowledged/resolved state.
- Engine owns daily Continue policy, same-date batching, deterministic order,
  delivery, opening, important acknowledgement, fact-derived resolution,
  result summaries, and season rollover replacement.
- Storage owns current-season messages in SQLite schema v6 and the JSON/default
  migration boundary. It stores lifecycle with the career, not in browser UI
  preferences.
- The web runtime applies engine use cases to the dirty `CareerSession`; reading
  a message never writes through to storage. Manual or due safe-stop save
  commits the lifecycle with the rest of the career.
- `@game/ui` owns framework-free list, detail, filter, count, and rail read
  models. React renders and localizes them; Zustand owns only ephemeral filter,
  selection, narrow-pane, command, and navigation state.

## User Experience And Fun Review

- PASS: the user sees why `Continue` stopped and one direct football action.
- PASS: preparation is not a separate bureaucratic stop before matchday.
- PASS: opening Posta is useful but does not silently save the career.
- PASS: the compact rail is awareness-only; the central destination owns the
  decision and avoids duplicate action routing.
- PASS: ordinary player-state deltas do not flood the manager with messages.
- PASS: calendar movement is short, bounded to 1.8 seconds, and reduced-motion
  safe, so feedback does not slow repeated play.

## Persistence And Determinism

- Message IDs are stable and duplicate delivery is idempotent.
- Opening, acknowledgement, and resolution survive the configured save
  boundary and refresh from SQLite/OPFS.
- A load refreshes due structured facts inside the working session without an
  immediate write.
- New-season advancement replaces the previous current-season Inbox with the
  supported rollover review; no historical mail archive is fabricated.
- Current-date inspection does not expose a future fixture before `Continue`
  advances the canonical career date.

## Quality And Cleanup

- Removed legacy attention categories, translation keys, duplicate message
  action routing, stale step comments, and replaced presenter paths.
- No unused Phase 73 Posta/calendar CSS selector remains.
- No production message scaffolding exists for market, contracts, finances,
  youth, or staff.
- Dependency-cruiser reports no violations across 492 modules and 1,721
  dependencies.
- The production web build passes. Its existing initial bundle warning remains
  a separate performance concern; this phase does not hide it or add an
  unrelated splitting abstraction.

## Deferred Work

Market, player contracts, finances, youth academy, and staff remain binding
future obligations in
`docs/audits/CAREER_INBOX_FUTURE_MESSAGE_EXTENSION_MATRIX.md`. A row may enter
production only with a complete playable workflow, persisted facts, explicit
attention policy, state-derived resolution, and a real destination.

## Verification

- All required package typechecks passed on Node 24.16.0.
- Web: 47 files and 193 tests passed; production build passed.
- Monorepo: 160 files and 946 tests passed through `pnpm check`.
- Playwright: 2 production SQLite/OPFS journeys passed on desktop and narrow
  Chromium, including filters, lifecycle, same-date content, result delivery,
  save cadence, refresh, focus, text zoom, overflow, and reduced motion.
- `pnpm depcruise`, localized-presentation checks, `git diff --check`, and
  `graphify update .` pass.

## Next Phase

Recommend exactly `Phase 74 - Player Generation And Model Consolidation
Cleanup`. This report does not start it. `Squad Screen And Player Memory
Foundation` remains the next unnumbered web-section backlog item until the
global sequence assigns it a number.

