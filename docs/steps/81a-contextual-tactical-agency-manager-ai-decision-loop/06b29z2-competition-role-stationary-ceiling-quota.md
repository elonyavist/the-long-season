# Step 06B29Z2 — Competition-Role Stationary Ceiling Quota

## Status

Planned and active. Product candidate plus paired checkpoint.

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

## Expected Files

- `packages/content/src/generators/career-intake-players.ts` and test;
- `packages/content/src/generators/player-potential-allocation.ts` and test if
  the existing constructive floor needs a public content-owned entry;
- `packages/content/src/generators/player-generation-bands.ts` or one adjacent
  content asset owning the total target table, and test;
- simulation-report career facts, attribution, registry/planner tests and i18n;
- this document, generated audit/index, phase README and status.

No engine/domain/storage/web/save change, new report entrypoint, class relabel,
global uplift, output-conditioned rule or compatibility shim.

## Required Checks

Focused equivalence/reachability tests, typecheck, paired in/out-of-sample 7x10
runs with exactly seven workers, byte-identical report rebuilds,
`git diff --check`, graphify update and `pnpm check` alone.
