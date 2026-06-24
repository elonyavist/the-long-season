# 03 - Domain Formation Catalog Rewrite

## Goal

Rewrite the domain formation catalog so each slot uses a canonical player role
plus side/channel metadata.

## Expected Files

- `packages/domain/src/tactics/formations.ts`
- `packages/domain/src/tactics/formations.test.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Replace any role-like slot semantics with:
  - canonical player role;
  - tactical line;
  - side/channel;
  - stable slot key.
- Keep formation keys stable unless a current key is explicitly invalid.
- Ensure the user-agreed rules hold:
  - one striker = one `striker`;
  - two strikers = two `striker` slots;
  - front three = `left_winger`, `striker`, `right_winger`;
  - defensive midfielders sit between defense and central midfield;
  - side/channel is metadata, not role.
- Keep `3-6-1` as:
  - `goalkeeper`;
  - three `center_back`;
  - one `defensive_midfielder`;
  - `left_midfielder`, two `central_midfielder`, `right_midfielder`;
  - one `attacking_midfielder`;
  - one `striker`.

## What NOT To Implement

- Do not change engine strength formulas.
- Do not change player generation.
- Do not add more formations unless needed to preserve an existing supported
  key.
- Do not introduce UI labels in domain.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/domain run typecheck
pnpm exec vitest run packages/domain/src/tactics/formations.test.ts packages/domain/src/tactics/player-roles.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Every formation has 11 slots and one goalkeeper.
- Every slot role is one of the 12 canonical roles.
- Tests prove no formation slot uses side-specific fake roles.
- Tests prove two-forward and three-forward semantics are correct.
