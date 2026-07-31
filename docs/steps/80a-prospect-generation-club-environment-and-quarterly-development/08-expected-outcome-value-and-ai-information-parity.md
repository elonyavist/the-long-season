# Step 08 - Expected-Outcome Value And AI Information Parity

## Status

Not started.

## Goal

Price prospects from expected development and uncertainty, preserve asking
price as a separate seller fact, and prevent live AI from reading stored
ceiling.

## What To Implement

- Make public value consume the canonical public assessment, age, and existing
  role/source-calibrated global curves frozen in Step 01. It must not derive a
  second potential projection from `Player`.
- Keep full upper from being priced as guaranteed.
- Remove `marketContext` from the public-valuation domain/input path, config,
  schema, fixtures, adapters, reports, and call sites.
- Remove category/free-agent multipliers and per-context maximums completely;
  do not retain neutral coefficients, aliases, fallbacks, or compatibility
  branches.
- Preserve one rare, eligibility-gated global exact `€150m` public-value cap.
- Prove transfer, promotion/relegation, owner-category, expiry, and free-agent
  transitions alone do not change public value.
- Preserve exact zero free-agent transfer fee separately from unchanged,
  non-zero intrinsic public value.
- Keep contract, importance, seller finance, and willingness in asking price,
  not intrinsic value; category may influence asking price only.
- Replace live AI stored-ceiling target checks with the canonical public
  assessment plus club need, budget, and risk appetite.
- Keep stored ceiling inside generation, development hard caps, canonical
  public-projection derivation, and diagnostics only; do not pass it into
  public valuation or live AI decision inputs.
- Keep `derivePlayerValuation(...)` free of `CareerState`, owner, employment
  kind, seller posture, and stored ceiling; those facts belong to asking-price
  or market-action Modules.
- Add absence tests/searches so live market paths cannot regain privileged
  ceiling access.

## What NOT To Implement

- No incoming selected-club offers, listing posture, loan, or Posta UI.
- No post-output threshold selection or division-specific intrinsic-value
  factor.
- No compact values, transfer-fee policy change, or observer-specific stars.

## Expected Files

- `packages/content/src/balance/valuation-curves.json`
- `packages/content/src/schemas/player-economy-calibration.schema.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `packages/domain/src/balance/player-economy-calibration.ts`
- `packages/domain/src/balance/player-economy-calibration.test.ts`
- `packages/engine/src/market/player-valuation.ts`
- `packages/engine/src/market/player-valuation.test.ts`
- `packages/engine/src/market/transfer-feasibility.ts`
- `packages/engine/src/market/transfer-feasibility.test.ts`
- `packages/engine/src/test-fixtures/player-valuation-config.ts`
- `packages/engine/src/career/career-market-catalog.ts`
- `packages/engine/src/career/career-market-catalog.test.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.ts`
- `packages/engine/src/career/apply-career-free-agent-signing.test.ts`
- `packages/engine/src/career/transfer-negotiation.ts`
- `packages/engine/src/career/transfer-negotiation.test.ts`
- `packages/engine/src/career/ai-market-lifecycle.ts`
- `packages/engine/src/career/ai-market-lifecycle.test.ts`
- `packages/simulation-tools/src/long-run/contract-finance-stability.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.ts`
- `packages/simulation-tools/src/player-generation-economy-audit.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report/gate-output.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/cli/src/commands/career.test.ts`
- `apps/web/src/features/market/career-market-adapter.ts`
- `apps/web/src/features/market/career-market-adapter.test.ts`
- `apps/web/src/features/squad/career-squad-adapter.ts`
- `apps/web/src/features/squad/career-squad-adapter.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`
- this step document

## Required Checks

```bash
nvm use 24
pnpm exec vitest run \
  packages/content/src/schemas/player-economy-calibration.schema.test.ts \
  packages/domain/src/balance/player-economy-calibration.test.ts \
  packages/engine/src/market/player-valuation.test.ts \
  packages/engine/src/market/transfer-feasibility.test.ts \
  packages/engine/src/career/career-market-catalog.test.ts \
  packages/engine/src/career/apply-career-free-agent-signing.test.ts \
  packages/engine/src/career/transfer-negotiation.test.ts \
  packages/engine/src/career/ai-market-lifecycle.test.ts \
  packages/simulation-tools/src/player-generation-economy-audit.test.ts \
  apps/cli/src/commands/ten-season-report.test.ts \
  apps/cli/src/commands/career.test.ts \
  apps/web/src/features/market/career-market-adapter.test.ts \
  apps/web/src/features/squad/career-squad-adapter.test.ts
pnpm --filter @game/content run typecheck
pnpm --filter @game/domain run typecheck
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Definition Of Done

- Wide uncertain prospects are valuable but discounted relative to developed
  stars.
- Public value is invariant under transfer, owner division, category change,
  expiry, and free agency.
- `marketContext`, its multipliers, and its per-context maximums no longer
  exist in production valuation paths.
- Asking price remains distinct.
- Exact `€150m` hits use one global cap and are rare and correctly eligible.
- AI and manager consume the same public assessment.
- Valuation, willingness, and AI cannot bypass the public-assessment Interface
  by calling projection helpers directly.
- No live AI target path reads stored ceiling.
- Step 09 is the only next action.
