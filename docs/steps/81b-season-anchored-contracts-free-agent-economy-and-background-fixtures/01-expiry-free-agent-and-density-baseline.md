# Step 01 - Expiry, Free-Agent And Density Baseline

## Status

Not started. Phase 81B.

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
  - the free-agent pool at two named points in the season, not as an annual
    average. The pool is cyclical: it peaks at the season boundary when
    contracts expire together, and reaches its trough once the summer window
    closes and clubs have signed. A single averaged number describes neither
    state and hides the defect;
  - the pool's inflow separated into contract expiry and release, and its
    outflow separated into signings and exits. Signing and exit both remove a
    player from the pool but mean opposite things: one is a market that works,
    the other is a player leaving football. A drain satisfied entirely by exits
    is not a market;
  - arrivals per club per season, split by permanent transfer, free-agent
    signing, youth promotion, and intake;
  - permanent transfer completions per season per club.
- Freeze the density bands from the consolidated analysis, section 12.1, with
  their sources: permanent share `15-22%`; loans `10-14%`, recorded as
  `not_evaluated` in this phase because loans do not exist; fee-bearing share
  `14-22%`; contracts under six months `10-20%`; season boundary share `100%`.
- Re-decide two bands before freezing them, because the accepted three-year
  contract ladder makes their sourced values unreachable: **arrivals per club**,
  sourced from CIES at `8-13`, and **contract-expiry share**, sourced from FIFA
  at `55-68%`. Both assume a real-football mean term of `19.5` months. With
  three-year terms roughly a third of a squad reaches expiry per season instead
  of well over half, so the game is deliberately less churny than reality.
  Derive the reachable values from the ladder, freeze those, and record the
  original sourced values beside them as the reality reference. A band the
  product has chosen not to hit must be labelled a choice, never reported later
  as a miss.
- Freeze mean contract duration at about `36` months, replacing the `18-30`
  month band inherited from FIFA. That band was proposed when contract length
  was believed to be the main lever on market density; it is not, and today's
  ladder already averages `2.75` years.
- Freeze the free-agent contract as three numbers rather than one level, because
  the pool is cyclical and a single band would average its peak with its
  trough:
  - **peak**, measured at the season boundary immediately after expiries:
    `5-7%` of that competition's senior squad population. The denominator is per
    competition, not world-wide, so a five-country world does not dilute it. The
    peak is deliberately low: it is the single largest exploit surface in the
    game, because at that moment the manager can study every available player at
    leisure while the AI acts on a fixed cadence. A large pool of free talent
    would let a human build a squad for nothing and would make paid transfers
    pointless;
  - **trough**, measured once the summer window closes: a leftover pool of
    roughly `2%` of the same denominator, which in the current `54`-club world
    is about `30-40` players. This is the state a career actually opens in;
  - **drain**, the delta between them. This is the primary signal. A pool whose
    peak and trough coincide does not drain, whatever its level; a band on the
    level alone cannot detect that, which is why the level is not the gate.
- Attribute the drain. A pool can empty because clubs sign players or because
  players leave football through retirement and career step-down. Both remove a
  player and mean opposite things, so the report separates them and states the
  signing share explicitly. A trough reached mostly by exits is a shrinking
  world, not a working market.
- Record the peak and trough measured today, so Step 06 compares a cycle with a
  cycle.
- Measure what a new world actually opens with. Generation assigns every player
  to a club and a free agent is by definition unowned, so the pool starts at
  zero and fills only at the first expiry. Record the share at day one and at
  each subsequent season boundary, and state how many seasons the current world
  needs to reach its cycle. Opening at zero is close to the trough and therefore
  nearly right; opening at zero and then never returning to zero is what makes
  it wrong.
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
- `docs/audits/PHASE_81B_MARKET_ECONOMY_BASELINE.md`
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
- The free-agent contract is expressed as peak, trough, and drain, with the
  denominator stated per competition, and the report says plainly that the drain
  is the gate and the levels are description.
- Pool outflow is attributed between signings and exits, with the signing share
  stated.
- The free-agent share at day one of a new world is recorded, together with the
  number of season boundaries needed to reach the cycle.
- All owners of expiry, term, and season-boundary logic are inventoried.
- No production behaviour changed.
- Step 02 is the only next action.
