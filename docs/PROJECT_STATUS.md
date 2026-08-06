# Project Status

Handoff snapshot for whoever picks the project up next.

**This file stays small on purpose.** It once reached `5010` lines - more than a
context window holds - so "read this file first" had quietly stopped being
followable. History lives in `git log docs/PROJECT_STATUS.md` and `docs/audits/`;
rules live in `AGENTS.md` and `docs/PROJECT_RULES.md`, never a second time here.

## How To Read The Project

In order: `requirements.md` for product and architecture intent,
`docs/PROJECT_RULES.md` for non-negotiable rules, this file for current state and
live constraints, then `docs/steps/README.md`, the active phase README and the
active step. Nothing else.

## Current State

Phases 0 through 80A are complete; what they delivered is in the code and the
per-phase reports in `docs/audits/`. Phase 81 - Phase-Aware Tactical Shape And
Manager Decision Engine - is active, under
`docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`.

| Phase 81 step | Status |
|---|---|
| 01 through 08 | Done 2026-08-02 to 2026-08-04, all gates green. Step 01 reopened once for A9. Their seams are below; the rest is in their step documents |
| 09 AI whole-XI selection, 10 tactical consequence UI, 11 season recap instrument | Done 2026-08-04 to 2026-08-05, all gates green. Recap design: `docs/audits/PHASE_81_SEASON_RECAP_DESIGN.md` |
| 12 - `20 x 5` engine inspection, 13 - diagnostics and integrated gates | Done 2026-08-05/06, all gates green, A7 discharged. Fourteen findings: `docs/audits/PHASE_81_HUNDRED_SEASON_INSPECTION.md` and `PHASE_81_TACTICAL_SHAPE_BOUNDED_DIAGNOSTICS.md` |
| 14 - formation as a counter-move | Done 2026-08-06, all gates green, **its own target recorded as not met**. Seven findings in the step document; the engine is unchanged except for the forced-shape fix |
| 15 - checkpointed `50 x 20`, phase report, handoff | Not started |

## Current Active Step

- Step: `docs/steps/81-phase-aware-tactical-shape-and-manager-decision-engine/15-*.md`
- Next action: Step 15, on an engine Step 14 did not move.
- **The A10 inspection run is spent**; no further cohort runs before Step 15.
- One decision left by Step 07B: the `1.5x` ratio is emergent, not chosen.
- **Three findings are unowned**: the seven-of-ten role generation below and the
  two red long-run checks under A7.
- Step 08 advanced both beta versions without migrating (OPFS `22 -> 23`,
  envelope `13 -> 14`): **careers are deleted, not upgraded.**
- **A gate written only in the phase-level block runs once, at the end.** Put
  `pnpm web:visual:qa` in the per-step block of any step touching web or
  persistence; Steps 13-14 do. **Its `wide journey` full-time assertion is
  timing-sensitive** - it waits on `"real"` playback - and failed once for Step 14
  on an idle machine while passing alone and on a full re-run; Playwright stops at
  the first failure, so one flake hides `33` tests. And **`pnpm cli` writes
  relative output under `apps/cli/`** - `pnpm --filter` changes the working
  directory - so a report is not where the command line says it is.

## Live Constraints

### Do Not Start

- Phases 81A, 82A and 82B are Planned or Draft; their numeric decisions predate
  measurement and are revised against Phase 81's evidence. Phase 79 Steps 14-15
  stay Reopened/not started, unclaimed.

### Longitudinal Runs

- Phase 81 Step 15 owns the checkpointed `50 x 20`, seven workers: engine
  evidence only, never market. Phase 82B Step 09 owns the second, over the
  market; Phase 79's own Steps 14-15 are unrelated.
- **A10 permitted one `20 x 5` inspection run before it** (Step 12): never
  evidence, changes no calibration, widens no band. No cohort elsewhere.

### Carried `goals_per_match_avg` Monitor (A7) - Discharged

Inherited from Phase 80A at `36/634/80` over `750` worlds, every failure high.
`20/0/0` twice, band pass `2.3..3.0`; Step 14 re-measured at twenty worlds of ten
seasons, mean `2.720`, p95 `2.810`. Nothing touched, no owner reopened. Step 15
confirms at cohort scale and brings the unresolved Step 06-versus-07 ownership
question back with it if it reddens. **Step 13's recorded `2.760`/`2.840` is a
two-world reading**, which a `--worlds=2` run reproduces exactly; in band either
way, but quote the scale beside any figure from this command.

**`pnpm cli ten-season-report` exits `1`, and not on this monitor.** Red are the
unowned `young_stored_ceiling_six_stock_arrival_category_placement` (`17` of `20`
worlds) and `contract_finance_structural_integrity` (one world, **also unowned**).
Read the failing-check counts, never the exit code.

### Which Manager Decisions Actually Count, Measured

Step 07B, `1050` scenario pairs: `2100` matches a row, `0.0295` floor, clones.

| Decision | Edge over an even contest |
|---|---|
| fielding a broken shape (`0-0-10`) | `0.4852` |
| one division tier of squad quality | `0.2521` |
| tactic sliders, best setting against worst | `0.0858` |
| an adjacent squad-quality gap, two top clubs | `0.0467` |

Rows below the floor - the structural shape gain, every formation - are absent
here because they are **unmeasured**, not small: with the prefix as the only
difference Step 13 reproduced the tier edge to three decimals while the shape
gain read `0.0312` against `0.0095`, over an all-time `0.0095..0.0431`. Step
07B's document keeps them.

**Step 14: `~0.047` for the formation counter-move is withdrawn, not deferred**,
measured `0.0064` and `0.0117` on two prefixes against that floor, with Step 04's
route chain weighting swept over `57` configurations and **strictly transitive**
in every one. The cause binds anyone who retries: route advantage tracks **mean
capacity** across the `23` shapes, so no trade-off exists to counter. A successor
needs the lopsided population Step 04 left open **and** conserved capacities;
either alone makes one shape win by more. `no_dominant_formation` applies the
same `0.55` to formations and passes at `0.5184`/`0.5210`, `0 of 23` uncountered.
**Never report a best-response cell from the matrix it was chosen on**: a
`23`-way maximum is biased upward by its own `0.0604` cell floor, which alone
clears the `0.047` target.

### Frozen Baseline, Slots And Intrinsic Shape (Steps 01-03)

- `docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md` is the before-state and is
  never regenerated; a `TACTICAL_SHAPE_THRESHOLDS` value takes an amendment. One
  division tier of squad quality is worth `0.2521` win share at identical shape,
  and every structure-versus-quality claim is measured against that.
- Structure may gain at most `0.75 x` that, incoherence must cost `1 x` it - Step
  13 measured `1.92..1.95`, up from Step 06's `1.8313` by four times its own
  population noise, so the engine moved and the margin grew - and no composition,
  tactic profile **or formation** may stay above `0.55` against its field.
- The dominance population is the `66` reachable department compositions, not the
  `23` named presets, which cover `10`: the board locks only the goalkeeper slot
  and no validator caps a department, so extreme shapes are manager choices. Bands
  are conditioned on a **single-country** population (A4); five seed populations
  pass (Steps 13-14).
- A lineup slot stores only `slotId`, `playerId`, `canonicalRole` and `side`; line,
  position family and role-weight key derive through `canonicalRoleTacticalFacts(...)`
  and `roleWeightKeyForCanonicalRole(...)`, and no derived field goes back.
- `fieldablePlayerIds` owns squad depth (A6), `playerSquadDepartment` owns a
  player's department, each with an absence assertion in `pnpm check`. **The A6
  one enumerates nine files so it cannot see a tenth**, and Step 13 found three
  outside it (`career-squad-adapter.ts:245`, `formation-fit-output.ts:108`,
  `report-data.ts:4106`). Nothing differs today; Phase 82A's loan change stops
  being single-definition. Step 02 owns making it discover, not enumerate.
- The intrinsic profile carries **no tactic effect**: every knob has a Step 06
  owner reading it, so a tactic term in `tactical-shape.ts` counts twice.
- `match-tactics-calibration` is **one** versioned asset, one section per concern,
  because one stamped version must travel with a career. `MatchTeamContext.shape`
  and `MatchContext.matchTacticsCalibration` are both required and both team
  shapes must carry that exact version; a context from two policies is refused.
- `deriveTeamShapeAndStrength(...)` is the only way to produce the pair: one
  scoring pass, two readings, so they cannot describe different elevens.
  `validateMatchTacticsCalibration(...)` owns the admissible constraints.

### Relational Matchup Seam (Step 04)

- Five routes, frozen here because Step 01 froze none: `central`, `left`, `right`,
  `direct`, `transition`. `TACTICAL_ROUTE_DEFINITION` is typed code: content owns
  how hard a bottleneck bites, not which capacity resists what.
  `TACTICAL_SHAPE_CAPACITY_MIRROR` is the one place "your left is their right" is
  written, read by the mirror invariant and the flank matchup alike.
- **Open, and now the only live counter-move candidate: the flank claim has an
  instrument and no population.** Step 07A found every curated formation inside
  sampling noise because the calibration mirrors; it needs a lopsided side, and
  only `3-3-3-1` crosses Step 10's flank ratio. Step 14 closed the *weighting*
  half of this reopen as answered: `57` swept configurations, all transitive.
- A chain blends its weakest link with its average, so one dead phase collapses a
  route without deleting it; a route is `0` only when the whole chain is.
- Pressing acts in one place - it contests build-up - so a pressed side falls back
  on the routes that skip it. The knob scales `pressing_cohesion` *before* the
  matchup, never after; a second term prices it twice.

### Suitability Seam (Step 05)

- Suitability is derived once, on `LineupSlotScore`, *beside* the score, and
  `teamStrengthFromSlotScores(...)` ignores it: no double penalty, structurally.
- `TACTICAL_SHAPE_TASK_KIND` decides where it acts. `coordination` tasks scale
  with it; `presence` tasks never do, because the destination role's ability
  weights already price the move. **Any synthesised eleven must therefore hold
  natural positions**, or coordination is suppressed and presence is not - a bias
  that cost Step 10 a whole reference. `POSITION_SUITABILITIES` is the order.

### Tactic Semantics Seam (Step 06)

- A knob's benefit and its cost are two typed mappings,
  `TACTIC_KNOB_FAVOURED_ROUTES` and `TACTIC_KNOB_EXPOSED_ROUTE`. Content owns
  magnitudes; validation refuses a knob priced at zero exposure.
- **Basis points are not effect.** A knob lifting two routes, amplified by
  `routeSelectionSharpness`, costs far more than its number suggests, and
  `deriveOpportunityRate` reads the *difference* between the two plans, so an
  under-priced cost is charged twice. Solve exposures numerically, not from JSON.
  A knob that changes where the ball goes moves **both** sides' attempt rate.
- **`pressing` owns press cohesion, not shape.** Over `3294` reachable boards
  `pressing_cohesion` never falls below `0.90` of ordinary (Step 10): pressing
  costs the ball over the top, never a limp press.

### Occasion And Persistence Seam (Steps 07-08)

- `OccasionContext` is the only door into actor selection and is built before the
  resolver runs; nothing after resolution chooses a player (Step 13 re-checked).
  **An actor edge is a deviation from the pool the actor was drawn from**, in the
  same attribute off the same accessor, so an absent `incidentProfiles` gives `0`
  not a constant. A goalkeeper has no pool: his department scales, floor `0.35`.
- **Player attributes are required on every `MatchTeamContext`**, no fallback.
  Never hand-assemble the literal: that is what let opponents play at a flat `10`.
- A match fact belongs to the club that **fielded** the player, never the one
  holding his contract (A8). An event's own side decides; a registration names the
  club only for a player with no events. Cards are not club-attributed at all.
- **Only a load can prove a save.** `route` was absent from `match_events` for a
  whole step because no test loaded a report back. Schema `23` / envelope `14`,
  match-event `8`, explanation-trace `2`; the mapper validates unions, never casts.

### AI Selection Seam (Step 09)

- **One selection scale**, `SUITABILITY_SELECTION_BONUS` at `2.4 / 1.2 / -3.5` on
  the `0-20` ability it is added to. A larger bonus decides every comparison on fit
  alone: at the old `35 / 25 / 5` no adapted footballer could be a legal sub.
- `assembleMatchTeamContext(...)` writes the only `MatchTeamContext` literal;
  `selectCareerAiTeam(...)` is the only door career AI selection goes through. The
  live web session builds its own kickoff context, so a second path there would
  disagree with the team the result is committed against.
- The AI policy is **one policy, not a per-club map**, and carries no formation
  (A2). A map invites answering only for the clubs the manager faces; a club lines
  up in the shape its own squad is built for.
- Filling the shape is never tradeable against quality in `assignFootballXi(...)`;
  all `23` shapes cost `3.1x` a fixed one, not `23x`, and Phase 81A owns A3.
- `ProgressCareerFixtureAdvanced.fieldedLineups` is the only answer to who played
  where; a reloaded reviewed result leaves it empty rather than re-selecting.
- **Shape on `structuralScore`, eleven on `score`.** Only ability and fit choose
  a club's system; one score for both let fatigue change a formation for a week.
- **A lost goalkeeper is replaced by the substitute keeper**, an outfielder going
  off to make room; promoting from the pitch is last, by reflexes and handling.
- **Shape-derived tactics exceed Step 09's `No new AI tactic control` rule**,
  added on explicit instruction. Width, directness and risk deviate from the
  *measured* catalog mean, so the `23` shapes average back to the caller's setup.

### Manager Explanation Seam (Step 10)

- **A capacity is not showable**: a weak side is low in all twelve and a strong
  one high in all twelve, so a raw reading describes the squad rather than the
  shape just chosen. `deriveTacticalShapeEmphasis(...)` divides by what an
  ordinary curated eleven puts there, then by the side's own mean of those
  ratios - `1` is ordinary, squad quality gone - reading that eleven from the
  live calibration through `deriveOrdinaryTacticalShapeReference(...)`.
- Frozen presentation policy, in `@game/ui` per the step contract: `0.75` / `1.25`
  bands, `1.25` flank ratio, `0.6` knob, `3` shown, measured on the `9`
  **selectable** shapes (`[0.771, 1.133]`). A retune re-derives them, caught by
  `match-preparation-adapter.test.ts`.
- **A knob is reported through the route it concedes, never restated.**
  `press_without_cover` names `pressing` and reads `TACTIC_KNOB_EXPOSED_ROUTE` and
  `TACTICAL_ROUTE_DEFINITION` for the rest, so Steps 06 and 04 keep sole ownership
  of what a tactic costs.
- **The engine is the live authority, the board is the pre-match one**, chosen
  explicitly in `use-career-screen-presentations.ts` with no fallback. A rejected
  command leaves the observations put: it never reached
  `applyConfirmedProgressiveTeamChanges`. It reads the manager's own shape only;
  the half-time opponent read waits on there being something to counter (Step 14).
- **One of the three slots is held for what the shape bought.** Costs rank first,
  so a broken shape filled every slot with them; later rankings owe the same.
- Observation label keys are template literal types, so a missing translation
  fails the build. **The other `presentationMessageKey` families still need
  that** - incomplete ones crash at runtime and `check:localized-text` misses
  them. Unowned.

### Season Recap And Inspection Seam (Steps 11-12)

- **The world generates seven of the ten canonical roles.** No
  `attacking_midfielder`, `defensive_midfielder` or `wide_midfielder` is ever
  created, while `12` of the `23` curated shapes need the first - including
  `4-2-3-1`, the shape Step 14 measured strongest. It thins every assist chart.
  **Unowned.** `4-4-2` needs none of them, which is why nothing saw it before.
- **A forced shape is filled out of position** (Step 14): `bestFieldedShape(...)`
  retries with the `invalid` suitability filter dropped and nothing else changed,
  so it yields the cheapest eleven filling *that* shape instead of the exception
  that ended `5` of `20` inspection fixtures. It cannot fire on a chosen shape.
- `SEASON_RECAP_BANDS` owns fourteen bands, frozen before any output existed and
  expressed as rates per match. **A failing band is a finding, never a number to
  widen.** They were declared from top-flight football while the observed
  competitions are generated lower divisions, which really are more compressed:
  the three failing table bands have two candidate owners.
- Shape assignment is a **setup choice, not a selector**: `(worldSeed, clubId)`
  and nothing else, so no shape inherits its clubs' strength. Step 14 read it and
  left it: a selector here would measure Step 09's chooser, not the engine.
- **Who scores and who assists are two total mappings, not one.** Deriving the
  second from the first swept strikers into the creator group: wingers do both.

### Accepted Product Decisions Still In Force

- **Superseded, do not reuse:** Phase 79C's distribution tolerances (an
  owner-category multiplier that no longer exists) and Phase 79D's `302`
  ceiling-six count (Phase 80A changed its population).
- Public player value is club-independent: one global model, one `EUR 150m` cap,
  and no transfer or contract event alone changes it.
- Squad floors use selectable depth (`owned + incoming - outgoing loans`), which
  Phase 82A implements. `Club.playerIds` stays ownership.

## Update Protocol

For every step attempt: read this file, choose the active step, implement only that
step, run the required checks, and if something is wrong fix the current step or
update the next relevant step document. Advance only when the step Definition of
Done is satisfied. When updating this file:

1. Update `Current Active Step` and the phase progress table.
2. Mark the step Done in its own step document, closing with a dated handoff
   note: status, outcome, adopted solution, verification, follow-up. **That
   document is where the detail lives**, not this one.
3. Add to `Live Constraints` only what constrains *future* work, and delete
   anything there that has stopped constraining anything.
4. Keep this file under `300` lines.
