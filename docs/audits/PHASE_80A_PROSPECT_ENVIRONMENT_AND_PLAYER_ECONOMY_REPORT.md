# Phase 80A Prospect Environment And Player Economy Report

Date: 2026-08-01

Status: **Blocked at Step 09.** The player-generation, projection, valuation,
development-audit, beta-reset, and checkpoint work is implemented. Every
Phase-80A-owned non-vacuous gate passes, but the frozen cohort remains `FAIL`
because a match-engine monitor found `80` worlds above the accepted
goals-per-match band. The phase contract does not permit hiding, downgrading,
or recalibrating that result inside Step 09.

## Delivered Scope

Steps 01-08 and the implementation portion of Step 09 delivered:

- a reproducible post-79C/79D calibration epoch;
- season-frozen club tier, reputation, and seven-state environment facts;
- quarterly development over canonical monthly participation evidence;
- one age-aware current/P50/public-upper assessment shared by UI, value, and
  live AI market decisions;
- ceiling-first contextual prospect generation and bounded national
  exceptional stock;
- annual youth intake that preserves the stock contract;
- one context-invariant expected-outcome value curve with a global `EUR 150m`
  cap and no live stored-ceiling advantage for the AI;
- a compact `player-development-cohort` audit, schema-4 atomic checkpoints,
  stable one-world shards, and deterministic resume;
- a feasibility-preserving repair for the deterministic world-21 greedy-XI
  dead end, without introducing the global optimizer owned by Phase 81;
- rejection/deletion of incompatible beta evidence rather than compatibility
  branches or historical player-development storage.

## Frozen 750 x 3 Execution

The exact documented cohort ran with `750` worlds, `3` complete seasons,
`750` one-world shards, and exactly `7` workers.

| Run | Simulated worlds | Resumed worlds | Aggregate hash |
|---|---:|---:|---|
| fresh | 750 | 0 | `a09c10cb2b678140a2de7c4a226faac370c2a73b3e0d143dd9e35859f51f4a03` |
| resume | 0 | 750 | `a09c10cb2b678140a2de7c4a226faac370c2a73b3e0d143dd9e35859f51f4a03` |

The ordered shard hashes are also identical. This proves checkpoint reuse and
deterministic aggregation; it does not turn a failed gameplay monitor green.

Preserved evidence:

- `artifacts/phase80a-step09-player-development-750x3-v1-fresh-report.md`
- `artifacts/phase80a-step09-player-development-750x3-v1-resume-report.md`
- `artifacts/phase80a-step09-player-development-750x3-v1-checkpoints/`

No `50 x 20` was run. That longitudinal release gate remains owned only by
Phase 81 Step 12.

## Player-Model Gate Result

All `32` listed non-vacuous player-development gates pass with positive
denominators where required, `0` violations, `0` failed worlds, and `0`
unexpected not-evaluated worlds. In particular:

- exact and half-star ordering is always
  `current <= P50 <= public upper <= stored ceiling`;
- stored-ceiling breaches are `0 / 2,949,467`;
- generation room, public projection room, and star quantization are measured
  independently;
- young stored-ceiling-six public-value cap breaches are `0 / 6,728`;
- opportunity, zero-minute, observed/unobserved performance, negative/neutral/
  positive environment, and plateau denominators are all positive;
- squad-size and natural-goalkeeper structural checks pass in all `750`
  worlds;
- `81` naturally populated conditioning cells are evaluated, while sparse
  combinations remain explicitly `not_evaluated` rather than passing
  vacuously;
- no structural violation example exists.

## Evidence For The Reported Prospect Values

The fresh v1 population does not reproduce the screenshot pattern where a
sixteen-year-old `3-star -> 6-star` prospect costs about `EUR 1.4m`.

| Opening slice | Observations | Public-value range | Mean public value | Asking-fee evidence |
|---|---:|---:|---:|---|
| age 15-17, current 3, public upper 6 | 1,577 | `EUR 13.76m..28.77m` | about `EUR 18.48m` | 526 observations, `EUR 21.12m..45.98m`, mean about `EUR 28.05m` |
| age 18-20, current 4, public upper 6 | 49 | `EUR 36.83m..54.62m` | about `EUR 42.63m` | no naturally observed asking-fee cell |

The opening age-15-to-20 ceiling-six stock is `3,364`, or `4.485` players per
world, matching the accepted `4..5` young exceptional-prospect target. The old
low-value cases are therefore not evidence from the corrected fresh cohort;
they are consistent with an incompatible beta save or an earlier model epoch.

## Potential Visibility And Development Evidence

The public upper remains in the same half-star bucket as current for only
`1,421 / 361,207` opening age-15-to-17 players (`0.393%`) and
`32,582 / 324,846` opening age-18-to-20 players (`10.03%`). For age 21-23 the
share rises to `79,509 / 92,668` (`85.80%`): exact upside still exists, but the
approved post-20 public narrowing plus half-star quantization makes much of it
invisible. Across all checkpoints, `670,447` observations explicitly prove a
positive exact gap hidden within the same star bucket.

The three-season development distributions are descriptive by the frozen
contract and therefore are not a pass/fail band:

- age 15-17 visible plateau: `311,393 / 311,721` (`99.895%`); exact non-growth:
  `300,321 / 311,721` (`96.343%`);
- age 18-20 visible plateau: `166,880 / 167,572` (`99.587%`); exact non-growth:
  `125,395 / 167,572` (`74.831%`).

The dominant observed condition is lack of senior opportunity: roughly
`99.80%` of opening age-15-to-17 players and `99.06%` of opening age-18-to-20
players record zero minutes. Naturally populated regular/full-exposure cells
do show positive development. The evidence therefore distinguishes a working
development transition from a world-level youth-opportunity problem; Step 09
does not invent a favourable plateau threshold after seeing the sample.

## Blocking Finding

The report-wide failure comes only from `goals_per_match_avg`, classified in
advance as a `monitor`:

- `36` worlds pass;
- `634` worlds warn;
- `80` worlds fail, all on the high side at approximately `3.21..3.33` goals
  per match;
- the all-world mean is approximately `3.117` goals per match.

The anomaly contract permits only a raw `story` failure to project to a world
warning. A `monitor` failure keeps its severity. Step 09 also forbids changing
the threshold, seeds, denominator, anomaly status, or warning semantics after
the frozen run. Match scoring is not owned by the current player-model step,
so this cannot be repaired without a documented scope/ownership decision.

Consequently the required post-report `pnpm check`, web build, dependency
cruise, visual QA, and Phase 80B handoff were not run or claimed as phase-
completion evidence. `git diff --check` remains clean and the mandatory
Graphify index was refreshed after code changes, but those housekeeping checks
do not constitute the unmet integrated closeout. The pre-run focused suites
and typechecks were green, but they do not override the failed cohort gate.

## Required Decision

Phase 80A remains blocked and Phase 80B must not start until one of these paths
is explicitly documented:

1. add a narrow owning remediation before Phase 80A closeout and rerun the
   unchanged required gate; or
2. amend the phase acceptance contract so the raw match-engine failure remains
   visible and is carried to its named future owner without pretending the
   current report passed.

The second path avoids calibrating a match formula immediately before Phase 81
reworks that same engine, but it is a product/phase-order decision and is not
adopted by this report.
