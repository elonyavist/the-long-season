# Career Continue Inbox Foundation Report

Date: 2026-06-23
Phase: `50-career-continue-and-inbox-foundation`
Status: Complete

## Summary

Phase 50 added the first Football Manager style career loop foundation:

1. The web dashboard can expose a `Continue` action.
2. Continue delegates to a deterministic engine rule.
3. The engine advances only until a manager-relevant attention stop.
4. The stop is represented as structured career attention data.
5. The stop is also surfaced as an Inbox/Posta message.
6. The web dashboard renders a compact Inbox panel from a UI read model.

The implemented loop is intentionally narrow. It handles:

- missing match preparation;
- matchday reached when preparation exists.

It does not yet handle market, contracts, youth decisions, finance, staff,
injuries, registration, or season rollover attention events.

## Implemented Source Areas

### Domain

- `packages/domain/src/career/inbox.ts`
  Defines stable `inbox:` IDs, message categories, statuses, priorities,
  action IDs, related entities, and message validation.
- `packages/domain/src/career/attention.ts`
  Defines stable `attention:` IDs, attention categories, attention reasons,
  blocker keys, deterministic sorting, and factory helpers for the current
  match-preparation and matchday stops.

These contracts are language-agnostic. They store translation keys and
structured facts, not rendered text.

### Engine

- `packages/engine/src/career/continue-career.ts`
  Adds `continueCareerUntilAttention`, a pure deterministic rule that accepts
  current date, selected club, next fixture, preparation facts, and existing
  attention events.

The function returns stop reason, stop date, days advanced, attention events,
and Inbox messages. It does not play a fixture, write a save, choose a lineup,
choose a tactic, or mutate career state.

### UI Read Models

- `packages/ui/src/career/career-inbox-view.ts`
  Builds an ordered Inbox/Posta read model with unread count,
  action-required count, highest priority, and empty-state keys.

`@game/ui` remains dependency-free. It accepts structural message input instead
of importing domain contracts directly, preserving the package boundary.

### Web Adapter

- `apps/web/src/career/continue-demo-career.ts`
  Adapts the current demo dashboard facts into a continue request and delegates
  stop logic to `@game/engine`.
- `apps/web/src/screens/CareerDashboardScreen.tsx`
  Adds the Continue action, attention-stop panel, and Inbox panel slot.
- `apps/web/src/components/CareerInboxPanel.tsx`
  Renders the compact Inbox/Posta panel from the UI read model.
- `apps/web/src/visual-qa/continue-inbox.spec.ts`
  Runs browser QA for main menu, new career, dashboard, Continue, attention
  stop, and Inbox/Posta on desktop and narrow viewport.

The web implementation remains a prototype adapter over an in-memory demo
career. It does not yet load or write real browser career saves.

## Package Direction

The package direction after this phase is:

- `packages/domain` owns the durable career attention and Inbox contracts.
- `packages/engine` owns deterministic Continue-until-attention logic.
- `packages/ui` owns language-agnostic Inbox read models.
- `apps/web` composes engine, UI read models, and i18n to render the first
  browser interaction.

The new web dependency on `@game/engine` is accepted because the web app is an
outer adapter. `@game/ui` still does not import engine, domain, storage, React,
browser APIs, or i18n.

## Product Findings

The loop now has the correct product shape:

- The manager presses Continue.
- The game stops before skipping a decision.
- The attention reason is visible.
- The Inbox/Posta message gives the user a place to act.

This is better for playability than adding more isolated CLI features, because
it establishes the daily career rhythm the UI will need.

## Visual QA Findings

Playwright QA confirmed the prototype flow works on desktop and narrow
viewport:

- main menu loads;
- New career opens the dashboard;
- Continue is visible;
- pressing Continue produces a match-preparation-required stop;
- Inbox/Posta shows an action-required message;
- desktop and narrow screenshots have no blocking overlap or clipped text.

Screenshots are generated outside the repository:

- `/tmp/the-long-season-phase50/continue-inbox-desktop.png`
- `/tmp/the-long-season-phase50/continue-inbox-narrow.png`

## Intentionally Out Of Scope

Phase 50 did not implement:

- full match preparation UI;
- lineup editor;
- tactic editor;
- match viewer;
- fixture playback;
- real browser save persistence;
- market attention events;
- contract or wage attention events;
- youth academy decision events;
- staff reports;
- finance/economics events;
- a full mail client;
- hidden transfer recommendations;
- automatic lineup or tactic choices.

Those areas require their own documented phases.

## Risks And Follow-Up Notes

- The web dashboard still runs on deterministic demo data. A future real-save
  adapter must replace `continueDemoCareer` without moving rules into React.
- Inbox messages are not persisted yet. Persistence should happen only when the
  browser save/load path is introduced.
- The first action exposed by the Inbox is `prepare_match`, but the app does
  not yet have a screen that lets the manager choose lineup and tactic.
- Future attention categories should be added only when their underlying system
  exists, otherwise the Inbox becomes noise.

## Recommended Next Phase

Exactly one next phase is recommended:

`Phase 51 - Web Match Preparation Slice`

Reason:

The current Continue flow stops because match preparation is missing. The next
playability bottleneck is therefore not another background simulation system,
but the first manager decision screen that can resolve that blocker: selecting
or confirming lineup and tactic for the next fixture.

Phase 51 should stay narrow:

- show the next selected-club fixture;
- show current saved preparation state;
- expose a simple lineup/tactic preparation view using existing contracts;
- save or stage the manager's preparation choice through the current prototype
  boundary;
- let the dashboard Continue move from `match_preparation_required` to
  `matchday_reached`.

It should not implement a full squad management UI, transfer UI, contracts,
economics, match playback, or automatic selection.

## Verification

Step 09 verification passed:

- `test -f docs/audits/CAREER_CONTINUE_INBOX_FOUNDATION_REPORT.md`
- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/ui run typecheck`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check` (`98` test files passed, `633` tests passed)
- `git diff --check`
