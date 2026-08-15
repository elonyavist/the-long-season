# Step 16K1 - Checkpoint L6.42A Progressive Current-16 Funnel

## Status

**Done - `OWNER_IDENTIFIED: observed_ceiling_supply` on 2026-08-15.** Instrument
retry only; no gameplay change.

## Why The Retry Is Necessary

L6.42 required every mutually exclusive terminal loss to be positive. The real
population stopped much earlier: only `22/1885` First-Division generated
players ever showed an observed ceiling of current `16`, and only `13` reached
it. Requiring those thirteen players to demonstrate exit, demotion and quality
loss simultaneously is not reachability; it fabricates downstream failures.

L6.42 remains `STOP_INSTRUMENT`. This retry freezes a progressive funnel before
using any L6.42 diagnostic as a verdict.

## Frozen Population

Exactly the L6.42 read-only L6.40 cache, seeds, seven worlds, ten seasons,
First-Division entry-club cohort and seven-worker metadata. No new simulation,
seed, player, season or fact is added.

## Progressive Funnel

Count nested populations, each a subset of the previous:

1. `generated`: all career-generated players from seasons `1..6` whose entry
   club was in the First Division;
2. `senior_observed`: at least one canonical senior player-season row;
3. `ceiling16_observed`: maximum observed current plus potential room reaches
   `16`;
4. `current16_reached`: current ability reaches `16` in any observed season;
5. `current16_retained`: active in the First Division at current `16` in season
   ten;
6. `leader`: retained and present in a season-ten scorer or creator top ten.

Every adjacent pair reports denominator, survivors, losses and survival share.
Reachability requires every denominator through `current16_retained` to be
positive. It does **not** require a positive loss: zero loss is a valid measured
`100%` survival rate. Leadership remains diagnostic after stock success.

## Frozen Owner Rule

Among the first four stock transitions, identify the transition with the
largest loss count. It owns the failure only when:

- its losses are `>=0.50` of all players not retained as First-Division
  current-16;
- it is the largest loss transition in `>=5/7` worlds;
- all nested counts reconcile and the like-aged L6.27 replay is not structurally
  invalid.

Otherwise return `MIXED`. Missing denominators, broken subset ordering, missing
worlds or join failures return `STOP_INSTRUMENT`. These are the same `0.50` and
`5/7` attribution floors as L6.42; only the invalid terminal-reachability model
is replaced.

Opening elite retention remains a separate diagnostic with the exact L6.42
definition. It is never combined with the generated funnel to manufacture a
shared owner.

## Expected Files

- `apps/cli/src/commands/simulation-report/stationary-age-succession-attribution.ts`
  and test. Replace the stopped terminal evaluator with one nested funnel; no
  second reader survives.
- `apps/cli/src/commands/simulation-report/career-sections.ts`,
  `report-registry.ts`, `report-planner.test.ts` and
  `packages/i18n/src/labels.ts`. Rename the stopped profile to the sole L6.42A
  cache reader; no stale callable L6.42 profile remains.
- L6.42/L6.42A audit, audit index, both step documents, phase README and status.

No engine, content, domain, storage, web, HTML, save, beta version or gameplay
file is in scope.

## Required Checks

Focused tests cover subset reconciliation, zero-loss validity, owner majority,
world coherence and structural failure. Then run two byte-identical cache-only
reports, Graphify update, `git diff --check` and `pnpm check` alone.

## Outcome

The cache-only retry returned `OWNER_IDENTIFIED` with zero reconciliation
failures. The funnel is:

`1885 generated -> 1041 senior-observed -> 22 ceiling-16 -> 13 current-16 ->
13 retained -> 4 leaders`.

The `observed_ceiling_supply` transition loses `1019` players, owns `0.5443` of
all `1872` failures and is largest in `6/7` worlds. Development loses nine;
retention loses zero. The independent like-aged replay agrees:
`ceiling_supply_gap=780`, `development_realization_gap=148`, owner share
`0.8405`, coherent in `7/7` worlds.

Opening elite retention is not an owner: only `71/447 = 0.1588` opening
current-16 players remain First-Division current-16, with `0/7` worlds at the
majority floor. The season-ten opening current-16 total is `91` because `20`
players who began below `16` reached it later.

Both report builds exited `0` and were byte-identical. Full interpretation is
in `docs/audits/PHASE_81A_CHECKPOINT_L6_42_CURRENT16_LIFECYCLE.md`.

## Verification

The focused funnel, planner and report tests passed before the cache run. The
final isolated `pnpm check` then exited `0`: `318` test files and `2549` tests
passed; dependency-cruiser found no violations across `904` modules; localized
text, squad-depth ownership, role-department ownership and the single
`simulation-report` entrypoint checks passed; every workspace typecheck passed.
