# Project Status

Handoff snapshot for whoever picks the project up next.

**This file stays small on purpose.** It once reached `5010` lines - more than a
context window holds - so "read this file first" had stopped being followable.
History lives in `git log` and `docs/audits/`; rules live in `AGENTS.md` and
`docs/PROJECT_RULES.md`, never a second time here.

## How To Read The Project

In order: `requirements.md`, `docs/PROJECT_RULES.md`, this file for current state
and live constraints, then `docs/steps/README.md`, the active phase README and the
active step. Nothing else.

## Current State

Phases 0 through 81 are complete; what they delivered is in the code and the
per-phase reports in `docs/audits/`. **Phase 81 closed 2026-08-07** on
`docs/audits/PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_ENGINE_REPORT.md`, with one
Definition of Done line recorded as not met rather than claimed.

Phase 81A - Season-Anchored Contracts, Free-Agent Economy And Background
Fixtures - is the next owner, under
`docs/steps/81a-season-anchored-contracts-free-agent-economy-and-background-fixtures/`.
Its entry gate is confirmed satisfied by the Phase 81 report.

## Current Active Step

- Step: Phase 81A, first step. Nothing in Phase 81 remains open.
- One decision left by Step 07B: the `1.5x` ratio is emergent, not chosen.
- Step 08 advanced both beta versions without migrating (OPFS `22 -> 23`,
  envelope `13 -> 14`): **careers are deleted, not upgraded.**
- **A gate written only in the phase-level block runs once, at the end.** Put
  `pnpm web:visual:qa` in the per-step block of any step touching web or
  persistence. **Its `wide journey` full-time assertion is timing-sensitive** -
  it waits on `"real"` playback - and failed once on an idle machine while
  passing alone and on a full re-run; Playwright stops at the first failure, so
  one flake hides `33` tests. Unowned.
- **`pnpm cli ten-season-report` resolves relative output from the workspace
  root**, not `apps/cli/`: `resolveWorkspaceOutputPath(...)` walks up to
  `pnpm-workspace.yaml` (`ten-season-report.ts:176`). The earlier warning here
  was stale for this command. Other CLI commands were not checked.

## Unowned, Carried Forward

Five findings have no owner. None was adopted by the step that found it, and none
is a licence to widen anything.

- **The world generates seven of the ten canonical roles**: no
  `attacking_midfielder`, `defensive_midfielder` or `wide_midfielder`, while `12`
  of the `23` curated shapes need the first, including the strongest measured.
  Sized at cohort scale: **`5579` role coverage warnings over `1000` seasons**,
  p95 `119` per world. `4-4-2` needs none, which is why nothing saw it before.
- **`player_economy_young_stored_ceiling_six_stock_arrival_category_placement`**,
  red in `50` of `50` worlds. Phase 80A's.
- **`contract_finance_structural_integrity`** (`13/50`) and
  **`preliminary_agreement_integrity`** (`12/50`), Phase 79's, named in its Step
  14 document; the second new as of the Phase 81 cohort. Both `structure`-class
  `pass 0; fail >0` in `contract-finance-stability.ts`, and both plausibly
  accumulate with horizon - at ten seasons the first read `1` of `20` worlds.
- **The A6 absence assertion enumerates nine files and cannot see a tenth**;
  Step 13 found three readers outside it (`career-squad-adapter.ts:245`,
  `formation-fit-output.ts:108`, `report-data.ts:4106`). Phase 82A's loan change
  is where that stops being harmless. Step 02 owns making it discover.
- **Incomplete `presentationMessageKey` families** crash at runtime, and
  `check:localized-text` misses them (Step 10).

## Live Constraints

### Do Not Start

- Phases 82A and 82B stay Planned or Draft; their numeric decisions predate
  measurement and are revised against Phase 81's evidence. Phase 79 Steps 14-15
  stay Reopened/not started, unclaimed. Phase 81A is now the active phase.

### Longitudinal Runs

- **Phase 81's `50 x 20` is done and is not re-run.** Engine evidence only: no
  loans, no postures, no races, and every season played in `4-4-2`. Phase 82B
  Step 09 owns the market cohort; Phase 79's Steps 14-15 are still unclaimed.
- The A10 `20 x 5` inspection (Step 12) remains **never evidence**: it changes no
  calibration, widens no band, and nothing may cite it as balance measurement.
- **`pnpm cli ten-season-report` exits `1` on unowned pre-existing checks.** Read
  the failing-check counts, never the exit code.

### Carried `goals_per_match_avg` Monitor (A7) - Closed

Inherited from Phase 80A at `36/634/80` over `750` worlds, every failure high.
**Closed at cohort scale: mean `2.670`, p95 `2.740`, band `2.3..3.0` unchanged,
failing in `0` of `50` worlds over `1000` seasons.** Threshold, denominator and
severity class exactly as inherited; nothing widened, no owner reopened. The Step
06-versus-07 ownership question does not return: the condition that would have
returned it did not occur.

**Step 13's `2.760`/`2.840` was a two-world reading wearing a twenty-world
label.** Quote the scale beside any figure from this command.

### Why Formation Is Not A Counter-Move

Measured at `0.0064`/`0.0117` against a `0.0295` floor and **withdrawn, not
deferred**. A real formation ordering exists - `4-2-3-1` tops both prefixes at
`0.5184`/`0.5210` - but it is a property of the shape, not of the opponent.
Derivation is in the Phase 81 report; the binding facts are:

- The cause is upstream of every coefficient. The twelve capacities are
  independent monotone functions of the same eleven (`tactical-shape.ts:118`,
  `:180`) and `validateContributionWeights(...)` puts **no constraint on the sum
  of a role's task weights** (`match-tactics-calibration.ts:833`), so route
  advantage ranks identically to mean capacity and the matrix is transitive by
  construction. No downstream sweep can break that.
- A successor owns **conservation and the lopsided population together**.
- Two untested hypotheses to declare before measuring: conservation may only
  *relocate* the dominant strategy, since `saturate` is concave and a balanced
  allocation maximises the sum; and Step 14's sweep does **not** rule out
  `routeSelectionSharpness` on conserved capacities, only on correlated ones.
- Asymmetry can never come from the weight table - weights are per task, not per
  capacity, so mirror symmetry is structural (`match-tactics-calibration.ts:63`).
  Only `slot.side` and the channel policy can produce it.

### Which Manager Decisions Actually Count, Measured

Step 07B, `1050` scenario pairs: `2100` matches a row, `0.0295` floor, clones. The
measured table is in the Phase 81 report; what binds here is how to read it.

- A broken shape (`0.4852`) and a division tier of squad quality (`0.2521`) are
  the only large effects; tactic sliders reach `0.0858`. Rows below the floor -
  the structural shape gain, every formation - are **unmeasured, not small**.
- `no_dominant_formation` applies the same `0.55` to formations and passes at
  `0.5184`/`0.5210`, `0 of 23` uncountered.
- **Never report a best-response cell from the matrix it was chosen on**: a
  `23`-way maximum is biased upward by its own `0.0604` cell floor, which alone
  clears the `0.047` target it was measuring.

### Frozen Baseline, Slots And Intrinsic Shape (Steps 01-03)

- `docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md` is the before-state and is
  never regenerated; a `TACTICAL_SHAPE_THRESHOLDS` value takes an amendment. The
  division tier above is the denominator of every structure-versus-quality claim.
- Structure may gain at most `0.75 x` that, incoherence must cost `1 x` it
  (measured `1.92..1.95`), and no composition, tactic profile **or formation** may
  stay above `0.55` against its field.
- The dominance population is the `66` reachable department compositions, not the
  `23` named presets, which cover `10`: the board locks only the goalkeeper slot
  and no validator caps a department, so extreme shapes are manager choices. Bands
  are conditioned on a **single-country** population (A4); five seed populations
  pass.
- A lineup slot stores only `slotId`, `playerId`, `canonicalRole` and `side`; line,
  position family and role-weight key derive through `canonicalRoleTacticalFacts(...)`
  and `roleWeightKeyForCanonicalRole(...)`, and no derived field goes back.
- `fieldablePlayerIds` owns squad depth (A6), `playerSquadDepartment` owns a
  player's department, each with an absence assertion in `pnpm check`. The A6
  assertion's blind spot is under *Unowned* above.
- The intrinsic profile carries **no tactic effect**: every knob has a Step 06
  owner reading it, so a tactic term in `tactical-shape.ts` counts twice.
- `match-tactics-calibration` is **one** versioned asset, one section per concern,
  because one stamped version must travel with a career. Both team shapes must
  carry that exact version; a context from two policies is refused.
- `deriveTeamShapeAndStrength(...)` is the only way to produce the pair: one
  scoring pass, two readings, so they cannot describe different elevens.
  `validateMatchTacticsCalibration(...)` owns the admissible constraints.

### Relational Matchup Seam (Step 04)

- Five frozen routes: `central`, `left`, `right`, `direct`, `transition`.
  `TACTICAL_ROUTE_DEFINITION` is typed code - content owns how hard a bottleneck
  bites, not which capacity resists what - and `TACTICAL_SHAPE_CAPACITY_MIRROR` is
  the one place "your left is their right" is written.
- **Open: the flank claim has an instrument and no population.** Only `3-3-3-1`
  crosses Step 10's flank ratio. This is the lopsided-population half of the
  counter-move section above; the weighting half is answered.
- A chain blends its weakest link with its average, so one dead phase collapses a
  route without deleting it; a route is `0` only when the whole chain is.
- Pressing acts in one place - it contests build-up - so a pressed side falls back
  on the routes that skip it. The knob scales `pressing_cohesion` *before* the
  matchup, never after; a second term prices it twice.

### Suitability Seam (Step 05)

- Suitability is derived once, on `LineupSlotScore`, *beside* the score, and
  `teamStrengthFromSlotScores(...)` ignores it: no double penalty, structurally.
  `TACTICAL_SHAPE_TASK_KIND` decides where it acts: `coordination` tasks scale
  with it, `presence` tasks never do. **Any synthesised eleven must therefore hold
  natural positions**, or coordination is suppressed and presence is not - a bias
  that cost Step 10 a whole reference. `POSITION_SUITABILITIES` is the order.

### Tactic Semantics Seam (Step 06)

- A knob's benefit and its cost are two typed mappings,
  `TACTIC_KNOB_FAVOURED_ROUTES` and `TACTIC_KNOB_EXPOSED_ROUTE`. Content owns
  magnitudes; validation refuses a knob priced at zero exposure.
- **Basis points are not effect.** `deriveOpportunityRate` reads the *difference*
  between the two plans, so an under-priced cost is charged twice. Solve exposures
  numerically, not from JSON. A knob that changes where the ball goes moves
  **both** sides' attempt rate.
- **`pressing` owns press cohesion, not shape.** Over `3294` reachable boards
  `pressing_cohesion` never falls below `0.90` of ordinary.

### Occasion And Persistence Seam (Steps 07-08)

- `OccasionContext` is the only door into actor selection, built before the
  resolver runs. **An actor edge is a deviation from the pool the actor was drawn
  from**, same attribute off the same accessor, so an absent `incidentProfiles`
  gives `0` not a constant. A goalkeeper has no pool: his department scales,
  floor `0.35`.
- **Player attributes are required on every `MatchTeamContext`**, no fallback.
  Hand-assembling the literal is what let opponents play at a flat `10`.
- A match fact belongs to the club that **fielded** the player, never the one
  holding his contract (A8). An event's own side decides; a registration names the
  club only for a player with no events. Cards are not club-attributed.
- **Only a load can prove a save.** `route` was absent from `match_events` for a
  whole step because no test loaded a report back. Schema `23`/envelope `14`,
  match-event `8`, explanation-trace `2`; the mapper validates unions, never casts.

### AI Selection Seam (Step 09)

- **One selection scale**, `SUITABILITY_SELECTION_BONUS` at `2.4 / 1.2 / -3.5` on
  the `0-20` ability it is added to. A larger bonus decides every comparison on fit
  alone: at the old `35 / 25 / 5` no adapted footballer could be a legal sub.
- `assembleMatchTeamContext(...)` writes the only `MatchTeamContext` literal and
  `selectCareerAiTeam(...)` is the only door career AI selection goes through; a
  second path would disagree with the team the result is committed against.
- The AI policy is **one policy, not a per-club map**, and carries no formation
  (A2): a club lines up in the shape its own squad is built for. Filling the shape
  is never tradeable against quality in `assignFootballXi(...)`; all `23` shapes
  cost `3.1x` a fixed one, not `23x`, and Phase 81A owns A3.
- `ProgressCareerFixtureAdvanced.fieldedLineups` is the only answer to who played
  where; a reloaded reviewed result leaves it empty rather than re-selecting.
- **Shape on `structuralScore`, eleven on `score`.** One score for both let
  fatigue change a formation for a week.
- **A lost goalkeeper is replaced by the substitute keeper**, an outfielder going
  off to make room; promoting from the pitch is last, by reflexes and handling.
- **Shape-derived tactics exceed Step 09's `No new AI tactic control` rule**, on
  explicit instruction. Width, directness and risk deviate from the *measured*
  catalog mean, so the `23` shapes average back to the caller's setup.

### Manager Explanation Seam (Step 10)

- **A capacity is not showable**: a weak side is low in all twelve and a strong
  one high in all twelve. `deriveTacticalShapeEmphasis(...)` divides by what an
  ordinary curated eleven puts there, then by the side's own mean of those ratios
  - `1` is ordinary, squad quality gone - reading that eleven through
  `deriveOrdinaryTacticalShapeReference(...)`.
- Frozen presentation policy, in `@game/ui`: `0.75`/`1.25` bands, `1.25` flank
  ratio, `0.6` knob, `3` shown, measured on the `9` **selectable** shapes
  (`[0.771, 1.133]`). A retune re-derives them, caught by
  `match-preparation-adapter.test.ts`.
- **A knob is reported through the route it concedes, never restated**, so Steps
  06 and 04 keep sole ownership of what a tactic costs.
- **The engine is the live authority, the board is the pre-match one**, chosen in
  `use-career-screen-presentations.ts` with no fallback. A rejected command leaves
  the observations put. The half-time opponent read waits on there being something
  to counter.
- **One of the three slots is held for what the shape bought.** Costs rank first,
  so a broken shape filled every slot with them; later rankings owe the same.
- Observation label keys are template literal types, so a missing translation
  fails the build. Other families are not; see *Unowned*.

### Season Recap And Inspection Seam (Steps 11-12)

- **A forced shape is filled out of position**: `bestFieldedShape(...)` retries
  with the `invalid` suitability filter dropped, yielding the cheapest eleven
  filling *that* shape. It cannot fire on a chosen shape, and under a forced
  `4-4-2` it never fires at all.
- `SEASON_RECAP_BANDS` owns fourteen bands, frozen before any output existed and
  expressed as rates per match. **A failing band is a finding, never a number to
  widen.** Declared from top-flight football while the observed competitions are
  generated lower divisions: the three failing table bands have two owners.
- Shape assignment is a **setup choice, not a selector**: `(worldSeed, clubId)`
  and nothing else, so no shape inherits its clubs' strength. A selector here
  would measure Step 09's chooser, not the engine.
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

1. Update `Current State` and `Current Active Step`.
2. Mark the step Done in its own step document, closing with a dated handoff
   note: status, outcome, adopted solution, verification, follow-up. **That
   document is where the detail lives**, not this one.
3. Add to `Live Constraints` only what constrains *future* work, and delete
   anything there that has stopped constraining anything.
4. Keep this file under `300` lines. A closed phase's per-step seams are
   candidates: its report owns them once it exists.
