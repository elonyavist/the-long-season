# Phase 81 - Phase-Aware Tactical Shape And Manager Decision Engine

## Status

Planned under an accepted product/architecture contract. Do not start until
Phase 80A, Phase 80B, and Phase 80C are complete. Phase 80C closes on bounded
race evidence and hands the deferred longitudinal cohort here.

## Goal

Make the manager's pre-match and in-game football decisions causally meaningful
without cloning Football Manager: preserve the deterministic aggregate
per-minute engine, add typed intrinsic tactical shape plus relational matchup,
make opportunities phase-aware, and use the same truth for live play, AI,
explanation, diagnostics, and persistence.

The governing contract is:

- `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`

## Entry Gate

- Phases 80A, 80B, and 80C are Done.
- Phase 80C race state, player choice, free-agent race, UI, persistence, and
  bounded non-vacuous diagnostics are green.
- Phase 80C ran no longitudinal cohort.
- The current match engine still reproduces the Step 01 baseline, including
  equal-quality `4-4-2` and `3-1-6` equivalence.
- Phase 79 Step 14 remains Reopened, paused, unrun, and unclaimed.

## Locked Decisions

- Keep one deterministic, aggregate, per-minute match engine.
- `TeamStrength` remains player quality; it is not tactical shape.
- One intrinsic Module derives phase/channel capacities for a single side.
- One relational Module compares the side's own phase chain and the opponent's
  complementary capacities.
- Shape emits no universal formation score and no named extreme-formation
  penalty.
- `FormationLine`, `FormationPositionFamily`, `FormationSide`,
  `CanonicalPlayerRole`, and suitability cross the seam as domain unions, not
  strings.
- Suitability modifies coordinated execution only; role weights already own
  the destination-role attribute effect.
- Current directness, pressing, width, risk, and mentality gain explicit
  bounded football semantics. No new tactic control is added.
- Opportunities gain a structured aggregate route; there is no complete pass
  chain.
- Chance actors are selected before outcome and contribute causally without
  becoming autonomous agents.
- Pre-match, live, AI, and batch paths rebuild through the same team-context
  seam.
- Shape/matchup are derived simulation facts, not a second career ledger.
- One beta reset removes incompatible active-match/event state; no migration
  or compatibility branch remains.
- UI shows qualitative structured consequences, not formulas or an optimal
  answer.
- Phase 81 Step 12 alone owns the final checkpointed `50 x 20` with exactly
  seven workers.

## Ordered Steps

1. `01-reproducible-extreme-shape-baseline-and-frozen-contract.md`
2. `02-typed-tactical-slot-context-and-collapse-removal.md`
3. `03-intrinsic-tactical-shape-profile-and-diminishing-returns.md`
4. `04-relational-phase-matchup-and-route-capacity.md`
5. `05-position-suitability-coordination-without-double-penalty.md`
6. `06-phase-aware-control-opportunity-routes-and-tactic-semantics.md`
7. `07-route-quality-causal-actors-and-explanation-facts.md`
8. `08-live-session-persistence-event-schema-and-beta-reset.md`
9. `09-ai-whole-xi-selection-and-shared-tactical-decisions.md`
10. `10-pre-match-and-live-tactical-consequence-ui.md`
11. `11-non-vacuous-tactical-diagnostics-and-integrated-gates.md`
12. `12-checkpointed-50x20-phase-report-and-phase-79-handoff.md`

## Validation Ladder

- Step 01 freezes exact current behaviour, denominators, thresholds, ownership,
  and absence assertions without gameplay changes.
- Step 02 carries typed football facts into the match and removes the web
  four-way collapse.
- Step 03 derives intrinsic shape with diminishing returns. It is a headless
  structural milestone and makes no gameplay-fix claim.
- Step 04 derives relational phase/channel matchups without final result logic.
  It is also headless and leaves match results unchanged.
- Step 05 adds suitability only to coordination contributions and is the last
  headless milestone before production behaviour changes.
- Step 06 replaces scalar/texture-only opportunity generation with structured
  phase-aware routes, completes current tactic semantics, and is the first
  end-to-end gameplay gate for the frozen quality-versus-structure hierarchy.
- Step 07 makes route quality and actors causal while retaining an aggregate
  resolver.
- Step 08 gives live changes the same path, persists final facts once, and
  resets incompatible beta saves.
- Step 09 migrates AI selection and decisions onto the same evaluator and
  immediately re-proves the frozen quality-versus-structure matrix with the
  canonical AI-selected XIs.
- Step 10 presents small qualitative consequences through `@game/ui` and web.
- Step 11 runs bounded positive-denominator diagnostics, browser QA, absence
  checks, and the integrated repository gate.
- Step 12 alone runs/replays the checkpointed `50 x 20`, writes the phase
  report, and hands control back to Phase 79.

## Mandatory Per-Step Loop

For every step:

- reread `docs/PROJECT_STATUS.md`, this README, the active step in full, and
  `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`;
- modify only Expected Files plus `docs/PROJECT_STATUS.md` and a permitted
  next-step lesson;
- if a necessary local refactor file is discovered, add it to the active
  step's Expected Files and explain the ownership before modifying it;
- remove obsolete code and fixtures made redundant by the step;
- add useful JSDoc/TSDoc to new or materially modified exported functions and
  types;
- run focused checks, fix failures, update the step/status/roadmap, and only
  then advance;
- keep all later steps Not started.

## Phase-Level Checks

```bash
nvm use 24
pnpm check
pnpm --filter @game/web run build
pnpm web:visual:qa
pnpm depcruise
git diff --check
graphify update .
```

The longitudinal command runs only in Step 12.

## Clean-Code Gate

- No dead code, obsolete helper, duplicated formula, open-string tactical
  mapping, compatibility fallback, or redundant fixture remains undocumented.
- No generic utility Module is introduced where a football concept owns the
  behaviour.
- Engine, AI, diagnostics, UI, and web do not duplicate shape/matchup rules.
- The Interface stays smaller than its Implementation and is the test surface.
- Refactors remain local to the active owner; unrelated cleanup is documented
  and scheduled rather than mixed silently into a step.

## What NOT To Implement

- No autonomous-player, real-time physics, or continuous-coordinate engine.
- No named formation penalties or whitelists.
- No new tactic settings, training/familiarity system, weather, staff, morale,
  or team talks.
- No React-owned gameplay calculation.
- No full pass-chain or generic duel framework.
- No generic strategy/plugin registry or event bus.
- No beta compatibility.
- No cohort before Step 12.
- No Phase 79 Step 14/15 implementation.

## Definition Of Done

- Manager formation, lineup, role, suitability, and tactic choices have
  deterministic, football-readable effects before and during the match.
- Equal-quality `3-1-6` and `4-4-2` are structurally and statistically
  distinguishable without named penalties.
- Severe incoherence may overturn only a modest quality advantage; a generated
  First Division title contender remains the aggregate favourite over a
  generated Third Division mid-table side under the frozen extreme-shape
  handicap, while individual upsets remain possible.
- Intrinsic shape and relational matchup have separate deep Modules.
- Typed domain facts cross all seams exhaustively.
- Opportunity routes, quality, actors, events, and explanations remain
  coherent.
- AI and manager use the same tactical truth.
- Live changes affect minute `N + 1` only and survive reload without reroll.
- Bounded diagnostics cannot pass on zero observations.
- Clean-code, repository, browser, persistence, determinism, dependency, diff,
  and Graphify gates pass.
- The final `50 x 20` completes and replays with 50 stable shards and exactly
  seven workers.
- Phase 79 Step 14 receives a truthful handoff and remains separately unrun and
  unclaimed.
