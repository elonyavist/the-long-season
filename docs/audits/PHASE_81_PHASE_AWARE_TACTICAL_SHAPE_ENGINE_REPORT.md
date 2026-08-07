# Phase 81 - Phase-Aware Tactical Shape And Manager Decision Engine Report

Closing report. Written 2026-08-07, on the cohort that ran and replayed
2026-08-06.

The governing contract is
`PHASE_81_PHASE_AWARE_TACTICAL_SHAPE_AND_MANAGER_DECISION_ENGINE_DESIGN_CONTRACT.md`.
Per-step detail lives in the fifteen step documents; this file records what the
phase delivered, what it measured, what it did not deliver, and what the next
owner receives.

## What This Cohort Proves And Does Not Prove

It proves the accepted tactical match engine over twenty seasons: competition
stability, player and economy behaviour at the long horizon, and the goal rate
carried in from Phase 80A.

**It is not market evidence.** Under the 2026-08-02 phase order the market work
follows this phase, so this cohort observed a world with **no loans, no market
postures, and no competitive races**. Phase 82B Step 09 owns a second cohort for
those. No later phase may reuse these numbers as market evidence.

**It is also not formation evidence, and that is a deliberate scope decision
recorded rather than worked around.** `ten-season-report` fields `4-4-2` for
every club unless an inspection hook supplies a per-club shape
(`apps/cli/src/commands/ten-season-report/report-data.ts:4127`), and the frozen
command exposes no flag for it. Every one of these 1000 seasons was played in one
formation. See *The Tactical Observation Line* below.

## The Cohort

Frozen command, run verbatim, twice.

```bash
pnpm cli ten-season-report \
  --seed-prefix=phase81-tactical-shape-50x20 \
  --worlds=50 \
  --seasons=20 \
  --checkpoint-dir=saves/long-run-checkpoints/phase81-tactical-shape-50x20 \
  --shards=50 \
  --workers=7 \
  --report-output=docs/audits/PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md
```

| Reading | Value |
|---|---|
| Worlds x seasons | `50 x 20`, `1000` total seasons |
| Execution | `workers=7`, `shards=50`, one world per shard |
| First run | `resumed=0`, `resumed_worlds=0`, `simulated_worlds=50` |
| Replay | `resumed=50`, `resumed_worlds=50`, `simulated_worlds=0` |
| Partition hashes | `50`, identical and in identical order across both runs |
| Report diff, first run against replay | **one line of `1493`** |

The single differing line is the `Execution:` line, which reports whether work
was resumed. It is the one line that *must* differ between a run and its replay;
every fact in the report is byte-identical. This satisfies the Definition of
Done line "Replay reuses checkpoints and reproduces report facts."

Wall clock for the first run was approximately `2h 54m`, a steady `~17` worlds per
hour with no slowdown across the horizon. The replay returned immediately.

The generated cohort report is `PHASE_81_TACTICAL_SHAPE_50X20_REPORT.md`. Its
own title line still reads "Phase 80A Prospect And Player-Economy Bounded Gates
Report", because the long-run instrument is shared and its heading is not
parameterised by caller. Recorded as an observation, not fixed here: this step
may not make production changes.

## The Carried Monitor - A7, Closed

`goals_per_match_avg` was inherited from Phase 80A unchanged - same threshold,
same denominator, same severity class - and this phase accepted ownership of it.

| Population | Mean | p95 | Result |
|---|---|---|---|
| Phase 80A Step 09, `750` worlds | - | - | `36` pass / `634` warn / `80` fail, every failure high |
| Phase 81 Step 13, **two worlds** wearing a twenty-world label | `2.760` | `2.840` | in band |
| Phase 81 Step 14, `20 x 10` | `2.720` | `2.810` | `20/0/0` |
| **Phase 81 Step 15, `50 x 20`** | **`2.670`** | **`2.740`** | **`0` of `50` worlds fail** |

Band `2.3 .. 3.0`, unchanged. The monitor appears in no world's failing column
and in no world's warning column.

**It is closed on genuine evidence at cohort scale.** Nothing was widened, no
denominator moved, no severity reclassified. The recorded Step 06-versus-Step 07
disagreement about which step moved the rate stays unresolved on purpose: it was
moot once the monitor passed, and it does not return, because the condition that
would have returned it - out of band at cohort scale - did not occur.

## Failing Checks, And Who Owns Them

The command exits `1` and the report reads `Status: FAIL`. **Neither is the
verdict on this phase.** The failing-check counts are:

| Check | Worlds | Class | Owner |
|---|---:|---|---|
| `player_economy_young_stored_ceiling_six_stock_arrival_category_placement` | `50/50` | Phase 80A | **unowned**, carried, not this phase's |
| `contract_finance_structural_integrity` | `13/50` | Phase 79 | **unowned**, named by Step 14 |
| `preliminary_agreement_integrity` | `12/50` | Phase 79 | **unowned, new to the record** |

**No tactical check and no match-engine check is red.** All three belong to the
player-economy and market work, which this phase did not touch and may not fix.

`preliminary_agreement_integrity` is new here. It lives beside the other in
`packages/simulation-tools/src/long-run/contract-finance-stability.ts:742`, is a
`structure`-class check reading `preliminaryAgreementViolationCount` with the rule
`pass 0; fail >0`, and it concerns preliminary (pre-contract) agreements - Phase
79 market behaviour.

**It is named and handed over, not adopted.** The horizon is the likely reason it
appears now: this cohort runs twenty seasons where Step 14's ran ten, and its
companion `contract_finance_structural_integrity` moved from `1` of `20` worlds
at ten seasons to `13` of `50` at twenty. Rare structural violations accumulate
with horizon. That is a hypothesis this phase states and does not test, because
testing it is market work.

Aggregate contract/finance structural violations across the cohort: `14`, spread
over `13` worlds.

## Warnings

Visible and truthfully classified, none suppressed.

`senior_active_player_population=50`, `total_active_player_population=50`,
`youth_active_player_population=50`, `free_agent_population_share=39`,
`champion_streak=6`, `table_points_spread_avg=3`.

Signal check counts: `monitor=150`, `structural=39`, `story=9`.

## Football Readings At Twenty Seasons

Recorded because no cohort had ever observed this engine at this horizon.

| Reading | Value |
|---|---|
| Table spread average | `38.64` |
| Table spread, lowest world average | `34.70` |
| Draw rate average / world maximum | `0.270` / `0.280` |
| Champion streak, maximum observed | `6` |
| Top assist maximum, p95 | `15` |
| Minimum squad size observed | `18`, `0` clubs below minimum |
| Clubs without a natural goalkeeper | `0` |
| **Role coverage warnings** | **`5579` total, p95 `119` per world** |
| Club ability spread, first to last season | `~6.0..6.9` collapsing to `~2.5..3.1` |

Two of these matter beyond bookkeeping.

**The role coverage warning count is the seven-of-ten role defect measured at
scale for the first time.** The world generates no `attacking_midfielder`, no
`defensive_midfielder` and no `wide_midfielder`, while `12` of the `23` curated
shapes need the first. It was known from Step 11 and unowned; `5579` warnings
over `1000` seasons is the size of it. Still unowned, and still not this step's.

**The ability spread collapse confirms the A10 clarification empirically.** Club
inequality more than halves across twenty seasons, which is exactly why Step 12's
inspection was specified as `20 x 5` rather than `5 x 20`: a long horizon measures
a world whose clubs have stopped being unequal.

## The Tactical Observation Line - Not Met As Written

Step 15's *What To Implement* asks for tactical long-run observations - formation
and route diversity, extreme-shape frequency, tactic-change frequency, route and
goal distribution - and its Definition of Done asks that "existing **and
tactical** structural gates have positive observations and pass."

**That line is recorded as not met, rather than satisfied by a vacuous gate.**

The reason is structural, not an oversight. The long-run report holds the
formation still for every club by design, so a formation-diversity observation
over this population would read `1` by construction and an extreme-shape
frequency would read `0`. The phase's own Definition of Done states that bounded
diagnostics cannot pass on zero observations. Adding those observations here
would have produced numbers that look like coverage and prove nothing - the exact
failure mode the Reachability rule in `AGENTS.md` exists to prevent, and the same
one that A9 and `permittedRegression` are the recorded precedents for.

The alternative was considered and rejected with reasons: supplying a per-club
shape through the existing `formationForClub` inspection hook, as Step 12's A10
run did, would have produced tactical observations, but it would also have
measured the carried monitor on a population different from the `36/634/80` it
must be reported beside, at the exact moment the monitor is being closed. The
monitor is why this cohort exists.

**The phase's tactical evidence is therefore the bounded scenario audit, not this
cohort** - `tactical-shape-report` and the Step 13/14 diagnostics, where every
frozen invariant passes on multiple seed populations with positive denominators.
That evidence is not weakened by this line; it is simply where it lives.

Nothing was re-thresholded to make this read as delivered. This follows the
precedent Step 14 set when it recorded its own central target as not met.

## What Phase 81 Delivered

Detail is in the step documents; this is the inventory.

- One deterministic aggregate per-minute match engine, preserved. `TeamStrength`
  remains player quality and is not tactical shape.
- Typed tactical slot context across every seam, with the web four-department
  information collapse removed (Steps 02, 13).
- Intrinsic tactical shape as its own deep module, with diminishing returns and
  bounded saturation, emitting no universal formation score and no named
  extreme-formation penalty (Step 03).
- Relational phase and channel matchup over five frozen routes, with the
  left-is-their-right mirror written in exactly one place (Step 04).
- Position suitability acting on coordinated execution only, structurally
  incapable of double-penalising, because `teamStrengthFromSlotScores(...)`
  ignores it (Step 05).
- Phase-aware opportunity routes replacing scalar/texture-only generation,
  bounded football semantics for every existing tactic knob, and the match RNG
  keyed by `(worldSeed, fixtureId)` (Step 06, A5).
- Causal route quality and causal actors selected before outcome, without
  autonomous agents (Steps 07, 07A, 07B).
- One live-session and persistence path, schema `23` / envelope `14`, with the
  beta reset taken rather than a compatibility branch (Step 08).
- AI whole-XI selection for every club in the world through one door, on one
  selection scale, with shape chosen on `structuralScore` and the eleven on
  `score` (Step 09, A2, A6).
- Qualitative pre-match and live tactical consequence UI, with capacities shown
  as ratios against an ordinary reference so a reading describes the shape and
  not the squad (Step 10).
- A season recap instrument with fourteen bands declared before any output
  existed (Step 11).
- A `20 x 5` engine inspection under A10, fourteen findings, changing nothing
  (Step 12).
- Non-vacuous bounded diagnostics and integrated gates, every frozen invariant
  green on three populations, A7 discharged (Step 13).
- The formation-versus-formation matrix over the whole `23`-shape catalog and the
  `no_dominant_formation` gate, plus the forced-shape crash fix (Step 14).

Measured, from Step 07B and reconfirmed by Step 13:

| Manager decision | Edge over an even contest |
|---|---|
| fielding a broken shape (`0-0-10`) | `0.4852` |
| one division tier of squad quality | `0.2521` |
| tactic sliders, best setting against worst | `0.0858` |
| an adjacent squad-quality gap between two top clubs | `0.0467` |

## What Phase 81 Did Not Deliver

**Formation as a counter-move.** Step 14's central target - `~0.047` win share
for choosing the right shape against the opponent you face - was measured at
`0.0064` and `0.0117` on two seed prefixes against a `0.0295` noise floor, and
withdrawn rather than deferred. The lever the step was permitted to pull was
swept over `57` configurations and produced a strictly transitive matrix in every
one.

There is a real formation ordering - `4-2-3-1` tops both prefixes at `0.5184` and
`0.5210`, reproducibly, worth roughly `1.5` league points a season to pick blind -
but it is a property of the shape, not of the opponent, which is the one thing the
step was forbidden to reward.

**The diagnosis has since been carried one level deeper, and is recorded here for
its next owner.** Step 14's F4 observed that route advantage tracks mean capacity
across the `23` shapes. The mechanism is visible in the code:

- `deriveTacticalShapeProfile(...)` computes each of the twelve capacities in an
  independent loop over the same eleven slot scores
  (`packages/engine/src/match-engine/tactical-shape.ts:118`), differing only by a
  role-and-task weight, a channel share, and a suitability multiplier.
- `diminishedTotal(...)` is monotone increasing in every contribution by
  construction, as its own doc comment states
  (`packages/engine/src/match-engine/tactical-shape.ts:180`).
- `validateContributionWeights(...)` constrains those weights to be complete,
  non-negative, zero for the goalkeeper, and **non-zero for every outfield role on
  every task** - and imposes **no constraint on their sum**
  (`packages/domain/src/balance/match-tactics-calibration.ts:833`).

With no shared budget, nothing subtracts from one capacity when another rises, so
a role can simply be better at everything and a shape built from such roles is
better at everything. Ranking by route advantage then *is* ranking by mean
capacity, and the matrix is transitive by construction. No downstream coefficient
can break that, which is why the `57`-configuration sweep found no 3-cycle.

Two consequences for whoever takes it, both stated as hypotheses this phase did
not test:

- A conservation law - constraining each outfield role's weights to a fixed sum
  across tasks - would make the trade-off exist. It may only relocate the dominant
  strategy rather than remove it, because `saturate(r) = r / (r + reference)` is
  concave and a balanced allocation therefore maximises the sum of capacities.
  That is a testable prediction to declare before measuring, not a defect.
- **Step 14's finding does not rule out `routeSelectionSharpness` after
  conservation.** Its sweep ran over a population whose capacities were positively
  correlated, where no sharpness setting could produce a cycle. "The lever is
  wrong" is true of today's capacities and not necessarily of conserved ones.
  Order matters: conservation first, then re-measure.

The other half of the counter-move remains as Step 04 and Step 14 left it: the
**lopsided population**. Left against right is the one axis where these capacities
genuinely trade off, and the curated catalog is symmetric. Note that asymmetry
cannot come from the weight table - weights are declared per task, not per
capacity, precisely so that left/right mirror symmetry is structural
(`packages/domain/src/balance/match-tactics-calibration.ts:63`). It can only come
from where players stand, through `slot.side` and the channel policy. The two
halves therefore touch two different seams, and the handoff's requirement that
they be taken together stands.

## Background-World Seams Handed To Phase 81B

Phase 81B is already scoped under
`docs/steps/81b-season-anchored-contracts-free-agent-economy-and-background-fixtures/`.
Its entry gate is confirmed: the carried monitor is inside band at cohort scale,
no loan, posture or race behaviour was introduced, and the four seams it consumes
exist.

- **One named squad-depth accessor.** `fieldablePlayerIds` owns squad depth and
  `playerSquadDepartment` owns a player's department, each with an absence
  assertion in `pnpm check`. The A6 assertion **enumerates nine files and
  therefore cannot see a tenth**; Step 13 found three readers outside it
  (`career-squad-adapter.ts:245`, `formation-fit-output.ts:108`,
  `report-data.ts:4106`). Nothing differs today, and Phase 82A's loan change is
  where that stops being true. Step 02 owns making the check discover rather than
  enumerate, and it is not done.
- **A context constructor taking an explicit squad.** `assembleMatchTeamContext(...)`
  writes the only `MatchTeamContext` literal and accepts the players who will
  play, rather than deriving them from a club.
- **The non-selected club as an ordinary caller.** Building a context for a club
  the user has not selected is a named case of the single constructor, not an
  afterthought (A1).
- **Match RNG keyed by `(worldSeed, fixtureId)`** (A5), which is what makes
  background fixtures safe to resolve in any order.

Also handed over: match facts and statistics attribute to the club a player was
**fielded by**, not the club holding his contract (A8), so Phase 82A can introduce
loans without rewriting recorded history.

Two Phase 81B items named for the handoff: the contract-duration representation
change, and the simulate-match command as the background-fixture resolution
point.

## Residual Monitors And Unowned Findings

Carried out of this phase, none of them new obligations for it:

- `player_economy_young_stored_ceiling_six_stock_arrival_category_placement`,
  `50/50` worlds, Phase 80A, unowned.
- `contract_finance_structural_integrity`, `13/50` worlds, Phase 79, unowned.
- `preliminary_agreement_integrity`, `12/50` worlds, Phase 79, unowned and new to
  the record.
- **The seven-of-ten role generation.** Unowned. `5579` role coverage warnings
  over `1000` seasons is its first measurement at scale.
- **The A6 absence assertion enumerates rather than discovers.** Step 02's, open.
- **Incomplete `presentationMessageKey` families.** Only observation labels use
  template literal types, so the others can crash at runtime and
  `check:localized-text` misses them. Unowned, from Step 10.
- **`wide journey` browser assertion is timing-sensitive.** It waits on `"real"`
  playback rather than a controlled clock and failed once on an idle machine while
  passing alone and on a full re-run. Playwright stops at the first failure, so one
  flake hides `33` tests. Owned by whoever owns the live playback surface.

## Corrections To The Record Made Here

- **`pnpm cli ten-season-report` resolves output paths from the workspace root**,
  not from `apps/cli/`. `resolveWorkspaceOutputPath(...)` walks up to
  `pnpm-workspace.yaml` (`apps/cli/src/commands/ten-season-report.ts:176`). The
  warning in `docs/PROJECT_STATUS.md` that this command writes relative output
  under `apps/cli/` was stale for this command and is corrected. It may still hold
  for other CLI commands, which were not checked.
- The exit code remains untrustworthy as a verdict: the command exits `1` on
  unowned pre-existing checks. Read the failing-check counts.

## Phase 79 Handback

Phase 79 Step 14 remains **Reopened, paused, unrun and unclaimed**. This phase did
not run it and does not claim it.

Two of its checks are red in this cohort - `contract_finance_structural_integrity`
at `13/50` and `preliminary_agreement_integrity` at `12/50` - and both are named
in its step document by this report rather than adopted here.

## Verification

- `pnpm check` green on the clean tree before the cohort ran, and again after the
  documents were written.
- Frozen command run verbatim twice; replay proved checkpoint reuse with a
  one-line report diff and `50` identical partition hashes.
- `git diff --check` clean.
- `graphify update .` run.
- No production file was modified by this step. The working tree carried no engine
  change between the run and the replay, which is what makes the replay a proof of
  determinism rather than of luck.

## Phase Status

**Phase 81 is complete**, with the tactical observation line of Step 15
explicitly recorded as not met and the reason recorded with it.

Phase 81A is the only next owner.
