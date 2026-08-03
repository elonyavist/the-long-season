# Project Status

Handoff snapshot for whoever picks the project up next. Update it after every
step attempt, completed step, and rework decision.

**This file stays small on purpose.** It reached `5010` lines and `885 KB` on
2026-08-03 - more than a context window holds - so "read this file first" had
quietly stopped being followable. History was deleted rather than archived: it
is all in `git log docs/PROJECT_STATUS.md` and in the per-phase reports under
`docs/audits/`. Keep this file under `300` lines: when a fact stops constraining
future work, delete it.

## How To Read The Project

1. `requirements.md` for product and architecture intent.
2. `docs/PROJECT_RULES.md` for non-negotiable rules.
3. This file for current state and live constraints.
4. `docs/steps/README.md` for the iterative workflow.
5. The active phase README and the active step file. Nothing else.

## Current State

Phases 0 through 80A are complete. What they delivered is described by the code
and by the per-phase reports in `docs/audits/`, not restated here.

Phase 81 - Phase-Aware Tactical Shape And Manager Decision Engine - is active,
under `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`.

The problem it exists to fix, measured at Step 01: the engine reduced the `66`
department compositions a manager can build to `7` distinct team strengths,
equal-quality `4-4-2` and `3-1-6` produced byte-identical match results, and
every tactic profile landed inside the measurement noise floor.

Step 06 closed it. The `7` fingerprints are unchanged and intended - Step 03 put
intrinsic shape *beside* department strength so neither shape nor suitability is
charged into it twice - while all three equal-quality shape pairs now play
different matches over `2400` of them. What each manager decision is now worth
is measured below.

| Phase 81 step | Status |
|---|---|
| 01 - reproducible baseline and frozen contract | Done 2026-08-02 |
| 02 - typed tactical slot context and collapse removal | Done 2026-08-03, all gates green |
| 03 - intrinsic shape profile and diminishing returns | Done 2026-08-03, all gates green |
| 04 - relational phase matchup and route capacity | Done 2026-08-03, all gates green |
| 05 - suitability coordination without double penalty | Done 2026-08-03, all gates green |
| 06 - phase-aware control, opportunity routes, tactic semantics | In progress: blocks 1-3 done 2026-08-03, all gates green; block 4 open |
| 07-12 | Not started |

## Current Active Step

- Step:
  `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/06-phase-aware-control-opportunity-routes-and-tactic-semantics.md`
- Next action: Step 06, block 4 - a dominance gate over the tactic profiles, and
  then only the knob exposure magnitudes moved until it holds. Block 3 measured
  that three of the five knob extremes beat neutral, and nothing gates tactics
  the way `no_dominant_composition` gates shapes. Blocks 1 to 3 delivered the
  required context migration, the route model and tactic semantics, an unplanned
  shot-chain reorder, and calibration; the step document holds what each found
  against the code.

## Live Constraints

Facts that still bind future work. Everything else was deleted.

### Do Not Start

- Phases 81A, 82A, and 82B are Planned or Draft. Their numeric decisions were
  made before measurement and must be revised against Phase 81's evidence
  rather than implemented as written.
- Phase 79 Steps 14 and 15 stay Reopened/not started, unclaimed by any phase.

### Longitudinal Runs

- Phase 81 Step 12 owns this phase's checkpointed `50 x 20` with exactly seven
  workers. It observes a world with no loans and no races, so it is engine
  evidence only and may never be reused as market evidence.
- Phase 82B Step 09 owns the second checkpointed `50 x 20`, over the completed
  competitive market. Two runs are an accepted cost of the 2026-08-02 phase
  order. No cohort runs anywhere else.

### Carried `goals_per_match_avg` Monitor (A7)

Phase 80A closed with one gate red and transferred it to Phase 81 unchanged:
`36/634/80` pass/warn/fail over `750` worlds, every failure on the high side.
Threshold, denominator, and `monitor` severity class are exactly as inherited -
the owner moved, not the severity. The distribution is a starting point, never
an accepted result.

Step 06 is the first step able to move it, because it owns how many
opportunities exist and how they convert. Step 11 is the deadline and Step 12
confirms it at cohort scale. It may not be carried a third time: if Step 11
finds it still out of band, the fix is reopening Step 06.

Step 06 moved it on `pnpm cli ten-season-report`: `3.08` warn, to `2.97` pass
once a knob offset stopped inflating every match, to `2.98` after the shot chain
was reordered around the keeper, to `2.74` pass once the route reached the shot
and the chain was recalibrated onto real football - `25.6` shots a match against
`16.3`, `31.7%` of shots on target converted against `49.6%`.
`table_points_spread_avg` came with it at `42.0`, the whole anomaly score is
green, and no threshold, denominator or severity was touched.

That is the ten-season report, not the `750`-world distribution above. Nobody
re-runs that population before Step 12 - `No cohort runs anywhere else` binds -
and Step 11 evaluates the monitor on its own population, so the carried
distribution stands as recorded until Step 12 confirms it.

### Which Manager Decisions Actually Count, Measured

Against a `0.0477` win-share noise floor, on the frozen population and on the
real formation population the audit now also reports:

| Decision | Moves win share by | Verdict |
|---|---|---|
| tactic sliders | `0.154` | counts, `3x` the noise |
| formation | `0.030` | inside the noise |
| department counts | `0.029` | inside the noise unless broken |
| fielding a broken shape | `0.483` | counts enormously |

The engine punishes an absurd setup hard and does not reward a good one, and
three consequences bind future work.

**Nothing gates tactics.** Three of five knob extremes beat neutral -
`flank_overload` `0.5644`, `direct_play` `0.5325`, `high_pressing` `0.52`. A
slider that is simply better is not a decision, and `no_dominant_composition`
has no twin for tactics. Step 06 block 4 owns this.

**A route's defining phase carries `11.7%` of its own chain**, so a real `-12.8%`
flank difference between formations arrives as `-1.5%`. Recorded as a reopen
candidate on Step 04, whose frozen `TACTICAL_ROUTE_DEFINITION` it is.

**`asymmetric_incoherence_cost` cannot be evaluated here.** Its surplus is
`0.0288` and has never left the noise floor at any setting, because in a
population of ten central clones a balanced `4-4-2` *is* the optimum. Step 06
recommends splitting it and asserting the half that is a design claim -
incoherence costs at least one division tier, true today at `0.4831` against
`0.2638`. Do not widen the threshold or report `not_evaluated` as a pass; the
phase contract decides and Step 11 reports.

### Frozen Tactical Baseline (Step 01)

In `docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md`, regenerated by
`pnpm cli tactical-shape-report`. Thresholds live in code as
`TACTICAL_SHAPE_THRESHOLDS` so no later step can quietly move one.

- One division tier of squad quality is worth `0.255` win share at identical
  shape. Every structure-versus-quality claim is measured against that number.
- Structure may gain at most `0.75 x` that. No composition may stay above `0.55`
  against every opponent. Incoherence must cost at least twice what coherence
  pays.
- The dominance population is the `66` reachable department compositions, not
  the `23` named presets, which cover only `10` of them. The tactical board
  locks the goalkeeper slot only; every other slot reaches any outfield role by
  drag and no validator caps a department, so extreme shapes are manager
  choices and no gate exempts them.
- The bands are conditioned on a **single-country** population (A4). With five
  countries they must be re-derived, not carried over.
- Two invariants are `not_evaluated`, never reported as passes:
  `asymmetric_incoherence_cost` has no coherence reward to divide by, and
  `distinguishable_coherent_and_incoherent_shape` is what the phase exists to
  satisfy.

### Documentation Budget

`docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md` went from `3074` lines to under
`200` on 2026-08-03, alongside this file.

The always-active rules live in `AGENTS.md` at the repository root, which every
session loads automatically; `docs/PROJECT_RULES.md` points there and keeps only
the rules for specific kinds of work. `docs/step_prompt_to_use.md` separates
what is read once per phase from what is read per step. Do not reintroduce a
second copy of any of them, and keep that separation.

### Typed Tactical Slot Seam (Step 02)

- A lineup slot stores only `slotId`, `playerId`, `canonicalRole`, and `side`.
  Line, position family, and the role-weight key are derived through
  `canonicalRoleTacticalFacts(...)` and `roleWeightKeyForCanonicalRole(...)`.
  Do not put a derived field back on the slot.
- `fieldablePlayerIds` / `fieldablePlayerIdsFor` own squad depth (A6).
  `pnpm check:squad-depth` is the absence assertion over the lineup-composing
  files. Phase 82A widens the accessor for loans; nothing else may.
- A club the user has not selected is an ordinary caller of the same context
  builder (A1).
- `match_preparation_lineup.role_key` now stores a canonical role. A save
  written before 2026-08-03 is rejected, not migrated. The beta reset for this
  landed at Step 02, not Step 08.

### Intrinsic Tactical Shape Seam (Step 03)

- `match-tactics-calibration` is **one** versioned asset with one section per
  concern. Steps 04 and 05 add sections to it; they do not create a second
  balance asset, because one stamped version must travel with a career.
- The intrinsic profile carries **no tactic effect**. Every knob has a Step 06
  owner that reads the profile, so a tactic term added to `tactical-shape.ts`
  would be counted twice.
- `MatchTeamContext.shape` and `MatchContext.matchTacticsCalibration` are both
  required, and both team shapes must carry that calibration's exact version.
  A context assembled from two policies is refused, not silently simulated.
- `deriveTeamShapeAndStrength(...)` is the only way to produce the pair. It
  scores the lineup once; department strength and intrinsic shape are two
  readings of that one pass, so they can never describe different elevens.
- Season team input carries the squad, never a precomputed strength. Anything
  that wants a club's aggregate strength derives it from the lineup.
- Step 03 declared the four admissible mathematical constraints - non-negative
  weights, strictly decreasing and strictly positive marginal contribution,
  bounded capacities, left/right mirror symmetry - because Step 01 froze only
  the product outcome bands. They are enforced in
  `validateMatchTacticsCalibration(...)` and are subordinate to those bands.

### Relational Matchup Seam (Step 04)

- Five routes, frozen here because Step 01 froze none: `central`, `left`,
  `right`, `direct`, `transition`. `TACTICAL_ROUTE_DEFINITION` is typed code,
  not content: content owns how hard a bottleneck bites, never which capacity
  resists which route.
- `TACTICAL_SHAPE_CAPACITY_MIRROR` is the one place "your left is their right"
  is written down. Both the mirror invariant and the flank matchup read it.
- A chain blends its weakest link with its average, so one dead phase collapses
  a route without deleting it. A route reaches exactly `0` only when the whole
  chain is `0`; that is the divide-by-zero guard, not a shape outcome.
- Pressing acts in exactly one place - it contests build-up - so the routes
  that skip build-up are the ones a pressed side falls back on. Step 06 must
  not multiply pressing a second time.
- The matchup reaches nothing but the explanation trace, and only when both
  sides carry a shape and the caller supplies the calibration.

### Suitability Seam (Step 05)

- Suitability is derived once, on `LineupSlotScore`, and lives *beside* the
  score. `teamStrengthFromSlotScores(...)` ignores it: that is what makes the
  absence of a double penalty structural instead of a promise.
- `TACTICAL_SHAPE_TASK_KIND` decides where it acts. `coordination` tasks are
  players working together and suitability scales them; `presence` tasks -
  `final_third_presence` and `counter_threat` - are about being somewhere
  dangerous and are never scaled, because the destination role's ability
  weights already price the move.
- `POSITION_SUITABILITIES` is the one canonical order. Anything ranking or
  validating by suitability walks it rather than restating the order.
- Two *selection*-ranking suitability scales still exist, in
  `ai-squad-selection.ts` and `position-suitability.ts`. Step 09 owns
  collapsing them; the execution ladder is a separate concept and is not a
  third candidate.

### Superseded Evidence

- Phase 79C's per-division distribution tolerances used an owner-category value
  multiplier that no longer exists.
- Phase 79D's baseline of `302` ceiling-six players across `100` worlds is
  non-comparable: Phase 80A changed the population it measured.

### Accepted Product Decisions Still In Force

- Public player value is club-independent, with one global model and one global
  `EUR 150m` cap. A transfer, promotion, contract expiry, or free-agent
  transition alone cannot change public value.
- Squad floors use selectable depth (`owned present + incoming loans - outgoing
  loans`), which Phase 82A implements. `Club.playerIds` stays persisted
  ownership.
- Engine and domain emit structured facts only. LLM usage is authoring-time
  content work, never runtime gameplay logic.

## Update Protocol

For every step attempt:

1. Read this file.
2. Choose the active step.
3. Implement only that step.
4. Run the required checks.
5. If something is wrong, fix the current step or update the next relevant step
   document.
6. Update this file.
7. Advance only when the step Definition of Done is satisfied.

When updating this file:

1. Update `Current Active Step` and the phase progress table.
2. Mark the step Done in its own step document, with adopted solution,
   verification output, blocker or lesson, and next action. **That document is
   where the detail lives**, not this one.
3. Add to `Live Constraints` only what constrains *future* work.
4. Delete anything in `Live Constraints` that has stopped constraining
   anything.
5. Keep this file under `300` lines.

## Handoff Note Template

Use this at the end of a step, inside the step document:

```md
### YYYY-MM-DD - Step path

- Status: Done | Rework | Skipped
- Outcome:
- Adopted solution:
- Verification:
- Follow-up:
```
