# Phase 81C - Season Clock, Contracts And Complete Domestic World

## Status

**Planned and blocked behind Phase 81B GO. Do not execute yet.**

This is the narrowed successor to the former Phase 81B contract/free-agent/
background-fixture plan. Player population, career trajectory, recruitment
intents and the AI free-agent signing policy moved to Phase 81B. This phase
does not reimplement them.

## Thesis

Phase 81B must first make the player population and generational renewal
credible. Phase 81C then makes the surrounding career calendar truthful:

- signed contracts expire at one canonical season boundary;
- term offers use one month-precision representation;
- the AI recruitment policy from Phase 81B consumes the resulting free-agent
  cadence without a second planner;
- every domestic competition needed for career rollover has canonical fixture
  results;
- interactive and automatic matches share one producer;
- tables, scorers, assists, player appearances and transfers reconcile over a
  complete domestic world;
- only after bounded evidence passes may the resumable `750 x 10` world-
  integrity cohort run.

The user-facing reason is separation of concerns. A correct player model must
not wait behind a day-long world report, while a complete-world report must not
pretend that selected-division-only fixtures can support ten-season rollover.

## Entry Gate

Phase 81C starts only when:

- Phase 81A is closed;
- Phase 81B closes with GO and its recruitment, public assessment, development
  and free-agent Interfaces are final;
- Phase 81B's 50 x 20 player-model HTML has been reviewed without being
  misread as complete domestic-world evidence;
- Step 00 resolves every execution blocker before implementation;
- Phases 82A and 82B remain unstarted.

## Locked Ownership

Phase 81C owns:

- the canonical season boundary for signed contracts;
- month-precision offered terms and expiry derivation;
- background fixture completion required by the career rollover contract;
- the shared automatic/interactive match producer;
- post-clock free-agent cadence measurement;
- the bounded canary and complete `750 x 10` world-integrity cohort.

Phase 81C consumes but does not own:

- `PlayerCareerTrajectory` and the public forecast from Phase 81B;
- `AiRecruitmentIntent` and AI candidate scoring from Phase 81B;
- the canonical AI free-agent signing policy from Phase 81B;
- tactical XI/formation selection from Phase 81A.

Loans, recalls, transfer races and multi-suitor negotiation remain Phase
82A/82B work.

## Ordered Steps

1. `00-pre-implementation-analysis-prerequisite.md`
2. `01-season-clock-contract-and-world-baseline.md`
3. `02-season-anchored-expiry-and-month-precision-terms.md`
4. `03-background-world-execution-contract.md`
5. `04-complete-domestic-background-fixtures.md`
6. `05-simulate-match-command-on-the-shared-producer.md`
7. `06-world-integrity-cohort-authorization.md`
8. `07-checkpointed-750x10-world-integrity-cohort-and-diagnostic-view.md`

## Validation Ladder

- Step 00 closes the known contract and instrumentation contradictions.
- Step 01 freezes the unchanged contract/calendar/world baseline and all
  numeric semantics before behavior changes.
- Step 02 changes only contract time/term ownership and performs the phase's
  single beta reset if persisted truth changes incompatibly.
- Step 03 freezes the executable all-domestic background-world contract,
  ordering, rollover scope, budgets and report populations.
- Step 04 implements complete domestic fixture progression and proves exact
  reconciliation on a bounded checkpoint.
- Step 05 exposes `simulate-match` through the same producer and proves kickoff
  equivalence without conflating later human intervention.
- Step 06 remeasures the free-agent cadence and authorizes the long cohort.
- Step 07 runs a locked `7 x 10` canary, then the resumable `750 x 10` only on
  GO, with exactly seven workers.

Every report uses `pnpm cli simulation-report`. No second report command,
simulator, parser or renderer is permitted.

## What This Phase Does Not Implement

- No player generation, forecast, development, aging or recruitment rewrite.
- No second AI free-agent policy.
- No loans, recalls, sale postures, races or player-choice negotiation.
- No selected-division shortcut that leaves required competitions incomplete.
- No renderer-side formulas or reconstructed match/player facts.
- No compatibility migration for incompatible beta saves.
- No acceptance-band change after the corresponding output is visible.

## Phase Definition Of Done

- One season boundary and one offered-term unit exist.
- The Phase 81B recruitment/free-agent policy remains the sole AI need owner.
- Required domestic fixtures resolve through one canonical producer and career
  rollover no longer depends on fabricated or missing competition completion.
- Interactive and automatic matches are kickoff-equivalent on paired seeds.
- Tables, scorers, assists, appearances, transfers and free-agent transitions
  reconcile from canonical facts.
- The `7 x 10` and `750 x 10` profiles run alone with exactly seven workers,
  stable shards and declared budgets.
- The final HTML is derived from canonical JSON and is byte-identical on
  rebuild.
- Phase 82A receives an explicit GO/REFINE/STOP handoff; it is not started here.
