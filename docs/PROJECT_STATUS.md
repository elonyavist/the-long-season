# Project Status

Handoff snapshot for whoever picks the project up next. **It stays small on
purpose**: it once reached `5010` lines, more than a context window holds, so
"read this file first" had stopped being followable. History lives in `git log`
and `docs/audits/`, rules in `AGENTS.md` and `docs/PROJECT_RULES.md`.

## How To Read The Project

In order: `requirements.md`, `docs/PROJECT_RULES.md`, this file for current state
and live constraints, then `docs/steps/README.md`, the active phase README and the
active step. Nothing else.

## Current State

Phases 0 through 81 are complete; what they delivered is in the code and `docs/audits/`.

**Phase 81A - Contextual Tactical Agency - is active**, under
`docs/steps/81a-contextual-tactical-agency-manager-ai-decision-loop/`, governed by
`docs/audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_DESIGN_CONTRACT.md`.

The former contract/free-agent/background-fixture plan is Phase 81B, Draft under
`docs/steps/81b-season-anchored-contracts-free-agent-economy-and-background-fixtures/`;
Step 07 closes on a `750 x 10` with exactly `7` workers.

## Current Active Step

- Step: Phase 81A Step 03A, squad archetypes. **Done, `pnpm check` green**
  (`291` files, `2250` tests). The Phase 80A matrix was measuring squad order,
  not just age/role/room/participation; with its five streams declared by role
  the controlled value is `3005` against a shipped `3034`. **Adopted:
  `wide_midfielder` stays and `3005` is the new calibration** - it could not be
  sampled before this phase, so `3034` was fitted to an incomplete population.
  Delivery is a typed total version -> bundle catalog, never a `??` fallback:
  existing careers read `v7`, new careers are born on `v8`, **Step 14 stays the
  only reset**. Not implemented yet; held behind
  `PHASE_81A_PENDING_OUTFIELD_PROJECTION`, deleted after A2's `GO`. Hard-cap
  probe: **`FOUND`**, `210` world-seasons, `21/21` reconciled. **Checkpoint A
  recorded `STOP / RETHINK`**; 01-03 Done, **04-16 closed** until A2 (03B).
- **Each club draws one of eight squad identities** from
  `deriveRng(seed, "squad-identity", clubNumber)`. An identity names footballers,
  never a shape, and none may become reachable from selection.
  `naturalCanonicalRoleForPosition(...)` is the one position-to-role mapping.
- **`AiSquadSelectionResult.catalogChoice` says how close the shape decision was**,
  absent when a caller imposed one. Four ephemeral facts from the canonical walk -
  never a second ranking, never persisted, never rebuilt.
- **A gate written only in the phase-level block runs once, at the end.** Put
  `pnpm web:visual:qa` in the per-step block of any step touching web or
  persistence. **Its `wide journey` full-time assertion is timing-sensitive** and
  flaked once on an idle machine; Playwright stops at the first failure, so one
  flake hides `33` tests. Unowned.
- **`pnpm cli ten-season-report` resolves relative output from the workspace
  root** via `resolveWorkspaceOutputPath(...)`, never from `apps/cli/`.

## Unowned, Carried Forward

Five findings have no owner. None is a licence to widen anything.

- **`player_economy_young_stored_ceiling_six_stock_arrival_category_placement`**, red
  in `50/50` worlds. Phase 80A's.
- **`contract_finance_structural_integrity`** (`13/50`) and
  **`preliminary_agreement_integrity`** (`12/50`), Phase 79's, both
  `structure`-class `pass 0; fail >0` in `contract-finance-stability.ts`.
- **The A6 absence assertion enumerates nine files and cannot see a tenth**; three
  readers sit outside it (`career-squad-adapter.ts:245`, `formation-fit-output.ts:108`,
  `report-data.ts:4106`).
- **Incomplete `presentationMessageKey` families** crash at runtime; `check:localized-text` misses them.
- **`check:role-department` misses four production copies of the position ->
  department map** (domain, `player-development.ts`, `player-exits.ts`,
  `fake-season-input.ts`); a missed one files wide midfielders as attackers.

## Live Constraints

### Do Not Start

- Phase 81B, 82A and 82B stay Planned or Draft: their numeric decisions predate
  their own measurement and remain entry-gated. Phase 79 Steps 14-15 stay
  Reopened and unclaimed. Phase 81A is the only active phase.

### Checkpoint A: STOP / RETHINK, And What It Falsified (81A Step 03)

`7` worlds, `378` third-division selections, `297.81`/s on `7` workers. Report:
`docs/audits/PHASE_81A_CHECKPOINT_A_BEFORE_STATE.md`. **Falsified: catalog order
breaks ties.** The remedy survives, its mechanism does not - breaking ties becomes
making the winning shape depend on the squad. The STOP clause's literal wording
anticipated the *opposite* population; the outcome is adopted on its purpose.
Frozen, never regenerated to pass a later gate:

- `4-2-4` takes `0.9286` of selections, `3` of `23` shapes appear, and
  **`tieDecidedShare` is `0.0000`** - the winner beats the runner-up by a mean
  structural `0.7610`. **Catalog order decides nothing on real squads**; the
  contract's seven-way tie is an artefact of uniform ability. Step 08 was scoped
  to break ties and there are none. Step 03 owns that.
- `defensive_midfielder`, `attacking_midfielder` and `wide_midfielder` are
  generated **exactly zero** times in `2772` seniors; `center_back` `0.2727`,
  `striker` `0.2273`.
- **The low block already clears both Step 05 gates in xG**: conceded `-22.5%`
  against `>= 8%`, exchange rate `1.4940` against `<= 2.0`. They are therefore
  **non-regression guardrails and may never be cited as evidence Step 05
  improved anything**. The historical `13.3` occasion ratio may not be quoted as
  its cost again - it cannot tell fewer chances from worse ones.
- **Step 01 changed no match**, proven not sampled: the migrated control term is
  bit-identical over the complete knob space (`390625` points, `0` differing),
  and the other four changes cannot reach a match.
- **That the absent roles cause the monoculture is an inference.** Checkpoint A2
  owes the counterfactual.

### Longitudinal Runs

- **Phase 81's `50 x 20` is done and is not re-run.** Engine evidence only: no loans,
  no postures, no races, every season in `4-4-2`. Phase 82B Step 09 owns the market
  cohort; Phase 79's Steps 14-15 are unclaimed.
- The A10 `20 x 5` inspection (Step 12) is **never evidence**: it changes no
  calibration and nothing may cite it as balance measurement.
- **`pnpm cli ten-season-report`'s exit code follows `Closing division value fit`,
  not sample size.** Read the failing-check counts, never the exit code.

### Why Formation Is Not A Counter-Move

Measured at `0.0064`/`0.0117` against a `0.0295` floor and **withdrawn, not
deferred**; the ordering that exists (`4-2-3-1` tops both prefixes at
`0.5184`/`0.5210`) is a property of the shape, not of the opponent. The Phase 81
report owns the derivation, the 81A contract the cause. Two things neither
carries: Step 14's sweep rules out `routeSelectionSharpness` only on correlated
capacities, not conserved ones; and asymmetry can never come from the weight
table, because weights are per task so mirror symmetry is structural
(`match-tactics-calibration.ts:63`) - only `slot.side` and the channel policy
produce it.

### Which Manager Decisions Actually Count, Measured

Step 07B, `1050` scenario pairs, `0.0295` paired floor, uniform-ability clones;
the table is in the Phase 81 report. A broken shape (`0.4852`) and a division
tier (`0.2521`) are the only large effects and tactic sliders reach `0.0858`;
rows below the floor - the structural shape gain, every formation - are
**unmeasured, not small**. **Never report a best-response cell from the matrix it
was chosen on**: a `23`-way maximum is biased upward by its own `0.0604` cell
floor, which alone clears the `0.047` target it was measuring. **Clones are
silent about which players a manager fields.**

### Frozen Baseline, Slots And Intrinsic Shape (Steps 01-03)

- `docs/audits/PHASE_81_TACTICAL_SHAPE_BASELINE.md` is the before-state and is
  never regenerated; a `TACTICAL_SHAPE_THRESHOLDS` value takes an amendment.
  Structure may gain at most `0.75 x` the division tier, incoherence must cost
  `1 x` it (measured `1.92..1.95`), and no composition, tactic profile **or
  formation** may stay above `0.55` against its field.
- The dominance population is the `66` reachable department compositions, not the
  `23` named presets, which cover `10`: the board locks only the goalkeeper slot
  and no validator caps a department. Bands are conditioned on a **single-country**
  population (A4); five seed populations pass.
- A lineup slot stores only `slotId`, `playerId`, `canonicalRole` and `side`; line,
  position family and role-weight key derive through `canonicalRoleTacticalFacts(...)`
  and `roleWeightKeyForCanonicalRole(...)`, and no derived field goes back.
- `fieldablePlayerIds` owns squad depth (A6), `playerSquadDepartment` owns a
  player's department and now also `MINIMUM_CAREER_DEPARTMENT_DEPTH`, which
  content and engine both read and neither may copy.
- The intrinsic profile carries **no tactic effect**: every knob has a Step 06
  owner reading it, so a tactic term in `tactical-shape.ts` counts twice.
- `match-tactics-calibration` is **one** versioned asset; both team shapes must
  carry that exact version and a context from two policies is refused.
- `deriveTeamShapeAndStrength(...)` is the only way to produce the pair: one
  scoring pass, two readings, so they cannot describe different elevens.

### Relational Matchup Seam (Step 04)

- Five frozen routes: `central`, `left`, `right`, `direct`, `transition`.
  `TACTICAL_ROUTE_DEFINITION` is typed code - content owns how hard a bottleneck
  bites, not which capacity resists what - and `TACTICAL_SHAPE_CAPACITY_MIRROR` is
  the one place "your left is their right" is written.
- **Open: the flank claim has an instrument and no population.** Only `3-3-3-1`
  crosses Step 10's flank ratio.
- A chain blends its weakest link with its average, so one dead phase collapses a
  route without deleting it; a route is `0` only when the whole chain is.
- Pressing acts in one place - it contests build-up - so a pressed side falls back
  on the routes that skip it. The knob scales `pressing_cohesion` *before* the
  matchup, never after; a second term prices it twice.
- **`OpportunityRoutePlan` is the only owner of the minute's tactical
  derivation** (81A Step 01); the explanation trace reads that plan instead of
  rebuilding a matchup that applied no tactic at all. It carries
  `bottleneckByRoute` - a limiting phase is not recoverable from a capacity -
  and no `controlCapacity`, which was a dead copy of the live possession formula.

### Suitability Seam (Step 05)

- Suitability is derived once, on `LineupSlotScore`, *beside* the score, and
  `teamStrengthFromSlotScores(...)` ignores it: no double penalty, structurally.
  `TACTICAL_SHAPE_TASK_KIND` decides where it acts: `coordination` tasks scale
  with it, `presence` tasks never do. **Any synthesised eleven must therefore
  hold natural positions**, or coordination is suppressed and presence is not - a
  bias that cost Step 10 a whole reference. `POSITION_SUITABILITIES` is the order.

### Tactic Semantics Seam (Step 06)

- A knob's benefit and its cost are two typed mappings,
  `TACTIC_KNOB_FAVOURED_ROUTES` and `TACTIC_KNOB_EXPOSED_ROUTE`. Content owns
  magnitudes; validation refuses a knob priced at zero exposure.
- **Basis points are not effect.** `deriveOpportunityRate` reads the *difference*
  between the two plans, so an under-priced cost is charged twice. Solve
  exposures numerically. A knob that changes where the ball goes moves **both**
  sides' attempt rate.
- **`pressing` owns press cohesion, not shape.** Over `3294` reachable boards
  `pressing_cohesion` never falls below `0.90` of ordinary.
- **The four possession-control magnitudes are content's** (81A Step 01):
  `controlBasisPointsByKnob` holds unsigned shares and
  `TACTIC_KNOB_CONTROL_DIRECTION` holds the sign, so `isBasisPointShare(...)`
  stays `0..10000`; the stamp stayed `v1` because the move was exactly
  value-preserving. `controlWeight(...)` writes its four terms out instead of
  looping: float addition is not associative, and reordering them moves `30.6%`
  of reachable combinations by an ulp.

### Occasion And Persistence Seam (Steps 07-08)

- `OccasionContext` is the only door into actor selection. **An actor edge is a
  deviation from the pool the actor was drawn from**, same attribute off the same
  accessor, so an absent `incidentProfiles` gives `0` not a constant. A
  goalkeeper has no pool: his department scales, floor `0.35`.
- **Player attributes are required on every `MatchTeamContext`**, no fallback.
  Hand-assembling the literal is what let opponents play at a flat `10`.
- A match fact belongs to the club that **fielded** the player, never the one
  holding his contract (A8). Cards are not club-attributed.
- **Only a load can prove a save.** `route` was absent from `match_events` for a
  whole step because no test loaded a report back. Schema `23`/envelope `14`,
  match-event `8`, explanation-trace `2`; the mapper validates unions, never casts.

### AI Selection Seam (Step 09)

- **One selection scale**, `SUITABILITY_SELECTION_BONUS` at `2.4 / 1.2 / -3.5` on
  the `0-20` ability it is added to. At the old `35 / 25 / 5` no adapted
  footballer could be a legal sub.
- `assembleMatchTeamContext(...)` writes the only `MatchTeamContext` literal and
  `selectCareerAiTeam(...)` is the only door career AI selection goes through.
- The AI policy is **one policy, not a per-club map**, and carries no formation
  (A2). Filling the shape is never tradeable against quality in
  `assignFootballXi(...)`; all `23` shapes cost `3.1x` a fixed one.
- `ProgressCareerFixtureAdvanced.fieldedLineups` is the only answer to who played
  where; a reloaded reviewed result leaves it empty rather than re-selecting.
- **Shape on `structuralScore`, eleven on `score`.** One score for both let
  fatigue change a formation for a week.
- **A lost goalkeeper is replaced by the substitute keeper**, an outfielder going
  off to make room; promoting from the pitch is last.
- **Shape-derived tactics exceed Step 09's `No new AI tactic control` rule**, on
  explicit instruction. Width, directness and risk deviate from the *measured*
  catalog mean, so the `23` shapes average back to the caller's setup.

### Manager Explanation Seam (Step 10)

- **A capacity is not showable**: a weak side is low in all twelve and a strong
  one high in all twelve. `deriveTacticalShapeEmphasis(...)` divides by what an
  ordinary curated eleven puts there, then by the side's own mean of those ratios
  - `1` is ordinary, squad quality gone.
- Frozen presentation policy, in `@game/ui`: `0.75`/`1.25` bands, `1.25` flank
  ratio, `0.6` knob, `3` shown, measured on the `9` **selectable** shapes
  (`[0.771, 1.133]`). A retune re-derives them, caught by
  `match-preparation-adapter.test.ts`.
- **A knob is reported through the route it concedes, never restated.**
- **The engine is the live authority, the board is the pre-match one**, chosen in
  `use-career-screen-presentations.ts` with no fallback. A rejected command
  leaves the observations put.
- **One of the three slots is held for what the shape bought.** Costs rank first,
  so a broken shape filled every slot with them; later rankings owe the same.
- Observation label keys are template literal types, so a missing translation
  fails the build. Other families are not; see *Unowned*.

### Season Recap And Inspection Seam (Steps 11-12)

- **A forced shape is filled out of position**: `bestFieldedShape(...)` retries
  with the `invalid` filter dropped, yielding the cheapest eleven filling *that*
  shape. It cannot fire on a chosen shape.
- `SEASON_RECAP_BANDS` owns fourteen bands, frozen before any output existed and
  expressed as rates per match. **A failing band is a finding, never a number to
  widen.** Declared from top-flight football while the observed competitions are
  lower divisions: the three failing table bands have two owners.
- Shape assignment is a **setup choice, not a selector**: `(worldSeed, clubId)`
  and nothing else, so no shape inherits its clubs' strength.
- **Who scores and who assists are two total mappings, not one.** Deriving the
  second from the first swept strikers into the creator group: wingers do both.

### Accepted Product Decisions Still In Force

- **Superseded, do not reuse:** Phase 79C's distribution tolerances and Phase 79D's
  `302` ceiling-six count (Phase 80A changed its population).
- Public player value is club-independent: one global model, one `EUR 150m` cap,
  and no transfer or contract event alone changes it.
- Squad floors use selectable depth (`owned + incoming - outgoing loans`), which
  Phase 82A implements. `Club.playerIds` stays ownership.

## Update Protocol

The execution loop itself lives in `AGENTS.md` and `docs/PROJECT_RULES.md` and is
not repeated here. When updating this file:

1. Update `Current State` and `Current Active Step`.
2. Mark the step Done in its own step document with a dated handoff note:
   status, outcome, adopted solution, verification, follow-up. **That document is
   where the detail lives**, not this one.
3. Add to `Live Constraints` only what constrains *future* work, and delete
   anything there that has stopped constraining anything.
4. Keep this file under `300` lines. A closed phase's per-step seams are
   candidates: its report owns them once it exists.
