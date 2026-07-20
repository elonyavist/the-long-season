# Step 03 - Causal Team Statistics And Live Rating Projection

## Status

Done.

## Goal

Produce truthful cumulative team statistics, condition, and player ratings from
the same minute engine facts that decide the match.

## User-Visible Outcome

Engine snapshots can now explain the live match with possession, shots, shots
on target, xG, corners, saves, goals, condition, and meaningful provisional
ratings that converge into the final report.

## Scope

1. Extend minute control with a deterministic possession model based on
   midfield quality, pressing/risk/width/directness, score state, condition,
   and numerical advantage.
2. Let control affect chance creation without directly improving conversion.
3. Derive xG from actual chance/shot context and accumulate it once per shot
   outcome.
4. Emit and aggregate real corner facts when the existing shot resolution
   produces the corresponding outcome.
5. Aggregate shots, shots on target, saves, goals, and possession from each
   minute without UI reconstruction.
6. Keep fouls/cards at zero-capable typed fields until Step 04 supplies their
   real events; do not fabricate temporary values.
7. Progress on-pitch condition by real minutes and current match workload.
8. Refactor the existing player rating calculation into one incremental
   structured-fact projection used by live snapshots and final reports.
9. Make ratings react to meaningful contributions and errors, not random
   per-minute noise or score-only bonuses.
10. Add invariant/distribution tests for totals, bounds, event agreement,
    numerical advantage, and low-possession counterattacking wins.

## Implementation Contract

- Statistics are engine truth, not presentation estimates.
- Each event contributes exactly once and cumulative values are monotone where
  appropriate.
- Possession percentages are derived from cumulative control units and always
  form a valid home/away total.
- xG remains an internal calibrated decimal fact; rendering/rounding belongs to
  adapters.
- Live and final ratings use the same owner and contribution ledger.
- No pass completion, offside, tackle count, heatmap, or hidden-stat filler is
  introduced without a supporting model.

## Expected Files

- `packages/engine/src/match-engine/match-simulation-state.ts`
- `packages/engine/src/match-engine/step-match.ts`
- `packages/engine/src/match-engine/occasion-resolver.ts`
- `packages/engine/src/match-engine/aggregate-occasion-resolver.ts`
- `packages/engine/src/match-engine/player-match-rating.ts`
- `packages/engine/src/match-engine/create-match-report.ts`
- new focused statistics/control projection Modules under
  `packages/engine/src/match-engine/`
- focused engine tests
- current balance/config owner only if a validated coefficient is required
- `packages/simulation-tools/` report/test files needed for scoped distributions
- `docs/audits/LIVE_MATCH_CONTROL_REPORT.md`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No fouls, cards, injury policy, AI decisions, React UI, or visual charts.
- No cosmetic possession/xG values or hardcoded target result.
- No new player ability or global balance package.
- No duplicate live-rating formula in adapters or web.

## Required Checks

```bash
nvm use 24
pnpm --filter @game/engine run test
pnpm --filter @game/engine run typecheck
pnpm --filter @game/simulation-tools run test
pnpm --filter @game/simulation-tools run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Manual Inspection

- Inspect fixed-seed minute snapshots and confirm score, shots, shots on target,
  saves, xG, and ratings agree with emitted events.
- Inspect one high-possession loss and one low-possession win to confirm
  possession does not dictate conversion.
- Confirm a player rating changes after a real contribution and stays stable
  across empty minutes.

## Completion Criteria

- Every currently supported live statistic is causal and internally coherent.
- Live condition and rating projections share their final-report owners.
- Fixed-seed and distribution tests cover bounds and football plausibility.
- No adapter or UI formula duplicates engine truth.
- Step 04 remains the only next implementation step.
