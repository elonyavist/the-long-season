# Step 06B29H - Checkpoint L6.12B Season-Boundary Succession Funnel

## Status

Done - `OWNER_IDENTIFIED: below_half_ability_growth` on 88 reconciled rows.

## Goal

Locate the first downstream failure after a career-generated prime-age player
fulfils a role-succession need, using the actual season boundary at which that
transfer becomes fieldable. This is observation-only and reads the completed
L6.11 candidate cache; it cannot simulate or change gameplay.

## Frozen Cohort And Timeline

- profile `phase81a-succession-downstream-funnel-l6-12b-cached`;
- read-only reuse of the seven L6.11 candidate worlds, ten seasons each;
- exactly one row per distinct `(world, buying club, acquired player)`, using
  the earliest fulfilled role-succession episode in seasons `1..8`;
- the fulfilled episode is the canonical proof of acquisition by its `clubId`;
- the unique season-`N` player row supplies age and acquisition ability. Its
  club is expected to describe the pre-transfer snapshot and is therefore not
  required to equal the buyer;
- include only `annual_academy_intake` or `annual_senior_intake` players aged
  `21..29` on that season-`N` row;
- the buyer's playable seasons are `N + 1` and `N + 2`; buyer use is read only
  from fixture-derived `playerUseSeasons`, and closing ownership/ability only
  from `playerSeasons`;
- stable IDs join episodes, origin, player use, player-season ability and the
  canonical season-ten leader set. Names never join evidence.

The one-season shift is not selected from the failed output. It follows from
the production call order: `observeSeasonAdvancement(...)` forms the episode
after the closing season-`N` player facts and before season `N + 1` is played.

## Frozen Terminal Stages

Classify every eligible row once, in this order:

1. `season_ten_leader`: the player reaches the canonical season-ten leader set;
2. `no_buyer_appearance`: zero fixture appearances for the buyer across
   seasons `N + 1` and `N + 2`;
3. `below_450_buyer_minutes`: appearances exist but buyer minutes across those
   two seasons are below `450`;
4. `not_retained_two_seasons`: no closing buyer-owned player row exists in
   season `N + 2`;
5. `below_half_ability_growth`: retained through season `N + 2`, but current
   ability is less than the season-`N` acquisition ability plus `0.5`;
6. `developed_not_leader`: retained and developed, but absent from the
   season-ten leader set.

The leader bucket remains success even if the player later changes club. The
remaining buckets locate the first failure on the acquiring club's path.

## Frozen Decision

- zero eligible rows, non-unique season-`N` rows, missing
  origin/use facts, cache mismatch or reconciliation failure:
  `STOP_RETHINK`;
- fewer than `35` eligible rows: `STOP_RETHINK` for an underpowered owner
  attribution. This floor is five eligible rows per world on average and is
  frozen before reading the corrected counts;
- one non-success terminal stage at `>= 0.50` of eligible rows:
  `OWNER_IDENTIFIED` for that stage;
- otherwise `MIXED`, and no product owner opens.

Every terminal stage's real count is reported. A stage with zero real rows is
not a reachable future gate and cannot justify a correction.

## What To Implement

1. Replace the invalid L6.12 profile and checkpoint identifier; do not keep a
   compatibility alias.
2. Shift only buyer use and retention to `N + 1..N + 2`; keep acquisition
   age/ability on the unique pre-transfer season-`N` row.
3. Report cohort exclusions explicitly so a future denominator collapse cannot
   masquerade as an owner. Later episodes for an already observed
   `(world, buyer, player)` are expected and reported as deduplicated rows; the
   earliest episode remains the single cohort row.
4. Prove the boundary, minimum cohort and fail-closed paths in unit tests.
5. Execute the cached profile alone with exactly seven workers and record the
   raw counts, decision and artifact hash.

## What NOT To Implement

- no gameplay, development, selection, transfer, content or calibration change;
- no new simulation and no cache write;
- no new threshold after terminal-stage counts are read;
- no reconstruction of transfer facts from final ownership.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- 06B29G, this document, its audit/index, Phase README and
  `docs/PROJECT_STATUS.md`.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-succession-downstream-funnel-l6-12b-cached \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-succession-downstream-funnel-l6-12b-cached.json
git diff --check
```

The cached checkpoint runs alone. A report-level `PASS` does not override a
checkpoint `STOP_RETHINK` or `MIXED`; the embedded decision owns the handoff.

## Outcome - 2026-08-12

The corrected cached profile exited `0` and wrote SHA-256
`ff908259eab1ff6578b3d9a186540b24bb39e4e775181c59f7aba54815042fd1`.
The cohort reconciled without missing facts:

| Cohort fact | Count |
|---|---:|
| fulfilled episodes in seasons 1..8 | 2,582 |
| distinct buyer/player rows | 2,488 |
| later duplicate episodes removed | 94 |
| opening-origin rows excluded | 2,380 |
| generated rows outside age 21..29 | 20 |
| eligible generated prime-age acquisitions | 88 |

Every terminal stage was reachable on real cached facts:

| Terminal stage | Count | Share |
|---|---:|---:|
| season-ten leader | 1 | 1.14% |
| no buyer appearance | 11 | 12.50% |
| below 450 buyer minutes | 3 | 3.41% |
| not retained two seasons | 9 | 10.23% |
| below +0.5 ability growth | 61 | 69.32% |
| developed, not leader | 3 | 3.41% |

The sample clears the frozen 35-row floor and the dominant stage clears 0.50.
The result establishes a **growth-feasibility question**, not permission to
raise development globally: some of the 61 may have had less than 0.5 stored
potential or insufficient buyer load. L6.13 separates those owners on the same
cache before any product change.

## Verification Result

- `pnpm typecheck`: pass;
- 53 focused tests: pass on seven workers;
- cached report: exit `0`, zero reconciliation/signature failures;
- `git diff --check`: pass;
- next: [06B29I - Checkpoint L6.13](06b29i-checkpoint-l6-13-cached-growth-feasibility.md).
