# Project Status

Handoff snapshot for whoever picks the project up next. Update it after every
step attempt, completed step, and rework decision.

**This file stays small on purpose.** It once reached `5010` lines - more than a
context window holds - so "read this file first" had quietly stopped being
followable. History lives in `git log docs/PROJECT_STATUS.md` and `docs/audits/`.
Keep it under `300` lines: when a fact stops constraining future work, delete it.
Always-active rules live in `AGENTS.md`, per-kind-of-work rules in
`docs/PROJECT_RULES.md`, and `docs/step_prompt_to_use.md` splits per-phase reading
from per-step. Never a second copy of any of them.

## How To Read The Project

1. `requirements.md` for product and architecture intent.
2. `docs/PROJECT_RULES.md` for non-negotiable rules.
3. This file for current state and live constraints.
4. `docs/steps/README.md`, then the active phase README and step. Nothing else.

## Current State

Phases 0 through 80A are complete. What they delivered is described by the code
and by the per-phase reports in `docs/audits/`, not restated here.

Phase 81 - Phase-Aware Tactical Shape And Manager Decision Engine - is active,
under `docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`.

The problem it exists to fix, measured at Step 01: the engine reduced the `66`
department compositions to `7` distinct team strengths and equal-quality shapes
produced byte-identical matches. Step 06 closed it - the `7` fingerprints stand
because Step 03 put intrinsic shape *beside* department strength, and all three
equal-quality pairs now play different matches over `2400` of them.

| Phase 81 step | Status |
|---|---|
| 01 through 08 | Done 2026-08-02 to 2026-08-04, all gates green. Step 01 was reopened once for A9. The seams they left are below; the rest is in their step documents |
| 09 - AI whole-XI selection and shared tactical decisions | Done 2026-08-04, all gates green |
| 10-12 | Not started |
| 11B - formation as a counter-move | Not started, unblocked by Step 09 |

## Current Active Step

- Step:
  `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/10-*.md`
- Next action: start Step 10. Nothing in the UI reads Step 07's `route`,
  `routeCounts` or `shooterCounts` yet; Step 10 owns rendering them.
- Two decisions left for the phase contract by Step 07B and still untaken: the
  A7 rule names the wrong owner, and the `1.5x` ratio below between setup and
  squad quality is emergent rather than chosen.
- Step 08 advanced both beta versions without migrating: OPFS schema `22 -> 23`,
  career envelope `13 -> 14`. **Existing careers are deleted, not upgraded.**

## Live Constraints

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

Step 06 took `pnpm cli ten-season-report` from `3.08` warn to `2.74` pass; Step
07B measured `2.78` at two later commits and Step 09 re-measured `2.78` with real
AI selection and shape-derived AI tactics - all PASS, nothing tuned. **So Step 07
owns that movement through actor edges and the rule above names the wrong
owner** - reopening Step 06 would reopen the wrong thing. The phase contract
decides. That is the ten-season report, not the `750`-world distribution above,
which nobody re-runs before Step 12.

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
of eight sit below the reference and none is meaningfully above it. Tactics and
compositions are not flat - best responses gain `+0.0327` and `+0.0312` and
collapse to `+0.0033` against their own counter, working rock-paper-scissors.
**Formation is the outlier**, with a downside and no upside; Step 11B owns
raising it to `~0.047` as a *counter-move* reward, and Step 09 unblocked that by
ending the hardcoded `4-4-2` every AI club used to field.

**Open - the flank claim has an instrument and no population.** Step 07A split
`left` from `right` and found every curated formation inside sampling noise: the
calibration enforces mirror symmetry and each fields the same shape on both flanks.
Step 04's reopen needs a deliberately lopsided side first; its document has the table.

**Answered.** `no_dominant_tactic` reads the *mean* of six peer settings where the
shape gate reads the worst of `66`; the gate is one-sided by design, so
`low_block` is reported and not bounded. An invariant that cannot be evaluated is
amended by the phase contract, never relaxed by the step that trips over it (A9).

### Frozen Tactical Baseline (Step 01)

`docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md` is the before-state and is not
regenerated; `pnpm cli tactical-shape-report` writes a fresh one elsewhere.
Amending a `TACTICAL_SHAPE_THRESHOLDS` value takes a numbered amendment.

- One division tier of squad quality is worth `0.2521` win share at identical
  shape. Every structure-versus-quality claim is measured against it.
- Structure may gain at most `0.75 x` that and incoherence must cost `1 x` it.
  No composition or tactic profile may stay above `0.55` against its field.
- The dominance population is the `66` reachable department compositions, not the
  `23` named presets, which cover only `10`. The board locks the goalkeeper slot
  only and no validator caps a department, so extreme shapes are manager choices.
- The bands are conditioned on a **single-country** population (A4). All pass.

### Typed Tactical Slot Seam (Step 02)

- A lineup slot stores only `slotId`, `playerId`, `canonicalRole` and `side`; line,
  position family and the role-weight key are derived through
  `canonicalRoleTacticalFacts(...)` and `roleWeightKeyForCanonicalRole(...)`. Do not
  put a derived field back on the slot, or on `match_preparation_lineup.role_key`.
- `fieldablePlayerIds` / `fieldablePlayerIdsFor` own squad depth (A6), enforced by
  `check:squad-depth` over nine lineup-composing files; only Phase 82A widens it.

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
  decreasing positive marginal contribution, bounded capacities, mirror symmetry -
  live in `validateMatchTacticsCalibration(...)`, subordinate to Step 01's bands.

### Relational Matchup Seam (Step 04)

- Five routes, frozen here because Step 01 froze none: `central`, `left`, `right`,
  `direct`, `transition`. `TACTICAL_ROUTE_DEFINITION` is typed code: content owns
  how hard a bottleneck bites, never which capacity resists what.
- `TACTICAL_SHAPE_CAPACITY_MIRROR` is the one place "your left is their right" is
  written down; the mirror invariant and the flank matchup both read it.
- A chain blends its weakest link with its average, so one dead phase collapses
  a route without deleting it. A route is `0` only when the whole chain is.
- Pressing acts in exactly one place - it contests build-up - so a pressed side
  falls back on the routes that skip it. The knob scales `pressing_cohesion`
  *before* the matchup and never after; a second term prices it twice.

### Suitability Seam (Step 05)

- Suitability is derived once, on `LineupSlotScore`, *beside* the score, and
  `teamStrengthFromSlotScores(...)` ignores it. That makes the absence of a
  double penalty structural instead of a promise.
- `TACTICAL_SHAPE_TASK_KIND` decides where it acts. `coordination` tasks scale
  with it; `presence` tasks - `final_third_presence`, `counter_threat` - never
  do, because the destination role's ability weights already price the move.
- `POSITION_SUITABILITIES` is the one canonical order; anything ranking by
  suitability walks it.

### Tactic Semantics Seam (Step 06)

- A knob's benefit and its cost are two typed mappings,
  `TACTIC_KNOB_FAVOURED_ROUTES` and `TACTIC_KNOB_EXPOSED_ROUTE`; content owns only
  magnitudes and validation refuses a knob priced at zero exposure.
- **Basis points are not effect.** A knob lifting two routes, amplified by
  `routeSelectionSharpness`, costs far more than its number suggests, and
  `deriveOpportunityRate` reads the *difference* between the two plans, so an
  under-priced cost is charged twice. Solve exposures numerically, not from JSON.
- A knob that changes where the ball goes moves **both** sides' attempt rate; one
  with no route preference moves only its own, read from the same mapping above
  and never declared twice.

### Occasion And Persistence Seam (Steps 07-08)

- `OccasionContext` is built before the resolver runs and is the only door into
  actor selection. Nothing after resolution may choose a player.
- **An actor edge is a deviation from the pool the actor was drawn from**, in the
  same attribute off the same accessor. That is what makes an absent
  `incidentProfiles` give exactly `0` rather than a constant, and what stops the
  term having a population mean. The goalkeeper has no pool - Step 07A scales his
  *department* by the real gap when an emergency keeper is promoted, floor `0.35`.
- **Player attributes are required on every `MatchTeamContext`**, one per lineup
  player, with no fallback. Do not hand-assemble the literal: two producers each
  holding their own copy is what let career opponents play at a flat `10` while
  the manager's own did not.
- A match fact belongs to the club that **fielded** the player, never the one
  holding his contract (A8). An event's own side decides; a registration names
  the club only for a player with no events. A card is not club-attributed at
  all - suspensions key on `(player, competition)` and travel with him.
- **Only a load can prove a save.** `route` was absent from `match_events` for a
  whole step because no test loaded a report back. Schema `23` / envelope `14`,
  no migration; the mapper validates the tactical unions rather than casting.
- An incomplete `presentationMessageKey` family crashes at runtime rather than failing to build, and `check:localized-text` does not cover it. Unowned.
- Match-event schema `8` (`ShotContext.route`, absent for a penalty); explanation-trace schema `2` (`routeCounts`, `shooterCounts`).

### AI Selection Seam (Step 09)

- **One selection scale**, `SUITABILITY_SELECTION_BONUS` at `2.4 / 1.2 / -3.5` on
  the `0-20` ability it is added to. A larger bonus decides every comparison on fit
  alone and unbinds every threshold written in ability points: at the old
  `35 / 25 / 5` no adapted footballer could be a legal routine substitute. Not the
  Step 05 execution ladder, which answers a different question.
- `assembleMatchTeamContext(...)` writes the only `MatchTeamContext` literal;
  `selectCareerAiTeam(...)` is the only door career AI selection goes through. The
  live web session builds its own kickoff context, so a second path there would
  disagree with the team the result is committed against.
- The AI policy is **one policy, not a per-club map**, and carries no formation
  (A2). A map invites answering only for the clubs the manager faces; a club lines
  up in the catalog shape its own squad is built for.
- Filling the shape is never tradeable against quality in `assignFootballXi(...)`;
  greedy slot order cost `5.9` points on the measured counterexample. Choosing
  among all `23` shapes costs `3.1x` a fixed one, not `23x`; Phase 81A's
  background fixtures own the real tick budget (A3).
- `ProgressCareerFixtureAdvanced.fieldedLineups` is the only answer to who played
  where. A reloaded reviewed result cannot recover the opponent's eleven and leaves
  it empty rather than re-selecting from an already-changed squad.
- **Shape on `structuralScore`, eleven on `score`.** Only ability and fit choose a
  club's system; fitness and workload choose who fills it. One score for both let
  a tired defender change a formation for a week, leaving Step 11B nothing stable
  to counter.
- **A lost goalkeeper is replaced by the substitute keeper**, an outfielder going
  off to make room, exactly as football does it. Promoting somebody already on
  the pitch is the last resort - no reserve keeper, or no substitutions left -
  and it ranks by reflexes and handling in both the live and batch paths, never
  by slot name. The reserve keeper holds the first bench place ahead of every
  better footballer, because no other substitute answers this question.
- **Shape-derived tactics exceed this step's `No new AI tactic control` rule**,
  added on explicit instruction. Width, directness and risk are deviations from
  the *measured* catalog mean, so the `23` shapes average back to the caller's
  setup and Step 06's balance point is unmoved; `pressing` and `mentality` stay
  with their owners. `simulate-season` never modulates - it holds shape and tactic
  still to measure one of them.

### Superseded Evidence

Phase 79C's distribution tolerances used an owner-category value multiplier that no
longer exists, and Phase 79D's `302` ceiling-six players across `100` worlds is
non-comparable: Phase 80A changed its population. Do not reuse either.

### Accepted Product Decisions Still In Force

- Public player value is club-independent: one global model, one `EUR 150m` cap,
  and no transfer or contract event alone changes it.
- Squad floors use selectable depth (`owned present + incoming loans - outgoing
  loans`), which Phase 82A implements. `Club.playerIds` stays ownership.
- Engine and domain emit structured facts only. LLM usage is authoring-time
  content work, never runtime gameplay logic.

## Update Protocol

For every step attempt: read this file, choose the active step, implement only that
step, run the required checks, and if something is wrong fix the current step or
update the next relevant step document. Advance only when the step Definition of
Done is satisfied.

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
