# Step 06B29I - Checkpoint L6.13 Cached Growth Feasibility

## Status

Done - `OWNER_IDENTIFIED: insufficient_stored_room`.

## Goal

Explain why the 61 retained L6.12B successors failed to gain `0.5` ability in
two buyer seasons. This is observation-only and reuses the same read-only L6.11
cache. It cannot simulate or change gameplay.

## Frozen Population

- reproduce L6.12B exactly, including its 88 eligible rows and all six terminal
  counts;
- inspect only the 61 `below_half_ability_growth` rows;
- acquisition current ability and `potentialRoom` come from the unique closing
  season-`N` player row;
- buyer minutes and closing ability come from seasons `N + 1` and `N + 2`;
- stable IDs join facts. Names never join evidence.

Any failure to reproduce the L6.12B denominator or terminal counts is
`STOP_RETHINK`, not a new result.

## Frozen Feasibility Stages

Classify each of the 61 rows once:

1. `insufficient_stored_room`: acquisition `potentialRoom < 0.5`; gaining the
   required half point was arithmetically unavailable, so target feasibility
   owns the row;
2. `low_two_season_buyer_load`: stored room is at least `0.5`, but buyer minutes
   across `N + 1..N + 2` are below `1,800`; the player-use path owns the row;
3. `development_not_realized`: stored room is at least `0.5` and buyer minutes
   are at least `1,800`, yet growth remains below `0.5`; the development engine
   owns the row.

`1,800` minutes means twenty full-match equivalents across two seasons. It is a
diagnostic partition frozen before output, not a demanded appearance target.
Report the continuous age, stored-room, minutes and realized-growth summaries
beside the buckets; they do not change the decision.

## Frozen Decision

- cache/profile mismatch, missing facts, non-reproduction of L6.12B or zero
  rows: `STOP_RETHINK`;
- one feasibility stage at `>= 0.50` of the 61 rows: `OWNER_IDENTIFIED`;
- otherwise: `MIXED` and no product correction opens.

Every stage must be reached by at least one real cached row before it can be
used as a future gate. Zero-count stages remain diagnostics only.

## Expected Files

- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, its audit/index, Phase README and `docs/PROJECT_STATUS.md`.

No engine, content, persistence, web, HTML or gameplay file is in scope.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-succession-growth-feasibility-l6-13-cached \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-succession-growth-feasibility-l6-13-cached.json
git diff --check
```

## Outcome - 2026-08-12

The profile reproduced all `88` L6.12B rows and all `61` low-growth rows with
zero reconciliation or signature failures. Artifact SHA-256:
`9aa85c38673155f3c74b3e7ff824b4347e1e495b1da6f218d1696a7964d19153`.

| Feasibility stage | Count | Share |
|---|---:|---:|
| insufficient stored room | 43 | 70.49% |
| low two-season buyer load | 1 | 1.64% |
| development not realized | 17 | 27.87% |

The continuous readings support the partition: median stored room is only
`0.0219` while median buyer load is `3,401` minutes. The median realized growth
is `0.0068`; maximum `0.4205`, still below the source cohort's `0.5` boundary.

The owner is target feasibility, not minutes and not a global development
multiplier. L6.14 may test only a public-information runway preference using
`p50Ability - currentAbility`; it may never inspect stored ceiling or actual
`potentialRoom` during an AI decision.

## Verification Result

- `pnpm typecheck`: pass;
- 56 focused tests: pass on seven workers;
- cached report: exit `0`, exact source reproduction;
- next: 06B29J, public-runway successor selection.
