# Phase 80 - Graphical And Structural Rework

## Status

In progress. Step 01 is Done and established the repository-wide seven-worker
simulation policy plus the phase documentation boundary. Step 02 is active but
must not infer the graphical or structural reworks: it waits for the user's
concrete change list and then records the accepted inventory.

The former roadmap reservation `Phase 80 - Finances Expansion And Poverty Loop
MVP` is superseded by this explicit product decision. Its scope remains a
future backlog item and is not silently included here.

## Goal

Rework the current product's visual presentation and selected structural seams
without regressing the deterministic game, canonical ownership, browser
accessibility, save lifecycle, or the completed Phase 79D player/economy model.

The exact reworks are intentionally not guessed in this README. Step 02 must
record each user-requested change, its current evidence, owner, expected
outcome, non-goals, and verification before implementation steps are created.

## Entry Gate

- Phase 79D is complete by explicit product decision.
- Phase 79 Step 14 remains Reopened and paused without a release-gate claim.
- The stopped Phase 79D `50 x 20` produced no report and remains unclaimed.
- The final Phase 80 validation sequence must run one resumable `50 x 20`
  after all accepted reworks, using `50` stable shards and the repository-wide
  seven-worker policy.
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

Step 02 creates the later ordered implementation and closeout documents only
after the user-defined inventory is accepted. This README does not pre-allocate
fake implementation steps.

## Validation Ladder

- Step 01 proves the shared worker policy with focused unit/integration checks
  and updates every current execution/documentation seam.
- Step 02 is audit/design-contract work only. It captures screenshots and
  current architecture evidence for the actual requested reworks.
- Later implementation steps use focused package checks and proportionate
  browser QA, one bounded rework at a time.
- The final implementation step runs the complete repository/browser gates.
- The final closeout step runs the checkpointed `50 x 20` once, with `50`
  stable shards and `7` workers, then records a truthful Phase 79 handoff.
- The `50 x 20` does not replace or claim Phase 79 Step 14's release-scale
  gate and does not prove equilibrium after season 20.

## What NOT To Implement

- No guessed graphical redesign, component rewrite, or structural refactor.
- No broad design-system replacement without an accepted inventory item.
- No duplicated read model, command path, simulation runner, or persistence
  path.
- No finance expansion, poverty loop, stadium, sponsorship, facilities, staff,
  scouting, advanced pyramid, or narrative system.
- No runtime LLM, live external data, or real-player content.
- No compatibility migration for obsolete beta saves unless an accepted
  structural rework explicitly requires a clean reset.
- No long run before the final documented Phase 80 closeout step.
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
- One final checkpointed `50 x 20` completes with `50` stable shards and `7`
  workers after every rework.
- Phase 79 Step 14 receives the truthful result and remains unclaimed until its
  own documented release gate actually runs.
