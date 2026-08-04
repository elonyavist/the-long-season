# Project Status

Handoff snapshot for whoever picks the project up next. Update it after every
step attempt, completed step, and rework decision.

**This file stays small on purpose.** It reached `5010` lines on 2026-08-03,
more than a context window holds, so "read this file first" had quietly stopped
being followable. History lives in `git log docs/PROJECT_STATUS.md` and in
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
department compositions to `7` distinct team strengths and equal-quality shapes
produced byte-identical matches. Step 06 closed it - the `7` fingerprints are
unchanged and intended, since Step 03 put intrinsic shape *beside* department
strength, while all three equal-quality shape pairs now play different matches
over `2400` of them. What each manager decision is worth is measured below.

| Phase 81 step | Status |
|---|---|
| 01 - reproducible baseline and frozen contract | Done 2026-08-02, reopened and re-closed 2026-08-03 for A9 |
| 02 - typed tactical slot context and collapse removal | Done 2026-08-03, all gates green |
| 03 - intrinsic shape profile and diminishing returns | Done 2026-08-03, all gates green |
| 04 - relational phase matchup and route capacity | Done 2026-08-03, all gates green |
| 05 - suitability coordination without double penalty | Done 2026-08-03, all gates green |
| 06 - phase-aware control, opportunity routes, tactic semantics | Done 2026-08-03, all gates green |
| 07 - route quality, causal actors and explanation facts | Done 2026-08-04, all gates green |
| 07A - complete match inputs and flank-aware evidence | Done 2026-08-04, all gates green |
| 07B - resolvable evidence and declared populations | Done 2026-08-04, all gates green |
| 08-12 | Not started |
| 11B - formation as a counter-move | Not started, blocked on Step 09 |

## Current Active Step

- Step:
  `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/08-*.md`
- Next action: start Step 08. Step 07B left two decisions for the phase contract
  and took neither: the A7 rule names the wrong owner, and the `1.5x` ratio below
  between setup and squad quality is emergent rather than chosen.
- No invariant in this phase is `not_evaluated` any more. The last one was
  closed by amendment A9 on 2026-08-03; Step 01 was reopened to carry it.

## Live Constraints

Facts that still bind future work. Everything else was deleted.

### Do Not Start

- Phases 81A, 82A and 82B are Planned or Draft; their numeric decisions predate
  measurement and are revised against Phase 81's evidence.
- Phase 79 Steps 14 and 15 stay Reopened/not started, unclaimed by any phase.

### Longitudinal Runs

- Step 12 owns the checkpointed `50 x 20`, seven workers: engine evidence only,
  never market, and it runs after Step 11B changes the engine.
- Phase 82B Step 09 owns the second, over the completed market. No cohort runs
  anywhere else.

### Carried `goals_per_match_avg` Monitor (A7)

Phase 80A closed with one gate red and transferred it unchanged: `36/634/80`
pass/warn/fail over `750` worlds, every failure high. Threshold, denominator and
severity are as inherited, and the distribution is never an accepted result.
Step 11 is the deadline, Step 12 confirms at cohort scale, and the rule was that
it may not be carried a third time: if out of band there, reopen Step 06.

Step 06 took it from `3.08` warn to `2.74` pass on `pnpm cli ten-season-report`.
Step 07B then measured the same command at three commits: `a62ced4` `2.74`/`42.0`
(reproducing Step 06 exactly), `c1f3bda` `2.78`/`40.1`, `465013c` `2.78`/`40.1`.
All PASS, nothing tuned.

**So Step 07 owns the whole movement and Step 07A owns none of it, and the rule
above therefore names the wrong owner.** The step that last moved the goal rate
is Step 07, through actor edges. Reopening Step 06 for that would reopen the
wrong thing. The phase contract decides; 07B changed no rule.

That is the ten-season report, not the `750`-world distribution above. Nobody
re-runs that population before Step 12 - `No cohort runs anywhere else` binds.

### Which Manager Decisions Actually Count, Measured

Re-measured by Step 07B at `1050` scenario pairs: `2100` matches a row, one
`0.0295` noise floor, uniform-ability clones except the last row.

| Decision | Edge over an even contest |
|---|---|
| fielding a broken shape (`0-0-10`) | `0.4852` |
| one division tier of squad quality | `0.2521` |
| a modest squad-quality gap | `0.1886` |
| tactic sliders, best setting against worst | `0.0858` |
| an adjacent squad-quality gap, two top clubs | `0.0467` |
| best structural shape gain (`3-5-2`) | `0.0312` |
| worst curated formation (`4-3-2-1`) | `0.0305` |
| a standout attacker at equal squad quality | `0.0098`, unresolved |

Formation is resolved, and the finding is its shape rather than its margin: seven
of eight sit below the reference and none is meaningfully above it.

Tactics and compositions are not flat: their best response gains `+0.0327` and
`+0.0312`, above the floor, collapsing to `+0.0033` against its own counter -
working rock-paper-scissors. **Formation is the outlier**, with a downside and no
upside, and Step 11B owns raising it to `~0.047` as a *counter-move* reward.
11B is **blocked on Step 09**: every AI club in the game fields a hardcoded
`4-4-2`, so a counter reward built now would reward one fixed answer.

**Open - the flank claim has an instrument and no population.** Step 07A split
`left` from `right` and found every curated formation inside sampling noise: the
calibration enforces mirror symmetry and each fields the same shape on both
flanks, so there is no flank difference here to attenuate. Step 04's reopen needs
a deliberately lopsided side first; its document has the table.

**Answered - tactics are gated and have a best response.** `no_dominant_tactic`
reads the *mean* against the other five profiles where the shape gate reads the
worst matchup: six legal settings are a peer population, `66` compositions are
not. The gate is one-sided by design - an extreme may cost a manager, never pay
one - so `low_block` is reported and not bounded.

**Answered - the asymmetry is two bounds, not a ratio (A9).**
`asymmetric_incoherence_cost` divided by a surplus that never left the noise
floor. `incoherence_costs_a_division_tier` at `1 x` the tier edge replaces it,
PASS at `1.9246`, against `bounded_structural_swing` at `0.75 x`.

### Frozen Tactical Baseline (Step 01)

`docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md` is the before-state and is not
regenerated; `pnpm cli tactical-shape-report` writes a fresh one elsewhere.
Amending a `TACTICAL_SHAPE_THRESHOLDS` value takes a numbered amendment.

- One division tier of squad quality is worth `0.2521` win share at identical
  shape. Every structure-versus-quality claim is measured against it.
- Structure may gain at most `0.75 x` that and incoherence must cost `1 x` it.
  No composition or tactic profile may stay above `0.55` against its field.
- The dominance population is the `66` reachable department compositions, not
  the `23` named presets, which cover only `10` of them. The board locks the
  goalkeeper slot only and no validator caps a department, so extreme shapes are
  manager choices and no gate exempts them.
- The bands are conditioned on a **single-country** population (A4).
- Every invariant passes. An invariant that *cannot* be evaluated is amended by
  the phase contract, never relaxed by the step that trips over it (A9).

### Documentation Budget

Always-active rules live in `AGENTS.md`; `docs/PROJECT_RULES.md` keeps only the
per-kind-of-work rules and `docs/step_prompt_to_use.md` splits per-phase reading
from per-step. Never a second copy of any of them.

### Typed Tactical Slot Seam (Step 02)

- A lineup slot stores only `slotId`, `playerId`, `canonicalRole`, and `side`.
  Line, position family, and the role-weight key are derived through
  `canonicalRoleTacticalFacts(...)` and `roleWeightKeyForCanonicalRole(...)`.
  Do not put a derived field back on the slot.
- `fieldablePlayerIds` / `fieldablePlayerIdsFor` own squad depth (A6); only
  Phase 82A widens the accessor.
- A club the user has not selected is an ordinary caller of the same context
  builder (A1).
- `match_preparation_lineup.role_key` stores a canonical role; a save written
  before 2026-08-03 is rejected, not migrated. Its beta reset landed at Step 02.

### Intrinsic Tactical Shape Seam (Step 03)

- `match-tactics-calibration` is **one** versioned asset with one section per
  concern, because one stamped version must travel with a career.
- The intrinsic profile carries **no tactic effect**: every knob has a Step 06
  owner reading it, so a tactic term in `tactical-shape.ts` counts twice.
- `MatchTeamContext.shape` and `MatchContext.matchTacticsCalibration` are both
  required, and both team shapes must carry that calibration's exact version.
  A context assembled from two policies is refused, not silently simulated.
- `deriveTeamShapeAndStrength(...)` is the only way to produce the pair. One
  scoring pass, two readings, so they cannot describe different elevens.
- Season team input carries the squad, never a precomputed strength.
- The four admissible mathematical constraints - non-negative weights, strictly
  decreasing and strictly positive marginal contribution, bounded capacities,
  left/right mirror symmetry - are enforced in
  `validateMatchTacticsCalibration(...)` and are subordinate to Step 01's bands.

### Relational Matchup Seam (Step 04)

- Five routes, frozen here because Step 01 froze none: `central`, `left`,
  `right`, `direct`, `transition`. `TACTICAL_ROUTE_DEFINITION` is typed code:
  content owns how hard a bottleneck bites, never which capacity resists what.
- `TACTICAL_SHAPE_CAPACITY_MIRROR` is the one place "your left is their right" is
  written down; the mirror invariant and the flank matchup both read it.
- A chain blends its weakest link with its average, so one dead phase collapses
  a route without deleting it. A route is `0` only when the whole chain is.
- Pressing acts in exactly one place - it contests build-up - so a pressed side
  falls back on the routes that skip it. The knob scales `pressing_cohesion`
  *before* the matchup and never again after it; a second term prices it twice.

### Suitability Seam (Step 05)

- Suitability is derived once, on `LineupSlotScore`, *beside* the score, and
  `teamStrengthFromSlotScores(...)` ignores it. That is what makes the absence of
  a double penalty structural instead of a promise.
- `TACTICAL_SHAPE_TASK_KIND` decides where it acts. `coordination` tasks scale
  with it; `presence` tasks - `final_third_presence`, `counter_threat` - never
  do, because the destination role's ability weights already price the move.
- `POSITION_SUITABILITIES` is the one canonical order; anything ranking or
  validating by suitability walks it.
- Two *selection*-ranking suitability scales still exist, in
  `ai-squad-selection.ts` and `position-suitability.ts`. Step 09 collapses them;
  the execution ladder is separate and is not a third candidate.

### Tactic Semantics Seam (Step 06)

- A knob's benefit and its cost are two typed mappings,
  `TACTIC_KNOB_FAVOURED_ROUTES` and `TACTIC_KNOB_EXPOSED_ROUTE`; content owns
  only magnitudes and validation refuses a knob priced at zero exposure.
- **Basis points are not effect.** A knob lifting two routes, amplified again by
  `routeSelectionSharpness`, costs far more than its number suggests, and
  `deriveOpportunityRate` reads the *difference* between the two plans, so an
  under-priced cost is charged twice. Solve exposures numerically, not from JSON.
- A knob that changes where the ball goes moves **both** sides' attempt rate; a
  knob with no route preference moves only its own. The split is read from
  `TACTIC_KNOB_FAVOURED_ROUTES`, never declared twice.

### Occasion Seam (Step 07)

- `OccasionContext` is built before the resolver runs and is the only door into
  actor selection. Nothing after resolution may choose a player.
- **An actor edge is a deviation from the pool the actor was drawn from**, in the
  same attribute off the same accessor. That is what makes an absent
  `incidentProfiles` give exactly `0` rather than a constant, and what stops the
  term having a population mean. A department score is a different scale.
- The goalkeeper still has no actor edge - a pool of one, and the only anchor is
  on another scale. Step 07A instead scales the goalkeeper *department* by the
  real gap when an emergency keeper is promoted, floored at `0.35`.
- **Player attributes are required on every `MatchTeamContext`, one per lineup
  player, and `incidentProfileFor` has no fallback.** Six producers supply them
  through `matchPlayerIncidentProfilesForLineup`. Do not add a seventh that
  omits them; the field being optional is what let career opponents play with a
  flat `10` at everything while the manager's own eleven did not.
- An incomplete `presentationMessageKey` family crashes at runtime rather than
  failing to build, and `check:localized-text` does not cover it. Two members of
  total domain unions were missing in five languages. Unowned.
- Match-event schema `8` (`ShotContext.route`, absent for a penalty);
  explanation-trace schema `2` (`routeCounts`, `shooterCounts`).

### Superseded Evidence

Phase 79C's per-division distribution tolerances used an owner-category value
multiplier that no longer exists. Phase 79D's baseline of `302` ceiling-six
players across `100` worlds is non-comparable: Phase 80A changed its population.

### Accepted Product Decisions Still In Force

- Public player value is club-independent: one global model, one `EUR 150m` cap,
  and no transfer or contract event alone changes it.
- Squad floors use selectable depth (`owned present + incoming loans - outgoing
  loans`), which Phase 82A implements. `Club.playerIds` stays ownership.
- Engine and domain emit structured facts only. LLM usage is authoring-time
  content work, never runtime gameplay logic.

## Update Protocol

For every step attempt: read this file, choose the active step, implement only
that step, run the required checks, and if something is wrong fix the current
step or update the next relevant step document. Advance only when the step
Definition of Done is satisfied.

When updating this file:

1. Update `Current Active Step` and the phase progress table.
2. Mark the step Done in its own step document, with adopted solution,
   verification output, blocker or lesson, and next action. **That document is
   where the detail lives**, not this one.
3. Add to `Live Constraints` only what constrains *future* work, and delete
   anything there that has stopped constraining anything.
4. Keep this file under `300` lines.

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
