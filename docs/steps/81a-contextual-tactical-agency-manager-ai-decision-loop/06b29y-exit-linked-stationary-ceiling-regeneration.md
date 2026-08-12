# Step 06B29Y — Exit-Linked Stationary Ceiling Regeneration

## Status

Planned and active. Product candidate plus paired checkpoint.

## User-Facing Reason

The playable world loses senior-quality talent faster than annual academies
replace it. Raising a generic youth probability has already failed. This step
instead links new talent to actual players leaving the playable senior stock,
the same stationary-population idea used by newgen systems: exits create
replacement opportunity, never guaranteed stars for a club.

## Product Contract

At the existing end-of-season order, engine passes the exact senior exit facts
already produced before youth intake into the adapter-owned youth provider.
Content then:

1. reads each departed player's canonical primary role, former club division
   and stored role ceiling from the retained historical player entity;
2. builds deterministic competition-and-role donor pools;
3. selects the annual candidate archetype once through the existing owner;
4. pairs donors only with routine candidates of the same division and role;
5. gives a paired routine candidate a minimum stored role ceiling equal to its
   donor, capped strictly below the six-star boundary owned by the national
   exceptional-stock allocator;
6. leaves unpaired candidates and every interesting, serious or rare prospect
   on their existing policy.

Every donor and candidate is consumed at most once. Pairing uses stable seeded
keys and player ID as final tie-breaker, not club order or output. There is no
fallback across roles or divisions: an unmatched exit remains diagnostic
rather than silently changing the league's positional identity.

The candidate changes no intake volume, natural position, primary role,
current ability, age, prospect-class count, serious/rare allocation or
six-star stock. It adds no origin-aware lineup, minutes, market, growth, aging
or match rule. CLI and web keep using the same content provider.

## Frozen Paired Checkpoint

- current arm: immutable L6.20 cache;
- candidate arm: the same seven seeds, ten seasons and exactly seven workers;
- L6.27 reader and every L6.2 integrated gate run on both arms;
- report actual exit/donor/routine-candidate/pair/unmatched counts by division,
  role, reason and world, with exact reconciliation;
- prove on real generated data that paired and unpaired routine outcomes, and
  the below-six cap, are all reachable.

The candidate requires all of:

- stationary-ready share improves by at least `+0.10` in aggregate and in the
  same direction in at least `5/7` worlds;
- ceiling-supply share among non-ready players falls by at least `0.10`, same
  direction in at least `5/7` worlds;
- season-ten career-generated leader share does not regress by more than
  `0.02` and no current integrated gate newly fails;
- exact candidate count, role/class counts and current-ability projection are
  unchanged at generation; national stored-ceiling-six allocation remains
  exact;
- zero reconciliation, unknown origin, duplicate pairing, cross-role or
  cross-division assignment.

`GO` ships the stationary contract. Any structural mismatch is `STOP /
RETHINK`; a clean run missing either material transition is `REFINE` and the
candidate is removed. Targets are frozen before implementation and are not a
promise that every exiting star produces another star or that every club owns
its replacement.

## Expected Files

- `packages/engine/src/career/advance-career-season.ts` and test;
- `packages/content/src/generators/career-intake-players.ts` and test;
- `packages/content/src/generators/initial-youth-academies.ts` and test;
- `packages/content/src/generators/player-prospect-joint-profile.ts` and test;
- `packages/content/src/generators/player-potential-allocation.ts` and test if
  the semantic below-six ceiling bound requires its owner;
- CLI/web/lab adapter files only if structural typing does not already forward
  the new provider fact; they must be added here before editing;
- simulation-report world facts, stationarity attribution, career sections,
  registry/planner tests and i18n;
- this document, generated audit/index, phase README and status.

No new report entrypoint, output-conditioned rule, guaranteed club successor,
cross-role fallback or save-compatibility shim.

## Required Checks

Focused reachability and equivalence tests, typecheck, candidate run and two
byte-identical cache-only paired evaluations with exactly seven workers,
`git diff --check`, graphify update and `pnpm check` alone.
