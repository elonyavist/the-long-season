# Step 06B29T — Checkpoint L6.23 Paired Generated-Player Lifecycle Attribution

## Status

Done — `MIXED` on 2026-08-12. No gameplay correction opened from this
candidate comparison.

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
- same player IDs paired within world; the union is retained. An ID accepted in
  only one arm is an observed `intake_acceptance_path` divergence, while a
  duplicate or an ID missing from its own canonical origin join is a
  reconciliation failure;
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
- `intake_acceptance_path`: the leader ID is absent from the other arm's
  accepted academy provenance;
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
Otherwise return `MIXED`. Fewer than seven worlds, zero leader losses,
inconsistent provenance, duplicate IDs or any canonical join mismatch is
`STOP / RETHINK`. No target is tuned after output.

### Correction Before Output

The first draft called any ID present in only one arm a reconciliation failure.
Reading the canonical annual intake showed that downstream academy vacancies
can legitimately change which deterministic slot IDs are accepted. Dropping
those rows or stopping would erase a possible causal owner. Before this
checkpoint produced output, the rule was corrected to measure the union as
`intake_acceptance_path`; only duplication or a broken own-arm join remains
structural.

The first cache-only execution exposed a second false assumption before any
product conclusion was drawn: annual-academy origins deliberately do not store
`openingCurrentAbility`. The first world contained 806 valid annual-academy
origins per arm, while the draft reader rejected all of them and accumulated
11,370 false reconciliation failures across the cohort. The lifecycle now uses
the first canonical cached player-season observation as the current-ability
baseline and records `not_observed` when a player never crosses that boundary.
This preserves the cached simulation as the source of truth without inventing
an opening value that the observer never recorded.

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

## Outcome

Both cache-only builds exited `1` with the intended `MIXED` decision and were
byte-identical at SHA-256
`88428f486bff8e32c729b67c8253865895b0eef84a614d1c0830486c22cb0ddc`.
All seven worlds reconciled with zero duplicate or broken joins.

The rejected combined policy changed the authored class of `190` accepted
players, but season-ten leadership mostly moved sideways: `59` leader losses
against `54` gains, a net loss of five. Losses split between
`quality_not_leadership` (`22`, `0.3729`) and `mixed_below_floor` (`22`), with
`exit_or_retention` at `10` and `current_profile_cost` at `5`; minutes,
development realization and intake acceptance each owned zero. The largest
reason was non-negative in six worlds but did not reach the frozen `0.50`
owner share.

This closes frequency/ceiling candidate forensics. It does not absolve the
current product's low generated-leader share. L6.24 therefore reads the current
L6.20 population only and decomposes the quality-ready generated cohort's path
into minutes, actor access, execution and leaderboard cutoff before any new
gameplay change.
