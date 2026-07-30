# Step 06 - Focused Regression And 50x20 Calibration Gate

## Status

Done.

## Result

The final `50 x 20` cohort has zero Phase 79A-owned failure: minimum senior
squad `18`, no club below the minimum, no club without a natural goalkeeper,
zero contract/finance structural violations, and zero wage overspend. The
generic report remains `FAIL` only for the existing seven-season
`champion_streak` story boundary in worlds `00001` and `00046`.

Gate investigation found and fixed three real concurrency/lifecycle edges:

- a negotiated transfer now rechecks seller squad and department floors at
  atomic completion because provisional agreements reserve neither player nor
  squad slot;
- emergency free-agent replenishment may use the strongest affordable
  non-preferred department only while a club is below the hard squad minimum;
- a retirement is deferred when it would remove the last player in a club's
  broad department.

The final parallel verification used the same 50 seeds and 20 seasons with
eight deterministic worker partitions. Repeated single-world outputs match
byte for byte with SHA-256 `c70983aa...` (`00025`), `5e64535b...` (`00041`),
and `91f5f94f...` (`00023`).

## Goal

Compare the complete Phase 79A behavior against the exact baseline cohort
without starting the Phase 79 release-scale gate.

## Required Sequence

1. Run all focused market, negotiation, preliminary-agreement, contract,
   finance, free-agent, squad, long-run, CLI, and persistence tests touched by
   the phase.
2. Run the full repository gate.
3. Repeat named representative worlds `00025`, `00041`, and `00023`.
4. Prove deterministic equality for a prescribed repeated sample.
5. Run the exact baseline `50 worlds x 20 seasons` cohort.
6. Compare before/after funnel, free-agent stock/flow, wage distribution,
   structural, match-balance, population, and story metrics.
7. Investigate every new hard failure and any regression in a metric owned by
   Phase 79A.

## Expected Files

- `docs/audits/TRANSFER_MARKET_79A_50X20_REPORT.md`
- `docs/audits/TRANSFER_MARKET_79A_DIAGNOSTIC_REPORT.md`
- current Phase 79A production/test files only for a defect reproduced by this
  gate
- `docs/PROJECT_STATUS.md`

## Acceptance Contract

- zero transfer-window, negotiation-clock, preliminary-agreement, contract,
  finance, ownership, registration, or squad-structure failure;
- no committed annual wage above budget;
- minimum senior squad remains at least `18`;
- no club lacks a natural goalkeeper;
- permanent-transfer activity satisfies the pre-change boundary locked in Step
  03 without guaranteed deals;
- useful free-agent stock satisfies the bounded-equilibrium criteria locked in
  Step 04;
- wage pressure is interpretable through Step 05 distributions;
- goals, assists, table spread, active-population edges, and champion streaks
  are compared but not tuned by this phase;
- repeated fixed-seed structured hashes match.

An existing champion-streak story failure may keep the generic anomaly gate
red. That alone does not invalidate Phase 79A when all phase-owned criteria
pass, but it must remain visible and named.

## What NOT To Implement

- No threshold weakening, warning suppression, seed removal, or result
  fabrication.
- No unrelated match, league, player-development, youth, or UI fix.
- No `250 x 30`, `750 x 50`, or `10,000 x 50` run.
- No broad cleanup; Step 07 owns documentation closeout only.

## Required Checks

```bash
nvm use 24
pnpm check
pnpm cli ten-season-report \
  --seed-prefix=phase79-market-smoke-50x20 \
  --worlds=50 \
  --seasons=20 \
  --report-output=docs/audits/TRANSFER_MARKET_79A_50X20_REPORT.md
git diff --check
```

Run the documented fixed-seed repeat command produced by Step 02 and record its
structured hashes in the report.

## Definition Of Done

- The exact cohort completes and the report is durable.
- Phase-owned structural criteria pass in all 50 worlds.
- Before/after market funnel, free-agent flow, and wage distributions are
  recorded.
- Every remaining warning or failure is classified without hiding it.
- Step 07 is the only next action.
