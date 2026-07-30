# Step 02 - Market Funnel, Population And Wage Observability

## Status

Done on 2026-07-27.

## Goal

Expose enough structured evidence to explain why permanent transfers disappear,
why the free-agent pool grows, and how broadly wage pressure is distributed.

This step adds diagnostics only. It must preserve fixed-seed gameplay output.

## Required Diagnostic Model

### Permanent-Transfer Funnel

At season, world, and cohort level, distinguish at least:

- AI recruitment needs evaluated and recruitable;
- permanent targets found or unavailable;
- offers submitted;
- seller reject, counter, provisional accept, expiry, or cancellation;
- player-table start and terminal outcome;
- unaffordable completion;
- completed permanent transfer.

Every lost stage must use a stable structured reason where the engine already
knows one. Do not infer reasons from rendered text.

### Preliminary-Agreement Funnel

Distinguish:

- candidates found;
- offers submitted;
- accept, counter, reject, expiry, withdrawal, or cancellation;
- agreements created;
- activations completed;
- activation failures by structured reason.

### Free-Agent Stock And Flow

For each season expose:

- opening and closing stock;
- inflow from expiry and release;
- outflow to ordinary free-agent signing;
- outflow through preliminary-agreement activation;
- outflow through retirement or career step-down;
- age bands, public/current ability bands, and time-unattached bands.

The facts must let Step 04 distinguish a large employable pool from harmless
late-career residual records.

### Wage Pressure

Expose:

- p50, p90, p95, p99, and maximum club-season utilization;
- club-season counts/shares at `>=0.95`, exactly `1.0`, and `>1.0`;
- remaining annual-wage headroom distribution;
- whether transfer-to-wage reallocation caused the exact-ceiling state.

## Expected Files

- `packages/engine/src/career/ai-market-lifecycle.ts`
- focused engine market fact types/tests only where a missing structured reason
  cannot be derived by simulation tooling
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.test.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.ts`
- `packages/simulation-tools/src/long-run/career-long-runner.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- focused CLI tests and i18n labels if visible headings change
- `docs/audits/TRANSFER_MARKET_79A_DIAGNOSTIC_REPORT.md`
- `docs/PROJECT_STATUS.md`

## Implementation Checklist

- Reuse canonical lifecycle facts and ledgers before adding any new event.
- Keep high-volume diagnostics aggregated or streamed; do not retain complete
  career-state histories for every world.
- Print permanent and preliminary funnels separately in single-world and batch
  Markdown output.
- Add representative worst-world rows for:
  - zero permanent completions despite recruitment needs;
  - highest useful free-agent stock/share;
  - broadest wage pressure.
- Include the new structured fields in deterministic report hashes.
- Prove a fixed seed has identical football outcomes before and after the
  observability change.
- Update the diagnostic report and project status.

## What NOT To Implement

- Do not change AI choices, lifecycle ordering, budgets, valuation,
  willingness, contract demand, squad targets, exits, or warning thresholds.
- Do not count preliminary agreements as permanent transfers.
- Do not add unbounded per-player histories to the batch report.
- Do not emit localized prose from domain, engine, or simulation tools.
- Do not run `50 x 20`, `250 x 30`, or `750 x 50`.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/simulation-tools/src/long-run/contract-finance-stability.test.ts \
  packages/simulation-tools/src/long-run/career-long-runner.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm check
git diff --check
```

Use only single-world or small fixture-level diagnostic commands needed to
inspect the new output.

## Definition Of Done

- The report names the stage and reason where permanent talks disappear.
- Preliminary starts, agreements, and activations are no longer hidden behind
  the permanent-turnover headline.
- Free-agent stock is reconciled from opening stock plus inflows minus outflows.
- Wage pressure is a distribution, not only one maximum.
- Fixed-seed gameplay outcomes are unchanged.
