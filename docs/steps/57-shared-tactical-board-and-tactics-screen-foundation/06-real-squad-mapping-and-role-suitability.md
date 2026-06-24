# 06 - Real Squad Mapping And Role Suitability

## Goal

Replace reference/sample squad assumptions with current game data and make
`suitFor(player, role)` meaningful with the information available today.

## Expected Files

- `apps/web/src/features/tactics-board/tactical-board-squad.ts`
- `apps/web/src/features/tactics-board/tactical-board-squad.test.ts`
- `apps/web/src/features/tactics-board/tactical-board-suitability.ts`
- `apps/web/src/features/tactics-board/tactical-board-suitability.test.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.ts`
- `apps/web/src/features/match-preparation/match-preparation-demo.test.ts`
- `apps/web/src/shared/lib/player-position-ordering.ts`
- `apps/web/src/shared/lib/player-position-ordering.test.ts`
- `docs/PROJECT_STATUS.md`

## What To Implement

- Define the board's `SquadPlayer` adapter from current demo/game player facts.
- Include only fields the board needs:
  - id;
  - number;
  - surname;
  - form/condition indicator derived from current available data;
  - primary canonical role;
  - alternative/valid roles when available;
  - current ability or equivalent quality signal when available;
  - current abilities/familiarity only if already present in current data.
- Do not use `SAMPLE_SQUAD` at runtime.
- Keep `suitFor(player, role)` as a derived function with the same conceptual
  signature.
- Return the game's suitability levels, not the reference feature's separate
  role model.
- Use the best available current game data:
  - natural/adapted/weak role familiarity when present;
  - current ability/role scoring when present;
  - existing Phase 56 suitability/order helpers where useful.
- Ensure suitability border changes when a player is moved to a less suitable
  role.
- Ensure empty-slot candidate lists show suitability relative to that slot role.

## What NOT To Implement

- Do not add new player attributes.
- Do not expose hidden true attributes directly in the UI.
- Do not create market/squad-needs advice.
- Do not change player generation.
- Do not change engine match calculations.

## Required Checks

```sh
nvm use 24
pnpm --filter @game/web run typecheck
pnpm exec vitest run apps/web/src/features/tactics-board/tactical-board-squad.test.ts apps/web/src/features/tactics-board/tactical-board-suitability.test.ts apps/web/src/features/match-preparation/match-preparation-demo.test.ts apps/web/src/shared/lib/player-position-ordering.test.ts
pnpm check
git diff --check
```

## Definition Of Done

- Board squad data comes from current game/demo facts.
- No sample squad is used by the app.
- Suitability is deterministic and derived.
- Suitability uses current available role/quality information.
- Candidate lists and token borders agree on the same suitability result.
