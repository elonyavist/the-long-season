# Step 09 - Market, Report, And Web Adapter Ability Alignment

## Status

Done.

## Goal

Remove the last ambiguous player-quality formulas from valuation, willingness,
CLI reporting, and the web match-preparation adapter.

## Inspectable Outcome

- Market valuation distinguishes role current ability from role potential and
  applies age/contract-free current market policy on top of those facts.
- Willingness consumes valuation/player facts without a second ability formula.
- CLI reports label raw averages and role-weighted values accurately.
- Web auto-selection and candidate ordering consume canonical role facts while
  preserving tactical suitability as a separate calculation.

## Scope

1. Align player valuation and willingness with the Step 01 semantic
   classification.
2. Add before/after fixtures for goalkeeper, defender, midfielder, winger, and
   striker profiles across age/potential bands.
3. Preserve transfer-budget and acceptance interfaces; change only the player
   quality input proven ambiguous by the audit.
4. Migrate ten-season/player-generation/development report projections to
   explicit canonical measures and labels.
5. Migrate the web match-preparation adapter's private ability average without
   changing board geometry, role suitability levels, candidate rules, or
   interaction behavior.
6. Add focused tests proving a role specialist ranks coherently and no player
   is duplicated or silently moved.
7. Delete all replaced market/report/web helper implementations.

## Implementation Contract

- A role-aware valuation change is a deliberate behavior change and must show
  before/after samples; it may not be hidden as refactoring.
- Existing currency, budget, willingness, and transfer-application contracts
  remain unchanged.
- CLI remains an adapter over structured facts.
- Web remains an adapter/presenter and may not own generation or valuation
  policy.
- Tactical suitability keeps its current public levels and call sites unless
  the canonical input can replace a duplicate without changing behavior.

## Expected Files

- `packages/engine/src/market/player-valuation.ts`
- `packages/engine/src/market/player-valuation.test.ts`
- `packages/engine/src/market/player-willingness.ts`
- `packages/engine/src/market/player-willingness.test.ts`
- `apps/cli/src/commands/ten-season-report/report-data.ts`
- `apps/cli/src/commands/ten-season-report.test.ts`
- `apps/cli/src/commands/simulate-season/generated-inspection-output.ts`
- `apps/cli/src/commands/simulate-season.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.ts`
- `apps/web/src/features/match-preparation/match-preparation-adapter.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

## What NOT To Implement

- No Market UI or Phase 75 behavior.
- No scouting fog, recommendations, negotiations, contracts, wages, or loans.
- No tactical-board visual/interaction change.
- No report threshold relaxation.
- No duplicated app-local fallback formula.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/market/player-valuation.test.ts packages/engine/src/market/player-willingness.test.ts apps/cli/src/commands/ten-season-report.test.ts apps/cli/src/commands/simulate-season.test.ts apps/web/src/features/match-preparation/match-preparation-adapter.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/cli run typecheck
pnpm --filter @game/web run test
pnpm --filter @game/web run typecheck
pnpm depcruise
git diff --check
graphify update .
```

## Cleanup Boundary

Delete private ability-average helpers after market, report, and adapter tests
cover the canonical replacement. Do not keep an app compatibility formula.

## Completion Criteria

- Market, reports, and web adapter use explicit canonical ability semantics.
- Any valuation behavior change has bounded football evidence.
- Tactical-board behavior and current web journey remain unchanged.
- No ambiguous migrated helper remains.
- Step 10 is the single next action.
