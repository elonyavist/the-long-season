# Step 06B29Z3 — Routine-Youth Stationary Runway

## Status

Planned and active. Product candidate plus paired checkpoint.

## User-Facing Reason

L6.30 proved that more credible routine potential creates more ready players
and generated leaders, but its annual quota read and rewrote the mutable intake
population. Routine youth instead need one stable authored ceiling lane: the
same player identity receives the same ceiling fact regardless of how many
other vacancies exist that season.

## Product Contract

Add one versioned `normal_youth` runway policy beside the existing contextual
prospect-ceiling policy. It does **not** relabel routine players as interesting,
serious or rare. It selects a deterministic lane from only stable player facts
(`worldSeed`, player ID, division and role), then constructs potential through
the canonical bounded allocator.

The lane is an individual distribution, never a quota:

- no counting, sorting or selecting relative to other candidates;
- no read of club vacancies, senior medians, match output or later career state;
- no new RNG consumption outside its own derived stream;
- current ability, age, position, role, class, club and exceptional allocation
  remain owned by their existing policies;
- the potential ceiling remains strictly below the six-star floor.

Targets are the robust stationary reference table, derived only from the L6.29A
control population before this implementation: the `75th` percentile of the
seven opening role medians, rounded to `0.25`, then clamped to `+/-0.50` around
the division median. Exactly half of routine youth enter the runway lane by a
`5,000` basis-point stable draw; the other half retain the current reachable
allocator unchanged. These choices are frozen before product output and are
not retuned from L6.30.

## Paired Measurement Contract

The in-sample control/candidate pair runs first over seven worlds, ten seasons
and exactly seven workers. Out-of-sample runs only after in-sample `GO`.

Immediate purity is evaluated where the rule acts: for season-one generated
players, IDs, counts, division, role, class, club and current ability must be
identical; changed potential must equal the declared runway assignments; no
potential may fall; and exceptional placements must match. Later population
divergence is a measured career consequence, not mislabeled contamination, but
the existing role/class count and exceptional-stock gates must acquire no new
failure.

The material gates remain those L6.30 failed:

- generation stationary-capable share `>= 0.48` in aggregate and `5/7` worlds;
- season-ten stationary-ready delta `>= +0.08` and ceiling-gap reduction
  `>= 0.08`, each in the intended direction in `5/7` worlds;
- generated-leader delta `>= +0.03`, intended direction in `5/7` worlds;
- no newly failing integrated gate and zero reconciliation failure.

Structural mismatch is `STOP / RETHINK`. A clean candidate missing any material
gate is `REFINE` and is removed. No threshold moves after output.

## Expected Files

- `packages/content/src/generators/player-potential-rarity.ts` and test;
- `packages/content/src/generators/player-prospect-joint-profile.ts` and test;
- the adjacent content asset/test if the total runway target table needs a
  separate owner;
- simulation-report career facts, checkpoint evaluator, registry/planner tests
  and i18n for the paired profile;
- this document, generated audit/index, phase README and status.

No engine/domain/storage/web/save change, prospect-class relabel, annual quota,
global uplift, second report command, compatibility shim or hidden fallback.

## Required Checks

Graphify explain/affected before shared edits; focused reachability,
determinism, exact-purity and bounded-ceiling tests; typecheck; staged paired
`7 x 10` with exactly seven workers; byte-identical report rebuild;
`git diff --check`; graphify update; `pnpm check` alone.
