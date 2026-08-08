# Step 06 - Checkpoint B: Structural Counter-Move Ceiling

## Status

**Done on 2026-08-08 — `STOP / RETHINK`.** Steps 04-05 are Done. The isolated Step 05 exit run held
`concededExpectedGoalsReduction` at `0.2088`/`0.2287` and
`ownLossPerConcededReduction` at `1.1659`/`1.6721` on the in-sample and
out-of-sample A2 sets, respectively, with exactly seven workers.

The checkpoint consumes `opportunity-route-plan-bps-v1` through
`opportunityRouteStrategicSignature(...)`. Do not create a second signature,
reconstruct stored capacities, or add `lateralFocus` to the formation catalog.
The signature already includes allocation, resistance, exposure, saturation,
weights, quality, budget, volume and control in deterministic route order.

## Goal

Prove the model contains stable non-transitive Leverage before player-task,
manager, AI, or UI work begins.

## Analytic Gate

On the complete strategic-signature matrix:

- group only complete basis-point-identical signatures;
- freeze the normalized facts, scale/clamp rule, tie-breaks and material-arc
  threshold before reading matrix outcomes; none may use win share or best
  response identity;
- enumerate all effective contexts and cycles above that material threshold;
- require `R / N_eff >= 0.25`;
- require `best_response_ubiquity_multiple <= 4`;
- preserve all three original `no_dominant_*` readers and `0.55`;
- require at least one material cycle that survives the declared tactic
  variants and no analytically dominant row;
- report both tangent quantities when either fails.

## Frozen Phase-1 Protocol Before Implementation

This protocol was written before any complete matrix output existed.

- The raw action space is exactly `23 formations x 3 tactic profiles x 3
  lateral focuses = 207` actions. The tactic profiles are the already-authored
  `high_pressing`, `direct_play`, and `low_block` rows from the Phase 81 tactic
  population; this checkpoint does not create a second table of their values.
- A strategy's equivalence evidence is its ordered vector of existing
  `opportunity-route-plan-bps-v1` signatures against all `207` opponent
  actions. Two strategies are equivalent only when every element is identical.
  The checkpoint does not hash, truncate, or encode a second signature.
- The analytic payoff is versioned as `phase81a-b-analytic-threat-v1`. For each
  side it derives a possession claim from the two plan control multipliers,
  applies that plan's direct counter relief to the possession it does not own,
  and multiplies the result by its volume, expected route saturation, and the
  route-weighted `0.5 + qualityEdge`. The two non-negative threats are then
  normalized to one share and rounded once to basis points. A zero/zero pair is
  exactly `0.5`. No match result, catalog rank, or response identity enters it.
- Best-response ties use canonical `actionId`; equivalent raw actions first
  collapse to the lexicographically first representative. A material arc is
  frozen at `100` basis points above even (`>= 0.5100`). A surviving cycle means
  that each of the three declared tactic profiles has at least one three-cycle
  whose three arcs all meet that same threshold. A dominant row is one that is
  strictly above even against every other effective signature.
- Conservation is evaluated exactly, not within a tolerance: for each opponent
  and formation, changing only own tactic/focus must leave the route budget
  bit-identical. Any mismatch blocks `GO` before a cycle is considered.
- Opponent columns are partitioned in canonical round-robin order across
  exactly `7` worker threads. Worker count may change wall clock only; merging
  restores canonical opponent order before grouping or tie-breaking.
- If Phase 1 fails, replay is `not_run_by_protocol` and the command records
  `STOP / RETHINK` for a transitively dominant matrix or `REFINE` when material
  reversals exist but diversity, ubiquity, or stability fails. No replay seam is
  added merely to exercise code the protocol forbids from running.

If Phase 1 passes, Phase 2 remains frozen at at most `32` deterministic
farthest-first contexts, `8` paired selection seeds per candidate and `207`
paired replay seeds per context. Selection uses
`phase81a-b-selection-v1`; replay uses the disjoint
`phase81a-b-replay-v1`. The context-free arm cycles uniformly through all
effective responses on the same replay pairs used by best and exposed arms.
The three original dominance readers retain their original populations,
`8`/`1050`/`250` paired counts and `0.55` threshold. A preflight can revise only
the wall-clock estimate, never these populations, seeds, counts, or targets.

## Cross-Validated Replay

Select at most `32` deterministic stratified contexts from signature distance,
covering every lateral focus and tactic profile. Freeze IDs and weights before
Monte Carlo. An explicit oracle selects best, exposed, and context-free policy
on one stream; an independent stream replays them.

Both the complete analytic enumeration and the replay are deterministically
sharded across exactly `7` workers inside this single isolated gate.

Targets:

- `counter_move_ceiling >= +0.045`;
- `counter_move_exposure <= -0.045`;
- context-free `|delta| <= 0.015` with interval compatible with zero.

The oracle measures model ceiling, never manager agency.

## Expected Files

- `docs/audits/PHASE_81A_CHECKPOINT_B_STRUCTURAL_CEILING.md`
- `docs/audits/README.md`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/tactical-shape/tactical-shape-audit.ts`. Its
  existing tactic population is exported so Checkpoint B reuses the authored
  profiles rather than copying their values.
- `packages/simulation-tools/src/index.ts`. Public structural-checkpoint types
  and functions cross the package boundary here; deep imports are refused.
- `apps/cli/src/commands/simulation-report/tactical-agency-section.ts`
- `apps/cli/src/commands/simulation-report/tactical-agency-structural-worker.ts`
  **(new)**. Analytic opponent columns are independent work items; this narrow
  entrypoint is what makes the declared seven-worker execution real rather than
  metadata on a synchronous loop.
- `apps/cli/src/commands/simulation-report/report-registry.ts`
- `apps/cli/src/commands/simulation-report/report-registry.test.ts`
- `apps/cli/src/commands/simulation-report/report-planner.test.ts`
- `packages/i18n/src/labels.ts`. The registered profile is visible in
  `--list-profiles`, so its title and description use the five-language label
  catalog rather than hardcoded CLI prose.
- `docs/PROJECT_STATUS.md`
- this step document
- `README.md`. The phase status and ordered-step gate must record the STOP
  rather than continuing to advertise Step 06 as the next action.
- `07-player-task-execution.md`

## Required Checks

```bash
nvm use 24
pnpm cli simulation-report --profile=phase81a-b --workers=7
pnpm check
git diff --check
```

## Decision

GO opens Step 07. REFINE reopens only 04/05 without moving targets. STOP keeps
all downstream steps closed when the matrix remains transitively dominant or
the replay gain exists only on selection seeds.

## Outcome And Handoff

The complete Phase-1 matrix returned `STOP / RETHINK` before any Monte Carlo
stream opened:

| reading | target | observed |
|---|---:|---:|
| raw actions | exactly `207` | `207` |
| `N_eff` | derived | `198` |
| conservation mismatches | `0` | `0` |
| `R / N_eff` | `>= 0.25` | `2 / 198 = 0.010101...` |
| ubiquity multiple | `<= 4` | `121` |
| material cycles across tactic variants | `3 / 3` | `0 / 3` |
| dominant effective rows | `0` | `1` |

`4-2-3-1|high_pressing|balanced` covers `121` uniform contexts and is strictly
above even against every other effective signature; its mean/minimum analytic
shares are `0.5380`/`0.5009`. The only other best response is
`4-2-3-1|direct_play|balanced`, covering the remaining `77` contexts. No
lateral commitment is ever a best response.

The gate used seven real opponent-column workers and completed its analytic
producer in `1775.447416 ms`. The command's real exit was `1`; Phase 2 is
`not_run_by_protocol`, so no replay or original Monte Carlo dominance reader is
reported as passed or failed. The detailed population, formula, tie-breaks and
decision are in
[`PHASE_81A_CHECKPOINT_B_STRUCTURAL_CEILING.md`](../../audits/PHASE_81A_CHECKPOINT_B_STRUCTURAL_CEILING.md).

The preflight also proved that `simulateMatch(...)` cannot yet consume a
non-balanced lateral focus. Because Phase 1 failed, no analysis override or
future persistence field was added. That seam becomes mandatory only after an
authorized structural redesign earns a new Phase-1 pass.

Step 07 remains closed. This is not a licence to tune a coefficient until the
same formula turns green: the design must first explain how opponent allocation
locally counters own allocation. Every numeric target and the material
`100 bp` arc remain frozen for an authorized retry.

Design Contract Amendment A1 authorized that retry without erasing this
finding. Step 06A first guarantees balanced squad-identity coverage inside each
competition and freezes the MVP AI decision boundaries. Checkpoint L1 / Step
06B then verifies `100 x 10` longitudinal worlds and produces canonical JSON
plus the consultable HTML. Checkpoint B2 / Step 06C treats the formation
selected from a real squad as context and
enumerates only `tactic profile + lateralFocus` as the counter-response. It
retains every numeric target and seven-worker rule above. Step 06A is the only
next action; Step 07 remains closed until L1 and B2 both record `GO`.

Focused structural/registry verification passed `27` tests. Final isolated
`pnpm check` passed `294` test files / `2232` tests, all workspace typechecks,
`857` modules / `3526` dependencies with no violation, localization and the
single-report-entrypoint guard.
