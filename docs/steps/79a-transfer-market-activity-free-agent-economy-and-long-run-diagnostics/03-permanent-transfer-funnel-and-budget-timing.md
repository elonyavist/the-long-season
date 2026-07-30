# Step 03 - Permanent-Transfer Funnel And Budget Timing

## Status

Done.

## Goal

Correct the measured bottleneck that makes permanent transfers nearly absent
without forcing deals or weakening legal, financial, negotiation, or
squad-protection rules.

## Decision Contract

Before changing behavior, append to the Phase 79A diagnostic report:

- the dominant loss stage and reason from Step 02;
- its frequency by season and club;
- whether the same clubs successfully start preliminary agreements instead;
- a written football reason for the proposed correction;
- a pre-change acceptance boundary based on activity per club-season, not only
  the number of worlds with any transfer.

The acceptance boundary must show meaningful permanent-market participation
while still allowing quiet clubs, failed windows, poor clubs, seller refusal,
and zero-transfer individual seasons. It must not guarantee a deal.

## Candidate Owners To Inspect

- annual distribution and transfer-budget refresh ordering relative to market
  windows;
- `deriveAiMarketNeeds` recruitability and wage-pressure gates;
- permanent target availability and seller squad protection;
- current fee, signing-bonus, and wage affordability;
- annual and active-talk caps;
- the unconditional preliminary fallback after an unsuccessful permanent
  attempt.

Only the owner proven responsible by Step 02 may change.

## Expected Files

- focused files under `packages/engine/src/career/` that own the proven
  bottleneck
- matching focused tests
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
  only if the Step 02 metric needs a factual correction
- `docs/audits/TRANSFER_MARKET_79A_DIAGNOSTIC_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Write a focused failing test that reproduces the dominant bottleneck.
- Apply the smallest policy or orchestration correction at the canonical owner.
- Keep every offer inside a resolved transfer window.
- Keep both three-day stages and original-deadline counter semantics.
- Keep affordability rechecks and atomic completion.
- Keep seller minimum-squad and department protection.
- Preserve selected-club agency and deterministic stable ordering.
- Prove poor or constrained clubs can still make no permanent signing.
- Compare fixed representative seeds before and after using the Step 02 funnel.
- Update the diagnostic report and project status.

## What NOT To Implement

- No guaranteed transfer count, random rescue deal, synthetic turnover fact,
  free player disguised as a permanent transfer, or seed exception.
- No weakening the minimum squad, goalkeeper, ownership, registration,
  contract, cash, transfer-budget, or wage-budget invariants.
- No change to free-agent stock policy; Step 04 owns that question.
- No warning-threshold or report-severity change.
- No `50 x 20` or larger cohort.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run test
pnpm check
git diff --check
```

Run only the named representative worlds and small focused cohorts needed to
verify the funnel correction.

## Definition Of Done

- The pre-change bottleneck is reproducible by a focused test.
- The adopted correction has one football reason and one canonical owner.
- Permanent-transfer opportunity and completion improve at the measured stage.
- Quiet windows and unsuccessful clubs remain possible.
- Preliminary agreements remain a distinct expiring-contract strategy.
- All Phase 79 structural invariants remain strict and passing.
