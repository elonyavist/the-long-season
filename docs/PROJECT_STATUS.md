# Project Status

Handoff snapshot for whoever picks the project up next. Update it after every
step attempt, completed step, and rework decision.

**This file stays small on purpose.** It once reached `5010` lines - more than a
context window holds - so "read this file first" had quietly stopped being
followable. History lives in `git log docs/PROJECT_STATUS.md` and `docs/audits/`.
Keep it under `300` lines: when a fact stops constraining future work, delete it.
Rules live in `AGENTS.md` and `docs/PROJECT_RULES.md`, never a second time here.

## How To Read The Project

1. `requirements.md` for product and architecture intent.
2. `docs/PROJECT_RULES.md` for non-negotiable rules.
3. This file for current state and live constraints.
4. `docs/steps/README.md`, then the active phase README and step. Nothing else.

## Current State

Phases 0 through 80A are complete. What they delivered is described by the code
and by the per-phase reports in `docs/audits/`, not restated here. Phase 81 -
Phase-Aware Tactical Shape And Manager Decision Engine - is active, under
`docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`.

| Phase 81 step | Status |
|---|---|
| 01 through 08 | Done 2026-08-02 to 2026-08-04, all gates green. Step 01 reopened once for A9. Their seams are below; the rest is in their step documents |
| 09 - AI whole-XI selection | Done 2026-08-04, all gates green |
| 10 - pre-match and live tactical consequence UI | Done 2026-08-05, all gates green |
| 11, 12 | Not started |
| 11C, 11D - season recap instrument, then `5 x 20` inspection | Not started. New; they run **before** 11B, which needs their shape baseline. Design: `docs/audits/PHASE_81_SEASON_RECAP_DESIGN.md` |
| 11B - formation as a counter-move | Not started. Step 09 met its first prerequisite; Step 10 added a second - a manager still cannot see what the opponent's shape is doing to him |

## Current Active Step

- Step: `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/11-*.md`
- Next action: Step 11, the deadline for the carried `goals_per_match_avg`
  monitor (A7), then `11C`, `11D`, `11B`, `12` in that order. Nothing in the UI
  reads Step 07's `route`, `routeCounts` or `shooterCounts` yet.
- Two decisions left for the phase contract by Step 07B, still untaken: the A7
  rule names the wrong owner, and the `1.5x` ratio below is emergent, not chosen.
- Step 08 advanced both beta versions without migrating: OPFS schema `22 -> 23`,
  career envelope `13 -> 14`. **Existing careers are deleted, not upgraded.**
- **Desktop match preparation overflows horizontally at `200%` text** once the
  squad is filled - `aside.tls-preparation-squad-panel` reaches `1708px` in a
  `1441px` viewport. Pre-existing, untested, a WCAG 2.2 AA failure. Step 11.

## Live Constraints

### Do Not Start

- Phases 81A, 82A and 82B are Planned or Draft; their numeric decisions predate
  measurement and are revised against Phase 81's evidence.
- Phase 79 Steps 14 and 15 stay Reopened/not started, unclaimed by any phase.

### Longitudinal Runs

- Step 12 owns the checkpointed `50 x 20`, seven workers: engine evidence only,
  never market, and it runs after Step 11B changes the engine.
- Phase 82B Step 09 owns the second, over the completed market.
- **A10 permits exactly one `5 x 20` inspection run before Step 12** (Step 11D),
  on a hard condition: never evidence, changes no calibration, widens no band,
  cited by nothing as measurement. It exists because an aggregate cannot show
  whether strikers or centre backs scored the goals. No cohort anywhere else.

### Carried `goals_per_match_avg` Monitor (A7)

Phase 80A closed with one gate red and transferred it unchanged: `36/634/80`
pass/warn/fail over `750` worlds, every failure high. Threshold, denominator and
severity are as inherited, the distribution is never an accepted result, Step 11
is the deadline, Step 12 confirms at cohort scale, and it may not be carried a
third time: if out of band there, the rule says reopen Step 06.

`pnpm cli ten-season-report` went `3.08` warn to `2.74` pass at Step 06, then
`2.78` at Step 07B and again at Step 09 with real AI selection - all PASS,
nothing tuned. **So Step 07 owns that movement through actor edges and the rule
above names the wrong owner**; the phase contract decides. That is the ten-season
report, not the `750`-world distribution, which nobody re-runs before Step 12.

### Which Manager Decisions Actually Count, Measured

Re-measured by Step 07B at `1050` scenario pairs: `2100` matches a row, one
`0.0295` noise floor, uniform-ability clones except the last row.

| Decision | Edge over an even contest |
|---|---|
| fielding a broken shape (`0-0-10`) | `0.4852` |
| one division tier of squad quality | `0.2521` |
| tactic sliders, best setting against worst | `0.0858` |
| an adjacent squad-quality gap, two top clubs | `0.0467` |
| best structural shape gain (`3-5-2`) | `0.0312` |
| worst curated formation (`4-3-2-1`) | `0.0305` |

The full eight-row table is in Step 07B's document. The finding is the shape, not
the margin: seven of eight sit below the reference and none is meaningfully above
it. Tactics and compositions are not flat - best responses gain `+0.0327` and
`+0.0312` and collapse to `+0.0033` against their own counter, working
rock-paper-scissors. **Formation is the outlier**, downside and no upside. Step
11B owns raising it to `~0.047` as a *counter-move* reward, on the shape baseline
11D measures, and a manager still cannot see what to counter.

### Frozen Tactical Baseline (Step 01)

`docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md` is the before-state and is not
regenerated. Amending a `TACTICAL_SHAPE_THRESHOLDS` value takes a numbered amendment.

- One division tier of squad quality is worth `0.2521` win share at identical
  shape. Every structure-versus-quality claim is measured against it.
- Structure may gain at most `0.75 x` that and incoherence must cost `1 x` it.
  No composition or tactic profile may stay above `0.55` against its field.
- The dominance population is the `66` reachable department compositions, not the
  `23` named presets, which cover `10`. The board locks the goalkeeper slot only
  and no validator caps a department, so extreme shapes are manager choices.
- The bands are conditioned on a **single-country** population (A4). All pass.

### Typed Tactical Slot Seam (Step 02)

- A lineup slot stores only `slotId`, `playerId`, `canonicalRole` and `side`; line,
  position family and role-weight key derive through `canonicalRoleTacticalFacts(...)`
  and `roleWeightKeyForCanonicalRole(...)`. No derived field goes back.
- `fieldablePlayerIds` / `fieldablePlayerIdsFor` own squad depth (A6), enforced by
  `check:squad-depth` over nine lineup-composing files; only Phase 82A widens it.

### Intrinsic Tactical Shape Seam (Step 03)

- `match-tactics-calibration` is **one** versioned asset with one section per
  concern, because one stamped version must travel with a career.
- The intrinsic profile carries **no tactic effect**: every knob has a Step 06
  owner reading it, so a tactic term in `tactical-shape.ts` counts twice.
- `MatchTeamContext.shape` and `MatchContext.matchTacticsCalibration` are both
  required, and both team shapes must carry that calibration's exact version. A
  context assembled from two policies is refused, not silently simulated.
- `deriveTeamShapeAndStrength(...)` is the only way to produce the pair: one
  scoring pass, two readings, so they cannot describe different elevens.
  `validateMatchTacticsCalibration(...)` owns the admissible constraints.

### Relational Matchup Seam (Step 04)

- Five routes, frozen here because Step 01 froze none: `central`, `left`, `right`,
  `direct`, `transition`. `TACTICAL_ROUTE_DEFINITION` is typed code: content owns
  how hard a bottleneck bites, not which capacity resists what.
- `TACTICAL_SHAPE_CAPACITY_MIRROR` is the one place "your left is their right" is
  written down; the mirror invariant and the flank matchup both read it.
- **Open: the flank claim has an instrument and no population.** Step 07A found
  every curated formation inside sampling noise, because the calibration mirrors.
  This reopen needs a lopsided side; Step 10's sweep now builds them.
- A chain blends its weakest link with its average, so one dead phase collapses a
  route without deleting it. A route is `0` only when the whole chain is.
- Pressing acts in exactly one place - it contests build-up - so a pressed side
  falls back on the routes that skip it. The knob scales `pressing_cohesion`
  *before* the matchup and never after; a second term prices it twice.

### Suitability Seam (Step 05)

- Suitability is derived once, on `LineupSlotScore`, *beside* the score, and
  `teamStrengthFromSlotScores(...)` ignores it, so the absence of a double penalty
  is structural rather than a promise.
- `TACTICAL_SHAPE_TASK_KIND` decides where it acts. `coordination` tasks scale
  with it; `presence` tasks - `final_third_presence`, `counter_threat` - never
  do, because the destination role's ability weights already price the move.
  **Any synthesised eleven must therefore hold natural positions**, or every
  coordination task is suppressed and both presence tasks are not - a uniform
  bias that cost Step 10 a whole reference.
- `POSITION_SUITABILITIES` is the one canonical order; anything ranking by it walks it.

### Tactic Semantics Seam (Step 06)

- A knob's benefit and its cost are two typed mappings,
  `TACTIC_KNOB_FAVOURED_ROUTES` and `TACTIC_KNOB_EXPOSED_ROUTE`. Content owns
  magnitudes; validation refuses a knob priced at zero exposure.
- **Basis points are not effect.** A knob lifting two routes, amplified by
  `routeSelectionSharpness`, costs far more than its number suggests, and
  `deriveOpportunityRate` reads the *difference* between the two plans, so an
  under-priced cost is charged twice. Solve exposures numerically, not from JSON.
- A knob that changes where the ball goes moves **both** sides' attempt rate; one
  with no route preference moves only its own, read from the same mapping above.
- **`pressing` owns press cohesion, not shape.** Over `3294` reachable boards
  `pressing_cohesion` never falls below `0.90` of ordinary (Step 10), so the cost
  of pressing is the ball over the top, not a limp press.

### Occasion And Persistence Seam (Steps 07-08)

- `OccasionContext` is built before the resolver runs and is the only door into
  actor selection. Nothing after resolution chooses a player.
- **An actor edge is a deviation from the pool the actor was drawn from**, in the
  same attribute off the same accessor - which makes an absent `incidentProfiles`
  give `0` rather than a constant. The goalkeeper has no pool: Step 07A scales
  his *department* by the real gap, floor `0.35`.
- **Player attributes are required on every `MatchTeamContext`**, one per lineup
  player, with no fallback. Do not hand-assemble the literal: two producers each
  holding their own copy is what let career opponents play at a flat `10`.
- A match fact belongs to the club that **fielded** the player, never the one
  holding his contract (A8). An event's own side decides; a registration names the
  club only for a player with no events. Cards are not club-attributed at all.
- **Only a load can prove a save.** `route` was absent from `match_events` for a
  whole step because no test loaded a report back. Schema `23` / envelope `14`; the
  mapper validates the unions rather than casting.
- Match-event schema `8` (`ShotContext.route`, absent for a penalty); explanation-trace schema `2` (`routeCounts`, `shooterCounts`).

### AI Selection Seam (Step 09)

- **One selection scale**, `SUITABILITY_SELECTION_BONUS` at `2.4 / 1.2 / -3.5` on
  the `0-20` ability it is added to. A larger bonus decides every comparison on
  fit alone and unbinds every threshold in ability points: at the old
  `35 / 25 / 5` no adapted footballer could be a legal routine substitute.
- `assembleMatchTeamContext(...)` writes the only `MatchTeamContext` literal;
  `selectCareerAiTeam(...)` is the only door career AI selection goes through.
  The live web session builds its own kickoff context, so a second path there
  would disagree with the team the result is committed against.
- The AI policy is **one policy, not a per-club map**, and carries no formation
  (A2). A map invites answering only for the clubs the manager faces; a club lines
  up in the shape its own squad is built for.
- Filling the shape is never tradeable against quality in `assignFootballXi(...)`.
  Choosing among all `23` shapes costs `3.1x` a fixed one, not `23x`; Phase 81A's
  background fixtures own the real tick budget (A3).
- `ProgressCareerFixtureAdvanced.fieldedLineups` is the only answer to who played
  where. A reloaded reviewed result cannot recover the opponent's eleven and
  leaves it empty rather than re-selecting from a changed squad.
- **Shape on `structuralScore`, eleven on `score`.** Only ability and fit choose a
  club's system; fitness and workload choose who fills it. One score for both let
  a tired defender change a formation for a week, leaving 11B nothing to counter.
- **A lost goalkeeper is replaced by the substitute keeper**, an outfielder going
  off to make room, exactly as football does it. Promoting somebody on the pitch
  is the last resort, ranks by reflexes and handling in both paths, never by slot
  name. The reserve keeper takes the first bench place.
- **Shape-derived tactics exceed this step's `No new AI tactic control` rule**,
  added on explicit instruction. Width, directness and risk deviate from the
  *measured* catalog mean, so the `23` shapes average back to the caller's setup
  and Step 06's balance point is unmoved; `pressing` and `mentality` stay with
  their owners.

### Manager Explanation Seam (Step 10)

- **A capacity is not showable.** A weak side is low in all twelve and a strong
  one high in all twelve, so a raw reading describes the squad, not the shape just
  chosen. `deriveTacticalShapeEmphasis(...)` divides by what an ordinary curated
  eleven puts there, then by the side's own mean of those ratios: `1` is ordinary,
  squad quality gone. `deriveOrdinaryTacticalShapeReference(...)` reads that
  eleven from the live calibration; frozen numbers would answer for a retuned asset.
- Frozen presentation policy, in `@game/ui` because that is where the step
  contract puts thresholds: `0.75` / `1.25` bands, `1.25` flank ratio, `0.6` knob,
  `3` shown. Measured on the `23` curated shapes at abilities `4-18` (`[0.591,
  1.244]`) and on the `9` **selectable** ones with three generated squads
  (`[0.771, 1.133]`); only `3-3-3-1`'s flanks cross. Those `9` are the whole
  displayed population - the other `14` reach AI clubs only, whose readings nobody
  sees. One country, one calibration version: a retune re-derives them, and the
  sweeps in `match-preparation-adapter.test.ts` catch it.
- **Reachability is a property of a rule, not of a capacity** (`AGENTS.md`).
  `loose_press` passed every gate this step wrote and could never have fired; a
  guard against an empty flank silenced the overload rule at the most one-sided
  eleven reachable. A per-rule sweep over every reachable board is now a gate.
- **A knob is reported through the route it concedes, never restated.**
  `press_without_cover` names `pressing` and reads `TACTIC_KNOB_EXPOSED_ROUTE` and
  `TACTICAL_ROUTE_DEFINITION` for the rest, so Steps 06 and 04 keep sole ownership
  of what a tactic costs. The other three concede routes the shape side covers.
- **The engine is the live authority, the board is the pre-match one**, chosen
  explicitly in `use-career-screen-presentations.ts` with no fallback. A rejected
  command leaves the observations put: it never reached
  `applyConfirmedProgressiveTeamChanges`. It reads the manager's own shape only -
  Step 11B owes the half-time opponent read.
- **One of the three slots is held for what the shape bought.** Costs rank first,
  so a broken shape filled every slot with them and the tool could only say why an
  idea would fail, never why it might work. Anything later that ranks
  manager-facing findings owes the same reservation.
- Observation label keys are template literal types, so a consequence added
  without its five translations fails the build rather than throwing the first
  time a manager builds that shape. **The other `presentationMessageKey` families
  still need that**: an incomplete one crashes at runtime and
  `check:localized-text` misses it. Unowned.

### Accepted Product Decisions Still In Force

- **Superseded, do not reuse:** Phase 79C's distribution tolerances (an
  owner-category multiplier that no longer exists) and Phase 79D's `302`
  ceiling-six players across `100` worlds (Phase 80A changed its population).

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
2. Mark the step Done in its own step document, closing with a dated handoff
   note: status, outcome, adopted solution, verification, follow-up. **That
   document is where the detail lives**, not this one.
3. Add to `Live Constraints` only what constrains *future* work, and delete
   anything there that has stopped constraining anything.
4. Keep this file under `300` lines.
