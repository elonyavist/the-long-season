# Phase 73 - Inbox/Posta Decision Center And Career Attention Workflow

## Goal

Turn Inbox/Posta into the manager's structured decision center and make
`Continue` advance through canonical game days until the first meaningful
attention date.

At the end of this phase:

1. `Continue` evaluates game days in order and stops only for blocking or
   important attention;
2. all messages produced on the stop date arrive together;
3. match preparation and matchday are one blocking match message, not two
   bureaucratic stops;
4. a compact left rail provides awareness while a two-column Posta outlet owns
   reading and decisions;
5. read, acknowledged, and resolved are separate durable concepts;
6. current-season messages survive save/load and are cleared when a new season
   begins;
7. calendar movement has a short purposeful day-transition animation without
   pretending to be engine progress.

## User-facing reason

`Continue` is the heartbeat of the game. It should create anticipation, stop
when the manager needs to understand or decide something, and avoid turning
every ordinary update into bureaucracy.

Posta must feel like a Football Manager decision workspace rather than a
decorative counter or a generic email client. The manager should immediately
understand:

- why time stopped;
- whether the message is blocking, important, or informational;
- what football facts matter;
- which single action moves the career forward.

## Locked attention model

Every delivered message has exactly one attention level:

- `blocking`: stops `Continue` and keeps it unavailable until the underlying
  game state is genuinely resolved;
- `important`: stops `Continue` once, opens automatically, and stops blocking
  future advancement after acknowledgement;
- `informational`: is delivered to Posta but never interrupts advancement.

Opening a message marks it read. Reading is not resolution. Important messages
become acknowledged after the manager opens them. Blocking messages become
resolved only when their underlying structured requirement becomes true. There
is no generic `Mark resolved` command.

## Locked daily advancement model

- Advancement uses canonical `GameDate`, never wall-clock time.
- Days are evaluated in deterministic order.
- The first date containing blocking or important attention is the stop date.
- Every message produced on that date is delivered in one batch.
- The highest-level message is selected automatically, with stable ID as the
  final ordering tie-breaker.
- The app never creates consecutive same-date stops merely to reveal messages
  one at a time.
- Informational messages from traversed days are delivered without causing a
  stop.

## Locked initial message policy

- Matchday produces one blocking `matchday` message on the fixture date.
- Incomplete lineup, bench, or tactic are blocker facts inside that message,
  not a separate preparation message or an earlier stop.
- The matchday primary action is `Prepare match` while preparation is
  incomplete and `Go to match` when it is ready.
- A result already reviewed in the match centre is informational.
- Ordinary condition, form, and morale consequences are informational and may
  be summarized with the result rather than duplicated as separate mail.
- A supported season rollover summary is important and stops once.
- Exceptional player consequences become important only after the engine owns
  an explicit severity fact. This phase must not infer importance from UI copy.

## Locked Posta UX

- Standard career screens keep a compact Posta rail on the left.
- Selecting Posta opens a central two-column workspace, not a detached mail
  application.
- The message list uses a fixed practical width of roughly `340-380px` on wide
  screens; the detail owns the remaining space.
- Rows show subject, functional source, date, one-line preview, unread state,
  and restrained level emphasis. They are dense rows, not separate SaaS cards.
- Detail shows structured football facts and one primary action. It does not
  duplicate the dashboard or expose technical IDs.
- On narrow screens the list and detail become successive views with an
  explicit Back command.
- Functional sources such as competition office, technical staff, and match
  report are used until real persisted staff members exist. No fake staff
  identity is invented.
- Filters are exactly `All`, `To handle`, and `Unread` in this phase.

## Calendar transition

The engine completes advancement deterministically before presentation animates
the calendar. The UI then advances visible dates in sequence at roughly
`100-140ms` per day, accelerates after seven days, and caps the transition at
about two seconds. Reduced-motion users see the final date immediately.

This is a time-passage transition, not a fake loading percentage. The existing
Phase 72 command activity remains the only asynchronous command lock.

## Persistence and season lifecycle

- Message facts and lifecycle state belong to the loaded career, not browser
  preferences or component state.
- SQLite/OPFS remains the only browser career persistence path.
- Reading or acknowledging a message changes the Phase 72 working session and
  does not write immediately.
- Manual save or due safe-stop autosave commits Inbox state with the career.
- Messages belong only to the current season.
- Starting a new season clears the previous season's Inbox after the supported
  season summary has been delivered/acknowledged according to the documented
  rollover ordering.
- No hidden archive table or alternate history store is introduced.

## Architecture target

```text
structured career facts
  -> deterministic attention projector / Continue policy
       -> current-season Inbox lifecycle in CareerState
            -> CareerSession working state
                 -> @game/ui Posta list/detail view models
                      -> compact left rail + central Posta outlet
```

Domain owns language-agnostic contracts and durable lifecycle facts. Engine
owns advancement and attention decisions. Storage round-trips current-season
state. UI builders derive ordered presentation data. Web owns routing,
interaction, animation, and localized rendering.

## Mandatory future message extension register

The final phase report and both career roadmaps must retain a visible extension
matrix for:

- market;
- player contracts;
- finances;
- youth academy;
- staff.

Each future system must declare its structured message facts, attention level,
resolution condition, destination screen, and persistence owner when its real
workflow is implemented. Phase 73 must not scaffold fake categories for them.

## No-dead-code contract

- Every new production type, projector, use case, route, and component has a
  current production caller in the same step.
- The old preparation-specific message path is deleted when the unified
  matchday message becomes active.
- The current summary-only Posta rendering is replaced, not retained as an
  alternate screen.
- Read/acknowledged/resolved state has one owner and one mutation path.
- The Phase 72 command runner and save cadence are reused, not wrapped in a new
  queue, timer, or persistence layer.
- No future system category, generic event bus, notification framework, or
  archive placeholder is added without a current caller.

## Ordered steps

1. [01-current-attention-and-posta-audit.md](01-current-attention-and-posta-audit.md)
2. [02-canonical-attention-level-and-message-lifecycle-contract.md](02-canonical-attention-level-and-message-lifecycle-contract.md)
3. [03-daily-continue-stop-policy-and-same-date-delivery.md](03-daily-continue-stop-policy-and-same-date-delivery.md)
4. [04-durable-current-season-inbox-and-season-reset.md](04-durable-current-season-inbox-and-season-reset.md)
5. [05-inbox-lifecycle-use-cases-and-runtime-integration.md](05-inbox-lifecycle-use-cases-and-runtime-integration.md)
6. [06-posta-read-model-route-and-screen-state.md](06-posta-read-model-route-and-screen-state.md)
7. [07-football-manager-style-posta-rail-list-and-detail.md](07-football-manager-style-posta-rail-list-and-detail.md)
8. [08-unified-matchday-message-action-and-resolution-flow.md](08-unified-matchday-message-action-and-resolution-flow.md)
9. [09-informational-important-delivery-and-future-extension-matrix.md](09-informational-important-delivery-and-future-extension-matrix.md)
10. [10-calendar-transition-and-continue-feedback.md](10-calendar-transition-and-continue-feedback.md)
11. [11-accessibility-playwright-cleanup-and-phase-report.md](11-accessibility-playwright-cleanup-and-phase-report.md)

## Phase-level checks

- Focused domain, engine, storage, UI, web, runtime, and i18n tests for touched
  Modules.
- Determinism tests for daily ordering, same-date batching, stable IDs, and
  acknowledgement behavior.
- Persistence tests for unread/read/acknowledged/resolved state and new-season
  reset.
- Write-count tests proving message interaction does not save after every click.
- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/engine run typecheck`
- `pnpm --filter @game/storage run typecheck`
- `pnpm --filter @game/ui run typecheck`
- `pnpm --filter @game/i18n run typecheck`
- `pnpm --filter @game/web run typecheck`
- `pnpm --filter @game/web run test`
- `pnpm --filter @game/web run build`
- `pnpm depcruise`
- `pnpm check`
- Playwright desktop and narrow QA for the rail, full Posta screen, automatic
  stop routing, matchday dynamic action, calendar transition, keyboard flow,
  focus, reduced motion, overflow, and save/load restoration.
- `git diff --check`
- `graphify update .` after source changes.

Run `nvm use 24` before project commands and before every dependency change.

## What NOT to implement in this phase

- No market, contract, finance, youth, staff, board, media, or press workflow.
- No generic prose/news feed.
- No fake staff people, avatars, biographies, or recommendations.
- No message category that cannot be produced and restored from current state.
- No full historical Inbox archive; the previous season is cleared.
- No separate preparation stop before matchday.
- No automatic hidden resolution or generic `Mark resolved` action.
- No save after every read, acknowledgement, filter, or selection action.
- No new command queue, event bus, toast system, browser persistence fallback,
  or wall-clock scheduler.
- No tactical-board, match-engine, balance, or unrelated dashboard redesign.

## Definition of Done

- `Continue` evaluates days deterministically and stops only for blocking or
  important attention.
- One date produces one stop and one ordered message batch.
- Matchday is one blocking message with a preparation-aware primary action.
- Important messages stop once; informational messages never stop.
- Read, acknowledged, and resolved are distinct and persist through normal save
  boundaries.
- Current-season messages clear on new-season transition.
- The compact left rail and full two-column Posta screen are useful, dense,
  localized, keyboard operable, and responsive.
- Calendar movement is visible, short, accelerated, reduced-motion safe, and
  never presented as fake engine progress.
- Replaced message/rail paths are deleted and no dead production code remains.
- Playwright screenshots pass manual visual inspection.
- `pnpm check` passes.
- The final report recommends exactly one next phase without implementing it.
