# Step 06B29U — Checkpoint L6.24 Generated Leader-Lane Conversion

## Status

Planned and active. Cached observation only; no gameplay correction.

## User-Facing Reason

The current world reaches only about `27%` career-generated scorer/creator
leader slots after ten seasons. Raising academy frequency and ceiling did not
repair it: L6.23 found almost equal leader gains and losses with no lifecycle
owner. The next question is whether current generated players who are already
strong enough fail because they play less, receive fewer attacking actions,
convert those actions less effectively, or merely miss a top-ten cutoff.

## Frozen Population

- read-only L6.20 current-product cache;
- seven worlds, ten seasons, three divisions and exactly seven workers;
- career-generated players born by season six and present at season ten;
- scorer and creator are separate lane observations, matching the canonical
  `20` leader slots per competition rather than pretending one player can own
  only one table;
- include only a player-lane whose role occurs among that lane's real top-ten
  leaders and whose current ability reaches the minimum leader ability for that
  role and lane;
- exclude actual top-ten players from the failure denominator and report them
  separately.

No generated-origin bonus, reconstructed match event or second actor model is
allowed. All facts come from canonical season-ten minutes, shots, creator
nominations, goals and assists.

## Frozen Decomposition

For every non-leader quality-ready player-lane, compare against the median real
leader of the same world, competition, role and lane. Classify the first
material deficit:

1. `quality_depth`: current ability is lower by at least `0.50`;
2. `selection_volume`: season minutes are lower by at least `450`;
3. `actor_access`: shots per 900 minutes (scorer) or creator nominations per
   900 minutes (creator) are below `0.80` of the leader median;
4. `occasion_conversion`: goals per shot or assists per creator nomination are
   below `0.80` of the leader median;
5. `rank_cutoff`: none of the earlier material deficits applies.

Zero-minute or zero-opportunity denominators are recorded explicitly and are a
structural failure if they prevent classification. Report pooled counts, both
lanes, every division and every world. The medians and stage order are frozen
before output; no threshold moves after the cache is read.

## Frozen Decision

`OWNER_IDENTIFIED` requires one stage to own `>=0.50` of all non-leader lane
observations and be the largest stage in `>=5/7` worlds. `MIXED` applies when
the population reconciles but no stage meets both conditions. Fewer than seven
worlds, any origin/player/leader join mismatch, an unreachable scorer or
creator lane, fewer than 21 competition observations, or an unclassifiable
denominator is `STOP / RETHINK`.

The owner maps to exactly one next question:

- `quality_depth` — stationary annual quality supply by division and role;
- `selection_volume` — age-neutral lineup and rotation access;
- `actor_access` — canonical task-quality actor allocation;
- `occasion_conversion` — canonical execution edge;
- `rank_cutoff` — leaderboard distribution/denominator, not player generation.

Any future rule must read football facts, never player origin. Exceptional
veterans remain reachable and no hard quota of generated leaders is admissible.

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

The profile is locked to the exact L6.20 cache and seven-worker metadata.
Required: focused unit tests, typecheck, two byte-identical cache report builds,
`git diff --check`, graphify update and `pnpm check` alone.
