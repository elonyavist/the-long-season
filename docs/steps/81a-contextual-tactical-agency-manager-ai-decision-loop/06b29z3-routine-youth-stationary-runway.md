# Step 06B29Z3 — Routine-Youth Stationary Runway

## Status

Done. `GO` in-sample and out-of-sample; product adopted.

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

## Adopted Implementation

`ROUTINE_YOUTH_STATIONARY_RUNWAY_TARGETS` is the one total content-owned table.
`routineYouthStationaryRunwayTarget(...)` uses a dedicated derived RNG stream
and immutable player facts, returning the role target for the selected half or
`undefined`. The academy roots pass the result into the existing reachable
potential allocator only for `normal_youth`; opening senior generation and
annual senior candidates never enter this path.

`ROUTINE_YOUTH_STATIONARY_RUNWAY_POLICY_VERSION` owns both the policy identity
and the derived-stream key. Reports record it beside the other calibration
versions. The phase's already-consolidated Step 14 beta reset owns stamping it
into the durable career bundle; this step does not create a second reset or a
compatibility reader.

The preliminary opening academy explicitly disables the runway because its
only job is to feed the national exceptional allocator. The final opening
academy applies the runway after six-star identities are fixed. This keeps the
exceptional budget independent of ordinary potential.

The paired report retains full current/potential hashes at the accepted-player
boundary. Control profiles explicitly disable the product policy; candidate
profiles use its ordinary default. Both in-sample and out-of-sample pairs are
locked `7 x 10` runs with exactly seven workers.

## Verification

| Measure | In-sample control | In-sample candidate | OOS control | OOS candidate |
| --- | ---: | ---: | ---: | ---: |
| generation stationary-capable | `0.3069` | `0.5400` | `0.3004` | `0.5164` |
| capable worlds | `0/7` | `6/7` | `0/7` | `6/7` |
| season-ten stationary-ready | `0.2189` | `0.3552` | `0.2162` | `0.3195` |
| season-ten ceiling-gap share | `0.7210` | `0.5084` | `0.7149` | `0.5451` |
| generated-leader share | `0.2024` | `0.2833` | `0.1524` | `0.2429` |

In-sample deltas are ready `+0.1363`, gap reduction `0.2127` and leader
`+0.0810`; out-of-sample they are `+0.1034`, `0.1698` and `+0.0905`.
Ready and gap improve in `7/7` worlds in both sets; leaders improve in `6/7`.

Immediate purity is exact: `140/140` changed-potential/effective-assignment
rows in-sample and `144/144` out-of-sample, with zero other mismatch, zero
decrease, zero reconciliation failure and zero new integrated gate. The OOS
candidate rebuilt byte-identically from its canonical JSON (`cmp` exit `0`).
The final evidence was regenerated on `facts-v2` after the policy version was
added to the report manifest; this supersedes the pre-manifest `facts-v1`
caches without changing gameplay, seeds or targets.

Focused verification: `215` tests across nine files pass. The isolated full
gate is green: `310` test files, `2,482` tests, typecheck, dependency rules and
all custom checks. Graphify was refreshed to `23,996` nodes; `git diff --check`
and the final Expected-Files accounting are clean.

## Commands

```sh
pnpm cli simulation-report --profile=phase81a-routine-youth-runway-l6-31-control-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-routine-youth-runway-l6-31-control-7x10.json
pnpm cli simulation-report --profile=phase81a-routine-youth-runway-l6-31-candidate-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-routine-youth-runway-l6-31-candidate-7x10.json
pnpm cli simulation-report --profile=phase81a-routine-youth-runway-l6-31-oos-control-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-routine-youth-runway-l6-31-oos-control-7x10.json
pnpm cli simulation-report --profile=phase81a-routine-youth-runway-l6-31-oos-candidate-7x10 --workers=7 --format=json --report-output=simulation-out/phase81a-routine-youth-runway-l6-31-oos-candidate-7x10.json
```

## Next Action

The stationary youth supply owner is closed. Continue with the next documented
Phase 81A step; do not add a second potential uplift or retune these targets
from a later canary.

## Expected Files

- `packages/content/src/generators/player-potential-rarity.ts` and test;
- `packages/content/src/generators/player-prospect-joint-profile.ts` and test;
- `packages/content/src/generators/routine-youth-stationary-runway.ts` and test
  **(new)**. This adjacent asset owns the complete division/role target table
  and the stable individual lane draw; neither generation nor reporting may
  duplicate that decision;
- `packages/content/src/generators/initial-youth-academies.ts` and test,
  `career-intake-players.ts` and test, `domestic-world.ts` and test. These are
  the two academy composition roots and the country root that must carry the
  explicit control/candidate seam. Senior-player generation is deliberately
  excluded, so the opening senior reference population cannot move;
- `packages/content/src/index.ts`. The CLI report reads the same runway
  decision through the content facade rather than reconstructing it;
- `apps/cli/src/commands/simulation-report/career-world-facts.ts`,
  `career-sections.ts` and their focused tests. They carry the analysis-only
  arm through the worker boundary and retain generation-boundary purity facts;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test. The existing stationarity owner receives the paired L6.31
  evaluator instead of a parallel formula;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts`. They own the two locked seven-world profiles,
  checkpoint identities and exact seven-worker population;
- `packages/i18n/src/labels.ts` for the profile names in all supported
  languages;
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts`. The adopted opening-academy
  potential changes the shared canonical career identity hash; both adapters
  must move to the same measured value in one edit or the cross-adapter golden
  has lost its purpose;
- this document, generated audit/index, phase README and status.

No engine/domain/storage/web/save change, prospect-class relabel, annual quota,
global uplift, second report command, compatibility shim or hidden fallback.

## Required Checks

Graphify explain/affected before shared edits; focused reachability,
determinism, exact-purity and bounded-ceiling tests; typecheck; staged paired
`7 x 10` with exactly seven workers; byte-identical report rebuild;
`git diff --check`; graphify update; `pnpm check` alone.
