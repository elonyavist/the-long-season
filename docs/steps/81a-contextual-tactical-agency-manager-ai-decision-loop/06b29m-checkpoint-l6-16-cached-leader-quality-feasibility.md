# Step 06B29M - Checkpoint L6.16 Cached Leader-Quality Feasibility

## Status

Done - `OWNER_IDENTIFIED: generated_ceiling_supply` on 2026-08-12.

## User-Facing Reason

L6.15B proves that mature generated players usually fail before reaching the
quality of real leaders in their own role. That still permits two opposite
product changes: create players with better ceilings, or help existing
potential become current ability. Applying both would inflate the world and
hide which football story was missing.

## Frozen Population

- the same read-only L6.4 `7 x 10` cache and seven-worker metadata;
- the exact L6.15B mature cohort (`generatedSeasonNumber <= 6`);
- only the `1,116` rows classified `below_role_leader_quality`;
- the same world-, competition- and role-local leader-quality floor;
- actual stored `potentialRoom` already captured by the canonical development
  ability summary; no public-P50 reconstruction and no new simulator.

## Frozen Classification

For every source row:

```text
storedCeiling = currentAbility + potentialRoom
```

- `stored_ceiling_below_leader_quality` when `storedCeiling < qualityFloor`;
- `sufficient_ceiling_not_realized` otherwise, with equality on the sufficient
  side.

The report also records the two canonical generated origins and aggregate
current-quality gap, stored potential room and remaining ceiling shortfall.
Those summaries are diagnostic and do not choose the owner.

## Frozen Decision

`STOP_RETHINK` applies unless all seven worlds, 21 competition groups, 420
leader slots and exactly 1,116 source rows reproduce with zero reconciliation,
and both stages occur on real data.

Otherwise a stage with share `>= 0.50` records `OWNER_IDENTIFIED`; a split below
that threshold is `MIXED`:

- stored ceiling majority -> `generated_ceiling_supply`;
- sufficient ceiling majority -> `development_realization`.

Only the identified owner may receive a product candidate. Generic market
selection, minutes, output allocation and the other owner remain closed.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, generated audit/index, Phase README and
  `docs/PROJECT_STATUS.md`.

No engine, content, domain, persistence, web, HTML, save or gameplay file.

## Required Checks

```bash
pnpm typecheck
pnpm exec vitest run \
  apps/cli/src/commands/simulation-report/succession-priority-attribution.test.ts \
  apps/cli/src/commands/simulation-report/report-planner.test.ts \
  --maxWorkers=7
pnpm cli simulation-report \
  --profile=phase81a-leader-quality-feasibility-l6-16-cached \
  --workers=7 \
  --format=json \
  --report-output=simulation-out/phase81a-leader-quality-feasibility-l6-16-cached.json
git diff --check
```

## Outcome

The report exited zero and wrote SHA-256
`0a38b1de87833de8f68362bb90c13ca7bdb55bff485abddead43934910e87b11`.
It reproduced all `1,116` L6.15B quality failures:

- stored ceiling below role-local leader quality: `1,030` (`0.922939`);
- sufficient ceiling not realized: `86` (`0.077061`).

Both stages occur on real data and all structural facts reconcile. Mean current
gap is `2.5872`, mean stored room `0.3538`, and mean ceiling shortfall `2.2783`.
Every source row is `annual_academy_intake`; annual senior generation is
absolved. Only a bounded academy-ceiling candidate opens.
