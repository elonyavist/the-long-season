# Step 04 - Conserved Tactical Contributions

## Status

**Done on 2026-08-08.** Every outfield role now allocates one exact common
budget; the goalkeeper remains isolated and the scalar executor is otherwise
unchanged. Step 05 is the only next action. Step 06 and everything after it
remain closed until Step 05 restores the low-block band on both seed sets.

Two things carried in from A2 that this step should know:

- **Clubs no longer share one shape.** `topFormationShare` is `0.2063`/`0.2222`
  across `12`/`11` distinct shapes, and all ten primary roles are generable. A
  role-budget change is now measured against a population with real variety,
  so a regression that would once have hidden inside a `4-2-4` monoculture has
  somewhere to show.
- **The low block's exchange rate is already outside its band** -
  `ownLossPerConcededReduction` `2.8051` against `<= 2.0` out-of-sample, on
  both the current chart and the legacy chart applied to Phase 81A-generated
  ability vectors (A2.1). **Step 05 owns the repair.** This step must not be
  credited with moving it, and must not be blamed for it either.

## Goal

Make every outfield role allocate the same total tactical budget instead of
creating more football because its weights sum higher.

## What To Implement

- Store one common role budget in the versioned calibration.
- Express task weights as allocations whose role sum is exact.
- Derive totals; never persist raw and normalized weights together.
- Keep the current scalar executor temporarily to isolate conservation.
- Prove algebraically: equal sums, positive reachable allocations, portiere
  isolation, and every increase paired with a decrease.
- Prototype per-role first; use phase sub-budgets only if the simple model
  analytically collapses on balanced saturation.

## Expected Files

- `packages/domain/src/balance/match-tactics-calibration.ts`
- `packages/domain/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/balance/match-tactics-calibration.json`
- `packages/content/src/balance/match-tactics-calibration.test.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.ts`
- `packages/content/src/schemas/match-tactics-calibration.schema.test.ts`
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/engine/src/test-fixtures/match-tactics-calibration.ts`
- `packages/engine/src/use-cases/simulate-season.test.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `packages/simulation-tools/src/test-fixtures/match-tactics-calibration.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `05-contested-routes-and-lateral-focus.md`

The content schema and its tests are owned here because the common budget is a
new required field of the versioned asset; leaving the parser on the old shape
would make the contract impossible to load. The engine and simulation-tools
fixture owners are also included because every calibration accepted by the
domain validator must now obey conservation. They remain fixtures rather than
copies of shipped tuning.
`simulate-season.test.ts` owns the compact deterministic season sentinel. The
conserved allocations intentionally changed one result and one scorer over its
306 fixtures; the sentinel is re-recorded with that gameplay cause rather than
left as an unexplained golden drift.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/domain/src/balance/match-tactics-calibration.test.ts
pnpm exec vitest run packages/engine/src/match-engine/tactical-shape.test.ts
pnpm exec vitest run packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts
pnpm check
git diff --check
graphify update .
```

## What NOT To Implement

No player task attributes, roster generation, AI, manager information, or
simulation-based excuse for a failed algebraic invariant.

## Definition Of Done

Conservation is exact and canonical, no derived duplicate exists, every new
branch is reachable on real roles, and Step 05 is the only next action.

## Outcome

- Adopted one `outfieldRoleBudgetBasisPoints = 42_000`. The historical coherent
  `4-4-2` spent `41_980` per outfield player on average, so this budget isolates
  conservation without intentionally adding a new global level.
- Replaced the old contribution table with
  `taskAllocationBasisPointsByRole`. The shipped ratios were used only as the
  migration starting point and are not retained beside the allocations.
  Blind proportional normalization made a centre back the best builder and a
  striker the best presser; the final content explicitly restores football
  ownership while preserving every row sum.
- Advanced the calibration asset contract to schema `2` and content version
  `match-tactics-calibration-v2`. This changes no storage schema, envelope or
  persisted field, so Step 14 remains the only beta persistence reset.
- `tacticalRoleAllocationTotal(...)` is the single ordered sum used by domain
  validation and diagnostics. A `+1` overspend fails; a paired increase and
  decrease passes. All eleven outfield roles allocate `42_000`, all ten tasks
  remain positive for each, and the goalkeeper allocates `0`.
- `summarizeTacticalContributionConservation(...)` exposes those algebraic
  facts without simulating a match or storing derived totals.
- The deterministic 306-fixture season sentinel moved by one result and one
  goal: the bottom club has `27` rather than `28` points and the leading scorer
  has `6` rather than `7` goals. Champion, runner-up, fixture count and endpoint
  fixtures remain unchanged; the intentional consequence is pinned.

Verification:

- domain calibration: `39/39`;
- content calibration/schema: `16/16`;
- tactical shape: `25/25`;
- tactical-agency audit: `19/19`;
- season sentinel: `30/30`;
- `pnpm check`: `293` files, `2225` tests, `855` modules, exit `0`;
- `git diff --check`: clean before documentation closeout.

Next action: Step 05 deepens the minute plan, adds the single lateral-focus
owner and must restore the frozen low-block xG band on both A2 seed sets before
Checkpoint B can open.
