# Step 01 - Expiry, Free-Agent And Density Baseline

## Status

Not started.

## Goal

Measure and freeze the current contract-expiry distribution, free-agent
behaviour, and market density before any behaviour changes, and freeze the bands
Step 06 will be judged against.

## User-Facing Reason

The manager should be able to tell whether the market got better, not just
different. Without a pre-change measurement, a later report can only claim that
numbers moved.

## What To Implement

- Create one deterministic market-economy audit Module and a reproducible CLI
  report path, alongside the existing audit modules in `@game/simulation-tools`.
- Measure, over a bounded multi-season sample, and record per world:
  - the distribution of contract `endsOn` dates across the calendar year,
    including how many distinct expiry dates exist and what share falls in any
    single month. This is the direct evidence for the anniversary anchoring;
  - the offered-term distribution actually produced by
    `derivePreferredContractDurationYears`, in months;
  - the free-agent share per season, its arrivals from expiry and release, and
    its departures from signing. The share alone is not enough: a pool that is
    stable because nothing enters and nothing leaves is a different defect from
    one that is stable because inflow equals outflow;
  - arrivals per club per season, split by permanent transfer, free-agent
    signing, youth promotion, and intake;
  - permanent transfer completions per season per club.
- Freeze the density bands from the consolidated analysis, section 12.1, with
  their sources: arrivals per club `8-13`; permanent share `15-22%`;
  contract-expiry share `55-68%`; loans `10-14%`, recorded as `not_evaluated`
  in this phase because loans do not exist; fee-bearing share `14-22%`; mean
  contract duration `18-30` months; contracts under six months `10-20%`; season
  boundary share `100%`; free-agent share `18-20%`.
- Record explicitly that the free-agent band is a product decision rather than a
  sourced measurement. It was set at `18-20%` on 2026-08-02 against a measured
  `20-23%`, so it is deliberately close to today's level. The consequence must
  be stated in the report: this band alone cannot detect the defect, because a
  pool that never drains sits inside it. The drain requirement in Step 03, not
  this band, is what proves the market moves.
- Measure the steady-state gap at world generation. A new career starts with an
  empty free-agent pool, because generation assigns every player to a club and a
  free agent is by definition unowned; the pool only fills at the first expiry
  or annual intake. Record the share at day one, at the first season boundary,
  and at each subsequent boundary, so the number of seasons a new world needs to
  reach its steady state is on record. Starting at `0%` and targeting `18-20%`
  means a fresh save opens in a state it will never return to.
- Record the current values against every band, so Step 06 compares like with
  like.
- Inventory every owner of contract-expiry computation, offered-term
  representation, and season-boundary derivation, including
  `contractEndDate`, the generation scatter in the senior-squad world
  generator, `derivePreferredContractDurationYears`, the `duration_years`
  columns, and the existing season-boundary readers in
  `next-season-calendar.ts` and `ai-market-lifecycle.ts`.
- Change no production behaviour.

## Clean-Code Requirements

- The audit Module owns scenario construction once; CLI and tests must not
  duplicate world fixtures or formulas.
- Use named metric IDs and typed result rows, not positional tuples.
- Every metric declares its denominator; a metric with an empty population
  reports `not_evaluated` and never `PASS`.
- If an existing audit report can be deepened cleanly, deepen it rather than
  adding a second command that prints overlapping facts.

## What NOT To Implement

- No contract, expiry, term, AI, or fixture behaviour change.
- No band chosen or adjusted after looking at any post-change output.
- No longitudinal cohort.

## Expected Files

- `packages/simulation-tools/src/market-economy/market-economy-audit.ts`
- `packages/simulation-tools/src/market-economy/market-economy-audit.test.ts`
- `packages/simulation-tools/src/index.ts`
- `apps/cli/src/commands/market-economy-report.ts`
- `apps/cli/src/commands/market-economy-report.test.ts`
- `apps/cli/src/index.ts`
- `apps/cli/package.json`
- `docs/audits/PHASE_81A_MARKET_ECONOMY_BASELINE.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document
- the next relevant step document only if the inventory changes its scope

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/market-economy/market-economy-audit.test.ts \
  apps/cli/src/commands/market-economy-report.test.ts
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- The expiry-date distribution is measured and shows the current scatter
  explicitly, with the share of expiries on any single date recorded.
- Free-agent inflow, outflow, and share are measured separately.
- Every frozen band has a source and a current measured value beside it.
- The free-agent band is marked as a product decision rather than a sourced
  measurement, with an explicit note that it cannot detect a stagnant pool on
  its own.
- The free-agent share at day one of a new world is recorded, together with the
  number of season boundaries needed to reach steady state.
- All owners of expiry, term, and season-boundary logic are inventoried.
- No production behaviour changed.
- Step 02 is the only next action.
