# 02 - Canonical Role Contract

## Goal

Add the canonical player-role contract to the domain layer.

## Expected Files

- `packages/domain/src/tactics/player-roles.ts`
- `packages/domain/src/tactics/player-roles.test.ts`
- `packages/domain/src/tactics/index.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Add a dependency-free domain contract for the 12 canonical roles:
  - `goalkeeper`
  - `right_full_back`
  - `center_back`
  - `left_full_back`
  - `defensive_midfielder`
  - `central_midfielder`
  - `right_midfielder`
  - `left_midfielder`
  - `attacking_midfielder`
  - `right_winger`
  - `left_winger`
  - `striker`
- Add helpers only if they remove real duplication:
  - role narrowing;
  - role department mapping;
  - deterministic role order.
- Document in code comments that side/channel is not part of the player role.
- Export the contract from `packages/domain/src/tactics/index.ts`.

## What NOT To Implement

- Do not rewrite formation catalog in this step.
- Do not update web UI in this step.
- Do not add role variants such as ball-winning midfielder, target man, or
  wing-back.
- Do not add side-specific roles such as right center back.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/domain run typecheck
pnpm exec vitest run packages/domain/src/tactics/player-roles.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- The domain exposes exactly 12 canonical player roles.
- Tests fail if fake side-specific roles are added.
- No app, UI, i18n, content, or engine package is imported by domain.
