# Step 01 - Lock 50x20 Baseline And Diagnostic Contract

## Status

Done.

## Goal

Turn the 2026-07-27 `50 x 20` investigation into the durable Phase 79A
baseline and lock what later steps must measure before changing behavior.

This step is documentation-only.

## Baseline To Record

- `50` worlds, `20` seasons, `1,000` simulated seasons.
- Partition hash: `d9f3b553d6fefb50`.
- Gate status: `FAIL`, caused by one world with `champion_streak=7`.
- Contract/finance structural violations: `0`.
- Minimum senior squad: `18`.
- Clubs below minimum: `0`.
- Clubs without a natural goalkeeper: `0`.
- Permanent-transfer turnover:
  - non-zero in `13 / 50` worlds;
  - zero and therefore warning in `37 / 50` worlds.
- Wage utilization warning: `50 / 50` worlds.
- Free-agent population-share warning: `50 / 50` worlds.
- Representative market-active facts:
  - world `00025`: `0` permanent transfers, `525` preliminary agreements,
    `311` activations, peak free-agent share `0.4099`;
  - world `00041`: `0` permanent transfers, `531` preliminary agreements,
    `291` activations, peak free-agent share `0.4314`;
  - world `00023`: `1` permanent transfer, `516` preliminary agreements,
    `301` activations, peak free-agent share approximately `0.424`.

Representative-world values are diagnostic samples, not cohort aggregates.

## Diagnostic Questions To Lock

1. At which exact permanent-transfer funnel stage are candidate deals lost?
2. Does market execution before annual transfer-budget refresh materially
   reduce affordable permanent targets?
3. How often does the preliminary-agreement fallback replace a failed
   permanent-transfer attempt, and for which reason?
4. Which events add players to the free-agent pool, which remove them, and how
   long do useful prime-age players remain unattached?
5. Is the large pool mainly employable talent, aging residual population, or a
   denominator/reporting problem?
6. How many club-seasons operate at `>=0.95`, exactly `1.0`, or above `1.0`
   wage utilization, rather than merely whether one historical maximum exists?

## Expected Files

- `docs/audits/TRANSFER_MARKET_79A_DIAGNOSTIC_REPORT.md`
- `docs/PROJECT_STATUS.md`
- the next step document only if the baseline changes its scope

## Implementation Checklist

- Copy the temporary `50 x 20` cohort facts into the durable diagnostic report;
  do not present the temporary `/tmp` path as durable evidence.
- Record the threshold definitions and aggregation semantics for each warning.
- Record the three representative seasonal trajectories and distinguish facts
  from hypotheses.
- Classify findings as:
  - structural integrity;
  - real market-economy risk;
  - diagnostic-semantics defect;
  - football-story or monitor signal outside Phase 79A.
- Lock the questions above and the Step 02 event/metric vocabulary.
- Update `docs/PROJECT_STATUS.md` and make Step 02 the only next action.

## What NOT To Implement

- Do not change production or test code.
- Do not change warning thresholds or classifications.
- Do not change AI targeting, finance timing, replenishment, expiry, release,
  or retirement behavior.
- Do not run another multi-world long run.
- Do not treat representative-world counts as cohort totals.

## Required Checks

```bash
test -f docs/steps/79-transfer-market-windows-negotiations-and-market-workspace/14-market-contract-finance-and-squad-long-run-gates.md
git diff --check
```

## Definition Of Done

- The diagnostic report contains the exact reproducible baseline.
- Every later tuning hypothesis is labeled as a hypothesis.
- Step 02 has an explicit list of missing facts to expose.
- No gameplay or report behavior changed.
