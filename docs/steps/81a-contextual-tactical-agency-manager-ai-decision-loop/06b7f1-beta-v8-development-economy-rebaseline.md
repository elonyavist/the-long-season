# Step 06B7F1 - Beta V8 Development/Economy Re-baseline

## Status

Done. The owner explicitly confirmed that beta save compatibility is not a
constraint; no `v7` runtime path is retained. L4.4 is open.

## Goal

Make new development, public potential projection, player value and AI market
behaviour describe the same player trajectory before L4.4 or L5 runs.

## Frozen Inputs

- Step 06B7F changes only monthly positive-growth cap `0.08 -> 0.18`;
- the deterministic Phase 80A matrix has `1,620` observations, `324` complete
  cells and no ordering, stored-ceiling or coverage failure;
- measured projection values are the exact matrix output produced before this
  step edits content;
- no projection value is chosen from L4.4 or L5 output.

## What To Implement

1. Update `player-rating-scale-v7 -> v8` and nested projection policy `v4 ->
   v5` with the complete measured goalkeeper/outfield bands.
2. Advance the linked chain atomically:
   `valuation-curves-v5 -> v6`, `asking-price-curves-v4 -> v5`, and
   `market-behavior-calibration-v5 -> v6`.
3. Keep every non-version economic coefficient byte-identical.
4. Delete `PHASE_81A_PENDING_OUTFIELD_PROJECTION`; configured and measured
   columns return to plain equality for all `24` bands.
5. Old beta stamps are unsupported. Do not add a catalog, fallback, dual
   selector, migration or legacy asset.

This is a content-calibration invalidation, not the Step 14 storage schema and
event-envelope integration. Both may invalidate beta saves because the owner
has removed compatibility as a product constraint.

## Expected Files

- `packages/content/src/balance/player-rating-scale.json`
- `packages/content/src/balance/valuation-curves.json`
- `packages/content/src/balance/asking-price-curves.json`
- `packages/content/src/balance/market-behavior-calibration.json`
- `packages/content/src/balance/player-economy-calibration.test.ts`
- `packages/content/src/schemas/player-economy-calibration.schema.test.ts`
- `apps/cli/src/commands/simulation-report/career-world-facts.test.ts`
- `apps/cli/src/commands/career.test.ts` and
  `apps/web/src/runtime/web-career-runtime.test.ts`. The canonical identity
  includes calibration stamps; both independent surfaces must move to the same
  v8 hash in one edit or cross-app identity has diverged.
- `03a-squad-archetypes-and-primary-role-reachability.md`. Its temporary
  projection hold is resolved here: beta compatibility is no longer a reason
  to retain the superseded column.
- `docs/audits/PHASE_81A_CONTEXTUAL_TACTICAL_AGENCY_DESIGN_CONTRACT.md`
- this document, phase README, Steps 06B7G/14/15/16 and
  `docs/PROJECT_STATUS.md`

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/content/src/balance/player-economy-calibration.test.ts packages/content/src/schemas/player-economy-calibration.schema.test.ts apps/cli/src/commands/simulation-report/career-world-facts.test.ts
pnpm check
git diff --check
graphify update .
```

## Definition Of Done

All `24` configured projection bands equal the independently re-derived
matrix, linked versions reconcile, old version stamps fail closed, no `v7`
runtime asset remains and the full repository gate is green.

## Recorded Result

- all `24/24` configured bands equal the independently re-derived matrix;
- current stamps are rating scale `v8`, projection `v5`, valuation `v6`, asking
  price `v5` and market behaviour `v6`; the non-version economy coefficients
  did not move;
- old `player-rating-scale-v7` stamps fail closed and there is no catalog,
  fallback or migration;
- CLI and web independently produce canonical identity hash `0edd2a20`;
- the full gate is green: `299` files, `2,282` tests and `867` modules with no
  dependency violation;
- the real-world rollover test measured `39.9s` alone and `110.2s` contended;
  its local finite budget is now `180s` rather than the falsified `90s`.
