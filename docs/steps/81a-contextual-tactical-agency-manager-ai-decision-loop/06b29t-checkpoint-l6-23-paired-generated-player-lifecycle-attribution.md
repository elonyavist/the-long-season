# Step 06B29T — Checkpoint L6.23 Paired Generated-Player Lifecycle Attribution

## Status

Planned and active. Observation only; no gameplay correction.

## User-Facing Reason

The career needs more new-generation leaders, but creating more interesting
prospects with higher ceilings makes the result worse. Before changing growth,
minutes, retention, market or leadership rules, the report must show where the
same generated footballers diverge between current policy and the rejected
combined arm.

## Frozen Population

Read only the immutable L6.20 `00` and L6.22 combined `11` caches:

- identical seven world seeds;
- ten seasons;
- accepted annual academy players generated in seasons one through six;
- same player IDs paired within world; missing/duplicate IDs are reconciliation
  failures, not dropped observations;
- exactly seven workers even though this checkpoint is cache-only.

The rejected product policy remains absent from production. The historical
`11` cache is evidence, not a caller or compatibility surface.

## Frozen Player Lifecycle

For every paired player record in each arm:

1. authored prospect class and generation division;
2. first observed current role ability and stored role ceiling;
3. season-one and cumulative seasons-one-through-six minutes;
4. current-ability gain by seasons six and ten;
5. active/owned status at seasons six and ten;
6. represented role at season ten;
7. reached local role-leader quality;
8. season-ten leader.

Report totals, transitions and paired deltas for all accepted players and for
the exact IDs whose class differs between `00` and `11`. A player counted twice
after a transfer is one player; ownership and competition remain dimensions of
his row, never extra observations.

## Frozen Attribution

Classify every leader loss (`00` leader, `11` non-leader) and gain into the
first divergent terminal reason:

- `current_profile_cost`: first current ability lower by `>=0.25`;
- `minute_access`: current is not lower by that floor, but cumulative minutes
  through season six are lower by `>=450`;
- `development_realization`: neither prior condition, but season-ten ability
  gain is lower by `>=0.50`;
- `exit_or_retention`: active/owned in `00`, absent or unowned in `11`;
- `quality_not_leadership`: reaches the same local quality floor in both, but
  only `00` is a leader;
- `mixed_below_floor`: no earlier difference reaches a frozen material floor.

The owner is identified only when one reason owns `>=0.50` of leader losses and
has the same non-negative excess of losses over gains in `>=5/7` worlds.
Otherwise return `MIXED`. Missing paired IDs, fewer than seven worlds, zero
leader losses, inconsistent provenance or any join mismatch is
`STOP / RETHINK`. No target is tuned after output.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, audit/index, phase README and status.

No content, domain, engine, persistence, web, product coefficient, new report
entrypoint or save migration.

## Required Checks

The cache-only profile is locked before execution to the exact L6.20 seeds,
seven worlds, ten seasons and seven workers. Required: focused unit tests,
typecheck, two byte-identical report builds to different output paths,
`git diff --check`, graphify update and `pnpm check` alone.
