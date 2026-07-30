# Phase 79B - Squad And Market Player Workspace UI/UX And Career Statistics

## Status

Done. Steps 01-07 are complete; control returns to Phase 79 Step 14.

## Completion And Verification

- Domain, engine, storage, UI, and i18n package tests pass.
- Web tests pass: 72 files and 322 tests.
- Web typecheck and production build pass. The known chunk-size warning remains
  non-blocking.
- Visual QA passes: 29 of 29 scenarios in 4.4 minutes.
- The responsive Squad-table vertical-scroll glitch was corrected by giving
  its scroll frame an explicit containing block and retaining a browser
  assertion for both internal and document scroll ownership.
- Repository-wide `pnpm check` passes: 235 files / 1,452 tests,
  dependency-cruiser 715 modules / 2,700 dependencies, localized text, lint,
  and all workspace typechecks.
- `git diff --check` and `graphify update .` pass.
- Phase 79 Step 14 is next. Its `750 x 50` long run remains unrun and unclaimed.

## Goal

Turn Squad and Market into coherent football-management workbenches with
compact row actions, direct lineup placement, public half-star assessments,
role-aware player inspection, truthful current/career statistics, and
three-tab player details.

This was a user-requested interposition while Phase 79 Step 14 remained
Reopened. It did not run, replace, weaken, or claim the Phase 79 `750 x 50`
gate.

## Entry Gate

- Phase 79 Steps 01-13 are Done.
- Phase 79A Steps 01-07 are Done.
- Phase 79 Step 14 was deliberately paused while this bounded browser/product
  phase executed and is active again.
- Squad, Tactics, Market, contracts, finances, exact current abilities,
  current participation, match reports, and one durable season archive already
  have canonical owners.
- The existing visual identity, tactical board, SQLite/OPFS career session, and
  save cadence remain binding.

## Locked Product Decisions

### Public Rating

- Current level and potential use public stars from `1` to `5` in `0.5`
  increments.
- Ratings are measured against the selected club's current senior-squad
  standard, including Market targets from other clubs.
- Potential uses the same current-squad reference, not another club's hidden
  potential distribution.
- A player whose role ability reaches the explicit absolute elite threshold
  adds a sixth dark-orange star after five ordinary gold stars.
- Exact hidden numeric potential never enters UI read models, browser state,
  accessible text, or DOM attributes.

### Squad Placement And Actions

- Every Squad row has one `Schieramento` select with `Non convocato`,
  `Panchina`, and the real XI role/side slots.
- Selecting an occupied slot swaps automatically:
  - XI to occupied XI exchanges the two players;
  - bench to occupied XI sends the replaced starter to the same bench place;
  - unselected to occupied XI leaves the replaced starter unselected.
- A full bench does not advertise an impossible bench move.
- Weak but legal makeshift XI assignments remain available and clearly named.
  `invalid` assignments do not.
- Inline action clusters are replaced by one accessible contextual menu. The
  existing detailed lineup-choice dialog remains available from that menu and
  is not deleted.

### Player Detail

- Header role facts show only `natural` and `adapted`; weak/red roles are
  omitted.
- Outfield players show technical, mental, and physical current attributes.
- Goalkeepers show goalkeeping, mental, and physical current attributes.
- Squad tabs are `Attributi`, `Statistiche`, `Contratto`.
- Market tabs are `Attributi`, `Statistiche`, `Contratto e offerta`.
- Contract and offer forms remain mounted across tab changes so drafts survive.
- Market shows exact current attributes immediately. There is no fake scouting
  fog or observer workflow in this phase.

### Career Statistics

- Durable season archives store only facts already supported by the engine:
  starts, substitute appearances, minutes, rating totals/samples, goals,
  assists, and saves.
- Appearances and average ratings are derived; career rating is weighted by
  samples.
- Archive rows survive player retirement and therefore do not depend on an
  active-player foreign key.
- Participation/event coverage is explicit. Partial or unavailable data is
  never rendered as a truthful zero.
- No clean sheets, xG, cards, club splits, or invented backfill.

## Ordered Steps

1. `01-lock-player-workspace-product-and-design-contract.md`
2. `02-durable-player-career-statistics-archive.md`
3. `03-public-half-star-assessment-and-shared-rating-view.md`
4. `04-squad-lineup-select-swap-and-action-menu.md`
5. `05-squad-player-profile-tabs-and-role-aware-attributes.md`
6. `06-market-player-profile-exact-attributes-statistics-and-offer.md`
7. `07-responsive-accessibility-visual-qa-and-phase-report.md`

## Phase-Level Checks

```bash
nvm use 24
pnpm --filter @game/domain run test
pnpm --filter @game/engine run test
pnpm --filter @game/storage run test
pnpm --filter @game/ui run test
pnpm --filter @game/i18n run test
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement

- No Phase 79 `750 x 50`, `10,000 x 50`, or replacement long run.
- No scouting fog, scout staff, knowledge percentages, report expiry, hidden
  attribute placeholders, or fake observations.
- No clean-sheet attribution, xG history, cards history, club-by-club split, or
  inferred historic backfill.
- No change to match simulation, player development, valuation, contracts,
  negotiation outcomes, market AI, finance policy, or player generation.
- No new route, tactical board redesign, career shell redesign, theme picker,
  parallel browser state, action-level persistence, or form rewrite.
- No exact numeric potential leak.
- No route/component deletion. Dead code may be removed only if a later
  documented finding names the exact file and the user confirms it.

## Definition Of Done

- Squad rows expose one placement select and one contextual action menu with
  keyboard/touch parity and automatic occupied-slot swaps.
- Squad and Market tables and details share one accessible half-star renderer
  and selected-club-relative assessment.
- Elite players receive a sixth dark-orange marker only at the absolute
  threshold.
- Player inspectors show compact natural/adapted roles, role-appropriate
  current attributes, truthful statistics, and the locked three tabs.
- Current and archived statistics persist losslessly through JSON and
  SQLite/OPFS; missing coverage stays explicit.
- Market shows exact current attributes without creating a scouting subsystem.
- Desktop, narrow, keyboard, touch, 200% text, reduced motion, menu clipping,
  modal scrolling, focus restoration, package, browser, diff, and Graphify
  checks pass.
- Phase 79B closes and returns control to Phase 79 Step 14 without running or
  claiming its long-run gate.
