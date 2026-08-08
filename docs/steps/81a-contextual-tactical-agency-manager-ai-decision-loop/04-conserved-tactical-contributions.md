# Step 04 - Conserved Tactical Contributions

## Status

**Not started; authorized after Step 03D's U2 `GO` on 2026-08-08.** Checkpoint A's
`STOP / RETHINK` was resolved by **Checkpoint A2 (`03B`), which recorded a
conditional `GO` on 2026-08-08**. The engine work in 04-05 is authorized, but
the canonical modular-report migration is Done, so later checkpoints extend the
one Interface instead of creating isolated CLI/report paths. Step 06 and everything after it remain
closed until Step 05 restores the low-block band on both seed sets. Report:
`docs/audits/PHASE_81A_CHECKPOINT_A2_SQUAD_IDENTITY.md`.

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
- `packages/engine/src/match-engine/tactical-shape.ts`
- `packages/engine/src/match-engine/tactical-shape.test.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.ts`
- `packages/simulation-tools/src/tactical-agency/tactical-agency-audit.test.ts`
- `docs/PROJECT_STATUS.md`
- this step document
- `05-contested-routes-and-lateral-focus.md`

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
