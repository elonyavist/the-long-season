# Step 05 - Wage Headroom Diagnostic Semantics

## Status

Done.

## Goal

Replace the misleading every-world maximum-utilization warning with evidence
that distinguishes an isolated club touching its ceiling from systemic wage
compression.

This step owns report semantics and any narrow replenishment accounting defect
proved by the new distribution. It does not own a broad wage-economy rebalance.

## Locked Semantics

- Any committed annual wage above the annual wage budget remains a hard
  structural failure.
- Exact `1.0` utilization remains visible.
- Cohort interpretation must use club-season distributions and headroom, not
  only the worst historical maximum.
- Transfer-to-wage reallocation remains explicit and must never create money.
- The existing `0.95` pressure boundary may be retained, relabeled, or paired
  with prevalence bands only after the Step 02 distribution is recorded.

## Expected Files

- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- focused CLI tests and i18n labels
- replenishment/finance policy files and tests only if Step 02 proves a real
  accounting defect rather than a diagnostic aggregation issue
- `docs/audits/TRANSFER_MARKET_79A_DIAGNOSTIC_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Document the before-change distribution for representative worlds.
- Keep maximum utilization and above-budget failures visible.
- Add p95/p99, pressure prevalence, exact-ceiling prevalence, and headroom.
- Give each machine-readable check one clear meaning:
  - structural overspend;
  - widespread pressure;
  - isolated ceiling contact;
  - informational headroom.
- Update deterministic CLI/Markdown output and localized labels.
- Change replenishment/finance behavior only if a focused test proves an
  unintended accounting or allocation defect.
- Update the diagnostic report and project status.

## What NOT To Implement

- Do not hide exact `1.0` values.
- Do not raise annual wage budgets globally to remove warnings.
- Do not reduce contract demand globally without football evidence.
- Do not weaken the `>1.0` failure.
- Do not change permanent transfers or free-agent policy.
- Do not run a multi-world long-run cohort.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/long-run/contract-finance-stability.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm check
git diff --check
```

## Definition Of Done

- Wage warnings communicate prevalence and severity.
- A lone exact-ceiling club-season no longer makes an otherwise healthy world
  look systemically compressed.
- Above-budget commitments still fail.
- Reallocation and headroom remain auditable.
- No broad finance tuning was used as a report fix.
