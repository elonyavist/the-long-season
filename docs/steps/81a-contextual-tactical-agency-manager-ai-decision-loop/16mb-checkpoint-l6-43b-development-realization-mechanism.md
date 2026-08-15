# Step 16M-B - Checkpoint L6.43B Development-Realization Mechanism

## Status

**Ready.** Diagnostic/observation step only. No gameplay behaviour, content
coefficient, projection policy, academy rule, selection rule, transfer rule,
save schema or beta version changes here.

## User-Facing Question

Why do selected prospects who reach senior football and at least `900` minutes
still fail to become current-16 players? The answer must distinguish an
unlikely prospect, a ceiling that disappears, opportunity that arrives too
late and a genuinely underpowered development conversion.

## Frozen Population

- the exact L6.43A candidate policy and seven world seeds;
- ten seasons and exactly seven workers;
- only the `173` players classified as `development_realization` by the frozen
  L6.43A evaluator;
- stable player IDs, never names or final ownership;
- a fresh execution through the same canonical producer because the completed
  annual cache cannot locate the exact month cumulative senior minutes cross
  `900`;
- current product development code is read, not changed.

The canonical source report is
`simulation-out/phase81a-successor-pathway-l6-43a-paired-7x10.json`, hash
`41ceb57e7f472fd3bd5e314b83d7abe6`. The replay must reproduce its assignments,
closed/open windows, terminal counts, owner and six-star divergence facts
exactly outside the new monthly observation payload. Any drift is
`STOP_INSTRUMENT`.

## What To Implement

Extend the existing successor-pathway evaluator; do not create another funnel.
The engine already produces `PlayerMonthlyDevelopmentChange` from canonical
participation rows. Expose those existing facts only when the locked diagnostic
profile requests them, carry them through the season facts without rebuilding
their formulas, and discard non-selected IDs at the report boundary.

For each of the `173` IDs derive:

- assignment current, p50, upper and stored-ceiling ability;
- first senior registration and exact month in which cumulative senior minutes
  reach `900`;
- canonical role-current and role-potential ability at that monthly boundary;
- age, broad position group, real minutes, current/potential before and after,
  total growth/decline and canonical policy multipliers at that boundary;
- whether `monthlyGrowthAgeMultiplier(...)` is positive at that exact age;
- maximum current ability and first current-16 season, if any;
- one exclusive mechanism from the ordered contract below.

The evaluator calls the canonical monthly policy from engine with the retained
participation row. It never copies age bands, role weights, performance,
opportunity or environment formulas. Annual public p50/upper projections remain
diagnostic context; exact ordering at `900` uses the engine's monthly
role-current and role-potential facts.

## Frozen Exclusive Mechanisms

In this order:

1. `expected_ceiling_below_16_at_intake`;
2. `ceiling_lost_before_opportunity`;
3. `opportunity_after_growth_window`;
4. `realization_rate_under_viable_projection`;
5. `instrument_failure`.

Their exact definitions and the `5/7`, `0.20`, `0.05` owner rule live in
[`PHASE_81A_DEVELOPMENT_REALIZATION_RECOVERY_CONTRACT.md`](../../audits/PHASE_81A_DEVELOPMENT_REALIZATION_RECOVERY_CONTRACT.md)
and are not repeated or relaxed here.

The report includes per-world counts, pooled shares, the owner margin and raw
player rows. Raw rows show IDs plus presentation names when available, but the
decision never reads names.

## Decision

- **`OWNER_IDENTIFIED`**: exactly one mechanism satisfies all frozen owner
  conditions. Open only its conditional branch in Step 16M-C.
- **`MIXED`**: facts reconcile but no mechanism satisfies the owner rule. Step
  16M-C stays blocked and a preregistered factorial is required.
- **`STOP_INSTRUMENT`**: cache mismatch, missing/duplicate ID, non-exclusive
  category, missing boundary, copied policy or reconciliation failure. Fix only
  this step and repeat unchanged.

No result is a gameplay `GO`.

## Expected Files

- `packages/engine/src/career/player-development.ts`,
  `advance-career-month.ts`, `advance-career-season.ts` and their tests - expose
  already-produced per-player monthly changes only behind one typed
  observation request; no second formula and no default product payload.
- `apps/cli/src/commands/simulation-report/career-world-facts.ts` and existing
  tests - forward the typed observation request through the canonical report
  producer and prove observer-off results are byte-identical.
- `apps/cli/src/commands/simulation-report/stationary-age-succession-attribution.ts`
  and test - deepen the sole evaluator and prove exhaustive categories.
- `apps/cli/src/commands/simulation-report/career-sections.ts` - collect only
  selected IDs and require exact L6.43A continuity outside new facts.
- `apps/cli/src/commands/simulation-report/report-registry.ts` and
  `report-planner.test.ts` - one locked L6.43B profile on the L6.43A seeds,
  policy, versions, ten seasons and seven workers.
- `packages/i18n/src/labels.ts` - canonical profile discovery text in all five
  languages.
- generated L6.43B audit, audit index, this step, phase README, Step 16M-C,
  Step 16N and `docs/PROJECT_STATUS.md`.

Any additional file must be added here with its ownership reason before edit.

## Required Checks

1. Use `graphify explain` and `graphify affected --depth 2` on the evaluator,
   cache reader and canonical age policy.
2. The reachability corpus is frozen to all `716` selected IDs in the exact
   replay, while the decision denominator remains the exact `173`.
   Focused tests must find real rows reaching every retained product mechanism;
   an unreachable mechanism is removed rather than preserved as speculative
   code. The decision categories must sum to `173`; owner and mixed outcomes
   are exercised from real rows, and corrupting one otherwise-real row must
   produce `STOP_INSTRUMENT`.
3. Run a `7 x 1` observer-purity canary, then the fresh `7 x 10` alone with
   exactly seven workers. Rebuild from its completed facts to a distinct file
   and require byte-identical JSON and decision.
4. Run `graphify update .`, stale-symbol search, `git diff --check` and
   `pnpm check` alone.

## What NOT To Implement

- no growth, potential, aging, minutes, academy or market change;
- no copied current/potential, age, minutes or growth formula;
- no final-state reconstruction where a dated boundary exists;
- no interpretation when observation changes an L6.43A headline fact;
- no second simulator or report entrypoint;
- no Step 16M-C branch selection by qualitative inspection.

## Definition Of Done

All `173` players reconcile to one exclusive mechanism, the checkpoint records
`OWNER_IDENTIFIED`, `MIXED` or `STOP_INSTRUMENT`, and only a demonstrated owner
can open Step 16M-C.
