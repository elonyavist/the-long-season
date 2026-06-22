# Step 02 - Youth Academy Domain Contracts

## Goal

Add durable, language-agnostic contracts for youth rosters and youth player lifecycle state.

## Context

Youth players should be real career-world entities, but they must not be mixed silently into senior squads. The game needs to know whether a player belongs to the first team or youth academy before promotion, release, or long-run reports can be credible.

## Expected files

- `packages/domain/src/`
- `packages/domain/src/**/*.test.ts`
- `packages/storage/src/`
- `packages/storage/src/**/*.test.ts`
- `docs/PROJECT_STATUS.md`

## Implementation checklist

- Define a durable way to represent youth-roster membership per club.
- Keep player IDs and player entities compatible with existing `Player` contracts.
- Add lifecycle state needed by later steps, for example youth status, academy entry season/date, and optional promoted/released markers if needed.
- Preserve explicit ordered ID arrays for simulation order.
- Add validation that youth rosters only reference existing players and clubs.
- Keep contracts language-agnostic and presentation-free.
- Add storage migration or backwards-compatible default behavior for saves without youth data.
- Add tests for validation, old-save compatibility, and deterministic ordering.

## What NOT to implement

- Do not generate youth players.
- Do not simulate youth development.
- Do not promote players.
- Do not add UI, scouting, staff, facilities, contracts, or youth competitions.

## Required checks

- `pnpm --filter @game/domain run typecheck`
- `pnpm --filter @game/storage run typecheck`
- focused domain/storage tests
- `pnpm check`

## Definition of Done

- Career state can persist youth rosters without breaking existing saves.
- Youth rosters are separate from first-team rosters.
- Domain validation prevents invalid youth references.
