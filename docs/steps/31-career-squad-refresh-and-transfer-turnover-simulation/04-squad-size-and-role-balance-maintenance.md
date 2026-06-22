# Step 04 - Squad Size And Role Balance Maintenance

## Goal

Keep every club squad playable after exits and intake.

## Context

The world must not produce clubs with no goalkeeper, too few players, or impossible positional coverage. This step maintains squad structure without choosing the user's lineup or tactic.

## Expected files

- `packages/engine/src/career/`
- `packages/engine/src/career/*.test.ts`
- `packages/engine/src/index.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define minimum and target squad-size bands.
- Define basic department/role coverage requirements.
- Apply intake players to clubs that need depth.
- Keep player and club ordered IDs stable.
- Report factual squad-balance records.
- Add tests for goalkeeper coverage, minimum squad size, and deterministic ordering.

## What NOT to implement

- Do not auto-select starting lineups.
- Do not recommend transfers to the user.
- Do not force every club into the same formation profile.
- Do not create perfect squad balance; preserve believable imperfection.

## Required checks

- `pnpm --filter @game/engine run typecheck`
- focused squad-refresh tests
- `pnpm check`

## Definition of Done

- No refreshed club falls below minimum viable squad shape in tests.
- Goalkeeper and broad department coverage are enforced.
- The system reports what it changed.

