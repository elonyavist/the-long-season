# Step 06B29Z2 — Competition-Role Stationary Ceiling Quota

## Status

Done on 2026-08-12: **`STOP / RETHINK`; candidate removed.**

## User-Facing Reason

Only `30.69%` of annual academy candidates can ever reproduce the opening
senior median, and routine prospects own `94.24%` of that deficit. The career
therefore consumes established quality faster than it authors replacement
potential. This step tests a stationary newgen distribution rather than more
stars or a global ability boost.

## Product Contract

Content owns one versioned stationary role-ceiling target for every division
and canonical role. Targets are the L6.29A median-of-seven opening-senior cell
medians, rounded to the nearest `0.25` ability point. Before rounding, each role
median is clamped to `+/-0.50` around its division's median role value so a
sparse positional outlier cannot become league policy. The complete table is
frozen before implementation in the content asset and validated as total.

For each world-season, division and role, after all annual prospects are
generated:

1. count every candidate whose authored stored ceiling reaches the target;
2. set the required capable count to `ceil(candidateCount * 0.50)`;
3. if there is a shortfall, choose exactly that many below-target **routine**
   candidates by a dedicated stable seeded rank plus player ID tie-breaker;
4. raise only their potential profile to the role target, bounded strictly
   below the six-star floor;
5. leave current ability, age, position, role, prospect class, target club,
   candidate count and all interesting/serious/rare/exceptional decisions
   unchanged.

No club is guaranteed its own successor. Allocation is competition-role wide,
so strong replacement potential can emerge at any club and later selection,
development and transfers still decide careers. No cross-role or
cross-division fallback is allowed; a cell without enough routine candidates
is reported and fails closed.

## Frozen Paired Checkpoint

Control and candidate use the same seven L6.29A seeds, ten seasons and exactly
seven workers, plus a preregistered seven-seed out-of-sample set. Candidate
requires:

- generation-time stationary-capable share `>= 0.48` in aggregate and in at
  least `5/7` worlds in both sets; `0.48`, not exact `0.50`, permits hard-cap
  feasibility and accepted-intake filtering without making the gate vacuous;
- L6.27 season-ten stationary-ready share improves by at least `+0.08` and the
  ceiling-gap share falls by at least `0.08`, same direction in `5/7` worlds;
- generated-leader share improves by at least `+0.03`, same direction in `5/7`
  worlds;
- identical candidate, division, role and prospect-class counts between paired
  arms; zero current-ability change and unchanged national six-star stock;
- no newly failing integrated gate and zero quota, role, origin or acceptance
  reconciliation failure.

Structural mismatch is `STOP / RETHINK`. A reachable clean candidate missing a
material transition is `REFINE` and is removed. `GO` ships the content rule;
it does not claim the renewal problem closed until the integrated gates pass.

The paired execution is staged to avoid spending a second long cohort on a
candidate that is already disproved. The in-sample pair is the first rejection
gate. The out-of-sample pair runs only if every in-sample structural and
material-transition gate passes. An in-sample `REFINE` therefore records the
out-of-sample arm as `not_evaluated`, never as a pass and never as missing
evidence for a candidate that had already failed. This ordering was frozen
before the first L6.30 product run.

### Invalid First Pair

The first in-sample pair is invalid and cannot support a product conclusion.
The registry built the `control`/`candidate` mode, but
`CareerWorldProjectionInput` did not carry it across the worker boundary. Both
arms therefore ran the enabled product default. The reconciliation correctly
returned `STOP_RETHINK`: `2,527` assignments were reported while paired
generation facts changed zero potentials and every downstream delta was zero.
The contaminated `facts-v1` caches are superseded, never read again. `facts-v2`
adds the missing typed worker field and reruns both arms from fresh worlds.

## Expected Files

- `packages/content/src/generators/career-intake-players.ts` and test;
- `packages/content/src/generators/player-potential-allocation.ts` and test if
  the existing constructive floor needs a public content-owned entry;
- `packages/content/src/generators/player-generation-bands.ts` or one adjacent
  content asset owning the total target table, and test;
- `packages/content/src/index.ts` if that asset needs the existing public
  content boundary; it may export the one owner, never a duplicate table;
- simulation-report career facts, attribution, registry/planner tests and i18n;
- this document, generated audit/index, phase README and status.

No engine/domain/storage/web/save change, new report entrypoint, class relabel,
global uplift, output-conditioned rule or compatibility shim.

## Required Checks

Focused equivalence/reachability tests, typecheck, paired in/out-of-sample 7x10
runs with exactly seven workers, byte-identical report rebuilds,
`git diff --check`, graphify update and `pnpm check` alone.

## Outcome

The valid `facts-v2` pair changed `2,527` routine potentials. Generation-time
stationary share improved `0.3069 -> 0.4232`, season-ten ready share improved
`0.2189 -> 0.2822`, the ceiling-gap share fell `0.9232 -> 0.8778`, and generated
leaders rose `0.2714 -> 0.3405`. Those are real effects, but they miss the
frozen `0.48`, `+0.08`, `0.08` and `5/7` coherence requirements. The candidate
also changed later role/class populations, national six-star placements
`154 -> 148`, and introduced `players:top_ten_assist_mean` as a new failure.

The content rule, report profiles, analysis seam and tests were removed in the
same step. The generated artifacts remain ignored evidence; the durable account
is
[`PHASE_81A_CHECKPOINT_L6_30_STATIONARY_CEILING_QUOTA.md`](../../audits/PHASE_81A_CHECKPOINT_L6_30_STATIONARY_CEILING_QUOTA.md).
L6.30 proves potential supply has leverage, while rejecting a state-conditioned
quota as its owner. Step 06B29Z3 tests an individual, stable authored runway for
routine youth.
