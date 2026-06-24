# 04 - Position Suitability And Selection Ordering

## Goal

Move suitability and player-option ordering onto canonical roles while still
respecting slot side/channel for selection quality.

## Expected Files

- `packages/domain/src/tactics/position-suitability.ts`
- `packages/domain/src/tactics/position-suitability.test.ts`
- `apps/web/src/shared/lib/player-position-ordering.ts`
- `apps/web/src/shared/lib/player-position-ordering.test.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Ensure suitability compares player canonical role to formation slot canonical
  role first.
- Use side/channel only as a secondary fit signal when useful.
- Keep manager agency: ordering helps selects and explicit helper buttons, but
  it does not change the lineup without a manager-triggered action.
- Expose deterministic player fit scoring that combines player strength/current
  ability with role suitability.
- Ensure a high-quality adapted player can rank above a mediocre natural-fit
  player when the adapted role is valid for that player.
- Ensure web player-option ordering handles the 12 canonical roles and no fake
  role keys.
- Preserve deterministic final tie-breakers.

## What NOT To Implement

- Do not add squad-needs advice.
- Do not recommend market actions.
- Do not add hidden or automatic XI/bench changes.
- Do not change visible player attributes.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/domain run typecheck
pnpm --filter @game/web run typecheck
pnpm exec vitest run packages/domain/src/tactics/position-suitability.test.ts apps/web/src/shared/lib/player-position-ordering.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Natural role matches sort before adapted and weak options.
- Side/channel improves ordering without becoming a role.
- Player strength/current ability can outweigh natural-role status when the
  adapted fit is valid and the natural-fit alternative is clearly weaker.
- Goalkeepers never sort as useful outfield players.
- Tests cover center-back pairs, midfield pairs, wide midfielders, wingers, and
  strikers.
