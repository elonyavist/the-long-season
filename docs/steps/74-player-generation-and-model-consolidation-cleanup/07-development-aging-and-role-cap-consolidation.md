# Step 07 - Development, Aging, And Role-Cap Consolidation

## Status

Done.

## Goal

Make seasonal growth and decline consume the canonical ability algebra and role
profiles while preserving the current deterministic development model.

## Inspectable Outcome

- Development no longer duplicates the 25 ability paths, role buckets, or hard
  caps.
- Growth uses attribute-level room between current and potential.
- Aging/decline remains role-aware and bounded.
- A young lower-division prospect can improve over 5-7 seasons without crossing
  role-incoherent caps or exceeding potential.

## Scope

1. Replace development-local ability traversal with the canonical domain
   algebra.
2. Replace development-local role classification/caps with the canonical role
   profiles.
3. Preserve growth opportunity, age curves, realization, decline, seeded noise,
   and public result contracts unless the baseline proves an invariant defect.
4. Ensure every updated attribute remains `1..20`, does not exceed potential,
   and obeys the role cap.
5. Make role current/potential summaries explicit in development reporting.
6. Split `player-development.ts` only if a coherent policy module reduces real
   complexity and has a current consumer/test; do not split by line count alone.
7. Add deterministic repeat, no-room, stalled-prospect, peak-age, veteran
   decline, goalkeeper, and role-cap regression tests.
8. Delete all replaced local ability/role tables and read/write helpers.

## Implementation Contract

- The engine remains the owner of development decisions.
- Domain profiles describe football meaning; they do not decide seasonal
  growth rates.
- Seed and player ordering remain stable.
- Current/potential comparison is per attribute before any aggregate summary.
- No player can gain ability because a refactor rounds a scalar differently.

## Expected Files

- `packages/engine/src/career/player-development.ts`
- `packages/engine/src/career/player-development.test.ts`
- `packages/engine/src/career/player-development-policy.ts`
- `packages/engine/src/career/player-development-policy.test.ts`
- `packages/engine/src/index.ts`
- `apps/cli/src/commands/career/development-output.ts`
- `apps/cli/src/commands/career/season-labs.ts`
- `apps/cli/src/commands/career.test.ts`
- `docs/PROJECT_STATUS.md`
- `docs/roadmaps/CAREER_PLAYABILITY_AND_ENGINE_ROADMAP.md`
- `docs/roadmaps/CAREER_WEB_SECTION_ROADMAP.md`

The two `player-development-policy` files are conditional: create them only if
the Step 01 complexity map and this step's tests prove a coherent policy
boundary. Otherwise keep the tested orchestration in `player-development.ts`.

## What NOT To Implement

- No new training, coaching, facilities, personality, injury, or playing-time
  system.
- No youth promotion/release decision change.
- No age-curve or development-rate tuning without isolated evidence.
- No report-only workaround for a model failure.
- No unused extracted policy file.

## Required Checks

```bash
nvm use 24
pnpm exec vitest run packages/engine/src/career/player-development.test.ts packages/engine/src/career/player-season-rollover.test.ts
pnpm --filter @game/engine run typecheck
pnpm --filter @game/cli run typecheck
pnpm cli career --save=phase74-development-world-a --seed=world-a --new-world-preview
pnpm cli career --save=phase74-development-world-a --development-report
pnpm depcruise
git diff --check
graphify update .
```

## Cleanup Boundary

Delete the duplicated ability path list, role classifications, caps, and
read/write/average helpers only after deterministic development tests pass. If
no coherent policy extraction is justified, do not create the optional policy
module merely to shorten the orchestrator.

## Completion Criteria

- Development consumes canonical ability and role contracts.
- Deterministic growth/decline and all invariant tests pass.
- Existing development behavior is preserved except for documented invariant
  corrections.
- No duplicated role/ability truth remains in development.
- Step 08 is the single next action.
