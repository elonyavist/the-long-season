# Phase 80 - Graphical And Structural Rework

## Status

Complete. All nine steps are Done and Phase 80A is the only next phase. The
five accepted reworks ship together with green repository and browser evidence,
recorded in
`docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_REPORT.md`. Step 03's
shared renderer correction passes. Direct product review also exposed an
upstream generation/projection mismatch; the accepted Phase 80A contract owns
that model correction, so Phase 80 finished its bounded graphical/interaction
scope without hiding or duplicating player-model logic. No longitudinal cohort
ran, and Phase 79 Step 14 remains paused and unclaimed.

The former roadmap reservation `Phase 80 - Finances Expansion And Poverty Loop
MVP` is superseded by this explicit product decision. Its scope remains a
future backlog item and is not silently included here.

## Goal

Rework the current product's visual presentation and selected structural seams
without regressing the deterministic game, canonical ownership, browser
accessibility, save lifecycle, or the completed Phase 79D player/economy model.

The accepted reworks are recorded in
`docs/audits/PHASE_80_GRAPHICAL_AND_STRUCTURAL_REWORK_INVENTORY.md`. Later
steps may implement only those items and their necessary regression evidence.

## Entry Gate

- Phase 79D is complete by explicit product decision.
- Phase 79 Step 14 remains Reopened and paused without a release-gate claim.
- The stopped Phase 79D `50 x 20` produced no report and remains unclaimed.
- The deferred resumable `50 x 20` must not run in Phase 80. It belongs only
  to Phase 80C Step 09 after Phase 80A player-model, Phase 80B market/loan, and
  Phase 80C competitive-race reworks, using `50` stable shards and `7` workers.
- No Phase 79 release-scale cohort, finance expansion, Phase 81 work, or
  unrelated feature starts inside Phase 80.

## Locked Architecture

- Domain and engine remain deterministic, language-agnostic, and independent
  from React, browser APIs, storage IO, and presentation timing.
- `@game/ui` owns reusable framework-free read models; React renders facts and
  dispatches typed commands without recreating gameplay rules.
- SQLite/OPFS remains the canonical browser career persistence owner.
- The shared motion system remains presentation-only and must preserve the
  reduced-motion path.
- Visual work targets WCAG 2.2 AA and may not communicate important state by
  color or animation alone.
- Structural work changes only the named canonical owner. It must remove any
  replaced path in the same step rather than retain compatibility debris.
- Batch simulation concurrency is repository policy, not per-phase folklore:
  use at most `7` workers and default to `min(7, independent work items)`.

## Ordered Steps

1. `01-seven-worker-simulation-policy-and-phase-bootstrap.md`
2. `02-accepted-graphical-and-structural-rework-inventory.md`
3. `03-achieved-versus-upside-player-star-language.md`
4. `04-market-pagination-debounced-filters-and-age-controls.md`
5. `05-squad-age-placement-order-and-debounced-search.md`
6. `06-canonical-money-presentation-and-editable-inputs.md`
7. `07-market-offer-dialog-draft-stability.md`
8. `08-integrated-browser-accessibility-and-regression-closeout.md`
9. `09-phase-closeout-and-80a-handoff.md`

## Validation Ladder

- Step 01 proves the shared worker policy with focused unit/integration checks
  and updates every current execution/documentation seam.
- Step 02 is audit/design-contract work only. It captures screenshots and
  current architecture evidence for the actual requested reworks.
- Steps 03-07 use focused package checks and proportionate browser QA, one
  bounded rework at a time.
- Step 08 runs the complete repository/browser gates.
- Step 09 closes only the accepted UI rework and hands control to Phase 80A.
- Phase 80C Step 09 owns the sole deferred checkpointed `50 x 20`; it does not
  replace or claim Phase 79 Step 14's release-scale gate.

## What NOT To Implement

- No graphical redesign, component rewrite, or structural refactor outside
  accepted inventory IDs `P80-R01` through `P80-R05`.
- No broad design-system replacement without an accepted inventory item.
- No duplicated read model, command path, simulation runner, or persistence
  path.
- No finance expansion, poverty loop, stadium, sponsorship, facilities, staff,
  scouting, advanced pyramid, or narrative system.
- No runtime LLM, live external data, or real-player content.
- No compatibility migration for obsolete beta saves unless an accepted
  structural rework explicitly requires a clean reset.
- No long run in Phase 80.
- No simulation adapter may raise concurrency above `7`.

## Definition Of Done

- Every graphical and structural rework comes from the accepted Step 02
  inventory and has a named canonical owner.
- Replaced code is removed without compatibility leftovers or dead helpers.
- Browser-visible changes pass required desktop, narrow, keyboard, focus,
  reduced-motion, and relevant `200%` text checks.
- Structural changes pass focused determinism, persistence, dependency, and
  absence checks proportionate to their risk.
- `pnpm check`, web build, required Playwright QA, diff, and Graphify pass.
- Phase 80 closes with full repository/browser evidence and a documented
  Phase 80A handoff.
- The deferred `50 x 20` remains unrun until Phase 80C Step 09.
- Phase 79 Step 14 remains paused and unclaimed until the later truthful
  Phase 80C handoff.
