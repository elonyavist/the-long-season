# Step 06B29V — Checkpoint L6.25 Overlapping Leader-Lane Deficits

## Status

Planned and active. Cached observation only; no gameplay correction.

## User-Facing Reason

L6.24 proves that generated scorer candidates mostly lack leader-level depth,
while creator candidates are split among quality, minutes and conversion. Its
first-terminal classifier intentionally assigns each row once, so it cannot
show whether creator deficits overlap on the same players. This checkpoint
measures those intersections before one subsystem is changed for a shared
problem.

## Frozen Population And Facts

Reuse the exact L6.24 current-product cache, mature generated cohort, lane
eligibility, role-local leader medians and material thresholds. For each
quality-ready non-leader lane observation, record four independent booleans:

- `quality_depth`: median leader current ability minus player current ability
  is at least `0.50`;
- `selection_volume`: median leader minutes minus player minutes is at least
  `450`;
- `actor_access`: lane opportunities per 900 minutes are below `0.80` of the
  role-lane leader median;
- `occasion_conversion`: output per opportunity is below `0.80` of the
  role-lane leader median.

`rank_cutoff` is the exact all-false mask. Record all sixteen masks separately
for scorer and creator lanes, marginal shares, pairwise intersections, every
world and every competition. No row is discarded because it has several
deficits.

## Frozen Decision

Decide each lane independently:

- `UNIQUE_OWNER`: one marginal is `>=0.50`, leads the next marginal by
  `>=0.10`, and is the largest in `>=5/7` worlds;
- `SHARED_OWNER`: at least two marginals are `>=0.50` and their intersection is
  `>=0.25` in aggregate and positive in `>=5/7` worlds;
- `MIXED`: neither rule holds on a reconciled population;
- `STOP / RETHINK`: any L6.24 structural condition fails, a lane or mask family
  is unobservable, or the terminal and overlapping readers disagree on the
  shared population size.

The checkpoint may identify different owners for scorer and creator. It never
combines them into one product rule. A later correction can open only for a
lane with a unique owner or a measured shared pair; player origin remains
inadmissible in gameplay.

## Expected Files

- `apps/cli/src/commands/simulation-report/succession-priority-attribution.ts`
  and test;
- `apps/cli/src/commands/simulation-report/career-sections.ts`;
- `apps/cli/src/commands/simulation-report/report-registry.ts` and planner test;
- `packages/i18n/src/labels.ts`;
- this document, audit/index, phase README and status.

No engine, content, domain, persistence, web, HTML, coefficient, save change or
new report entrypoint.

## Required Checks

Focused tests, typecheck, two byte-identical cache-only report builds with
exactly seven workers, `git diff --check`, graphify update and `pnpm check`
alone.
